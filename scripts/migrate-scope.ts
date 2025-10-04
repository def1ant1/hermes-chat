import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';

/**
 * Namespace constant describing the legacy npm scope we are retiring. Using a
 * dedicated constant (instead of scattering string literals) keeps the script
 * declarative and trivial to update if we run a follow-up migration.
 */
const LEGACY_SCOPE = '@lobechat/';

/**
 * Namespace constant for the new npm scope that every manifest should adopt.
 * The script only targets this scoped prefix; other package names remain
 * untouched.
 */
const TARGET_SCOPE = '@hermeslabs/';

/**
 * CLI flag definitions ensure the migration stays repeatable. Operators can
 * supply dry-run semantics or override metadata (engineer name, migration
 * notes, etc.) without editing source.
 */
const {
  values: { compat, date, engineer, root, 'dry-run': dryRun },
} = parseArgs({
  options: {
    compat: {
      type: 'string',
      description:
        'Override the API compatibility guidance inserted into x-migration-notes.',
    },
    date: {
      type: 'string',
      description:
        'Optional ISO8601 timestamp to record. Defaults to the execution time.',
    },
    engineer: {
      type: 'string',
      description:
        'Name or handle of the engineer executing the migration (stored in x-migration-notes).',
    },
    root: {
      type: 'string',
      description: 'Repository root (defaults to current working directory).',
    },
    'dry-run': {
      type: 'boolean',
      default: false,
      description: 'Perform all transformations in-memory without writing to disk.',
    },
  },
});

/**
 * Resolve the working directory eagerly so relative globs remain deterministic
 * even when the script is invoked from other directories (CI, npm scripts,
 * custom wrappers, etc.).
 */
const workspaceRoot = resolve(process.cwd(), root ?? '.');

/**
 * In pre-production change logs we attribute migrations to the executing
 * engineer. We attempt to infer a default from common environment variables so
 * local developers get attribution without additional flags.
 */
const migrationEngineer =
  engineer ?? process.env.MIGRATION_ENGINEER ?? process.env.GIT_AUTHOR_NAME ?? 'gpt-5-codex';

/**
 * Timestamp recorded inside each manifest. Defaults to the execution time but
 * remains configurable for reproducible dry-runs.
 */
const migrationTimestamp = date ?? new Date().toISOString();

/**
 * Compatibility guidance surfaces the operational contract for downstream
 * consumers. The default statement asserts that the package surface remains
 * stable; callers can override if the migration ever becomes breaking.
 */
const compatibilityNotes =
  compat ?? 'No breaking API changes; workspace version remains 1.0.0.';

/**
 * Utility guard to determine whether an arbitrary value is a plain object. We
 * intentionally exclude arrays so we can handle them separately.
 */
const isPlainObject = (candidate: unknown): candidate is Record<string, unknown> =>
  typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);

/**
 * Lightweight logger facade so the codemod emits structured, emoji-prefixed
 * progress updates without pulling in third-party dependencies.
 */
const log = {
  debug: (message: string) => {
    if (process.env.DEBUG) {
      console.debug(`🔍  ${message}`);
    }
  },
  error: (message: string, error?: unknown) => {
    console.error(`❌  ${message}`);
    if (error) {
      console.error(error);
    }
  },
  info: (message: string) => console.log(`ℹ️  ${message}`),
  start: (message: string) => console.log(`🚀  ${message}`),
  success: (message: string) => console.log(`✅  ${message}`),
  warn: (message: string) => console.warn(`⚠️  ${message}`),
};

/**
 * Replaces the legacy scope inside dependency maps (`dependencies`,
 * `devDependencies`, `peerDependencies`). The function preserves insertion
 * order and gracefully handles collisions where the new scope already exists.
 */
const migrateDependencyBlock = (
  manifestPath: string,
  blockName: string,
  block: Record<string, string> | undefined,
): { changed: boolean; next: Record<string, string> | undefined } => {
  if (!block) return { changed: false, next: block };

  let mutated = false;
  const nextEntries = new Map<string, string>();

  for (const [rawKey, rawValue] of Object.entries(block)) {
    const nextKey = rawKey.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);
    const nextValue = rawValue.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);

    if (nextKey !== rawKey || nextValue !== rawValue) {
      mutated = true;
    }

    if (nextEntries.has(nextKey) && nextKey !== rawKey) {
      log.warn(
        `Manifest ${manifestPath} (${blockName}) already defines ${nextKey}; dropping legacy entry ${rawKey}.`,
      );
      mutated = true;
      continue;
    }

    nextEntries.set(nextKey, nextValue);
  }

  if (!mutated) {
    return { changed: false, next: block };
  }

  return {
    changed: true,
    next: Object.fromEntries(nextEntries.entries()),
  };
};

/**
 * Deeply migrates the `pnpm.overrides` structure. Overrides can be nested or
 * contain arrays, so we recursively walk the structure while preserving
 * original shape. Keys and string values receive the scope rewrite.
 */
const migrateOverrides = (
  manifestPath: string,
  overrides: unknown,
): { changed: boolean; next: unknown } => {
  if (typeof overrides === 'string') {
    const nextValue = overrides.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);
    return { changed: nextValue !== overrides, next: nextValue };
  }

  if (Array.isArray(overrides)) {
    let mutated = false;
    const nextArray = overrides.map((item) => {
      const { changed, next } = migrateOverrides(manifestPath, item);
      mutated = mutated || changed;
      return next;
    });
    return { changed: mutated, next: nextArray };
  }

  if (isPlainObject(overrides)) {
    let mutated = false;
    const nextEntries = new Map<string, unknown>();

    for (const [rawKey, rawValue] of Object.entries(overrides)) {
      const nextKey = rawKey.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);
      const { changed, next } = migrateOverrides(manifestPath, rawValue);
      mutated = mutated || changed || nextKey !== rawKey;

      if (nextEntries.has(nextKey) && nextKey !== rawKey) {
        log.warn(
          `Manifest ${manifestPath} (pnpm.overrides) already declares ${nextKey}; dropping legacy override ${rawKey}.`,
        );
        mutated = true;
        continue;
      }

      nextEntries.set(nextKey, next);
    }

    if (!mutated) {
      return { changed: false, next: overrides };
    }

    return { changed: true, next: Object.fromEntries(nextEntries.entries()) };
  }

  return { changed: false, next: overrides };
};

/**
 * Formats the migration notes payload stored in `x-migration-notes`. Keeping
 * this logic centralized ensures we emit consistent metadata everywhere.
 */
const buildMigrationNotes = () => ({
  executedAt: migrationTimestamp,
  executedBy: migrationEngineer,
  apiCompatibility: compatibilityNotes,
});

const SKIP_DIRECTORIES = new Set(['node_modules', 'dist', 'build', '.git']);

const collectManifestPaths = async (): Promise<string[]> => {
  const manifestPaths = new Set<string>();
  manifestPaths.add(resolve(workspaceRoot, 'package.json'));

  const packagesRoot = resolve(workspaceRoot, 'packages');
  const queue: string[] = [packagesRoot];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current) continue;

    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch (error) {
      log.debug(`Skipping ${current}: ${(error as Error).message}`);
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      if (SKIP_DIRECTORIES.has(entry.name) || entry.name.startsWith('.')) {
        continue;
      }

      const absoluteDir = join(current, entry.name);
      const manifestCandidate = join(absoluteDir, 'package.json');

      try {
        const stats = await stat(manifestCandidate);
        if (stats.isFile()) {
          manifestPaths.add(manifestCandidate);
        }
      } catch {
        // Not a package boundary; continue exploring nested directories.
      }

      queue.push(absoluteDir);
    }
  }

  return Array.from(manifestPaths);
};

/**
 * Primary execution entrypoint. We collect every package.json (root + nested
 * workspaces) and apply the scope migration + metadata injection.
 */
const main = async () => {
  log.start('Scanning for package manifests...');

  const manifestPaths = await collectManifestPaths();

  manifestPaths.sort();

  if (manifestPaths.length === 0) {
    log.warn('No package.json files discovered; exiting early.');
    return;
  }

  log.info(`Discovered ${manifestPaths.length} manifest(s). Beginning migration...`);

  let updatedCount = 0;

  for (const manifestPath of manifestPaths) {
    const raw = await readFile(manifestPath, 'utf8');
    const json = JSON.parse(raw) as Record<string, unknown>;
    let mutated = false;

    if (typeof json.name === 'string' && json.name.includes(LEGACY_SCOPE)) {
      json.name = json.name.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);
      mutated = true;
    }

    const dependenciesBlocks = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
    ] as const;

    for (const blockName of dependenciesBlocks) {
      const currentBlock = json[blockName];
      if (!currentBlock || typeof currentBlock !== 'object') continue;

      const { changed, next } = migrateDependencyBlock(
        manifestPath,
        blockName,
        currentBlock as Record<string, string>,
      );

      if (changed) {
        json[blockName] = next;
        mutated = true;
      }
    }

    if (isPlainObject(json.pnpm) && 'overrides' in json.pnpm) {
      const { changed, next } = migrateOverrides(manifestPath, json.pnpm.overrides);
      if (changed) {
        (json.pnpm as Record<string, unknown>).overrides = next;
        mutated = true;
      }
    }

    const nextMigrationNotes = buildMigrationNotes();
    const previousNotes = json['x-migration-notes'];
    if (JSON.stringify(previousNotes) !== JSON.stringify(nextMigrationNotes)) {
      json['x-migration-notes'] = nextMigrationNotes;
      mutated = true;
    }

    if (!mutated) {
      log.debug(`No changes required for ${manifestPath}.`);
      continue;
    }

    updatedCount += 1;

    if (dryRun) {
      log.info(`[dry-run] Would update ${manifestPath}.`);
      continue;
    }

    const serialized = `${JSON.stringify(json, null, 2)}\n`;
    await writeFile(manifestPath, serialized, 'utf8');
    log.success(`Updated ${manifestPath}.`);
  }

  if (dryRun) {
    log.info(`Dry-run complete. ${updatedCount} manifest(s) would be updated.`);
  } else {
    log.success(`Migration complete. Updated ${updatedCount} manifest(s).`);
  }
};

main().catch((error) => {
  log.error('Scope migration failed.', error);
  process.exitCode = 1;
});
