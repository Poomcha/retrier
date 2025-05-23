import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'lib',
  clean: true,
});
