(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) Object.assign(root, api);
  if (root?.document && Array.isArray(root.BCF_PRODUCT_DATA)) api.hydrateManagedCatalog(root.BCF_PRODUCT_DATA);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  async function loadStorefrontProducts(category, fetchImpl = fetch) {
    let response;
    try { response = await fetchImpl('/api/products'); }
    catch (error) { throw new Error(`Kataloq məlumatları yüklənmədi: ${error.message}`); }
    if (!response.ok) throw new Error(`Kataloq məlumatları yüklənmədi (${response.status})`);
    const products = await response.json();
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

  return { loadStorefrontProducts, getProductAvailability, adaptTeaProducts, adaptEquipmentProducts, preserveCartLines, renderCoffeeCatalog, renderTeaCatalog, hydrateManagedCatalog };
});
