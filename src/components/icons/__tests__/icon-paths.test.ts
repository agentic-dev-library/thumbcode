import { generateOrganicOffset, ICON_PATHS } from '../icon-paths';

describe('generateOrganicOffset', () => {
  it('returns a number within maxOffset range', () => {
    const result = generateOrganicOffset(42, 0, 1.5);
    expect(typeof result).toBe('number');
    expect(Math.abs(result)).toBeLessThanOrEqual(3); // maxOffset * 2
  });

  it('is deterministic for same seed and index', () => {
    const a = generateOrganicOffset(42, 5);
    const b = generateOrganicOffset(42, 5);
    expect(a).toBe(b);
  });

  it('produces different values for different seeds', () => {
    const a = generateOrganicOffset(1, 0);
    const b = generateOrganicOffset(2, 0);
    expect(a).not.toBe(b);
  });
});

describe('ICON_PATHS', () => {
  const seed = 42;

  it('contains all expected icon variants', () => {
    const keys = Object.keys(ICON_PATHS);
    expect(keys.length).toBeGreaterThanOrEqual(30);
  });

  // Test every icon path function to achieve coverage
  for (const [variant, pathFn] of Object.entries(ICON_PATHS)) {
    it(`generates SVG path for "${variant}"`, () => {
      const path = pathFn(seed);
      expect(typeof path).toBe('string');
      expect(path.length).toBeGreaterThan(0);
      // SVG paths contain M (moveto) commands
      expect(path).toContain('M');
    });
  }
});
