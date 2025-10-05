import { HermesTool } from '@/types/tool';

export type PluginsSettings = Record<string, any>;

export interface PluginState {
  installedPlugins: HermesTool[];
  loadingInstallPlugins: boolean;
  pluginsSettings: PluginsSettings;
  updatePluginSettingsSignal?: AbortController;
}

export const initialPluginState: PluginState = {
  installedPlugins: [],
  loadingInstallPlugins: true,
  pluginsSettings: {},
};
