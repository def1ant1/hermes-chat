# Hermes Chat Brand Alignment Notes

_Last updated: 2024-11-24_

## Stakeholder Coordination Summary

- **Session date**: 2024-11-22 (virtual workshop + async follow-up)
- **Facilitator**: Brand PM (Avery Chen) with product leadership (Diego Ramirez) and GTM lead (Priya Natarajan)
- **Key takeaways**:
  - Unified on **Hermes Chat** as the customer-facing name and "Hermes" as the internal program codename.
  - Confirmed go-to-market focus on enterprise security, multilingual copilot workflows, and developer extensibility.
  - Established a dual-domain strategy (`hermes.chat` primary, `app.hermes.chat` for hosted console) with redirect playbook for legacy links.

## Positioning & Value Proposition

- **Positioning statement**: "Hermes Chat is the enterprise-grade conversational AI workspace that lets regulated teams reason over knowledge safely, automate decisions, and deploy multilingual copilots without infrastructure overhead."
- **Target segments**: Financial services compliance teams, enterprise knowledge ops, and platform engineering teams tasked with AI adoption.
- **Differentiators**:
  1. Zero-retention, region-aware data residency with auditable policy enforcement.
  2. Extensible automation surface (webhooks, workflow SDKs) that ships with opinionated governance guardrails.
  3. Multilingual experience with human-in-the-loop escalation.
- **Supporting narrative pillars**: Trust & compliance, operational velocity, and global enablement.

## Naming & Domain Strategy

- **Primary product name**: Hermes Chat (customer facing). Internal initiative: Project Hermes.
- **Tagline**: "Enterprise conversations, governed intelligence."
- **Domain ownership**:
  - `hermes.chat`: Marketing site + docs (`docs.hermes.chat`).
  - `app.hermes.chat`: Managed SaaS console with SSO enforced.
  - `status.hermes.chat`: Statuspage-managed uptime communications.
- **Redirect plan**: Maintain 12-month redirects from `chat.hermes.chat` to mapped destinations with analytics tagging for migration reporting.
- **Trademark review**: Legal submitted filings in US/EU (docket LOB-2024-118) with monthly checkpoints.

## Launch Constraints & Guardrails

- **Target beta window**: 2025-01-15 soft launch to design partners, GA on 2025-03-15 pending compliance sign-off.
- **Security gates**: SOC 2 Type II evidence updates and ISO 27001 control alignment required prior to GA.
- **Localization**: Minimum EN + zh-CN parity at launch; FR/DE queued post-GA.
- **Change management**: Migration guides must reach existing Hermes Chat Pro tenants 30 days before domain cutover.

## Success Metrics & Signals

- 95%+ successful SSO migration rate within first 14 days of beta.
- 20% lift in enterprise pipeline influenced by brand refresh in Q1 FY25.
- Sub-2% brand support tickets referencing naming confusion after GA (measured via Zendesk tag `brand-hermes`).

## Dependencies & Action Items

- **Design**: Finalize iconography + typography kit (`docs/wiki/design/hermes-chat-visual-system.fig` export) by 2024-12-05.
- **Product**: Update roadmap artifacts and release notes to reference Hermes Chat naming by sprint HC-2024.48.
- **Marketing**: Launch teaser landing page variant tests by 2024-12-10; coordinate with paid media for new keyword sets.
- **Engineering**: Execute rebrand automation scripts, update translations, and refresh docs per epics backlog.

## Reference Materials

- [Stakeholder briefing deck](https://drive.example.com/hermes-chat-brand-brief) (internal access).
- [Messaging architecture worksheet](https://miro.example.com/hermes-chat-positioning) (internal access).
- Internal backlog alignment: see `backlog/01_epics.hermes-chat.yaml` and `backlog/02_stories_and_tasks.hermes-chat.yaml` for implementation scope.
