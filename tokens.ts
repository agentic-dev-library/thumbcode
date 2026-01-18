/**
 * ThumbCode Design Tokens
 * P3 "Warm Technical" palette
 * 
 * DO NOT hardcode colors - always import from this file.
 */

// ═══════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════

export const colors = {
  /** Primary brand color - warm, energetic, action-oriented */
  coral: {
    400: '#FF8A7A', // Hover states, light accents
    500: '#FF7059', // PRIMARY - buttons, links, focus
    600: '#E85A4F', // Light mode variant
    700: '#C74840', // Active/pressed states
    800: '#A33832', // High contrast mode
  },
  
  /** Secondary brand color - calm, trustworthy, technical */
  teal: {
    400: '#2DD4BF', // Light accents, highlights
    500: '#14B8A6', // Secondary elements
    600: '#0D9488', // PRIMARY SECONDARY - links, badges
    700: '#0F766E', // Light mode variant
    800: '#115E59', // High contrast mode
  },
  
  /** Accent color - success, progress, highlights */
  gold: {
    300: '#FDE68A', // Light highlights
    400: '#F5D563', // PRIMARY ACCENT - indicators, success
    500: '#EAB308', // Strong accent
    600: '#D4A84B', // Light mode variant
    700: '#A16207', // High contrast mode
  },
  
  /** Neutral scale for backgrounds and text */
  neutral: {
    50: '#F8FAFC',  // Light mode background
    100: '#F1F5F9', // Light mode elevated surface
    200: '#E2E8F0', // Borders in light mode
    300: '#CBD5E1', // Disabled states
    400: '#94A3B8', // Placeholder text, muted
    500: '#64748B', // Secondary text
    600: '#475569', // Body text in light mode
    700: '#334155', // Elevated surface dark mode
    800: '#1E293B', // Surface dark mode
    900: '#0F172A', // Deep background
  },
  
  /** Primary dark background */
  charcoal: '#151820',
} as const;

// Semantic color aliases
export const semantic = {
  background: {
    light: colors.neutral[50],
    dark: colors.charcoal,
  },
  surface: {
    light: colors.neutral[100],
    lightElevated: colors.neutral[200],
    dark: colors.neutral[800],
    darkElevated: colors.neutral[700],
  },
  text: {
    primary: {
      light: colors.neutral[900],
      dark: colors.neutral[50],
    },
    secondary: {
      light: colors.neutral[600],
      dark: colors.neutral[400],
    },
    muted: {
      light: colors.neutral[400],
      dark: colors.neutral[500],
    },
  },
  primary: colors.coral[500],
  secondary: colors.teal[600],
  accent: colors.gold[400],
  success: colors.teal[500],
  warning: colors.gold[500],
  error: colors.coral[600],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════

export const fontFamilies = {
  /** Headlines, hero text, logo - Fraunces soft-serif */
  display: ['Fraunces', 'Georgia', 'serif'],
  /** Body text, UI labels - Cabin humanist sans */
  body: ['Cabin', 'system-ui', 'sans-serif'],
  /** Code, terminal - JetBrains Mono */
  mono: ['JetBrains Mono', 'monospace'],
} as const;

export const fontSizes = {
  xs: '0.75rem',   // 12px - Captions, badges
  sm: '0.875rem',  // 14px - Small text, labels
  base: '1rem',    // 16px - Body default
  lg: '1.125rem',  // 18px - Large body
  xl: '1.25rem',   // 20px - Section titles
  '2xl': '1.5rem', // 24px - Card titles
  '3xl': '1.875rem', // 30px - Page titles
  '4xl': '2.25rem',  // 36px - Major headings
  '5xl': '3rem',     // 48px - Hero text
  '6xl': '3.75rem',  // 60px - Display
} as const;

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export const lineHeights = {
  tight: '1.1',    // Headlines
  snug: '1.3',     // Subheadings
  normal: '1.5',   // Body text
  relaxed: '1.625', // Long-form
  loose: '2',      // Very spacious
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SPACING
// ═══════════════════════════════════════════════════════════════════════════

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════════════════════════════════════

export const borderRadius = {
  none: '0px',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
  /** Asymmetric organic blob - USE THIS for primary elements */
  organic: '50px 45px 50px 48px / 26px 28px 26px 24px',
  /** Subtle organic for cards */
  organicCard: '20px 18px 22px 16px / 16px 20px 18px 22px',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SHADOWS
// ═══════════════════════════════════════════════════════════════════════════

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  /** Multi-layered with teal tint - USE THIS */
  organic: '0 2px 4px rgba(13, 148, 136, 0.08), 0 8px 24px rgba(21, 24, 32, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)',
  /** Coral tint for primary buttons */
  organicCoral: '0 4px 12px rgba(255, 112, 89, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)',
  /** Focus ring */
  focus: '0 0 0 3px rgba(255, 112, 89, 0.3)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION
// ═══════════════════════════════════════════════════════════════════════════

export const animation = {
  durations: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easings: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE FONTS
// ═══════════════════════════════════════════════════════════════════════════

export const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1&family=Cabin:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap';

export const googleFontsHtml = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsUrl}" rel="stylesheet">`;

// ═══════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export type ColorScale = typeof colors;
export type SemanticColors = typeof semantic;
export type FontFamily = keyof typeof fontFamilies;
export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type LineHeight = keyof typeof lineHeights;
export type Spacing = keyof typeof spacing;
export type BorderRadius = keyof typeof borderRadius;
export type Shadow = keyof typeof shadows;
