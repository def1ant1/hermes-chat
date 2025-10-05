import { supportLocales } from '@/locales/resources';

export const DEFAULT_LANG = 'en-US';
/**
 * Canonical cookie key for persisting the Hermes Chat locale preference.
 *
 * 2025-01-23: Brand governance approved migrating away from the legacy Lobe
 * identifier. New builds must prefer this constant when setting cookies.
 */
export const HERMES_LOCALE_COOKIE = 'HERMES_LOCALE';

/**
 * 2025-01-23: Compatibility hook for pre-cutover builds that still read the
 * historical cookie name. Remove after the desktop + mobile clients complete
 * their Hermes cookie rollout (target Q3 2025).
 */
export const LEGACY_LOBE_LOCALE_COOKIE = 'LOBE_LOCALE';

/**
 * Temporary alias that keeps automation and unit tests stable while we phase
 * out the old symbol. Downstream code must switch to `HERMES_LOCALE_COOKIE`.
 *
 * @deprecated Planned removal in Q4 2025 once the CLI and middleware stop
 * referencing the legacy identifier.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const LOBE_LOCALE_COOKIE: typeof HERMES_LOCALE_COOKIE = HERMES_LOCALE_COOKIE;

/** Ordered cookie keys that readers should check to honour historical sessions. */
export const LOCALE_COOKIE_FALLBACK_CHAIN = [
  HERMES_LOCALE_COOKIE,
  LEGACY_LOBE_LOCALE_COOKIE,
] as const;

/**
 * Check if the language is supported
 * @param locale
 */
export const isLocaleNotSupport = (locale: string) => !supportLocales.includes(locale);
