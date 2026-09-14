import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const testSetupFile = fileURLToPath(new URL('./src/test/setup.ts', import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [...configDefaults.exclude, '**/.worktrees/**'],
    setupFiles: testSetupFile,
  },
});
