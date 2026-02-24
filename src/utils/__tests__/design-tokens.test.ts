import {
  getColor,
  getColorUsage,
  getColorWithOpacity,
  getCSSCustomProperties,
  getFontFamily,
  getGoogleFontsUrl,
  getOrganicRadius,
  getOrganicShadow,
  getSpacing,
  getTailwindColors,
  tokens,
} from '../design-tokens';

describe('getColor', () => {
  it('returns hex for a shaded color', () => {
    expect(getColor('coral', '500')).toBe('#FF7059');
  });

  it('defaults to shade 500', () => {
    expect(getColor('teal')).toBe('#14B8A6');
  });

  it('returns hex for a hex-only color object (charcoal)', () => {
    expect(getColor('charcoal')).toBe('#151820');
  });

  it('throws for an unknown shade', () => {
    // biome-ignore lint/suspicious/noExplicitAny: Testing runtime behavior with invalid shade value
    expect(() => getColor('coral', '50' as any)).toThrow();
  });
});

describe('getColorWithOpacity', () => {
  it('returns correct rgba string for coral 500', () => {
    const result = getColorWithOpacity('coral', '500', 0.5);
    expect(result).toBe('rgba(255, 112, 89, 0.5)');
  });

  it('uses default shade 500', () => {
    const result = getColorWithOpacity('coral');
    expect(result).toBe('rgba(255, 112, 89, 1)');
  });

  it('throws error for invalid color', () => {
    // @ts-expect-error - intentionally passing invalid token key for runtime guard test
    expect(() => getColorWithOpacity('invalid', '500', 0.5)).toThrow();
  });
});

describe('getFontFamily', () => {
  it('returns display font family with fallback', () => {
    const result = getFontFamily('display');
    expect(result).toContain('Fraunces');
  });

  it('returns body font family with fallback', () => {
    const result = getFontFamily('body');
    expect(result).toContain('Cabin');
  });

  it('returns mono font family with fallback', () => {
    const result = getFontFamily('mono');
    expect(result).toContain('JetBrains Mono');
  });
});

describe('getGoogleFontsUrl', () => {
  it('returns a Google Fonts URL', () => {
    const url = getGoogleFontsUrl();
    expect(url).toContain('https://fonts.googleapis.com/css2');
    expect(url).toContain('display=swap');
  });
});

describe('getSpacing', () => {
  it('returns spacing value for known key', () => {
    const result = getSpacing('4');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});

describe('getOrganicRadius', () => {
  it('returns organic border radius', () => {
    const result = getOrganicRadius('organic');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('returns organicCard border radius', () => {
    const result = getOrganicRadius('organicCard');
    expect(result).toBeDefined();
  });
});

describe('getOrganicShadow', () => {
  it('returns organic shadow', () => {
    const result = getOrganicShadow('organic');
    expect(result).toBeDefined();
  });

  it('returns organicCoral shadow', () => {
    const result = getOrganicShadow('organicCoral');
    expect(result).toBeDefined();
  });
});

describe('getCSSCustomProperties', () => {
  it('returns an object with color custom properties', () => {
    const props = getCSSCustomProperties();
    expect(props['--color-coral-500']).toBe('#FF7059');
  });

  it('includes charcoal as a single-value color', () => {
    const props = getCSSCustomProperties();
    expect(props['--color-charcoal']).toBe('#151820');
  });

  it('includes spacing custom properties', () => {
    const props = getCSSCustomProperties();
    const spacingKeys = Object.keys(props).filter((k) => k.startsWith('--spacing-'));
    expect(spacingKeys.length).toBeGreaterThan(0);
  });

  it('includes font-size custom properties', () => {
    const props = getCSSCustomProperties();
    const fontSizeKeys = Object.keys(props).filter((k) => k.startsWith('--font-size-'));
    expect(fontSizeKeys.length).toBeGreaterThan(0);
  });
});

describe('getTailwindColors', () => {
  it('returns color palette with shades', () => {
    const colors = getTailwindColors();
    expect(colors.coral).toEqual(expect.objectContaining({ '500': '#FF7059' }));
  });

  it('includes charcoal as a string', () => {
    const colors = getTailwindColors();
    expect(colors.charcoal).toBe('#151820');
  });

  it('includes teal shades', () => {
    const colors = getTailwindColors();
    expect(typeof colors.teal).toBe('object');
  });
});

describe('getColorUsage', () => {
  it('returns usage description for a valid shade', () => {
    const usage = getColorUsage('coral', '500');
    expect(typeof usage).toBe('string');
  });

  it('returns empty string for non-shaded colors', () => {
    const usage = getColorUsage('charcoal', '500');
    expect(usage).toBe('');
  });
});

describe('tokens export', () => {
  it('exports the tokens object', () => {
    expect(tokens).toBeDefined();
    expect(tokens.colors).toBeDefined();
    expect(tokens.typography).toBeDefined();
    expect(tokens.spacing).toBeDefined();
  });
});
