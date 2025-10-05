# Hermes Chat Enterprise Guide

Hermes Chat's January 2025 rebrand finalised the canonical product slug and
support flows that enterprise administrators must reference in automation,
contracting, and incident response. This guide consolidates the cross-team
approvals so pre-production rollouts stay aligned with governance policy.

## Canonical identifiers

| Asset                         | Value                                                                        | Notes                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Product slug (OAuth/Webhooks) | `hermes-chat`                                                                | Mirrors `HERMES_OAUTH_BRAND_KEY` in `packages/const/src/app.ts`.              |
| Marketing name                | Hermes Chat                                                                  | Exported via `BRANDING_NAME`.                                                 |
| Enterprise tagline            | Enterprise-grade AI workspace with governed automations and zero-trust sync. | Approved 2025-01-20 by GTM leadership.                                        |
| Locale cookie                 | `HERMES_LOCALE`                                                              | Dual-emits `HERMES_LOCALE` until 2025-03-31 for backwards compatibility.      |
| Managed cloud constant        | `HERMES_CHAT_CLOUD`                                                          | Alias `HERMES_CHAT_CLOUD` stays exported until OPS-1120 closes on 2025-09-30. |
| Desktop user agent            | `HermesChat-Desktop/<ver>`                                                   | Analytics migration window tracked in Jira OPS-984.                           |

> \[!IMPORTANT]
> Always source these values from `@/const/app` or `@/const/branding`. Manual
> duplication leads to mismatches that our rebranding lint (`scripts/rebrand_hermes_chat.sh lint-strings`)
> will now block in CI.

## Localisation governance

- **OAuth prompts:** `src/locales/default/oauth.ts` and `locales/zh-CN/oauth.json`
  now reference Hermes Chat explicitly. Translation Ops signed off the copy on
  2025-02-05 (CS-941) and mandated that other locales fall back to the default
  bundle until refreshed assets ship.
- **Automation:** `scripts/rebrandHermesChat.ts` introduces the
  `oauth-openid-scope-zh-cn` and `oauth-openid-scope-en` rewrite rules so future
  rebrands (or tenant-specific names) update OAuth scope strings automatically.
  The CI helper `scripts/rebrand_hermes_chat.sh lint-strings` executes the CLI
  in dry-run mode to guarantee these rules stay exercised.
- **Manual backlog:** Languages beyond zh-CN/en-US still surface "Hermes Chat" in
  their OAuth packs. Track remediation in Jira L10N-588 and only mark the task
  complete once linguists deliver parity strings.
- **Verification:** `bunx vitest run --silent='passed-only' 'src/utils/client/switchLang.test.ts'`
  now asserts the Hermes cookie token, giving CI coverage that the locale
  fallback chain stays branded correctly.

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

## Plugin tooling automation

- **Type migration:** `packages/context-engine/src/tools/types.ts` now exposes
  `HermesChatPluginApi` and `HermesChatPluginManifest`. The legacy
  `Hermes Chat*` aliases remain exported (and marked deprecated) so downstream
  SDKs can align with the rename on their own release cadences. The migration is
  documented inline and tied to the automation guardrails below.
- **Automation guardrail:** `scripts/rebrandHermesChat.ts` rewrites these type
  identifiers via the `typescript-plugin-api-interface` and
  `typescript-plugin-manifest-interface` rules. The CLI test fixture (`tests/scripts/rebrandHermesChat.test.ts`)
  asserts both replacements so CI fails fast if future edits skip the rename.
- **Verification:** `packages/context-engine/src/tools/__tests__/types.test.ts`
  adds `expectTypeOf` assertions to guarantee the Hermes-prefixed interfaces stay
  structurally compatible with their deprecated aliases. Run
  `bunx vitest run --silent='passed-only' 'packages/context-engine/src/tools/__tests__/types.test.ts'`
  before shipping plugin schema changes.
- **Timeline:** Track removal of the deprecated aliases and downstream adoption
  milestones in the [enterprise migration notes](/docs/changelog/2025-hermes-chat-launch).

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

Authentication runbooks now live at [docs.hermes.chat](https://docs.hermes.chat). The rebranding
CLI enforces four `docs-auth-*` replacement rules so every NextAuth error maps
to the sanctioned English and Simplified Chinese playbooks. When operators pass
`--brand-domain` overrides (for example, `qa.hermes.chat`), the script derives
locale-aware docs hosts automatically (for QA this becomes
[docs.qa.hermes.chat](https://docs.qa.hermes.chat)). Support triage confirmed the support alias
change to <support@hermes.chat> and noted the legacy `hello@hermes.chat`
mailbox will retire on 2025-07-01.

## Rollout constraints

- **Locale cookies:** The Hermes cookie name ships immediately. Emit the legacy
  `HERMES_LOCALE` value in parallel until every managed desktop/mobile app is
  upgraded (target 2025-03-31).
- **Cloud constant:** UI copy and automations must import `HERMES_CHAT_CLOUD`.
  Keep `HERMES_CHAT_CLOUD` references only when updating downstream extensions
  that cannot ingest the renamed constant before the OPS-1120 LTS deadline
  (2025-09-30). The alias is annotated in `packages/const/src/branding.ts` to
  help release managers plan the removal.
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
5. Execute `bunx vitest run --silent='passed-only' 'src/app/**/__tests__/AuthErrorPage.test.tsx'`
   whenever authentication messaging changes. The suite asserts the rendered
   copy keeps the Hermes documentation URLs and support alias intact.

Following this checklist ensures enterprise sandboxes mirror production policy
with minimal manual intervention.
