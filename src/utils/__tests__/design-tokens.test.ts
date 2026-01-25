import { getColorWithOpacity } from '../design-tokens';

describe('getColorWithOpacity', () => {
  it('should return correct rgba string for coral 500', () => {
    // coral 500 is #FF7059 -> 255, 112, 89
    const result = getColorWithOpacity('coral', '500', 0.5);
    expect(result).toBe('rgba(255, 112, 89, 0.5)');
  });

  it('should use default shade 500', () => {
     const result = getColorWithOpacity('coral', undefined, 1);
     expect(result).toBe('rgba(255, 112, 89, 1)');
  });

  it('should throw error for invalid color', () => {
    expect(() => getColorWithOpacity('invalid' as any, '500', 0.5)).toThrow();
  });
});
