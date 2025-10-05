import { describe, expectTypeOf, it } from 'vitest';

import type {
  HermesChatPluginApi,
  HermesChatPluginManifest,
  LobeChatPluginApi,
  LobeChatPluginManifest,
} from '../types';

/**
 * Enterprise readiness check: these assertions guarantee the Hermes-prefixed
 * interfaces remain structurally identical to their legacy counterparts while
 * the broader monorepo finishes migrating via automation. This reduces manual
 * QA lift for teams consuming the context engine types.
 */
describe('Hermes Chat plugin type migration', () => {
  it('retains API shape compatibility between Hermes and legacy aliases', () => {
    expectTypeOf<HermesChatPluginApi>().toEqualTypeOf<LobeChatPluginApi>();
  });

  it('retains manifest shape compatibility between Hermes and legacy aliases', () => {
    expectTypeOf<HermesChatPluginManifest>().toEqualTypeOf<LobeChatPluginManifest>();
  });

  it('exposes Hermes-prefixed manifest utilities for downstream tooling', () => {
    const manifest: HermesChatPluginManifest = {
      api: [
        {
          description: 'Checks connectivity with enterprise MCP hosts',
          name: 'healthCheck',
          parameters: { type: 'object', properties: {} },
        },
      ],
      identifier: 'enterprise-health-check',
      meta: { tier: 'enterprise' },
      systemRole: 'assistant',
      type: 'standalone',
    };

    const legacyManifest: LobeChatPluginManifest = manifest;

    expectTypeOf(legacyManifest).toMatchTypeOf<HermesChatPluginManifest>();
  });
});
