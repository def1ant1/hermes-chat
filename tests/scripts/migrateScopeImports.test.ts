import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import { LEGACY_SCOPE, TARGET_SCOPE } from '../../scripts/utils/scopeScanner';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../');

interface ScriptResult {
  stdout: string;
  stderr: string;
  status: number | null;
}

function runScript(args: string[], cwd: string = repoRoot): Promise<ScriptResult> {
  return new Promise((resolveRun) => {
    const child = spawn('bunx', ['tsx', ...args], {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (status) => {
      resolveRun({ stdout, stderr, status });
    });
  });
}

describe('scope migration automation', () => {
  test('codemod rewrites TypeScript imports, exports, dynamics, and mocks', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'scope-codemod-'));
    const manifestPath = join(workspace, 'manifest.json');

    await mkdir(join(workspace, 'src'), { recursive: true });
    await mkdir(join(workspace, 'packages/demo'), { recursive: true });
    await mkdir(join(workspace, 'apps/site'), { recursive: true });
    await mkdir(join(workspace, 'tests/unit'), { recursive: true });

    await writeFile(
      join(workspace, 'src/module.ts'),
      `import defaultExport from '${LEGACY_SCOPE}alpha';\n` +
        `export { beta } from '${LEGACY_SCOPE}beta';\n` +
        `export * from '${LEGACY_SCOPE}gamma';\n` +
        `async function load() {\n` +
        `  return import('${LEGACY_SCOPE}delta');\n` +
        `}\n` +
        `vi.mock('${LEGACY_SCOPE}epsilon');\n` +
        `jest.mock('${LEGACY_SCOPE}zeta');\n` +
        `export default defaultExport;\n`,
      'utf8',
    );

    await writeFile(
      join(workspace, 'packages/demo/tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            paths: {
              [`${LEGACY_SCOPE}demo`]: ['./src/index.ts'],
            },
          },
        },
        null,
        2,
      ),
      'utf8',
    );

    await writeFile(
      join(workspace, 'apps/site/page.mdx'),
      `import { Track } from '${LEGACY_SCOPE}analytics';\n\n<Track />\n`,
      'utf8',
    );

    await writeFile(
      join(workspace, 'tests/unit/sample.test.ts'),
      `vi.mock('${LEGACY_SCOPE}testing');\n`,
      'utf8',
    );

    try {
      const result = await runScript([
        'scripts/codemods/migrateScopeImports.ts',
        '--root',
        workspace,
        '--manifest',
        manifestPath,
        '--write',
      ]);

      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');

      const moduleFile = await readFile(join(workspace, 'src/module.ts'), 'utf8');
      expect(moduleFile).not.toContain(LEGACY_SCOPE);
      expect(moduleFile).toContain(`import defaultExport from '${TARGET_SCOPE}alpha'`);
      expect(moduleFile).toContain(`export { beta } from '${TARGET_SCOPE}beta'`);
      expect(moduleFile).toContain(`export * from '${TARGET_SCOPE}gamma'`);
      expect(moduleFile).toContain(`import('${TARGET_SCOPE}delta')`);
      expect(moduleFile).toContain(`vi.mock('${TARGET_SCOPE}epsilon')`);
      expect(moduleFile).toContain(`jest.mock('${TARGET_SCOPE}zeta')`);

      const configFile = await readFile(join(workspace, 'packages/demo/tsconfig.json'), 'utf8');
      expect(configFile).toContain(`${TARGET_SCOPE}demo`);
      expect(configFile).not.toContain(`${LEGACY_SCOPE}demo`);

      const mdxFile = await readFile(join(workspace, 'apps/site/page.mdx'), 'utf8');
      expect(mdxFile).toContain(`${TARGET_SCOPE}analytics`);
      expect(mdxFile).not.toContain(`${LEGACY_SCOPE}analytics`);

      const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
        matches: Array<{ relativePath: string }>;
        legacyScope: string;
        targetScope: string;
      };
      expect(manifest.legacyScope).toBe(LEGACY_SCOPE);
      expect(manifest.targetScope).toBe(TARGET_SCOPE);
      expect(manifest.matches.length).toBeGreaterThan(0);
      expect(manifest.matches[0].relativePath).toBeDefined();
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  test('manifest script reports no matches once the workspace is clean', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'scope-manifest-'));
    await mkdir(join(workspace, 'src'), { recursive: true });

    await writeFile(
      join(workspace, 'src/clean.ts'),
      `import lib from '@hermeslabs/ready';\nexport default lib;\n`,
      'utf8',
    );

    try {
      const result = await runScript([
        'scripts/buildScopeManifest.ts',
        '--root',
        workspace,
        '--manifest',
        join(workspace, 'manifest.json'),
      ]);

      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');
      expect(result.stdout).toContain(`No files still reference the legacy ${LEGACY_SCOPE} scope`);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });
});
