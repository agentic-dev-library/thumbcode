import type { Config } from 'tailwindcss';

/**
 * ThumbCode Tailwind Configuration
 * P3 "Warm Technical" palette for NativeWind
 * 
 * NEVER modify core brand colors without updating CLAUDE.md
 */

const config: Config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════════
      // COLORS - P3 Warm Technical
      // ═══════════════════════════════════════════════════════════════════
      colors: {
        // Primary - Thumb Coral
        coral: {
          400: '#FF8A7A',
          500: '#FF7059', // DEFAULT
          600: '#E85A4F',
          700: '#C74840',
          800: '#A33832',
        },
        // Secondary - Digital Teal
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488', // DEFAULT
          700: '#0F766E',
          800: '#115E59',
        },
        // Accent - Soft Gold
        gold: {
          300: '#FDE68A',
          400: '#F5D563', // DEFAULT
          500: '#EAB308',
          600: '#D4A84B',
          700: '#A16207',
        },
        // Base - Charcoal Navy
        charcoal: '#151820',
        // Surface colors
        surface: {
          DEFAULT: '#1E293B',
          elevated: '#334155',
        },
      },
      
      // ═══════════════════════════════════════════════════════════════════
      // TYPOGRAPHY
      // ═══════════════════════════════════════════════════════════════════
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Cabin', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      
      // ═══════════════════════════════════════════════════════════════════
      // BORDER RADIUS - Organic shapes
      // ═══════════════════════════════════════════════════════════════════
      borderRadius: {
        organic: '50px 45px 50px 48px / 26px 28px 26px 24px',
        'organic-card': '20px 18px 22px 16px / 16px 20px 18px 22px',
      },
      
      // ═══════════════════════════════════════════════════════════════════
      // SHADOWS - With brand color tints
      // ═══════════════════════════════════════════════════════════════════
      boxShadow: {
        organic: '0 2px 4px rgba(13, 148, 136, 0.08), 0 8px 24px rgba(21, 24, 32, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'organic-coral': '0 4px 12px rgba(255, 112, 89, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'organic-lg': '0 4px 8px rgba(13, 148, 136, 0.1), 0 12px 32px rgba(21, 24, 32, 0.15)',
        focus: '0 0 0 3px rgba(255, 112, 89, 0.3)',
      },
      
      // ═══════════════════════════════════════════════════════════════════
      // ANIMATION
      // ═══════════════════════════════════════════════════════════════════
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      
      // ═══════════════════════════════════════════════════════════════════
      // CUSTOM UTILITIES
      // ═══════════════════════════════════════════════════════════════════
      rotate: {
        'organic-left': '-0.3deg',
        'organic-right': '0.3deg',
      },
    },
  },
  plugins: [],
};

export default config;
