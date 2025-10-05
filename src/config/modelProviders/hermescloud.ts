import {
  HERMES_CLOUD_PROVIDER_ID,
  HERMES_CLOUD_PROVIDER_NAME,
  HERMES_CLOUD_PROVIDER_PRICING_URL,
  HERMES_CLOUD_PROVIDER_URL,
} from '@/const/app';
import { ModelProviderCard } from '@/types/llm';

/**
 * NOTE(HERMES-BRAND-2025-02-17): Hermes Labs brand/product council selected
 * `hermescloud` as the canonical managed provider slug, "Hermes Cloud" for the
 * public display name, and https://cloud.hermes.chat/* as the persistent
 * marketing/documentation URLs. Capture this here to prevent regressions during
 * future rebrands or localization sweeps.
 */
const HermesCloud: ModelProviderCard = {
  chatModels: [],
  description:
    'Hermes Cloud 通过 Hermes Labs 官方托管的 API 提供企业级模型访问，并使用 Credits 计量大模型消耗，确保治理审计和配额跟踪一致。',
  enabled: true,
  id: HERMES_CLOUD_PROVIDER_ID,
  modelsUrl: HERMES_CLOUD_PROVIDER_PRICING_URL,
  name: HERMES_CLOUD_PROVIDER_NAME,
  settings: {
    modelEditable: false,
    showAddNewModel: false,
    showModelFetcher: false,
  },
  showConfig: false,
  url: HERMES_CLOUD_PROVIDER_URL,
};

export default HermesCloud;

export const planCardModels = ['gpt-4o-mini', 'deepseek-reasoner', 'claude-3-5-sonnet-latest'];
