import { loadEnv } from 'vite';

const operator = {
  name: 'ИП Орехова Александра Денисовна',
  ogrnip: '323385000018091',
  inn: '381206224301'
};

export function siteDetails(mode) {
  const env = loadEnv(mode, process.cwd(), ['LEAD_ENDPOINT', 'VITE_LEAD_ENDPOINT']);
  const leadEndpoint = (env.LEAD_ENDPOINT || env.VITE_LEAD_ENDPOINT || '').trim();
  if (leadEndpoint && new URL(leadEndpoint).protocol !== 'https:') {
    throw new Error('LEAD_ENDPOINT must use HTTPS');
  }
  const telegram = new URL('https://t.me/Roman77work');
  telegram.searchParams.set('text', 'Хочу стать партнёром');

  const values = {
    OPERATOR_NAME: operator.name,
    OPERATOR_OGRNIP: operator.ogrnip,
    OPERATOR_INN: operator.inn,
    TELEGRAM_URL: telegram.href,
    LEAD_ENDPOINT: leadEndpoint
  };

  return {
    name: 'smena-site-details',
    config() {
      return { build: { assetsInlineLimit: 0 } };
    },
    transformIndexHtml(html) {
      return html.replace(/%SMENA_(\w+)%/g, (_, key) => {
        if (!(key in values)) throw new Error(`Unknown site setting: ${key}`);
        return values[key].replace(/[&"<>]/g, character => ({
          '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'
        })[character]);
      });
    }
  };
}
