import type { HermesChatPluginManifest, HermesPluginType } from '../plugins/meta';
import { CustomPluginParams } from './plugin';
import { HermesToolType } from './tool';

export interface HermesTool {
  customParams?: CustomPluginParams | null;
  identifier: string;
  manifest?: HermesChatPluginManifest | null;
  /**
   * use for runtime
   */
  runtimeType?: 'mcp' | 'default' | 'markdown' | 'standalone';
  settings?: any;
  // TODO: remove type and then make it required
  source?: HermesToolType;
  /**
   * need to be replaced with source
   * @deprecated
   */
  type: HermesToolType;
}

export type HermesToolRenderType = HermesPluginType | 'builtin';

export * from './builtin';
export * from './interpreter';
export * from './plugin';
