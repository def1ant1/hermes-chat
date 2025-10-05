/**
 * Hermes Chat canonical constant surface.
 *
 * 2025-01-23 (Brand Council): Index exports now expose the application
 * metadata module first so downstream imports inherit the approved
 * `hermes-chat` slug, tagline, and support fallbacks without manual wiring.
 * Automation and documentation should import from this barrel to respect the
 * governance-backed defaults before layering any tenant overrides.
 */
export * from './app';
export * from './auth';
export * from './branding';
export * from './currency';
export * from './desktop';
export * from './guide';
export * from './layoutTokens';
export * from './message';
export * from './session';
export * from './settings';
export * from './trace';
export * from './user';
export * from './version';
