import { HermesToolRenderType } from '@/types/tool';

export interface V4ChatPluginPayload {
  apiName: string;
  arguments: string;
  identifier: string;
  type: HermesToolRenderType;
}

export interface V4Message {
  content: string;
  createdAt: number;
  id: string;
  plugin?: V4ChatPluginPayload;
  role: 'user' | 'system' | 'assistant' | 'function';
  updatedAt: number;
}

export interface V4ConfigState {
  messages: V4Message[];
}
