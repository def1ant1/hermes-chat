import { setCookie } from '@hermeslabs/utils';
import { changeLanguage } from 'i18next';

import { HERMES_LOCALE_COOKIE, LEGACY_LOBE_LOCALE_COOKIE } from '@/const/locale';
import { LocaleMode } from '@/types/locale';

export const switchLang = (locale: LocaleMode) => {
  const lang = locale === 'auto' ? navigator.language : locale;

  changeLanguage(lang);
  document.documentElement.lang = lang;

  const cookieValue = locale === 'auto' ? undefined : locale;

  setCookie(HERMES_LOCALE_COOKIE, cookieValue, 365);

  // 2025-01-23 (Rebrand Task Force): mirror the Hermes cookie into the legacy
  // key while mobile/desktop hotfixes roll out. Automation in
  // scripts/rebrandHermesChat.ts will fail CI if this shim regresses.
  setCookie(LEGACY_LOBE_LOCALE_COOKIE, cookieValue, 365);
};
