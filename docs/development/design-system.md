# Hermes Design System Token Map

> **Last updated:** 2025-03-27 — Hermes Labs brand council sign-off for
> theme cookie identifiers.

Hermes Chat now standardizes theme persistence via the following cross-platform
cookie identifiers. The same names power CSS overrides, edge middleware, and
Zustand state. Automation in `scripts/rebrandHermesChat.ts` enforces these
strings, so update the script alongside any code edits.

| Token                        | Purpose                                                              | Notes                                                                                            |
| ---------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `HERMES_THEME_APPEARANCE`    | Stores the resolved appearance (`light`, `dark`, or `auto` fallback) | Legacy `LOBE_THEME_APPEARANCE` alias ships until 2025-Q4 for downstream compatibility.           |
| `HERMES_THEME_PRIMARY_COLOR` | Persists user-selected accent color                                  | Written from the client via `AppTheme` and validated through `tests/unit/themeCookies.test.tsx`. |
| `HERMES_THEME_NEUTRAL_COLOR` | Persists neutral palette selection                                   | Middleware consumes this value to initialize CSS variables before hydration.                     |

## Automation & validation

- `scripts/rebrandHermesChat.ts` rewrites every casing variant of the legacy
  `LOBE_THEME_*` tokens. Use `scripts/rebrand_hermes_chat.sh lint-strings` for a
  dry run plus regression checks.
- `bunx vitest run --silent='passed-only' 'tests/unit/themeCookies.test.tsx'`
  exercises the middleware, Zustand actions, and the React theme provider to
  guard against accidental regressions.
- Percy/Chromatic workflows should be rebaselined after token renames; the new
  cookie names trigger subtle class name changes in the theme provider which can
  invalidate historical snapshots.

## Rollback checklist

Should a downstream integration require the legacy naming:

1. Re-run `scripts/rebrand_hermes_chat.sh apply --dry-run` to verify the
   replacement surface area.
2. Restore previous constants by toggling the legacy aliases in
   `packages/const/src/theme.ts` and re-run the Vitest suite. The aliases remain
   until 2025-Q4 to keep this path lightweight.
3. Update operator runbooks (see `docs/development/runbooks/theme-token-operations.md`)
   with the rollback timestamp and notify QA so they can refresh visual baselines.
