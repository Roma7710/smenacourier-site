import { defineConfig } from 'vite';
import { siteDetails } from './site.config.js';

export default defineConfig(async ({ mode }) => {
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    plugins: [
      siteDetails(mode),
      cloudflare({
        config: {
          name: 'server',
          main: './worker/index.js',
          compatibility_flags: ['nodejs_compat']
        }
      })
    ]
  };
});
