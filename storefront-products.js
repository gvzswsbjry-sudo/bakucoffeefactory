(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) Object.assign(root, api);
  if (root?.document && Array.isArray(root.BCF_PRODUCT_DATA)) api.hydrateManagedCatalog(root.BCF_PRODUCT_DATA);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const PAGE_SCRIPTS = Object.freeze({
    tea: ['tea-data.js', 'tea-shop.js'],
    coffee: ['coffee-shop.js'],
    equipment: ['equipment-data.js', 'gear-shop.js'],
    detail: ['equipment-data.js', 'product-detail.js'],
  });

  async function loadAllStorefrontProducts(fetchImpl = globalThis.fetch) {
    if (typeof fetchImpl !== 'function') throw new Error('Kataloq məlumatlarını yükləmək üçün şəbəkə bağlantısı tapılmadı.');
    let response;
    try {
      response = await fetchImpl('/api/products', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
    }
    catch (error) { throw new Error(`Kataloq məlumatları yüklənmədi: ${error.message}`); }
    if (!response.ok) throw new Error(`Kataloq məlumatları yüklənmədi (${response.status})`);
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error('Kataloq məlumatlarının formatı düzgün deyil.');
    return products;
  }

  async function loadStorefrontProducts(category, fetchImpl = globalThis.fetch) {
    const products = await loadAllStorefrontProducts(fetchImpl);
    return products
      .filter((item) => item.category === category && item.active)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'az'));
  }

  function getProductAvailability(product) {
    const stock = product.stock || { status: 'available', quantity: null };
    if (stock.status === 'out' || (stock.status === 'counted' && stock.quantity <= 0)) return { purchasable: false, label: 'Bitib' };
    if (stock.status === 'counted') return { purchasable: true, label: `${stock.quantity} ədəd qalıb` };
    return { purchasable: true, label: 'Mövcuddur' };
  }

  function adaptTeaProducts(products) {
    return Object.fromEntries(products.map((item) => [item.id, {
      id: item.id, name: item.name, image: item.image, price: item.meta?.pricePending && !(Number(item.price) > 0) ? null : item.price,
      unit: item.unit, cartId: `tea-${item.id}`, stock: item.stock, description: item.description, meta: item.meta || {},
    }]));
  }

  function adaptEquipmentProducts(products) {
    return products.map((item) => ({
      id: item.id,
      category: item.meta?.equipmentCategory || 'accessory',
      categoryLabel: item.meta?.categoryLabel || 'Avadanlıq',
      name: item.name,
      description: item.description,
      imageFit: item.meta?.imageFit || 'cover',
      stock: item.stock,
      variants: (item.variants?.length ? item.variants : [{ id: item.id, name: item.name, price: item.price, image: item.image }]).map((variant) => ({
        id: variant.id, label: variant.name, price: variant.price, image: variant.image,
        color: variant.color || '#8b8177', alt: variant.alt || item.name,
      })),
    }));
  }

  function preserveCartLines(cart) {
    return JSON.parse(JSON.stringify(cart || {}));
  }

  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const score = (label, value) => `<div><span>${label}</span><b>${Number(value || 0)} / 5</b><i><em style="width:${Math.max(0, Math.min(100, Number(value || 0) * 20))}%"></em></i></div>`;

  function renderCoffeeCatalog(products) {
    const root = document.querySelector('.coffee-list');
    if (!root) return;
    const coffee = products.filter((item) => item.category === 'coffee' && item.active).sort((a, b) => a.sortOrder - b.sortOrder);
    root.innerHTML = coffee.map((item) => {
      const availability = getProductAvailability(item);
      const meta = item.meta || {};
      return `<article class="coffee-profile ${esc(item.id)}" data-managed-id="${esc(item.id)}" data-purchasable="${availability.purchasable}">
        <div class="coffee-photo"><img src="${esc(item.image)}" alt="${esc(item.name)} qəhvə dənələri" /></div>
        <div class="coffee-copy"><p class="coffee-origin">${esc(item.name)} · ${esc(meta.weight || 100)} q</p>
          <div class="coffee-title"><h2>${esc(item.name)}</h2><p>${Number(item.price).toFixed(2)} ₼</p></div>
          <div class="coffee-scores">${score('Turşuluq',meta.acidity)}${score('Bədən',meta.body)}${score('Balans',meta.balance)}</div>
          <div class="coffee-taste"><span>Dad notları</span><p>${esc(meta.tasteNotes || '')}</p></div>
          <details class="coffee-more"><summary>Daha çox <span aria-hidden="true">↗</span></summary><div class="coffee-more-content"><p class="coffee-summary">${esc(item.description)}</p></div></details>
          ${availability.label !== 'Mövcuddur' ? `<p class="managed-stock-label">${esc(availability.label)}</p>` : ''}
        </div></article>`;
    }).join('');
  }

  function renderTeaCatalog(products) {
    const root = document.getElementById('kolleksiya');
    if (!root) return;
    const tea = products.filter((item) => item.category === 'tea' && item.active).sort((a, b) => a.sortOrder - b.sortOrder);
    const jump = document.querySelector('.tea-jump');
    if (jump) jump.innerHTML = tea.map((item) => `<a href="#${esc(item.id)}">${esc(item.name.replace(/ Çayı$/, ''))}</a>`).join('');
    root.innerHTML = tea.map((item, index) => {
      const meta = item.meta || {};
      const availability = getProductAvailability(item);
      return `<article class="tea-product" id="${esc(item.id)}" data-purchasable="${availability.purchasable}">
        <figure class="tea-product-visual"><img src="${esc(item.image)}" alt="${esc(item.name)}" ${index ? 'loading="lazy" decoding="async"' : 'fetchpriority="high"'} /></figure>
        <div class="tea-product-copy"><p class="tea-kind">${esc(meta.kind || 'Çay kolleksiyası')}</p><h2>${esc(item.name)}</h2>
          <p class="tea-summary">${esc(item.description)}</p><dl class="tea-facts"><div><dt>Dad notları</dt><dd>${esc(meta.tasteNotes || '')}</dd></div><div><dt>Dəmləmə</dt><dd>${esc(meta.brew || '')}</dd></div></dl>
          ${availability.label !== 'Mövcuddur' ? `<p class="managed-stock-label">${esc(availability.label)}</p>` : ''}</div></article>`;
    }).join('');
  }

  function hydrateManagedCatalog(products) {
    renderCoffeeCatalog(products);
    renderTeaCatalog(products);
  }

  function loadBrowserScript(src, documentRef = globalThis.document) {
    return new Promise((resolve, reject) => {
      if (!documentRef?.createElement || !documentRef?.body) {
        reject(new Error(`${src} yüklənmədi: sənəd hazır deyil.`));
        return;
      }
      const script = documentRef.createElement('script');
      const url = src.includes('?') ? src : `${src}?v=20261103-cart-fallback1`;
      script.src = url;
      script.async = false;
      script.onload = () => resolve(src);
      script.onerror = () => reject(new Error(`${src} yüklənmədi.`));
      documentRef.body.append(script);
    });
  }

  function showCatalogLoadError(error, documentRef = globalThis.document) {
    const target = documentRef?.querySelector?.('.coffee-list')
      || documentRef?.getElementById?.('kolleksiya')
      || documentRef?.getElementById?.('shopProducts')
      || documentRef?.getElementById?.('productDetail')
      || documentRef?.querySelector?.('main');
    if (!target || !documentRef?.createElement) return;
    target.replaceChildren();
    const message = documentRef.createElement('p');
    message.className = 'catalog-load-error';
    message.setAttribute('role', 'alert');
    message.textContent = 'Məhsullar hazırda yüklənə bilmir. Səhifəni yeniləyib yenidən cəhd edin.';
    target.append(message);
    if (globalThis.console?.error) globalThis.console.error('Catalog load failed:', error?.message || error);
  }

  async function bootstrapStorefrontPage(options = {}) {
    const root = options.root || (typeof window !== 'undefined' ? window : globalThis);
    const page = options.page;
    const fetchImpl = options.fetchImpl || root.fetch?.bind(root);
    const hydrate = options.hydrate || hydrateManagedCatalog;
    const loadScript = options.loadScript || ((src) => loadBrowserScript(src, root.document));
    const showError = options.showError || ((error) => showCatalogLoadError(error, root.document));

    const scripts = PAGE_SCRIPTS[page];
    if (!scripts) {
      const error = new Error(`Naməlum kataloq səhifəsi: ${page || 'təyin edilməyib'}`);
      showError(error);
      throw error;
    }

    let products = [];
    let apiError = null;
    try {
      products = await loadAllStorefrontProducts(fetchImpl);
      root.BCF_PRODUCT_DATA = products;
      if (page === 'coffee' || page === 'tea') hydrate(products);
    } catch (error) {
      apiError = error;
      root.BCF_PRODUCT_DATA = [];
      // Tea and coffee pages keep a complete static catalogue in their HTML.
      // Let their shop scripts enhance that catalogue so ordering remains
      // available during a temporary API/server interruption.
      if (page !== 'coffee' && page !== 'tea') {
        showError(error);
        throw error;
      }
      root.console?.warn?.('Catalog API unavailable; using the built-in ordering catalogue.', error?.message || error);
    }

    try {
      for (const src of scripts) await loadScript(src);
      if (typeof root.dispatchEvent === 'function' && typeof root.CustomEvent === 'function') {
        root.dispatchEvent(new root.CustomEvent('bcf:catalog-ready', { detail: { products, fallback: Boolean(apiError) } }));
      }
      return products;
    } catch (error) {
      showError(error);
      throw error;
    }
  }

  return {
    loadAllStorefrontProducts,
    loadStorefrontProducts,
    bootstrapStorefrontPage,
    loadBrowserScript,
    showCatalogLoadError,
    getProductAvailability,
    adaptTeaProducts,
    adaptEquipmentProducts,
    preserveCartLines,
    renderCoffeeCatalog,
    renderTeaCatalog,
    hydrateManagedCatalog,
  };
});
