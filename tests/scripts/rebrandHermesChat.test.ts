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
  '/brand/favicon.svg',
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
    `# LobeChat\n\nLobeChat by LobeHub lives at https://lobehub.com and https://cdn.lobehub.com.\nLegacy domains: https://lobechat.com + https://www.lobechat.com\nRaw asset: https://raw.githubusercontent.com/lobehub/lobe-chat/main/assets/logo.svg\nSupport: https://help.lobehub.com\nContact support@lobehub.com or hello@lobehub.com.\nRepo: https://github.com/lobehub/lobe-chat.\nURN: urn:lobehub:chat\nPackage: @hermeslabs/ui\nScoped migration: @hermeslabs/analytics\nSocial: Follow us @lobehub!\nCommunity beta: say hi at @lobechat.\nAsset: /assets/logo/lobehub.svg\nDocker service: lobe-chat\nHelm release: LOBE-CHAT\nEnvironment constant: LOBE_CHAT\nLocale cookie constant: LOBE_LOCALE\nDesktop UA: LobeChat-Desktop/1.0.0\nMarkdown sample: \`lobe_chat\`\n`,
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
        description: 'Visit https://www.lobehub.com or https://www.lobechat.com',
        slug: 'lobehubCloud',
        rawCdn: 'https://raw.githubusercontent.com/lobehub/lobe-chat/main/assets/icon.png',
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
      expect(docs).toContain('https://qa.hermes.chat + https://www.qa.hermes.chat');
      expect(docs).toContain(
        'https://cdn.qa.hermes.chat/hermes-chat/chat-enterprise/main/assets/logo.svg',
      );
      expect(docs).toContain('help@hermes.chat');
      expect(docs).toContain('@hermeslabs/ui');
      expect(docs).toContain('@hermeslabs/analytics');
      expect(docs).toContain('@hermeslabs!');
      expect(docs).toContain('@hermesqa');
      expect(docs).toContain('/brand/logo.svg');
      expect(docs).toContain('urn:hermeslabs:chat');
      expect(docs).toContain('Docker service: hermes-qa');
      expect(docs).toContain('Helm release: HERMES-QA');
      expect(docs).toContain('Environment constant: HERMES_QA');
      expect(docs).toContain('`hermes_qa`');
      expect(docs).toContain('Locale cookie constant: HERMES_QA_LOCALE');
      expect(docs).toContain('Desktop UA: HermesChatQa-Desktop/1.0.0');
      expect(docs).not.toContain('LobeChat');
      expect(docs).not.toContain('lobehub.com');
      expect(docs).not.toContain('lobechat.com');
      expect(docs).not.toContain('@lobechat');
      expect(docs).not.toContain('raw.githubusercontent.com/lobehub/lobe-chat');

      const config = await readFile(join(workspace, 'config.json'), 'utf8');
      expect(config).toContain('qa.hermes.chat');
      expect(config).toContain('/brand/favicon.svg');
      expect(config).not.toContain('lobehub');

      const locale = await readFile(join(workspace, 'locale/en.json'), 'utf8');
      expect(locale).toContain('https://www.qa.hermes.chat');
      expect(locale).toContain('HermesLabsCloud');
      expect(locale).toContain(
        'https://cdn.qa.hermes.chat/hermes-chat/chat-enterprise/main/assets/icon.png',
      );
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
      expect(result.stdout + result.stderr).toContain('product-scope-lobechat: 1');
      expect(result.stdout + result.stderr).toContain('product-handle-lobechat: 1');
      expect(result.stdout + result.stderr).toContain('locale-cookie-constant: 1');
      expect(result.stdout + result.stderr).toContain('desktop-user-agent-handle: 1');

      const after = await readFile(join(workspace, 'docs.md'), 'utf8');
      expect(after).toBe(before);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });
});
