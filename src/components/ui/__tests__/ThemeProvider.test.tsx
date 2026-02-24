import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider, useColor, useSpacing, useTheme } from '../ThemeProvider';

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('ThemeProvider', () => {
  it('provides tokens via useTheme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.tokens).toBeDefined();
    expect(result.current.colors).toBeDefined();
    expect(result.current.spacing).toBeDefined();
    expect(result.current.typography).toBeDefined();
  });

  it('throws when useTheme is used outside provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within ThemeProvider'
    );
  });

  it('flattens shaded colors into color map', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    const { colors } = result.current;
    // coral should be an object with shade keys
    expect(typeof colors.coral).toBe('object');
    expect((colors.coral as Record<string, string>)['500']).toBe('#FF7059');
  });
});

describe('useColor', () => {
  it('returns fallback for colors without shades (charcoal)', () => {
    // charcoal is a {hex: ...} object (not string, not shaded) so ThemeProvider skips it
    const { result } = renderHook(() => useColor('charcoal'), { wrapper });
    expect(result.current).toBe('#000000');
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
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('string');
  });

  it('returns 0px for unknown spacing key', () => {
    const { result } = renderHook(() => useSpacing('nonexistent'), { wrapper });
    expect(result.current).toBe('0px');
  });
});
