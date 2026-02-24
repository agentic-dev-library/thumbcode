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
        // Organic asymmetric
        'organic-card': '1rem 0.75rem 1.25rem 0.5rem',
        'organic-button': '0.5rem 0.75rem 0.625rem 0.875rem',
        'organic-badge': '0.375rem 0.5rem 0.625rem 0.25rem',
        'organic-input': '0.5rem 0.625rem 0.5rem 0.75rem',
        'organic-hero': '1.75rem 1.5rem 2rem 1.25rem',
        'organic-cta': '0.875rem 1rem 0.75rem 1.125rem',
        'organic-modal': '1.125rem 1rem 1.25rem 0.875rem',
        'organic-toast': '0.875rem 0.75rem 1rem 0.625rem',
        'organic-code': '0.75rem 0.625rem 0.75rem 0.5rem',
        'organic-chat-user': '1rem 0.375rem 1rem 0.875rem',
        'organic-chat-agent': '0.375rem 1rem 1rem 0.875rem',
      },
      boxShadow: {
        'organic-card': '2px 4px 8px -2px rgb(0 0 0 / 0.08), -1px 2px 4px -1px rgb(0 0 0 / 0.04)',
        'organic-elevated':
          '4px 8px 16px -4px rgb(0 0 0 / 0.12), -2px 4px 8px -2px rgb(0 0 0 / 0.06)',
        'organic-float':
          '8px 16px 32px -8px rgb(0 0 0 / 0.16), -4px 8px 16px -4px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
