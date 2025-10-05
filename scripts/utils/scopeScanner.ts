import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Shared constants that describe the brand scope migration. Keeping them in a dedicated module ensures
 * that every script (manifest generation, codemods, CI checks, etc.) references a single source of truth.
 * This dramatically reduces the chance of skew between automation steps and keeps future migrations
 * trivial—change the constants here and every consumer will inherit the update.
 */
export const LEGACY_SCOPE = '@hermeslabs/';
export const TARGET_SCOPE = '@hermeslabs/';

/**
 * The directories that product engineering has agreed to scan for scoped packages. By narrowing the search
 * to these roots we avoid wasting compute on large artefact folders (e.g. `.next` or `dist`) while still
 * covering every code-path that ships to production or influences tests.
 */
export const DEFAULT_SCAN_DIRECTORIES = ['src', 'packages', 'apps', 'tests'] as const;

/**
 * File extensions that should be parsed with TypeScript-aware tooling. We intentionally include `.mts` and
 * `.cts` so ESM/CJS hybrid configs receive the same treatment as standard `.ts` and `.tsx` sources.
 */
const TS_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts']);

/**
 * The manifest classification is used by downstream scripts and tests to make decisions about which parser
 * to invoke. Treating MDX and configuration files explicitly gives us room to add specialised processors
 * in the future (for example, remark for MDX or JSON schema validation for configs) without rewriting
 * the discovery layer.
 */
export type ScopeMatchCategory = 'typescript' | 'mdx' | 'config';

export interface ScopeMatch {
  /** Absolute path to the file so downstream tooling can open it directly. */
  absolutePath: string;
  /** Lightweight classification used to select the right transformation strategy. */
  category: ScopeMatchCategory;
  /** Repository relative path to make logs deterministic and human friendly. */
  relativePath: string;
}

export interface DiscoverScopeMatchesOptions {
  /**
   * Optional additional directories to scan. This enables future teams to extend the coverage (e.g.,
   * `playwright/` or `integration/`) without modifying the helper itself.
   */
  include?: string[];
  /** Optional override for the manifest output path. */
  manifestPath?: string;
  /** Repository root where the ripgrep command should execute. */
  root: string;
}

/**
 * ripgrep returns exit code 1 when no matches are found. This helper normalises the behaviour so calling
 * code can treat "no matches" as an empty list instead of needing bespoke error handling.
 */
function normaliseRipgrepError(error: unknown): string {
  if (!error || typeof error !== 'object') return '';

  const execError = error as { stdout?: string };
  return execError.stdout ?? '';
}

/**
 * Lightweight helper that determines which parser we should use. Any `.mdx` file is flagged as MDX, any
 * TypeScript extension (including `.d.ts`) is treated as TypeScript, and everything else gets the
 * "config" classification. The heuristics are intentionally simple so that new file types can be added in
 * seconds without introducing heavy dependencies.
 */
function classifyFile(filePath: string): ScopeMatchCategory {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.mdx') return 'mdx';
  if (TS_EXTENSIONS.has(ext) || filePath.endsWith('.d.ts')) return 'typescript';
  return 'config';
}

/**
 * Discover every file that still references the legacy scope. The implementation leans on ripgrep because
 * it is dramatically faster than a pure JavaScript directory walk and is already part of our developer
 * toolbox. The function returns structured metadata so that consumers can take action immediately without
 * repeating any path logic.
 */
export async function discoverScopeMatches({
  root,
  manifestPath,
  include,
}: DiscoverScopeMatchesOptions): Promise<ScopeMatch[]> {
  const searchRoots = [...DEFAULT_SCAN_DIRECTORIES, ...(include ?? [])];
  const args = [
    '--files-with-matches',
    '--iglob',
    '*.ts',
    '--iglob',
    '*.tsx',
    '--iglob',
    '*.mts',
    '--iglob',
    '*.cts',
    '--iglob',
    '*.mdx',
    '--iglob',
    '*config.*',
    '--iglob',
    '*.json',
    '--iglob',
    '*.mjs',
    '--iglob',
    '*.cjs',
    LEGACY_SCOPE,
    ...searchRoots,
  ];

  let stdout: string;
  try {
    const result = await execFileAsync('rg', args, { cwd: root });
    stdout = result.stdout;
  } catch (error) {
    // ripgrep exits with code 1 when nothing matches; treat this as zero results.
    stdout = normaliseRipgrepError(error);
  }

  const absoluteRoot = path.resolve(root);
  const unique = new Set<string>();
  const matches: ScopeMatch[] = [];

  for (const rawLine of stdout.split('\n')) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const absolutePath = path.join(absoluteRoot, trimmed);
    if (unique.has(absolutePath)) continue;
    unique.add(absolutePath);

    const category = classifyFile(absolutePath);
    matches.push({
      absolutePath,
      category,
      relativePath: trimmed.replaceAll('\\', '/'),
    });
  }

  matches.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  if (manifestPath) {
    const resolvedManifestPath = path.isAbsolute(manifestPath)
      ? manifestPath
      : path.join(absoluteRoot, manifestPath);
    await mkdir(path.dirname(resolvedManifestPath), { recursive: true });
    await writeFile(
      resolvedManifestPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          legacyScope: LEGACY_SCOPE,
          matches,
          targetScope: TARGET_SCOPE,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  }

  return matches;
}
