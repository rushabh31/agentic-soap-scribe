
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: [
        'node:async_hooks',
        'node:events',
        'node:fs',
        'node:http',
        'node:https',
        'node:net',
        'node:path',
        'node:stream',
        'node:url',
        'node:util',
        'node:zlib',
      ],
    },
  },
}));
