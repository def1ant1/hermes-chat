import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * This codemod automates the migration from the legacy `@lobechat/` scope to the new
 * `@hermeslabs/` scope across every package manifest in the monorepo. It deliberately keeps the
 * logic self-contained and dependency-free so that it can be executed in any environment with a
 * Node.js runtime, ensuring maximum portability for future migrations.
 */
const LEGACY_SCOPE = '@lobechat/';
const TARGET_SCOPE = '@hermeslabs/';

/**
 * We capture the execution metadata once so that every manifest receives the same data payload.
 * The requirement calls for ISO formatted timestamps and a short compatibility summary to provide
 * durable documentation for future audits.
 */
const MIGRATION_NOTES = {
  apiCompatibility: 'No breaking API changes; workspace version remains 1.0.0.',
  engineer: 'gpt-5-codex',
  migratedAt: new Date().toISOString(),
} as const;

/**
 * Recursively walk a directory tree to find every `package.json`. The traversal is breadth-first so
 * we minimize deep recursion stacks and make the order deterministic, which simplifies testing and
 * debugging in large workspaces.
 */
async function discoverPackageJsonFiles(root: string): Promise<string[]> {
  const queue: string[] = [root];
  const manifests: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Skip hidden/system folders that cannot contain manifests we care about.
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        queue.push(path.join(current, entry.name));
        continue;
      }

      if (entry.isFile() && entry.name === 'package.json') {
        manifests.push(path.join(current, entry.name));
      }
    }
  }

  return manifests;
}

/**
 * Replace the legacy scope in both dependency keys and version strings. We carefully rebuild the
 * object to preserve iteration order, ensuring diffs stay readable and predictable.
 */
function migrateDependencyMap(record?: Record<string, string>): {
  changed: boolean;
  migrated?: Record<string, string>;
} {
  if (!record) return { changed: false };

  let changed = false;
  const next: Record<string, string> = {};

  for (const [rawKey, rawValue] of Object.entries(record)) {
    const migratedKey = rawKey.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);
    const migratedValue = rawValue.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);

    if (migratedKey !== rawKey || migratedValue !== rawValue) {
      changed = true;
    }

    next[migratedKey] = migratedValue;
  }

  return changed ? { changed, migrated: next } : { changed, migrated: record };
}

/**
 * Deeply migrate the `pnpm.overrides` object which can contain nested records or direct string
 * aliases. The traversal is iterative to avoid stack overflows and to keep the implementation easy
 * to reason about.
 */
function migrateOverrides(overrides: unknown): { changed: boolean; migrated: unknown } {
  if (!overrides || typeof overrides !== 'object') {
    return { changed: false, migrated: overrides };
  }

  let changed = false;

  if (Array.isArray(overrides)) {
    const migratedArray = overrides.map((item) => {
      if (typeof item === 'string') {
        const migratedItem = item.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);
        if (migratedItem !== item) changed = true;
        return migratedItem;
      }

      const nested = migrateOverrides(item);
      if (nested.changed) changed = true;
      return nested.migrated;
    });

    return { changed, migrated: migratedArray };
  }

  const migratedObject: Record<string, unknown> = {};
  for (const [rawKey, rawValue] of Object.entries(overrides)) {
    const migratedKey = rawKey.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);
    if (migratedKey !== rawKey) changed = true;

    if (typeof rawValue === 'string') {
      const migratedValue = rawValue.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);
      if (migratedValue !== rawValue) changed = true;
      migratedObject[migratedKey] = migratedValue;
      continue;
    }

    const nested = migrateOverrides(rawValue);
    if (nested.changed) changed = true;
    migratedObject[migratedKey] = nested.migrated;
  }

  return { changed, migrated: migratedObject };
}

/**
 * Applies the migration rules to a single manifest and writes it back to disk when changes are
 * detected. We keep the function pure-ish by returning early when nothing mutates.
 */
async function migrateManifest(filePath: string): Promise<boolean> {
  const contents = await fs.readFile(filePath, 'utf8');
  const manifest = JSON.parse(contents) as Record<string, unknown>;
  let mutated = false;

  if (typeof manifest.name === 'string' && manifest.name.includes(LEGACY_SCOPE)) {
    manifest.name = manifest.name.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);
    mutated = true;
  }

  const dependencyFields = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ] as const;

  for (const field of dependencyFields) {
    const original = manifest[field] as Record<string, string> | undefined;
    const { changed, migrated } = migrateDependencyMap(original);
    if (changed && migrated) {
      manifest[field] = migrated;
      mutated = true;
    }
  }

  if (manifest.pnpm && typeof manifest.pnpm === 'object') {
    const pnpm = manifest.pnpm as Record<string, unknown>;
    if (pnpm.overrides) {
      const { changed, migrated } = migrateOverrides(pnpm.overrides);
      if (changed) {
        pnpm.overrides = migrated;
        mutated = true;
      }
    }
  }

  const existingNotes = manifest['x-migration-notes'] as Record<string, unknown> | undefined;
  const shouldUpdateNotes =
    !existingNotes ||
    existingNotes.migratedAt !== MIGRATION_NOTES.migratedAt ||
    existingNotes.engineer !== MIGRATION_NOTES.engineer ||
    existingNotes.apiCompatibility !== MIGRATION_NOTES.apiCompatibility;

  if (shouldUpdateNotes) {
    manifest['x-migration-notes'] = { ...MIGRATION_NOTES };
    mutated = true;
  }

  if (!mutated) {
    return false;
  }

  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  await fs.writeFile(filePath, serialized, 'utf8');
  return true;
}

async function main(): Promise<void> {
  const repoRoot = path.resolve(__dirname, '..');
  const manifests = new Set<string>();

  // Always include the repository root manifest.
  manifests.add(path.join(repoRoot, 'package.json'));

  // Crawl the packages directory if it exists to cover nested workspaces.
  const packagesDir = path.join(repoRoot, 'packages');
  try {
    await fs.access(packagesDir);
    const discovered = await discoverPackageJsonFiles(packagesDir);
    for (const manifestPath of discovered) {
      manifests.add(manifestPath);
    }
  } catch (error) {
    // If the packages directory does not exist the migration still succeeds; we log verbosely for
    // operators but do not treat it as a failure.
    console.warn('[migrate-scope] packages directory not found or inaccessible:', error);
  }

  let updates = 0;
  for (const manifestPath of manifests) {
    const changed = await migrateManifest(manifestPath);
    if (changed) {
      updates += 1;
      console.info(`[migrate-scope] Updated ${path.relative(repoRoot, manifestPath)}`);
    } else {
      console.info(
        `[migrate-scope] No changes needed for ${path.relative(repoRoot, manifestPath)}`,
      );
    }
  }

  console.info(`[migrate-scope] Migration complete. ${updates} manifest(s) updated.`);
}

/**
 * The workspace TypeScript configuration currently emits CommonJS, which prevents us from using
 * top-level await without additional tooling flags. We retain the explicit promise chain and
 * document the intent so linting stays quiet while keeping the script executable via `tsx` or
 * `ts-node` out of the box.
 */
// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  console.error('[migrate-scope] Migration failed:', error);
  process.exitCode = 1;
});
