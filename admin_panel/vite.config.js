import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Split the heavy MUI/Emotion UI layer into its own chunk for caching.
        // Everything else (React runtime, router, query, forms) stays in a
        // single `vendor` chunk. Isolating only `react` previously created a
        // circular `vendor -> react -> vendor` chunk graph, which executes
        // modules out of order in production and blanks the page.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
          return 'vendor';
        },
      },
    },
  },
});
