import { describe, expect, it } from 'vitest';

import {
  HERMES_DOMAIN_REDIRECT_ANALYTICS_PARAMS,
  HERMES_DOMAIN_REDIRECT_RULES,
  HERMES_DOMAIN_REDIRECT_TOTAL,
  resolveHermesRedirectRule,
} from '@/config/redirects/hermesDomains';

describe('Hermes legacy domain redirects', () => {
  it('catalogues exactly 200 redirect permutations', () => {
    expect(HERMES_DOMAIN_REDIRECT_TOTAL).toBe(200);
    expect(HERMES_DOMAIN_REDIRECT_RULES).toHaveLength(200);
  });

  it('maps marketing hosts to hermes.chat destinations with analytics tagging', () => {
    const rule = resolveHermesRedirectRule('lobe.chat', '/blog');

    expect(rule).toBeTruthy();
    expect(rule?.destinationHost).toBe('hermes.chat');
    expect(rule?.analytics).toEqual(HERMES_DOMAIN_REDIRECT_ANALYTICS_PARAMS);
    expect(rule?.permanent).toBe(true);
  });

  it('maps application hosts to app.hermes.chat', () => {
    const rule = resolveHermesRedirectRule('app.lobe.chat', '/settings/security');

    expect(rule).toBeTruthy();
    expect(rule?.destinationHost).toBe('app.hermes.chat');
    expect(rule?.destinationPath).toBe('/settings/security');
  });

  it('falls back to root redirect when path is not enumerated', () => {
    const rule = resolveHermesRedirectRule('www.lobe.chat', '/not-a-known-path');

    expect(rule).toBeTruthy();
    expect(rule?.destinationPath).toBe('/');
  });

  it('ignores non-legacy hosts', () => {
    const rule = resolveHermesRedirectRule('localhost:3000', '/');

    expect(rule).toBeNull();
  });
});
