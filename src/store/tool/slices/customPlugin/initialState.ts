import { HermesToolCustomPlugin } from '@/types/tool/plugin';

export interface CustomPluginState {
  newCustomPlugin: Partial<HermesToolCustomPlugin>;
}
export const defaultCustomPlugin: Partial<HermesToolCustomPlugin> = {
  customParams: {
    apiMode: 'simple',
    enableSettings: false,
    manifestMode: 'url',
  },
  type: 'customPlugin',
};

export const initialCustomPluginState: CustomPluginState = {
  newCustomPlugin: defaultCustomPlugin,
};
