/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THUMBCODE DESIGN SYSTEM v2.0
 * Agent-Reproducible Design Tokens
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file is the SINGLE SOURCE OF TRUTH for all ThumbCode visual identity.
 * Every value here is deterministic and procedurally reproducible.
 * 
 * BRAND PHILOSOPHY: "Warm Technical"
 * - Approachable innovation in a cold-blue developer tool landscape
 * - Paint daubes replace geometric gradients (human touch for AI tool)
 * - Coral warmth signals "coding doesn't have to feel clinical"
 */

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PRIMITIVES
// All colors in multiple formats for maximum agent flexibility
// ═══════════════════════════════════════════════════════════════════════════

export const colors = {
  // PRIMARY: Thumb Coral
  // Strategic choice: Coral is virtually unused in dev tools but performs
  // exceptionally well in app stores. Signals warmth and approachability.
  coral: {
    50:  { hex: '#FFF5F4', rgb: [255, 245, 244], hsl: [4, 100, 98] },
    100: { hex: '#FFE8E5', rgb: [255, 232, 229], hsl: [7, 100, 95] },
    200: { hex: '#FFD0CC', rgb: [255, 208, 204], hsl: [5, 100, 90] },
    300: { hex: '#FFB3AA', rgb: [255, 179, 170], hsl: [6, 100, 83] },
    400: { hex: '#FF8F80', rgb: [255, 143, 128], hsl: [7, 100, 75] },
    500: { hex: '#FF7059', rgb: [255, 112, 89], hsl: [8, 100, 67] },  // PRIMARY
    600: { hex: '#E85A4F', rgb: [232, 90, 79], hsl: [4, 78, 61] },    // Light mode
    700: { hex: '#C74840', rgb: [199, 72, 64], hsl: [4, 55, 52] },
    800: { hex: '#A33832', rgb: [163, 56, 50], hsl: [3, 53, 42] },    // High contrast
    900: { hex: '#7F2A26', rgb: [127, 42, 38], hsl: [3, 54, 32] },
  },
  
  // SECONDARY: Digital Teal
  // Strategic choice: Deep enough to work on both dark and light backgrounds
  // with minimal adjustment. Acts as the "anchor" color across modes.
  teal: {
    50:  { hex: '#F0FDFA', rgb: [240, 253, 250], hsl: [166, 76, 97] },
    100: { hex: '#CCFBF1', rgb: [204, 251, 241], hsl: [167, 85, 89] },
    200: { hex: '#99F6E4', rgb: [153, 246, 228], hsl: [168, 84, 78] },
    300: { hex: '#5EEAD4', rgb: [94, 234, 212], hsl: [171, 77, 64] },
    400: { hex: '#2DD4BF', rgb: [45, 212, 191], hsl: [172, 66, 50] },
    500: { hex: '#14B8A6', rgb: [20, 184, 166], hsl: [173, 80, 40] },
    600: { hex: '#0D9488', rgb: [13, 148, 136], hsl: [175, 84, 32] },  // PRIMARY
    700: { hex: '#0F766E', rgb: [15, 118, 110], hsl: [175, 77, 26] },  // Light mode
    800: { hex: '#115E59', rgb: [17, 94, 89], hsl: [176, 69, 22] },    // High contrast
    900: { hex: '#134E4A', rgb: [19, 78, 74], hsl: [176, 61, 19] },
  },
  
  // ACCENT: Soft Gold
  // Strategic choice: Warm accent for success states, highlights, sparkle.
  // Connects to "achievement" and "reward" psychology.
  gold: {
    50:  { hex: '#FFFBEB', rgb: [255, 251, 235], hsl: [48, 100, 96] },
    100: { hex: '#FEF3C7', rgb: [254, 243, 199], hsl: [48, 96, 89] },
    200: { hex: '#FDE68A', rgb: [253, 230, 138], hsl: [48, 97, 77] },
    300: { hex: '#FCD34D', rgb: [252, 211, 77], hsl: [46, 97, 65] },
    400: { hex: '#F5D563', rgb: [245, 213, 99], hsl: [47, 87, 67] },   // PRIMARY
    500: { hex: '#EAB308', rgb: [234, 179, 8], hsl: [45, 93, 47] },
    600: { hex: '#D4A84B', rgb: [212, 168, 75], hsl: [41, 59, 56] },   // Light mode
    700: { hex: '#A16207', rgb: [161, 98, 7], hsl: [35, 92, 33] },     // High contrast
    800: { hex: '#854D0E', rgb: [133, 77, 14], hsl: [32, 81, 29] },
    900: { hex: '#713F12', rgb: [113, 63, 18], hsl: [28, 73, 26] },
  },
  
  // NEUTRALS: Charcoal Navy
  // Strategic choice: Warmer than pure gray, with subtle blue undertone
  // that complements the coral without competing.
  neutral: {
    50:  { hex: '#F8FAFC', rgb: [248, 250, 252], hsl: [210, 40, 98] },  // Light base
    100: { hex: '#F1F5F9', rgb: [241, 245, 249], hsl: [210, 40, 96] },
    200: { hex: '#E2E8F0', rgb: [226, 232, 240], hsl: [214, 32, 91] },
    300: { hex: '#CBD5E1', rgb: [203, 213, 225], hsl: [213, 27, 84] },
    400: { hex: '#94A3B8', rgb: [148, 163, 184], hsl: [215, 20, 65] },
    500: { hex: '#64748B', rgb: [100, 116, 139], hsl: [215, 16, 47] },
    600: { hex: '#475569', rgb: [71, 85, 105], hsl: [215, 19, 35] },
    700: { hex: '#334155', rgb: [51, 65, 85], hsl: [215, 25, 27] },
    800: { hex: '#1E293B', rgb: [30, 41, 59], hsl: [217, 33, 17] },
    900: { hex: '#0F172A', rgb: [15, 23, 42], hsl: [222, 47, 11] },
    950: { hex: '#151820', rgb: [21, 24, 32], hsl: [224, 21, 10] },    // Dark base (CHARCOAL)
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SEMANTIC COLOR TOKENS
// Mode-aware colors that adapt to dark/light/high-contrast
// ═══════════════════════════════════════════════════════════════════════════

export const semanticColors = {
  dark: {
    // Surface hierarchy
    background: colors.neutral[950],      // #151820
    surface: colors.neutral[900],         // #0F172A
    surfaceElevated: colors.neutral[800], // #1E293B
    
    // Brand colors
    primary: colors.coral[500],           // #FF7059
    secondary: colors.teal[600],          // #0D9488
    accent: colors.gold[400],             // #F5D563
    
    // Text hierarchy
    textPrimary: '#FFFFFF',
    textSecondary: colors.neutral[300],   // #CBD5E1
    textMuted: colors.neutral[500],       // #64748B
    
    // State colors
    success: colors.teal[500],            // #14B8A6
    warning: colors.gold[500],            // #EAB308
    error: colors.coral[500],             // #FF7059
    info: colors.teal[400],               // #2DD4BF
    
    // Border
    border: `${colors.neutral[700].hex}80`, // 50% opacity
    borderFocus: colors.coral[500],
  },
  
  light: {
    // Surface hierarchy
    background: colors.neutral[50],       // #F8FAFC
    surface: '#FFFFFF',
    surfaceElevated: colors.neutral[100], // #F1F5F9
    
    // Brand colors (darkened for contrast)
    primary: colors.coral[600],           // #E85A4F
    secondary: colors.teal[700],          // #0F766E
    accent: colors.gold[600],             // #D4A84B
    
    // Text hierarchy
    textPrimary: colors.neutral[950],     // #151820
    textSecondary: colors.neutral[600],   // #475569
    textMuted: colors.neutral[400],       // #94A3B8
    
    // State colors
    success: colors.teal[600],
    warning: colors.gold[600],
    error: colors.coral[600],
    info: colors.teal[500],
    
    // Border
    border: `${colors.neutral[300].hex}80`,
    borderFocus: colors.coral[600],
  },
  
  highContrast: {
    // For accessibility mode
    primary: colors.coral[800],           // #A33832
    secondary: colors.teal[800],          // #115E59
    accent: colors.gold[700],             // #A16207
    textPrimary: '#000000',
    textSecondary: colors.neutral[800],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// Google Fonts stack with semantic roles
// ═══════════════════════════════════════════════════════════════════════════

export const typography = {
  // Font families
  families: {
    display: {
      name: 'Fraunces',
      fallback: 'Georgia, serif',
      googleFonts: 'Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1',
      description: 'Soft-serif with "wonk" axis for organic imperfection. Display headlines.',
      license: 'SIL Open Font License',
    },
    body: {
      name: 'Cabin',
      fallback: 'system-ui, sans-serif',
      googleFonts: 'Cabin:ital,wght@0,400..700;1,400..700',
      description: 'Humanist sans-serif with organic, handcrafted warmth. Body text and UI.',
      license: 'SIL Open Font License',
    },
    mono: {
      name: 'JetBrains Mono',
      fallback: 'Consolas, monospace',
      googleFonts: 'JetBrains+Mono:wght@400;500;600;700',
      description: 'IDE-optimized monospace with ligatures. Code blocks.',
      license: 'SIL Open Font License',
    },
  },
  
  // Type scale (mobile-first, scale 1.2x for tablet, 1.4x for desktop)
  scale: {
    display: { size: 32, lineHeight: 40, weight: 700, family: 'display' },
    h1:      { size: 24, lineHeight: 32, weight: 600, family: 'display' },
    h2:      { size: 20, lineHeight: 28, weight: 500, family: 'display' },
    h3:      { size: 18, lineHeight: 26, weight: 500, family: 'display' },
    body:    { size: 16, lineHeight: 24, weight: 400, family: 'body' },
    bodyBold:{ size: 16, lineHeight: 24, weight: 600, family: 'body' },
    caption: { size: 14, lineHeight: 20, weight: 400, family: 'body' },
    code:    { size: 14, lineHeight: 20, weight: 400, family: 'mono' },
    small:   { size: 12, lineHeight: 16, weight: 400, family: 'body' },
  },
  
  // Fraunces variable font settings for organic feel
  displaySettings: {
    normal: `'SOFT' 50, 'WONK' 1`,  // Soft edges, organic imperfection
    sharp: `'SOFT' 0, 'WONK' 0`,    // Clean, precise
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SPACING & LAYOUT
// 4px base unit system
// ═══════════════════════════════════════════════════════════════════════════

export const spacing = {
  0: 0,
  1: 4,    // 0.25rem
  2: 8,    // 0.5rem
  3: 12,   // 0.75rem
  4: 16,   // 1rem - base
  5: 20,   // 1.25rem
  6: 24,   // 1.5rem
  8: 32,   // 2rem
  10: 40,  // 2.5rem
  12: 48,  // 3rem
  16: 64,  // 4rem
  20: 80,  // 5rem
  24: 96,  // 6rem
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIC SHAPES
// Border radii that create paint daube / blob aesthetic
// ═══════════════════════════════════════════════════════════════════════════

export const borderRadius = {
  // Standard radii
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
  
  // ORGANIC BLOB RADII (the ThumbCode signature)
  // 8-value border-radius creates asymmetric organic shapes
  blob: {
    1: '50px 45px 50px 48px / 26px 28px 26px 24px',
    2: '48px 52px 45px 50px / 24px 26px 28px 25px',
    3: '45px 48px 52px 46px / 28px 24px 26px 27px',
    4: '52px 46px 48px 50px / 25px 27px 24px 28px',
  },
  
  // Card-specific organic radius
  card: '16px 14px 16px 15px / 14px 16px 14px 15px',
  
  // Button organic radius
  button: '50px 45px 50px 48px / 26px 28px 26px 24px',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIC SHADOWS
// Layered shadows with brand color tints (the gradient killer)
// ═══════════════════════════════════════════════════════════════════════════

export const shadows = {
  // Standard shadows
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  
  // ORGANIC SHADOWS (brand color tinted - ThumbCode signature)
  // These create warm, dimensional depth that feels organic
  organic: {
    sm: [
      '0 1px 2px rgba(255, 112, 89, 0.06)',   // Coral tint
      '0 2px 4px rgba(13, 148, 136, 0.04)',   // Teal tint
      '0 4px 8px rgba(0, 0, 0, 0.04)',        // Depth
    ].join(', '),
    
    md: [
      '0 2px 4px rgba(255, 112, 89, 0.1)',    // Coral tint
      '0 4px 8px rgba(13, 148, 136, 0.08)',   // Teal tint
      '0 8px 16px rgba(0, 0, 0, 0.06)',       // Depth
    ].join(', '),
    
    lg: [
      '0 4px 8px rgba(255, 112, 89, 0.12)',   // Coral tint
      '0 8px 16px rgba(13, 148, 136, 0.1)',   // Teal tint
      '0 16px 32px rgba(0, 0, 0, 0.08)',      // Depth
    ].join(', '),
    
    xl: [
      '0 8px 16px rgba(255, 112, 89, 0.15)',  // Coral tint
      '0 16px 32px rgba(13, 148, 136, 0.12)', // Teal tint
      '0 32px 64px rgba(0, 0, 0, 0.1)',       // Depth
    ].join(', '),
  },
  
  // Focus ring (coral glow)
  focus: '0 0 0 3px rgba(255, 112, 89, 0.3)',
  
  // Error ring
  error: '0 0 0 3px rgba(255, 112, 89, 0.4)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIC TRANSFORMS
// Subtle rotations for handmade feel
// ═══════════════════════════════════════════════════════════════════════════

export const transforms = {
  // Organic rotation (apply to cards, buttons for handmade feel)
  organic: {
    cw1: 'rotate(0.3deg)',    // Clockwise slight
    cw2: 'rotate(0.6deg)',    // Clockwise more
    ccw1: 'rotate(-0.3deg)',  // Counter-clockwise slight
    ccw2: 'rotate(-0.6deg)',  // Counter-clockwise more
  },
  
  // Hover lift
  hover: 'translateY(-2px)',
  
  // Press down
  active: 'translateY(1px) scale(0.98)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION
// Motion tokens for consistent feel
// ═══════════════════════════════════════════════════════════════════════════

export const animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    slower: '600ms',
  },
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    organic: 'cubic-bezier(0.25, 0.1, 0.25, 1)',  // Slightly springy
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SVG FILTER DEFINITIONS
// Paint daube texture generation (deterministic with fixed seeds)
// ═══════════════════════════════════════════════════════════════════════════

export const svgFilters = {
  // Base paint daube effect
  paintDaube: `
    <filter id="paint-daube" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="1" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  `,
  
  // Heavy paint texture
  paintHeavy: `
    <filter id="paint-heavy" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" seed="5" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
      <feGaussianBlur in="displaced" stdDeviation="0.5" result="blur"/>
      <feComposite in="blur" in2="SourceGraphic" operator="atop"/>
    </filter>
  `,
  
  // Thumbprint concentric distortion
  thumbprint: `
    <filter id="thumbprint" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="turbulence" baseFrequency="0.015 0.08" numOctaves="2" seed="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  `,
  
  // Subtle organic noise
  organicNoise: `
    <filter id="organic-noise" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  `,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE BREAKPOINTS
// Responsive design targets
// ═══════════════════════════════════════════════════════════════════════════

export const breakpoints = {
  // Mobile-first breakpoints
  sm: 640,   // Small phones
  md: 768,   // Large phones, small tablets
  lg: 1024,  // Tablets, small laptops
  xl: 1280,  // Desktop
  '2xl': 1536, // Large desktop
  
  // Target devices
  devices: {
    iPhone16ProMax: { width: 430, height: 932, scale: 3, ppi: 460 },
    pixel8a: { width: 412, height: 915, scale: 2.625, ppi: 431 },
    onePlusOpenFolded: { width: 402, height: 847, scale: 3.5, ppi: 426 },
    onePlusOpenUnfolded: { width: 1024, height: 1097, scale: 2.8, ppi: 426 },
    iPadPro13: { width: 1032, height: 1376, scale: 2, ppi: 264 },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT TOKENS
// Pre-composed component styles
// ═══════════════════════════════════════════════════════════════════════════

export const components = {
  button: {
    primary: {
      background: colors.coral[500].hex,
      color: colors.neutral[950].hex,
      borderRadius: borderRadius.button,
      padding: `${spacing[3]}px ${spacing[6]}px`,
      fontWeight: 600,
      shadow: shadows.organic.sm,
      hoverBackground: colors.coral[400].hex,
      activeTransform: transforms.active,
    },
    secondary: {
      background: 'transparent',
      color: colors.teal[600].hex,
      border: `2px solid ${colors.teal[600].hex}`,
      borderRadius: borderRadius.button,
      padding: `${spacing[3]}px ${spacing[6]}px`,
      fontWeight: 600,
      hoverBackground: `${colors.teal[600].hex}10`,
    },
    ghost: {
      background: 'transparent',
      color: colors.coral[500].hex,
      borderRadius: borderRadius.button,
      padding: `${spacing[3]}px ${spacing[6]}px`,
      fontWeight: 600,
      hoverBackground: `${colors.coral[500].hex}10`,
    },
  },
  
  card: {
    background: semanticColors.dark.surfaceElevated,
    borderRadius: borderRadius.card,
    padding: spacing[4],
    shadow: shadows.organic.md,
    transform: transforms.organic.ccw1,
  },
  
  input: {
    background: semanticColors.dark.surface,
    border: `1px solid ${colors.teal[600].hex}30`,
    borderRadius: borderRadius.lg,
    padding: `${spacing[3]}px ${spacing[4]}px`,
    focusBorder: colors.coral[500].hex,
    focusShadow: shadows.focus,
    errorBorder: colors.coral[500].hex,
    errorShadow: shadows.error,
  },
  
  chatBubble: {
    user: {
      background: `${colors.teal[600].hex}20`,
      borderRadius: '16px 16px 4px 16px',
      align: 'right',
    },
    agent: {
      background: semanticColors.dark.surfaceElevated,
      borderRadius: '16px 16px 16px 4px',
      align: 'left',
      accentBorder: `2px solid ${colors.coral[500].hex}`,
    },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TAILWIND/NATIVEWIND CONFIG EXPORT
// Ready to drop into tailwind.config.js
// ═══════════════════════════════════════════════════════════════════════════

export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        coral: Object.fromEntries(
          Object.entries(colors.coral).map(([k, v]) => [k, v.hex])
        ),
        teal: Object.fromEntries(
          Object.entries(colors.teal).map(([k, v]) => [k, v.hex])
        ),
        gold: Object.fromEntries(
          Object.entries(colors.gold).map(([k, v]) => [k, v.hex])
        ),
        charcoal: colors.neutral[950].hex,
      },
      fontFamily: {
        display: [typography.families.display.name, typography.families.display.fallback],
        body: [typography.families.body.name, typography.families.body.fallback],
        mono: [typography.families.mono.name, typography.families.mono.fallback],
      },
      borderRadius: {
        'blob-1': borderRadius.blob[1],
        'blob-2': borderRadius.blob[2],
        'blob-3': borderRadius.blob[3],
        'blob-4': borderRadius.blob[4],
        'card': borderRadius.card,
        'button': borderRadius.button,
      },
      boxShadow: {
        'organic-sm': shadows.organic.sm,
        'organic-md': shadows.organic.md,
        'organic-lg': shadows.organic.lg,
        'organic-xl': shadows.organic.xl,
        'focus': shadows.focus,
      },
      rotate: {
        'organic-cw': '0.3deg',
        'organic-ccw': '-0.3deg',
      },
    },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CSS CUSTOM PROPERTIES EXPORT
// Ready to paste into :root
// ═══════════════════════════════════════════════════════════════════════════

export const cssCustomProperties = `
:root {
  /* Colors */
  --color-coral-500: ${colors.coral[500].hex};
  --color-coral-600: ${colors.coral[600].hex};
  --color-teal-600: ${colors.teal[600].hex};
  --color-teal-700: ${colors.teal[700].hex};
  --color-gold-400: ${colors.gold[400].hex};
  --color-charcoal: ${colors.neutral[950].hex};
  
  /* Typography */
  --font-display: '${typography.families.display.name}', ${typography.families.display.fallback};
  --font-body: '${typography.families.body.name}', ${typography.families.body.fallback};
  --font-mono: '${typography.families.mono.name}', ${typography.families.mono.fallback};
  
  /* Spacing */
  --space-1: ${spacing[1]}px;
  --space-2: ${spacing[2]}px;
  --space-4: ${spacing[4]}px;
  --space-6: ${spacing[6]}px;
  --space-8: ${spacing[8]}px;
  
  /* Border Radius */
  --radius-blob: ${borderRadius.blob[1]};
  --radius-card: ${borderRadius.card};
  --radius-button: ${borderRadius.button};
  
  /* Shadows */
  --shadow-organic-md: ${shadows.organic.md};
  --shadow-focus: ${shadows.focus};
  
  /* Animation */
  --duration-fast: ${animation.duration.fast};
  --duration-normal: ${animation.duration.normal};
  --easing-organic: ${animation.easing.organic};
}
`;

// Default export for convenience
export default {
  colors,
  semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transforms,
  animation,
  svgFilters,
  breakpoints,
  components,
  tailwindConfig,
  cssCustomProperties,
};
