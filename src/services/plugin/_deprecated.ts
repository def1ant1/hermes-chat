import type { HermesChatPluginManifest } from '@hermeslabs/types';

import { PluginModel } from '@/database/_deprecated/models/plugin';
import { HermesTool } from '@/types/tool';
import { HermesToolCustomPlugin } from '@/types/tool/plugin';

import { IPluginService, InstallPluginParams } from './type';

export class ClientService implements IPluginService {
  installPlugin = async (plugin: InstallPluginParams) => {
    return PluginModel.create(plugin);
  };

  getInstalledPlugins = () => {
    return PluginModel.getList() as Promise<HermesTool[]>;
  };

  uninstallPlugin(identifier: string) {
    return PluginModel.delete(identifier);
  }

  async createCustomPlugin(customPlugin: HermesToolCustomPlugin) {
    return PluginModel.create({ ...customPlugin, type: 'customPlugin' });
  }

  async updatePlugin(id: string, value: Partial<HermesToolCustomPlugin>) {
    await PluginModel.update(id, value);
    return;
  }
  async updatePluginManifest(id: string, manifest: HermesChatPluginManifest) {
    await PluginModel.update(id, { manifest });
  }

  async removeAllPlugins() {
    return PluginModel.clear();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updatePluginSettings(id: string, settings: any, _?: AbortSignal) {
    await PluginModel.update(id, { settings });
  }
}
