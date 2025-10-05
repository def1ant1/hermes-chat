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
    `# LobeChat\n\nLobeChat by LobeHub lives at https://lobehub.com and https://cdn.lobehub.com.\nLegacy domains: https://lobechat.com + https://www.lobechat.com\nRaw asset: https://raw.githubusercontent.com/lobehub/lobe-chat/main/assets/logo.svg\nSupport: https://help.lobehub.com\nContact support@lobehub.com or hello@lobehub.com.\nRepo: https://github.com/lobehub/lobe-chat.\nURN: urn:lobehub:chat\nPackage: @hermeslabs/ui\nScoped migration: @lobechat/analytics\nSocial: Follow us @lobehub!\nCommunity beta: say hi at @lobechat.\nAsset: /assets/logo/lobehub.svg\nDocker service: lobe-chat\nHelm release: LOBE-CHAT\nEnvironment constant: LOBE_CHAT\nLocale cookie constant: LOBE_LOCALE\nDesktop UA: LobeChat-Desktop/1.0.0\nMarkdown sample: \`lobe_chat\`\nCloud constant: LOBE_CHAT_CLOUD\nCloud slug: lobe-chat-cloud\nCloud snake: lobe_chat_cloud\nCloud label: Lobe Chat Cloud\nProvider slug: 'lobehub'\n`,
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
        cloudSlug: 'lobe-chat-cloud',
        cloudSnake: 'lobe_chat_cloud',
        rawCdn: 'https://raw.githubusercontent.com/lobehub/lobe-chat/main/assets/icon.png',
      },
      null,
      2,
    ),
    'utf8',
  );

  await writeFile(
    join(workspace, 'locale/oauth.ts'),
    `export const oauth = { scope: { openid: '使用您的 LobeChat 账户进行身份验证' } } as const;\n`,
    'utf8',
  );

  await writeFile(
    join(workspace, 'locale/oauth.json'),
    JSON.stringify(
      {
        consent: {
          scope: {
            openid: 'Authenticate using your LobeChat account',
          },
        },
      },
      null,
      2,
    ),
    'utf8',
  );

  await writeFile(
    join(workspace, 'types.ts'),
    `import type { LobeChatPluginApi, LobeChatPluginManifest } from './types';\n\nexport type FixtureManifest = LobeChatPluginManifest & { brand: string };\n\nexport const fixtureApi: LobeChatPluginApi = {\n  description: 'Legacy manifest compatibility smoke test',\n  name: 'legacyTest',\n  parameters: {},\n};\n`,
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
      expect(docs).toContain('Cloud constant: HERMES_QA_CLOUD');
      expect(docs).toContain('Cloud slug: hermes-qa-cloud');
      expect(docs).toContain('Cloud snake: hermes_qa_cloud');
      expect(docs).toContain('Cloud label: Hermes Chat QA Cloud');
      expect(docs).toContain("Provider slug: 'hermescloud'");
      expect(docs).not.toContain('LobeChat');
      expect(docs).not.toContain('lobehub.com');
      expect(docs).not.toContain('lobechat.com');
      expect(docs).not.toContain('@lobechat');
      expect(docs).not.toContain('raw.githubusercontent.com/lobehub/lobe-chat');
      expect(docs).not.toContain('LOBE_CHAT_CLOUD');
      expect(docs).not.toContain('lobe-chat-cloud');
      expect(docs).not.toContain('lobe_chat_cloud');
      expect(docs).not.toContain('Lobe Chat Cloud');

      const config = await readFile(join(workspace, 'config.json'), 'utf8');
      expect(config).toContain('qa.hermes.chat');
      expect(config).toContain('/brand/favicon.svg');
      expect(config).not.toContain('lobehub');

      const typesFixture = await readFile(join(workspace, 'types.ts'), 'utf8');
      expect(typesFixture).toContain('HermesChatPluginManifest');
      expect(typesFixture).toContain('HermesChatPluginApi');
      expect(typesFixture).not.toContain('LobeChatPluginManifest');
      expect(typesFixture).not.toContain('LobeChatPluginApi');

      const locale = await readFile(join(workspace, 'locale/en.json'), 'utf8');
      expect(locale).toContain('https://www.qa.hermes.chat');
      expect(locale).toContain('HermesLabsCloud');
      expect(locale).toContain(
        'https://cdn.qa.hermes.chat/hermes-chat/chat-enterprise/main/assets/icon.png',
      );
      expect(locale).toContain('cloudSlug');
      expect(locale).toContain('hermes-qa-cloud');
      expect(locale).toContain('cloudSnake');
      expect(locale).toContain('hermes_qa_cloud');
      expect(locale).not.toContain('lobe-chat-cloud');
      expect(locale).not.toContain('lobe_chat_cloud');

      const oauthTs = await readFile(join(workspace, 'locale/oauth.ts'), 'utf8');
      expect(oauthTs).toContain('使用您的 Hermes Chat QA 账户进行身份验证');

      const oauthJson = await readFile(join(workspace, 'locale/oauth.json'), 'utf8');
      expect(oauthJson).toContain('Authenticate using your Hermes Chat QA account');
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
      const combinedOutput = result.stdout + result.stderr;
      expect(combinedOutput).toContain('cloud-token-constant');
      expect(combinedOutput).toContain('cloud-token-title');
      expect(combinedOutput).toContain('cloud-token-kebab');
      expect(combinedOutput).toContain('cloud-token-snake');
      expect(combinedOutput).toContain('dry-run replacement summary');

      const after = await readFile(join(workspace, 'docs.md'), 'utf8');
      expect(after).toBe(before);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });
});
