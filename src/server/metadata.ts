import { Metadata } from 'next';
import qs from 'query-string';

import { BRANDING_NAME, SOCIAL_HANDLE } from '@/const/branding';
import { DEFAULT_LANG } from '@/const/locale';
import { OG_URL } from '@/const/url';
import { Locales, locales } from '@/locales/resources';
import { getCanonicalUrl } from '@/server/utils/url';
import { formatDescLength, formatTitleLength } from '@/utils/genOG';

/**
 * Builds Open Graph and Twitter metadata tailored for Hermes Chat's brand
 * surface. Centralizing the logic guarantees that every route inherits the
 * approved product naming and social handles.
 */
export class Meta {
  public generate({
    description = 'Hermes Chat delivers a premium ChatGPT, OLLaMA, Gemini, and Claude WebUI with enterprise governance.',
    title,
    image = OG_URL,
    url,
    type = 'website',
    tags,
    alternate,
    locale = DEFAULT_LANG,
    canonical,
  }: {
    alternate?: boolean;
    canonical?: string;
    description?: string;
    image?: string;
    locale?: Locales;
    tags?: string[];
    title: string;
    type?: 'website' | 'article';
    url: string;
  }): Metadata {
    // eslint-disable-next-line no-param-reassign
    const formatedTitle = formatTitleLength(title, 21);
    // eslint-disable-next-line no-param-reassign
    const formatedDescription = formatDescLength(description, tags);
    const siteTitle = title.includes(BRANDING_NAME) ? title : title + ` · ${BRANDING_NAME}`;
    return {
      alternates: {
        canonical:
          canonical ||
          getCanonicalUrl(alternate ? qs.stringifyUrl({ query: { hl: locale }, url }) : url),
        languages: alternate ? this.genAlternateLocales(locale, url) : undefined,
      },
      description: formatedDescription,
      openGraph: this.genOpenGraph({
        alternate,
        description,
        image,
        locale,
        title: siteTitle,
        type,
        url,
      }),
      other: {
        robots: 'index,follow',
      },
      title: formatedTitle,
      twitter: this.genTwitter({ description, image, title: siteTitle, url }),
    };
  }

  /** Maps localized alternates so marketing campaigns can link canonical pages. */
  private genAlternateLocales = (locale: Locales, path: string = '/') => {
    let links: any = {};
    const defaultLink = getCanonicalUrl(path);
    for (const alterLocales of locales) {
      links[alterLocales] = qs.stringifyUrl({
        query: { hl: alterLocales },
        url: defaultLink,
      });
    }
    return {
      'x-default': defaultLink,
      ...links,
    };
  };

  /** Generates Twitter card details aligned to the Hermes Labs social handle. */
  private genTwitter({
    description,
    title,
    image,
    url,
  }: {
    description: string;
    image: string;
    title: string;
    url: string;
  }) {
    return {
      card: 'summary_large_image',
      description,
      images: [image],
      site: SOCIAL_HANDLE.x,
      title,
      url,
    };
  }

  /** Ensures OG payloads consistently advertise the Hermes Chat brand. */
  private genOpenGraph({
    alternate,
    locale = DEFAULT_LANG,
    description,
    title,
    image,
    url,
    type = 'website',
  }: {
    alternate?: boolean;
    description: string;
    image: string;
    locale: Locales;
    title: string;
    type?: 'website' | 'article';
    url: string;
  }) {
    const data: any = {
      description,
      images: [
        {
          alt: title,
          url: image,
        },
      ],
      locale,
      siteName: BRANDING_NAME,
      title,
      type,
      url,
    };

    if (alternate) {
      data['alternateLocale'] = locales;
    }

    return data;
  }
}

export const metadataModule = new Meta();
