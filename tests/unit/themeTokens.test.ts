import {
  HERMES_THEME_CSS_VARIABLES,
  HERMES_THEME_FOUNDATIONS,
  buildHermesCssVariables,
} from '@/const/theme';

type PaletteKey = keyof typeof HERMES_THEME_FOUNDATIONS.palette;

const relativeLuminance = (hex: string): number => {
  const normalized = hex.replace('#', '');
  const [r, g, b] = [0, 1, 2].map((index) => parseInt(normalized.slice(index * 2, index * 2 + 2), 16) / 255);
  const [rLin, gLin, bLin] = [r, g, b].map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
};

const contrastRatio = (foreground: string, background: string): number => {
  const [lighter, darker] = [foreground, background]
    .map(relativeLuminance)
    .sort((a, b) => b - a);

  return (lighter + 0.05) / (darker + 0.05);
};

describe('Hermes theme foundations', () => {
  it('locks the palette, spacing, and typography definitions to prevent runtime mutation', () => {
    expect(Object.isFrozen(HERMES_THEME_FOUNDATIONS)).toBe(true);
    expect(Object.isFrozen(HERMES_THEME_FOUNDATIONS.palette)).toBe(true);
    expect(Object.isFrozen(HERMES_THEME_FOUNDATIONS.spacing)).toBe(true);
    expect(Object.isFrozen(HERMES_THEME_FOUNDATIONS.typography)).toBe(true);
  });

  it('maintains spacing increments aligned to the 4px Hermes grid', () => {
    for (const value of HERMES_THEME_FOUNDATIONS.spacing) {
      expect(value % 4).toBe(0);
    }
  });

  it('keeps text tokens accessible against surfaces in both light and dark modes', () => {
    (Object.keys(HERMES_THEME_FOUNDATIONS.palette) as PaletteKey[]).forEach((appearance) => {
      const palette = HERMES_THEME_FOUNDATIONS.palette[appearance];
      const { background, surface } = palette.elevation;
      const { strong, muted, inverse } = palette.text;

      expect(contrastRatio(strong, background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(strong, surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(muted, surface)).toBeGreaterThanOrEqual(3.1);
      expect(contrastRatio(inverse, palette.accent.emphasis)).toBeGreaterThanOrEqual(4.5);
    });
  });
});

describe('Hermes CSS variable generator', () => {
  it('renders deterministic CSS payloads used by automation', () => {
    const css = buildHermesCssVariables('all');

    expect(css).toContain(':root');
    expect(css).toContain('[data-theme="dark"]');

    for (const [name, value] of Object.entries({
      ...HERMES_THEME_CSS_VARIABLES.common,
      ...HERMES_THEME_CSS_VARIABLES.light,
    })) {
      expect(css).toContain(`${name}: ${value};`);
    }

    for (const [name, value] of Object.entries(HERMES_THEME_CSS_VARIABLES.dark)) {
      expect(css).toContain(`${name}: ${value};`);
    }
  });
});
