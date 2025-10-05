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
  'support@hermes.chat',
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
    `# Hermes Chat\n\nLobeChat by Hermes Labs lives at https://hermes.chat and https://cdn.hermes.chat.\nLegacy domains: https://hermes.chat + https://www.hermes.chat\nRaw asset: https://cdn.hermes.chat/hermes-chat/hermes-chat/main/assets/logo.svg\nSupport: https://hermes.chat/support\nAuth configuration guide: https://docs.hermes.chat/self-hosting/advanced/authentication (English) | 简体中文：https://docs.hermes.chat/zh-cn/self-hosting/advanced/authentication\nAccess denied troubleshooting: https://docs.hermes.chat/platform/authentication/errors#access-denied (English) | 简体中文：https://docs.hermes.chat/zh-cn/platform/authentication/errors#access-denied\nVerification troubleshooting: https://docs.hermes.chat/platform/authentication/errors#verification (English) | 简体中文：https://docs.hermes.chat/zh-cn/platform/authentication/errors#verification\nGeneric auth errors: https://docs.hermes.chat/platform/authentication/errors (English) | 简体中文：https://docs.hermes.chat/zh-cn/platform/authentication/errors\nContact support@hermes.chat or hello@hermes.chat.\nRepo: https://github.com/hermeslabs/hermes-chat.\nURN: urn:hermeslabs:chat\nPackage: @hermeslabs/ui\nScoped migration: @hermeslabs/analytics\nSocial: Follow us @hermeslabs!\nCommunity beta: say hi at @hermeschat.\nAsset: /assets/hermes-chat/logo.svg\nDocker service: hermes-chat\nHelm release: HERMES-CHAT\nEnvironment constant: HERMES_CHAT\nLocale cookie constant: HERMES_LOCALE\nDesktop UA: HermesChat-Desktop/1.0.0\nMarkdown sample: \`hermes_chat\`\nCloud constant: HERMES_CHAT_CLOUD\nCloud slug: hermes-chat-cloud\nCloud snake: hermes_chat_cloud\nCloud label: Hermes Chat Cloud\nProvider slug: 'hermescloud'\nPPIO referral: https://ppinfra.com/user/register?invited_by=RQIMOC&utm_source=hermes-chat&utm_medium=app_referral&utm_campaign=model_provider\nAiHubMix docs: https://aihubmix.com?utm_source=hermes-chat&utm_medium=app_referral&utm_campaign=model_provider\n`,
    'utf8',
  );

  await writeFile(
    join(workspace, 'config.json'),
    JSON.stringify(
      {
        product: 'Hermes Chat',
        domain: 'hermes.chat',
        org: 'Hermes Labs',
        favicon: '/assets/hermes-chat/favicon.svg',
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
        description: 'Visit https://www.hermes.chat or https://www.hermes.chat',
        slug: 'HermesLabsCloud',
        cloudSlug: 'hermes-chat-cloud',
        cloudSnake: 'hermes_chat_cloud',
        rawCdn: 'https://cdn.hermes.chat/hermes-chat/hermes-chat/main/assets/icon.png',
      },
      null,
      2,
    ),
    'utf8',
  );

  await writeFile(
    join(workspace, 'locale/oauth.ts'),
    `export const oauth = { scope: { openid: '使用您的 Hermes Chat 账户进行身份验证' } } as const;\n`,
    'utf8',
  );

  await writeFile(
    join(workspace, 'locale/oauth.json'),
    JSON.stringify(
      {
        consent: {
          scope: {
            openid: 'Authenticate using your Hermes Chat account',
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
    `import type { HermesChatPluginApi, HermesChatPluginManifest } from './types';\n\nexport type FixtureManifest = HermesChatPluginManifest & { brand: string };\n\nexport const fixtureApi: HermesChatPluginApi = {\n  description: 'Legacy manifest compatibility smoke test',\n  name: 'legacyTest',\n  parameters: {},\n};\n`,
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
      expect(docs).toContain(
        'https://docs.hermes.chat/self-hosting/advanced/authentication (English) | 简体中文：https://docs.hermes.chat/zh-cn/self-hosting/advanced/authentication',
      );
      expect(docs).toContain(
        'https://docs.hermes.chat/platform/authentication/errors#access-denied (English) | 简体中文：https://docs.hermes.chat/zh-cn/platform/authentication/errors#access-denied',
      );
      expect(docs).toContain(
        'https://docs.hermes.chat/platform/authentication/errors#verification (English) | 简体中文：https://docs.hermes.chat/zh-cn/platform/authentication/errors#verification',
      );
      expect(docs).toContain(
        'https://docs.hermes.chat/platform/authentication/errors (English) | 简体中文：https://docs.hermes.chat/zh-cn/platform/authentication/errors',
      );
      expect(docs).toContain('cdn.qa.hermes.chat');
      expect(docs).toContain('https://hermes.chat + https://www.hermes.chat');
      expect(docs).toContain(
        'https://cdn.qa.hermes.chat/hermes-chat/hermes-chat/main/assets/logo.svg',
      );
      expect(docs).toContain('support@hermes.chat');
      expect(docs).toContain('@hermeslabs/ui');
      expect(docs).toContain('@hermeslabs/analytics');
      expect(docs).toContain('@hermeslabs!');
      expect(docs).toContain('@hermesqa');
      expect(docs).toContain('/assets/hermes-chat/logo.svg');
      expect(docs).toContain('urn:hermeslabs:chat');
      expect(docs).toContain('Docker service: hermes-chat');
      expect(docs).toContain('Helm release: HERMES-CHAT');
      expect(docs).toContain('Environment constant: HERMES_CHAT');
      expect(docs).toContain('`hermes_chat`');
      expect(docs).toContain('Locale cookie constant: HERMES_LOCALE');
      expect(docs).toContain('Desktop UA: HermesChatQa-Desktop/1.0.0');
      expect(docs).toContain('Cloud constant: HERMES_CHAT_CLOUD');
      expect(docs).toContain('Cloud slug: hermes-chat-cloud');
      expect(docs).toContain('Cloud snake: hermes_chat_cloud');
      expect(docs).toContain('Cloud label: Hermes Chat Cloud');
      expect(docs).toContain("Provider slug: 'hermescloud'");
      expect(docs).toContain('utm_source=hermes-chat');
      expect(docs).toContain('utm_medium=app_referral');
      expect(docs).toContain('utm_campaign=model_provider');
      expect(docs).not.toContain('github_lobechat');
      expect(docs).not.toContain('authjs.dev');

      const config = await readFile(join(workspace, 'config.json'), 'utf8');
      expect(config).toContain('hermes.chat');
      expect(config).toContain('/assets/hermes-chat/favicon.svg');

      const typesFixture = await readFile(join(workspace, 'types.ts'), 'utf8');
      expect(typesFixture).toContain('HermesChatPluginManifest');
      expect(typesFixture).toContain('HermesChatPluginApi');

      const locale = await readFile(join(workspace, 'locale/en.json'), 'utf8');
      expect(locale).toContain('https://www.hermes.chat');
      expect(locale).toContain('HermesLabsCloud');
      expect(locale).toContain(
        'https://cdn.qa.hermes.chat/hermes-chat/hermes-chat/main/assets/icon.png',
      );
      expect(locale).toContain('cloudSlug');
      expect(locale).toContain('hermes-chat-cloud');
      expect(locale).toContain('cloudSnake');
      expect(locale).toContain('hermes_chat_cloud');

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
      expect(combinedOutput).toContain('organization-scope');
      expect(combinedOutput).toContain('organization-handle');
      expect(combinedOutput).toContain('product-handle-hermes-chat');
      expect(combinedOutput).toContain('product-name-titlecase');
      expect(combinedOutput).toContain('oauth-openid-scope-zh-cn');
      expect(combinedOutput).toContain('oauth-openid-scope-en');
      expect(combinedOutput).toContain('dry-run replacement summary');

      const after = await readFile(join(workspace, 'docs.md'), 'utf8');
      expect(after).toBe(before);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });
});
