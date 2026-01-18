/**
 * ThumbCode Design System Tokens
 *
 * P3 "Warm Technical" color palette with organic visual language.
 * All colors specified in P3 gamut for modern displays.
 */

export const tokens = {
  colors: {
    // Primary Palette - Coral/Salmon family
    primary: {
      50: 'color(display-p3 0.996 0.949 0.941)',
      100: 'color(display-p3 0.992 0.898 0.882)',
      200: 'color(display-p3 0.984 0.796 0.765)',
      300: 'color(display-p3 0.976 0.694 0.647)',
      400: 'color(display-p3 0.949 0.545 0.475)', // Main coral
      500: 'color(display-p3 0.902 0.396 0.302)',
      600: 'color(display-p3 0.804 0.298 0.208)',
      700: 'color(display-p3 0.655 0.224 0.153)',
      800: 'color(display-p3 0.506 0.173 0.118)',
      900: 'color(display-p3 0.357 0.122 0.082)',
    },

    // Secondary Palette - Deep Teal family
    secondary: {
      50: 'color(display-p3 0.925 0.965 0.969)',
      100: 'color(display-p3 0.851 0.929 0.937)',
      200: 'color(display-p3 0.702 0.859 0.875)',
      300: 'color(display-p3 0.553 0.788 0.812)',
      400: 'color(display-p3 0.318 0.686 0.725)', // Main teal
      500: 'color(display-p3 0.173 0.588 0.639)',
      600: 'color(display-p3 0.118 0.471 0.522)',
      700: 'color(display-p3 0.094 0.376 0.420)',
      800: 'color(display-p3 0.071 0.282 0.318)',
      900: 'color(display-p3 0.047 0.188 0.216)',
    },

    // Accent Palette - Soft Gold family
    accent: {
      50: 'color(display-p3 0.996 0.980 0.941)',
      100: 'color(display-p3 0.992 0.961 0.882)',
      200: 'color(display-p3 0.984 0.922 0.765)',
      300: 'color(display-p3 0.976 0.882 0.647)',
      400: 'color(display-p3 0.949 0.812 0.475)', // Main gold
      500: 'color(display-p3 0.871 0.722 0.302)',
      600: 'color(display-p3 0.753 0.612 0.208)',
      700: 'color(display-p3 0.604 0.490 0.153)',
      800: 'color(display-p3 0.455 0.369 0.114)',
      900: 'color(display-p3 0.306 0.247 0.075)',
    },

    // Semantic Colors
    success: 'color(display-p3 0.220 0.722 0.514)',
    warning: 'color(display-p3 0.949 0.812 0.475)',
    error: 'color(display-p3 0.902 0.396 0.302)',
    info: 'color(display-p3 0.318 0.686 0.725)',

    // Neutral Palette - Warm grays
    neutral: {
      0: 'color(display-p3 1 1 1)',
      50: 'color(display-p3 0.980 0.976 0.973)',
      100: 'color(display-p3 0.961 0.953 0.945)',
      200: 'color(display-p3 0.922 0.906 0.890)',
      300: 'color(display-p3 0.843 0.820 0.796)',
      400: 'color(display-p3 0.686 0.655 0.624)',
      500: 'color(display-p3 0.529 0.498 0.467)',
      600: 'color(display-p3 0.412 0.388 0.365)',
      700: 'color(display-p3 0.294 0.275 0.259)',
      800: 'color(display-p3 0.196 0.180 0.169)',
      900: 'color(display-p3 0.118 0.106 0.098)',
      950: 'color(display-p3 0.059 0.051 0.047)',
    },

    // Background Colors
    background: {
      primary: 'color(display-p3 0.996 0.992 0.988)',
      secondary: 'color(display-p3 0.980 0.976 0.973)',
      tertiary: 'color(display-p3 0.961 0.953 0.945)',
      inverse: 'color(display-p3 0.118 0.106 0.098)',
    },

    // Text Colors
    text: {
      primary: 'color(display-p3 0.118 0.106 0.098)',
      secondary: 'color(display-p3 0.412 0.388 0.365)',
      tertiary: 'color(display-p3 0.529 0.498 0.467)',
      inverse: 'color(display-p3 0.996 0.992 0.988)',
      link: 'color(display-p3 0.173 0.588 0.639)',
    },
  },

  typography: {
    // Font Families
    fontFamily: {
      display: 'Fraunces', // Headlines, hero text
      body: 'Cabin', // Body text, UI labels
      mono: 'JetBrains Mono', // Code, technical content
    },

    // Font Sizes (rem based, 1rem = 16px)
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
    },

    // Font Weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    // Line Heights
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },

    // Letter Spacing
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
  },

  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
  },

  // Organic Border Radius - Paint daub aesthetic
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
    // Organic asymmetric patterns
    organic: {
      card: '1rem 0.75rem 1.25rem 0.5rem',
      button: '0.5rem 0.75rem 0.625rem 0.875rem',
      badge: '0.375rem 0.5rem 0.625rem 0.25rem',
      input: '0.5rem 0.625rem 0.5rem 0.75rem',
    },
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    // Paint daub shadows - softer, more organic
    organic: {
      card: '2px 4px 8px -2px rgb(0 0 0 / 0.08), -1px 2px 4px -1px rgb(0 0 0 / 0.04)',
      elevated: '4px 8px 16px -4px rgb(0 0 0 / 0.12), -2px 4px 8px -2px rgb(0 0 0 / 0.06)',
      float: '8px 16px 32px -8px rgb(0 0 0 / 0.16), -4px 8px 16px -4px rgb(0 0 0 / 0.08)',
    },
  },

  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

export type Tokens = typeof tokens;
export type ColorScale = keyof typeof tokens.colors.primary;
export type SpacingScale = keyof typeof tokens.spacing;
