import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    cloudflare({
      config: {
        name: 'server',
        main: './worker/index.js',
        compatibility_flags: ['nodejs_compat']
      }
    })
  ]
});
