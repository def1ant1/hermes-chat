import {
  HERMES_THEME_CSS_VARIABLES,
  HERMES_THEME_FOUNDATIONS,
  buildHermesCssVariables,
} from '@/const/theme';

describe('Hermes brand visual contract', () => {
  it('exposes palette gradients anchored to Hermes signatures', () => {
    const { light, dark } = HERMES_THEME_FOUNDATIONS.palette;

    expect(light.gradients.hero).toContain('#2563EB');
    expect(light.gradients.hero).toContain('#7C3AED');
    expect(dark.gradients.hero).toContain('#1D4ED8');
    expect(dark.gradients.hero).toContain('#7C3AED');
  });

  it('surfaces CSS variables for every registered token so Percy can snapshot them', () => {
    const css = buildHermesCssVariables('all');
    const expectedLight = { ...HERMES_THEME_CSS_VARIABLES.common, ...HERMES_THEME_CSS_VARIABLES.light };

    for (const [name, value] of Object.entries(expectedLight)) {
      expect(css.includes(`${name}: ${value};`)).toBe(true);
    }

    for (const [name, value] of Object.entries(HERMES_THEME_CSS_VARIABLES.dark)) {
      expect(css.includes(`${name}: ${value};`)).toBe(true);
    }
  });
});
