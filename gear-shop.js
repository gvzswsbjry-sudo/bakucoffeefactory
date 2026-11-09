const equipmentCartKey = typeof BCF_CART_KEY === 'string' ? BCF_CART_KEY : 'bcf-equipment-cart-v1';
const tr = (key, fallback) => window.BCF_I18N?.t?.(key, fallback) ?? fallback;
const dyn = (text) => window.BCF_I18N?.translateDynamicText?.(text) ?? text;

const shopProducts = document.getElementById('shopProducts');
const shopFilters = document.getElementById('shopFilters');
const shopSort = document.getElementById('shopSort');
const cartTrigger = document.getElementById('cartTrigger');
const headerCartTrigger = document.getElementById('headerCartTrigger');
const floatingCartTrigger = document.getElementById('floatingCartTrigger');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const headerCartCount = document.getElementById('headerCartCount');
const cartTotal = document.getElementById('cartTotal');

const escapeShopHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
})[character]);
const safeShopImage = (value) => {
  const image = String(value || '');
  return /^assets\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+$/.test(image) && !image.split('/').includes('..') ? image : '';
};

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(equipmentCartKey)) || {};
  } catch {
    return {};
  }
};

let equipmentCart = loadCart();

const findEquipmentVariant = (id) => window.EQUIPMENT_PRODUCTS
  ?.flatMap((product) => product.variants)
  .find((variant) => variant.id === id);

if (typeof hydrateEquipmentCart === 'function') {
  equipmentCart = hydrateEquipmentCart(equipmentCart, window.EQUIPMENT_PRODUCTS || []);
  saveSharedCart(equipmentCart);
} else {
  Object.entries(equipmentCart).forEach(([id, item]) => {
    const variant = findEquipmentVariant(id);
    if (!item.image && variant) item.image = variant.image;
    if (!item.unit) item.unit = 'piece';
  });
}

const saveCart = () => {
  if (typeof saveSharedCart === 'function') {
    saveSharedCart(equipmentCart);
  } else {
    localStorage.setItem(equipmentCartKey, JSON.stringify(equipmentCart));
  }
};
const formatPrice = (value) => `${Number(value).toFixed(2)} ₼`;

const addVariantToCart = (product, variant) => {
  const id = variant.id;
  const name = getEquipmentVariantName(product, variant);
  equipmentCart = typeof loadSharedCart === 'function' ? loadSharedCart() : loadCart();
  equipmentCart[id] = equipmentCart[id] || { id, name, price: variant.price, quantity: 0, unit: 'piece', maxQuantity: 99, category: 'equipment', image: variant.image };
  equipmentCart[id].name = name;
  equipmentCart[id].price = variant.price;
  equipmentCart[id].unit = 'piece';
  equipmentCart[id].maxQuantity = 99;
  equipmentCart[id].category = 'equipment';
  equipmentCart[id].image = variant.image;
  equipmentCart[id].quantity += 1;
  saveCart();
  renderCart();
};

const renderProducts = () => {
  if (!shopProducts || !window.EQUIPMENT_PRODUCTS) return;

  shopProducts.innerHTML = EQUIPMENT_PRODUCTS.map((product) => {
    const variant = product.variants[0];
    const soldOut = product.stock?.status === 'out' || (product.stock?.status === 'counted' && product.stock.quantity <= 0);
    const fitClass = product.imageFit === 'contain' ? 'product-image-contain' : '';
    const variants = product.variants.length > 1
      ? `<div class="product-variant-preview" aria-label="${escapeShopHtml(dyn(`${product.variants.length} seçim`))}">${product.variants.map((item) => `<span style="--swatch:${escapeShopHtml(item.color)}" title="${escapeShopHtml(dyn(item.label))}"></span>`).join('')}</div>`
      : '';

    const productId = escapeShopHtml(product.id);
    const productName = escapeShopHtml(dyn(product.name));
    const categoryLabel = escapeShopHtml(dyn(product.categoryLabel));
    const productDesc = escapeShopHtml(dyn(product.description));
    const variantAlt = escapeShopHtml(dyn(variant.alt));
    const variantImage = escapeShopHtml(safeShopImage(variant.image));
    const buttonKey = soldOut ? 'soldOut' : 'addToCart';
    const buttonLabel = soldOut ? tr('soldOut', 'Bitib') : tr('addToCart', 'Səbətə əlavə et');

    return `
      <article class="shop-product" data-category="${escapeShopHtml(product.category)}" data-product-id="${productId}" data-product-url="${escapeShopHtml(buildEquipmentDetailUrl(product.id))}" tabindex="0" role="link" aria-label="${productName}">
        <figure class="${fitClass}"><img src="${variantImage}" alt="${variantAlt}" loading="${product.id === 'french-press' || product.id === 'wood-grinder' ? 'eager' : 'lazy'}" /></figure>
        <div class="product-copy">
          <p class="product-category">${categoryLabel}</p>
          <h3>${productName}</h3>
          <p class="product-description">${productDesc}</p>
          ${variants}
          <div class="product-buy">
            <span class="product-price">${escapeShopHtml(formatPrice(variant.price))}</span>
            <button class="add-to-cart" type="button" data-product-id="${productId}" data-i18n="${buttonKey}" ${soldOut ? 'disabled' : ''}>${escapeShopHtml(buttonLabel)}</button>
          </div>
        </div>
      </article>`;
  }).join('');
  window.BCF_I18N?.translateDom?.(shopProducts);
};

const renderCart = () => {
  equipmentCart = typeof loadSharedCart === 'function' ? loadSharedCart() : loadCart();
  if (typeof syncUnifiedCartDom === 'function') {
    syncUnifiedCartDom(equipmentCart);
    return;
  }
  if (!cartCount || !cartTotal || !cartItems) return;
  const entries = Object.entries(equipmentCart).filter(([, item]) => item.quantity > 0);
  const quantity = typeof getCartBadgeCount === 'function'
    ? getCartBadgeCount(equipmentCart)
    : entries.reduce((sum, [, item]) => sum + item.quantity, 0);
  const total = entries.reduce((sum, [, item]) => sum + (typeof getCartItemTotal === 'function' ? getCartItemTotal(item) : item.quantity * (Number(item.price) || 1)), 0);
  const countText = typeof formatCartCount === 'function' ? formatCartCount(equipmentCart) : `${quantity} məhsul`;
  if (cartCount) cartCount.textContent = countText;
  if (headerCartCount) headerCartCount.textContent = countText;
  cartTotal.textContent = formatPrice(total);

  if (!entries.length) {
    cartItems.innerHTML = '<p class="cart-empty">Səbətiniz hələ boşdur.</p>';
    return;
  }

  cartItems.innerHTML = entries.map(([id, item]) => `
    <article class="cart-item">
      ${safeShopImage(item.image) ? `<img class="cart-item-thumb" src="${escapeShopHtml(safeShopImage(item.image))}" alt="" />` : '<span class="cart-item-thumb cart-item-thumb-empty" aria-hidden="true"></span>'}
      <div class="cart-item-copy"><h3>${escapeShopHtml(item.name)}</h3><p>${item.unit === 'g' ? `${escapeShopHtml(item.quantity)} q · ` : ''}${escapeShopHtml(formatPrice(typeof getCartItemTotal === 'function' ? getCartItemTotal(item) : item.quantity * (Number(item.price) || 1)))}</p><button class="cart-remove" type="button" data-cart-action="remove" data-product-id="${escapeShopHtml(id)}" aria-label="${escapeShopHtml(item.name)} məhsulunu səbətdən sil">Sil</button></div>
      <div class="cart-quantity" aria-label="${escapeShopHtml(item.name)} sayı">
        <button type="button" data-cart-action="decrease" data-product-id="${escapeShopHtml(id)}" aria-label="Miqdarı azalt">−</button>
        <span>${item.unit === 'g' ? `${escapeShopHtml(item.quantity)}q` : escapeShopHtml(item.quantity)}</span>
        <button type="button" data-cart-action="increase" data-product-id="${escapeShopHtml(id)}" aria-label="Miqdarı artır" ${item.unit === 'g' && item.quantity >= 1000 ? 'disabled' : ''}>+</button>
      </div>
    </article>`).join('');
};

const openCart = () => {
  renderCart();
  cartDrawer?.classList.add('open');
  cartDrawer?.setAttribute('aria-hidden', 'false');
  cartTrigger?.setAttribute('aria-expanded', 'true');
  headerCartTrigger?.setAttribute('aria-expanded', 'true');
  floatingCartTrigger?.setAttribute('aria-expanded', 'true');
  if (cartOverlay) cartOverlay.hidden = false;
  document.body.classList.add('cart-open');
  cartClose?.focus();
};

const closeCart = () => {
  cartDrawer?.classList.remove('open');
  cartDrawer?.setAttribute('aria-hidden', 'true');
  cartTrigger?.setAttribute('aria-expanded', 'false');
  headerCartTrigger?.setAttribute('aria-expanded', 'false');
  floatingCartTrigger?.setAttribute('aria-expanded', 'false');
  if (cartOverlay) cartOverlay.hidden = true;
  document.body.classList.remove('cart-open');
};

const openProduct = (card) => {
  if (!card) return;
  const filter = shopFilters?.querySelector('.filter-chip.active')?.dataset.filter || 'all';
  window.location.href = buildEquipmentDetailUrl(card.dataset.productId, filter);
};

const applyShopFilter = (filterButton, updateUrl = true) => {
  if (!filterButton) return;
  const filter = filterButton.dataset.filter;
  shopFilters.querySelectorAll('.filter-chip').forEach((button) => {
    const isActive = button === filterButton;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  shopProducts.querySelectorAll('.shop-product').forEach((product) => {
    product.hidden = filter !== 'all' && product.dataset.category !== filter;
  });
  if (updateUrl) updateShopUrl(filter, shopSort?.value || 'featured');
};

const updateShopUrl = (filter, sort) => {
  const url = new URL(buildEquipmentCatalogUrl(filter), window.location.href);
  if (sort && sort !== 'featured') url.searchParams.set('sort', sort);
  window.history.replaceState({}, '', `${url.pathname.split('/').pop()}${url.search}`);
};

const applyShopSort = (sort, updateUrl = true) => {
  if (!shopProducts || !window.EQUIPMENT_PRODUCTS) return;
  const sorted = sortEquipmentProducts(EQUIPMENT_PRODUCTS, sort);
  sorted.forEach((product) => {
    const card = shopProducts.querySelector(`[data-product-id="${product.id}"]`);
    if (card) shopProducts.append(card);
  });
  if (updateUrl) {
    const filter = shopFilters?.querySelector('.filter-chip.active')?.dataset.filter || 'all';
    updateShopUrl(filter, sort);
  }
};

shopProducts?.addEventListener('click', (event) => {
  const button = event.target.closest('.add-to-cart');
  if (button) {
    event.stopPropagation();
    if (button.disabled) return;
    const product = getEquipmentProduct(button.dataset.productId);
    if (!product) return;
    addVariantToCart(product, product.variants[0]);
    button.classList.add('added');
    button.dataset.i18n = 'added';
    button.textContent = tr('added', 'Əlavə edildi');
    window.setTimeout(() => {
      button.classList.remove('added');
      button.dataset.i18n = 'addToCart';
      button.textContent = tr('addToCart', 'Səbətə əlavə et');
    }, 900);
    return;
  }
  openProduct(event.target.closest('.shop-product'));
});

shopProducts?.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('button')) {
    event.preventDefault();
    openProduct(event.target.closest('.shop-product'));
  }
});

shopFilters?.addEventListener('click', (event) => {
  const filterButton = event.target.closest('.filter-chip');
  if (!filterButton) return;
  applyShopFilter(filterButton);
});

shopSort?.addEventListener('change', () => applyShopSort(shopSort.value));

cartItems?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const id = button.dataset.productId;
  equipmentCart = typeof loadSharedCart === 'function' ? loadSharedCart() : loadCart();
  if (!equipmentCart[id]) return;
  if (typeof applyCartAction === 'function') {
    equipmentCart = applyCartAction(equipmentCart, id, button.dataset.cartAction);
  } else if (button.dataset.cartAction === 'remove') {
    delete equipmentCart[id];
  } else {
    equipmentCart[id].quantity += button.dataset.cartAction === 'increase' ? 1 : -1;
    if (equipmentCart[id].quantity <= 0) delete equipmentCart[id];
  }
  saveCart();
  renderCart();
});

cartTrigger?.addEventListener('click', openCart);
headerCartTrigger?.addEventListener('click', openCart);
floatingCartTrigger?.addEventListener('click', openCart);
cartClose?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && cartDrawer?.classList.contains('open')) closeCart();
});

renderProducts();
if (shopFilters) {
  const search = new URLSearchParams(window.location.search);
  const requestedFilter = search.get('filter') || 'all';
  const requestedSort = search.get('sort') || 'featured';
  const filterButtons = Array.from(shopFilters.querySelectorAll('.filter-chip'));
  const initialFilter = filterButtons.find((button) => button.dataset.filter === requestedFilter)
    || filterButtons.find((button) => button.dataset.filter === 'all');
  applyShopFilter(initialFilter, false);
  if (shopSort && Array.from(shopSort.options).some((option) => option.value === requestedSort)) {
    shopSort.value = requestedSort;
    applyShopSort(requestedSort, false);
  }
}
renderCart();
window.BCF_I18N?.translateDom?.();
window.addEventListener('bcf:language-changed', () => {
  renderProducts();
  if (shopFilters) {
    const activeFilter = shopFilters.querySelector('.filter-chip.active')?.dataset.filter || 'all';
    const matchingChip = shopFilters.querySelector(`.filter-chip[data-filter="${activeFilter}"]`);
    if (matchingChip) applyShopFilter(matchingChip, false);
    if (shopSort?.value && shopSort.value !== 'featured') applyShopSort(shopSort.value, false);
  }
  renderCart();
  window.BCF_I18N?.translateDom?.();
});
