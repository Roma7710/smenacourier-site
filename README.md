# СМЕНА

Лендинг партнёрской программы по подбору курьеров.

## Локальный запуск

```bash
pnpm install
pnpm dev
```

## Сборка

```bash
pnpm build
```

Готовая Cloudflare Workers-совместимая сборка создаётся в `dist/`.

## Приём заявок

Кнопка открывает чат в Telegram с текстом «Хочу стать партнёром». Контакт задан в `site.config.js`.

## Основные файлы

- `index.html` — структура и тексты страницы;
- `assets/styles.css` — визуальная система и адаптивность;
- `assets/app.js` — калькулятор и интерактивные элементы;
- `site.config.js` — реквизиты и контакт в Telegram;
- `public/og.jpg` — превью ссылки;
- `worker/index.js` — точка входа для сборки Cloudflare Workers.
