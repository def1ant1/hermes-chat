#!/usr/bin/env tsx
/**
 * Hermes CDN purge helper
 * -----------------------
 * The Hermes brand deployment must invalidate cached theme assets whenever the
 * palette shifts to keep static landing pages, marketing emails, and docs in
 * sync with the production application. Rather than relying on humans to click
 * provider dashboards, this script issues a programmatic purge request using the
 * configured CDN API endpoint.
 *
 * Environment variables:
 * - HERMES_CDN_PURGE_ENDPOINT: HTTPS endpoint that accepts a POST purge request.
 *   Defaults to the Hermes CDN Fastly worker shim.
 * - HERMES_CDN_PURGE_TOKEN: Bearer or custom token used for authentication.
 * - HERMES_THEME_CDN_PATHS: Comma-separated asset paths to purge. Defaults to the
 *   generated CSS variable file.
 * - HERMES_THEME_PURGE_DRY_RUN: When set to "true", logs the request body without
 *   contacting the CDN (useful for CI dry runs).
 */

import { setTimeout } from 'node:timers/promises';

const endpoint = process.env.HERMES_CDN_PURGE_ENDPOINT ?? 'https://cdn.hermes.chat/api/purge';
const token = process.env.HERMES_CDN_PURGE_TOKEN;
const dryRun = (process.env.HERMES_THEME_PURGE_DRY_RUN ?? 'false').toLowerCase() === 'true';
const assetPaths = (process.env.HERMES_THEME_CDN_PATHS ?? '/assets/hermes-chat/theme.css')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

async function purge(): Promise<void> {
  const payload = {
    assets: assetPaths,
    requestedAt: new Date().toISOString(),
  };

  if (dryRun || !token) {
    const reason = dryRun ? 'dry-run enabled' : 'missing HERMES_CDN_PURGE_TOKEN';
    // eslint-disable-next-line no-console -- surfaced for operators running the CLI.
    console.log(`[cdn] Skipping purge (${reason}). Payload: ${JSON.stringify(payload)}`);
    return;
  }

  // eslint-disable-next-line no-console -- surfaced for operators running the CLI.
  console.log(`[cdn] Purging Hermes theme assets via ${endpoint}`);
  const response = await fetch(endpoint, {
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to purge CDN cache: ${response.status} ${response.statusText} – ${text}`);
  }

  // Give edge caches a brief moment to propagate the purge before the script
  // exits. This makes sequential automation (e.g., screenshot diffing) more
  // deterministic without blocking for extended periods.
  await setTimeout(250);

  // eslint-disable-next-line no-console -- surfaced for operators running the CLI.
  console.log('[cdn] Hermes theme CDN purge completed successfully.');
}

void purge();
