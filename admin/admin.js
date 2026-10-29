(function () {
  'use strict';
  const api = createAdminApi();
  const $ = (id) => document.getElementById(id);
  const EMPTY_STATE_CLASS = 'empty-state';
  const assetDialog = $('assetDialog');
  const deleteDialog = $('deleteDialog');
  const state = { products: [], assets: [], category: 'all', editingId: null, dirty: false, assetTarget: null };
  const categoryNames = { coffee: 'Qəhvə', tea: 'Çay', equipment: 'Avadanlıq' };
  const catalogTitles = { all: 'Bütün məhsullar', coffee: 'Qəhvələr', tea: 'Çaylar', equipment: 'Avadanlıqlar' };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function showAuth(configured, message = '') {
    $('adminApp').hidden = true;
    $('authView').hidden = false;
    $('setupPanel').hidden = configured;
    $('loginPanel').hidden = !configured;
    $('authMessage').textContent = message;
  }

  async function boot() {
    try {
      const session = await api.getSession();
      if (!session.authenticated) return showAuth(session.configured);
      $('authView').hidden = true;
      $('adminApp').hidden = false;
      await loadCatalog();
    } catch (error) {
      showAuth(true, 'Serverə qoşulmaq mümkün olmadı. Lokal serverin işlədiyini yoxlayın.');
    }
  }

  async function authenticate(password) {
    $('authMessage').textContent = '';
    try {
      const session = await api.getSession();
      if (session.configured) await api.login(password); else await api.setup(password);
      await boot();
    } catch (error) {
      $('authMessage').textContent = error.message;
    }
  }

  async function loadCatalog() {
    try {
      [state.products, state.assets] = await Promise.all([api.listProducts(), api.listAssets()]);
      renderCatalog();
    } catch (error) {
      if (error.status === 401) return showAuth(true, 'Sessiya bitib. Yenidən daxil olun.');
      $('appMessage').textContent = 'Şəbəkə və ya server xətası: ' + error.message;
    }
  }

  function filteredProducts() {
    const query = $('productSearch').value.trim().toLocaleLowerCase('az');
    const active = $('activeFilter').value;
    const stock = $('stockFilter').value;
    return state.products
      .filter((item) => state.category === 'all' || item.category === state.category)
      .filter((item) => !query || item.name.toLocaleLowerCase('az').includes(query) || item.id.toLocaleLowerCase('az').includes(query))
      .filter((item) => active === 'all' || (active === 'active' ? item.active : !item.active))
      .filter((item) => stock === 'all' || item.stock.status === stock)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'az'));
  }

  function renderCatalog() {
    const counts = { all: state.products.length, coffee: 0, tea: 0, equipment: 0 };
    state.products.forEach((item) => { counts[item.category] += 1; });
    $('countAll').textContent = counts.all;
    $('countCoffee').textContent = counts.coffee;
    $('countTea').textContent = counts.tea;
    $('countEquipment').textContent = counts.equipment;
    $('catalogTitle').textContent = catalogTitles[state.category];

    const products = filteredProducts();
    $('emptyState').hidden = products.length > 0;
    $('productTableBody').innerHTML = products.map((item) => {
      const price = isProductPricePending(item) ? 'Mağazada' : `${getCatalogPrice(item).toFixed(2)} ₼`;
      const stock = item.stock.status === 'counted' ? `${item.stock.quantity} ədəd` : item.stock.status === 'out' ? 'Bitib' : 'Mövcuddur';
      return `<tr data-id="${escapeHtml(item.id)}">
        <td data-label="Məhsul"><div class="product-cell"><img src="../${escapeHtml(item.image)}" alt="" /><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.id)}</small></div></div></td>
        <td data-label="Kateqoriya"><span class="tag">${categoryNames[item.category]}</span></td><td data-label="Qiymət"><strong>${price}</strong></td>
        <td data-label="Stok"><span class="status-pill ${item.stock.status === 'out' ? 'out' : ''}">${stock}</span></td>
        <td data-label="Status"><span class="status-pill ${item.active ? '' : 'inactive'}">${item.active ? 'Aktiv' : 'Gizli'}</span></td>
        <td data-label="Əməliyyat"><button class="row-edit" type="button" data-edit="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.name)} məhsulunu redaktə et">→</button></td></tr>`;
    }).join('');
  }

  function setImagePreview(src) {
    $('imagePreview').innerHTML = src ? `<img src="../${escapeHtml(src)}" alt="Seçilmiş məhsul şəkli" />` : 'Şəkil seçilməyib';
  }

  function updateVariantInterface() {
    const rows = [...$('variantRows').querySelectorAll('.variant-row')];
    const pricing = getEditorPricingState({
      category: $('productCategory').value,
      price: Number($('productPrice').value),
      variants: rows.map((row) => ({ price: Number(row.querySelector('[data-variant="price"]').value) })),
    });
    rows.forEach((row, index) => { row.querySelector('[data-variant-number]').textContent = index + 1; });
    $('variantEmpty').hidden = rows.length > 0;
    $('basePriceField').hidden = !pricing.showBasePrice;
    $('variantPricingHint').hidden = !pricing.usesVariantPrices;
  }

  function variantRow(variant = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'variant-row';
    wrapper.innerHTML = `<div class="variant-row-heading"><strong>Variant <span data-variant-number></span></strong><button type="button" data-remove-variant>Variantı sil</button></div>
    <div class="variant-row-grid">
      <label>ID<input data-variant="id" value="${escapeHtml(variant.id || '')}" /></label>
      <label>Ad<input data-variant="name" value="${escapeHtml(variant.name || '')}" /></label>
      <label>Qiymət, AZN<input data-variant="price" type="number" min="0" step="0.01" value="${escapeHtml(variant.price ?? '')}" /></label>
    </div><div class="variant-image-field"><label>Şəkil yolu<input data-variant="image" value="${escapeHtml(variant.image || '')}" readonly /></label><button type="button" data-pick-variant-image>Şəkil seç</button></div>
    <div class="variant-row-grid variant-row-meta">
      <label>Rəng (HEX)<input data-variant="color" value="${escapeHtml(variant.color || '#8b8177')}" /></label>
      <label class="variant-alt">Şəkil açıqlaması<input data-variant="alt" value="${escapeHtml(variant.alt || '')}" /></label>
    </div><span class="variant-color-preview" style="--variant-color:${escapeHtml(variant.color || '#8b8177')}" aria-hidden="true"></span>`;
    wrapper.querySelector('[data-remove-variant]').addEventListener('click', () => { wrapper.remove(); updateVariantInterface(); markDirty(); });
    wrapper.querySelector('[data-pick-variant-image]').addEventListener('click', () => openAssetLibrary(wrapper.querySelector('[data-variant="image"]')));
    $('variantRows').append(wrapper);
    updateVariantInterface();
  }

  function openEditor(product = null) {
    state.editingId = product?.id || null;
    state.dirty = false;
    $('editorKicker').textContent = product ? 'MƏHSULU REDAKTƏ ET' : 'YENİ MƏHSUL';
    $('editorTitle').textContent = product?.name || 'Yeni məhsul';
    $('productId').value = product?.id || '';
    $('productId').disabled = Boolean(product);
    $('productCategory').value = product?.category || (state.category === 'all' ? 'coffee' : state.category);
    $('productName').value = product?.name || '';
    $('productPrice').value = product ? getCatalogPrice(product) : '';
    $('productUnit').value = product?.unit || 'g';
    $('productImage').value = product?.image || '';
    $('productDescription').value = product?.description || '';
    $('productActive').checked = product?.active ?? true;
    $('stockStatus').value = product?.stock?.status || 'available';
    $('stockQuantity').value = product?.stock?.quantity ?? 0;
    $('sortOrder').value = product?.sortOrder ?? state.products.filter((item) => item.category === (product?.category || 'coffee')).length + 1;
    $('productMeta').value = JSON.stringify(product?.meta || {}, null, 2);
    $('variantRows').innerHTML = '';
    (product?.variants || []).forEach(variantRow);
    updateVariantInterface();
    $('deleteProductButton').hidden = !product;
    $('validationSummary').hidden = true;
    setImagePreview(product?.image || '');
    $('editorBackdrop').hidden = false;
    $('productEditor').hidden = false;
    $('productEditor').setAttribute('aria-hidden', 'false');
  }

  function markDirty() { state.dirty = true; }
  function closeEditor(force = false) {
    if (!force && state.dirty && !window.confirm('Yadda saxlanılmamış dəyişikliklər silinsin?')) return;
    $('productEditor').hidden = true;
    $('editorBackdrop').hidden = true;
    $('productEditor').setAttribute('aria-hidden', 'true');
    state.editingId = null;
    state.dirty = false;
  }

  function collectProduct() {
    let meta;
    try { meta = JSON.parse($('productMeta').value || '{}'); }
    catch { throw new Error('Əlavə məlumat düzgün JSON formatında deyil.'); }
    const variants = [...$('variantRows').querySelectorAll('.variant-row')].map((row) => ({
      id: row.querySelector('[data-variant="id"]').value.trim(),
      name: row.querySelector('[data-variant="name"]').value.trim(),
      price: Number(row.querySelector('[data-variant="price"]').value),
      image: row.querySelector('[data-variant="image"]').value.trim(),
      color: row.querySelector('[data-variant="color"]').value.trim(),
      alt: row.querySelector('[data-variant="alt"]').value.trim(),
    }));
    return alignDefaultPrice({
      id: $('productId').value.trim(), category: $('productCategory').value, name: $('productName').value.trim(),
      price: Number($('productPrice').value), unit: $('productUnit').value, image: $('productImage').value.trim(),
      description: $('productDescription').value.trim(), active: $('productActive').checked,
      stock: { status: $('stockStatus').value, quantity: $('stockStatus').value === 'counted' ? Number($('stockQuantity').value) : null },
      sortOrder: Number($('sortOrder').value), meta, variants,
    });
  }

  function validateClient(product) {
    const errors = [];
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id)) errors.push('ID yalnız kiçik hərf, rəqəm və tire ilə yazılmalıdır.');
    if (!product.name) errors.push('Məhsul adı tələb olunur.');
    if (!Number.isFinite(product.price) || product.price < 0) errors.push('Qiymət düzgün deyil.');
    if (!product.image.startsWith('assets/') || product.image.includes('..')) errors.push('Şəkil assets/ qovluğundan seçilməlidir.');
    if (!Number.isFinite(product.sortOrder)) errors.push('Sıralama düzgün deyil.');
    if (product.stock.status === 'counted' && (!Number.isInteger(product.stock.quantity) || product.stock.quantity < 0)) errors.push('Stok sayı düzgün deyil.');
    product.variants.forEach((variant, index) => {
      if (!variant.id || !variant.name || !variant.image || !Number.isFinite(variant.price)) errors.push(`${index + 1}-ci variantın bütün sahələrini doldurun.`);
    });
    return errors;
  }

  async function saveProduct(event) {
    event.preventDefault();
    let product;
    try { product = collectProduct(); } catch (error) { return showValidation([error.message]); }
    const errors = validateClient(product);
    if (errors.length) return showValidation(errors);
    $('saveProductButton').disabled = true;
    try {
      if (state.editingId) await api.updateProduct(state.editingId, product); else await api.createProduct(product);
      $('appMessage').textContent = `${product.name} yadda saxlanıldı.`;
      closeEditor(true);
      await loadCatalog();
    } catch (error) {
      showValidation([error.message]);
    } finally { $('saveProductButton').disabled = false; }
  }

  function showValidation(errors) {
    $('validationSummary').innerHTML = `<strong>Məlumatları yoxlayın:</strong><ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul>`;
    $('validationSummary').hidden = false;
    $('validationSummary').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function renderAssets() {
    const query = $('assetSearch').value.trim().toLowerCase();
    $('assetGrid').innerHTML = state.assets.filter((asset) => !query || asset.toLowerCase().includes(query)).map((asset) =>
      `<button class="asset-item" type="button" data-asset="${escapeHtml(asset)}"><img src="../${escapeHtml(asset)}" alt="" loading="lazy" /><span>${escapeHtml(asset)}</span></button>`
    ).join('');
  }

  function openAssetLibrary(target) {
    state.assetTarget = target;
    $('assetUploadMessage').textContent = '';
    $('assetUploadMessage').classList.remove('error');
    $('assetSearch').value = '';
    renderAssets();
    assetDialog.showModal();
  }

  function selectAsset(asset) {
    const target = state.assetTarget || $('productImage');
    target.value = asset;
    if (target === $('productImage')) setImagePreview(asset);
    markDirty();
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(String(reader.result || '').split(',')[1] || ''));
      reader.addEventListener('error', () => reject(new Error('Şəkli oxumaq mümkün olmadı.')));
      reader.readAsDataURL(file);
    });
  }

  function inferUploadType(file) {
    if (file.type) return file.type;
    const extension = file.name.split('.').pop().toLowerCase();
    return ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' })[extension] || '';
  }

  async function uploadAsset(file) {
    const input = $('assetUpload');
    const message = $('assetUploadMessage');
    const type = inferUploadType(file);
    message.classList.remove('error');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
      message.textContent = 'Yalnız JPG, PNG və WebP şəkilləri qəbul olunur.';
      message.classList.add('error');
      input.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      message.textContent = 'Şəklin ölçüsü maksimum 8 MB ola bilər.';
      message.classList.add('error');
      input.value = '';
      return;
    }
    input.disabled = true;
    message.textContent = 'Şəkil yüklənir…';
    try {
      const result = await api.uploadAsset({ name: file.name, type, data: await fileToBase64(file) });
      state.assets = [result.path, ...state.assets.filter((asset) => asset !== result.path)];
      selectAsset(result.path);
      renderAssets();
      message.textContent = 'Şəkil əlavə edildi və məhsul üçün seçildi.';
    } catch (error) {
      message.textContent = error.message;
      message.classList.add('error');
    } finally {
      input.disabled = false;
      input.value = '';
    }
  }

  $('setupForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if ($('setupPassword').value !== $('setupPasswordConfirm').value) return $('authMessage').textContent = 'Şifrələr eyni deyil.';
    authenticate($('setupPassword').value);
  });
  $('loginForm').addEventListener('submit', (event) => { event.preventDefault(); authenticate($('loginPassword').value); });
  $('logoutButton').addEventListener('click', async () => { await api.logout(); showAuth(true); });
  $('categoryNav').addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]'); if (!button) return;
    state.category = button.dataset.category;
    document.querySelectorAll('.category-button').forEach((item) => item.classList.toggle('active', item === button));
    renderCatalog();
  });
  ['productSearch', 'activeFilter', 'stockFilter'].forEach((id) => $(id).addEventListener(id === 'productSearch' ? 'input' : 'change', renderCatalog));
  $('productTableBody').addEventListener('click', (event) => { const id = event.target.closest('[data-edit]')?.dataset.edit; if (id) openEditor(state.products.find((item) => item.id === id)); });
  $('newProductButton').addEventListener('click', () => openEditor());
  $('productForm').addEventListener('submit', saveProduct);
  $('productForm').addEventListener('input', markDirty);
  $('stockStatus').addEventListener('change', markDirty);
  $('stockQuantity').addEventListener('input', () => {
    if ($('stockStatus').value !== 'counted') $('stockStatus').value = 'counted';
    markDirty();
  });
  $('cancelEditButton').addEventListener('click', () => closeEditor());
  $('discardProductButton').addEventListener('click', () => closeEditor());
  $('editorBackdrop').addEventListener('click', () => closeEditor());
  $('addVariantButton').addEventListener('click', () => { variantRow(); markDirty(); $('variantRows').lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  $('openAssetPicker').addEventListener('click', () => openAssetLibrary($('productImage')));
  $('closeAssetDialog').addEventListener('click', () => $('assetDialog').close());
  $('assetSearch').addEventListener('input', renderAssets);
  $('assetUpload').addEventListener('change', (event) => { const file = event.target.files?.[0]; if (file) uploadAsset(file); });
  $('assetGrid').addEventListener('click', (event) => { const asset = event.target.closest('[data-asset]')?.dataset.asset; if (!asset) return; selectAsset(asset); $('assetDialog').close(); });
  assetDialog.addEventListener('close', () => { state.assetTarget = null; });
  $('deleteProductButton').addEventListener('click', () => { const product = state.products.find((item) => item.id === state.editingId); $('deleteProductName').textContent = product?.name || ''; deleteDialog.showModal(); });
  $('cancelDeleteButton').addEventListener('click', () => $('deleteDialog').close());
  $('confirmDeleteButton').addEventListener('click', async () => {
    try { await api.deleteProduct(state.editingId); $('deleteDialog').close(); closeEditor(true); $('appMessage').textContent = 'Məhsul silindi.'; await loadCatalog(); }
    catch (error) { $('deleteDialog').close(); showValidation([error.message]); }
  });
  window.addEventListener('beforeunload', (event) => { if (!state.dirty) return; event.preventDefault(); event.returnValue = ''; });
  boot();
})();
