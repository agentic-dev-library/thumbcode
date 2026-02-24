import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  build: {
    outDir: 'dist',
    target: 'es2022',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-zustand': ['zustand'],
          'vendor-ai': ['ai', '@ai-sdk/anthropic', '@ai-sdk/openai'],
          'vendor-git': ['isomorphic-git'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
