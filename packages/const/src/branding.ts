// Hermes Chat brand metadata was confirmed with Hermes Labs' GTM and Support
// leads on 2025-01-14 (Slack thread #brand-refresh). Keeping the values here
// ensures downstream services can audit which identifiers were approved.

/**
 * Canonical display name for the managed Hermes deployment. Refer to this constant whenever
 * emitting UX copy or telemetry that differentiates the fully-managed cloud from self-hosted
 * footprints so that enterprise automation keeps a single source of truth.
 */
export const HERMES_CHAT_CLOUD = 'Hermes Chat Cloud';

/**
 * @deprecated Prefer {@link HERMES_CHAT_CLOUD}. This alias keeps legacy extension surfaces and
 * downstream SDKs functioning while we broadcast the rename. The migration window closes after
 * the 2025-09-30 LTS cut (tracked in OPS-1120), at which point the alias will be removed. Until
 * then, our automation keeps dual-emitting to avoid breaking consumers that have not yet pulled
 * the Hermes-ready packages.
 */
// TODO(OPS-1120): Delete once every managed extension acknowledges HERMES_CHAT_CLOUD; the alias is
// purposefully exported to guarantee TypeScript still surfaces deprecation warnings in the interim.
export const LOBE_CHAT_CLOUD = HERMES_CHAT_CLOUD;

// Hermes Chat always renders the customer-facing product name; leverage this
// constant so the entire surface area stays consistent during future refreshes.
export const BRANDING_NAME = 'Hermes Chat';
// Centralized CDN logo reference keeps marketing assets versioned and cached.
export const BRANDING_LOGO_URL = 'https://cdn.hermes.chat/assets/logos/hermes-chat-icon.svg';

export const ORG_NAME = 'Hermes Labs';

export const BRANDING_URL = {
  help: 'https://support.hermes.chat',
  privacy: 'https://hermes.chat/privacy',
  terms: 'https://hermes.chat/terms',
};

export const SOCIAL_URL = {
  discord: 'https://discord.gg/hermes-chat',
  github: 'https://github.com/hermes-chat',
  medium: 'https://medium.com/@hermeslabs',
  x: 'https://x.com/hermeslabs',
  youtube: 'https://www.youtube.com/@hermeslabs',
};

export const BRANDING_EMAIL = {
  business: 'hello@hermes.chat',
  support: 'support@hermes.chat',
};

export const SOCIAL_HANDLE = {
  x: '@hermeslabs',
};
