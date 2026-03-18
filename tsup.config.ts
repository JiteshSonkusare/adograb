import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  clean: true,
  splitting: false,
  sourcemap: false,
  external: [
    /^@inquirer\//,
    'axios',
    'commander',
    'conf',
    'execa',
    'keytar',
  ],
  banner: {
    js: '#!/usr/bin/env node',
  },
});
