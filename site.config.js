const operator = {
  name: 'ИП Орехова Александра Денисовна',
  ogrnip: '323385000018091',
  inn: '381206224301'
};

export function siteDetails() {
  const telegramUsername = 'Roman77work';
  const telegramDraft = encodeURIComponent('Хочу стать партнёром');

  const values = {
    OPERATOR_NAME: operator.name,
    OPERATOR_OGRNIP: operator.ogrnip,
    OPERATOR_INN: operator.inn,
    TELEGRAM_URL: `https://t.me/${telegramUsername}?text=${telegramDraft}`,
    TELEGRAM_USERNAME: telegramUsername
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
