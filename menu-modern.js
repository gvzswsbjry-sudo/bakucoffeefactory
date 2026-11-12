(() => {
  'use strict';

  const DAILY_DISCOUNT = {
    itemKey: 'latte',
    discountPercent: 50,
    titleKey: 'menuDailyTitleLatte',
    image: 'assets/menu/daily-latte.jpg',
    imageAlt: 'Günün 50% endirimli qəhvəsi: Latte',
    prices: [
      { size: 'S', original: 6.8, discounted: 3.4 },
      { size: 'M', original: 7.5, discounted: 3.75 },
      { size: 'L', original: 8.4, discounted: 4.2, showCurrency: true },
    ],
  };

  function formatAzn(value) {
    return Number(value).toFixed(2);
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

  function syncDailyDiscountDom(config = DAILY_DISCOUNT) {
    const spotlightImg = document.querySelector('.menu-daily-media img');
    if (spotlightImg && config.image) {
      spotlightImg.src = config.image;
      spotlightImg.alt = config.imageAlt || '';
    }

    const spotlightPercent = document.querySelector('.menu-daily-percent');
    if (spotlightPercent) {
      spotlightPercent.textContent = '-' + config.discountPercent + '%';
    }

    const discountedRows = document.querySelectorAll('#mainMenu .menu-row[data-menu-item]');
    discountedRows.forEach((row) => {
      const isDailyItem = row.dataset.menuItem === config.itemKey;
      row.classList.toggle('menu-row-discount', isDailyItem);
      if (!isDailyItem) return;

      const chipsHost = row.querySelector('.price-chips');
      if (chipsHost && Array.isArray(config.prices)) {
        chipsHost.innerHTML = config.prices
          .map((entry) => {
            const suffix = entry.showCurrency ? ' ₼' : '';
            return `<span class="price-chip price-chip-sale"><b>${entry.size}</b><del>${formatAzn(entry.original)}</del><strong>${formatAzn(entry.discounted)}${suffix}</strong></span>`;
          })
          .join('');
      }
    });
  }

  function initModernMenu() {
    syncDailyDiscountDom(DAILY_DISCOUNT);

    const filterButtons = document.querySelectorAll('.menu-filter-pill[data-menu-filter]');
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        applyMenuFilter(btn.dataset.menuFilter || 'all');
      });
    });

    applyMenuFilter('all');
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
      applyMenuFilter,
      syncDailyDiscountDom,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      DAILY_DISCOUNT,
      applyMenuFilter,
      syncDailyDiscountDom,
      formatAzn,
    };
  }
})();
