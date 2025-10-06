/**
 * Canonical feature flag identifiers shared across Hermes Chat runtimes.
 *
 * Keeping the string constants centralized prevents drift between middleware,
 * edge automation, and client stores that hydrate the feature flag payload.
 */
export const HERMES_DOMAIN_REDIRECT_FLAG = 'hermes_domain_redirect' as const;

/**
 * Telemetry event name emitted whenever the middleware rewrites a legacy
 * Hermes/Lobe domain to the Hermes Chat host. Downstream analytics pipelines
 * (Looker, Amplitude) subscribe to this identifier.
 */
export const HERMES_DOMAIN_REDIRECT_EVENT = 'hermes.redirect.legacy-domain' as const;

export type HermesFeatureFlags = Partial<Record<typeof HERMES_DOMAIN_REDIRECT_FLAG, boolean>>;

export interface HermesRedirectFeatureFlagState {
  readonly enabled: boolean;
}

/**
 * Resolves whether legacy domain redirects should run for the current request.
 * Callers can pass a partial flag payload (for example environment overrides
 * parsed from the `FEATURE_FLAGS` environment variable); any missing values
 * fall back to the defaults baked into the configuration schema.
 */
export const resolveHermesRedirectFlag = (
  flags: HermesFeatureFlags,
  defaultValue: boolean,
): HermesRedirectFeatureFlagState => {
  const raw = flags[HERMES_DOMAIN_REDIRECT_FLAG];
  const enabled = typeof raw === 'boolean' ? raw : defaultValue;

  return { enabled };
};
