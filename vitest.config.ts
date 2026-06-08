import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx', '**/*.e2e.ts', '**/*.e2e.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.e2e.ts',
        '**/*.e2e.test.ts',
      ],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
