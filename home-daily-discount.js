(() => {
  'use strict';

  const sharedDrinks = typeof window !== 'undefined' && window.BCF_MENU_DRINKS
    ? window.BCF_MENU_DRINKS
    : (typeof require === 'function' ? require('./menu-drinks.js') : null);

  const resolveDailyDiscountConfig = sharedDrinks?.resolveDailyDiscountConfig
    || ((input = {}) => ({
      enabled: input?.enabled !== false,
      itemKey: input?.itemKey || 'latte',
      itemName: input?.itemName || 'Latte',
      category: input?.category || 'Südlü qəhvələr',
      discountPercent: Number(input?.discountPercent) || 50,
      image: input?.image || 'assets/menu/daily-latte.jpg',
      customNote: input?.customNote || '',
      prices: Array.isArray(input?.prices) ? input.prices : [
        { size: 'S', original: 6.8, discounted: 3.4 },
        { size: 'M', original: 7.5, discounted: 3.75 },
        { size: 'L', original: 8.4, discounted: 4.2, showCurrency: true },
      ],
    }));

  const DEFAULT_CONFIG = resolveDailyDiscountConfig({
    enabled: true,
    itemKey: 'latte',
    discountPercent: 50,
    image: 'assets/menu/daily-latte.jpg',
  });

  let currentConfig = DEFAULT_CONFIG;

  function formatAzn(value) {
    return Number(value).toFixed(2);
  }

  function currentLang() {
    if (typeof window !== 'undefined' && window.BCF_I18N?.getLanguage) {
      return window.BCF_I18N.getLanguage();
    }
    return 'az';
  }

  function translateText(text) {
    if (typeof window !== 'undefined' && window.BCF_I18N?.translateDynamicText) {
      return window.BCF_I18N.translateDynamicText(text);
    }
    return text;
  }

  function buildLocalizedHomeDailyText(config) {
    const lang = currentLang();
    const drinkName = translateText(config.itemName || 'Latte');
    const categoryName = translateText(config.category || 'Südlü qəhvələr');
    const pct = config.discountPercent || 50;

    if (lang === 'en') {
      return {
        eyebrow: `ONE COFFEE EVERY DAY · ${categoryName}`,
        badge: `-${pct}% · DAILY OFFER`,
        title: `Today’s pick: ${drinkName}`,
        note: config.customNote || `Every day one handcrafted drink in our coffeeshop is ${pct}% off. Today’s discounted pick is ${drinkName}.`,
        imgAlt: `Today’s ${pct}% discounted drink: ${drinkName}`,
        standardSize: 'Cup',
        ctaLabel: 'View menu',
      };
    }
    if (lang === 'ru') {
      return {
        eyebrow: `КОФЕ ДНЯ · ${categoryName}`,
        badge: `-${pct}% · КОФЕ ДНЯ`,
        title: `Выбор дня: ${drinkName}`,
        note: config.customNote || `Каждый день в нашей кофейне действует скидка ${pct}% на один напиток. Сегодня напиток дня — ${drinkName}.`,
        imgAlt: `Напиток дня со скидкой ${pct}%: ${drinkName}`,
        standardSize: 'Стандарт',
        ctaLabel: 'Открыть меню',
      };
    }
    if (lang === 'ar') {
      return {
        eyebrow: `قهوة كل يوم · ${categoryName}`,
        badge: `-${pct}% · عرض اليوم`,
        title: `اختيار اليوم: ${drinkName}`,
        note: config.customNote || `في مقهانا، يحظى مشروب واحد يومياً بخصم ${pct}%. اختيار اليوم هو ${drinkName}.`,
        imgAlt: `مشروب اليوم بخصم ${pct}%: ${drinkName}`,
        standardSize: 'حجم قياسي',
        ctaLabel: 'عرض القائمة',
      };
    }
    return {
      eyebrow: `HƏR GÜN BİR QƏHVƏ · ${categoryName}`,
      badge: `-${pct}% · GÜNÜN TƏKLİFİ`,
      title: `Günün seçimi: ${drinkName}`,
      note: config.customNote || `Kofeşopumuzda hər gün bir içkiyə ${pct}% endirim tətbiq olunur. Bu gün günün endirimli seçimi ${drinkName}-dir.`,
      imgAlt: `Günün ${pct}% endirimli içkisi: ${drinkName}`,
      standardSize: 'Standart',
      ctaLabel: 'Menyuya bax',
    };
  }

  function syncHomeDailyDiscountDom(rawConfig = DEFAULT_CONFIG) {
    const config = resolveDailyDiscountConfig(rawConfig);
    currentConfig = config;
    const text = buildLocalizedHomeDailyText(config);

    const section = document.getElementById?.('homeDailyDiscountSection');
    if (!section) return;
    section.hidden = !config.enabled;

    const card = document.getElementById?.('homeDailyCard');
    if (card?.setAttribute) {
      card.setAttribute('data-discount-watermark', `-${config.discountPercent}%`);
    }

    const img = document.getElementById?.('homeDailyImg');
    if (img && config.image) {
      img.src = config.image;
      img.alt = text.imgAlt;
    }

    const percentEl = document.getElementById?.('homeDailyPercent');
    if (percentEl) {
      percentEl.textContent = `-${config.discountPercent}%`;
    }

    const badgeEl = document.getElementById?.('homeDailyBadge');
    if (badgeEl) {
      badgeEl.removeAttribute?.('data-i18n');
      badgeEl._bcfOrigHtml = text.badge;
      badgeEl.textContent = text.badge;
    }

    const eyebrowEl = document.getElementById?.('homeDailyEyebrow');
    if (eyebrowEl) {
      eyebrowEl.removeAttribute?.('data-i18n');
      eyebrowEl._bcfOrigHtml = text.eyebrow;
      eyebrowEl.textContent = text.eyebrow;
    }

    const titleEl = document.getElementById?.('homeDailyTitle');
    if (titleEl) {
      titleEl.removeAttribute?.('data-i18n');
      titleEl._bcfOrigHtml = text.title;
      titleEl.textContent = text.title;
    }

    const noteEl = document.getElementById?.('homeDailyNote');
    if (noteEl) {
      noteEl.removeAttribute?.('data-i18n');
      noteEl._bcfOrigHtml = text.note;
      noteEl.textContent = text.note;
    }

    const sizesEl = document.getElementById?.('homeDailySizes');
    if (sizesEl && Array.isArray(config.prices)) {
      sizesEl.innerHTML = config.prices.map((entry) => `
        <span class="home-daily-size-pill">
          <span class="home-daily-size-code">${entry.size || text.standardSize}</span>
          <del class="home-daily-size-old">${formatAzn(entry.original)}</del>
          <strong class="home-daily-size-new">${formatAzn(entry.discounted)} ₼</strong>
        </span>
      `).join('');
    }

    const ctaLabelEl = document.querySelector?.('#homeDailyMenuBtn [data-i18n]');
    if (ctaLabelEl) {
      ctaLabelEl._bcfOrigHtml = text.ctaLabel;
      ctaLabelEl.textContent = text.ctaLabel;
    }
  }

  async function fetchLiveHomeDailyDiscount() {
    if (typeof fetch !== 'function') return;
    try {
      const res = await fetch('/api/menu-discount', { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!res.ok) return;
      const data = await res.json();
      if (data && typeof data === 'object' && data.itemKey) {
        syncHomeDailyDiscountDom(data);
      }
    } catch {
      // Keep seamless static fallback if API is offline
    }
  }

  function initHomeDailyDiscount() {
    syncHomeDailyDiscountDom(currentConfig);
    fetchLiveHomeDailyDiscount();

    if (typeof window !== 'undefined') {
      window.addEventListener('bcf:language-changed', () => {
        syncHomeDailyDiscountDom(currentConfig);
      });
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initHomeDailyDiscount);
    } else {
      initHomeDailyDiscount();
    }
  }

  if (typeof window !== 'undefined') {
    window.BCF_HOME_DAILY = {
      syncHomeDailyDiscountDom,
      fetchLiveHomeDailyDiscount,
      buildLocalizedHomeDailyText,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      syncHomeDailyDiscountDom,
      buildLocalizedHomeDailyText,
      formatAzn,
    };
  }
})();
