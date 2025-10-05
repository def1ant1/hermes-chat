import { render, waitFor } from '@testing-library/react';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  HERMES_THEME_APPEARANCE,
  HERMES_THEME_NEUTRAL_COLOR,
  HERMES_THEME_PRIMARY_COLOR,
} from '@/const/theme';
import AppTheme from '@/layout/GlobalProvider/AppTheme';
import middleware from '@/middleware';
import { generalActionSlice } from '@/store/global/actions/general';

const {
  parseDefaultThemeFromCountryMock,
  serializeVariantsMock,
  parseBrowserLanguageMock,
  setCookieMock,
} = vi.hoisted(() => ({
  parseBrowserLanguageMock: vi.fn(() => 'en-US'),
  parseDefaultThemeFromCountryMock: vi.fn(() => 'light'),
  serializeVariantsMock: vi.fn(() => 'en-US__0__light'),
  setCookieMock: vi.fn(),
}));
let capturedAppearanceHandler: ((appearance: string) => void) | undefined;
let globalThemeMode: 'auto' | 'light' | 'dark' = 'auto';
let userPrimaryColor = 'hermes-aurora';
let userNeutralColor = 'hermes-ash';
let userAnimationMode: 'agile' | 'standard' | 'disabled' = 'agile';

vi.mock('debug', () => ({
  default: () => vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: () => () => ({}) as any,
  createRouteMatcher: () => () => false,
}));

vi.mock('@hermeslabs/utils/server', () => ({
  parseDefaultThemeFromCountry: parseDefaultThemeFromCountryMock,
}));

vi.mock('@/envs/app', () => ({
  appEnv: {
    ENABLE_AUTH_PROTECTION: false,
    MIDDLEWARE_REWRITE_THROUGH_LOCAL: false,
  },
}));

vi.mock('@/envs/auth', () => ({
  authEnv: {
    NEXT_PUBLIC_ENABLE_CLERK_AUTH: false,
    NEXT_PUBLIC_ENABLE_NEXT_AUTH: false,
  },
}));

vi.mock('@/envs/oidc', () => ({
  oidcEnv: {
    ENABLE_OIDC: false,
  },
}));

vi.mock('@/libs/next-auth', () => ({
  default: {
    auth: (handler: any) => handler,
  },
}));

vi.mock('@/utils/locale', () => ({
  parseBrowserLanguage: parseBrowserLanguageMock,
}));

vi.mock('@/utils/server/routeVariants', () => ({
  RouteVariants: {
    serializeVariants: serializeVariantsMock,
  },
}));

vi.mock('@/utils/client/cookie', () => ({
  setCookie: setCookieMock,
}));

vi.mock('@hermeslabs/ui', () => ({
  ConfigProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  FontLoader: ({ url }: { url: string }) => <span data-font-url={url} />,
  NeutralColors: {},
  PrimaryColors: {},
  ThemeProvider: ({ children, onAppearanceChange }: any) => {
    capturedAppearanceHandler = onAppearanceChange;
    return <div data-testid="theme-provider">{children}</div>;
  },
}));

vi.mock('antd-style', () => ({
  createStyles: () => () => ({
    cx: (...classNames: string[]) => classNames.filter(Boolean).join(' '),
    styles: {
      app: 'app',
      scrollbar: 'scrollbar',
      scrollbarPolyfill: 'polyfill',
    },
    theme: { fontFamily: 'Inter' },
  }),
}));

vi.mock('@/components/AntdStaticMethods', () => ({
  default: () => <div data-testid="antd-static-methods" />,
}));

vi.mock('@/styles', () => ({
  GlobalStyle: () => <></>,
}));

vi.mock('@/store/global/selectors', () => ({
  systemStatusSelectors: {
    themeMode: () => globalThemeMode,
  },
}));

vi.mock('@/store/global', () => ({
  useGlobalStore: (selector: any) => selector({}),
}));

vi.mock('@/store/user/selectors', () => ({
  userGeneralSettingsSelectors: {
    animationMode: () => userAnimationMode,
    neutralColor: () => userNeutralColor,
    primaryColor: () => userPrimaryColor,
  },
}));

vi.mock('@/store/user', () => ({
  useUserStore: (selector: any) => selector({}),
}));

const createRequest = (themeCookie?: string): NextRequest => {
  const headers = new Headers();
  const cookies = new Map<string, { value: string }>();

  if (themeCookie) {
    cookies.set(HERMES_THEME_APPEARANCE, { value: themeCookie });
  }

  return {
    cookies: {
      get: (name: string) => cookies.get(name),
    },
    headers,
    method: 'GET',
    url: 'https://example.com/chat',
  } as unknown as NextRequest;
};

const runMiddleware = async (request: NextRequest): Promise<NextResponse> =>
  (await (middleware as unknown as (req: NextRequest, ctx?: any) => any)(request, {
    params: {},
    request,
    waitUntil: () => undefined,
  })) as NextResponse;

beforeEach(() => {
  parseDefaultThemeFromCountryMock.mockClear();
  serializeVariantsMock.mockClear();
  parseBrowserLanguageMock.mockClear();
  setCookieMock.mockClear();
  capturedAppearanceHandler = undefined;
  globalThemeMode = 'auto';
  userPrimaryColor = 'hermes-aurora';
  userNeutralColor = 'hermes-ash';
  userAnimationMode = 'agile';
});

describe('Hermes theme cookie persistence', () => {
  it('routes through cookie-aware middleware before falling back to geo defaults', async () => {
    const cookieResponse = await runMiddleware(createRequest('dark'));
    const rewriteTarget =
      cookieResponse.headers.get('x-middleware-rewrite') ?? cookieResponse.headers.get('location');

    expect(rewriteTarget).toContain('dark');
    expect(parseDefaultThemeFromCountryMock).not.toHaveBeenCalled();

    parseDefaultThemeFromCountryMock.mockClear();

    const fallbackResponse = await runMiddleware(createRequest());
    const fallbackRewrite =
      fallbackResponse.headers.get('x-middleware-rewrite') ??
      fallbackResponse.headers.get('location');

    expect(parseDefaultThemeFromCountryMock).toHaveBeenCalledOnce();
    expect(fallbackRewrite).toContain('light');
  });

  it('updates the appearance cookie via Zustand general actions', () => {
    const storeStub = {
      statusStorage: {
        getFromLocalStorage: vi.fn(),
        saveToLocalStorage: vi.fn(),
      },
      updateSystemStatus: vi.fn(),
    } as any;

    const actions = generalActionSlice(vi.fn(), () => storeStub, storeStub as any);

    actions.switchThemeMode('dark');
    expect(setCookieMock).toHaveBeenCalledWith(HERMES_THEME_APPEARANCE, 'dark');

    setCookieMock.mockClear();
    actions.switchThemeMode('auto');
    expect(setCookieMock).toHaveBeenCalledWith(HERMES_THEME_APPEARANCE, undefined);
  });

  it('persists Hermes token overrides inside AppTheme effects', async () => {
    render(
      <AppTheme
        defaultAppearance="light"
        defaultNeutralColor={undefined as any}
        defaultPrimaryColor={undefined as any}
        globalCDN={false}
      >
        <div data-testid="child">content</div>
      </AppTheme>,
    );

    await waitFor(() =>
      expect(setCookieMock).toHaveBeenCalledWith(HERMES_THEME_PRIMARY_COLOR, userPrimaryColor),
    );
    await waitFor(() =>
      expect(setCookieMock).toHaveBeenCalledWith(HERMES_THEME_NEUTRAL_COLOR, userNeutralColor),
    );

    expect(setCookieMock).not.toHaveBeenCalledWith(
      expect.stringContaining('LOBE_THEME'),
      expect.anything(),
    );

    capturedAppearanceHandler?.('dark');
    expect(setCookieMock).toHaveBeenCalledWith(HERMES_THEME_APPEARANCE, 'dark');
  });
});
