# 2025 Hermes Chat Launch Readiness

## Theme token migration

- Adopted Hermes-first theme cookie names:
  - `HERMES_THEME_APPEARANCE`
  - `HERMES_THEME_PRIMARY_COLOR`
  - `HERMES_THEME_NEUTRAL_COLOR`
- Preserved `LOBE_THEME_*` aliases with Q4 2025 deprecation notices to allow
  downstream SDKs to roll forward gradually.
- Updated edge middleware, Zustand general actions, and the `AppTheme`
  provider to respect the new identifiers while documenting cleanup TODOs for
  automation visibility.

## Automation updates

- Extended `scripts/rebrandHermesChat.ts` with mapping rules that rewrite all
  casing variants of the legacy `LOBE_THEME_*` tokens.
- Added `--mode lint-strings|validate` support plus Vitest execution so CI can
  block regressions on string rewrites.
- Enhanced the Bash wrapper (`scripts/rebrand_hermes_chat.sh`) with command
  awareness and a `THEME_TOKEN_PREFIX` override for enterprise rollouts.

## Quality gates

- New Vitest suite `tests/unit/themeCookies.test.tsx` exercises the middleware,
  Zustand actions, and `AppTheme` cookie side effects to ensure Hermes tokens
  persist end-to-end.
- Percy/Chromatic maintainers must refresh baselines once the new cookies are
  deployed, because CSS variable names and DOM identifiers changed.

## Rollback guidance

- Execute `scripts/rebrand_hermes_chat.sh apply --dry-run` to inspect the
  affected surface area before reverting.
- Toggle the legacy aliases in `packages/const/src/theme.ts` and rerun
  `bunx vitest run --silent='passed-only' 'tests/unit/themeCookies.test.tsx'` to
  confirm functional parity.
- Document the rollback in the operator runbook and notify QA so screenshot
  baselines can be restored.
