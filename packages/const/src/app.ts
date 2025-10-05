/**
 * Canonical Hermes Chat application metadata.
 *
 * Governance notes:
 * - 2025-01-21: Hermes Labs brand council ratified the "hermes-chat" slug for
 *   OAuth scopes and webhook auditing (Notion doc BRD-221) to guarantee every
 *   integration advertises the same identifier across cloud, desktop, and
 *   self-hosted installs.
 * - 2025-01-22: Support, Customer Success, and Trust & Safety agreed to publish
 *   a single support escalation matrix so automated notices can default to
 *   Hermes-managed channels even when partners omit overrides.
 *
 * The constants below should be the first import when rendering user-facing or
 * machine-consumed metadata. Downstream code may override these values (for
 * whitelabel builds, test fixtures, etc.), but automation is expected to fall
 * back to this module when an override is missing.
 */

/** Machine-safe product identifier used in OAuth client metadata and webhooks. */
export const HERMES_PRODUCT_SLUG = 'hermes-chat';

/**
 * Public-facing headline used across marketing surfaces.
 *
 * The language mirrors the launch copy approved by GTM leadership on
 * 2025-01-20 and intentionally emphasises automation and governance to align
 * with enterprise positioning.
 */
export const HERMES_PRODUCT_TAGLINE =
  'Enterprise-grade AI workspace with governed automations and zero-trust sync.';

/**
 * Structured support channel definitions surfaced in docs and default email
 * fallbacks. When downstream configuration omits a field the consuming layer
 * must fall back to the relevant entry here.
 */
export interface HermesSupportContacts {
  /** Optional synchronous chat community for quick feedback loops. */
  readonly community?: string;
  /** Primary inbox for customer escalations. */
  readonly email: string;
  /** Dedicated channel for on-call/security alerts. */
  readonly security: string;
  /** Public status or knowledge base landing page. */
  readonly statusPage: string;
}

export const HERMES_SUPPORT_CONTACTS: HermesSupportContacts = {
  community: 'https://discord.gg/hermeschat',
  email: 'support@hermes.chat',
  security: 'security@hermes.chat',
  statusPage: 'https://status.hermes.chat',
};

/**
 * Shared OAuth/webhook brand key recognised by third-party platforms.
 *
 * Webhooks and OAuth callbacks must always emit this value unless a
 * multi-tenant override is explicitly provided. Integrations that cannot set a
 * custom brand identifier should pass this constant through directly so
 * downstream analytics can aggregate usage accurately.
 */
export const HERMES_OAUTH_BRAND_KEY = HERMES_PRODUCT_SLUG;

/**
 * Fallback precedence for customer communication. When a property is undefined
 * (for example, a customer-managed tenant strips the `community` link), the
 * automation pipeline walks this ordered list and chooses the first reachable
 * channel. This ensures operators always have a deterministic backup path.
 */
export const HERMES_SUPPORT_FALLBACK_ORDER: ReadonlyArray<keyof HermesSupportContacts> = [
  'email',
  'statusPage',
  'security',
  'community',
];

/**
 * Canonical identifiers and URLs for the managed Hermes Cloud provider.
 *
 * These values were ratified by the Hermes Labs product and brand council on
 * 2025-02-17 to guarantee every Discover surface, automation fixture, and
 * customer support touchpoint uses the same slug and primary marketing URLs.
 */
export const HERMES_CLOUD_PROVIDER_ID = 'hermescloud';
export const HERMES_CLOUD_PROVIDER_NAME = 'Hermes Cloud';
export const HERMES_CLOUD_PROVIDER_URL = 'https://cloud.hermes.chat';
export const HERMES_CLOUD_PROVIDER_PRICING_URL = 'https://cloud.hermes.chat/pricing';
export const HERMES_CLOUD_PROVIDER_DOCS_URL = 'https://cloud.hermes.chat/docs/models';

/**
 * Legacy identifiers the Discover data pipeline may continue to emit until the
 * 2025-06-30 cleanup milestone completes. Kept frozen to discourage mutation.
 */
export const LEGACY_LOBEHUB_PROVIDER_IDS = Object.freeze(['lobehub'] as const);

/**
 * @deprecated Prefer {@link HERMES_CLOUD_PROVIDER_ID}. Remove once
 * Discover+CLI fixtures finish emitting the legacy slug (target 2025-06-30).
 */
export const LOBEHUB_PROVIDER_ID: typeof HERMES_CLOUD_PROVIDER_ID = HERMES_CLOUD_PROVIDER_ID;

type LegacyLobeHubProviderId = (typeof LEGACY_LOBEHUB_PROVIDER_IDS)[number];

const LEGACY_LOBEHUB_PROVIDER_ID_LIST = LEGACY_LOBEHUB_PROVIDER_IDS as readonly string[];

export const isHermesCloudProviderId = (
  candidate: string,
): candidate is typeof HERMES_CLOUD_PROVIDER_ID | LegacyLobeHubProviderId =>
  candidate === HERMES_CLOUD_PROVIDER_ID || LEGACY_LOBEHUB_PROVIDER_ID_LIST.includes(candidate);

export const normalizeHermesCloudProviderId = (candidate: string): string =>
  isHermesCloudProviderId(candidate) ? HERMES_CLOUD_PROVIDER_ID : candidate;
