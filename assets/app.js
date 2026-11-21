import { normalizedContact, validName } from './lead-data.js';

const CITIES = [
  ['Москва', 580, 58000],
  ['Санкт-Петербург', 555, 55500],
  ['Красногорск', 545, 54500],
  ['Мытищи', 540, 54000],
  ['Люберцы', 535, 53500],
  ['Екатеринбург', 500, 50000],
  ['Новосибирск', 495, 49500],
  ['Казань', 480, 48000],
  ['Нижний Новгород', 475, 47500],
  ['Сочи', 470, 47000],
  ['Краснодар', 465, 46500],
  ['Самара', 455, 45500],
  ['Ростов-на-Дону', 450, 45000],
  ['Челябинск', 440, 44000],
  ['Уфа', 435, 43500],
  ['Пермь', 428, 42800],
  ['Калининград', 425, 42500],
  ['Воронеж', 420, 42000],
  ['Волгоград', 415, 41500],
  ['Тюмень', 415, 41500],
  ['Красноярск', 405, 40500],
  ['Саратов', 400, 40000],
  ['Омск', 398, 39800],
  ['Тольятти', 388, 38800],
  ['Ижевск', 382, 38200],
  ['Барнаул', 378, 37800]
];

const $ = id => document.getElementById(id);
const rub = value => `${value.toLocaleString('ru-RU')} ₽`;

function plural(value, one, few, many) {
  const lastTwo = value % 100;
  const last = value % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

const citySelect = $('city');

CITIES.forEach(([name, , cap], index) => {
  citySelect.add(new Option(`${name} · до ${rub(cap)}`, index));
});

const couriers = $('couriers');
const orders = $('orders');

function paintRange(element) {
  const percent = (element.value - element.min) / (element.max - element.min) * 100;
  element.style.setProperty('--fill', `${percent}%`);
}

function calculate() {
  const [name, rate, cap] = CITIES[Number(citySelect.value)];
  const courierCount = Number(couriers.value);
  const orderCount = Number(orders.value);
  const perCourier = Math.min(rate * orderCount, cap);

  $('cv').value = courierCount;
  $('cv').textContent = courierCount;
  $('ov').value = orderCount;
  $('ov').textContent = orderCount;
  $('total').textContent = rub(perCourier * courierCount);
  $('sub').textContent = `${name} · ${courierCount} ${plural(courierCount, 'курьер', 'курьера', 'курьеров')} по ${orderCount} ${plural(orderCount, 'заказу', 'заказа', 'заказов')}`;
  $('per').textContent = rub(perCourier);
  $('rate').textContent = rub(rate);
  $('cap').textContent = rub(cap);
  $('ords').textContent = (courierCount * orderCount).toLocaleString('ru-RU');
  $('hint').textContent = orderCount === 100
    ? 'Расчёт достиг максимальной выплаты за одного курьера в выбранном городе.'
    : `До максимума в этом городе курьеру нужно выполнить ещё ${100 - orderCount} ${plural(100 - orderCount, 'заказ', 'заказа', 'заказов')} в первые 20 дней.`;

  paintRange(couriers);
  paintRange(orders);
}

[citySelect, couriers, orders].forEach(element => element.addEventListener('input', calculate));
calculate();

const form = $('lead');
const submitButton = $('btn');
const errorMessage = $('err');
const successMessage = $('ok');
const nameInput = $('fname');
const contactInput = $('fphone');
const agreement = $('fagree');
const contactMode = $('contact-mode');
const leadEndpoint = form.dataset.endpoint;
let telegramInput = false;
let lastSubmission;

if (!leadEndpoint) {
  submitButton.textContent = 'Открыть заявку в Telegram';
  $('telegram-draft-note').hidden = false;
}

function useTelegramInput(enabled) {
  telegramInput = enabled;
  contactInput.type = enabled ? 'text' : 'tel';
  contactInput.inputMode = enabled ? 'text' : 'tel';
  contactInput.autocomplete = enabled ? 'off' : 'tel';
  contactInput.placeholder = enabled ? '@username' : '+7 900 000-00-00 или @username';
  contactMode.textContent = enabled ? 'Ввести номер телефона' : 'Ввести ник Telegram';
}

contactMode.addEventListener('click', () => {
  useTelegramInput(!telegramInput);
  contactInput.value = telegramInput ? '@' : '';
  setFieldError(contactInput, '');
  contactInput.focus();
});

contactInput.addEventListener('input', event => {
  const value = contactInput.value;
  if (value.trimStart().startsWith('@')) {
    useTelegramInput(true);
    return;
  }
  if (telegramInput || !/^(?:\+7|[78])?[\d ()-]+$/.test(value) || event.inputType?.startsWith('delete')) return;

  const digits = value.replace(/\D/g, '');
  if (!digits) return;
  const hasPrefix = /^[78]/.test(digits);
  const number = hasPrefix ? digits.slice(1) : digits;
  if (number.length > 10) return;

  const caret = contactInput.selectionStart;
  const digitsBeforeCaret = value.slice(0, caret).replace(/\D/g, '').length + Number(!hasPrefix);
  const blocks = [number.slice(0, 3), number.slice(3, 6), number.slice(6, 8), number.slice(8)];
  const local = blocks.slice(1).filter(Boolean).join('-');
  const formatted = ['+7', blocks[0], local].filter(Boolean).join(' ');
  if (value === formatted) return;
  contactInput.value = formatted;
  if (caret !== value.length && digitsBeforeCaret) {
    const digit = [...formatted.matchAll(/\d/g)][digitsBeforeCaret - 1];
    if (digit) contactInput.setSelectionRange(digit.index + 1, digit.index + 1);
  }
});

function setFieldError(field, message) {
  const detail = $(field.getAttribute('aria-describedby'));
  detail.textContent = message;
  detail.hidden = !message;
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
}

[nameInput, contactInput, agreement].forEach(field => {
  field.addEventListener('input', () => setFieldError(field, ''));
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitButton.disabled) return;
  errorMessage.hidden = true;

  const name = nameInput.value.trim();
  const phone = normalizedContact(contactInput.value);
  const fields = [
    [nameInput, validName(name) ? '' : 'Укажите имя — хотя бы два символа.'],
    [contactInput, phone ? '' : 'Укажите номер с кодом +7 или ник в формате @username.'],
    [agreement, agreement.checked ? '' : 'Подтвердите согласие на обработку данных.']
  ];
  fields.forEach(([field, message]) => setFieldError(field, message));
  const firstInvalid = fields.find(([, message]) => message);
  if (firstInvalid) {
    firstInvalid[0].focus();
    return;
  }

  if (!leadEndpoint) {
    const draft = new URL($('lead-entry').querySelector('.telegram-button').href);
    draft.searchParams.set('text', `Хочу стать партнёром\nИмя: ${name}\nКонтакт: ${phone}`);
    location.assign(draft.href);
    return;
  }

  if (lastSubmission?.name !== name || lastSubmission?.phone !== phone) {
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte =>
      byte.toString(16).padStart(2, '0')
    ).join('');
    lastSubmission = { id, name, phone, consent: true };
  }
  submitButton.disabled = true;
  submitButton.textContent = 'Отправляем…';
  form.setAttribute('aria-busy', 'true');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(leadEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(lastSubmission),
      signal: controller.signal,
      redirect: 'error'
    });

    const contentType = response.headers.get('Content-Type') || '';
    if (!response.ok || contentType.includes('text/html')) throw new Error('Delivery failed');
    if (contentType.includes('application/json') && response.status !== 204) {
      const result = await response.json();
      if (result?.ok === false || result?.success === false) throw new Error('Delivery failed');
    }

    form.reset();
    lastSubmission = undefined;
    $('lead-entry').hidden = true;
    successMessage.hidden = false;
    successMessage.querySelector('h3').focus({ preventScroll: true });
    successMessage.scrollIntoView({ block: 'center', behavior: 'instant' });
  } catch {
    errorMessage.textContent = 'Не удалось подтвердить отправку. Попробуйте ещё раз или напишите нам в Telegram.';
    errorMessage.hidden = false;
  } finally {
    clearTimeout(timeout);
    submitButton.disabled = false;
    submitButton.textContent = 'Отправить заявку';
    form.removeAttribute('aria-busy');
  }
});

form.hidden = false;

const nav = $('nav');
const burger = $('burger');

burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});

$('navLinks').addEventListener('click', event => {
  if (event.target.closest('a')) {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }
});

document.querySelectorAll('.faq details').forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq details[open]').forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});

document.querySelectorAll('[data-dialog]').forEach(button => {
  button.addEventListener('click', () => {
    const dialog = $(button.dataset.dialog);
    if (dialog?.showModal) dialog.showModal();
  });
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -35px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('in'));
}

const toTop = $('up');
const leadSection = $('form');
const mobileActions = $('mobile-actions');
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

function updateFixedControls() {
  const bounds = leadSection.getBoundingClientRect();
  const nearForm = bounds.top < innerHeight && bounds.bottom > 0;
  nav.classList.toggle('scrolled', scrollY > 12);
  const showTop = scrollY > 850 && !nearForm;
  toTop.hidden = !showTop;
  toTop.classList.toggle('show', showTop);
  mobileActions.hidden = nearForm;
}

addEventListener('scroll', updateFixedControls, { passive: true });
addEventListener('resize', updateFixedControls);
updateFixedControls();

$('year').textContent = new Date().getFullYear();
