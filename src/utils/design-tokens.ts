/**
 * Design Token Utilities
 * 
 * Programmatically access and use design tokens from JSON
 */

import tokens from '../../design-system/tokens.json';

export type ColorKey = keyof typeof tokens.colors;
export type ColorShade = '300' | '400' | '500' | '600' | '700' | '800';

/**
 * Get a color value by name and shade
 * @example getColor('coral', '500') // returns '#FF7059'
 */
export function getColor(color: ColorKey, shade: ColorShade = '500'): string {
  const colorFamily = tokens.colors[color];
  
  if (typeof colorFamily === 'string') {
    return colorFamily;
  }
  
  if ('values' in colorFamily && colorFamily.values[shade]) {
    return colorFamily.values[shade].hex;
  }
  
  throw new Error(`Color ${String(color)}-${shade} not found`);
}

/**
 * Get color with opacity
 * @example getColorWithOpacity('coral', '500', 0.5)
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
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Get font family with fallbacks
 */
export function getFontFamily(type: 'display' | 'body' | 'mono'): string {
  const font = tokens.typography.fontFamilies[type];
  return `${font.name}, ${font.fallback}`;
}

/**
 * Get Google Fonts URL for all fonts
 */
export function getGoogleFontsUrl(): string {
  const fonts = Object.values(tokens.typography.fontFamilies)
    .map(f => f.googleFonts)
    .join('&family=');
  return `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`;
}

/**
 * Get spacing value
 */
export function getSpacing(key: keyof typeof tokens.spacing.values): string {
  return tokens.spacing.values[key];
}

/**
 * Get organic border radius
 */
export function getOrganicRadius(type: 'organic' | 'organicCard'): string {
  return tokens.borderRadius[type].value;
}

/**
 * Get organic shadow
 */
export function getOrganicShadow(type: 'organic' | 'organicCoral'): string {
  return tokens.shadows[type].value;
}

/**
 * Get all colors as CSS custom properties
 */
export function getCSSCustomProperties(): Record<string, string> {
  const cssVars: Record<string, string> = {};
  
  // Add color values
  Object.entries(tokens.colors).forEach(([colorName, colorData]) => {
    if (typeof colorData === 'string') {
      cssVars[`--color-${colorName}`] = colorData;
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
 * Generate Tailwind color config from tokens
 */
export function getTailwindColors() {
  const colors: Record<string, any> = {};
  
  Object.entries(tokens.colors).forEach(([colorName, colorData]) => {
    if (typeof colorData === 'string') {
      colors[colorName] = colorData;
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
 * Get color usage description
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
