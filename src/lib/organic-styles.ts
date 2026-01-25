/**
 * Organic Style Constants
 *
 * Centralized style values for the P3 "Warm Technical" design system.
 * NativeWind doesn't support shorthand border-radius, so we define
 * individual corner values here for consistency across components.
 *
 * These values match the organic asymmetric aesthetic defined in CLAUDE.md
 */

import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Shared input border radius values
 * Used by both View containers and TextInput components
 */
const inputBorderRadiusValues = {
  borderTopLeftRadius: 8, // 0.5rem
  borderTopRightRadius: 10, // 0.625rem
  borderBottomRightRadius: 8, // 0.5rem
  borderBottomLeftRadius: 12, // 0.75rem
};

/**
 * Organic border radius configurations
 * Each corner is slightly different to create the hand-crafted paint daube effect
 */
export const organicBorderRadius = {
  /** Cards, containers, elevated surfaces */
  card: {
    borderTopLeftRadius: 16, // 1rem
    borderTopRightRadius: 12, // 0.75rem
    borderBottomRightRadius: 20, // 1.25rem
    borderBottomLeftRadius: 8, // 0.5rem
  } as ViewStyle,

  /** Primary and secondary buttons */
  button: {
    borderTopLeftRadius: 8, // 0.5rem
    borderTopRightRadius: 12, // 0.75rem
    borderBottomRightRadius: 10, // 0.625rem
    borderBottomLeftRadius: 14, // 0.875rem
  } as ViewStyle,

  /** Small badges, tags, chips */
  badge: {
    borderTopLeftRadius: 6, // 0.375rem
    borderTopRightRadius: 8, // 0.5rem
    borderBottomRightRadius: 10, // 0.625rem
    borderBottomLeftRadius: 4, // 0.25rem
  } as ViewStyle,

  /** Small pills (sender tags, compact chips) */
  pill: inputBorderRadiusValues as ViewStyle,

  /** Text inputs, form fields (for View containers) */
  input: inputBorderRadiusValues as ViewStyle,

  /** Text inputs (for TextInput components - typed as TextStyle for compatibility) */
  textInput: inputBorderRadiusValues as TextStyle,

  /** Chat bubbles (text messages) */
  chatBubbleUser: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 14,
  } as ViewStyle,
  chatBubbleAgent: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 14,
  } as ViewStyle,

  /** Code blocks and monospace containers */
  codeBlock: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 8,
  } as ViewStyle,

  /** Hero elements, large icons, feature images */
  hero: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 20,
  } as ViewStyle,

  /** Large CTA buttons */
  cta: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 18,
  } as ViewStyle,

  /** Modal containers */
  modal: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 14,
  } as ViewStyle,

  /** Toast notifications */
  toast: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 10,
  } as ViewStyle,
} as const;

/**
 * Organic shadow configurations for dark mode surfaces
 * Uses subtle asymmetric shadows with brand color tints
 */
export const organicShadow = {
  /** Standard card shadow */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,

  /** Elevated surfaces, modals */
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  } as ViewStyle,

  /** Floating elements, FABs */
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 12,
  } as ViewStyle,
} as const;
