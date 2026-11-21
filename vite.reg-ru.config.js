import { defineConfig } from 'vite';
import { siteDetails } from './site.config.js';

export default defineConfig({
  plugins: [siteDetails()],
  publicDir: 'public',
  build: {
    outDir: 'dist-reg-ru',
    emptyOutDir: true
  }
});
