/**
 * 2025-03-27 Hermes Labs brand council review
 * -------------------------------------------
 * During the Hermes Chat launch readiness review we confirmed with brand
 * stakeholders (Design Systems, Marketing Ops, and Developer Productivity) that
 * the long-term token prefix must read `HERMES_THEME_*`. The team explicitly
 * requested we drop the legacy "Lobe" prefix to avoid cross-product collisions
 * once Hermes Chat assets are federated into the shared Hermes design system.
 *
 * The new canonical tokens are exported below. Keep these names synchronized
 * with `scripts/rebrandHermesChat.ts` replacement rules so automated rebrands
 * remain deterministic across repos.
 */
export const HERMES_THEME_APPEARANCE = 'HERMES_THEME_APPEARANCE';
export const HERMES_THEME_PRIMARY_COLOR = 'HERMES_THEME_PRIMARY_COLOR';
export const HERMES_THEME_NEUTRAL_COLOR = 'HERMES_THEME_NEUTRAL_COLOR';

/**
 * Legacy aliases retained exclusively for backwards compatibility. CI tracks
 * usage and follow-up automation will delete them after downstream packages
 * ship Hermes-native tokens.
 *
 * TODO(2025-Q4): Remove the `LOBE_` aliases once all clients depend on
 * `HERMES_THEME_*` constants.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- preserving historical export casing until removal window closes
export const LOBE_THEME_APPEARANCE = HERMES_THEME_APPEARANCE;
// eslint-disable-next-line @typescript-eslint/naming-convention -- preserving historical export casing until removal window closes
export const LOBE_THEME_PRIMARY_COLOR = HERMES_THEME_PRIMARY_COLOR;
// eslint-disable-next-line @typescript-eslint/naming-convention -- preserving historical export casing until removal window closes
export const LOBE_THEME_NEUTRAL_COLOR = HERMES_THEME_NEUTRAL_COLOR;
