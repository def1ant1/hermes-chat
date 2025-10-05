import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';
import { Node, Project, SyntaxKind } from 'ts-morph';

import {
  LEGACY_SCOPE,
  type ScopeMatch,
  TARGET_SCOPE,
  discoverScopeMatches,
} from '../utils/scopeScanner';

/* eslint-disable unicorn/prefer-top-level-await -- tsx compiles this helper as CJS, so we keep an async entrypoint instead of top-level await. */

interface CodemodOptions {
  /** Additional directories to scan beyond the defaults. */
  include?: string[];
  /** Optional manifest output path, relative to the root by default. */
  manifestPath?: string;
  /** Absolute path to the workspace root where code lives. */
  root: string;
  /** When true the codemod writes changes to disk, otherwise it operates as a dry-run. */
  write: boolean;
}

interface MigrationSummary {
  actions: string[];
  file: string;
}

/**
 * Utility to parse CLI arguments in a strongly-typed way so the script is self-documenting. Using the
 * built-in `parseArgs` avoids another third-party dependency and keeps the codemod portable.
 */
function getOptions(): CodemodOptions {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      include: { multiple: true, type: 'string' },
      manifest: { type: 'string' },
      root: { type: 'string' },
      write: { default: false, type: 'boolean' },
    },
  });

  const root = values.root ? path.resolve(values.root) : process.cwd();
  const include = values.include as string[] | undefined;

  return {
    include,
    manifestPath: values.manifest,
    root,
    write: Boolean(values.write),
  };
}

/**
 * Creates a single ts-morph project that will host every source file we touch. Keeping the project scoped to
 * the affected files keeps memory usage predictable and dramatically improves performance on large monorepos.
 */
function createProject(): Project {
  return new Project({
    compilerOptions: {
      allowJs: true,
      allowSyntheticDefaultImports: true,
      resolveJsonModule: true,
    },
    skipAddingFilesFromTsConfig: true,
  });
}

/**
 * Replace a module specifier if it targets the legacy scope. We return a boolean so callers can record the
 * mutation and produce deterministic logs for auditors.
 */
function rewriteModuleSpecifier(rawSpecifier: string): { changed: boolean; next: string } {
  if (!rawSpecifier.includes(LEGACY_SCOPE)) return { changed: false, next: rawSpecifier };
  return {
    changed: true,
    next: rawSpecifier.replaceAll(LEGACY_SCOPE, TARGET_SCOPE),
  };
}

/**
 * Applies transformations to TypeScript/TSX source files using ts-morph. The function is intentionally
 * synchronous to keep the callsite simple—ts-morph batches writes when `save` is invoked.
 */
function migrateTypescriptFile(
  project: Project,
  match: ScopeMatch,
  summary: MigrationSummary,
): { mutated: boolean; originalText: string } {
  const sourceFile = project.addSourceFileAtPath(match.absolutePath);
  const originalText = sourceFile.getFullText();
  let mutated = false;

  for (const importDecl of sourceFile.getImportDeclarations()) {
    const current = importDecl.getModuleSpecifierValue();
    const { changed, next } = rewriteModuleSpecifier(current);
    if (!changed) continue;
    importDecl.setModuleSpecifier(next);
    summary.actions.push(`import -> ${next}`);
    mutated = true;
  }

  for (const exportDecl of sourceFile.getExportDeclarations()) {
    const specifier = exportDecl.getModuleSpecifierValue();
    if (!specifier) continue;
    const { changed, next } = rewriteModuleSpecifier(specifier);
    if (!changed) continue;
    exportDecl.setModuleSpecifier(next);
    summary.actions.push(`export -> ${next}`);
    mutated = true;
  }

  sourceFile.forEachDescendant((node) => {
    if (!Node.isCallExpression(node)) return;

    // Dynamic import("module").
    if (node.getExpression().getKind() === SyntaxKind.ImportKeyword) {
      const [firstArg] = node.getArguments();
      if (!firstArg || !Node.isStringLiteral(firstArg)) return;
      const literalValue = firstArg.getLiteralText();
      const { changed, next } = rewriteModuleSpecifier(literalValue);
      if (!changed) return;
      firstArg.setLiteralValue(next);
      summary.actions.push(`dynamic import -> ${next}`);
      mutated = true;
      return;
    }

    // vi.mock(...) or jest.mock(...).
    const expression = node.getExpression();
    if (Node.isPropertyAccessExpression(expression) && expression.getName() === 'mock') {
      const owner = expression.getExpression().getText();
      if (owner !== 'vi' && owner !== 'jest') return;
      const [firstArg] = node.getArguments();
      if (!firstArg || !Node.isStringLiteral(firstArg)) return;
      const literalValue = firstArg.getLiteralText();
      const { changed, next } = rewriteModuleSpecifier(literalValue);
      if (!changed) return;
      firstArg.setLiteralValue(next);
      summary.actions.push(`${owner}.mock -> ${next}`);
      mutated = true;
    }
  });

  return { mutated, originalText };
}

/**
 * Performs a lightweight text replacement for configuration and markdown files. This keeps the behaviour
 * predictable without needing additional parsers, while still logging the change for transparency.
 */
async function migrateTextFile(
  match: ScopeMatch,
  summary: MigrationSummary,
  write: boolean,
): Promise<boolean> {
  const contents = await readFile(match.absolutePath, 'utf8');
  if (!contents.includes(LEGACY_SCOPE)) return false;
  const next = contents.replaceAll(LEGACY_SCOPE, TARGET_SCOPE);
  if (next === contents) return false;
  summary.actions.push('text replace');
  if (write) {
    await writeFile(match.absolutePath, next, 'utf8');
  }
  return true;
}

async function runCodemod(options: CodemodOptions): Promise<void> {
  const { root, write, manifestPath, include } = options;
  const matches = await discoverScopeMatches({ include, manifestPath, root });

  if (matches.length === 0) {
    console.log('No files require scope migration—brand imports are already up to date.');
    return;
  }

  const project = createProject();
  const summaries: MigrationSummary[] = [];
  let mutatedFiles = 0;

  for (const match of matches) {
    const summary: MigrationSummary = { actions: [], file: match.relativePath };
    let mutated = false;

    if (match.category === 'typescript') {
      const result = migrateTypescriptFile(project, match, summary);
      mutated = result.mutated;

      if (mutated && !write) {
        project.getSourceFile(match.absolutePath)?.replaceWithText(result.originalText);
      }
    } else {
      // For config and MDX files we currently rely on a targeted string replacement strategy.
      mutated = await migrateTextFile(match, summary, write);
    }

    if (!mutated) continue;

    mutatedFiles += 1;
    summaries.push(summary);

    if (write && match.category === 'typescript') {
      await project.getSourceFileOrThrow(match.absolutePath).save();
    }
  }

  if (!write) {
    console.log(
      `Dry run complete. ${mutatedFiles} files would be migrated to the ${TARGET_SCOPE} scope. Set --write to persist the scope migration.`,
    );
  } else {
    console.log(`Successfully migrated ${mutatedFiles} files to the ${TARGET_SCOPE} scope.`);
  }

  for (const summary of summaries) {
    console.log(` - ${summary.file}`);
    for (const action of summary.actions) {
      console.log(`    • ${action}`);
    }
  }
}

async function main(): Promise<void> {
  const options = getOptions();
  await runCodemod(options);
}

main().catch((error) => {
  console.error('Scope migration codemod failed', error);
  process.exitCode = 1;
});
