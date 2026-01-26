/**
 * Theme Provider
 *
 * Provides design tokens to all child components.
 * Programmatically loads from tokens.json.
 */

import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

// Design tokens - these match the P3 "Warm Technical" palette
export const themeTokens = {
  colors: {
    coral: {
      500: '#FF7059',
      600: '#E85A4F',
      700: '#CC4A42',
      800: '#A33832',
    },
    teal: {
      500: '#14B8A6',
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
    },
    gold: {
      400: '#F5D563',
      500: '#EAB308',
      600: '#D4A84B',
      700: '#A16207',
    },
    neutral: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    charcoal: '#151820',
    surface: {
      default: '#1E293B',
      elevated: '#334155',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  typography: {
    fonts: {
      display: 'Fraunces',
      body: 'Cabin',
      mono: 'JetBrains Mono',
    },
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
  },
};

interface ThemeContextValue {
  tokens: typeof themeTokens;
  colors: typeof themeTokens.colors;
  spacing: typeof themeTokens.spacing;
  typography: typeof themeTokens.typography;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Provides theme tokens to descendant components via ThemeContext.
 *
 * @returns A React element that supplies the theme context to its children.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      tokens: themeTokens,
      colors: themeTokens.colors,
      spacing: themeTokens.spacing,
      typography: themeTokens.typography,
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
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
export function useColor(colorName: keyof typeof themeTokens.colors, shade: string = '500'): string {
  const { colors } = useTheme();
  const color = colors[colorName];

  if (typeof color === 'string') {
    return color;
  }

  return (color as Record<string, string>)?.[shade] || '#000000';
}

/**
 * Retrieve a spacing token value by key from the theme.
 *
 * @param key - The spacing token key (for example, `"sm"`, `"md"`, `"lg"`)
 * @returns The spacing value for the given key, or `'0px'` if the key is not present
 */
export function useSpacing(key: keyof typeof themeTokens.spacing): string {
  const { spacing } = useTheme();
  return spacing[key] || '0px';
}
