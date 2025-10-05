/* eslint-disable no-console */
import consola from 'consola';
import { glob } from 'glob';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';

/**
 * Rich metadata describing the future Hermes Chat brand.
 * The CLI accepts overrides through command line flags so that
 * operators can re-run the migration for bespoke branding campaigns
 * without touching this file.
 */
export interface BrandMetadata {
  /**
   * Paths to brand assets within the repository.
   */
  readonly assets: {
    /** Optional hero/banner image. */
    readonly banner?: string;
    /** Path to the favicon or app icon file. */
    readonly favicon: string;
    /** Path to the primary logo file. */
    readonly logo: string;
    /** Path to the wordmark / horizontal lockup. */
    readonly wordmark: string;
  };
  /**
   * Optional CDN endpoint; defaults to the primary domain when omitted.
   */
  readonly cdnDomain?: string;
  /**
   * Contact channels that appear in documentation footers.
   */
  readonly contact: {
    /** Optional chat community invite. */
    readonly discord?: string;
    /** General purpose support email (alias of supportEmail). */
    readonly email: string;
    /** Optional messaging channel for enterprise escalations. */
    readonly telegram?: string;
    /** Public status page or landing site. */
    readonly website?: string;
  };
  /**
   * Primary marketing / login domain for the product.
   */
  readonly domain: string;
  /**
   * Human friendly product name shown throughout docs & UI.
   */
  readonly name: string;
  /**
   * Parent organization information for references to "LobeHub".
   */
  readonly organization?: {
    /** Corporate domain used in legal copy. */
    readonly domain?: string;
    /** Name of the operating company. */
    readonly name: string;
  };
  /**
   * Repository metadata used to rewrite GitHub URLs.
   */
  readonly repository?: {
    /** Git provider hostname, defaults to github.com. */
    readonly host?: string;
    /** Repository name. */
    readonly name: string;
    /** Organization / user slug on the Git provider. */
    readonly owner: string;
  };
  /**
   * Shortened product name used when space is constrained.
   */
  readonly shortName: string;
  /**
   * Public support email that replaces legacy contact addresses.
   */
  readonly supportEmail: string;
  /**
   * Landing page for documentation or support portal.
   */
  readonly supportUrl: string;
  /**
   * Optional overrides for generated token names.
   */
  readonly tokens?: {
    /**
     * Prefix used when generating theme cookie constants (e.g., HERMES).
     */
    readonly themePrefix?: string;
  };
}

/**
 * A single replacement rule responsible for migrating a legacy token to its
 * Hermes Chat equivalent. All patterns must be global regular expressions so
 * the script can track replacement counts deterministically.
 */
interface ReplacementRule {
  /** Why this rule exists and what it updates. */
  readonly description: string;
  /** Unique identifier that we surface in logs. */
  readonly id: string;
  /** Global regular expression that targets legacy content. */
  readonly pattern: RegExp;
  /** Replacement factory that derives the new value from the brand metadata. */
  readonly replacement: (brand: BrandMetadata) => string;
}

/**
 * Normalizes organization or product names into durable handle slugs so that
 * package scopes and social usernames remain DNS/registry safe. We trim
 * whitespace and punctuation to avoid leaking inconsistent casing into
 * published artifacts (npm scopes, marketing handles, etc.).
 */
function sanitizeHandleSlug(source: string): string {
  return source.toLowerCase().replaceAll(/[^\da-z]+/g, '');
}

function splitIntoWords(source: string): string[] {
  return source
    .split(/[^\dA-Za-z]+/g)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function toPascalCase(words: string[]): string {
  return words
    .map((word) => word.toLowerCase())
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function deriveThemePrefixVariants(brand: BrandMetadata): {
  constant: string;
  kebab: string;
  snake: string;
} {
  const base = brand.tokens?.themePrefix ?? brand.shortName ?? brand.name;
  const words = splitIntoWords(base);
  const normalized = words.length ? words : splitIntoWords(brand.name);
  const safeWords = normalized.length ? normalized : ['hermes'];

  return {
    constant: safeWords.map((word) => word.toUpperCase()).join('_'),
    kebab: safeWords.map((word) => word.toLowerCase()).join('-'),
    snake: safeWords.map((word) => word.toLowerCase()).join('_'),
  };
}

/**
 * The central configuration describing every deterministic renaming we perform.
 *
 * Each entry is heavily annotated to ensure future migrations can extend the
 * mapping confidently without reverse engineering the automation.
 */
const REBRANDING_RULES: readonly ReplacementRule[] = [
  {
    description:
      'OAuth OpenID scope copy in Simplified Chinese referencing the legacy product account.',
    id: 'oauth-openid-scope-zh-cn',
    pattern: /(使用您的\s*)LobeChat(\s*账户进行身份验证)/g,
    replacement: (brand) => `$1${brand.name}$2`,
  },
  {
    description:
      'OAuth OpenID scope copy in English locale bundles referencing the legacy product account.',
    id: 'oauth-openid-scope-en',
    pattern: /(Authenticate using your\s*)LobeChat(\s+account)/g,
    replacement: (brand) => `$1${brand.name}$2`,
  },
  {
    description: 'Kebab-case service identifiers such as docker-compose service names (lobe-chat).',
    id: 'product-name-kebab',
    pattern: /\blobe-chat\b/g,
    replacement: (brand) => brand.shortName.toLowerCase().replaceAll(/\s+/g, '-'),
  },
  {
    description: 'Uppercase tokens such as environment variables or constants.',
    id: 'product-name-uppercase',
    pattern: /\bLOBECHAT\b/g,
    replacement: (brand) => brand.name.toUpperCase().replaceAll(/\s+/g, '_'),
  },
  {
    description: 'Uppercase kebab-case constants (e.g., Helm release names LOBE-CHAT).',
    id: 'product-name-uppercase-kebab',
    pattern: /\bLOBE-CHAT\b/g,
    replacement: (brand) => brand.shortName.toUpperCase().replaceAll(/\s+/g, '-'),
  },
  {
    description: 'Snake_case identifiers such as database schemas (lobe_chat).',
    id: 'product-name-snake',
    pattern: /\blobe_chat\b/g,
    replacement: (brand) => brand.shortName.toLowerCase().replaceAll(/\s+/g, '_'),
  },
  {
    description: 'Upper snake case identifiers used in environment variables (LOBE_CHAT).',
    id: 'product-name-uppercase-snake',
    pattern: /\bLOBE_CHAT\b/g,
    replacement: (brand) => brand.shortName.toUpperCase().replaceAll(/\s+/g, '_'),
  },
  {
    description:
      'References to the parent company "LobeHub" should become the new operating entity.',
    id: 'organization-name',
    pattern: /\bLobe[ -]?Hub\b/g,
    replacement: (brand) => brand.organization?.name ?? brand.name,
  },
  {
    description: 'Scoped package identifiers such as @hermeslabs/ui.',
    id: 'organization-scope',
    pattern: /@hermeslabs\//g,
    replacement: (brand) =>
      `@${sanitizeHandleSlug(brand.organization?.name ?? brand.shortName ?? brand.name)}/`,
  },
  {
    description: 'Bare organization handles (e.g., social usernames).',
    id: 'organization-handle',
    pattern: /@hermeslabs(?!\.com)/g,
    replacement: (brand) =>
      `@${sanitizeHandleSlug(brand.organization?.name ?? brand.shortName ?? brand.name)}`,
  },
  {
    description:
      'Product-scoped package imports (e.g., @hermeslabs/*) must adopt the organization scope so npm installations resolve post-migration.',
    id: 'product-scope-lobechat',
    pattern: /@lobechat\//g,
    replacement: (brand) => {
      // npm scopes mirror the parent organization slug; fall back to the short name when no org exists.
      const scopeSource = brand.organization?.name ?? brand.shortName ?? brand.name;
      const scopeSlug = sanitizeHandleSlug(scopeSource);

      return `@${scopeSlug}/`;
    },
  },
  {
    description:
      'Bare @lobechat handles inside marketing copy should pivot to the product short name to avoid colliding with organization slugs.',
    id: 'product-handle-lobechat',
    pattern: /@lobechat(?!\.com)(?!\/)/g,
    replacement: (brand) => {
      // Social-style mentions typically highlight the product; use the short name so enterprise renames remain human readable.
      const handleSource = brand.shortName ?? brand.organization?.name ?? brand.name;
      const handleSlug = sanitizeHandleSlug(handleSource);

      return `@${handleSlug}`;
    },
  },
  {
    description: 'Links to the legacy support portal.',
    id: 'contact-domain',
    pattern: /https?:\/\/(www\.)?help\.lobehub\.com/g,
    replacement: (brand) => brand.supportUrl,
  },
  {
    description: 'Default support contact mailbox.',
    id: 'support-email',
    pattern: /support@lobehub\.com/g,
    replacement: (brand) => brand.supportEmail,
  },
  {
    description: 'General hello/inbox mailbox.',
    id: 'hello-email',
    pattern: /hello@lobehub\.com/g,
    replacement: (brand) => brand.contact.email,
  },
  {
    description: 'Marketing domains such as lobehub.com.',
    id: 'primary-domain',
    pattern: /lobehub\.com/g,
    replacement: (brand) => brand.domain,
  },
  {
    description:
      'Legacy lobechat.com hostnames (without www) that still surface in historical READMEs and deployment manifests.',
    id: 'legacy-lobechat-domain',
    pattern: /lobechat\.com/g,
    replacement: (brand) => brand.domain,
  },
  {
    description: 'www-prefixed marketing domains.',
    id: 'www-domain',
    pattern: /www\.lobehub\.com/g,
    replacement: (brand) => `www.${brand.domain}`,
  },
  {
    description:
      'www-prefixed lobechat.com hostnames to guarantee vanity links follow the new Hermes entrypoint.',
    id: 'legacy-lobechat-domain-www',
    pattern: /www\.lobechat\.com/g,
    replacement: (brand) => `www.${brand.domain}`,
  },
  {
    description: 'Lowercase handles for the product (e.g. URLs or CLI flags).',
    id: 'product-name-lowercase',
    pattern: /\blobechat\b/g,
    replacement: (brand) => brand.name.toLowerCase().replaceAll(/\s+/g, '-'),
  },
  {
    description: 'CDN endpoints previously rooted at cdn.lobehub.com.',
    id: 'cdn-domain',
    pattern: /cdn\.lobehub\.com/g,
    replacement: (brand) => brand.cdnDomain ?? brand.domain,
  },
  {
    description:
      'Raw GitHub asset downloads sourced from lobehub/lobe-chat now stream from the Hermes CDN (or domain fallback).',
    id: 'raw-github-cdn',
    pattern: /https?:\/\/raw\.githubusercontent\.com\/lobehub\/[\w-]+/g,
    replacement: (brand) => {
      const owner =
        brand.repository?.owner ??
        brand.organization?.name?.toLowerCase().replaceAll(/\s+/g, '-') ??
        brand.name.toLowerCase().replaceAll(/\s+/g, '-');
      const repo = brand.repository?.name ?? brand.name.toLowerCase().replaceAll(/\s+/g, '-');
      const cdn = brand.cdnDomain ?? brand.domain;

      return `https://${cdn}/${owner}/${repo}`;
    },
  },
  {
    description: 'Direct logo asset references inside markdown/docs.',
    id: 'asset-logo',
    pattern: /\/assets\/logo\/lobehub(-light)?\.svg/g,
    replacement: (brand) => brand.assets.logo,
  },
  {
    description: 'Favicon assets used across html configs.',
    id: 'asset-favicon',
    pattern: /\/favicon\/lobehub\.(png|ico)/g,
    replacement: (brand) => brand.assets.favicon,
  },
  {
    description: 'Wordmark images embedded in READMEs and docs.',
    id: 'asset-wordmark',
    pattern: /\/assets\/branding\/lobehub-wordmark\.svg/g,
    replacement: (brand) => brand.assets.wordmark,
  },
  {
    description: 'Kebab-case organization identifiers used across metadata.',
    id: 'organization-kebab',
    pattern: /\blobehub\b/g,
    replacement: (brand) =>
      (brand.organization?.name ?? brand.name).toLowerCase().replaceAll(/\s+/g, ''),
  },
  {
    description: 'GitHub repository references pointing to lobehub org.',
    id: 'github-org',
    pattern: /https?:\/\/github\.com\/lobehub\/lobe-chat/g,
    replacement: (brand) => {
      const host = brand.repository?.host ?? 'github.com';
      return `https://${host}/${brand.repository?.owner ?? brand.organization?.name ?? brand.name.replaceAll(/\s+/g, '-')}/${brand.repository?.name ?? brand.name.toLowerCase().replaceAll(/\s+/g, '-')}`;
    },
  },
  {
    description: 'Bare GitHub organization URLs included in metadata authors and footers.',
    id: 'github-org-root',
    pattern: /https?:\/\/github\.com\/lobehub(?!\/)/g,
    replacement: (brand) => {
      const host = brand.repository?.host ?? 'github.com';
      const owner =
        brand.repository?.owner ??
        brand.organization?.name?.toLowerCase().replaceAll(/\s+/g, '-') ??
        brand.name.toLowerCase().replaceAll(/\s+/g, '-');

      return `https://${host}/${owner}`;
    },
  },
  {
    description: 'GitHub organization slug only.',
    id: 'gh-org-generic',
    pattern: /github\.com\/lobehub/g,
    replacement: (brand) =>
      `${brand.repository?.host ?? 'github.com'}/${brand.repository?.owner ?? brand.organization?.name?.toLowerCase().replaceAll(/\s+/g, '-') ?? brand.name.toLowerCase().replaceAll(/\s+/g, '-')}`,
  },
  {
    description: 'OIDC identifiers referencing lobehub URNs.',
    id: 'oidc-audience',
    pattern: /urn:lobehub:chat/g,
    replacement: (brand) =>
      `urn:${(brand.organization?.name ?? brand.name).toLowerCase().replaceAll(/\s+/g, '')}:chat`,
  },
  {
    description: 'OIDC desktop client identifier.',
    id: 'desktop-client-id',
    pattern: /lobehub-desktop/g,
    replacement: (brand) =>
      `${(brand.organization?.name ?? brand.name).toLowerCase().replaceAll(/\s+/g, '')}-desktop`,
  },
  {
    description: 'Environment variables referencing lobehub cloud.',
    id: 'service-mode-flag',
    pattern: /lobehubCloud/g,
    replacement: (brand) =>
      `${(brand.organization?.name ?? brand.name).replaceAll(/\s+/g, '')}Cloud`,
  },
  {
    description:
      'Theme appearance cookie constant migrates from the legacy LOBE prefix to the Hermes-approved prefix.',
    id: 'theme-token-appearance-constant',
    pattern: /\bLOBE_THEME_APPEARANCE\b/g,
    replacement: (brand) => {
      const prefix = deriveThemePrefixVariants(brand);
      return `${prefix.constant}_THEME_APPEARANCE`;
    },
  },
  {
    description: 'Theme primary color cookie constant adopts Hermes naming.',
    id: 'theme-token-primary-constant',
    pattern: /\bLOBE_THEME_PRIMARY_COLOR\b/g,
    replacement: (brand) => {
      const prefix = deriveThemePrefixVariants(brand);
      return `${prefix.constant}_THEME_PRIMARY_COLOR`;
    },
  },
  {
    description: 'Theme neutral color cookie constant adopts Hermes naming.',
    id: 'theme-token-neutral-constant',
    pattern: /\bLOBE_THEME_NEUTRAL_COLOR\b/g,
    replacement: (brand) => {
      const prefix = deriveThemePrefixVariants(brand);
      return `${prefix.constant}_THEME_NEUTRAL_COLOR`;
    },
  },
  {
    description:
      'Kebab-case theme appearance tokens follow the Hermes prefix for CSS IDs or data attributes.',
    id: 'theme-token-appearance-kebab',
    pattern: /\blobe-theme-appearance\b/g,
    replacement: (brand) => {
      const prefix = deriveThemePrefixVariants(brand);
      return `${prefix.kebab}-theme-appearance`;
    },
  },
  {
    description: 'Kebab-case theme primary color tokens follow the Hermes prefix.',
    id: 'theme-token-primary-kebab',
    pattern: /\blobe-theme-primary-color\b/g,
    replacement: (brand) => {
      const prefix = deriveThemePrefixVariants(brand);
      return `${prefix.kebab}-theme-primary-color`;
    },
  },
  {
    description: 'Kebab-case theme neutral color tokens follow the Hermes prefix.',
    id: 'theme-token-neutral-kebab',
    pattern: /\blobe-theme-neutral-color\b/g,
    replacement: (brand) => {
      const prefix = deriveThemePrefixVariants(brand);
      return `${prefix.kebab}-theme-neutral-color`;
    },
  },
  {
    description: 'Snake_case theme appearance tokens use Hermes naming for server configs.',
    id: 'theme-token-appearance-snake',
    pattern: /\blobe_theme_appearance\b/g,
    replacement: (brand) => {
      const prefix = deriveThemePrefixVariants(brand);
      return `${prefix.snake}_theme_appearance`;
    },
  },
  {
    description: 'Snake_case theme primary color tokens use Hermes naming.',
    id: 'theme-token-primary-snake',
    pattern: /\blobe_theme_primary_color\b/g,
    replacement: (brand) => {
      const prefix = deriveThemePrefixVariants(brand);
      return `${prefix.snake}_theme_primary_color`;
    },
  },
  {
    description: 'Snake_case theme neutral color tokens use Hermes naming.',
    id: 'theme-token-neutral-snake',
    pattern: /\blobe_theme_neutral_color\b/g,
    replacement: (brand) => {
      const prefix = deriveThemePrefixVariants(brand);
      return `${prefix.snake}_theme_neutral_color`;
    },
  },
  {
    description: 'Locale cookie constants adopt Hermes prefixes.',
    id: 'locale-cookie-constant',
    pattern: /\bLOBE_LOCALE\b/g,
    replacement: (brand) => {
      const prefix = deriveThemePrefixVariants(brand);
      return `${prefix.constant}_LOCALE`;
    },
  },
  {
    description: 'Desktop user-agent strings follow the Hermes product handle.',
    id: 'desktop-user-agent-handle',
    pattern: /LobeChat-Desktop/g,
    replacement: (brand) => {
      const base = splitIntoWords(brand.name);
      const fallback = base.length ? base : ['hermes', 'chat'];
      return `${toPascalCase(fallback)}-Desktop`;
    },
  },
  {
    description:
      'Primary product name references such as "LobeChat" and "Lobe Chat" inside docs and UI copy.',
    id: 'product-name-titlecase',
    pattern: /\bLobe[ -]?Chat\b/g,
    replacement: (brand) => brand.name,
  },
];

/**
 * File extensions that we consider safe for text-based replacement.
 */
const TEXT_EXTENSIONS = new Set([
  '.cjs',
  '.css',
  '.env',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mdx',
  '.mts',
  '.sh',
  '.ts',
  '.tsx',
  '.txt',
  '.yml',
  '.yaml',
]);

/** Directories excluded from scanning to speed up execution and avoid vendored content. */
const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/.turbo/**',
  '**/.cache/**',
  '**/coverage/**',
];

/** Summary of the rebranding run. */
interface RebrandSummary {
  readonly dryRun: boolean;
  readonly filesModified: number;
  readonly filesScanned: number;
  readonly replacements: Record<string, number>;
}

const DEFAULT_BRAND: BrandMetadata = {
  assets: {
    /** Vector hero stored in-repo so downstream pipelines can rasterize as needed. */
    banner: '/assets/hermes-chat/banner.svg',
    /** SVG favicon glyph to avoid shipping binary blobs in source control. */
    favicon: '/assets/hermes-chat/favicon.svg',
    logo: '/assets/hermes-chat/logo.svg',
    wordmark: '/assets/hermes-chat/wordmark.svg',
  },
  cdnDomain: 'cdn.hermes.chat',
  contact: {
    discord: 'https://discord.gg/hermeschat',
    email: 'hello@hermes.chat',
    website: 'https://hermes.chat',
  },
  domain: 'hermes.chat',
  name: 'Hermes Chat',
  organization: {
    domain: 'hermeslabs.com',
    name: 'Hermes Labs',
  },
  repository: {
    host: 'github.com',
    name: 'hermes-chat',
    owner: 'hermes-chat',
  },
  shortName: 'Hermes Chat',
  supportEmail: 'support@hermes.chat',
  supportUrl: 'https://hermes.chat/support',
  tokens: {
    themePrefix: 'Hermes',
  },
};

const logger = consola.withTag('rebrand');

type Mutable<T> = { -readonly [P in keyof T]: T[P] };
type BrandOverrides = Partial<Mutable<BrandMetadata>>;
type ScriptMode = 'apply' | 'lint-strings' | 'validate';

function mergeBrandMetadata(base: BrandMetadata, overrides: BrandOverrides): BrandMetadata {
  const resolvedName = overrides.name ?? base.name;
  const resolvedShortName = overrides.shortName ?? base.shortName ?? resolvedName;

  const organization =
    overrides.organization || base.organization
      ? {
          domain: overrides.organization?.domain ?? base.organization?.domain,
          name: overrides.organization?.name ?? base.organization?.name ?? resolvedName,
        }
      : undefined;

  const organizationSlug = (organization?.name ?? resolvedName)
    .toLowerCase()
    .replaceAll(/\s+/g, '-');

  const repository =
    overrides.repository || base.repository
      ? {
          host: overrides.repository?.host ?? base.repository?.host ?? 'github.com',
          name:
            overrides.repository?.name ??
            base.repository?.name ??
            resolvedName.toLowerCase().replaceAll(/\s+/g, '-'),
          owner: overrides.repository?.owner ?? base.repository?.owner ?? organizationSlug,
        }
      : undefined;

  const tokens = {
    themePrefix:
      overrides.tokens?.themePrefix ??
      overrides.shortName ??
      overrides.name ??
      base.tokens?.themePrefix ??
      resolvedShortName ??
      resolvedName,
  };

  return {
    ...base,
    ...overrides,
    assets: {
      ...base.assets,
      ...overrides.assets,
    },
    contact: {
      ...base.contact,
      ...overrides.contact,
      email: overrides.contact?.email ?? overrides.supportEmail ?? base.contact.email,
    },
    organization,
    repository,
    supportEmail: overrides.supportEmail ?? overrides.contact?.email ?? base.supportEmail,
    tokens,
  };
}

function detectBinary(content: Buffer): boolean {
  return content.includes(0);
}

async function ensureDirectory(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
}

async function applyReplacements(
  filePath: string,
  brand: BrandMetadata,
  rules: readonly ReplacementRule[],
  dryRun: boolean,
): Promise<{ counts: Record<string, number>; modified: boolean }> {
  const raw = await readFile(filePath);

  if (detectBinary(raw)) {
    return { counts: {}, modified: false };
  }

  const extension = extname(filePath);
  if (extension && !TEXT_EXTENSIONS.has(extension)) {
    return { counts: {}, modified: false };
  }

  const original = raw.toString('utf8');
  let mutated = original;
  const counts: Record<string, number> = {};

  for (const rule of rules) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    const matches = mutated.match(pattern);
    if (!matches) continue;

    const replacementValue = rule.replacement(brand);
    mutated = mutated.replace(pattern, replacementValue);
    counts[rule.id] = (counts[rule.id] ?? 0) + matches.length;
  }

  if (mutated !== original) {
    if (!dryRun) {
      await ensureDirectory(filePath);
      await writeFile(filePath, mutated, 'utf8');
    }
    return { counts, modified: true };
  }

  return { counts: {}, modified: false };
}

async function buildSummary(
  files: string[],
  brand: BrandMetadata,
  rules: readonly ReplacementRule[],
  dryRun: boolean,
): Promise<RebrandSummary> {
  let filesModified = 0;
  const aggregate: Record<string, number> = {};

  for (const file of files) {
    const { modified, counts } = await applyReplacements(file, brand, rules, dryRun);
    if (!modified) continue;

    filesModified += 1;
    for (const [ruleId, count] of Object.entries(counts)) {
      aggregate[ruleId] = (aggregate[ruleId] ?? 0) + count;
    }
  }

  return {
    dryRun,
    filesModified,
    filesScanned: files.length,
    replacements: aggregate,
  };
}

function parseBrandOverridesFromArgs(): {
  brand: BrandMetadata;
  dryRun: boolean;
  mode: ScriptMode;
  verbose: boolean;
  workspace: string;
} {
  const { values } = parseArgs({
    options: {
      'asset-banner': { type: 'string' },
      'asset-favicon': { type: 'string' },
      'asset-logo': { type: 'string' },
      'asset-wordmark': { type: 'string' },
      'brand-domain': { type: 'string' },
      'brand-name': { type: 'string' },
      'brand-short-name': { type: 'string' },
      'cdn-domain': { type: 'string' },
      'contact-discord': { type: 'string' },
      'contact-email': { type: 'string' },
      'contact-telegram': { type: 'string' },
      'contact-website': { type: 'string' },
      'dry-run': { default: false, type: 'boolean' },
      'metadata-file': { type: 'string' },
      'mode': { type: 'string' },
      'organization-domain': { type: 'string' },
      'organization-name': { type: 'string' },
      'repository-host': { type: 'string' },
      'repository-name': { type: 'string' },
      'repository-owner': { type: 'string' },
      'support-email': { type: 'string' },
      'support-url': { type: 'string' },
      'theme-token-prefix': { type: 'string' },
      'verbose': { default: false, type: 'boolean' },
      'workspace': { type: 'string' },
    },
  });

  let overrides: BrandOverrides = {};

  const metadataFile = values['metadata-file'] as string | undefined;

  if (metadataFile) {
    const metadataPath = resolve(process.cwd(), metadataFile);
    overrides = JSON.parse(readFileSync(metadataPath, 'utf8')) as BrandOverrides;
  }

  const metadataBrand = mergeBrandMetadata(DEFAULT_BRAND, overrides);

  const contactOverrides: Partial<Mutable<BrandMetadata['contact']>> = {};
  const contactEmail =
    (values['contact-email'] as string | undefined) ??
    (values['support-email'] as string | undefined);
  if (contactEmail) {
    contactOverrides.email = contactEmail;
  }
  const contactDiscord = values['contact-discord'] as string | undefined;
  if (contactDiscord) contactOverrides.discord = contactDiscord;
  const contactTelegram = values['contact-telegram'] as string | undefined;
  if (contactTelegram) contactOverrides.telegram = contactTelegram;
  const contactWebsite = values['contact-website'] as string | undefined;
  if (contactWebsite) contactOverrides.website = contactWebsite;

  const assetOverrides: Partial<Mutable<BrandMetadata['assets']>> = {};
  const assetLogo = values['asset-logo'] as string | undefined;
  if (assetLogo) assetOverrides.logo = assetLogo;
  const assetFavicon = values['asset-favicon'] as string | undefined;
  if (assetFavicon) assetOverrides.favicon = assetFavicon;
  const assetWordmark = values['asset-wordmark'] as string | undefined;
  if (assetWordmark) assetOverrides.wordmark = assetWordmark;
  const assetBanner = values['asset-banner'] as string | undefined;
  if (assetBanner) assetOverrides.banner = assetBanner;

  const organizationOverrides: Partial<Mutable<NonNullable<BrandMetadata['organization']>>> = {};
  const organizationName = values['organization-name'] as string | undefined;
  if (organizationName) organizationOverrides.name = organizationName;
  const organizationDomain = values['organization-domain'] as string | undefined;
  if (organizationDomain) organizationOverrides.domain = organizationDomain;

  const repositoryOverrides: Partial<Mutable<NonNullable<BrandMetadata['repository']>>> = {};
  const repositoryHost = values['repository-host'] as string | undefined;
  if (repositoryHost) repositoryOverrides.host = repositoryHost;
  const repositoryOwner = values['repository-owner'] as string | undefined;
  if (repositoryOwner) repositoryOverrides.owner = repositoryOwner;
  const repositoryName = values['repository-name'] as string | undefined;
  if (repositoryName) repositoryOverrides.name = repositoryName;

  const cliOverrides: BrandOverrides = {};
  const brandName = values['brand-name'] as string | undefined;
  const brandShortName = values['brand-short-name'] as string | undefined;
  const brandDomain = values['brand-domain'] as string | undefined;
  const cdnDomain = values['cdn-domain'] as string | undefined;
  const supportEmail = values['support-email'] as string | undefined;
  const supportUrl = values['support-url'] as string | undefined;
  const themeTokenPrefix = values['theme-token-prefix'] as string | undefined;

  if (brandName) cliOverrides.name = brandName;
  if (brandShortName || brandName) cliOverrides.shortName = brandShortName ?? brandName;
  if (brandDomain) cliOverrides.domain = brandDomain;
  if (cdnDomain) cliOverrides.cdnDomain = cdnDomain;
  if (supportEmail) cliOverrides.supportEmail = supportEmail;
  if (supportUrl) cliOverrides.supportUrl = supportUrl;
  if (themeTokenPrefix) cliOverrides.tokens = { themePrefix: themeTokenPrefix };
  if (Object.keys(organizationOverrides).length) {
    const existingOrganization = metadataBrand.organization;
    const baseOrganization = existingOrganization
      ? { domain: existingOrganization.domain, name: existingOrganization.name }
      : { domain: undefined, name: metadataBrand.name };
    const name = organizationOverrides.name ?? baseOrganization.name;
    if (!name) {
      throw new Error('Organization name is required when overriding organization metadata.');
    }
    cliOverrides.organization = {
      domain: organizationOverrides.domain ?? baseOrganization.domain,
      name,
    };
  }

  if (Object.keys(repositoryOverrides).length) {
    const baseRepository = metadataBrand.repository ?? DEFAULT_BRAND.repository;
    const ownerFallback =
      repositoryOverrides.owner ??
      baseRepository?.owner ??
      (metadataBrand.organization?.name ?? metadataBrand.name)
        .toLowerCase()
        .replaceAll(/\s+/g, '-');
    const nameFallback =
      repositoryOverrides.name ??
      baseRepository?.name ??
      metadataBrand.name.toLowerCase().replaceAll(/\s+/g, '-');
    cliOverrides.repository = {
      host: repositoryOverrides.host ?? baseRepository?.host ?? 'github.com',
      name: nameFallback,
      owner: ownerFallback,
    };
  }

  if (Object.keys(contactOverrides).length) {
    cliOverrides.contact = {
      discord: contactOverrides.discord ?? metadataBrand.contact.discord,
      email: contactOverrides.email ?? metadataBrand.contact.email,
      telegram: contactOverrides.telegram ?? metadataBrand.contact.telegram,
      website: contactOverrides.website ?? metadataBrand.contact.website,
    };
  }

  if (Object.keys(assetOverrides).length) {
    cliOverrides.assets = {
      banner: assetOverrides.banner ?? metadataBrand.assets.banner,
      favicon: assetOverrides.favicon ?? metadataBrand.assets.favicon,
      logo: assetOverrides.logo ?? metadataBrand.assets.logo,
      wordmark: assetOverrides.wordmark ?? metadataBrand.assets.wordmark,
    };
  }

  const brand = mergeBrandMetadata(metadataBrand, cliOverrides);

  const modeInput = values.mode as string | undefined;
  const allowedModes: ScriptMode[] = ['apply', 'lint-strings', 'validate'];
  const mode = modeInput
    ? allowedModes.includes(modeInput as ScriptMode)
      ? (modeInput as ScriptMode)
      : undefined
    : 'apply';
  if (!mode) {
    throw new Error(
      `Invalid mode "${modeInput}" supplied. Supported modes: ${allowedModes.join(', ')}.`,
    );
  }

  if (!brand.name || !brand.domain || !brand.supportEmail || !brand.supportUrl) {
    throw new Error(
      'Brand metadata is incomplete. Ensure name, domain, supportEmail, and supportUrl are provided.',
    );
  }

  const workspace = values.workspace
    ? resolve(process.cwd(), values.workspace as string)
    : process.cwd();

  return {
    brand,
    dryRun: Boolean(values['dry-run']),
    mode,
    verbose: Boolean(values.verbose),
    workspace,
  };
}

async function collectTargetFiles(workspace: string): Promise<string[]> {
  const pattern = '**/*';
  const absoluteWorkspace = resolve(workspace);
  const entries = await glob(pattern, {
    absolute: true,
    cwd: absoluteWorkspace,
    ignore: DEFAULT_IGNORE,
    nodir: true,
  });

  return entries;
}

async function runQualityChecks(mode: ScriptMode): Promise<void> {
  logger.start(`Executing Hermes theme persistence checks for mode: ${mode}`);

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(
      'bunx',
      ['vitest', 'run', '--silent=passed-only', 'tests/unit/themeCookies.test.tsx'],
      {
        stdio: 'inherit',
      },
    );

    child.on('exit', (code) => {
      if (code === 0) {
        logger.success('Theme cookie regression tests passed.');
        resolvePromise();
      } else {
        rejectPromise(new Error(`Vitest exited with status ${code ?? 'unknown'}.`));
      }
    });

    child.on('error', (error) => {
      rejectPromise(error);
    });
  });
}

async function run(): Promise<void> {
  const {
    brand,
    dryRun: requestedDryRun,
    mode,
    workspace,
    verbose,
  } = parseBrandOverridesFromArgs();

  const dryRun = mode === 'lint-strings' ? true : requestedDryRun;
  const forcedDryRun = mode === 'lint-strings' && !requestedDryRun;

  if (verbose) {
    consola.level = 4;
  }

  const start = performance.now();
  logger.start(`Starting Hermes Chat rebranding for workspace: ${workspace}`);

  try {
    await stat(workspace);
  } catch {
    logger.error(`Workspace does not exist: ${workspace}`);
    process.exitCode = 1;
    return;
  }

  const files = await collectTargetFiles(workspace);
  const summary = await buildSummary(files, brand, REBRANDING_RULES, dryRun);

  const durationMs = performance.now() - start;

  if (summary.filesModified === 0) {
    logger.info('No files required updates for the provided mapping.');
  } else if (dryRun) {
    logger.info(`Dry run complete: ${summary.filesModified} files would be updated.`);
  } else {
    logger.success(
      `Updated ${summary.filesModified} files across ${Object.values(summary.replacements).reduce((a, b) => a + b, 0)} replacements.`,
    );
  }

  if (forcedDryRun) {
    logger.info('lint-strings mode enforces dry-run execution to guarantee safety.');
  }

  logger.info('Replacement breakdown by rule:');
  for (const rule of REBRANDING_RULES) {
    const count = summary.replacements[rule.id] ?? 0;
    logger.info(` • ${rule.id}: ${count}`);
  }
  logger.info(`Replacement audit payload=${JSON.stringify(summary.replacements)}`);

  logger.info(`Processed ${summary.filesScanned} files in ${(durationMs / 1000).toFixed(2)}s.`);

  if (dryRun) {
    logger.warn('Dry run was enabled; rerun without --dry-run to persist changes.');
  }

  if (mode === 'lint-strings' || mode === 'validate') {
    await runQualityChecks(mode);
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await -- tsx currently transpiles to CJS, so top-level await is unsupported.
run().catch((error) => {
  logger.error('Rebranding script failed:', error);
  process.exitCode = 1;
});
