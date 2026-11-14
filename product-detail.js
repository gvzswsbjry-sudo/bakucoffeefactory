const detailCartKey = 'bcf-equipment-cart-v1';
const params = new URLSearchParams(window.location.search);
const detailProduct = getEquipmentProduct(params.get('id'));
const sourceFilter = params.get('from') || 'all';

const productDetail = document.getElementById('productDetail');
const productNotFound = document.getElementById('productNotFound');
const detailGallery = document.getElementById('detailGallery');
const detailImage = document.getElementById('detailImage');
const detailCategory = document.getElementById('detailCategory');
const detailTitle = document.getElementById('detailTitle');
const detailDescription = document.getElementById('detailDescription');
const detailPrice = document.getElementById('detailPrice');
const variantLabel = document.getElementById('variantLabel');
const variantSwatches = document.getElementById('variantSwatches');
const galleryCount = document.getElementById('galleryCount');
const detailPrev = document.getElementById('detailPrev');
const detailNext = document.getElementById('detailNext');
const detailAdd = document.getElementById('detailAdd');
const detailCartNote = document.getElementById('detailCartNote');
const detailVariantCount = document.getElementById('detailVariantCount');
const productBack = document.getElementById('productBack');

const tr = (key, fallback) => window.BCF_I18N?.t?.(key, fallback) ?? fallback;
const dyn = (text) => window.BCF_I18N?.translateDynamicText?.(text) ?? text;

const escapeDetailHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
})[character]);

const safeDetailImage = (value) => {
  const image = String(value || '');
  return /^assets\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+$/.test(image) && !image.split('/').includes('..') ? image : '';
};

let selectedVariant = detailProduct ? resolveEquipmentVariant(detailProduct, params.get('variant')) : null;
const purchasable = Boolean(detailProduct) && detailProduct.stock?.status !== 'out' && !(detailProduct.stock?.status === 'counted' && detailProduct.stock.quantity <= 0);

const formatDetailPrice = (value) => `${Number(value).toFixed(2)} ₼`;

const updateVariantUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('id', detailProduct.id);
  url.searchParams.set('variant', selectedVariant.id);
  window.history.replaceState({}, '', url);
};

const renderVariant = () => {
  if (!detailProduct || !selectedVariant) return;
  const index = detailProduct.variants.findIndex((variant) => variant.id === selectedVariant.id);
  detailImage.src = selectedVariant.image;
  detailImage.alt = dyn(selectedVariant.alt || detailProduct.name);
  detailGallery.classList.toggle('image-contain', detailProduct.imageFit === 'contain');
  detailCategory.textContent = dyn(detailProduct.categoryLabel);
  detailTitle.textContent = dyn(detailProduct.name);
  const variantDesc = selectedVariant.alt && selectedVariant.alt !== detailProduct.name ? selectedVariant.alt : '';
  const baseDesc = variantDesc ? `${detailProduct.description} (${variantDesc})` : detailProduct.description;
  detailDescription.textContent = dyn(baseDesc);
  detailPrice.textContent = formatDetailPrice(selectedVariant.price);
  variantLabel.textContent = dyn(selectedVariant.label || selectedVariant.size || selectedVariant.name);
  galleryCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(detailProduct.variants.length).padStart(2, '0')}`;
  detailVariantCount.textContent = dyn(`${detailProduct.variants.length} seçim`);

  variantSwatches.querySelectorAll('.variant-swatch').forEach((button) => {
    const isActive = button.dataset.variantId === selectedVariant.id;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  updateVariantUrl();
};

const selectVariant = (variant) => {
  if (!variant) return;
  selectedVariant = variant;
  renderVariant();
};

const renderDetail = () => {
  productBack.href = buildEquipmentCatalogUrl(sourceFilter);
  if (!detailProduct) {
    productDetail.hidden = true;
    productNotFound.hidden = false;
    document.title = 'Məhsul tapılmadı — Yeni Baku Coffee Factory';
    window.BCF_I18N?.translateDom?.();
    return;
  }

  document.title = `${detailProduct.name} — Yeni Baku Coffee Factory`;
  variantSwatches.innerHTML = detailProduct.variants.map((variant) => {
    const rawLabel = variant.label || variant.size || variant.name;
    const label = escapeDetailHtml(dyn(rawLabel));
    const image = escapeDetailHtml(safeDetailImage(variant.image));
    const color = escapeDetailHtml(variant.color || '#8b8177');
    const swatchImg = variant.swatchImage ? escapeDetailHtml(safeDetailImage(variant.swatchImage)) : '';
    const imageStyle = swatchImg ? `background-image:url('${swatchImg}');` : '';
    const swatchImgVar = swatchImg ? `--swatch-img:url('${swatchImg}');` : '';
    return `
    <button class="variant-swatch" type="button" data-variant-id="${escapeDetailHtml(variant.id)}" style="--swatch:${color}; ${swatchImgVar}" aria-label="${label}" aria-pressed="false">
      <span class="swatch-pattern" style="${imageStyle} background-color:${color}"></span><small>${label}</small>
    </button>`;
  }).join('');

  const hasMultiple = detailProduct.variants.length > 1;
  detailPrev.hidden = !hasMultiple;
  detailNext.hidden = !hasMultiple;
  detailAdd.disabled = !purchasable;
  if (!purchasable) {
    detailAdd.dataset.i18n = 'soldOut';
    detailAdd.textContent = tr('soldOut', 'Bitib');
    detailCartNote.textContent = tr('outOfStockNote', 'Bu məhsul hazırda stokda yoxdur.');
  } else {
    detailAdd.dataset.i18n = 'addToCart';
    detailAdd.textContent = tr('addToCart', 'Səbətə əlavə et');
  }
  renderVariant();
  window.BCF_I18N?.translateDom?.();
};

const addSelectedVariant = () => {
  if (!purchasable) return;
  if (!detailProduct || !selectedVariant) return;
  let cart = typeof loadSharedCart === 'function' ? loadSharedCart() : {};
  if (!Object.keys(cart).length) {
    try {
      cart = JSON.parse(localStorage.getItem(detailCartKey)) || {};
    } catch {
      cart = {};
    }
  }

  const id = selectedVariant.id;
  cart[id] = cart[id] || { id, name: getEquipmentVariantName(detailProduct, selectedVariant), price: selectedVariant.price, quantity: 0, unit: 'piece', maxQuantity: 99, category: 'equipment', image: selectedVariant.image };
  cart[id].name = getEquipmentVariantName(detailProduct, selectedVariant);
  cart[id].price = selectedVariant.price;
  cart[id].unit = 'piece';
  cart[id].maxQuantity = 99;
  cart[id].category = 'equipment';
  cart[id].image = selectedVariant.image;
  cart[id].quantity += 1;
  if (typeof saveSharedCart === 'function') {
    saveSharedCart(cart);
  } else {
    localStorage.setItem(detailCartKey, JSON.stringify(cart));
  }
  detailCartNote.textContent = `${dyn(cart[id].name)} ${tr('addedToCartSentence', 'səbətə əlavə edildi.')}`;
  detailAdd.classList.add('added');
  detailAdd.dataset.i18n = 'added';
  detailAdd.textContent = tr('added', 'Əlavə edildi');
  window.setTimeout(() => {
    detailAdd.classList.remove('added');
    detailAdd.dataset.i18n = 'addToCart';
    detailAdd.textContent = tr('addToCart', 'Səbətə əlavə et');
  }, 900);
};

variantSwatches?.addEventListener('click', (event) => {
  const button = event.target.closest('.variant-swatch');
  if (!button) return;
  selectVariant(resolveEquipmentVariant(detailProduct, button.dataset.variantId));
});

detailPrev?.addEventListener('click', () => selectVariant(cycleEquipmentVariant(detailProduct, selectedVariant.id, -1)));
detailNext?.addEventListener('click', () => selectVariant(cycleEquipmentVariant(detailProduct, selectedVariant.id, 1)));
detailAdd?.addEventListener('click', addSelectedVariant);

document.addEventListener('keydown', (event) => {
  if (!detailProduct || detailProduct.variants.length < 2) return;
  if (event.key === 'ArrowLeft') selectVariant(cycleEquipmentVariant(detailProduct, selectedVariant.id, -1));
  if (event.key === 'ArrowRight') selectVariant(cycleEquipmentVariant(detailProduct, selectedVariant.id, 1));
});

renderDetail();
window.addEventListener('bcf:language-changed', renderDetail);
