import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Node by default (fast) for the pure-logic tests. Component tests opt into
    // jsdom per-file via a `// @vitest-environment jsdom` docblock.
    environment: 'node',
  },
});
