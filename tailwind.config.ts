import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors per CLAUDE.md P3 "Warm Technical" palette
        // Primary - Coral (Thumb Coral)
        coral: {
          100: '#FFE5E0',
          200: '#FFCCC2',
          300: '#FFB2A3',
          400: '#FF8A7A', // Hover states, light accents
          500: '#FF7059', // Primary - buttons, links, focus states
          600: '#E85A4F', // Light mode variant
          700: '#C74840', // Active/pressed states
          800: '#A33832', // High contrast mode
          900: '#7A2A26',
        },
        // Secondary - Teal (Digital Teal)
        teal: {
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF', // Light accents, highlights
          500: '#14B8A6', // Secondary elements
          600: '#0D9488', // Primary secondary - links, badges
          700: '#0F766E', // Light mode variant
          800: '#115E59', // High contrast mode
          900: '#134E4A',
        },
        // Accent - Gold (Soft Gold)
        gold: {
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE68A', // Light highlights
          400: '#F5D563', // Primary accent - indicators, success
          500: '#EAB308', // Strong accent
          600: '#D4A84B', // Light mode variant
          700: '#A16207', // High contrast mode
          800: '#854D0E',
          900: '#713F12',
        },
        // Charcoal Navy - Base dark
        charcoal: '#151820',
        // Surface colors for dark mode
        surface: {
          DEFAULT: '#1E293B', // neutral-800
          elevated: '#334155', // neutral-700
        },
        // Semantic colors using brand palette
        success: '#14B8A6', // teal-500
        warning: '#F5D563', // gold-400
        error: '#FF7059', // coral-500
        info: '#0D9488', // teal-600
        // Neutrals per design tokens
        neutral: {
          50: '#F8FAFC', // Light mode background (Off White)
          100: '#F1F5F9', // Light mode elevated surface
          200: '#E2E8F0', // Borders in light mode
          300: '#CBD5E1', // Disabled states
          400: '#94A3B8', // Placeholder text, muted elements
          500: '#64748B', // Secondary text
          600: '#475569', // Body text in light mode
          700: '#334155', // Elevated surface in dark mode
          800: '#1E293B', // Surface in dark mode
          900: '#0F172A', // Deep background
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Cabin', 'system-ui', 'sans-serif'],
        cabin: ['Cabin', 'system-ui', 'sans-serif'], // Alias for convenience
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        // Standard
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
        // Organic asymmetric — paint-daube style per CLAUDE.md
        'organic-card': '20px 18px 22px 16px / 16px 20px 18px 22px',
        'organic-button': '50px 45px 50px 48px / 26px 28px 26px 24px',
        'organic-badge': '8px 12px 10px 6px / 6px 10px 12px 8px',
        'organic-input': '12px 14px 12px 16px / 10px 12px 14px 10px',
        'organic-hero': '28px 24px 32px 20px / 20px 24px 28px 18px',
        'organic-cta': '14px 16px 12px 18px / 10px 14px 12px 16px',
        'organic-modal': '18px 16px 20px 14px / 14px 18px 16px 20px',
        'organic-toast': '14px 12px 16px 10px / 10px 14px 12px 16px',
        'organic-code': '12px 10px 12px 8px / 8px 12px 10px 12px',
        'organic-chat-user': '16px 6px 16px 14px / 14px 6px 16px 12px',
        'organic-chat-agent': '6px 16px 16px 14px / 6px 14px 16px 12px',
      },
      boxShadow: {
        'organic-card':
          '0 2px 4px rgba(13, 148, 136, 0.08), 0 8px 24px rgba(21, 24, 32, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'organic-elevated':
          '0 4px 8px rgba(13, 148, 136, 0.1), 0 16px 32px rgba(21, 24, 32, 0.16), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'organic-float':
          '0 8px 16px rgba(255, 112, 89, 0.15), 0 24px 48px rgba(21, 24, 32, 0.2), 0 4px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
