import { describe, expect, it } from 'vitest';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import HermesCloudProviderCard from '@/config/modelProviders/hermescloud';
import {
  HERMES_CLOUD_PROVIDER_DOCS_URL,
  HERMES_CLOUD_PROVIDER_ID,
  HERMES_CLOUD_PROVIDER_NAME,
  HERMES_CLOUD_PROVIDER_PRICING_URL,
  HERMES_CLOUD_PROVIDER_URL,
  LEGACY_LOBEHUB_PROVIDER_IDS,
  isHermesCloudProviderId,
  normalizeHermesCloudProviderId,
} from '@/const/app';

describe('discover provider branding', () => {
  it('exposes the canonical Hermes Cloud provider metadata', () => {
    expect(HermesCloudProviderCard).toMatchObject({
      id: HERMES_CLOUD_PROVIDER_ID,
      name: HERMES_CLOUD_PROVIDER_NAME,
      modelsUrl: HERMES_CLOUD_PROVIDER_PRICING_URL,
      url: HERMES_CLOUD_PROVIDER_URL,
    });
    expect(HERMES_CLOUD_PROVIDER_DOCS_URL).toContain('hermes.chat');
  });

  it('normalizes legacy LobeHub identifiers emitted by upstream services', () => {
    expect(isHermesCloudProviderId(HERMES_CLOUD_PROVIDER_ID)).toBe(true);
    for (const legacyId of LEGACY_LOBEHUB_PROVIDER_IDS) {
      expect(isHermesCloudProviderId(legacyId)).toBe(true);
      expect(normalizeHermesCloudProviderId(legacyId)).toBe(HERMES_CLOUD_PROVIDER_ID);
    }
  });

  it('omits the legacy slug from Discover provider tables', () => {
    const providerIds = DEFAULT_MODEL_PROVIDER_LIST.map((provider) => provider.id);
    expect(providerIds).not.toContain('lobehub');
  });
});
