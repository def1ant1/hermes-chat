import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST as casdoorPost } from '@/app/(backend)/api/webhooks/casdoor/route';
import { POST as logtoPost } from '@/app/(backend)/api/webhooks/logto/route';
import { HERMES_OAUTH_BRAND_KEY } from '@/const/app';
import { ssoProviders } from '@/libs/next-auth/sso-providers';

vi.mock('@/envs/auth', () => ({
  authEnv: {
    CASDOOR_WEBHOOK_SECRET: 'test-secret',
    LOGTO_WEBHOOK_SIGNING_KEY: 'test-signing',
  },
}));

const { mockValidateLogto, mockValidateCasdoor, mockUserService } = vi.hoisted(() => ({
  mockUserService: {
    safeSignOutUser: vi.fn(),
    safeUpdateUser: vi.fn(),
  },
  mockValidateCasdoor: vi.fn(),
  mockValidateLogto: vi.fn(),
}));

vi.mock('@/app/(backend)/api/webhooks/logto/validateRequest', () => ({
  validateRequest: mockValidateLogto,
}));

vi.mock('@/app/(backend)/api/webhooks/casdoor/validateRequest', () => ({
  validateRequest: mockValidateCasdoor,
}));
vi.mock('@/server/services/nextAuthUser', () => ({
  NextAuthUserService: vi.fn(() => mockUserService),
}));

describe('webhook + OAuth brand contract', () => {
  beforeEach(() => {
    mockValidateLogto.mockReset();
    mockValidateCasdoor.mockReset();
    mockUserService.safeUpdateUser.mockReset();
    mockUserService.safeSignOutUser.mockReset();
  });

  it('adds Hermes brand metadata when logto signature validation fails', async () => {
    mockValidateLogto.mockResolvedValueOnce(null);

    const response = await logtoPost(
      new Request('https://example.com/api/webhooks/logto', { body: '{}', method: 'POST' }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ brand: HERMES_OAUTH_BRAND_KEY });
  });

  it('includes brand on unsupported logto events', async () => {
    mockValidateLogto.mockResolvedValueOnce({ data: {}, event: 'Unsupported.Event' });

    const response = await logtoPost(
      new Request('https://example.com/api/webhooks/logto', { body: '{}', method: 'POST' }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ brand: HERMES_OAUTH_BRAND_KEY });
  });

  it('adds Hermes brand metadata when casdoor validation fails', async () => {
    mockValidateCasdoor.mockResolvedValueOnce(null);

    const response = await casdoorPost(
      new Request('https://example.com/api/webhooks/casdoor', { body: '{}', method: 'POST' }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ brand: HERMES_OAUTH_BRAND_KEY });
  });

  it('exposes Hermes brand identifier on every SSO provider descriptor', () => {
    const providerBrands = new Set(ssoProviders.map((descriptor) => descriptor.brand));

    expect(providerBrands).toEqual(new Set([HERMES_OAUTH_BRAND_KEY]));
  });
});
