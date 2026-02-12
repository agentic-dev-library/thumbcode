/**
 * Organic Style Constants
 *
 * Centralized style values for the P3 "Warm Technical" design system.
 * These values define the organic asymmetric aesthetic from CLAUDE.md
 * using standard CSS properties for web.
 */

import type React from 'react';

/**
 * Shared input border radius values
 * Used by both containers and text input components
 */
const inputBorderRadiusValues: React.CSSProperties = {
  borderTopLeftRadius: 8,
  borderTopRightRadius: 10,
  borderBottomRightRadius: 8,
  borderBottomLeftRadius: 12,
};

/**
 * Organic border radius configurations
 * Each corner is slightly different to create the hand-crafted paint daube effect
 */
export const organicBorderRadius = {
  /** Cards, containers, elevated surfaces */
  card: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 8,
  } as React.CSSProperties,

  /** Primary and secondary buttons */
  button: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 14,
  } as React.CSSProperties,

  /** Small badges, tags, chips */
  badge: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 4,
  } as React.CSSProperties,

  /** Small pills (sender tags, compact chips) */
  pill: inputBorderRadiusValues,

  /** Text inputs, form fields */
  input: inputBorderRadiusValues,

  /** Text inputs (alias for consistency) */
  textInput: inputBorderRadiusValues,

  /** Chat bubbles (text messages) */
  chatBubbleUser: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 14,
  } as React.CSSProperties,
  chatBubbleAgent: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 14,
  } as React.CSSProperties,

  /** Code blocks and monospace containers */
  codeBlock: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 8,
  } as React.CSSProperties,

  /** Hero elements, large icons, feature images */
  hero: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 20,
  } as React.CSSProperties,

  /** Large CTA buttons */
  cta: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 18,
  } as React.CSSProperties,

  /** Modal containers */
  modal: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 14,
  } as React.CSSProperties,

  /** Toast notifications */
  toast: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 10,
  } as React.CSSProperties,
} as const;

/**
 * Organic shadow configurations for dark mode surfaces
 * Uses subtle asymmetric shadows with brand color tints (CSS box-shadow)
 */
export const organicShadow = {
  /** Standard card shadow */
  card: {
    boxShadow: `2px 4px 8px rgba(21, 24, 32, 0.08)`,
  } as React.CSSProperties,

  /** Elevated surfaces, modals */
  elevated: {
    boxShadow: `4px 8px 16px rgba(21, 24, 32, 0.12)`,
  } as React.CSSProperties,

  /** Floating elements, FABs */
  float: {
    boxShadow: `8px 16px 32px rgba(21, 24, 32, 0.16)`,
  } as React.CSSProperties,
} as const;
