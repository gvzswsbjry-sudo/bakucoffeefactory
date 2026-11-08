(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) Object.assign(root, api);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const BCF_CART_KEY = 'bcf-equipment-cart-v1';

  const escapeCartHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);

  const safeCartAssetPath = (value) => {
    const path = String(value || '');
    return /^assets\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+$/.test(path) && !path.split('/').includes('..') ? path : '';
  };

  const formatCartPrice = (value) => `${Number(value || 0).toFixed(2)} ₼`;

  const normalizeTeaQuantity = (value, unit = 'g', maxQuantity = 1000) => {
    const number = Number(value);
    if (unit === 'g') {
      const rounded = Math.round((Number.isFinite(number) ? number : 5) / 5) * 5;
      return Math.min(maxQuantity, Math.max(5, rounded));
    }
    const rounded = Math.round(Number.isFinite(number) ? number : 1);
    return Math.min(20, Math.max(1, rounded));
  };

  const getCartItemTotal = (item) => {
    const price = Number(item?.price) || 0;
    const quantity = Number(item?.quantity) || 0;
    return item?.unit === 'g' ? (price * quantity) / 100 : price * quantity;
  };

  const cartTotalLabel = (cart) => {
    const entries = Object.values(cart || {}).filter((item) => Number(item?.quantity) > 0);
    const knownTotal = formatCartPrice(entries.reduce((sum, item) => sum + getCartItemTotal(item), 0));
    if (!entries.some((item) => item.price == null)) return knownTotal;
    return `${knownTotal} + qiyməti təsdiqlənəcək`;
  };

  const getProductCategory = (id, item) => {
    if (String(id).startsWith('coffee-') || item?.category === 'coffee') return 'Qəhvə';
    if (String(id).startsWith('tea-') || item?.category === 'tea') return 'Çay';
    return 'Avadanlıq';
  };

  const formatCartItemQuantity = (item) => {
    const lang = (typeof window !== 'undefined' && window.BCF_I18N?.getLanguage?.()) || 'az';
    if (lang === 'en') {
      return item?.unit === 'g' ? `${item.quantity}g` : `${item.quantity} pcs`;
    }
    if (lang === 'ar') {
      return item?.unit === 'g' ? `${item.quantity} جم` : `${item.quantity} قطعة`;
    }
    return item?.unit === 'g' ? `${item.quantity} q` : `${item.quantity} ədəd`;
  };

  const adjustCartItemQuantity = (item, direction) => {
    const quantity = Number(item?.quantity) || 0;
    const isCoffee = String(item?.id || '').startsWith('coffee-') || item?.category === 'coffee';
    if (item?.unit === 'g') {
      const max = item.maxQuantity || (isCoffee ? 2000 : 1000);
      return Math.min(max, Math.max(0, quantity + (direction > 0 ? 5 : -5)));
    }
    const max = item.maxQuantity || 99;
    return Math.min(max, Math.max(0, quantity + (direction > 0 ? 1 : -1)));
  };

  const applyCartAction = (cart, id, action) => {
    const nextCart = { ...(cart || {}) };
    const item = nextCart[id];
    if (!item) return nextCart;
    if (action === 'remove') {
      delete nextCart[id];
      return nextCart;
    }
    const quantity = adjustCartItemQuantity(item, action === 'increase' ? 1 : -1);
    if (quantity <= 0) delete nextCart[id];
    else nextCart[id] = { ...item, quantity };
    return nextCart;
  };

  const getCartBadgeCount = (cart) => Object.values(cart || {})
    .filter((item) => Number(item?.quantity) > 0)
    .reduce((sum, item) => sum + (item.unit === 'g' ? 1 : Number(item.quantity)), 0);

  const formatCartCount = (cart) => `${getCartBadgeCount(cart)} məhsul`;

  const hydrateEquipmentCart = (cart, products = []) => {
    const hydrated = cart || {};
    const variants = (products || []).flatMap((product) => product.variants || []);
    Object.entries(hydrated).forEach(([id, item]) => {
      if (!item) return;
      if (String(id).startsWith('coffee-') || item.category === 'coffee') {
        item.image = 'assets/coffee/cart-coffee-beans.png';
        if (!item.unit) item.unit = 'g';
        return;
      }
      if (String(id).startsWith('tea-') || item.category === 'tea') {
        if (!item.unit) item.unit = 'g';
        return;
      }
      const variant = variants.find((candidate) => candidate.id === id);
      if (variant) {
        item.image = variant.image;
        item.price = variant.price;
      }
      if (!item.unit) item.unit = 'piece';
    });
    return hydrated;
  };

  const loadSharedCart = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(BCF_CART_KEY)) || {};
      const prods = (typeof window !== 'undefined' && window.EQUIPMENT_PRODUCTS) || [];
      return hydrateEquipmentCart(stored, prods);
    } catch {
      return {};
    }
  };

  const getCheckoutCartItems = (cart) => Object.entries(cart || {})
    .filter(([, item]) => Number(item?.quantity) > 0)
    .map(([id, item]) => ({ ...item, id }));

  const renderUnifiedCartItemsHtml = (cart) => {
    const entries = Object.entries(cart || {}).filter(([, item]) => Number(item?.quantity) > 0);
    if (!entries.length) {
      return '<p class="cart-empty">Səbətiniz hələ boşdur.</p>';
    }
    return entries.map(([id, item]) => {
      const cat = getProductCategory(id, item);
      const isGram = item.unit === 'g';
      const maxLimit = item.maxQuantity || (String(id).startsWith('coffee-') ? 2000 : (isGram ? 1000 : 20));
      const total = item.price == null ? 'Qiymət təsdiqlənəcək' : formatCartPrice(getCartItemTotal(item));
      const qtyBadge = isGram ? `${item.quantity}q` : `${item.quantity}`;
      const safeId = escapeCartHtml(id);
      const safeName = escapeCartHtml(item.name);
      const safeCat = escapeCartHtml(cat);
      const image = safeCartAssetPath(cat === 'Qəhvə' ? 'assets/coffee/cart-coffee-beans.png' : item.image);
      const thumb = image
        ? `<img class="cart-item-thumb" src="${escapeCartHtml(image)}" alt="${safeName}" />`
        : `<span class="cart-item-thumb cart-item-thumb-empty" aria-hidden="true"></span>`;

      return `
        <article class="cart-item" data-item-id="${safeId}">
          ${thumb}
          <div class="cart-item-copy">
            <span class="cart-item-cat">${safeCat}</span>
            <h3>${safeName}</h3>
            <p>${escapeCartHtml(formatCartItemQuantity(item))} · ${escapeCartHtml(total)}</p>
            <button class="cart-remove" type="button" data-cart-action="remove" data-product-id="${safeId}" aria-label="${safeName} məhsulunu səbətdən sil">Sil</button>
          </div>
          <div class="cart-quantity" aria-label="${safeName} miqdarı">
            <button type="button" data-cart-action="decrease" data-product-id="${safeId}" aria-label="Miqdarı azalt">−</button>
            <span>${escapeCartHtml(qtyBadge)}</span>
            <button type="button" data-cart-action="increase" data-product-id="${safeId}" aria-label="Miqdarı artır" ${item.quantity >= maxLimit ? 'disabled' : ''}>+</button>
          </div>
        </article>
      `;
    }).join('');
  };

  const syncUnifiedCartDom = (cartParam) => {
    if (typeof document === 'undefined') return;
    const cart = cartParam || loadSharedCart();
    const entries = Object.entries(cart).filter(([, item]) => Number(item?.quantity) > 0);
    const countText = formatCartCount(cart);
    const totalText = cartTotalLabel(cart);
    const itemsHtml = renderUnifiedCartItemsHtml(cart);

    ['cartCount', 'headerCartCount', 'coffeeCartCount'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = countText;
    });

    ['cartTotal', 'coffeeCartTotal'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = totalText;
    });

    ['cartItems', 'coffeeCartItems'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = itemsHtml;
    });

    const badgeCount = getCartBadgeCount(cart);
    document.querySelectorAll('.floating-cart-badge, #floatingCartBadge').forEach((badge) => {
      badge.textContent = String(badgeCount);
      badge.setAttribute('data-count', String(badgeCount));
      badge.setAttribute('aria-label', countText);
    });
  };

  const saveSharedCart = (cart) => {
    try {
      localStorage.setItem(BCF_CART_KEY, JSON.stringify(cart));
      syncUnifiedCartDom(cart);
    } catch {}
  };

  const openUnifiedCart = () => {
    if (typeof document === 'undefined') return;
    const drawer = document.getElementById('coffeeCartDrawer') || document.getElementById('cartDrawer');
    const overlay = document.getElementById('coffeeCartOverlay') || document.getElementById('cartOverlay');
    const closeBtn = document.getElementById('coffeeCartClose') || document.getElementById('cartClose');
    if (!drawer) return;
    syncUnifiedCartDom();
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.hidden = false;
    document.body.classList.add('cart-open');
    document.querySelectorAll('#floatingCartTrigger, .floating-cart-btn, #coffeeCartTrigger, #teaCartTrigger, #headerCartTrigger, #cartTrigger').forEach((el) => {
      el.setAttribute('aria-expanded', 'true');
    });
    closeBtn?.focus();
  };

  const closeUnifiedCart = () => {
    if (typeof document === 'undefined') return;
    const drawer = document.getElementById('coffeeCartDrawer') || document.getElementById('cartDrawer');
    const overlay = document.getElementById('coffeeCartOverlay') || document.getElementById('cartOverlay');
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.hidden = true;
    document.body.classList.remove('cart-open');
    document.querySelectorAll('#floatingCartTrigger, .floating-cart-btn, #coffeeCartTrigger, #teaCartTrigger, #headerCartTrigger, #cartTrigger').forEach((el) => {
      el.setAttribute('aria-expanded', 'false');
    });
  };

  if (typeof window !== 'undefined') {
    if (document.querySelector('.cart-summary') && !document.getElementById('checkoutScript')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = 'checkout.css?v=20261027-2';
      document.head.append(stylesheet);
      const checkoutScript = document.createElement('script');
      checkoutScript.id = 'checkoutScript';
      checkoutScript.src = 'checkout.js?v=20261102-orderfix2';
      document.body.append(checkoutScript);
    }
    window.addEventListener('storage', (event) => {
      if (event.key === BCF_CART_KEY) syncUnifiedCartDom();
    });
    window.addEventListener('pageshow', () => {
      syncUnifiedCartDom();
    });

    document.addEventListener('click', (event) => {
      const floatingBtn = event.target.closest('#floatingCartTrigger, .floating-cart-btn');
      if (!floatingBtn) return;
      const targetTrigger = document.getElementById('coffeeCartTrigger') ||
                            document.getElementById('teaCartTrigger') ||
                            document.getElementById('headerCartTrigger') ||
                            document.getElementById('cartTrigger');
      if (targetTrigger) {
        targetTrigger.click();
      } else {
        openUnifiedCart();
      }
    });

    document.addEventListener('click', (event) => {
      if (event.target.closest('#coffeeCartClose, #cartClose, .cart-close, #coffeeCartOverlay, #cartOverlay, .cart-overlay')) {
        closeUnifiedCart();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('cart-open')) {
        closeUnifiedCart();
      }
    });

    if (typeof document !== 'undefined' && !window.__bcfZoomPreventionInit) {
      window.__bcfZoomPreventionInit = true;

      let lastTouchEnd = 0;
      let lastTouchX = 0;
      let lastTouchY = 0;

      document.addEventListener(
        'touchend',
        (event) => {
          const now = Date.now();
          const touch = event.changedTouches && event.changedTouches[0];
          const x = touch ? touch.clientX : 0;
          const y = touch ? touch.clientY : 0;
          const timeDiff = now - lastTouchEnd;
          const dist = Math.hypot(x - lastTouchX, y - lastTouchY);

          if (timeDiff <= 350 && dist < 48) {
            event.preventDefault();
            const button = event.target.closest('button, [role="button"], a, input[type="submit"], input[type="button"]');
            if (button && !button.disabled) {
              button.click();
            } else if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
              event.target.focus();
            }
          }

          lastTouchEnd = now;
          lastTouchX = x;
          lastTouchY = y;
        },
        { passive: false, capture: true }
      );

      document.addEventListener(
        'touchstart',
        (event) => {
          if (event.touches && event.touches.length > 1) {
            event.preventDefault();
          }
        },
        { passive: false, capture: true }
      );

      ['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
        document.addEventListener(
          type,
          (event) => {
            event.preventDefault();
          },
          { passive: false, capture: true }
        );
      });

      document.addEventListener(
        'dblclick',
        (event) => {
          event.preventDefault();
        },
        { passive: false, capture: true }
      );
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('bcf:language-changed', () => {
      try {
        syncUnifiedCartDom(loadSharedCart());
      } catch {}
    });
  }

  return {
    BCF_CART_KEY,
    formatCartPrice,
    cartTotalLabel,
    normalizeTeaQuantity,
    getCartItemTotal,
    getProductCategory,
    formatCartItemQuantity,
    adjustCartItemQuantity,
    applyCartAction,
    getCartBadgeCount,
    formatCartCount,
    hydrateEquipmentCart,
    loadSharedCart,
    getCheckoutCartItems,
    saveSharedCart,
    renderUnifiedCartItemsHtml,
    escapeCartHtml,
    safeCartAssetPath,
    syncUnifiedCartDom,
    openUnifiedCart,
    closeUnifiedCart,
  };
});
