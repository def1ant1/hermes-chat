# Visual regression guardrails for Hermes branding

> **Last updated:** 2025-03-28 — Introduced palette + typography foundations.

Hermes Chat treats visual regression coverage as a first-class launch gate for
brand updates. This document summarizes how automated checks enforce the palette
contracts introduced in `packages/const/src/theme.ts`.

## Test suites

- `tests/visual/brand.spec.ts`
  - Confirms every CSS variable emitted by `buildHermesCssVariables()` is present
    so Percy/Chromatic jobs fail fast if tokens disappear.
  - Asserts Hermes hero gradients retain the approved indigo → violet ramp used
    across marketing collateral.
- `tests/unit/themeTokens.test.ts`
  - Performs WCAG contrast calculations across light/dark palettes.
  - Guards the 4px spacing grid and font scale so layout rhythm remains
    consistent.

## Automation expectations

1. Run `bunx vitest run --silent='passed-only' 'tests/unit/theme*'` before
   publishing palette changes.
2. Run `bunx vitest run --silent='passed-only' 'tests/visual/brand.spec.ts'` to
   ensure CSS variable coverage stays intact.
3. Execute `scripts/rebrand_hermes_chat.sh validate` to regenerate CSS variables
   (`scripts/theme/generateCss.ts`) and purge cached assets via
   `scripts/cdn/purgeThemeCache.ts`.

## Percy/Chromatic coordination

- Refresh baselines after any palette, typography, or spacing change. The
  generated CSS (`public/assets/hermes-chat/theme.css`) is versioned; new hashes
  will appear in CDN logs once the purge script completes.
- Archive baseline screenshots in the shared S3 bucket with a timestamp and git
  SHA so customer success and legal teams can audit history for launch decks.

## Rollback procedure

If a regression slips through, execute the following steps:

1. Revert the offending commit and re-run the Vitest commands above.
2. Execute `scripts/theme/generateCss.ts` to restore the previous CSS payload and
   run `scripts/cdn/purgeThemeCache.ts` with `HERMES_THEME_PURGE_DRY_RUN=false` to
   invalidate caches.
3. Notify the #brand-swe channel in Slack with links to the restored Percy/Chromatic
   reports and updated documentation.
