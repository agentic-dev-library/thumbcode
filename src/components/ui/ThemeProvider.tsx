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

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Hook to get a specific color
 */
export function useColor(colorName: string, shade: string = '500'): string {
  const { colors } = useTheme();
  
  if (typeof colors[colorName] === 'string') {
    return colors[colorName];
  }
  
  return colors[colorName]?.[shade] || '#000000';
}

/**
 * Hook to get spacing value
 */
export function useSpacing(key: string): string {
  const { spacing } = useTheme();
  return spacing[key] || '0px';
}
