import { defineConfig } from 'vite';
import { siteDetails } from './site.config.js';

export default defineConfig(({ mode }) => ({
  plugins: [siteDetails(mode)],
  publicDir: 'public',
  build: {
    outDir: 'dist-pages',
    emptyOutDir: true
  }
}));
