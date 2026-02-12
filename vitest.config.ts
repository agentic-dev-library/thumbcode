import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'src/**/__tests__/**/*.test.{ts,tsx}',
      'app/**/__tests__/**/*.test.{ts,tsx}',
      'packages/state/src/__tests__/**/*.test.{ts,tsx}',
      'packages/core/src/**/__tests__/**/*.test.{ts,tsx}',
      'packages/config/src/__tests__/**/*.test.{ts,tsx}',
      'packages/ui/src/__tests__/**/*.test.{ts,tsx}',
      'packages/agent-intelligence/src/**/__tests__/**/*.test.{ts,tsx}',
    ],
    exclude: ['**/node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
      exclude: ['**/__tests__/**', '**/*.d.ts', '**/types/**'],
    },
  },
});
