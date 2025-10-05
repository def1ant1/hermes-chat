import type {
  HermesChatPluginManifest,
  HermesChatPluginMeta,
  HermesChatPluginMetaSummary,
} from '../plugins/meta';

export enum PluginCategory {
  All = 'all',
  GamingEntertainment = 'gaming-entertainment',
  LifeStyle = 'lifestyle',
  MediaGenerate = 'media-generate',
  ScienceEducation = 'science-education',
  Social = 'social',
  StocksFinance = 'stocks-finance',
  Tools = 'tools',
  WebSearch = 'web-search',
}

export enum PluginNavKey {
  Settings = 'settings',
  Tools = 'tools',
}

export enum PluginSorts {
  CreatedAt = 'createdAt',
  Identifier = 'identifier',
  Title = 'title',
}

export interface DiscoverPluginItem
  extends Omit<HermesChatPluginMeta, 'meta'>,
    HermesChatPluginMetaSummary {
  category?: PluginCategory;
}

export interface PluginQueryParams {
  category?: string;
  locale?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: PluginSorts;
}

export interface PluginListResponse {
  currentPage: number;
  items: DiscoverPluginItem[];
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DiscoverPluginDetail extends Omit<DiscoverPluginItem, 'manifest'> {
  manifest?: HermesChatPluginManifest | string;
  related: DiscoverPluginItem[];
}
