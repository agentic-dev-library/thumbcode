import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary - Coral/Salmon
        primary: {
          50: '#FEF2F0',
          100: '#FDE5E1',
          200: '#FBCBC3',
          300: '#F9B1A5',
          400: '#F28B79', // Main
          500: '#E66550',
          600: '#CD4C35',
          700: '#A73927',
          800: '#812C1E',
          900: '#5B1F15',
        },
        // Secondary - Deep Teal
        secondary: {
          50: '#ECF6F7',
          100: '#D9EDEF',
          200: '#B3DBDF',
          300: '#8DC9CF',
          400: '#51AFB9', // Main
          500: '#2C96A3',
          600: '#1E7885',
          700: '#185F6B',
          800: '#124851',
          900: '#0C3037',
        },
        // Accent - Soft Gold
        accent: {
          50: '#FEFAF0',
          100: '#FDF5E1',
          200: '#FBEBC3',
          300: '#F9E1A5',
          400: '#F2CF79', // Main
          500: '#DEB84D',
          600: '#C09C35',
          700: '#9A7D27',
          800: '#745E1D',
          900: '#4E3F13',
        },
        // Semantic
        success: '#38B882',
        warning: '#F2CF79',
        error: '#E66550',
        info: '#51AFB9',
        // Neutrals - Warm grays
        neutral: {
          0: '#FFFFFF',
          50: '#FAF9F8',
          100: '#F5F3F1',
          200: '#EBE7E3',
          300: '#D7D1CB',
          400: '#AFA79F',
          500: '#877F77',
          600: '#69635D',
          700: '#4B4642',
          800: '#322E2B',
          900: '#1E1B19',
          950: '#0F0D0C',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Cabin', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        // Standard
        'none': '0',
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        'full': '9999px',
        // Organic asymmetric
        'organic-card': '1rem 0.75rem 1.25rem 0.5rem',
        'organic-button': '0.5rem 0.75rem 0.625rem 0.875rem',
        'organic-badge': '0.375rem 0.5rem 0.625rem 0.25rem',
        'organic-input': '0.5rem 0.625rem 0.5rem 0.75rem',
      },
      boxShadow: {
        'organic-card': '2px 4px 8px -2px rgb(0 0 0 / 0.08), -1px 2px 4px -1px rgb(0 0 0 / 0.04)',
        'organic-elevated': '4px 8px 16px -4px rgb(0 0 0 / 0.12), -2px 4px 8px -2px rgb(0 0 0 / 0.06)',
        'organic-float': '8px 16px 32px -8px rgb(0 0 0 / 0.16), -4px 8px 16px -4px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
