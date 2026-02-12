import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: {
    // React Native web compatibility
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  resolve: {
    alias: {
      // Map react-native to react-native-web for web builds.
      // Existing RN imports remain until later migration workstreams.
      'react-native': 'react-native-web',
      // Stub out RN internals that react-native-web does not ship
      '@react-native/assets-registry/registry': path.resolve(
        __dirname,
        'src/stubs/react-native-assets-registry.ts',
      ),
      '@react-native/assets-registry': path.resolve(
        __dirname,
        'src/stubs/react-native-assets-registry.ts',
      ),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
  },
  optimizeDeps: {
    include: ['react-native-web'],
    esbuild: {
      loader: 'tsx',
      include: /\.[jt]sx?$/,
    },
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
  },
});
