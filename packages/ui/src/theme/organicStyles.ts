import type { ViewStyle } from 'react-native';

/**
 * Organic styling helpers for @thumbcode/ui.
 *
 * NOTE: NativeWind doesn't support asymmetric border-radius shorthand on RN,
 * so we expose corner values as style objects.
 */

export const organicBorderRadius = {
  card: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 8,
  } as ViewStyle,
  button: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 14,
  } as ViewStyle,
  badge: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 4,
  } as ViewStyle,
} as const;

export const organicShadow = {
  card: {
    shadowColor: '#151820',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,
  elevated: {
    shadowColor: '#151820',
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  } as ViewStyle,
} as const;

