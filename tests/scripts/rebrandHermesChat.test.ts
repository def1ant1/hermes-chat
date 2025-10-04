import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../');

interface CliExecution {
  readonly stdout: string;
  readonly stderr: string;
  readonly status: number | null;
}

const REQUIRED_ARGS = [
  '--brand-name',
  'Hermes Chat QA',
  '--brand-short-name',
  'Hermes QA',
  '--brand-domain',
  'qa.hermes.chat',
  '--support-email',
  'help@hermes.chat',
  '--support-url',
  'https://qa.hermes.chat/support',
  '--contact-email',
  'hello@hermes.chat',
  '--contact-discord',
  'https://discord.gg/hermeschat',
  '--cdn-domain',
  'cdn.qa.hermes.chat',
  '--organization-name',
  'Hermes Labs',
  '--organization-domain',
  'hermeslabs.com',
  '--repository-owner',
  'hermes-chat',
  '--repository-name',
  'chat-enterprise',
  '--asset-logo',
  '/brand/logo.svg',
  '--asset-favicon',
  '/brand/favicon.png',
  '--asset-wordmark',
  '/brand/wordmark.svg',
];

async function runCli(workspace: string, extraArgs: string[] = []): Promise<CliExecution> {
  return new Promise((resolveRun) => {
    const child = spawn(
      'bunx',
      [
        'tsx',
        'scripts/rebrandHermesChat.ts',
        '--workspace',
        workspace,
        ...REQUIRED_ARGS,
        ...extraArgs,
      ],
      {
        cwd: repoRoot,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

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

async function createWorkspace(): Promise<string> {
  const workspace = await mkdtemp(join(tmpdir(), 'hermes-rebrand-'));

  await writeFile(
    join(workspace, 'docs.md'),
    `# LobeChat\n\nLobeChat by LobeHub lives at https://lobehub.com and https://cdn.lobehub.com.\nSupport: https://help.lobehub.com\nContact support@lobehub.com or hello@lobehub.com.\nRepo: https://github.com/lobehub/lobe-chat.\nURN: urn:lobehub:chat\nPackage: @lobehub/ui\nSocial: Follow us @lobehub!\nAsset: /assets/logo/lobehub.svg\n`,
    'utf8',
  );

  await writeFile(
    join(workspace, 'config.json'),
    JSON.stringify(
      {
        product: 'LobeChat',
        domain: 'lobehub.com',
        org: 'LobeHub',
        favicon: '/favicon/lobehub.png',
      },
      null,
      2,
    ),
    'utf8',
  );

  await mkdir(join(workspace, 'locale'), { recursive: true });

  await writeFile(
    join(workspace, 'locale/en.json'),
    JSON.stringify(
      {
        description: 'Visit https://www.lobehub.com',
        slug: 'lobehubCloud',
      },
      null,
      2,
    ),
    'utf8',
  );

  return workspace;
}

describe('rebrandHermesChat CLI', () => {
  test('performs replacements across representative files', async () => {
    const workspace = await createWorkspace();

    try {
      const result = await runCli(workspace);

      expect(result.status).toBe(0);

      const docs = await readFile(join(workspace, 'docs.md'), 'utf8');
      expect(docs).toContain('Hermes Chat QA');
      expect(docs).toContain('Hermes Labs');
      expect(docs).toContain('https://qa.hermes.chat/support');
      expect(docs).toContain('cdn.qa.hermes.chat');
      expect(docs).toContain('help@hermes.chat');
      expect(docs).toContain('@hermeslabs/ui');
      expect(docs).toContain('@hermeslabs!');
      expect(docs).toContain('/brand/logo.svg');
      expect(docs).toContain('urn:hermeslabs:chat');
      expect(docs).not.toContain('LobeChat');
      expect(docs).not.toContain('lobehub.com');

      const config = await readFile(join(workspace, 'config.json'), 'utf8');
      expect(config).toContain('qa.hermes.chat');
      expect(config).toContain('/brand/favicon.png');
      expect(config).not.toContain('lobehub');

      const locale = await readFile(join(workspace, 'locale/en.json'), 'utf8');
      expect(locale).toContain('https://www.qa.hermes.chat');
      expect(locale).toContain('HermesLabsCloud');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  test('dry run leaves files untouched but reports actions', async () => {
    const workspace = await createWorkspace();

    try {
      const before = await readFile(join(workspace, 'docs.md'), 'utf8');
      const result = await runCli(workspace, ['--dry-run']);

      expect(result.status).toBe(0);
      expect(result.stdout + result.stderr).toContain('Dry run was enabled');

      const after = await readFile(join(workspace, 'docs.md'), 'utf8');
      expect(after).toBe(before);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });
});
