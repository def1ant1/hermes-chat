import { PluginSchema } from '@hermeslabs/types';

import { MetaData } from '@/types/meta';
import { HermesTool } from '@/types/tool';

const getPluginFormList = (list: HermesTool[], id: string) =>
  list?.find((p) => p.identifier === id);

const getPluginTitle = (meta?: MetaData) => meta?.title;
const getPluginDesc = (meta?: MetaData) => meta?.description;

const getPluginTags = (meta?: MetaData) => meta?.tags;
const getPluginAvatar = (meta?: MetaData) => meta?.avatar || '🧩';

const isCustomPlugin = (id: string, pluginList: HermesTool[]) =>
  pluginList.some((i) => i.identifier === id && i.type === 'customPlugin');

const isSettingSchemaNonEmpty = (schema?: PluginSchema) =>
  schema?.properties && Object.keys(schema.properties).length > 0;

export const pluginHelpers = {
  getPluginAvatar,
  getPluginDesc,
  getPluginFormList,
  getPluginTags,
  getPluginTitle,
  isCustomPlugin,
  isSettingSchemaNonEmpty,
};
