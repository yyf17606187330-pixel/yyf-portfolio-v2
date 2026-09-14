import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const testSetupFile = fileURLToPath(new URL('./src/test/setup.ts', import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        minimal: fileURLToPath(new URL('./index.html', import.meta.url)),
        p5: fileURLToPath(new URL('./p5/index.html', import.meta.url)),
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [...configDefaults.exclude, '**/.worktrees/**'],
    setupFiles: testSetupFile,
  },
});
