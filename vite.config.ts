/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative asset paths: the launcher serves the build at a loopback origin's root, and a static
// host may serve it from a sub-path. The test setup gives IndexedDB to jsdom.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2022', sourcemap: false, assetsInlineLimit: 0 },
  test: {
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
  },
});
