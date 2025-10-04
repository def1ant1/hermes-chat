// Hermes Chat brand metadata was confirmed with Hermes Labs' GTM and Support
// leads on 2025-01-14 (Slack thread #brand-refresh). Keeping the values here
// ensures downstream services can audit which identifiers were approved.

export const LOBE_CHAT_CLOUD = 'Hermes Chat Cloud';

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
