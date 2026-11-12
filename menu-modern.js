(() => {
  'use strict';

  const sharedDrinks = typeof window !== 'undefined' && window.BCF_MENU_DRINKS
    ? window.BCF_MENU_DRINKS
    : (typeof require === 'function' ? require('./menu-drinks.js') : null);

  const MENU_DRINKS = sharedDrinks?.MENU_DRINKS || [];
  const resolveDailyDiscountConfig = sharedDrinks?.resolveDailyDiscountConfig
    || ((input = {}) => ({
      enabled: input?.enabled !== false,
      itemKey: input?.itemKey || 'latte',
      itemName: input?.itemName || 'Latte',
      discountPercent: Number(input?.discountPercent) || 50,
      image: input?.image || 'assets/menu/daily-latte.jpg',
      customNote: input?.customNote || '',
      prices: Array.isArray(input?.prices) ? input.prices : [
        { size: 'S', original: 6.8, discounted: 3.4 },
        { size: 'M', original: 7.5, discounted: 3.75 },
        { size: 'L', original: 8.4, discounted: 4.2, showCurrency: true },
      ],
    }));

  const DAILY_DISCOUNT = resolveDailyDiscountConfig({
    enabled: true,
    itemKey: 'latte',
    discountPercent: 50,
    image: 'assets/menu/daily-latte.jpg',
  });
  DAILY_DISCOUNT.titleKey = 'menuDailyTitleLatte';
  DAILY_DISCOUNT.imageAlt = 'Günün 50% endirimli qəhvəsi: Latte';

  let currentDiscountConfig = DAILY_DISCOUNT;

  function formatAzn(value) {
    return Number(value).toFixed(2);
  }

  function currentLang() {
    if (typeof window !== 'undefined' && window.BCF_I18N?.getLanguage) {
      return window.BCF_I18N.getLanguage();
    }
    return 'az';
  }

  function translateDrinkName(name) {
    if (typeof window !== 'undefined' && window.BCF_I18N?.translateDynamicText) {
      return window.BCF_I18N.translateDynamicText(name);
    }
    return name;
  }

  function buildLocalizedDailyText(config) {
    const lang = currentLang();
    const drinkName = translateDrinkName(config.itemName || 'Latte');
    const pct = config.discountPercent || 50;

    if (lang === 'en') {
      return {
        badge: `-${pct}% · DAILY OFFER`,
        title: `Today’s pick: ${drinkName}`,
        todayTag: `-${pct}% TODAY`,
        note: config.customNote || `Every day one handcrafted drink in our coffeeshop is ${pct}% off. Today’s discounted pick is ${drinkName}.`,
        imgAlt: `Today’s ${pct}% discounted drink: ${drinkName}`,
        standardSize: 'Cup',
      };
    }
    if (lang === 'ru') {
      return {
        badge: `-${pct}% · КОФЕ ДНЯ`,
        title: `Выбор дня: ${drinkName}`,
        todayTag: `-${pct}% СЕГОДНЯ`,
        note: config.customNote || `Каждый день в нашей кофейне действует скидка ${pct}% на один напиток. Сегодня напиток дня — ${drinkName}.`,
        imgAlt: `Напиток дня со скидкой ${pct}%: ${drinkName}`,
        standardSize: 'Стандарт',
      };
    }
    if (lang === 'ar') {
      return {
        badge: `-${pct}% · عرض اليوم`,
        title: `اختيار اليوم: ${drinkName}`,
        todayTag: `-${pct}% اليوم`,
        note: config.customNote || `في مقهانا، يحظى مشروب واحد يومياً بخصم ${pct}%. اختيار اليوم هو ${drinkName}.`,
        imgAlt: `مشروب اليوم بخصم ${pct}%: ${drinkName}`,
        standardSize: 'حجم قياسي',
      };
    }
    return {
      badge: `-${pct}% · GÜNÜN TƏKLİFİ`,
      title: `Günün seçimi: ${drinkName}`,
      todayTag: `-${pct}% BUGÜN`,
      note: config.customNote || `Kofeşopumuzda hər gün bir içkiyə ${pct}% endirim tətbiq olunur. Bu gün günün endirimli seçimi ${drinkName}-dir.`,
      imgAlt: `Günün ${pct}% endirimli içkisi: ${drinkName}`,
      standardSize: 'Standart',
    };
  }

  function buildRegularPriceChipsHtml(drink) {
    const entries = Array.isArray(drink?.prices) ? drink.prices : [];
    if (!entries.length) return '';
    return entries.map((entry, idx) => {
      const currency = idx === entries.length - 1 ? ' ₼' : '';
      if (!entry.size) {
        return `<span class="price-chip price-chip-single">${formatAzn(entry.price)}${currency}</span>`;
      }
      return `<span class="price-chip"><b>${entry.size}</b> ${formatAzn(entry.price)}${currency}</span>`;
    }).join('');
  }

  function buildDiscountPriceChipsHtml(prices) {
    return (Array.isArray(prices) ? prices : []).map((entry) => {
      const suffix = entry.showCurrency ? ' ₼' : '';
      const sizeHtml = entry.size ? `<b>${entry.size}</b>` : '';
      return `<span class="price-chip price-chip-sale">${sizeHtml}<del>${formatAzn(entry.original)}</del><strong>${formatAzn(entry.discounted)}${suffix}</strong></span>`;
    }).join('');
  }

  function applyMenuFilter(filterName) {
    const target = filterName || 'all';
    const filterButtons = document.querySelectorAll('.menu-filter-pill[data-menu-filter]');
    const signaturesSection = document.querySelector('.menu-signatures');
    const cardsGrid = document.querySelector('#mainMenu .menu-cards-grid');
    const categoryCards = document.querySelectorAll('#mainMenu .menu-card[data-menu-category]');

    filterButtons.forEach((btn) => {
      const isMatch = btn.dataset.menuFilter === target;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-pressed', String(isMatch));
    });

    if (signaturesSection) {
      const showSignatures = target === 'all' || target === 'alt';
      signaturesSection.classList.toggle('is-hidden', !showSignatures);
    }

    let visibleCount = 0;
    categoryCards.forEach((card) => {
      const categories = (card.dataset.menuCategory || '').split(/\s+/).filter(Boolean);
      const isVisible = target === 'all' || categories.includes(target);
      card.classList.toggle('is-hidden', !isVisible);
      if (isVisible) visibleCount += 1;
    });

    if (cardsGrid) {
      cardsGrid.classList.toggle('is-filtered', target !== 'all' && visibleCount <= 1);
    }
  }

  function syncDailyDiscountDom(rawConfig = DAILY_DISCOUNT) {
    const config = resolveDailyDiscountConfig(rawConfig);
    currentDiscountConfig = config;
    const text = buildLocalizedDailyText(config);

    const offerCard = document.getElementById?.('dailyOfferCard') || document.querySelector('.menu-daily-spotlight');
    if (offerCard) {
      offerCard.hidden = !config.enabled;
    }

    const spotlightImg = document.querySelector('.menu-daily-media img');
    if (spotlightImg && config.image) {
      spotlightImg.src = config.image;
      spotlightImg.alt = rawConfig?.imageAlt || text.imgAlt;
    }

    const spotlightPercent = document.querySelector('.menu-daily-percent');
    if (spotlightPercent) {
      spotlightPercent.textContent = '-' + config.discountPercent + '%';
    }

    const spotlightBadge = document.querySelector('.menu-daily-badge');
    if (spotlightBadge) {
      spotlightBadge.removeAttribute?.('data-i18n');
      spotlightBadge._bcfOrigHtml = text.badge;
      spotlightBadge.textContent = text.badge;
    }

    const offerTitle = document.getElementById?.('dailyOfferTitle') || document.querySelector('#dailyOfferCard h2');
    if (offerTitle) {
      offerTitle.removeAttribute?.('data-i18n');
      offerTitle._bcfOrigHtml = text.title;
      offerTitle.textContent = text.title;
    }

    const offerNote = document.querySelector('#dailyOfferCard .menu-daily-note');
    if (offerNote) {
      offerNote.removeAttribute?.('data-i18n');
      offerNote._bcfOrigHtml = text.note;
      offerNote.textContent = text.note;
    }

    const dailySizeGrid = document.querySelector('#dailyOfferCard .daily-size-grid');
    if (dailySizeGrid && Array.isArray(config.prices)) {
      dailySizeGrid.innerHTML = config.prices.map((entry) => `
        <span class="daily-size-pill">
          <span class="daily-size-code">${entry.size || text.standardSize}</span>
          <del class="daily-size-old">${formatAzn(entry.original)}</del>
          <strong class="daily-size-new">${formatAzn(entry.discounted)} ₼</strong>
        </span>
      `).join('');
    }

    const menuRows = document.querySelectorAll('#mainMenu .menu-row[data-menu-item]');
    menuRows.forEach((row) => {
      const itemKey = row.dataset.menuItem;
      const isDailyItem = Boolean(config.enabled) && itemKey === config.itemKey;
      row.classList.toggle('menu-row-discount', isDailyItem);

      const chipsHost = row.querySelector('.price-chips');
      const existingBadge = row.querySelector('.menu-row-badge');

      if (!isDailyItem) {
        if (existingBadge && typeof existingBadge.remove === 'function') {
          existingBadge.remove();
        }
        const drinkDef = MENU_DRINKS.find((d) => d.key === itemKey);
        if (chipsHost && drinkDef) {
          chipsHost.innerHTML = buildRegularPriceChipsHtml(drinkDef);
        }
        return;
      }

      if (existingBadge) {
        existingBadge.removeAttribute?.('data-i18n');
        existingBadge._bcfOrigHtml = text.todayTag;
        existingBadge.textContent = text.todayTag;
      } else if (chipsHost && typeof row.insertBefore === 'function' && typeof document.createElement === 'function') {
        const badge = document.createElement('span');
        badge.className = 'menu-row-badge';
        badge.textContent = text.todayTag;
        row.insertBefore(badge, chipsHost);
      }

      if (chipsHost && Array.isArray(config.prices)) {
        chipsHost.innerHTML = buildDiscountPriceChipsHtml(config.prices);
      }
    });
  }

  async function fetchLiveDailyDiscount() {
    if (typeof fetch !== 'function') return;
    try {
      const res = await fetch('/api/menu-discount', { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!res.ok) return;
      const data = await res.json();
      if (data && typeof data === 'object' && data.itemKey) {
        syncDailyDiscountDom(data);
      }
    } catch {
      // Fall back cleanly to default static config offline
    }
  }

  function initModernMenu() {
    syncDailyDiscountDom(currentDiscountConfig);
    fetchLiveDailyDiscount();

    const filterButtons = document.querySelectorAll('.menu-filter-pill[data-menu-filter]');
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        applyMenuFilter(btn.dataset.menuFilter || 'all');
      });
    });

    applyMenuFilter('all');

    if (typeof window !== 'undefined') {
      window.addEventListener('bcf:language-changed', () => {
        syncDailyDiscountDom(currentDiscountConfig);
      });
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initModernMenu);
    } else {
      initModernMenu();
    }
  }

  if (typeof window !== 'undefined') {
    window.BCF_MENU = {
      DAILY_DISCOUNT,
      MENU_DRINKS,
      applyMenuFilter,
      syncDailyDiscountDom,
      fetchLiveDailyDiscount,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      DAILY_DISCOUNT,
      MENU_DRINKS,
      applyMenuFilter,
      syncDailyDiscountDom,
      formatAzn,
      buildLocalizedDailyText,
    };
  }
})();
