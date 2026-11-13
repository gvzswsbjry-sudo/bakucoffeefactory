// Baku Coffee Factory — Custom Blend Studio (Öz Qəhvə Blendini Yarat)
(function () {
  'use strict';

  const COFFEE_COMPONENTS = {
    colombia: {
      id: 'colombia',
      name: 'Colombia',
      price: 15,
      taste: 'Karamel, süd şokoladı, qırmızı alma',
      sweetness: 4.0,
      acidity: 3.0,
      body: 3.5,
      aroma: 4.0,
    },
    brasil: {
      id: 'brasil',
      name: 'Brasil',
      price: 10,
      taste: 'Qovrulmuş fındıq, kakao, tünd şokolad',
      sweetness: 3.8,
      acidity: 2.0,
      body: 4.5,
      aroma: 3.5,
    },
    guatemala: {
      id: 'guatemala',
      name: 'Guatemala',
      price: 12,
      taste: 'Tünd şokolad, badam, qəhvəyi şəkər',
      sweetness: 4.0,
      acidity: 3.5,
      body: 4.0,
      aroma: 4.0,
    },
    honduras: {
      id: 'honduras',
      name: 'Honduras',
      price: 11,
      taste: 'Qırmızı giləmeyvə, kakao, yumşaq sitrus',
      sweetness: 4.0,
      acidity: 3.0,
      body: 3.5,
      aroma: 4.0,
    },
    efiopiya: {
      id: 'efiopiya',
      name: 'Efiopiya',
      price: 13,
      taste: 'Yasəmən, berqamot, limon qabığı',
      sweetness: 4.0,
      acidity: 4.5,
      body: 2.5,
      aroma: 5.0,
    },
    keniya: {
      id: 'keniya',
      name: 'Keniya',
      price: 8,
      taste: 'Qara qarağat, qırmızı giləmeyvə, qamış şəkəri',
      sweetness: 4.0,
      acidity: 4.5,
      body: 3.0,
      aroma: 4.5,
    },
    'costa-rica': {
      id: 'costa-rica',
      name: 'Costa Rica',
      price: 13,
      taste: 'Qırmızı alma, bal şirinliyi, sitrus',
      sweetness: 4.5,
      acidity: 3.5,
      body: 3.5,
      aroma: 4.0,
    },
    robusta: {
      id: 'robusta',
      name: 'Robusta',
      price: 8,
      taste: 'Tünd kakao, odunsu tonlar, dolğun crema',
      sweetness: 2.5,
      acidity: 1.5,
      body: 5.0,
      aroma: 3.0,
    },
    decaf: {
      id: 'decaf',
      name: 'Decaf (Kofeinsiz)',
      price: 12,
      taste: 'Karamel, kakao, badam',
      sweetness: 4.0,
      acidity: 2.0,
      body: 3.5,
      aroma: 3.5,
    },
  };

  function initBlendStudio() {
    const root = document.getElementById('oz-blendini-yarat');
    if (!root) return;

    const baseSelect = root.querySelector('#blendBaseSelect');
    const accentSelect = root.querySelector('#blendAccentSelect');
    const slider = root.querySelector('#blendRatioSlider');
    const baseRatioPill = root.querySelector('#blendRatioBaseText');
    const accentRatioPill = root.querySelector('#blendRatioAccentText');

    const sweetnessFill = root.querySelector('#tasteSweetnessFill');
    const sweetnessVal = root.querySelector('#tasteSweetnessVal');
    const acidityFill = root.querySelector('#tasteAcidityFill');
    const acidityVal = root.querySelector('#tasteAcidityVal');
    const bodyFill = root.querySelector('#tasteBodyFill');
    const bodyVal = root.querySelector('#tasteBodyVal');
    const aromaFill = root.querySelector('#tasteAromaFill');
    const aromaVal = root.querySelector('#tasteAromaVal');

    const grindButtons = root.querySelectorAll('.blend-option-btn[data-grind]');

    // Weight controls
    const weightInput = root.querySelector('#blendWeightInput');
    const weightMinus = root.querySelector('#blendWeightMinus');
    const weightPlus = root.querySelector('#blendWeightPlus');
    const presetButtons = root.querySelectorAll('.blend-weight-preset-btn');

    // Craft bag mockup elements
    const bagFormula = root.querySelector('#craftBagFormulaText');
    const bagGrind = root.querySelector('#craftBagGrindText');
    const bagWeight = root.querySelector('#craftBagWeightText');
    const bagDate = root.querySelector('#craftBagDateText');

    const priceDisplay = root.querySelector('#blendPriceTotal');
    const addBtn = root.querySelector('#blendAddToCartBtn');

    let selectedGrind = 'Dənə (Bütöv)';
    let selectedWeight = 250; // grams

    function getTodayString() {
      const d = new Date();
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }

    function syncPresetActive(grams) {
      presetButtons.forEach((btn) => {
        btn.classList.toggle('active', Number(btn.dataset.preset) === grams);
      });
    }

    function calculateState() {
      const baseKey = baseSelect?.value || 'efiopiya';
      const accentKey = accentSelect?.value || 'robusta';
      const baseCoffee = COFFEE_COMPONENTS[baseKey] || COFFEE_COMPONENTS.efiopiya;
      const accentCoffee = COFFEE_COMPONENTS[accentKey] || COFFEE_COMPONENTS.robusta;

      const baseRatio = Number(slider?.value || 70);
      const accentRatio = 100 - baseRatio;

      // Update slider CSS variable for track fill
      if (slider) {
        slider.style.setProperty('--slider-ratio', `${baseRatio}%`);
      }

      // Update ratio pills
      if (baseRatioPill) baseRatioPill.textContent = `${baseRatio}% ${baseCoffee.name}`;
      if (accentRatioPill) accentRatioPill.textContent = `${accentRatio}% ${accentCoffee.name}`;

      // Calculate dynamic taste profile
      const sweetness = ((baseCoffee.sweetness * baseRatio) + (accentCoffee.sweetness * accentRatio)) / 100;
      const acidity = ((baseCoffee.acidity * baseRatio) + (accentCoffee.acidity * accentRatio)) / 100;
      const body = ((baseCoffee.body * baseRatio) + (accentCoffee.body * accentRatio)) / 100;
      const aroma = ((baseCoffee.aroma * baseRatio) + (accentCoffee.aroma * accentRatio)) / 100;

      if (sweetnessFill && sweetnessVal) {
        sweetnessFill.style.width = `${(sweetness / 5) * 100}%`;
        sweetnessVal.textContent = `${sweetness.toFixed(1)} / 5`;
      }
      if (acidityFill && acidityVal) {
        acidityFill.style.width = `${(acidity / 5) * 100}%`;
        acidityVal.textContent = `${acidity.toFixed(1)} / 5`;
      }
      if (bodyFill && bodyVal) {
        bodyFill.style.width = `${(body / 5) * 100}%`;
        bodyVal.textContent = `${body.toFixed(1)} / 5`;
      }
      if (aromaFill && aromaVal) {
        aromaFill.style.width = `${(aroma / 5) * 100}%`;
        aromaVal.textContent = `${aroma.toFixed(1)} / 5`;
      }

      // Calculate pricing: STRICTLY NO DISCOUNTS (endirim olmasin)
      const avgPricePer100g = ((baseCoffee.price * baseRatio) + (accentCoffee.price * accentRatio)) / 100;
      const total = (avgPricePer100g * selectedWeight) / 100;
      const finalPrice = Math.round(total * 100) / 100;

      if (priceDisplay) {
        priceDisplay.textContent = `${finalPrice.toFixed(2)} ₼`;
      }

      // Live Bag Mockup sync
      if (bagFormula) {
        bagFormula.textContent = `${baseRatio}% ${baseCoffee.name} · ${accentRatio}% ${accentCoffee.name}`;
      }

      if (bagGrind) bagGrind.textContent = selectedGrind;
      if (bagWeight) bagWeight.textContent = `${selectedWeight} q`;
      if (bagDate) bagDate.textContent = `Təzə qovrum · ${getTodayString()}`;

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
      };
    }

    // Event listeners for inputs
    baseSelect?.addEventListener('change', calculateState);
    accentSelect?.addEventListener('change', calculateState);
    slider?.addEventListener('input', calculateState);

    // Grind buttons
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
        selectedWeight = Math.min(2000, Math.max(5, num));
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

    // Add to Cart handler
    addBtn?.addEventListener('click', () => {
      const state = calculateState();
      const cartKey = 'bcf-equipment-cart-v1';
      let cart = {};
      try {
        cart = JSON.parse(localStorage.getItem(cartKey)) || {};
      } catch {
        cart = {};
      }

      const itemId = 'coffee-custom-blend';
      const formula = `${state.baseRatio}% ${state.baseCoffee.name} + ${state.accentRatio}% ${state.accentCoffee.name}`;

      const cartItem = {
        id: itemId,
        name: `Fərdi Blend (${formula}) · ${state.selectedGrind}`,
        price: Math.round(state.avgPricePer100g * 100) / 100,
        unit: 'g',
        quantity: state.selectedWeight,
        category: 'coffee',
        image: 'assets/coffee/cart-coffee-beans.png',
        maxQuantity: 2000,
        meta: {
          formula,
          grind: state.selectedGrind,
          weight: `${state.selectedWeight} q`,
        },
      };

      cart[itemId] = cartItem;
      localStorage.setItem(cartKey, JSON.stringify(cart));

      // Sync and open cart
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
        toast.textContent = `Fərdi blend (${state.selectedWeight} q) səbətə əlavə edildi!`;
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
