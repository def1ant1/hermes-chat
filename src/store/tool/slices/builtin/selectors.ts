import { DalleManifest } from '@/tools/dalle';
import { HermesToolMeta } from '@/types/tool/tool';

import type { ToolStoreState } from '../../initialState';

const metaList =
  (showDalle?: boolean) =>
  (s: ToolStoreState): HermesToolMeta[] =>
    s.builtinTools
      .filter(
        (item) =>
          !item.hidden && (!showDalle ? item.identifier !== DalleManifest.identifier : true),
      )
      .map((t) => ({
        author: 'Hermes Labs',
        identifier: t.identifier,
        meta: t.manifest.meta,
        type: 'builtin',
      }));

export const builtinToolSelectors = {
  metaList,
};
