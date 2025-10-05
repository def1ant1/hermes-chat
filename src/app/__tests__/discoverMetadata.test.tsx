import { describe, expect, it, vi } from 'vitest';

import { buildDiscoverModelMetadata } from '@/app/discover/buildModelMetadata';

// Vitest's happy-dom environment expects a global `dispose` reference when
// running in isolated worker pools. CI occasionally boots with a minimal
// global scope, so we eagerly seed a no-op implementation to prevent
// ReferenceError crashes that would otherwise mask genuine assertion
// failures. This keeps the focused snapshot test deterministic across
// environments without mutating shared setup files.
const globalAny = globalThis as typeof globalThis & { dispose?: () => void };
if (typeof globalAny.dispose !== 'function') {
  globalAny.dispose = () => {};
}

// Hoist the mock so Vitest resolves it during module evaluation, ensuring the
// helper never touches the real Next.js metadata utilities during tests.
const metadataModuleMock = vi.hoisted(() => ({
  metadataModule: {
    generate: vi.fn((input: Record<string, unknown>) => ({
      ...input,
      __brand: 'hermes-chat-test-metadata',
    })),
  },
}));

vi.mock('@/server/metadata', () => metadataModuleMock);

describe('Discover model metadata', () => {
  it('generates Hermes-aligned metadata snapshot', () => {
    const result = buildDiscoverModelMetadata({
      data: {
        displayName: 'Hermes Reasoner',
        providers: [{ name: 'Hermes Cloud' }],
        releasedAt: '2025-01-01T00:00:00.000Z',
      },
      identifier: 'hermes/reasoner',
      locale: 'en-US',
      t: (key: string) => `metadata:${key}`,
      td: (key: string) => `models:${key}`,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "__brand": "hermes-chat-test-metadata",
        "alternate": true,
        "authors": [
          {
            "name": "Hermes Reasoner",
          },
          {
            "name": "Hermes Labs",
            "url": "https://github.com/hermes-chat",
          },
          {
            "name": "Hermes Chat",
            "url": "https://github.com/hermes-chat/hermes-chat",
          },
        ],
        "description": "models:hermes/reasoner.description",
        "locale": "en-US",
        "other": {
          "article:author": "Hermes Reasoner",
          "article:published_time": "2025-01-01T00:00:00.000Z",
          "robots": "index,follow,max-image-preview:large",
        },
        "tags": [
          "Hermes Cloud",
        ],
        "title": "Hermes Reasoner · metadata:discover.models.title",
        "url": "/discover/model/hermes/reasoner",
        "webpage": {
          "enable": true,
          "search": true,
        },
      }
    `);
  });
});
