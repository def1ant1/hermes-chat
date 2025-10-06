# Hermes Design System Token Map

> **Last updated:** 2025-03-27 — Hermes Labs brand council sign-off for
> theme cookie identifiers.

Hermes Chat now standardizes theme persistence via the following cross-platform
cookie identifiers. The same names power CSS overrides, edge middleware, and
Zustand state. Automation in `scripts/rebrandHermesChat.ts` enforces these
strings, so update the script alongside any code edits.

| Token                        | Purpose                                                              | Notes                                                                                            |
| ---------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `HERMES_THEME_APPEARANCE`    | Stores the resolved appearance (`light`, `dark`, or `auto` fallback) | Legacy `HERMES_THEME_APPEARANCE` alias ships until 2025-Q4 for downstream compatibility.         |
| `HERMES_THEME_PRIMARY_COLOR` | Persists user-selected accent color                                  | Written from the client via `AppTheme` and validated through `tests/unit/themeCookies.test.tsx`. |
| `HERMES_THEME_NEUTRAL_COLOR` | Persists neutral palette selection                                   | Middleware consumes this value to initialize CSS variables before hydration.                     |

## Palette roles

Hermes adopts two palette states (`light` and `dark`) with mirrored accents so
marketing and product surfaces always share the same chroma vocabulary. The
values ship through code via `HERMES_THEME_FOUNDATIONS.palette` and materialize
as CSS variables using `buildHermesCssVariables()`.

| Role                         | Light (`#`)         | Dark (`#`)          | Notes                                                   |
| ---------------------------- | ------------------ | ------------------- | ------------------------------------------------------- |
| Accent default               | `#2563EB`          | `#60A5FA`           | Primary CTA tint for buttons, links, and focus states.  |
| Accent emphasis              | `#1D4ED8`          | `#93C5FD`           | Hover + pressed state for primary actions.              |
| Accent soft                  | `#DBEAFE`          | `#1E3A8A`           | Background washes for info banners.                     |
| Background canvas            | `#F8FAFC`          | `#020617`           | Root layout background.                                 |
| Surface base                 | `#FFFFFF`          | `#0B1120`           | Cards, sheets, modal backgrounds.                       |
| Surface raised               | `#E2E8F0`          | `#111C36`           | Tooltip, popover, and flyout treatments.                |
| Border subtle                | `#CBD5F5`          | `#1E293B`           | 1px borders + dividers.                                 |
| Text strong                  | `#0F172A`          | `#F8FAFC`           | Primary body copy, WCAG AA against canvas/surface.      |
| Text muted                   | `#475569`          | `#94A3B8`           | Secondary copy, captions, helper text.                  |
| Text inverse                 | `#F8FAFC`          | `#020617`           | Text placed on accent emphasis backgrounds.             |
| Status success               | `#0F766E`          | `#34D399`           | Inline confirmations + toast styling.                   |
| Status warning               | `#B45309`          | `#FBBF24`           | Non-blocking caution states.                            |
| Status danger                | `#B91C1C`          | `#F87171`           | Destructive actions, error states.                      |
| Status info                  | `#1D4ED8`          | `#93C5FD`           | Informational banners + badges.                         |
| Gradient hero                | `#2563EB → #7C3AED` | `#1D4ED8 → #7C3AED` | Homepage hero, modal feature highlights.                |
| Gradient interaction         | `#22D3EE → #2563EB` | `#0891B2 → #60A5FA` | Button glows, animated backgrounds.                     |

## Typography scale

| Token                        | Value | Usage                                   |
| ---------------------------- | ----- | --------------------------------------- |
| `--hermes-font-size-xs`      | 12px  | Microcopy, badge labels.                |
| `--hermes-font-size-sm`      | 14px  | Secondary text, table metadata.         |
| `--hermes-font-size-base`    | 16px  | Primary body copy.                      |
| `--hermes-font-size-lg`      | 20px  | Section headers, modal titles.          |
| `--hermes-font-size-xl`      | 24px  | Hero overlines, marketing callouts.     |
| `--hermes-font-size-2xl`     | 32px  | Dashboard hero, pricing marquees.       |
| `--hermes-font-lineheight-xs` | 16px | Dense captions.                         |
| `--hermes-font-lineheight-sm` | 20px | Secondary text blocks.                  |
| `--hermes-font-lineheight-base` | 24px | Default reading comfort.                |
| `--hermes-font-lineheight-lg` | 28px | Headlines.                              |
| `--hermes-font-lineheight-xl` | 32px | Hero typography.                        |
| `--hermes-font-lineheight-2xl` | 40px | Jumbo hero copy.                        |
| `--hermes-font-family-sans`  | `'Inter', 'SF Pro Text', 'Helvetica Neue', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | Default UI font stack. |
| `--hermes-font-family-mono`  | `'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` | Code snippets, inline metrics. |

## Spacing scale

Spacing adheres to a strict 4px grid to keep rhythm consistent between web and
desktop shells.

| Token               | Value | Notes                             |
| ------------------- | ----- | --------------------------------- |
| `--hermes-space-0`  | 0px   | Reset / collapse margins.         |
| `--hermes-space-1`  | 4px   | Icon padding, chips.              |
| `--hermes-space-2`  | 8px   | Micro gaps, inline controls.      |
| `--hermes-space-3`  | 12px  | Text + control pairing.           |
| `--hermes-space-4`  | 16px  | Default stack spacing.            |
| `--hermes-space-5`  | 20px  | Large form rows.                  |
| `--hermes-space-6`  | 24px  | Card interior padding.            |
| `--hermes-space-7`  | 32px  | Section spacing.                  |
| `--hermes-space-8`  | 40px  | Dashboard column gutters.         |
| `--hermes-space-9`  | 48px  | Hero layout gutters.              |
| `--hermes-space-10` | 64px  | Desktop breakpoints.              |
| `--hermes-space-11` | 80px  | Marketing hero whitespace.        |
| `--hermes-space-12` | 96px  | High-impact landing sections.     |

Automation hydrates these values via `scripts/theme/generateCss.ts`, which
writes `public/assets/hermes-chat/theme.css`. The CDN invalidation helper
(`scripts/cdn/purgeThemeCache.ts`) should run immediately afterwards so edge
caches serve the updated palette.

## Automation & validation

- `scripts/rebrandHermesChat.ts` rewrites every casing variant of the legacy
  `LOBE_THEME_*` tokens. Use `scripts/rebrand_hermes_chat.sh lint-strings` for a
  dry run plus regression checks.
- `bunx vitest run --silent='passed-only' 'tests/unit/themeCookies.test.tsx'`
  exercises the middleware, Zustand actions, and the React theme provider to
  guard against accidental regressions.
- Percy/Chromatic workflows should be rebaselined after token or palette
  updates; `tests/visual/brand.spec.ts` guards the CSS variable footprint while
  snapshot infrastructure validates rendered components.

## Rollback checklist

Should a downstream integration require the legacy naming:

1. Re-run `scripts/rebrand_hermes_chat.sh apply --dry-run` to verify the
   replacement surface area.
2. Restore previous constants by toggling the legacy aliases in
   `packages/const/src/theme.ts` and re-run the Vitest suite. The aliases remain
   until 2025-Q4 to keep this path lightweight.
3. Update operator runbooks (see `docs/development/runbooks/theme-token-operations.md`)
   with the rollback timestamp and notify QA so they can refresh visual baselines.
