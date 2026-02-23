// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',  // 500.astro → dist/500.html (flat files, not subdirs)
  },
});
