import { ModelProviderCard } from '@/types/llm';

/**
 * Default host for Hermes-branded referral deep links.
 */
export const HERMES_REFERRAL_HOST = 'https://go.hermes.chat';

/**
 * Canonical tracking taxonomy endorsed by Growth on 2025-02-18 for all
 * in-product provider referrals. Aligning the defaults here keeps every card
 * emitting consistent metrics without manual spreadsheet updates.
 */
export const HERMES_REFERRAL_UTM = {
  campaign: 'model_provider',
  medium: 'app_referral',
  source: 'hermes-chat',
} as const;

export interface HermesReferralOptions {
  /**
   * Optional destination override. When omitted we use the slug directly.
   */
  readonly destination?: string;
  /**
   * Additional query parameters that must survive the redirect (e.g., partner
   * invite codes, analytics flags).
   */
  readonly extraParams?: Record<string, string>;
  /**
   * Provider slug used for attribution and as the default path segment.
   */
  readonly slug: ModelProviderCard['id'];
}

function toPathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^\da-z]+/g, '-');
}

/**
 * Builds a Hermes referral deep link that funnels through the Growth-owned go
 * service. Centralising this logic ensures all provider cards emit the same
 * tracking story while still supporting provider-specific partner parameters.
 */
export const buildHermesReferralUrl = ({
  destination,
  extraParams,
  slug,
}: HermesReferralOptions): string => {
  const pathSegment = destination ? toPathSegment(destination) : toPathSegment(slug);
  const url = new URL(`/r/${pathSegment}`, HERMES_REFERRAL_HOST);

  // Growth specifically asked that we stamp the provider slug into utm_content
  // so downstream dashboards can pivot by provider without custom Looker views.
  url.searchParams.set('utm_source', HERMES_REFERRAL_UTM.source);
  url.searchParams.set('utm_medium', HERMES_REFERRAL_UTM.medium);
  url.searchParams.set('utm_campaign', HERMES_REFERRAL_UTM.campaign);
  url.searchParams.set('utm_content', toPathSegment(slug));

  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
};
