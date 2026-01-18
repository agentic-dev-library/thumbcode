/**
 * Design Token Utilities
 *
 * Programmatically access and use design tokens from JSON
 */

import tokens from '../../design-system/tokens.json';

export type ColorKey = keyof typeof tokens.colors;
export type ColorShade = '300' | '400' | '500' | '600' | '700' | '800';

/**
 * Retrieves the hex color value for a named color and shade.
 *
 * @param color - The color key from the design tokens
 * @param shade - The shade to retrieve (defaults to '500')
 * @returns The hex color string for the specified color and shade
 * @throws Error when the color or shade does not exist in tokens
 */
export function getColor(color: ColorKey, shade: ColorShade = '500'): string {
  const colorFamily = tokens.colors[color];

  if (typeof colorFamily === 'string') {
    return colorFamily;
  }

  // Handle hex-only color objects (e.g., charcoal)
  if ('hex' in colorFamily && typeof colorFamily.hex === 'string') {
    return colorFamily.hex;
  }

  if ('values' in colorFamily && colorFamily.values[shade]) {
    return colorFamily.values[shade].hex;
  }

  throw new Error(`Color ${String(color)}-${shade} not found`);
}

/**
 * Produce an RGBA color string for a named design token color and shade with the given opacity.
 *
 * @param color - The design token color key
 * @param shade - The color shade to use; defaults to `'500'`
 * @param opacity - Alpha value between 0 and 1 where 0 is fully transparent and 1 is fully opaque
 * @returns An `rgba(r, g, b, a)` string representing the requested color and opacity
 */
export function getColorWithOpacity(
  color: ColorKey,
  shade: ColorShade = '500',
  opacity: number = 1
): string {
  const hex = getColor(color, shade);
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Convert a 6-digit hex color string to its RGB components.
 *
 * @param hex - Hex color string (with or without a leading `#`)
 * @returns The RGB components as `{ r, g, b }`. Returns `{ r: 0, g: 0, b: 0 }` if `hex` is not a valid 6-digit hex color
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Get the font-family CSS string for the specified family including fallback fonts.
 *
 * @param type - The font family to retrieve: `'display'`, `'body'`, or `'mono'`
 * @returns A comma-separated font-family string combining the primary font and its fallback
 */
export function getFontFamily(type: 'display' | 'body' | 'mono'): string {
  const font = tokens.typography.fontFamilies[type];
  return `${font.name}, ${font.fallback}`;
}

/**
 * Build a Google Fonts CSS URL that includes every font family declared in the design tokens.
 *
 * @returns A Google Fonts URL that requests each family from `tokens.typography.fontFamilies` and appends `display=swap`
 */
export function getGoogleFontsUrl(): string {
  const fonts = Object.values(tokens.typography.fontFamilies)
    .map((f) => f.googleFonts)
    .join('&family=');
  return `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`;
}

/**
 * Retrieve a spacing token value by its key.
 *
 * @param key - The spacing token key from tokens.spacing.values
 * @returns The spacing value for `key`
 */
export function getSpacing(key: keyof typeof tokens.spacing.values): string {
  return tokens.spacing.values[key];
}

/**
 * Returns the organic border radius value for the specified type.
 *
 * @param type - 'organic' or 'organicCard' to select which radius value to retrieve
 * @returns The border-radius value as a CSS string (for example, "8px")
 */
export function getOrganicRadius(type: 'organic' | 'organicCard'): string {
  return tokens.borderRadius[type].value;
}

/**
 * Retrieves the named organic shadow CSS value from the design tokens.
 *
 * @param type - The shadow key to retrieve: `'organic'` or `'organicCoral'`
 * @returns The shadow value string as defined in tokens (typically a CSS `box-shadow` value)
 */
export function getOrganicShadow(type: 'organic' | 'organicCoral'): string {
  return tokens.shadows[type].value;
}

/**
 * Generate a map of CSS custom property names to token values for colors, spacing, and font sizes.
 *
 * Color entries use `--color-{name}` for single-value colors or `--color-{name}-{shade}` for shaded colors.
 * Spacing entries use `--spacing-{key}` and font sizes use `--font-size-{key}`.
 *
 * @returns A record mapping CSS custom property names (e.g., `--color-primary-500`, `--spacing-4`, `--font-size-lg`) to their string values
 */
export function getCSSCustomProperties(): Record<string, string> {
  const cssVars: Record<string, string> = {};

  // Add color values
  Object.entries(tokens.colors).forEach(([colorName, colorData]) => {
    if (typeof colorData === 'string') {
      cssVars[`--color-${colorName}`] = colorData;
    } else if ('hex' in colorData && typeof colorData.hex === 'string') {
      // Handle hex-only color objects (e.g., charcoal)
      cssVars[`--color-${colorName}`] = colorData.hex;
    } else if ('values' in colorData) {
      Object.entries(colorData.values).forEach(([shade, value]) => {
        cssVars[`--color-${colorName}-${shade}`] = value.hex;
      });
    }
  });

  // Add spacing
  Object.entries(tokens.spacing.values).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });

  // Add font sizes
  Object.entries(tokens.typography.fontSizes).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value.value;
  });

  return cssVars;
}

/**
 * Create a Tailwind-compatible color palette object from the design tokens.
 *
 * @returns An object mapping color names to either a hex color string or an object of shade keys to hex strings (e.g., `{ blue: { '500': '#0b5fff', '600': '#084fd6' }, black: '#000' }`)
 */
export function getTailwindColors() {
  const colors: Record<string, string | Record<string, string>> = {};

  Object.entries(tokens.colors).forEach(([colorName, colorData]) => {
    if (typeof colorData === 'string') {
      colors[colorName] = colorData;
    } else if ('hex' in colorData && typeof colorData.hex === 'string') {
      // Handle hex-only color objects (e.g., charcoal)
      colors[colorName] = colorData.hex;
    } else if ('values' in colorData) {
      colors[colorName] = {};
      Object.entries(colorData.values).forEach(([shade, value]) => {
        colors[colorName][shade] = value.hex;
      });
    }
  });

  return colors;
}

/**
 * Retrieve the usage description for a specific design token color and shade.
 *
 * @param color - The color key from the design tokens
 * @param shade - The shade to look up (defaults to `'500'`)
 * @returns The usage text for the specified color and shade, or an empty string if none is defined
 */
export function getColorUsage(color: ColorKey, shade: ColorShade = '500'): string {
  const colorFamily = tokens.colors[color];

  if (typeof colorFamily === 'object' && 'values' in colorFamily) {
    return colorFamily.values[shade]?.usage || '';
  }

  return '';
}

/**
 * Export all tokens for easy access
 */
export { tokens };
