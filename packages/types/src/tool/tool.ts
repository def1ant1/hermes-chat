import { MetaData } from '../meta';

export type HermesToolType = 'builtin' | 'customPlugin' | 'plugin';

export interface HermesToolMeta extends MetaData {
  author?: string;
  identifier: string;
  /**
   * @deprecated
   */
  meta: MetaData;
  type: HermesToolType;
}
