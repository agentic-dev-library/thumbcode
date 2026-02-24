/**
 * Vitest config for integration tests.
 *
 * Runs in Node (not jsdom) with longer timeouts.
 * Uses Polly.js to record/replay HTTP responses from AI providers.
 *
 * Recording mode:  POLLY_MODE=record doppler run -- pnpm test:integration
 * Replay mode:     pnpm test:integration  (default, uses cassettes)
 */

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/integration/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 15_000,
  },
});
