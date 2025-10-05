import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import AuthErrorPage from '@/app/[variants]/(auth)/next-auth/error/AuthErrorPage';

const mockErrorCapture = vi.hoisted(() => vi.fn(() => <div data-testid="hermes-auth-error" />));
vi.mock('@/components/Error', () => ({
  __esModule: true,
  default: mockErrorCapture,
}));

const mockSignIn = vi.hoisted(() => vi.fn());
vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

const searchParamsGet = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: searchParamsGet,
  }),
}));

describe('AuthErrorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const cases: Array<{
    readonly cause: string | null;
    readonly expectedPath: string;
  }> = [
    { cause: 'Configuration', expectedPath: '/self-hosting/advanced/authentication' },
    { cause: 'AccessDenied', expectedPath: '/platform/authentication/errors#access-denied' },
    { cause: 'Verification', expectedPath: '/platform/authentication/errors#verification' },
    { cause: null, expectedPath: '/platform/authentication/errors' },
  ];

  test.each(cases)(
    'injects Hermes documentation links for %s errors',
    ({ cause, expectedPath }) => {
      searchParamsGet.mockReturnValueOnce(cause);

      render(<AuthErrorPage />);

      expect(mockErrorCapture).toHaveBeenCalledTimes(1);
      expect(mockErrorCapture.mock.calls.length).toBeGreaterThan(0);
      const firstCall = mockErrorCapture.mock.calls[0] as unknown as [
        { error: { message: string; name: string } },
      ];
      const [props] = firstCall;
      expect(props.error.message).toContain('https://docs.hermes.chat');
      expect(props.error.message).toContain('https://docs.hermes.chat/zh-cn');
      expect(props.error.message).toContain(expectedPath);
      expect(props.error.message).toContain('support@hermes.chat');
      expect(props.error.name).toBe('NextAuth Error');
    },
  );
});
