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

const monthCard = document.querySelector('.month-example');
if (monthCard) {
  const lampOn = () => monthCard.classList.add('is-lit');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    lampOn();
  } else {
    const threshold = 0.4;
    const lampObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          lampOn();
          lampObserver.unobserve(entry.target);
        }
      });
    }, { threshold });
    lampObserver.observe(monthCard);
  }
}

const toTop = $('up');
const partnerSection = $('form');
const mobileActions = $('mobile-actions');
const observeMonthCard = monthCard && 'IntersectionObserver' in window;

if (observeMonthCard) {
  const mobileBarObserver = new IntersectionObserver(([entry]) => {
    const passed = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
    mobileActions.classList.toggle('is-hidden', !passed);
  }, { threshold: 0 });
  mobileBarObserver.observe(monthCard);
}

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

function updateFixedControls() {
  const bounds = partnerSection.getBoundingClientRect();
  const nearPartnerSection = bounds.top < innerHeight && bounds.bottom > 0;
  nav.classList.toggle('scrolled', scrollY > 12);
  const showTop = scrollY > 850 && !nearPartnerSection;
  toTop.hidden = !showTop;
  toTop.classList.toggle('show', showTop);
  mobileActions.hidden = nearPartnerSection;
  if (!observeMonthCard) {
    const cardBottom = monthCard?.getBoundingClientRect().bottom ?? 0;
    mobileActions.classList.toggle('is-hidden', cardBottom > 0);
  }
}

addEventListener('scroll', updateFixedControls, { passive: true });
addEventListener('resize', updateFixedControls);
updateFixedControls();

$('year').textContent = new Date().getFullYear();
