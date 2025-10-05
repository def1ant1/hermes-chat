import { resolve } from 'node:path';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { isHermesCloudProviderId } from '@/const/app';

export const root = resolve(__dirname, '../..');

export interface DataItem {
  author: string;
  createdAt: string;
  homepage: string;
  identifier: string;
  meta: { avatar: string; description: string; tags: string[]; title: string };
}

export const AGENT_URL = 'https://chat-agents.lobehub.com/index.json';
export const AGENT_I18N_URL = (lang: string) =>
  `https://chat-agents.lobehub.com/index.${lang}.json`;
export const PLUGIN_URL = 'https://chat-plugins.lobehub.com/index.json';
export const PLUGIN_I18N_URL = (lang: string) =>
  `https://chat-plugins.lobehub.com/index.${lang}.json`;

export const AGENT_SPLIT = '<!-- AGENT LIST -->';
export const PLUGIN_SPLIT = '<!-- PLUGIN LIST -->';
export const PROVIDER_SPLIT = '<!-- PROVIDER LIST -->';

export const PROVIDER_LIST = DEFAULT_MODEL_PROVIDER_LIST.filter((item) => {
  const isHermesCloud = isHermesCloudProviderId(item.id);
  // TODO(HERMES-DISCOVER-2025-06-30): Remove the legacy slug filter once
  // automation emits `hermescloud` directly.
  return item.chatModels.length > 0 && !isHermesCloud;
}).map((item) => {
  return {
    id: item.id,
    name: item.name,
  };
});
