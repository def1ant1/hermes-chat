import { HERMES_THEME_CSS_VARIABLES } from '@/const/theme';
import { Theme, css } from 'antd-style';

const formatVariables = (variables: Readonly<Record<string, string>>): string =>
  Object.entries(variables)
    .map(([name, value]) => `    ${name}: ${value};`)
    .join('\n');

// fix ios input keyboard
// overflow: hidden;
// ref: https://zhuanlan.zhihu.com/p/113855026
export default ({ token }: { prefixCls: string; token: Theme }) => css`
  :root {
    ${formatVariables({
      ...HERMES_THEME_CSS_VARIABLES.common,
      ...HERMES_THEME_CSS_VARIABLES.light,
    })}
  }

  [data-theme='dark'] {
    ${formatVariables({
      ...HERMES_THEME_CSS_VARIABLES.common,
      ...HERMES_THEME_CSS_VARIABLES.dark,
    })}
  }

  html,
  body,
  #__next {
    position: relative;

    overscroll-behavior: none;

    height: 100%;
    min-height: 100dvh;
    max-height: 100dvh;

    background: var(--hermes-color-bg-canvas, ${token.colorBgLayout});
    color: var(--hermes-color-text-strong, ${token.colorText});

    @media (min-device-width: 576px) {
      overflow: hidden;
    }
  }

  body {
    /* 提高合成层级，强制硬件加速，否则会有渲染黑边出现 */
    will-change: opacity;
    transform: translateZ(0);
  }

  * {
    scrollbar-color: var(--hermes-color-text-muted, ${token.colorFill}) transparent;
    scrollbar-width: thin;

    ::-webkit-scrollbar {
      width: 0.75em;
      height: 0.75em;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
    }

    :hover::-webkit-scrollbar-thumb {
      border: 3px solid transparent;
      background-color: var(--hermes-color-text-strong, ${token.colorText});
      background-clip: content-box;
    }

    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }
`;
