const coffeeProductsRoot = document.querySelector('.coffee-list');
const coffeeCartTrigger = document.getElementById('coffeeCartTrigger');
const floatingCartTrigger = document.getElementById('floatingCartTrigger');
const coffeeOrderModal = document.getElementById('coffeeOrderModal');
const coffeeModalOverlay = document.getElementById('coffeeModalOverlay');
const coffeeModalClose = document.getElementById('coffeeModalClose');
const coffeeOrderTitle = document.getElementById('coffeeOrderTitle');
const coffeeOrderUnit = document.getElementById('coffeeOrderUnit');
const coffeeQuantity = document.getElementById('coffeeQuantity');
const coffeeQuantityDecrease = document.getElementById('coffeeQuantityDecrease');
const coffeeQuantityIncrease = document.getElementById('coffeeQuantityIncrease');
const coffeeOrderTotal = document.getElementById('coffeeOrderTotal');
const coffeeConfirmAdd = document.getElementById('coffeeConfirmAdd');
const coffeeCartDrawer = document.getElementById('coffeeCartDrawer');
const coffeeCartOverlay = document.getElementById('coffeeCartOverlay');
const coffeeCartClose = document.getElementById('coffeeCartClose');
const coffeeCartItems = document.getElementById('coffeeCartItems');
const coffeeCartCount = document.getElementById('coffeeCartCount');
const coffeeCartTotal = document.getElementById('coffeeCartTotal');
const coffeeCartToast = document.getElementById('coffeeCartToast');

const COFFEE_LOGO = 'assets/coffee/cart-coffee-beans.png';
const tr = (key, fallback) => window.BCF_I18N?.t?.(key, fallback) ?? fallback;
const dyn = (text) => window.BCF_I18N?.translateDynamicText?.(text) ?? text;
let coffeeCart = loadSharedCart();
let selectedCoffee = null;
let coffeeReturnFocus = null;
let coffeeToastTimer = null;

const normalizeCoffeeQuantity = (value) => normalizeTeaQuantity(value, 'g', 2000);
const coffeeTotal = (coffee, quantity) => formatCartPrice(getCartItemTotal({ ...coffee, quantity }));

const showCoffeeToast = () => {
  coffeeCartToast.textContent = tr('cartAddedToast', 'Səbətə uğurla əlavə edildi');
  coffeeCartToast.hidden = false;
  clearTimeout(coffeeToastTimer);
  coffeeToastTimer = setTimeout(() => { coffeeCartToast.hidden = true; }, 2600);
};

const renderCoffeeCart = () => {
  coffeeCart = loadSharedCart();
  syncUnifiedCartDom(coffeeCart); // renders cart-item and cart-item-thumb
};

const updateCoffeeTotal = () => {
  if (selectedCoffee) coffeeOrderTotal.textContent = coffeeTotal(selectedCoffee, normalizeCoffeeQuantity(coffeeQuantity.value));
};

const setCoffeeQuantity = (value) => {
  coffeeQuantity.value = String(normalizeCoffeeQuantity(value));
  updateCoffeeTotal();
};

const openCoffeeModal = (coffee, trigger) => {
  selectedCoffee = { ...coffee, image: COFFEE_LOGO, category: 'coffee', maxQuantity: 2000 };
  coffeeReturnFocus = trigger;
  coffeeOrderTitle.textContent = dyn(coffee.name);
  coffeeOrderUnit.textContent = dyn(`${formatCartPrice(coffee.price)} / 100 q`);
  coffeeQuantity.value = '100';
  updateCoffeeTotal();
  coffeeOrderModal.hidden = false;
  coffeeModalOverlay.hidden = false;
  coffeeOrderModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('tea-modal-open');
  window.BCF_I18N?.translateDom?.(coffeeOrderModal);
};

const closeCoffeeModal = () => {
  coffeeOrderModal.hidden = true;
  coffeeModalOverlay.hidden = true;
  coffeeOrderModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('tea-modal-open');
  coffeeReturnFocus?.focus();
};

const openCoffeeCart = () => {
  closeCoffeeModal();
  renderCoffeeCart();
  coffeeCartDrawer.classList.add('open');
  coffeeCartDrawer.setAttribute('aria-hidden', 'false');
  coffeeCartTrigger?.setAttribute('aria-expanded', 'true');
  floatingCartTrigger?.setAttribute('aria-expanded', 'true');
  coffeeCartOverlay.hidden = false;
  document.body.classList.add('cart-open');
  coffeeCartClose.focus();
};

const closeCoffeeCart = () => {
  coffeeCartDrawer.classList.remove('open');
  coffeeCartDrawer.setAttribute('aria-hidden', 'true');
  coffeeCartTrigger?.setAttribute('aria-expanded', 'false');
  floatingCartTrigger?.setAttribute('aria-expanded', 'false');
  coffeeCartOverlay.hidden = true;
  document.body.classList.remove('cart-open');
};

document.querySelectorAll('.coffee-profile').forEach((card) => {
  const id = [...card.classList].find((name) => name !== 'coffee-profile');
  const titleEl = card.querySelector('.coffee-title h2');
  const name = titleEl?._bcfOrigText || titleEl?.textContent.trim();
  const price = Number(card.querySelector('.coffee-title p')?.textContent.replace(/[^\d.]/g, ''));
  if (!id || !name || !Number.isFinite(price)) return;
  const buy = document.createElement('div');
  buy.className = 'coffee-buy';
  const purchasable = card.dataset.purchasable !== 'false';
  const productImage = card.querySelector('.coffee-photo img')?.getAttribute('src') || COFFEE_LOGO;
  buy.innerHTML = purchasable
    ? `<button class="coffee-add-button" type="button" data-i18n="addToCart">${tr('addToCart', 'Səbətə əlavə et')}</button>`
    : `<button class="coffee-add-button" type="button" data-i18n="soldOut" disabled>${tr('soldOut', 'Bitib')}</button>`;
  buy.querySelector('button').addEventListener('click', () => {
    if (purchasable) openCoffeeModal({ id, name, price, unit: 'g', maxQuantity: 2000, image: productImage }, buy.querySelector('button'));
  });
  card.querySelector('.coffee-copy')?.append(buy);
});

coffeeQuantityDecrease?.addEventListener('click', () => {
  setCoffeeQuantity(Math.max(50, Number(coffeeQuantity.value) - 50));
});
coffeeQuantityIncrease?.addEventListener('click', () => {
  setCoffeeQuantity(Math.min(2000, Number(coffeeQuantity.value) + 50));
});
coffeeQuantity?.addEventListener('input', () => { coffeeQuantity.value = coffeeQuantity.value.replace(/\D/g, ''); updateCoffeeTotal(); });
coffeeQuantity?.addEventListener('change', () => setCoffeeQuantity(coffeeQuantity.value));
coffeeQuantity?.addEventListener('focus', () => requestAnimationFrame(() => coffeeQuantity.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })));
coffeeConfirmAdd?.addEventListener('click', () => {
  if (!selectedCoffee) return;
  coffeeCart = loadSharedCart();
  const id = `coffee-${selectedCoffee.id}`;
  const quantity = Math.min(2000, (coffeeCart[id]?.quantity || 0) + normalizeCoffeeQuantity(coffeeQuantity.value));
  coffeeCart[id] = { ...selectedCoffee, id: selectedCoffee.id, image: COFFEE_LOGO, category: 'coffee', maxQuantity: 2000, quantity };
  saveSharedCart(coffeeCart);
  renderCoffeeCart();
  closeCoffeeModal();
  showCoffeeToast();
});
coffeeCartItems?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  coffeeCart = applyCartAction(loadSharedCart(), button.dataset.productId, button.dataset.cartAction);
  saveSharedCart(coffeeCart);
  renderCoffeeCart();
});
coffeeCartTrigger?.addEventListener('click', openCoffeeCart);
floatingCartTrigger?.addEventListener('click', openCoffeeCart);
coffeeCartClose?.addEventListener('click', closeCoffeeCart);
coffeeCartOverlay?.addEventListener('click', closeCoffeeCart);
coffeeModalClose?.addEventListener('click', closeCoffeeModal);
coffeeModalOverlay?.addEventListener('click', closeCoffeeModal);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (!coffeeOrderModal.hidden) closeCoffeeModal(); else if (coffeeCartDrawer.classList.contains('open')) closeCoffeeCart(); } });
renderCoffeeCart();
window.BCF_I18N?.translateDom?.();
window.addEventListener('bcf:language-changed', () => {
  if (selectedCoffee && !coffeeOrderModal?.hidden) {
    coffeeOrderTitle.textContent = dyn(selectedCoffee.name);
    coffeeOrderUnit.textContent = dyn(`${formatCartPrice(selectedCoffee.price)} / 100 q`);
  }
  window.BCF_I18N?.translateDom?.();
});
