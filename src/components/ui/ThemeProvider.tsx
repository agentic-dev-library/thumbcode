/**
 * Theme Provider
 * 
 * Provides design tokens to all child components
 * Programmatically loads from tokens.json
 */

import React, { createContext, useContext, useMemo } from 'react';
import tokens from '../../../design-system/tokens.json';
import { getCSSCustomProperties } from '../../utils/design-tokens';

interface ThemeContextValue {
  tokens: typeof tokens;
  colors: Record<string, any>;
  spacing: Record<string, string>;
  typography: typeof tokens.typography;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Provides theme tokens, flattened color map, spacing, and typography to descendant components via ThemeContext.
 *
 * The provider loads design tokens and exposes `tokens`, `colors` (flat map with either hex strings or shade maps), `spacing`, and `typography` to all children.
 *
 * @returns A React element that supplies the theme context to its children.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => {
    // Process colors into flat structure
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
    
    return {
      tokens,
      colors,
      spacing: tokens.spacing.values,
      typography: tokens.typography,
    };
  }, []);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Accesses the current theme context value.
 *
 * @returns The ThemeContextValue containing `tokens`, `colors`, `spacing`, and `typography`.
 * @throws Error if called outside of a ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Retrieve a color value from the current theme by name and optional shade.
 *
 * @param colorName - The color name or color group key defined in the theme's colors.
 * @param shade - The shade key within a color group (defaults to `'500'`).
 * @returns The resolved color string (e.g., hex value). Returns `'#000000'` if the color or shade is not found.
 */
export function useColor(colorName: string, shade: string = '500'): string {
  const { colors } = useTheme();
  
  if (typeof colors[colorName] === 'string') {
    return colors[colorName];
  }
  
  return colors[colorName]?.[shade] || '#000000';
}

/**
 * Retrieve a spacing token value by key from the theme.
 *
 * @param key - The spacing token key (for example, `"sm"`, `"md"`, `"lg"`)
 * @returns The spacing value for the given key, or `'0px'` if the key is not present
 */
export function useSpacing(key: string): string {
  const { spacing } = useTheme();
  return spacing[key] || '0px';
}