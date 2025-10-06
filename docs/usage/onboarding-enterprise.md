# Hermes Chat Enterprise Onboarding Playbook

This guide captures the end-to-end expectations for the EPIC-HC-012 program, covering the multi-step onboarding wizard, ingestion health automation, and governed agent template library. The intent is to make pre-production rollouts repeatable, observable, and resilient to change with minimal manual intervention.

## 1. Multi-Step Onboarding Wizard (`apps/web/app/(dashboard)/onboarding/`)

### Functional Overview
- **Autosave + Resume**: Persist draft workspace configuration after every state machine transition via encrypted draft APIs. Resume paths must restore form state, file uploads, and automation toggles without data loss.
- **Inline Guidance**: Each step renders contextual helper text, video tooltips, and escalation footers pointing to SRE/CSM runbooks. Prefer declarative JSON definitions so copy changes are deployable without code edits.
- **Automation Triggers**: Wizard completion events dispatch provisioning workflows that create provider credentials, enforce rate-limit tiers, scaffold governed agents, and emit audit trails.
- **Audit + Observability**: Capture structured event logs (step enter/exit, validation errors, automation job IDs) streamed to the observability stack for compliance review.

### Engineering Notes
- Model the wizard as a deterministic statechart so future steps can be added without regressions.
- Store autosave payloads in short-lived encrypted storage with automatic expiry to honor data minimization policies.
- Use feature flags to stage new steps; default to safe fallbacks that do not block provisioning automation.
- Document every complex branch with `/** NOTE:` annotations referencing this guide for discoverability.

### Testing Expectations
- End-to-end Playwright/Vitest suite `tests/e2e/onboarding_wizard.resilience.spec.ts` must:
  - Simulate intermittent network failures and verify autosave resumes successfully.
  - Assert automation webhooks fire exactly once per completion, with idempotency keys validated.
  - Validate inline guidance renders for each step and links remain accessible.
- Component/unit suites should snapshot state machine transitions and autosave reducers under concurrent edits.

## 2. Ingestion Health Services (`apps/services/ingestion-health/`) & UI (`apps/web/app/(dashboard)/knowledge/`)

### Functional Overview
- **Automated Scans**: Schedule synthetic ingestion jobs that stress large-document, streaming, and binary payload scenarios. Record scoring metrics (freshness, completeness, ACL consistency).
- **Retention Tagging**: Auto-apply retention labels during scans; flag drift and push remediation tasks to the wizard completion pipeline.
- **Mnemosyne Integration**: Synchronize ingestion findings with the Mnemosyne knowledge graph so entity lineage and context are updated immediately after scans.
- **Remediation Surfacing**: Expose real-time health cards in the dashboard with drill-down links to automation playbooks and retry actions.

### Engineering Notes
- Service workers should leverage streaming parsers to avoid memory spikes under load; throttle via token bucket policies tuned for enterprise traffic.
- Publish telemetry (latency, throughput, retry counts) to centralized dashboards; include correlation IDs linking back to onboarding events.
- When integrating Mnemosyne, prefer asynchronous fan-out to keep ingestion pipelines responsive; capture failures with retry queues and dead-letter handling.
- Inline comments must outline fallback strategies when Mnemosyne is temporarily unavailable.

### Testing Expectations
- Run `bunx vitest run --silent='passed-only' 'tests/services/ingestion-health/*'` for scoring logic, retention tagging, and Mnemosyne sync adapters.
- Execute `bunx ts-node apps/services/ingestion-health/scripts/run-large-doc-sim.ts` stress tests before every release; capture metrics in artifacts for auditability.
- Add contract tests ensuring ACL reconciliation and retention tags persist after automated remediation jobs.

## 3. Governed Agent Template Library (`packages/agents/templates/`)

### Functional Overview
- **Curated Templates**: Each template includes governance annotations (PII scope, data residency, escalation contacts) and version metadata.
- **Admin Surfacing**: Dashboard admin modules render template catalogs with approval workflows, usage analytics, and diff visualizations between versions.
- **Observability Hooks**: Templates emit lifecycle events (provisioned, updated, revoked) to the observability pipeline, enabling automated drift detection.
- **Centralized Provisioning**: Onboarding completion schedules provisioning jobs that hydrate environments (production, staging, sandbox) from signed template artifacts.

### Engineering Notes
- Maintain templates as declarative JSON/TS modules with exhaustive comments describing intended automations and guardrails.
- Sign template bundles during CI and store signatures alongside SBOM references for compliance reviews.
- Provide CLI tooling to snapshot template diffs; align naming conventions with onboarding wizard automation payloads for traceability.

### Testing Expectations
- Snapshot/unit coverage lives in `tests/packages/agents/templates/` and must verify governance metadata, schema alignment, and observability hook registration.
- Integration harnesses should confirm admin surfacing toggles render as expected and provisioning jobs register completion signals.

## 4. Automation & Operations

- Provisioning workflows (`apps/services/provisioning/jobs/`) must be idempotent, retry safe, and observable. Enforce rate limits, create provider credentials, and seed governed templates in one orchestrated pipeline.
- Centralize schedule management (e.g., Temporal/Chronicle) so onboarding completion kicks off ingestion diagnostics, Mnemosyne sync, and template provisioning in a predictable order.
- Emit metrics and alerts for every automation step; wire to PagerDuty/Slack with clear runbook links.
- Ensure rollback procedures are codified: automation jobs should support compensating actions for partial failures.

## 5. Documentation & Developer Enablement

- Keep this guide updated alongside code comments; reference section anchors (`#1`, `#2`, etc.) from inline `NOTE:` commentary to aid navigation.
- Record configuration defaults, feature flag names, and environment variable expectations in repo `.env.example` files when applicable.
- Provide onboarding demos or Loom walkthroughs and link them from the wizard's inline guidance metadata.
- Capture known limitations, SLA targets, and scaling considerations in a closing appendix as changes are introduced.

## 6. Checklists Before Release

1. ✅ Wizard resilience suite passes under chaos testing.
2. ✅ Ingestion stress simulations and retention tagging reports show green status with audit artifacts uploaded.
3. ✅ Template snapshot/unit tests succeed and admin surfacing integration harness shows no diffs.
4. ✅ Automation pipelines (provisioning, rate-limit setup, Mnemosyne sync) have recent successful runs with alerting verified.
5. ✅ Documentation (this file, inline comments, READMEs) reviewed by platform + SRE stakeholders.

Maintaining this automation-first mindset ensures Hermes Chat enterprise customers experience near-infinite scalability, performance, and operational excellence from their initial login.
