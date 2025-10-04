#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Hermes Chat rebranding orchestrator
#
# This wrapper centralizes brand metadata and invokes the TypeScript automation
# so operators can run consistent migrations without manually remembering each
# flag. Review docs/development/rebranding.md for full instructions and
# rollback guidance before executing this script in production.
# -----------------------------------------------------------------------------
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/rebrand_hermes_chat.sh [options] [-- <extra tsx args>]

Options:
  --workspace <path>   Directory to rebrand (defaults to repo root)
  --dry-run            Preview changes without touching disk
  --help               Display this message

Environment overrides:
  BRAND_NAME, BRAND_SHORT_NAME, BRAND_DOMAIN,
  SUPPORT_EMAIL, SUPPORT_URL,
  CONTACT_EMAIL, CONTACT_DISCORD, CONTACT_TELEGRAM, CONTACT_WEBSITE,
  CDN_DOMAIN,
  ORGANIZATION_NAME, ORGANIZATION_DOMAIN,
  REPOSITORY_HOST, REPOSITORY_OWNER, REPOSITORY_NAME,
  ASSET_LOGO, ASSET_FAVICON, ASSET_WORDMARK, ASSET_BANNER

Any additional arguments after `--` are forwarded directly to the
TypeScript CLI for advanced scenarios (e.g., --metadata-file).
USAGE
}

BRAND_NAME=${BRAND_NAME:-"Hermes Chat"}
BRAND_SHORT_NAME=${BRAND_SHORT_NAME:-"Hermes"}
BRAND_DOMAIN=${BRAND_DOMAIN:-"hermes.chat"}
SUPPORT_EMAIL=${SUPPORT_EMAIL:-"support@hermes.chat"}
SUPPORT_URL=${SUPPORT_URL:-"https://hermes.chat/support"}
CONTACT_EMAIL=${CONTACT_EMAIL:-"hello@hermes.chat"}
CONTACT_DISCORD=${CONTACT_DISCORD:-"https://discord.gg/hermeschat"}
CONTACT_TELEGRAM=${CONTACT_TELEGRAM:-""}
CONTACT_WEBSITE=${CONTACT_WEBSITE:-"https://hermes.chat"}
CDN_DOMAIN=${CDN_DOMAIN:-"cdn.hermes.chat"}
ORGANIZATION_NAME=${ORGANIZATION_NAME:-"Hermes Labs"}
ORGANIZATION_DOMAIN=${ORGANIZATION_DOMAIN:-"hermeslabs.com"}
REPOSITORY_HOST=${REPOSITORY_HOST:-"github.com"}
REPOSITORY_OWNER=${REPOSITORY_OWNER:-"hermes-chat"}
REPOSITORY_NAME=${REPOSITORY_NAME:-"hermes-chat"}
ASSET_LOGO=${ASSET_LOGO:-"/assets/hermes-chat/logo.svg"}
ASSET_FAVICON=${ASSET_FAVICON:-"/assets/hermes-chat/favicon.png"}
ASSET_WORDMARK=${ASSET_WORDMARK:-"/assets/hermes-chat/wordmark.svg"}
ASSET_BANNER=${ASSET_BANNER:-"/assets/hermes-chat/banner.png"}

DRY_RUN=false
WORKSPACE=""
FORWARDED_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --workspace)
      WORKSPACE="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --)
      shift
      FORWARDED_ARGS+=("$@")
      break
      ;;
    *)
      FORWARDED_ARGS+=("$1")
      shift
      ;;
  esac
  continue
done

CLI_ARGS=(
  --brand-name "$BRAND_NAME"
  --brand-short-name "$BRAND_SHORT_NAME"
  --brand-domain "$BRAND_DOMAIN"
  --support-email "$SUPPORT_EMAIL"
  --support-url "$SUPPORT_URL"
  --contact-email "$CONTACT_EMAIL"
  --contact-discord "$CONTACT_DISCORD"
  --contact-telegram "$CONTACT_TELEGRAM"
  --contact-website "$CONTACT_WEBSITE"
  --cdn-domain "$CDN_DOMAIN"
  --organization-name "$ORGANIZATION_NAME"
  --organization-domain "$ORGANIZATION_DOMAIN"
  --repository-host "$REPOSITORY_HOST"
  --repository-owner "$REPOSITORY_OWNER"
  --repository-name "$REPOSITORY_NAME"
  --asset-logo "$ASSET_LOGO"
  --asset-favicon "$ASSET_FAVICON"
  --asset-wordmark "$ASSET_WORDMARK"
  --asset-banner "$ASSET_BANNER"
)

if [[ -n "$WORKSPACE" ]]; then
  CLI_ARGS+=(--workspace "$WORKSPACE")
fi

if [[ "$DRY_RUN" == "true" ]]; then
  CLI_ARGS+=(--dry-run)
fi

if [[ ${#FORWARDED_ARGS[@]} -gt 0 ]]; then
  CLI_ARGS+=("${FORWARDED_ARGS[@]}")
fi

echo "[rebrand] Executing Hermes Chat CLI via bunx tsx"
if [[ "$DRY_RUN" == "true" ]]; then
  echo "[rebrand] Dry run enabled; no files will be modified"
fi

set -x
bunx tsx scripts/rebrandHermesChat.ts "${CLI_ARGS[@]}"
set +x
