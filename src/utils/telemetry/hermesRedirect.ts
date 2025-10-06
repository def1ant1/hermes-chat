import debug from 'debug';

import { HERMES_DOMAIN_REDIRECT_ANALYTICS_PARAMS } from '@/config/redirects/hermesDomains';

const log = debug('telemetry:redirect');

const TELEMETRY_ENDPOINT = process.env.HERMES_REDIRECT_TELEMETRY_ENDPOINT;
const TELEMETRY_TIMEOUT_MS = Number.parseInt(process.env.HERMES_REDIRECT_TELEMETRY_TIMEOUT_MS || '750', 10);

export interface HermesRedirectTelemetryPayload {
  readonly analytics?: Readonly<Record<string, string>>;
  readonly destination: string;
  readonly event: string;
  readonly featureFlag: string;
  readonly method: string;
  readonly originalHost: string;
  readonly originalPath: string;
  readonly permanent: boolean;
  readonly tags: readonly string[];
}

const buildTelemetryEnvelope = (payload: HermesRedirectTelemetryPayload) => ({
  event: payload.event,
  properties: {
    analytics: payload.analytics ?? HERMES_DOMAIN_REDIRECT_ANALYTICS_PARAMS,
    destination: payload.destination,
    featureFlag: payload.featureFlag,
    method: payload.method,
    originalHost: payload.originalHost,
    originalPath: payload.originalPath,
    permanent: payload.permanent,
    tags: payload.tags,
  },
  timestamp: new Date().toISOString(),
});

export const emitHermesRedirectTelemetry = async (
  payload: HermesRedirectTelemetryPayload,
): Promise<void> => {
  const envelope = buildTelemetryEnvelope(payload);

  if (!TELEMETRY_ENDPOINT || typeof fetch !== 'function') {
    log('redirect telemetry (buffered): %O', envelope);
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = Number.isFinite(TELEMETRY_TIMEOUT_MS) ? TELEMETRY_TIMEOUT_MS : 750;
    const timeoutHandle = setTimeout(() => controller.abort(), timeout);

    await fetch(TELEMETRY_ENDPOINT, {
      body: JSON.stringify(envelope),
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      method: 'POST',
      signal: controller.signal,
    });

    clearTimeout(timeoutHandle);
    log('redirect telemetry dispatched to %s', TELEMETRY_ENDPOINT);
  } catch (error) {
    log('failed to dispatch redirect telemetry: %O', error);
  }
};
