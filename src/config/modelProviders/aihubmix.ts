import { ModelProviderCard } from '@/types/llm';

import { buildHermesReferralUrl } from './utils/referral';

// NOTE(HERMES-GROWTH-2025-02-18): Growth approved the AiHubMix referral slug to
// keep attribution clean while their ops team retires the legacy lobe.li short
// codes. The go.hermes.chat redirect preserves downstream partner tracking.
const AIHUBMIX_API_KEY_REFERRAL = buildHermesReferralUrl({
  destination: 'aihubmix-api-keys',
  slug: 'aihubmix',
});

const AIHUBMIX_LANDING_REFERRAL = buildHermesReferralUrl({ slug: 'aihubmix' });

const AiHubMix: ModelProviderCard = {
  apiKeyUrl: AIHUBMIX_API_KEY_REFERRAL,
  chatModels: [],
  checkModel: 'gpt-4.1-nano',
  description: 'AiHubMix 通过统一的 API 接口提供对多种 AI 模型的访问。',
  id: 'aihubmix',
  modelsUrl: 'https://docs.aihubmix.com/cn/api/Model-List',
  name: 'AiHubMix',
  settings: {
    sdkType: 'router',
    showModelFetcher: true,
  },
  // Growth asked us to hold a short-lived redirect here while their analytics
  // warehouse migrates dashboards off of the lobehub source. Once Segment is
  // re-keyed we can collapse this into a direct AiHubMix deep link.
  url: AIHUBMIX_LANDING_REFERRAL,
};

export default AiHubMix;
