const teaProductsRoot = document.getElementById('kolleksiya');
const teaCartTrigger = document.getElementById('teaCartTrigger');
const floatingCartTrigger = document.getElementById('floatingCartTrigger');
const teaOrderModal = document.getElementById('teaOrderModal');
const teaModalOverlay = document.getElementById('teaModalOverlay');
const teaModalClose = document.getElementById('teaModalClose');
const teaOrderImage = document.getElementById('teaOrderImage');
const teaOrderTitle = document.getElementById('teaOrderTitle');
const teaOrderUnit = document.getElementById('teaOrderUnit');
const teaQuantity = document.getElementById('teaQuantity');
const teaQuantityLabel = document.getElementById('teaQuantityLabel');
const teaQuantityDecrease = document.getElementById('teaQuantityDecrease');
const teaQuantityIncrease = document.getElementById('teaQuantityIncrease');
const teaOrderTotal = document.getElementById('teaOrderTotal');
const teaOrderLimit = document.getElementById('teaOrderLimit');
const teaConfirmAdd = document.getElementById('teaConfirmAdd');
const sharedCartDrawer = document.getElementById('cartDrawer');
const sharedCartOverlay = document.getElementById('cartOverlay');
const sharedCartClose = document.getElementById('cartClose');
const sharedCartItems = document.getElementById('cartItems');
const sharedCartCount = document.getElementById('cartCount');
const sharedCartTotal = document.getElementById('cartTotal');
const teaCartToast = document.getElementById('teaCartToast');

const tr = (key, fallback) => window.BCF_I18N?.t?.(key, fallback) ?? fallback;
const dyn = (text) => window.BCF_I18N?.translateDynamicText?.(text) ?? text;

let teaCart = loadSharedCart();
let selectedTea = null;
let modalReturnFocus = null;
let teaToastTimer = null;

const showTeaToast = () => {
  if (!teaCartToast) return;
  teaCartToast.textContent = tr('cartAddedToast', 'Səbətə uğurla əlavə edildi');
  teaCartToast.hidden = false;
  clearTimeout(teaToastTimer);
  teaToastTimer = setTimeout(() => { teaCartToast.hidden = true; }, 2600);
};

const quantityText = (item) => formatCartItemQuantity(item);

const saveTeaCart = () => saveSharedCart(teaCart);

const renderTeaCart = () => {
  teaCart = loadSharedCart();
  syncUnifiedCartDom(teaCart);
};

const updateModalTotal = () => {
  if (!selectedTea) return;
  const quantity = normalizeTeaQuantity(teaQuantity.value, selectedTea.unit);
  teaOrderTotal.textContent = selectedTea.price == null ? tr('pricePending', 'Qiymət təsdiqlənəcək') : formatCartPrice(getCartItemTotal({ ...selectedTea, quantity }));
};

const setModalQuantity = (value) => {
  if (!selectedTea) return;
  teaQuantity.value = String(normalizeTeaQuantity(value, selectedTea.unit));
  updateModalTotal();
};

const openTeaModal = (tea, trigger) => {
  selectedTea = tea;
  modalReturnFocus = trigger;
  const isWeight = tea.unit === 'g';
  teaOrderImage.src = tea.image;
  teaOrderImage.alt = dyn(tea.name);
  teaOrderTitle.textContent = dyn(tea.name);
  teaOrderUnit.textContent = tea.price == null ? tr('priceConfirmAfterOrder', 'Qiymət sifarişdən sonra dəqiqləşdiriləcək')
    : dyn(isWeight ? `${formatCartPrice(tea.price)} / 100 q` : `${formatCartPrice(tea.price)} / ədəd`);
  teaQuantityLabel.textContent = isWeight ? tr('gram', 'Qram') : tr('qtyPieces', 'Ədəd');
  teaOrderLimit.textContent = dyn(isWeight ? 'Maksimum 1 kq' : '1–20 ədəd seçə bilərsiniz');
  teaQuantity.value = isWeight ? '100' : '1';
  updateModalTotal();
  teaOrderModal.hidden = false;
  teaModalOverlay.hidden = false;
  teaOrderModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('tea-modal-open');
  window.BCF_I18N?.translateDom?.(teaOrderModal);
};

const closeTeaModal = () => {
  teaOrderModal.hidden = true;
  teaModalOverlay.hidden = true;
  teaOrderModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('tea-modal-open');
  modalReturnFocus?.focus();
};

const openTeaCart = () => {
  closeTeaModal();
  renderTeaCart();
  sharedCartDrawer.classList.add('open');
  sharedCartDrawer.setAttribute('aria-hidden', 'false');
  teaCartTrigger?.setAttribute('aria-expanded', 'true');
  floatingCartTrigger?.setAttribute('aria-expanded', 'true');
  sharedCartOverlay.hidden = false;
  document.body.classList.add('cart-open');
  sharedCartClose.focus();
};

const closeTeaCart = () => {
  sharedCartDrawer.classList.remove('open');
  sharedCartDrawer.setAttribute('aria-hidden', 'true');
  teaCartTrigger?.setAttribute('aria-expanded', 'false');
  floatingCartTrigger?.setAttribute('aria-expanded', 'false');
  sharedCartOverlay.hidden = true;
  document.body.classList.remove('cart-open');
};

document.querySelectorAll('.tea-product').forEach((card) => {
  const tea = getTeaProduct(card.id);
  const copy = card.querySelector('.tea-product-copy');
  if (!tea || !copy) return;
  const longDescription = copy.querySelector('.tea-summary');
  const teaFacts = copy.querySelector('.tea-facts');
  if (longDescription) {
    const more = document.createElement('details');
    more.className = 'tea-more';
    more.innerHTML = '<summary data-i18n="moreDetails">Daha çox</summary>';
    more.append(longDescription);
    if (teaFacts) teaFacts.insertAdjacentElement('afterend', more);
    else copy.append(more);
  }
  const buy = document.createElement('div');
  buy.className = 'tea-buy';
  const soldOut = tea.stock?.status === 'out' || (tea.stock?.status === 'counted' && tea.stock.quantity <= 0);
  if (soldOut) {
    buy.innerHTML = `<span class="tea-price tea-price-pending" data-i18n="soldOut">${tr('soldOut', 'Bitib')}</span>`;
  } else if (tea.price == null) {
    buy.innerHTML = `<span class="tea-price tea-price-pending" data-i18n="pricePending">${tr('pricePending', 'Qiymət təsdiqlənəcək')}</span><button class="tea-add-button" type="button" data-tea-id="${tea.id}" data-i18n="addToOrderRequest">${tr('addToOrderRequest', 'Sifariş sorğusuna əlavə et')}</button>`;
  } else {
    const unit = dyn(tea.unit === 'g' ? '/ 100 q' : '/ ədəd');
    buy.innerHTML = `<span class="tea-price">${formatCartPrice(tea.price)} <small>${unit}</small></span><button class="tea-add-button" type="button" data-tea-id="${tea.id}" data-i18n="addToCart">${tr('addToCart', 'Səbətə əlavə et')}</button>`;
  }
  copy.append(buy);
});

window.BCF_I18N?.translateDom?.();
if (typeof window !== 'undefined' && window.BCF_I18N && typeof window.BCF_I18N.getLanguage === 'function' && window.BCF_I18N.getLanguage() !== 'az') {
  window.dispatchEvent(new CustomEvent('bcf:catalog-ready'));
}

teaProductsRoot?.addEventListener('click', (event) => {
  const button = event.target.closest('.tea-add-button');
  if (!button) return;
  const tea = getTeaProduct(button.dataset.teaId);
  const soldOut = tea?.stock?.status === 'out' || (tea?.stock?.status === 'counted' && tea.stock.quantity <= 0);
  if (tea && !soldOut) openTeaModal(tea, button);
});

teaQuantityDecrease?.addEventListener('click', () => {
  const isWeight = selectedTea?.unit === 'g';
  const step = isWeight ? 50 : 1;
  const min = isWeight ? 50 : 1;
  setModalQuantity(Math.max(min, Number(teaQuantity.value) - step));
});
teaQuantityIncrease?.addEventListener('click', () => {
  const isWeight = selectedTea?.unit === 'g';
  const step = isWeight ? 50 : 1;
  const max = isWeight ? 1000 : 20;
  setModalQuantity(Math.min(max, Number(teaQuantity.value) + step));
});
teaQuantity?.addEventListener('input', () => {
  teaQuantity.value = teaQuantity.value.replace(/\D/g, '');
  updateModalTotal();
});
teaQuantity?.addEventListener('change', () => setModalQuantity(teaQuantity.value));
teaQuantity?.addEventListener('focus', () => {
  requestAnimationFrame(() => teaQuantity.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' }));
});

teaConfirmAdd?.addEventListener('click', () => {
  if (!selectedTea) return;
  teaCart = loadSharedCart();
  const id = `tea-${selectedTea.id}`;
  const amount = normalizeTeaQuantity(teaQuantity.value, selectedTea.unit);
  const current = teaCart[id]?.quantity || 0;
  const isWeight = selectedTea.unit === 'g';
  const max = isWeight ? 1000 : 20;
  const quantity = Math.min(max, current + amount);
  teaCart[id] = {
    id: selectedTea.id,
    name: selectedTea.name,
    price: selectedTea.price,
    quantity,
    unit: selectedTea.unit,
    maxQuantity: max,
    image: selectedTea.image,
    category: 'tea',
  };
  saveTeaCart();
  renderTeaCart();
  closeTeaModal();
  showTeaToast();
});

sharedCartItems?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  teaCart = applyCartAction(loadSharedCart(), button.dataset.productId, button.dataset.cartAction);
  saveTeaCart();
  renderTeaCart();
});

teaCartTrigger?.addEventListener('click', openTeaCart);
floatingCartTrigger?.addEventListener('click', openTeaCart);
sharedCartClose?.addEventListener('click', closeTeaCart);
sharedCartOverlay?.addEventListener('click', closeTeaCart);
teaModalClose?.addEventListener('click', closeTeaModal);
teaModalOverlay?.addEventListener('click', closeTeaModal);
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!teaOrderModal.hidden) closeTeaModal();
  else if (sharedCartDrawer.classList.contains('open')) closeTeaCart();
});

renderTeaCart();
window.addEventListener('bcf:language-changed', () => {
  if (selectedTea && !teaOrderModal?.hidden) {
    const isWeight = selectedTea.unit === 'g';
    teaOrderTitle.textContent = dyn(selectedTea.name);
    teaOrderUnit.textContent = selectedTea.price == null ? tr('priceConfirmAfterOrder', 'Qiymət sifarişdən sonra dəqiqləşdiriləcək')
      : dyn(isWeight ? `${formatCartPrice(selectedTea.price)} / 100 q` : `${formatCartPrice(selectedTea.price)} / ədəd`);
    teaQuantityLabel.textContent = isWeight ? tr('gram', 'Qram') : tr('qtyPieces', 'Ədəd');
    teaOrderLimit.textContent = dyn(isWeight ? 'Maksimum 1 kq' : '1–20 ədəd seçə bilərsiniz');
    updateModalTotal();
  }
  window.BCF_I18N?.translateDom?.();
});

