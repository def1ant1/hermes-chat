import { describe, expect, it } from 'vitest';

import Ai302 from '../ai302';
import AiHubMix from '../aihubmix';
import OpenAI from '../openai';
import PPIO from '../ppio';

const HERMES_REFERRAL_HOST = 'go.hermes.chat';

function assertHermesReferral(url: string, slug: string): URL {
  const parsed = new URL(url);

  expect(parsed.hostname).toBe(HERMES_REFERRAL_HOST);
  expect(parsed.pathname.startsWith('/r/')).toBe(true);
  expect(parsed.searchParams.get('utm_source')).toBe('hermes-chat');
  expect(parsed.searchParams.get('utm_medium')).toBe('app_referral');
  expect(parsed.searchParams.get('utm_campaign')).toBe('model_provider');
  expect(parsed.searchParams.get('utm_content')).toBe(slug);

  return parsed;
}

describe('model provider referral links', () => {
  it('emits Hermes shortlinks for OpenAI', () => {
    const parsed = assertHermesReferral(OpenAI.apiKeyUrl!, 'openai');

    expect(parsed.pathname).toBe('/r/openai-api-keys');
  });

  it('emits Hermes shortlinks for AiHubMix', () => {
    const apiKeys = assertHermesReferral(AiHubMix.apiKeyUrl!, 'aihubmix');
    const landing = assertHermesReferral(AiHubMix.url!, 'aihubmix');

    expect(apiKeys.pathname).toBe('/r/aihubmix-api-keys');
    expect(landing.pathname).toBe('/r/aihubmix');
  });

  it('emits Hermes shortlinks for 302.AI', () => {
    const parsed = assertHermesReferral(Ai302.apiKeyUrl!, 'ai302');

    expect(parsed.pathname).toBe('/r/ai302-api-keys');
  });

  it('emits Hermes shortlinks for PPIO and preserves invite tracking', () => {
    const models = assertHermesReferral(PPIO.modelsUrl!, 'ppio');
    const signup = assertHermesReferral(PPIO.url!, 'ppio');

    expect(models.pathname).toBe('/r/ppio-models');
    expect(signup.pathname).toBe('/r/ppio-signup');
    expect(signup.searchParams.get('invited_by')).toBe('RQIMOC');
  });
});
