import { organicBorderRadius, organicShadow } from '../theme/organicStyles';

describe('organicBorderRadius', () => {
  it('has card border radius', () => {
    expect(organicBorderRadius.card.borderTopLeftRadius).toBe(16);
    expect(organicBorderRadius.card.borderTopRightRadius).toBe(12);
    expect(organicBorderRadius.card.borderBottomRightRadius).toBe(20);
    expect(organicBorderRadius.card.borderBottomLeftRadius).toBe(8);
  });

  it('has button border radius', () => {
    expect(organicBorderRadius.button.borderTopLeftRadius).toBe(8);
  });

  it('has badge border radius', () => {
    expect(organicBorderRadius.badge.borderTopLeftRadius).toBe(6);
  });

  it('has input border radius', () => {
    expect(organicBorderRadius.input.borderTopLeftRadius).toBe(8);
  });
});

describe('organicShadow', () => {
  it('has card shadow', () => {
    expect(organicShadow.card.boxShadow).toContain('rgba');
  });

  it('has elevated shadow', () => {
    expect(organicShadow.elevated.boxShadow).toContain('rgba');
  });
});
