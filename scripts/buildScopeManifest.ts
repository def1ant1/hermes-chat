import path from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';

import { LEGACY_SCOPE, discoverScopeMatches } from './utils/scopeScanner';

/* eslint-disable unicorn/prefer-top-level-await -- tsx transpiles this script to CJS, so we keep an async entrypoint for compatibility. */

/**
 * Entry point for generating a JSON manifest of every file that still references the legacy scope.
 * We commit the manifest as part of the rebranding workflow so the entire organisation can audit the
 * remaining work or plug the data into dashboards. Treating the manifest as an artefact also lets
 * downstream codemods consume it without running ripgrep repeatedly, which keeps CI fast.
 */
async function main(): Promise<void> {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      manifest: { type: 'string' },
      root: { type: 'string' },
    },
  });

  const root = values.root ? path.resolve(values.root) : process.cwd();
  const manifestPath = values.manifest ?? path.join('scripts', 'manifests', 'scope-usage.json');

  const matches = await discoverScopeMatches({ manifestPath, root });

  if (matches.length === 0) {
    console.log(
      `No files still reference the legacy ${LEGACY_SCOPE} scope. Manifest generated for auditing.`,
    );
    return;
  }

  console.log(
    `Discovered ${matches.length} files referencing the legacy scope. Manifest written to ${manifestPath}.`,
  );
  for (const match of matches) {
    console.log(` - [${match.category}] ${match.relativePath}`);
  }
}

main().catch((error) => {
  console.error('Failed to build scope manifest', error);
  process.exitCode = 1;
});
