import { organicBorderRadius } from '../organic-styles';

describe('organicBorderRadius', () => {
  it('has input border radius', () => {
    expect(organicBorderRadius.input.borderTopLeftRadius).toBe(8);
    expect(organicBorderRadius.input.borderTopRightRadius).toBe(10);
  });

  it('has button border radius', () => {
    expect(organicBorderRadius.button.borderTopLeftRadius).toBe(8);
  });

  it('has badge border radius', () => {
    expect(organicBorderRadius.badge.borderTopLeftRadius).toBe(6);
  });

  it('has chat bubble user border radius', () => {
    expect(organicBorderRadius.chatBubbleUser.borderTopLeftRadius).toBe(16);
  });

  it('has chat bubble agent border radius', () => {
    expect(organicBorderRadius.chatBubbleAgent.borderTopLeftRadius).toBe(6);
  });

  it('has code block border radius', () => {
    expect(organicBorderRadius.codeBlock.borderTopLeftRadius).toBe(12);
  });
});
