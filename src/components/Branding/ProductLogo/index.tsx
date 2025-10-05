import type { HermesLabsBrandProps } from '@hermeslabs/types';
import { LobeHub as HermesLabs } from '@hermeslabs/ui/brand';
import { memo } from 'react';

import { isCustomBranding } from '@/const/version';

import CustomLogo from './Custom';

interface ProductLogoProps extends HermesLabsBrandProps {
  height?: number;
  width?: number;
}

export const ProductLogo = memo<ProductLogoProps>((props) => {
  if (isCustomBranding) {
    return <CustomLogo {...props} />;
  }

  return <HermesLabs {...props} />;
});
