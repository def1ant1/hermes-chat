import { HERMES_DOMAIN_REDIRECT_FLAG } from '@/const/featureFlags';

export type LegacyHostCategory = 'marketing' | 'app';

export interface HermesDomainRedirectRule {
  readonly analytics: Readonly<Record<string, string>>;
  readonly category: LegacyHostCategory;
  readonly destinationHost: string;
  readonly destinationPath: string;
  readonly legacyHost: string;
  readonly legacyPath: string;
  readonly permanent: boolean;
  readonly tags: readonly string[];
}

const MARKETING_LEGACY_HOSTS = Object.freeze<readonly string[]>([
  'lobe.chat',
  'www.lobe.chat',
  'legacy.lobe.chat',
  'hermes.lobe.chat',
]);

const APP_LEGACY_HOSTS = Object.freeze<readonly string[]>([
  'app.lobe.chat',
  'beta.lobe.chat',
  'chat.lobe.chat',
  'console.lobe.chat',
]);

const DESTINATION_BY_CATEGORY: Record<LegacyHostCategory, string> = {
  app: 'app.hermes.chat',
  marketing: 'hermes.chat',
};

const COMMON_ANALYTICS_PARAMETERS = Object.freeze({
  utm_campaign: 'hermes-domain-cutover',
  utm_medium: 'edge-redirect',
  utm_source: 'legacy-host',
});

export const HERMES_DOMAIN_REDIRECT_ANALYTICS_PARAMS = COMMON_ANALYTICS_PARAMETERS;

const MARKETING_PATH_MAPPINGS = Object.freeze<readonly { from: string; to: string }[]>([
  { from: '/', to: '/' },
  { from: '/pricing', to: '/pricing' },
  { from: '/pricing/enterprise', to: '/pricing/enterprise' },
  { from: '/pricing/startups', to: '/pricing/startups' },
  { from: '/enterprise', to: '/enterprise' },
  { from: '/solutions', to: '/solutions' },
  { from: '/solutions/compliance', to: '/solutions/compliance' },
  { from: '/solutions/support', to: '/solutions/support' },
  { from: '/solutions/automation', to: '/solutions/automation' },
  { from: '/solutions/multilingual', to: '/solutions/multilingual' },
  { from: '/blog', to: '/blog' },
  { from: '/blog/hermes-chat-launch', to: '/blog/hermes-chat-launch' },
  { from: '/blog/security', to: '/blog/security' },
  { from: '/resources', to: '/resources' },
  { from: '/resources/webinars', to: '/resources/webinars' },
  { from: '/resources/whitepapers', to: '/resources/whitepapers' },
  { from: '/docs', to: '/docs' },
  { from: '/docs/changelog', to: '/docs/changelog' },
  { from: '/docs/security', to: '/docs/security' },
  { from: '/docs/privacy', to: '/docs/privacy' },
  { from: '/docs/faq', to: '/docs/faq' },
  { from: '/support', to: '/support' },
  { from: '/support/contact', to: '/support/contact' },
  { from: '/status', to: '/status' },
  { from: '/legal/terms', to: '/legal/terms' },
]);

const APP_PATH_MAPPINGS = Object.freeze<readonly { from: string; to: string }[]>([
  { from: '/', to: '/' },
  { from: '/chat', to: '/chat' },
  { from: '/chat/new', to: '/chat/new' },
  { from: '/chat/history', to: '/chat/history' },
  { from: '/discover', to: '/discover' },
  { from: '/discover/agents', to: '/discover/agents' },
  { from: '/discover/prompts', to: '/discover/prompts' },
  { from: '/discover/workflows', to: '/discover/workflows' },
  { from: '/market', to: '/market' },
  { from: '/market/plugins', to: '/market/plugins' },
  { from: '/market/models', to: '/market/models' },
  { from: '/market/knowledge', to: '/market/knowledge' },
  { from: '/settings', to: '/settings' },
  { from: '/settings/profile', to: '/settings/profile' },
  { from: '/settings/security', to: '/settings/security' },
  { from: '/settings/appearance', to: '/settings/appearance' },
  { from: '/settings/preferences', to: '/settings/preferences' },
  { from: '/settings/notifications', to: '/settings/notifications' },
  { from: '/settings/billing', to: '/settings/billing' },
  { from: '/settings/connections', to: '/settings/connections' },
  { from: '/settings/workspace', to: '/settings/workspace' },
  { from: '/files', to: '/files' },
  { from: '/files/uploads', to: '/files/uploads' },
  { from: '/files/shared', to: '/files/shared' },
  { from: '/image', to: '/image' },
]);

const normalizeRedirectPath = (value: string): string => {
  if (!value) return '/';
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '/';
  const ensured = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const sanitized = ensured.replace(/\/+$/, '');
  return sanitized || '/';
};

const createLegacyRedirectKey = (host: string, path: string) => `${host.toLowerCase()}::${normalizeRedirectPath(path)}`;

const createRules = (
  category: LegacyHostCategory,
  hosts: readonly string[],
  mappings: readonly { from: string; to: string }[],
): HermesDomainRedirectRule[] => {
  const destinationHost = DESTINATION_BY_CATEGORY[category];

  return hosts.flatMap((host) =>
    mappings.map(({ from, to }) =>
      Object.freeze({
        analytics: COMMON_ANALYTICS_PARAMETERS,
        category,
        destinationHost,
        destinationPath: to,
        legacyHost: host.toLowerCase(),
        legacyPath: normalizeRedirectPath(from),
        permanent: true,
        tags: Object.freeze(['hermes-domain-cutover', category, HERMES_DOMAIN_REDIRECT_FLAG]),
      }),
    ),
  );
};

const HERMES_DOMAIN_REDIRECT_RULES_INTERNAL = Object.freeze([
  ...createRules('marketing', MARKETING_LEGACY_HOSTS, MARKETING_PATH_MAPPINGS),
  ...createRules('app', APP_LEGACY_HOSTS, APP_PATH_MAPPINGS),
]);

export const HERMES_DOMAIN_REDIRECT_RULES = HERMES_DOMAIN_REDIRECT_RULES_INTERNAL;

export const HERMES_DOMAIN_REDIRECT_TOTAL = HERMES_DOMAIN_REDIRECT_RULES_INTERNAL.length;

const REDIRECT_LOOKUP = new Map<string, HermesDomainRedirectRule>(
  HERMES_DOMAIN_REDIRECT_RULES_INTERNAL.map((rule) => [
    createLegacyRedirectKey(rule.legacyHost, rule.legacyPath),
    rule,
  ]),
);

export const HERMES_DOMAIN_LEGACY_HOSTS = Object.freeze(
  new Set([...MARKETING_LEGACY_HOSTS, ...APP_LEGACY_HOSTS].map((host) => host.toLowerCase())),
);

export const resolveHermesRedirectRule = (
  host: string | null,
  path: string,
): HermesDomainRedirectRule | null => {
  if (!host) return null;

  const normalizedHost = host.toLowerCase();
  if (!HERMES_DOMAIN_LEGACY_HOSTS.has(normalizedHost)) return null;

  const normalizedPath = normalizeRedirectPath(path);
  const directKey = createLegacyRedirectKey(normalizedHost, normalizedPath);
  const directMatch = REDIRECT_LOOKUP.get(directKey);
  if (directMatch) return directMatch;

  if (normalizedPath !== '/') {
    const fallbackKey = createLegacyRedirectKey(normalizedHost, '/');
    return REDIRECT_LOOKUP.get(fallbackKey) ?? null;
  }

  return null;
};
