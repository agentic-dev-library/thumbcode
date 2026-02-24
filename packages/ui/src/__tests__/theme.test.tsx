import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider, themeTokens, useColor, useSpacing, useTheme } from '../theme/ThemeProvider';

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('ThemeProvider', () => {
  it('provides theme tokens via useTheme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.tokens).toBe(themeTokens);
    expect(result.current.colors).toBe(themeTokens.colors);
    expect(result.current.spacing).toBe(themeTokens.spacing);
    expect(result.current.typography).toBe(themeTokens.typography);
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within ThemeProvider');
  });
});

describe('useColor', () => {
  it('returns color for string colors (charcoal)', () => {
    const { result } = renderHook(() => useColor('charcoal'), { wrapper });
    expect(result.current).toBe('#151820');
  });

  it('returns shade for color groups', () => {
    const { result } = renderHook(() => useColor('coral', '500'), { wrapper });
    expect(result.current).toBe('#FF7059');
  });

  it('returns fallback for unknown shade', () => {
    const { result } = renderHook(() => useColor('coral', '999'), { wrapper });
    expect(result.current).toBe('#000000');
  });

  it('defaults to shade 500', () => {
    const { result } = renderHook(() => useColor('teal'), { wrapper });
    expect(result.current).toBe('#14B8A6');
  });
});

describe('useSpacing', () => {
  it('returns spacing value for known key', () => {
    const { result } = renderHook(() => useSpacing('md'), { wrapper });
    expect(result.current).toBe('16px');
  });

  it('returns spacing for xs', () => {
    const { result } = renderHook(() => useSpacing('xs'), { wrapper });
    expect(result.current).toBe('4px');
  });
});

describe('themeTokens', () => {
  it('has coral colors', () => {
    expect(themeTokens.colors.coral['500']).toBe('#FF7059');
  });

  it('has font families', () => {
    expect(themeTokens.typography.fonts.display).toBe('Fraunces');
    expect(themeTokens.typography.fonts.body).toBe('Cabin');
    expect(themeTokens.typography.fonts.mono).toBe('JetBrains Mono');
  });
});
