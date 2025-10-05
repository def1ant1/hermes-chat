'use client';

import { useQueryState } from 'nuqs';
import { memo, useEffect } from 'react';

import { HERMES_URL_IMPORT_NAME } from '@/const/url';
import { useUserStore } from '@/store/user';

const ImportSettings = memo(() => {
  const [importUrlShareSettings, isUserStateInit] = useUserStore((s) => [
    s.importUrlShareSettings,
    s.isUserStateInit,
  ]);

  // Import settings from the url
  const [searchParam] = useQueryState(HERMES_URL_IMPORT_NAME, {
    clearOnDefault: true,
    defaultValue: '',
  });

  useEffect(() => {
    // Why use `usUserStateInit`,
    // see: https://github.com/hermeslabs/hermes-chat/pull/4072
    if (searchParam && isUserStateInit) importUrlShareSettings(searchParam);
  }, [searchParam, isUserStateInit]);

  return null;
});

export default ImportSettings;
