// Baku Coffee Factory — Custom Blend Studio (Öz Qəhvə Blendini Yarat)
(function () {
  'use strict';

  const COFFEE_COMPONENTS = {
    colombia: {
      id: 'colombia',
      name: 'Colombia',
      price: 15,
    },
    brasil: {
      id: 'brasil',
      name: 'Brasil',
      price: 10,
    },
    guatemala: {
      id: 'guatemala',
      name: 'Guatemala',
      price: 12,
    },
    honduras: {
      id: 'honduras',
      name: 'Honduras',
      price: 11,
    },
    efiopiya: {
      id: 'efiopiya',
      name: 'Efiopiya',
      price: 13,
    },
    keniya: {
      id: 'keniya',
      name: 'Keniya',
      price: 8,
    },
    'costa-rica': {
      id: 'costa-rica',
      name: 'Costa Rica',
      price: 13,
    },
    robusta: {
      id: 'robusta',
      name: 'Robusta',
      price: 8,
    },
    decaf: {
      id: 'decaf',
      name: 'Decaf (Kofeinsiz)',
      price: 12,
    },
    uqanda: {
      id: 'uqanda',
      name: 'Uqanda',
      price: 11,
    },
  };

  function initBlendStudio() {
    const root = document.getElementById('oz-blendini-yarat');
    if (!root) return;

    // Interactive Pickers & Slider on Main Card
    const baseSelect = root.querySelector('#blendBaseSelect');
    const accentSelect = root.querySelector('#blendAccentSelect');
    const slider = root.querySelector('#blendRatioSlider');

    const baseRatioPct = root.querySelector('#blendRatioBasePct');
    const accentRatioPct = root.querySelector('#blendRatioAccentPct');
    const baseNameDisplay = root.querySelector('#blendBaseNameDisplay');
    const accentNameDisplay = root.querySelector('#blendAccentNameDisplay');
    const basePriceDisplay = root.querySelector('#blendBasePriceDisplay');
    const accentPriceDisplay = root.querySelector('#blendAccentPriceDisplay');
    const baseRatioText = root.querySelector('#blendRatioBaseText');
    const accentRatioText = root.querySelector('#blendRatioAccentText');

    const cardFormula = root.querySelector('#blendCardFormula');
    const cardRate = root.querySelector('#blendCardRate');
    const openModalBtn = root.querySelector('#blendOpenModalBtn');

    // Modal elements
    const modal = document.getElementById('blendOrderModal');
    const modalOverlay = document.getElementById('blendModalOverlay');
    const modalCloseBtn = document.getElementById('blendModalClose');

    const modalBlendName = document.getElementById('craftBagBlendName');
    const modalFormulaText = document.getElementById('craftBagFormulaText');
    const modalRateText = document.getElementById('blendModalRateText');
    const modalGrindCurrent = document.getElementById('craftBagGrindText');
    const modalWeightCurrent = document.getElementById('craftBagWeightText');

    const grindButtons = document.querySelectorAll('#blendOrderModal .blend-option-btn[data-grind]');
    const weightInput = document.getElementById('blendWeightInput');
    const weightMinus = document.getElementById('blendWeightMinus');
    const weightPlus = document.getElementById('blendWeightPlus');
    const presetButtons = document.querySelectorAll('#blendOrderModal .blend-weight-preset-btn');

    const priceDisplay = document.getElementById('blendPriceTotal');
    const addToCartBtn = document.getElementById('blendAddToCartBtn');

    let selectedGrind = 'Dənə (Bütöv)';
    let selectedWeight = 250; // grams

    function syncPresetActive(grams) {
      presetButtons.forEach((btn) => {
        btn.classList.toggle('active', Number(btn.dataset.preset) === grams);
      });
    }

    function calculateState() {
      const baseKey = (baseSelect?.value || 'efiopiya').toLowerCase();
      const accentKey = (accentSelect?.value || 'robusta').toLowerCase();

      const baseCoffee = COFFEE_COMPONENTS[baseKey] || COFFEE_COMPONENTS.efiopiya;
      const accentCoffee = COFFEE_COMPONENTS[accentKey] || COFFEE_COMPONENTS.robusta;

      const rawSlider = parseInt(slider?.value, 10);
      const baseRatio = Number.isNaN(rawSlider) ? 70 : Math.min(90, Math.max(10, rawSlider));
      const accentRatio = 100 - baseRatio;

      // Weighted price per 100g
      const avgPricePer100g = (baseCoffee.price * baseRatio + accentCoffee.price * accentRatio) / 100;
      const finalPrice = Math.round((avgPricePer100g * (selectedWeight / 100)) * 100) / 100;

      // Update Card Header Pickers
      if (baseRatioPct) baseRatioPct.textContent = `${baseRatio}%`;
      if (accentRatioPct) accentRatioPct.textContent = `${accentRatio}%`;
      if (baseNameDisplay) baseNameDisplay.textContent = baseCoffee.name;
      if (accentNameDisplay) accentNameDisplay.textContent = accentCoffee.name;
      if (basePriceDisplay) basePriceDisplay.textContent = `${baseCoffee.price} ₼ / 100q`;
      if (accentPriceDisplay) accentPriceDisplay.textContent = `${accentCoffee.price} ₼ / 100q`;

      if (baseRatioText) baseRatioText.textContent = `${baseRatio}% ${baseCoffee.name}`;
      if (accentRatioText) accentRatioText.textContent = `${accentRatio}% ${accentCoffee.name}`;

      const formulaString = `${baseRatio}% ${baseCoffee.name} · ${accentRatio}% ${accentCoffee.name}`;
      if (cardFormula) cardFormula.textContent = formulaString;
      if (cardRate) cardRate.textContent = `${avgPricePer100g.toFixed(2)} ₼ / 100 q`;

      // Update Modal
      if (modalBlendName) modalBlendName.textContent = 'Xüsusi Qəhvə Blendi';
      if (modalFormulaText) modalFormulaText.textContent = formulaString;
      if (modalRateText) modalRateText.textContent = `${avgPricePer100g.toFixed(2)} ₼ / 100 q`;
      if (modalGrindCurrent) modalGrindCurrent.textContent = selectedGrind;
      if (modalWeightCurrent) modalWeightCurrent.textContent = `${selectedWeight} q`;
      if (priceDisplay) priceDisplay.textContent = `${finalPrice.toFixed(2)} ₼`;

      syncPresetActive(selectedWeight);

      return {
        baseCoffee,
        accentCoffee,
        baseRatio,
        accentRatio,
        selectedGrind,
        selectedWeight,
        avgPricePer100g,
        finalPrice,
        formulaString,
      };
    }

    // Modal open / close
    function openModal() {
      if (!modal || !modalOverlay) return;
      calculateState();
      modal.hidden = false;
      modalOverlay.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('tea-modal-open');
    }

    function closeModal() {
      if (!modal || !modalOverlay) return;
      modal.hidden = true;
      modalOverlay.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('tea-modal-open');
    }

    openModalBtn?.addEventListener('click', openModal);
    modalCloseBtn?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.hidden) {
        closeModal();
      }
    });

    // Event listeners for inputs
    baseSelect?.addEventListener('change', calculateState);
    accentSelect?.addEventListener('change', calculateState);
    slider?.addEventListener('input', calculateState);

    // Grind buttons in modal
    grindButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        grindButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedGrind = btn.dataset.grind || 'Dənə (Bütöv)';
        calculateState();
      });
    });

    // Custom weight typing and buttons
    function setWeight(raw) {
      const num = parseInt(String(raw || '').replace(/\D/g, ''), 10);
      if (Number.isNaN(num) || num < 1) {
        selectedWeight = 250;
      } else {
        selectedWeight = Math.min(2000, Math.max(50, num));
      }
      if (weightInput) weightInput.value = String(selectedWeight);
      calculateState();
    }

    weightInput?.addEventListener('input', () => {
      const num = parseInt(weightInput.value.replace(/\D/g, ''), 10);
      if (!Number.isNaN(num) && num > 0) {
        selectedWeight = Math.min(2000, num);
        calculateState();
      }
    });

    weightInput?.addEventListener('change', () => {
      setWeight(weightInput.value);
    });

    weightMinus?.addEventListener('click', () => {
      setWeight(Math.max(50, selectedWeight - 50));
    });

    weightPlus?.addEventListener('click', () => {
      setWeight(Math.min(2000, selectedWeight + 50));
    });

    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = Number(btn.dataset.preset || 250);
        setWeight(val);
      });
    });

    // Initial state calculation
    calculateState();

    // Add to Cart handler inside Modal
    addToCartBtn?.addEventListener('click', () => {
      const state = calculateState();
      const cartKey = 'bcf-equipment-cart-v1';
      let cart = {};
      try {
        cart = JSON.parse(localStorage.getItem(cartKey)) || {};
      } catch {
        cart = {};
      }

      const grindSlug = (state.selectedGrind || 'dene')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'dene';
      const itemId = `coffee-custom-blend-${state.baseCoffee.id}-${state.baseRatio}pct-${state.accentCoffee.id}-${state.accentRatio}pct-${grindSlug}`;
      const formula = `${state.baseRatio}% ${state.baseCoffee.name} + ${state.accentRatio}% ${state.accentCoffee.name}`;

      const existingItem = cart[itemId];
      const existingQty = Number(existingItem?.quantity) || 0;
      const nextQuantity = Math.min(2000, existingQty + state.selectedWeight);

      const cartItem = {
        id: itemId,
        name: `Fərdi Blend (${formula}) · ${state.selectedGrind}`,
        price: Math.round(state.avgPricePer100g * 100) / 100,
        unit: 'g',
        quantity: nextQuantity,
        category: 'coffee',
        image: 'assets/coffee/cart-coffee-beans.png',
        maxQuantity: 2000,
        meta: {
          formula,
          grind: state.selectedGrind,
          weight: `${nextQuantity} q`,
        },
      };

      cart[itemId] = cartItem;
      localStorage.setItem(cartKey, JSON.stringify(cart));

      // Close modal
      closeModal();

      // Sync and open cart drawer
      if (typeof window.syncUnifiedCartDom === 'function') {
        window.syncUnifiedCartDom(cart);
      }

      const drawer = document.getElementById('coffeeCartDrawer');
      const overlay = document.getElementById('coffeeCartOverlay');
      if (drawer && overlay) {
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        overlay.hidden = false;
        document.body.classList.add('cart-open');
      }

      // Toast feedback
      const toast = document.getElementById('coffeeCartToast');
      if (toast) {
        toast.textContent = existingQty > 0
          ? `Fərdi blend səbətdə yeniləndi (${nextQuantity} q)!`
          : `Fərdi blend (${state.selectedWeight} q) səbətə əlavə edildi!`;
        toast.hidden = false;
        setTimeout(() => { toast.hidden = true; }, 3000);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlendStudio);
  } else {
    initBlendStudio();
  }
})();
