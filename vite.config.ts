import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    host: true,
    open: false
  },
  preview: {
    port: 4173,
    host: true
  }
});