
/**
 * Organic styling helpers for @thumbcode/ui.
 *
 * Asymmetric border-radius values exposed as style objects for
 * ThumbCode's organic visual style.
 */

export const organicBorderRadius = {
  card: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 8,
  } as React.CSSProperties,
  button: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 14,
  } as React.CSSProperties,
  badge: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 4,
  } as React.CSSProperties,
} as const;

export const organicShadow = {
  card: {
    boxShadow: '2px 4px 8px rgba(21, 24, 32, 0.08)',
  } as React.CSSProperties,
  elevated: {
    boxShadow: '4px 8px 16px rgba(21, 24, 32, 0.12)',
  } as React.CSSProperties,
} as const;

