import type { HermesLabsBrandProps } from '@hermeslabs/types';
import { LobeHub as HermesLabs } from '@hermeslabs/ui/brand';
import { memo } from 'react';

import { ORG_NAME } from '@/const/branding';
import { isCustomORG } from '@/const/version';

export const OrgBrand = memo<HermesLabsBrandProps>((props) => {
  if (isCustomORG) {
    return <span>{ORG_NAME}</span>;
  }

  return <HermesLabs {...props} />;
});
