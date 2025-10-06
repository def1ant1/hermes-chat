# Hermes Chat Domain Migration Runbook

_Last updated: 2025-03-31_

This appendix documents the automation guardrails that govern the Hermes Chat
legacy domain redirect rollout. The playbook prioritises deterministic
automation over manual steps so SREs can validate coverage before each deploy
and audit telemetry afterwards.

## Redirect governance

- **Feature flag** – Redirect enforcement is controlled by the
  `hermes_domain_redirect` flag. It is enabled by default in
  `DEFAULT_FEATURE_FLAGS` and can be overridden through the `FEATURE_FLAGS`
  environment variable (e.g. `FEATURE_FLAGS=-hermes_domain_redirect`). Edge
  middleware also honours `x-hermes-redirect: disable` headers and the
  `?hermesRedirect=disable` query parameter for chaos testing.
- **Telemetry** – Every redirect emits the
  `hermes.redirect.legacy-domain` event. When
  `HERMES_REDIRECT_TELEMETRY_ENDPOINT` is configured the middleware posts a
  JSON payload containing the source host, destination URL, applied analytics
  parameters, and applied feature-flag state. Without an endpoint the payload is
  logged via the `telemetry:redirect` debug namespace for ingestion by the
  platform log pipeline.

## Automation checklist

| Step | Command | Purpose |
| ---- | ------- | ------- |
| 1 | `bunx tsx scripts/redirects/verifyHermesRedirects.ts` | Static analysis of redirect catalogue (200 permutations, analytics tagging, host coverage). |
| 2 | `./scripts/rebrand_hermes_chat.sh verify-redirects` | CI-friendly wrapper that invokes the verification script with consistent logging. |
| 3 | `bunx vitest run --silent='passed-only' 'tests/synthetic/domains.spec.ts'` | Synthetic assertions for middleware resolver behaviour. |

> **Tip:** When reviewing deployment pipelines, wire step 2 before the deploy
> stage so the job fails fast if a redirect entry is missing or duplicated.

## Redirect catalogue summary

The middleware maintains 200 deterministic mappings. The table below shows the
host groupings; each host enumerates 25 high-traffic paths that redirect to the
Hermes equivalents with analytics tagging (`utm_source=legacy-host`,
`utm_medium=edge-redirect`, `utm_campaign=hermes-domain-cutover`).

| Legacy host group | Example hosts | Destination host |
| ----------------- | ------------- | ---------------- |
| Marketing surfaces | `lobe.chat`, `www.lobe.chat`, `legacy.lobe.chat`, `hermes.lobe.chat` | `hermes.chat` |
| SaaS console | `app.lobe.chat`, `beta.lobe.chat`, `chat.lobe.chat`, `console.lobe.chat` | `app.hermes.chat` |

All marketing hosts cover the marketing/brochure paths (`/`, `/pricing`,
`/blog`, `/docs/*`, `/support`, `/status`, `/legal/terms`). SaaS console hosts
map console routes (`/chat`, `/discover/*`, `/settings/*`, `/market/*`, `/files`,
`/image`). Paths that are not explicitly catalogued fall back to the root route
on the new host, ensuring legacy bookmarks continue to resolve without 404s.

## Rollback and diagnostics

1. Temporarily disable the redirect feature flag by appending
   `-hermes_domain_redirect` to the `FEATURE_FLAGS` environment variable (or by
   issuing a request with `x-hermes-redirect: disable` when debugging a single
   session).
2. Inspect telemetry via the configured endpoint (or the `telemetry:redirect`
   logs) to confirm redirect traffic has ceased.
3. Re-run `./scripts/rebrand_hermes_chat.sh verify-redirects` to ensure the
   catalogue remains intact before re-enabling the flag.

For additional operational guidance reference `docs/development/oncall-runbook.md`
section **Redirect & DNS incidents**.
