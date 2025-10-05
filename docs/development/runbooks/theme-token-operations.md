# Runbook: Hermes Theme Token Operations

This runbook guides operators through promoting or rolling back the Hermes theme
cookies across environments.

## Promotion workflow

1. **Dry run:** `./scripts/rebrand_hermes_chat.sh lint-strings --dry-run`
   - Confirms replacements and executes `tests/unit/themeCookies.test.tsx` without
     touching the working tree.
2. **Apply changes:** `./scripts/rebrand_hermes_chat.sh apply`
   - Uses the centrally managed metadata to rewrite `LOBE_THEME_*` tokens to
     `HERMES_THEME_*` equivalents (including kebab/snake casing).
3. **Regression tests:**
   - `bunx vitest run --silent='passed-only' 'tests/unit/themeCookies.test.tsx'`
   - `bunx vitest run --silent='passed-only' 'tests/scripts/rebrandHermesChat.test.ts'`
4. **Visual QA:** Trigger Percy/Chromatic pipelines and accept new baselines
   after verifying theme selectors render as expected.
5. **Documentation:** Update `docs/development/design-system.md` if new tokens or
   prefixes are introduced via CLI overrides (e.g., `THEME_TOKEN_PREFIX`).

## Rollback workflow

1. Run `./scripts/rebrand_hermes_chat.sh apply --dry-run -- --mode validate` to
   inspect pending replacements while executing regression tests.
2. Re-enable legacy constants by editing
   `packages/const/src/theme.ts` (the aliases are safe through 2025-Q4).
3. Re-run the Vitest suite to confirm parity and document the rollback in
   `docs/changelog/2025-hermes-chat-launch.md` with timestamps.
4. Notify QA to restore Percy/Chromatic baselines if the rollback reverts DOM
   identifiers (e.g., `#hermes-mobile-scroll-container`).

## Operational notes

- `THEME_TOKEN_PREFIX` environment variable customizes the constant prefix for
  bespoke white-label deployments.
- The TypeScript CLI now exposes `--mode lint-strings` and `--mode validate`
  options; both execute the new theme cookie tests automatically.
- Automation scripts emit per-rule replacement counts so you can trace unexpected
  diffs quickly. Capture the CLI output in change-management tickets for audit
  trails.
