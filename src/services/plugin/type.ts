import type { HermesChatPluginManifest } from '@hermeslabs/types';

import { HermesTool } from '@/types/tool';
import { HermesToolCustomPlugin } from '@/types/tool/plugin';

export interface InstallPluginParams {
  customParams?: Record<string, any>;
  identifier: string;
  manifest: HermesChatPluginManifest;
  settings?: Record<string, any>;
  type: 'plugin' | 'customPlugin';
}

export interface IPluginService {
  createCustomPlugin: (customPlugin: HermesToolCustomPlugin) => Promise<void>;
  getInstalledPlugins: () => Promise<HermesTool[]>;
  installPlugin: (plugin: InstallPluginParams) => Promise<void>;
  removeAllPlugins: () => Promise<void>;
  uninstallPlugin: (identifier: string) => Promise<void>;
  updatePlugin: (id: string, value: Partial<HermesToolCustomPlugin>) => Promise<void>;
  updatePluginManifest: (id: string, manifest: HermesChatPluginManifest) => Promise<void>;
  updatePluginSettings: (id: string, settings: any, signal?: AbortSignal) => Promise<void>;
}
