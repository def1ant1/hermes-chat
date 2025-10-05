import type { HighlighterProps, MermaidProps, NeutralColors, PrimaryColors } from '@hermeslabs/ui';

import type { ResponseAnimationStyle } from '../../aiProvider';

export type AnimationMode = 'disabled' | 'agile' | 'elegant';

export interface UserGeneralConfig {
  animationMode?: AnimationMode;
  fontSize: number;
  highlighterTheme?: HighlighterProps['theme'];
  mermaidTheme?: MermaidProps['theme'];
  neutralColor?: NeutralColors;
  primaryColor?: PrimaryColors;
  transitionMode?: ResponseAnimationStyle;
}
