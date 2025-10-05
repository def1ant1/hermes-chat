# Hermes Chat Self-Hosting Configuration

This document captures the Hermes-first configuration defaults introduced during
the January 2025 cutover. Apply these settings to minimise manual brand overrides
when preparing production or enterprise sandboxes.

## Branding and metadata

- **Product slug:** Use `hermes-chat` for OAuth clients, webhook payloads, and
  analytics labels. The constant lives in `HERMES_PRODUCT_SLUG`.
- **Tagline:** “Enterprise-grade AI workspace with governed automations and
  zero-trust sync.” Surface it on landing pages or login prompts when a tagline is
  required. The value ships via `HERMES_PRODUCT_TAGLINE`.
- **Support contacts:** Import `HERMES_SUPPORT_CONTACTS` to feed default mailto
  links or incident banners. The fallback order is defined by
  `HERMES_SUPPORT_FALLBACK_ORDER` and should be honoured unless an operator
  explicitly overrides every contact.
- **Cloud labelling:** Reference `HERMES_CHAT_CLOUD` when drawing attention to
  the managed SaaS tier inside banners, onboarding flows, or feature flags. The
  transitional alias `LOBE_CHAT_CLOUD` remains available only until OPS-1120
  closes (2025-09-30) to give extensions and custom shells time to upgrade.

## Referral tracking

- **Provider cards:** Shortlink every partner referral through
  `https://go.hermes.chat/r/<slug>` with Growth's approved UTMs
  (`utm_source=hermes-chat`, `utm_medium=app_referral`,
  `utm_campaign=model_provider`, `utm_content=<slug>`). Centralise new links in
  `src/config/modelProviders/utils/referral.ts` to keep the taxonomy uniform.
- **Automation:** Run
  `bunx tsx scripts/rebrandHermesChat.ts --mode validate --workspace .` after
  touching marketing links. The CLI now logs replacement counts for the
  `utm-source-*` rules so the Growth pod can audit migrations without manual
  diffs.
- **Verification:** Execute
  `bunx vitest run --silent='passed-only' 'src/config/modelProviders/__tests__/referralLinks.test.ts'`
  to confirm provider configs emit Hermes shortlinks (invite codes included).
  Self-hosters inheriting custom forks should gate release pipelines on this
  suite to avoid reintroducing lobehub parameters.

## Locale management

Hermes Chat now writes the locale cookie under `HERMES_LOCALE`. For backwards
compatibility the application mirrors values to `LOBE_LOCALE` until 2025-03-31.
When custom deployments expose their own middleware or CDN, ensure both cookie
names are forwarded so hybrid fleets stay synchronised.

### OAuth localisation checkpoints

- **Default bundle:** `src/locales/default/oauth.ts` now ships the approved
  Simplified Chinese OpenID scope copy for Hermes Chat. Translation Ops
  validated the phrasing on 2025-02-05 (ticket CS-941) and confirmed it is safe
  to serve as the fallback whenever downstream packs lag behind.
- **Automation:** `bunx tsx scripts/rebrandHermesChat.ts --mode apply` rewrites both
  the TypeScript default bundle and JSON locale mirrors automatically. The new
  `oauth-openid-scope-*` rules keep OAuth prompts Hermes-branded during future
  rebrands.
- **Manual follow-up:** Non-Chinese locale files under `locales/*/oauth.json`
  still require human review to swap out legacy "LobeChat" phrasing. Track the
  outstanding work in the localisation backlog (Jira L10N-588) and update the
  bundles as translations land.

## Desktop + proxy automation

Hermes Chat Desktop 1.8.0 updates its network tooling to emit the
`HermesChat-Desktop/<version>` user agent. Update proxy allowlists or logging
pipelines accordingly. The previous `LobeChat-Desktop` identifier will disappear
once the dual-emission deadline is reached.

## Automation checklist

1. Run `scripts/rebrand_hermes_chat.sh lint-strings` during CI to guarantee the
   repository contains Hermes identifiers only. The workflow now runs the updated
   Vitest suite that validates locale constants and desktop UA rewrites.
2. Execute `bunx vitest run --silent='passed-only' 'tests/automation/webhook-contract.spec.ts'`
   after configuring webhooks. The spec verifies every response exposes
   `{ brand: 'hermes-chat' }`.
3. Confirm `bunx vitest run --silent='passed-only' 'src/utils/client/switchLang.test.ts'`
   succeeds so cookie mirroring is healthy before release.

Documenting these defaults in code and docs keeps future rebrands automated and
protects operators from manual drift.
