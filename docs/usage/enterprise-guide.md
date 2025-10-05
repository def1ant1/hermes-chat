# Hermes Chat Enterprise Guide

Hermes Chat's January 2025 rebrand finalised the canonical product slug and
support flows that enterprise administrators must reference in automation,
contracting, and incident response. This guide consolidates the cross-team
approvals so pre-production rollouts stay aligned with governance policy.

## Canonical identifiers

| Asset                         | Value                                                                        | Notes                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Product slug (OAuth/Webhooks) | `hermes-chat`                                                                | Mirrors `HERMES_OAUTH_BRAND_KEY` in `packages/const/src/app.ts`.       |
| Marketing name                | Hermes Chat                                                                  | Exported via `BRANDING_NAME`.                                          |
| Enterprise tagline            | Enterprise-grade AI workspace with governed automations and zero-trust sync. | Approved 2025-01-20 by GTM leadership.                                 |
| Locale cookie                 | `HERMES_LOCALE`                                                              | Dual-emits `LOBE_LOCALE` until 2025-03-31 for backwards compatibility. |
| Desktop user agent            | `HermesChat-Desktop/<ver>`                                                   | Analytics migration window tracked in Jira OPS-984.                    |

> \[!IMPORTANT]
> Always source these values from `@/const/app` or `@/const/branding`. Manual
> duplication leads to mismatches that our rebranding lint (`scripts/rebrand_hermes_chat.sh lint-strings`)
> will now block in CI.

## Discover metadata authorship & automation

- **Metadata authors:** All Discover detail pages emit `Hermes Labs` (org) and
  `Hermes Chat` (product) entries that link to `https://github.com/hermes-chat`
  and `https://github.com/hermes-chat/hermes-chat` respectively. These values
  are hard-coded in `src/app/[variants]/(main)/discover/(detail)/model/[...slugs]/page.tsx`
  and intentionally mirror the stakeholder-approved GitHub handles.
- **Automation guardrail:** The rebranding CLI now contains the `github-org-root`
  rule and logs a machine-readable replacement payload so downstream audits can
  confirm the org URLs were rewritten during migrations.
- **CI command group:** Add
  `bunx vitest run --silent='passed-only' 'src/app/**/__tests__/discoverMetadata.test.tsx'`
  to your pre-merge checklist whenever Discover metadata changes are proposed.
  The snapshot enforces the Hermes author tuples and stops regressions before
  rollout.

## Support and escalation flow

Hermes Labs Support, Customer Success, and Trust & Safety jointly ratified the
escalation matrix on 2025-01-22. Automation should follow the fallback order
shipped in `HERMES_SUPPORT_FALLBACK_ORDER`:

1. **Email:** <support@hermes.chat>
2. **Status page:** <https://status.hermes.chat>
3. **Security hotline:** <security@hermes.chat>
4. **Community (optional):** <https://discord.gg/hermeschat>

The ordering guarantees a deterministic path even when tenant overrides are
partial. Embed these contacts in runbooks, customer comms, and any webhook error
payloads you customise.

## Rollout constraints

- **Locale cookies:** The Hermes cookie name ships immediately. Emit the legacy
  `LOBE_LOCALE` value in parallel until every managed desktop/mobile app is
  upgraded (target 2025-03-31).
- **Desktop analytics:** Update monitoring dashboards to recognise
  `HermesChat-Desktop/*` user agents. Legacy filters should remain in place until
  Q2 2025 to maintain trend continuity.
- **Automation linting:** Always execute `bunx tsx scripts/rebrandHermesChat.ts --mode lint-strings`
  during release branches. The script now rewrites locale constants and desktop
  user agents automatically, dramatically reducing manual QA cycles.

## Integration checklist

1. Import `HERMES_OAUTH_BRAND_KEY` for OAuth client registrations and webhook
   payloads.
2. Verify webhook responses include `{ brand: 'hermes-chat' }` to satisfy the
   automation contract covered by `tests/automation/webhook-contract.spec.ts`.
3. Confirm locale switching tests (`src/utils/client/switchLang.test.ts`) pass so
   dual-cookie emission works in the browser and desktop shells.
4. Update docs/user comms to reference Hermes Chat and the new support domains.

Following this checklist ensures enterprise sandboxes mirror production policy
with minimal manual intervention.
