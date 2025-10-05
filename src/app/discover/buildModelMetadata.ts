import urlJoin from 'url-join';

import { BRANDING_NAME, ORG_NAME, SOCIAL_URL } from '@/const/branding';
import { GITHUB } from '@/const/url';
import type { Locales } from '@/locales/resources';
import { metadataModule } from '@/server/metadata';

export interface DiscoverModelMetadataContext {
  data: {
    displayName?: string | null;
    providers?: Array<{ name: string }> | null;
    releasedAt?: string | null;
  };
  identifier: string;
  locale: Locales;
  t: (key: string) => string;
  td: (key: string) => string;
}

export const buildDiscoverModelMetadata = ({
  data,
  identifier,
  locale,
  t,
  td,
}: DiscoverModelMetadataContext) => {
  const { displayName, releasedAt, providers } = data;
  const providerList = Array.isArray(providers) ? providers : [];

  return {
    authors: [
      { name: displayName || identifier },
      {
        name: ORG_NAME,
        url: SOCIAL_URL.github,
      },
      {
        name: BRANDING_NAME,
        url: GITHUB,
      },
    ],
    webpage: {
      enable: true,
      search: true,
    },
    ...metadataModule.generate({
      alternate: true,
      description: td(`${identifier}.description`) || t('discover.models.description'),
      locale,
      tags: providerList.map((item) => item.name),
      title: [displayName || identifier, t('discover.models.title')].join(' · '),
      url: urlJoin('/discover/model', identifier),
    }),
    other: {
      'article:author': displayName || identifier,
      'article:published_time': releasedAt
        ? new Date(releasedAt).toISOString()
        : new Date().toISOString(),
      'robots': 'index,follow,max-image-preview:large',
    },
  };
};
