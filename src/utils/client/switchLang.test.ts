import { setCookie } from '@hermeslabs/utils';
import { changeLanguage } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

import { HERMES_LOCALE_COOKIE, LEGACY_LOBE_LOCALE_COOKIE } from '@/const/locale';
import { LocaleMode } from '@/types/locale';

import { switchLang } from './switchLang';

vi.mock('i18next', () => ({
  changeLanguage: vi.fn(),
}));

vi.mock('@hermeslabs/utils', () => ({
  setCookie: vi.fn(),
}));

describe('switchLang', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should change language to the specified locale', () => {
    const locale: LocaleMode = 'en-US';
    switchLang(locale);

    expect(changeLanguage).toHaveBeenCalledWith(locale);
    expect(document.documentElement.lang).toBe(locale);
    expect(setCookie).toHaveBeenNthCalledWith(1, HERMES_LOCALE_COOKIE, locale, 365);
    expect(setCookie).toHaveBeenNthCalledWith(2, LEGACY_LOBE_LOCALE_COOKIE, locale, 365);
  });

  it('should change language based on navigator.language when locale is "auto"', () => {
    const navigatorLanguage = 'fr';
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(navigatorLanguage);

    switchLang('auto');

    expect(changeLanguage).toHaveBeenCalledWith(navigatorLanguage);
    expect(document.documentElement.lang).toBe(navigatorLanguage);
    expect(setCookie).toHaveBeenNthCalledWith(1, HERMES_LOCALE_COOKIE, undefined, 365);
    expect(setCookie).toHaveBeenNthCalledWith(2, LEGACY_LOBE_LOCALE_COOKIE, undefined, 365);
  });

  it('uses Hermes-branded locale cookie tokens and preserves legacy fallback', () => {
    expect(HERMES_LOCALE_COOKIE).toBe('HERMES_LOCALE');
    expect(HERMES_LOCALE_COOKIE.startsWith('HERMES')).toBe(true);
    expect(LEGACY_LOBE_LOCALE_COOKIE).toBe('HERMES_LOCALE');
    expect(HERMES_LOCALE_COOKIE.includes('LOBE')).toBe(false);
  });
});
