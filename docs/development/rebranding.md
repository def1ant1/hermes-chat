# Hermes Chat Rebranding Toolkit

The Hermes Chat automation suite standardizes how we migrate codebases from the
legacy **LobeChat / LobeHub** branding to modern Hermes-first language. The
workflow is intentionally repeatable so enterprise operators can roll forward or
roll back rebrands without manually touching thousands of strings.

## Overview

- **TypeScript CLI** – `scripts/rebrandHermesChat.ts` performs the actual
  replacements using a strongly typed, fully documented mapping catalog.
- **Shell wrapper** – `scripts/rebrand_hermes_chat.sh` injects canonical Hermes
  metadata and exposes a safe operator interface (dry-run support, forwarding
  extra flags, etc.).
- **Tests** – `tests/scripts/rebrandHermesChat.test.ts` provisions sandbox
  workspaces to ensure regression-free refactors before touching production
  repositories.

## Canonical constants

- Hermes Chat brand constants now live in `packages/const/src/branding.ts` and
  `packages/const/src/url.ts`. Any automation consuming historical LobeChat
  values must migrate to the Hermes equivalents before release promotion.

## Usage

### Quick start

Run the orchestrator from the repository root:

```bash
./scripts/rebrand_hermes_chat.sh --dry-run
```

The defaults ship Hermes Chat metadata and perform a dry run so you can review
logs without modifying files. Remove `--dry-run` once you are confident in the
output.

### Customizing metadata

All brand attributes can be overridden through environment variables or by
passing additional flags after `--`:

```bash
BRAND_NAME="Hermes Chat X" BRAND_DOMAIN="hermesx.chat" \
  ./scripts/rebrand_hermes_chat.sh -- \
  --metadata-file path/to/brand.json
```

The JSON schema matches the `BrandMetadata` interface inside the TypeScript CLI.
Only provide keys you want to override; unspecified values inherit the Hermes
baseline.

### Direct CLI invocation

Advanced operators can bypass the shell wrapper entirely:

```bash
bunx tsx scripts/rebrandHermesChat.ts \
  --workspace /tmp/project \
  --brand-name "Hermes Chat" \
  --brand-domain hermes.chat \
  --support-email support@hermes.chat \
  --support-url https://hermes.chat/support \
  --contact-email hello@hermes.chat \
  --asset-logo /assets/hermes-chat/logo.svg \
  --asset-favicon /assets/hermes-chat/favicon.png \
  --asset-wordmark /assets/hermes-chat/wordmark.svg
```

### Logging and monitoring

- Every run prints a per-rule replacement breakdown to make auditing trivial.
- Dry runs emit a conspicuous warning reminding operators that no files were
  written.
- Verbose logs can be enabled by forwarding `-- --verbose` via the shell
  wrapper.

## Safeguards

1. **Dry-run default** – Always preview changes before mutating a customer
   repository.
2. **Binary detection** – The CLI ignores binary files and non-text extensions
   to avoid corrupting assets.
3. **Scoped globbing** – Vendor directories (`node_modules`, build outputs, etc.)
   are skipped to reduce runtime and risk.
4. **Strong typing** – The rebranding matrix is encoded with explicit interfaces
   and explanatory comments for long-term maintainability.

## Rollback strategy

If a run produces undesirable results:

1. Use `git status` to inspect modified files.
2. Revert selectively with `git checkout -- <file>` or globally with `git
reset --hard HEAD` if you have no other local work.
3. Rerun the script with corrected metadata (dry run first) to validate the
   fix.
4. Commit only after integration tests (`bunx vitest ...`) succeed.

## Testing checklist

Before merging or promoting to staging, execute:

```bash
bunx vitest run --silent='passed-only' 'tests/scripts/rebrandHermesChat.test.ts'
```

This ensures the automation continues to cover key text-based assets such as
constants, docs, and locale files.
