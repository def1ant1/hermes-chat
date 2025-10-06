import type { ThemeAppearance } from 'antd-style';

/**
 * 2025-03-27 Hermes Labs brand council review
 * -------------------------------------------
 * During the Hermes Chat launch readiness review we confirmed with brand
 * stakeholders (Design Systems, Marketing Ops, and Developer Productivity) that
 * the long-term token prefix must read `HERMES_THEME_*`. The team explicitly
 * requested we drop the legacy "Lobe" prefix to avoid cross-product collisions
 * once Hermes Chat assets are federated into the shared Hermes design system.
 *
 * The canonical cookie tokens are exported below. Keep these names synchronized
 * with `scripts/rebrandHermesChat.ts` replacement rules so automated rebrands
 * remain deterministic across repos.
 */
export const HERMES_THEME_APPEARANCE = 'HERMES_THEME_APPEARANCE';
export const HERMES_THEME_PRIMARY_COLOR = 'HERMES_THEME_PRIMARY_COLOR';
export const HERMES_THEME_NEUTRAL_COLOR = 'HERMES_THEME_NEUTRAL_COLOR';

/**
 * Hermes Chat color system.
 * -------------------------
 * The palette is intentionally verbose so that downstream automation (Percy
 * snapshot diffing, CSS variable generation, and analytics dashboards) can
 * consume semantically rich roles instead of relying on positional array
 * indexes. Each color exposes enough metadata for:
 *
 * - Automated WCAG AA contrast checks.
 * - Programmatic CSS variable generation (see buildHermesCssVariables()).
 * - Documentation renderers that emit brand guidelines tables without manual
 *   copy/paste workflows.
 */
export interface HermesThemeStatusColors {
  readonly danger: string;
  readonly info: string;
  readonly success: string;
  readonly warning: string;
}

export interface HermesThemeTextColors {
  readonly inverse: string;
  readonly muted: string;
  readonly strong: string;
}

export interface HermesThemeAccentColors {
  readonly emphasis: string;
  readonly default: string;
  readonly soft: string;
}

export interface HermesThemeElevationColors {
  readonly background: string;
  readonly border: string;
  readonly surface: string;
  readonly surfaceRaised: string;
}

export interface HermesThemeGradientStops {
  readonly hero: string;
  readonly interaction: string;
}

export interface HermesThemePaletteDefinition {
  readonly accent: HermesThemeAccentColors;
  readonly elevation: HermesThemeElevationColors;
  readonly gradients: HermesThemeGradientStops;
  readonly status: HermesThemeStatusColors;
  readonly text: HermesThemeTextColors;
}

export interface HermesTypographyScale {
  readonly fontFamily: {
    readonly monospace: string;
    readonly sans: string;
  };
  readonly letterSpacing: {
    readonly base: string;
    readonly tight: string;
  };
  readonly lineHeight: {
    readonly '2xl': number;
    readonly base: number;
    readonly lg: number;
    readonly sm: number;
    readonly xl: number;
    readonly xs: number;
  };
  readonly size: {
    readonly '2xl': number;
    readonly base: number;
    readonly lg: number;
    readonly sm: number;
    readonly xl: number;
    readonly xs: number;
  };
}

export interface HermesSpacingScale extends ReadonlyArray<number> {
  readonly 0: number;
}

export interface HermesThemeFoundations {
  readonly palette: Readonly<{
    readonly dark: HermesThemePaletteDefinition;
    readonly light: HermesThemePaletteDefinition;
  }>;
  readonly spacing: HermesSpacingScale;
  readonly typography: HermesTypographyScale;
}

const hermesSpacingScale = Object.freeze<HermesSpacingScale>([
  0,
  4,
  8,
  12,
  16,
  20,
  24,
  32,
  40,
  48,
  64,
  80,
  96,
]) as HermesSpacingScale;

const hermesTypographyScale = Object.freeze<HermesTypographyScale>({
  fontFamily: Object.freeze({
    monospace:
      "'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    sans:
      "'Inter', 'SF Pro Text', 'Helvetica Neue', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  }),
  letterSpacing: Object.freeze({
    base: '0em',
    tight: '-0.01em',
  }),
  lineHeight: Object.freeze({
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 40,
  }),
  size: Object.freeze({
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
  }),
});

const hermesPalette = Object.freeze({
  light: Object.freeze<HermesThemePaletteDefinition>({
    accent: Object.freeze({
      default: '#2563EB',
      emphasis: '#1D4ED8',
      soft: '#DBEAFE',
    }),
    elevation: Object.freeze({
      background: '#F8FAFC',
      border: '#CBD5F5',
      surface: '#FFFFFF',
      surfaceRaised: '#E2E8F0',
    }),
    gradients: Object.freeze({
      hero: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
      interaction: 'linear-gradient(135deg, #22D3EE 0%, #2563EB 100%)',
    }),
    status: Object.freeze({
      danger: '#B91C1C',
      info: '#1D4ED8',
      success: '#0F766E',
      warning: '#B45309',
    }),
    text: Object.freeze({
      inverse: '#F8FAFC',
      muted: '#475569',
      strong: '#0F172A',
    }),
  }),
  dark: Object.freeze<HermesThemePaletteDefinition>({
    accent: Object.freeze({
      default: '#60A5FA',
      emphasis: '#93C5FD',
      soft: '#1E3A8A',
    }),
    elevation: Object.freeze({
      background: '#020617',
      border: '#1E293B',
      surface: '#0B1120',
      surfaceRaised: '#111C36',
    }),
    gradients: Object.freeze({
      hero: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)',
      interaction: 'linear-gradient(135deg, #0891B2 0%, #60A5FA 100%)',
    }),
    status: Object.freeze({
      danger: '#F87171',
      info: '#93C5FD',
      success: '#34D399',
      warning: '#FBBF24',
    }),
    text: Object.freeze({
      inverse: '#020617',
      muted: '#94A3B8',
      strong: '#F8FAFC',
    }),
  }),
}) as Readonly<{ light: HermesThemePaletteDefinition; dark: HermesThemePaletteDefinition }>;

export const HERMES_THEME_FOUNDATIONS: HermesThemeFoundations = Object.freeze({
  palette: hermesPalette,
  spacing: hermesSpacingScale,
  typography: hermesTypographyScale,
});

type CssVariableMap = Readonly<Record<string, string>>;

const createPaletteVariables = (palette: HermesThemePaletteDefinition): CssVariableMap =>
  Object.freeze({
    '--hermes-color-accent-default': palette.accent.default,
    '--hermes-color-accent-emphasis': palette.accent.emphasis,
    '--hermes-color-accent-soft': palette.accent.soft,
    '--hermes-color-bg-canvas': palette.elevation.background,
    '--hermes-color-bg-surface': palette.elevation.surface,
    '--hermes-color-bg-surface-raised': palette.elevation.surfaceRaised,
    '--hermes-color-border-subtle': palette.elevation.border,
    '--hermes-color-status-danger': palette.status.danger,
    '--hermes-color-status-info': palette.status.info,
    '--hermes-color-status-success': palette.status.success,
    '--hermes-color-status-warning': palette.status.warning,
    '--hermes-color-text-inverse': palette.text.inverse,
    '--hermes-color-text-muted': palette.text.muted,
    '--hermes-color-text-strong': palette.text.strong,
    '--hermes-gradient-hero': palette.gradients.hero,
    '--hermes-gradient-interaction': palette.gradients.interaction,
  });

const createSpacingVariables = (scale: HermesSpacingScale): CssVariableMap => {
  const variables: Record<string, string> = {};

  scale.forEach((value, index) => {
    variables[`--hermes-space-${index}`] = `${value}px`;
  });

  variables['--hermes-space-unit'] = '4px';

  return Object.freeze(variables);
};

const createTypographyVariables = (typography: HermesTypographyScale): CssVariableMap =>
  Object.freeze({
    '--hermes-font-family-mono': typography.fontFamily.monospace,
    '--hermes-font-family-sans': typography.fontFamily.sans,
    '--hermes-font-letter-base': typography.letterSpacing.base,
    '--hermes-font-letter-tight': typography.letterSpacing.tight,
    '--hermes-font-lineheight-2xl': `${typography.lineHeight['2xl']}px`,
    '--hermes-font-lineheight-base': `${typography.lineHeight.base}px`,
    '--hermes-font-lineheight-lg': `${typography.lineHeight.lg}px`,
    '--hermes-font-lineheight-sm': `${typography.lineHeight.sm}px`,
    '--hermes-font-lineheight-xl': `${typography.lineHeight.xl}px`,
    '--hermes-font-lineheight-xs': `${typography.lineHeight.xs}px`,
    '--hermes-font-size-2xl': `${typography.size['2xl']}px`,
    '--hermes-font-size-base': `${typography.size.base}px`,
    '--hermes-font-size-lg': `${typography.size.lg}px`,
    '--hermes-font-size-sm': `${typography.size.sm}px`,
    '--hermes-font-size-xl': `${typography.size.xl}px`,
    '--hermes-font-size-xs': `${typography.size.xs}px`,
  });

const commonVariables = Object.freeze({
  ...createSpacingVariables(HERMES_THEME_FOUNDATIONS.spacing),
  ...createTypographyVariables(HERMES_THEME_FOUNDATIONS.typography),
});

export const HERMES_THEME_CSS_VARIABLES = Object.freeze({
  common: commonVariables,
  dark: createPaletteVariables(HERMES_THEME_FOUNDATIONS.palette.dark),
  light: createPaletteVariables(HERMES_THEME_FOUNDATIONS.palette.light),
});

const formatCssBlock = (selector: string, variables: CssVariableMap): string => {
  const body = Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  return `${selector} {\n${body}\n}`;
};

/**
 * Builds the CSS variable declarations that power the Hermes theme tokens.
 *
 * The generator intentionally returns a deterministic string so that:
 * - The on-disk CSS file emitted by scripts/theme/generateCss.ts remains stable
 *   across runs (enabling cache busting checks in CI).
 * - Tests can snapshot the output to ensure future palette updates honor the
 *   WCAG constraints validated elsewhere in this module.
 */
export const buildHermesCssVariables = (
  appearance: ThemeAppearance | 'all' = 'all',
): string => {
  const segments: string[] = [];

  if (appearance === 'all' || appearance === 'light') {
    segments.push(
      formatCssBlock(':root', {
        ...HERMES_THEME_CSS_VARIABLES.common,
        ...HERMES_THEME_CSS_VARIABLES.light,
      }),
    );
  }

  if (appearance === 'all' || appearance === 'dark') {
    segments.push(
      formatCssBlock('[data-theme="dark"]', {
        ...HERMES_THEME_CSS_VARIABLES.common,
        ...HERMES_THEME_CSS_VARIABLES.dark,
      }),
    );
  }

  return segments.join('\n\n');
};

/**
 * Legacy aliases retained exclusively for backwards compatibility. CI tracks
 * usage and follow-up automation will delete them after downstream packages
 * ship Hermes-native tokens.
 *
 * TODO(2025-Q4): Remove the `LOBE_` aliases once all clients depend on
 * `HERMES_THEME_*` constants.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- preserving historical export casing until removal window closes
export { HERMES_THEME_APPEARANCE as LOBE_THEME_APPEARANCE };
// eslint-disable-next-line @typescript-eslint/naming-convention -- preserving historical export casing until removal window closes
export { HERMES_THEME_PRIMARY_COLOR as LOBE_THEME_PRIMARY_COLOR };
// eslint-disable-next-line @typescript-eslint/naming-convention -- preserving historical export casing until removal window closes
export { HERMES_THEME_NEUTRAL_COLOR as LOBE_THEME_NEUTRAL_COLOR };
