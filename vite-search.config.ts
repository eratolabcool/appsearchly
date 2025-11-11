import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export default defineConfig({
  plugins: [sveltekit()],
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['src/styles']
      }
    }
  },
  resolve: {
    alias: {
      '@amp/web-app-components': fileURLToPath(new URL('./shared/components/src', import.meta.url)),
      '@amp/web-apps-fonts': fileURLToPath(new URL('./shared/fonts/src', import.meta.url)),
      // This alias helps JS/TS imports; Sass uses includePaths above.
      '@amp/web-shared-styles': fileURLToPath(new URL('./src/styles/@amp/web-shared-styles', import.meta.url))
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte'],
          utils: ['./src/utils/affiliate.ts']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@sveltejs/kit']
  },
  server: {
    port: 5173,
    host: true,
    open: true
  },
  preview: {
    port: 4173,
    host: true
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});