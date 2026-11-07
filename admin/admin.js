(function () {
  'use strict';
  const api = createAdminApi();
  const $ = (id) => document.getElementById(id);
  const EMPTY_STATE_CLASS = 'empty-state';
  const assetDialog = $('assetDialog');
  const deleteDialog = $('deleteDialog');
  const imageColorDialog = $('imageColorDialog');
  const state = { products: [], assets: [], category: 'all', editingId: null, dirty: false, assetTarget: null, idManuallyEdited: false };
  const categoryNames = { coffee: 'Qəhvə', tea: 'Çay', equipment: 'Avadanlıq / Fincan' };
  const catalogTitles = { all: 'Bütün məhsullar', coffee: 'Qəhvələr', tea: 'Çaylar', equipment: 'Avadanlıq və Fincanlar' };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function slugify(text) {
    const map = { 'ə': 'e', 'Ə': 'e', 'ı': 'i', 'I': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o', 'ü': 'u', 'Ü': 'u', 'ş': 's', 'Ş': 's', 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g' };
    return String(text || '')
      .replace(/[əƏıIİöÖüÜşŞçÇğĞ]/g, (m) => map[m] || m)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
      showAuth(true, 'Serverə qoşulmaq mümkün olmadı. Lokal serverin və ya şəbəkə bağlantısının işlədiyini yoxlayın.');
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
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, 'az'));
  }

  function renderCatalog() {
    const counts = { all: state.products.length, coffee: 0, tea: 0, equipment: 0 };
    state.products.forEach((item) => {
      if (counts[item.category] !== undefined) counts[item.category] += 1;
    });
    $('countAll').textContent = counts.all;
    $('countCoffee').textContent = counts.coffee;
    $('countTea').textContent = counts.tea;
    $('countEquipment').textContent = counts.equipment;
    $('catalogTitle').textContent = catalogTitles[state.category] || 'Məhsullar';

    const products = filteredProducts();
    $('emptyState').hidden = products.length > 0;
    $('productTableBody').innerHTML = products.map((item) => {
      const price = isProductPricePending(item) ? 'Mağazada' : `${getCatalogPrice(item).toFixed(2)} ₼`;
      const stock = item.stock.status === 'counted' ? `${item.stock.quantity} ədəd` : item.stock.status === 'out' ? 'Bitib' : 'Mövcuddur';
      return `<tr data-id="${escapeHtml(item.id)}">
        <td data-label="Məhsul">
          <div class="product-cell">
            <img src="../${escapeHtml(item.image)}" alt="" loading="lazy" />
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <small>${escapeHtml(item.id)}</small>
            </div>
          </div>
        </td>
        <td data-label="Kateqoriya"><span class="tag">${categoryNames[item.category] || item.category}</span></td>
        <td data-label="Qiymət"><strong class="price-val">${price}</strong></td>
        <td data-label="Stok"><span class="status-pill ${item.stock.status === 'out' ? 'out' : ''}">${stock}</span></td>
        <td data-label="Status"><span class="status-pill ${item.active ? '' : 'inactive'}">${item.active ? 'Aktiv' : 'Gizli'}</span></td>
        <td data-label="Əməliyyat">
          <div class="action-btn-group">
            <button class="row-edit" type="button" data-edit="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.name)} məhsulunu redaktə et" title="Düzəliş et">✏️ Düzəliş</button>
            <button class="row-delete" type="button" data-delete="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.name)} məhsulunu sil" title="Sil">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  function setImagePreview(src) {
    $('imagePreview').innerHTML = src ? `<img src="../${escapeHtml(src)}" alt="Seçilmiş məhsul şəkli" />` : '<div class="no-img">📷 Şəkil seçilməyib</div>';
    if ($('imageStatusMessage')) {
      $('imageStatusMessage').textContent = src ? 'Seçildi: ' + src : '';
    }
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

  function extractDominantColors(imagePath, callback, maxCount = 6) {
    if (!imagePath) return callback([]);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size).data;
        const colorBuckets = new Map();
        for (let i = 0; i < imgData.length; i += 4) {
          const a = imgData[i + 3];
          if (a < 128) continue;
          const r = Math.round(imgData[i] / 24) * 24;
          const g = Math.round(imgData[i + 1] / 24) * 24;
          const b = Math.round(imgData[i + 2] / 24) * 24;
          const key = `${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)}`;
          colorBuckets.set(key, (colorBuckets.get(key) || 0) + 1);
        }
        const sorted = [...colorBuckets.entries()].sort((a, b) => b[1] - a[1]);
        const result = [];
        for (const [key] of sorted) {
          const [r, g, b] = key.split(',').map(Number);
          const hex = '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
          if (!result.includes(hex)) result.push(hex);
          if (result.length >= maxCount) break;
        }
        callback(result);
      } catch {
        callback([]);
      }
    };
    img.onerror = () => callback([]);
    img.src = imagePath.startsWith('http') || imagePath.startsWith('/') || imagePath.startsWith('../') ? imagePath : `../${imagePath}`;
  }

  let activeColorPickerCallback = null;
  let pickerHoveredHex = '#8b8177';

  function openImageColorPicker(imagePath, onPick) {
    activeColorPickerCallback = onPick;
    const canvas = $('imageColorCanvas');
    const ctx = canvas.getContext('2d');
    const palette = $('imageColorPalette');
    const loupe = $('imageColorLoupe');
    const badge = $('pickedColorBadge');
    const hexLabel = $('pickedColorHex');

    palette.innerHTML = '<span style="font-size:11px;color:var(--muted);">Rənglər aşkar edilir…</span>';
    loupe.hidden = true;
    pickerHoveredHex = '#8b8177';
    badge.style.background = pickerHoveredHex;
    hexLabel.textContent = pickerHoveredHex;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth || 500;
      canvas.height = img.naturalHeight || 500;
      ctx.drawImage(img, 0, 0);

      extractDominantColors(imagePath, (colors) => {
        if (!colors.length) {
          palette.innerHTML = '<span style="font-size:11px;color:var(--muted);">Şəkil üzərinə klikləyərək rəngi seçin</span>';
          return;
        }
        palette.innerHTML = colors.map((c) =>
          `<button type="button" class="detected-swatch" data-hex="${c}" style="background:${c};" title="Aşkar edilmiş rəng: ${c}"></button>`
        ).join('');
      });
    };
    img.src = imagePath.startsWith('http') || imagePath.startsWith('/') || imagePath.startsWith('../') ? imagePath : `../${imagePath}`;

    imageColorDialog.showModal();
  }

  function variantRow(variant = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'variant-row';
    const initialColor = variant.color || '#8b8177';
    const initialSize = variant.size || '';

    wrapper.innerHTML = `<div class="variant-row-heading">
      <div>
        <strong>Variant <span data-variant-number></span></strong>
        <span class="variant-auto-hint"> · Ad və ID məhsulla eyni (avtomatik)</span>
      </div>
      <button type="button" data-remove-variant>✕ Variantı sil</button>
    </div>
    <input type="hidden" data-variant="id" value="${escapeHtml(variant.id || '')}" />
    <input type="hidden" data-variant="name" value="${escapeHtml(variant.name || '')}" />
    <div class="variant-price-row">
      <label>Qiymət, AZN <span class="required">*</span>
        <input data-variant="price" type="number" min="0" step="0.01" value="${escapeHtml(variant.price ?? '')}" placeholder="0.00" />
      </label>
    </div>

    <!-- Ölçü Seçimi Bölməsi -->
    <div class="variant-size-block">
      <div class="variant-size-header">
        <label>Ölçü / Həcm</label>
        <div class="variant-quick-sizes">
          <span class="quick-size-label">Sürətli:</span>
          <button type="button" class="size-chip" data-size-val="100 qr">100 qr</button>
          <button type="button" class="size-chip" data-size-val="250 qr">250 qr</button>
          <button type="button" class="size-chip" data-size-val="500 qr">500 qr</button>
          <button type="button" class="size-chip" data-size-val="1 kq">1 kq</button>
          <button type="button" class="size-chip" data-size-val="250 ml">250 ml</button>
          <button type="button" class="size-chip" data-size-val="350 ml">350 ml</button>
          <button type="button" class="size-chip" data-size-val="600 ml">600 ml</button>
          <button type="button" class="size-chip" data-size-val="850 ml">850 ml</button>
          <button type="button" class="size-chip" data-size-val="S">S</button>
          <button type="button" class="size-chip" data-size-val="M">M</button>
          <button type="button" class="size-chip" data-size-val="L">L</button>
          <button type="button" class="size-chip" data-size-val="Standart">Standart</button>
        </div>
      </div>
      <input data-variant="size" value="${escapeHtml(initialSize)}" placeholder="Ölçü seçin və ya sərbəst yazın (məs: 250 qr, 600 ml, 54 mm)" />
    </div>

    <!-- Variant Şəkli -->
    <div class="variant-image-field">
      <label>Variant şəkli<input data-variant="image" value="${escapeHtml(variant.image || '')}" readonly placeholder="Şəkil seçilməyib" /></label>
      <button type="button" data-pick-variant-image>🖼️ Şəkil seç</button>
    </div>

    <!-- Rəng Seçimi, Palet və Pipetka Bölməsi -->
    <div class="variant-color-block">
      <div class="variant-row-grid variant-row-meta">
        <div class="color-field-wrap">
          <label>Rəng kodu</label>
          <div class="color-inputs-bar">
            <input data-variant="color" value="${escapeHtml(initialColor)}" placeholder="#8b8177" />
            <label class="color-picker-trigger" title="Rəng palitrasını aç">
              <input type="color" data-variant="native-color" value="${escapeHtml(initialColor.startsWith('#') && initialColor.length === 7 ? initialColor : '#8b8177')}" />
              <span class="color-swatch-badge" style="background:${escapeHtml(initialColor)};"></span>
            </label>
            <button type="button" class="eyedropper-btn" data-eyedropper title="Şəkilin üzərindən və ya ekrandan rəng götür (Pipetka)">
              💉 Şəkildən götür
            </button>
          </div>
        </div>
        <label class="variant-alt">Şəkil açıqlaması<input data-variant="alt" value="${escapeHtml(variant.alt || '')}" placeholder="Məhsul təsviri" /></label>
      </div>

      <!-- Hazır Rəng Paleti (Preset Swatches) -->
      <div class="variant-palette-strip">
        <span class="palette-strip-title">Hazır palet:</span>
        <div class="preset-color-swatches">
          <button type="button" class="preset-swatch" data-preset="#1a1a1a" data-name="Qara" title="Qara (#1a1a1a)" style="background:#1a1a1a;"></button>
          <button type="button" class="preset-swatch" data-preset="#242321" data-name="Mat qara" title="Mat qara (#242321)" style="background:#242321;"></button>
          <button type="button" class="preset-swatch" data-preset="#3b271d" data-name="Tünd espresso" title="Tünd espresso (#3b271d)" style="background:#3b271d;"></button>
          <button type="button" class="preset-swatch" data-preset="#5c3a21" data-name="Qəhvəyi" title="Qəhvəyi (#5c3a21)" style="background:#5c3a21;"></button>
          <button type="button" class="preset-swatch" data-preset="#7a563d" data-name="Taxta" title="Taxta (#7a563d)" style="background:#7a563d;"></button>
          <button type="button" class="preset-swatch" data-preset="#a9703e" data-name="Mis" title="Mis (#a9703e)" style="background:#a9703e;"></button>
          <button type="button" class="preset-swatch" data-preset="#b18a45" data-name="Bürünc" title="Bürünc (#b18a45)" style="background:#b18a45;"></button>
          <button type="button" class="preset-swatch" data-preset="#d4af37" data-name="Qızılı" title="Qızılı (#d4af37)" style="background:#d4af37;"></button>
          <button type="button" class="preset-swatch" data-preset="#c6c5c0" data-name="Gümüşü" title="Gümüşü (#c6c5c0)" style="background:#c6c5c0;"></button>
          <button type="button" class="preset-swatch" data-preset="#8f8982" data-name="Titan" title="Titan (#8f8982)" style="background:#8f8982;"></button>
          <button type="button" class="preset-swatch" data-preset="#e8d8c8" data-name="Krem" title="Krem (#e8d8c8)" style="background:#e8d8c8;"></button>
          <button type="button" class="preset-swatch" data-preset="#ffffff" data-name="Ağ" title="Ağ (#ffffff)" style="background:#ffffff;border:1px solid #ccc;"></button>
          <button type="button" class="preset-swatch" data-preset="#b22222" data-name="Qırmızı" title="Qırmızı (#b22222)" style="background:#b22222;"></button>
          <button type="button" class="preset-swatch" data-preset="#2d5a27" data-name="Yaşıl" title="Yaşıl (#2d5a27)" style="background:#2d5a27;"></button>
          <button type="button" class="preset-swatch" data-preset="#1e3f66" data-name="Göy" title="Göy (#1e3f66)" style="background:#1e3f66;"></button>
        </div>
      </div>

      <!-- Şəkildən Avtomatik Aşkar Edilən Rənglər -->
      <div class="variant-extracted-strip" hidden>
        <span class="palette-strip-title">Şəkildən rənglər:</span>
        <div class="extracted-color-swatches"></div>
      </div>
    </div>
    <span class="variant-color-preview" style="--variant-color:${escapeHtml(initialColor)}" aria-hidden="true"></span>`;

    const colorInput = wrapper.querySelector('[data-variant="color"]');
    const nativeColor = wrapper.querySelector('[data-variant="native-color"]');
    const colorBadge = wrapper.querySelector('.color-swatch-badge');
    const colorPreview = wrapper.querySelector('.variant-color-preview');
    const sizeInput = wrapper.querySelector('[data-variant="size"]');
    const nameInput = wrapper.querySelector('[data-variant="name"]');
    const idInput = wrapper.querySelector('[data-variant="id"]');
    const imageInput = wrapper.querySelector('[data-variant="image"]');

    function applyColor(hex) {
      if (!hex) return;
      const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
      colorInput.value = cleanHex;
      if (cleanHex.length === 7) nativeColor.value = cleanHex;
      colorBadge.style.background = cleanHex;
      colorPreview.style.setProperty('--variant-color', cleanHex);
      markDirty();
    }

    colorInput.addEventListener('input', () => {
      const val = colorInput.value.trim();
      if (/^#[0-9a-f]{6}$/i.test(val)) nativeColor.value = val;
      colorBadge.style.background = val;
      colorPreview.style.setProperty('--variant-color', val);
      markDirty();
    });

    nativeColor.addEventListener('input', () => {
      applyColor(nativeColor.value);
    });

    wrapper.querySelector('.preset-color-swatches').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-preset]');
      if (!btn) return;
      applyColor(btn.dataset.preset);
    });

    wrapper.querySelector('.variant-quick-sizes').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-size-val]');
      if (!chip) return;
      const sizeVal = chip.dataset.sizeVal;
      sizeInput.value = sizeVal;
      wrapper.querySelectorAll('.size-chip').forEach((c) => c.classList.toggle('active', c === chip));
      markDirty();
    });

    sizeInput.addEventListener('input', markDirty);

    const eyedropperBtn = wrapper.querySelector('[data-eyedropper]');
    eyedropperBtn.addEventListener('click', async () => {
      if (window.EyeDropper) {
        try {
          const dropper = new EyeDropper();
          const result = await dropper.open();
          if (result?.sRGBHex) {
            applyColor(result.sRGBHex.toLowerCase());
            return;
          }
        } catch (err) {
          if (err.name === 'AbortError') return;
        }
      }

      const targetImg = imageInput.value.trim() || $('productImage').value.trim();
      if (!targetImg) {
        alert('Şəkildən rəng götürmək üçün əvvəlcə variant və ya məhsul şəkli seçin.');
        return;
      }
      openImageColorPicker(targetImg, (pickedColor) => {
        applyColor(pickedColor);
      });
    });

    function loadVariantExtractedColors(imgPath) {
      if (!imgPath) return;
      const container = wrapper.querySelector('.extracted-color-swatches');
      const strip = wrapper.querySelector('.variant-extracted-strip');
      extractDominantColors(imgPath, (colors) => {
        if (colors.length) {
          container.innerHTML = colors.map((c) =>
            `<button type="button" class="extracted-swatch" data-preset="${c}" style="background:${c};" title="Şəkildən rəng: ${c}"></button>`
          ).join('');
          strip.hidden = false;
        } else {
          strip.hidden = true;
        }
      });
    }

    wrapper.querySelector('.extracted-color-swatches').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-preset]');
      if (!btn) return;
      applyColor(btn.dataset.preset);
    });

    if (variant.image) {
      loadVariantExtractedColors(variant.image);
    }

    wrapper.querySelector('[data-remove-variant]').addEventListener('click', () => { wrapper.remove(); updateVariantInterface(); markDirty(); });
    wrapper.querySelector('[data-pick-variant-image]').addEventListener('click', () => openAssetLibrary(imageInput));
    $('variantRows').append(wrapper);
    updateVariantInterface();
  }

  function openEditor(product = null) {
    state.editingId = product?.id || null;
    state.dirty = false;
    state.idManuallyEdited = Boolean(product);
    $('editorKicker').textContent = product ? 'MƏHSULU REDAKTƏ ET' : 'YENİ MƏHSUL';
    $('editorTitle').textContent = product?.name || 'Yeni məhsul əlavə et';
    $('productId').value = product?.id || '';
    $('productId').disabled = Boolean(product);
    $('productCategory').value = product?.category || (state.category === 'all' ? 'equipment' : state.category);
    $('productName').value = product?.name || '';
    $('productPrice').value = product ? getCatalogPrice(product) : '';
    $('productUnit').value = product?.unit || (product?.category === 'equipment' ? 'piece' : 'g');
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
    setTimeout(() => $('productName').focus(), 50);
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
    let meta = {};
    try {
      meta = JSON.parse($('productMeta').value || '{}');
    } catch {
      meta = {};
    }

    // Auto-generate ID if empty
    let id = $('productId').value.trim();
    if (!id && $('productName').value.trim()) {
      id = slugify($('productName').value.trim());
      $('productId').value = id;
    }
    if (!id) {
      id = 'mehsul-' + Date.now();
      $('productId').value = id;
    }

    // Default sort order if empty
    let sortOrder = Number($('sortOrder').value);
    if (!Number.isFinite(sortOrder)) {
      sortOrder = state.products.length + 1;
      $('sortOrder').value = sortOrder;
    }

    const prodName = $('productName').value.trim() || 'Məhsul';
    const prodId = id || slugify(prodName) || 'mehsul';
    const seenVarIds = new Set();

    const variants = [...$('variantRows').querySelectorAll('.variant-row')].map((row, index) => {
      const size = row.querySelector('[data-variant="size"]')?.value.trim() || undefined;
      const colorVal = row.querySelector('[data-variant="color"]')?.value.trim() || '#8b8177';
      const price = Number(row.querySelector('[data-variant="price"]').value);
      const image = row.querySelector('[data-variant="image"]').value.trim() || $('productImage').value.trim() || 'assets/catalog/fincan.jpg';

      let varName = row.querySelector('[data-variant="name"]')?.value.trim();
      if (!varName) varName = prodName;

      let varId = row.querySelector('[data-variant="id"]')?.value.trim();
      if (!varId || varId === prodId) {
        const sizeSlug = size ? slugify(size) : '';
        const colorSlug = colorVal && colorVal !== '#8b8177' ? slugify(colorVal.replace('#', 'c-')) : '';
        const suffix = [sizeSlug, colorSlug].filter(Boolean).join('-') || `v${index + 1}`;
        varId = `${prodId}-${suffix}`.replace(/--+/g, '-');
      }

      let finalId = varId;
      if (seenVarIds.has(finalId)) {
        finalId = `${finalId}-${index + 1}`;
      }
      seenVarIds.add(finalId);

      return {
        id: finalId,
        name: varName,
        size,
        price,
        image,
        color: row.querySelector('[data-variant="color"]').value.trim() || '#8b8177',
        alt: row.querySelector('[data-variant="alt"]').value.trim() || '',
      };
    });

    return alignDefaultPrice({
      id,
      category: $('productCategory').value,
      name: $('productName').value.trim(),
      price: Number($('productPrice').value),
      unit: $('productUnit').value,
      image: $('productImage').value.trim() || 'assets/catalog/fincan.jpg',
      description: $('productDescription').value.trim(),
      active: $('productActive').checked,
      stock: {
        status: $('stockStatus').value,
        quantity: $('stockStatus').value === 'counted' ? Number($('stockQuantity').value) : null,
      },
      sortOrder,
      meta,
      variants,
    });
  }

  function validateClient(product) {
    const errors = [];
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id)) {
      errors.push('Məhsul ID-si yalnız kiçik ingilis hərfləri, rəqəmlər və tire ilə olmalıdır.');
    }
    if (!product.name) errors.push('Məhsul adı tələb olunur.');
    if (!Number.isFinite(product.price) || product.price < 0) errors.push('Məhsul qiyməti düzgün deyil.');
    if (!product.image || !product.image.startsWith('assets/') || product.image.includes('..')) {
      errors.push('Zəhmət olmasa məhsul üçün şəkil seçin və ya kompüterdən yükləyin.');
    }
    if (!Number.isFinite(product.sortOrder)) errors.push('Sıralama rəqəmi düzgün deyil.');
    if (product.stock.status === 'counted' && (!Number.isInteger(product.stock.quantity) || product.stock.quantity < 0)) {
      errors.push('Stok sayı müsbət tam ədəd olmalıdır.');
    }
    product.variants.forEach((variant, index) => {
      if (!variant.image || !Number.isFinite(variant.price) || variant.price < 0) {
        errors.push(`${index + 1}-ci variantın qiymət və şəkil sahələrini doldurun.`);
      }
    });
    return errors;
  }

  async function saveProduct(event) {
    event.preventDefault();
    let product;
    try {
      product = collectProduct();
    } catch (error) {
      return showValidation([error.message]);
    }
    const errors = validateClient(product);
    if (errors.length) return showValidation(errors);

    $('saveProductButton').disabled = true;
    $('saveProductButton').textContent = 'Yadda saxlanılır…';
    try {
      if (state.editingId) {
        await api.updateProduct(state.editingId, product);
        $('appMessage').textContent = `✅ "${product.name}" uğurla yeniləndi və saxlanıldı.`;
      } else {
        await api.createProduct(product);
        $('appMessage').textContent = `✅ Yeni məhsul "${product.name}" uğurla əlavə edildi.`;
      }
      closeEditor(true);
      await loadCatalog();
    } catch (error) {
      if (error.status === 401 || /authentication required/i.test(error.message)) {
        const pass = window.prompt('⚠️ Sessiyanızın vaxtı bitib. Zəhmət olmasa admin şifrəsini daxil edin (məlumatlar itməyəcək və məhsul dərhal saxlanılacaq):');
        if (pass) {
          try {
            await api.login(pass);
            if (state.editingId) {
              await api.updateProduct(state.editingId, product);
              $('appMessage').textContent = `✅ "${product.name}" uğurla yeniləndi və saxlanıldı.`;
            } else {
              await api.createProduct(product);
              $('appMessage').textContent = `✅ Yeni məhsul "${product.name}" uğurla əlavə edildi.`;
            }
            closeEditor(true);
            await loadCatalog();
            return;
          } catch (loginErr) {
            showValidation(['Giriş uğursuz oldu: ' + (loginErr.message || 'Şifrə yanlışdır') + '. Zəhmət olmasa yenidən cəhd edin.']);
            return;
          }
        } else {
          showValidation(['Sessiyanız bitib. Zəhmət olmasa admin şifrəsi ilə daxil olun.']);
          return;
        }
      }
      showValidation([error.message]);
    } finally {
      $('saveProductButton').disabled = false;
      $('saveProductButton').textContent = 'Yadda saxla';
    }
  }

  function showValidation(errors) {
    $('validationSummary').innerHTML = `<strong>Zəhmət olmasa xətaları düzəldin:</strong><ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul>`;
    $('validationSummary').hidden = false;
    $('validationSummary').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function renderAssets() {
    const query = $('assetSearch').value.trim().toLowerCase();
    $('assetGrid').innerHTML = state.assets.filter((asset) => !query || asset.toLowerCase().includes(query)).map((asset) =>
      `<button class="asset-item" type="button" data-asset="${escapeHtml(asset)}">
        <img src="../${escapeHtml(asset)}" alt="" loading="lazy" />
        <span>${escapeHtml(asset.split('/').pop())}</span>
      </button>`
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
    const row = target.closest?.('.variant-row');
    if (row) {
      const container = row.querySelector('.extracted-color-swatches');
      const strip = row.querySelector('.variant-extracted-strip');
      if (container && strip) {
        extractDominantColors(asset, (colors) => {
          if (colors.length) {
            container.innerHTML = colors.map((c) =>
              `<button type="button" class="extracted-swatch" data-preset="${c}" style="background:${c};" title="Şəkildən rəng: ${c}"></button>`
            ).join('');
            strip.hidden = false;
          } else {
            strip.hidden = true;
          }
        });
      }
    }
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
    const message = $('assetUploadMessage');
    const statusMsg = $('imageStatusMessage');
    const type = inferUploadType(file);

    if (message) {
      message.classList.remove('error');
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
      const text = 'Yalnız JPG, PNG və WebP şəkilləri qəbul olunur.';
      if (message) { message.textContent = text; message.classList.add('error'); }
      if (statusMsg) { statusMsg.textContent = text; statusMsg.style.color = 'var(--danger)'; }
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      const text = 'Şəklin ölçüsü maksimum 8 MB ola bilər.';
      if (message) { message.textContent = text; message.classList.add('error'); }
      if (statusMsg) { statusMsg.textContent = text; statusMsg.style.color = 'var(--danger)'; }
      return;
    }

    if (message) message.textContent = 'Şəkil yüklənir…';
    if (statusMsg) { statusMsg.textContent = 'Şəkil yüklənir…'; statusMsg.style.color = 'var(--green)'; }

    try {
      const result = await api.uploadAsset({ name: file.name, type, data: await fileToBase64(file) });
      state.assets = [result.path, ...state.assets.filter((asset) => asset !== result.path)];
      selectAsset(result.path);
      renderAssets();
      if (message) message.textContent = '✅ Şəkil əlavə edildi və seçildi.';
      if (statusMsg) { statusMsg.textContent = '✅ Şəkil yükləndi: ' + result.path.split('/').pop(); statusMsg.style.color = 'var(--green)'; }
    } catch (error) {
      if (error.status === 401 || /authentication required/i.test(error.message)) {
        const pass = window.prompt('⚠️ Sessiyanızın vaxtı bitib. Şəkli yükləmək üçün admin şifrəsini daxil edin:');
        if (pass) {
          try {
            await api.login(pass);
            return await uploadAsset(file);
          } catch (loginErr) {
            alert('Şifrə yanlışdır: ' + (loginErr.message || 'Giriş uğursuz'));
            return;
          }
        }
      }
      if (message) { message.textContent = error.message; message.classList.add('error'); }
      if (statusMsg) { statusMsg.textContent = 'Xəta: ' + error.message; statusMsg.style.color = 'var(--danger)'; }
    }
  }

  // Event Listeners
  $('setupForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if ($('setupPassword').value !== $('setupPasswordConfirm').value) return $('authMessage').textContent = 'Şifrələr eyni deyil.';
    authenticate($('setupPassword').value);
  });
  $('loginForm').addEventListener('submit', (event) => { event.preventDefault(); authenticate($('loginPassword').value); });
  $('logoutButton').addEventListener('click', async () => { await api.logout(); showAuth(true); });

  $('categoryNav').addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    document.querySelectorAll('.category-button').forEach((item) => item.classList.toggle('active', item === button));
    renderCatalog();
  });

  ['productSearch', 'activeFilter', 'stockFilter'].forEach((id) => $(id).addEventListener(id === 'productSearch' ? 'input' : 'change', renderCatalog));

  // Table clicks: Edit & Delete
  $('productTableBody').addEventListener('click', (event) => {
    const editBtn = event.target.closest('[data-edit]');
    if (editBtn) {
      openEditor(state.products.find((item) => item.id === editBtn.dataset.edit));
      return;
    }
    const deleteBtn = event.target.closest('[data-delete]');
    if (deleteBtn) {
      const product = state.products.find((item) => item.id === deleteBtn.dataset.delete);
      if (product) {
        state.editingId = product.id;
        $('deleteProductName').textContent = product.name;
        deleteDialog.showModal();
      }
    }
  });

  $('newProductButton').addEventListener('click', () => openEditor());

  // Auto slugify name to ID when typing product name
  $('productName').addEventListener('input', () => {
    markDirty();
    if (!state.editingId && !state.idManuallyEdited) {
      $('productId').value = slugify($('productName').value);
    }
  });
  $('productId').addEventListener('input', () => {
    state.idManuallyEdited = true;
    markDirty();
  });

  $('productForm').addEventListener('submit', saveProduct);
  $('productForm').addEventListener('input', markDirty);
  $('stockStatus').addEventListener('change', markDirty);
  $('stockQuantity').addEventListener('input', () => {
    if ($('stockStatus').value !== 'counted') $('stockStatus').value = 'counted';
    markDirty();
  });

  // Category switch can auto-select sensible units
  $('productCategory').addEventListener('change', () => {
    markDirty();
    const cat = $('productCategory').value;
    if (cat === 'equipment') {
      $('productUnit').value = 'piece';
    } else {
      $('productUnit').value = 'g';
    }
  });

  $('cancelEditButton').addEventListener('click', () => closeEditor());
  $('discardProductButton').addEventListener('click', () => closeEditor());
  $('editorBackdrop').addEventListener('click', () => closeEditor());
  $('addVariantButton').addEventListener('click', () => {
    variantRow();
    markDirty();
    $('variantRows').lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  $('openAssetPicker').addEventListener('click', () => openAssetLibrary($('productImage')));
  $('closeAssetDialog').addEventListener('click', () => $('assetDialog').close());
  $('assetSearch').addEventListener('input', renderAssets);

  // Direct upload from editor
  const directUploadInput = $('directImageUpload');
  if (directUploadInput) {
    directUploadInput.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (file) {
        uploadAsset(file);
        event.target.value = '';
      }
    });
  }

  // Upload from library modal
  $('assetUpload').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAsset(file);
      event.target.value = '';
    }
  });

  $('assetGrid').addEventListener('click', (event) => {
    const asset = event.target.closest('[data-asset]')?.dataset.asset;
    if (!asset) return;
    selectAsset(asset);
    $('assetDialog').close();
  });
  assetDialog.addEventListener('close', () => { state.assetTarget = null; });

  $('deleteProductButton').addEventListener('click', () => {
    const product = state.products.find((item) => item.id === state.editingId);
    $('deleteProductName').textContent = product?.name || '';
    deleteDialog.showModal();
  });
  $('cancelDeleteButton').addEventListener('click', () => $('deleteDialog').close());
  $('confirmDeleteButton').addEventListener('click', async () => {
    try {
      await api.deleteProduct(state.editingId);
      $('deleteDialog').close();
      closeEditor(true);
      $('appMessage').textContent = '✅ Məhsul saytdan və bazadan silindi.';
      await loadCatalog();
    } catch (error) {
      if (error.status === 401 || /authentication required/i.test(error.message)) {
        const pass = window.prompt('⚠️ Sessiyanızın vaxtı bitib. Məhsulu silmək üçün admin şifrəsini daxil edin:');
        if (pass) {
          try {
            await api.login(pass);
            await api.deleteProduct(state.editingId);
            $('deleteDialog').close();
            closeEditor(true);
            $('appMessage').textContent = '✅ Məhsul saytdan və bazadan silindi.';
            await loadCatalog();
            return;
          } catch (loginErr) {
            alert('Şifrə yanlışdır: ' + (loginErr.message || 'Giriş uğursuz'));
            return;
          }
        }
      }
      $('deleteDialog').close();
      showValidation([error.message]);
    }
  });

  const changePasswordBtn = $('changePasswordBtn');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', async () => {
      const newPass = window.prompt('Admin panel üçün yeni şifrə daxil edin (minimum 12 simvol):', 'Farman11052008');
      if (!newPass) return;
      if (newPass.length < 12) {
        alert('Şifrə ən azı 12 simvol olmalıdır!');
        return;
      }
      try {
        const res = await fetch('/api/admin/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword: newPass }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Şifrəni dəyişmək mümkün olmadı.');
        alert('✅ Şifrə uğurla dəyişdirildi!\nYeni şifrə: ' + newPass);
      } catch (err) {
        alert('❌ Xəta: ' + err.message);
      }
    });
  }

  if ($('imageColorCanvas')) {
    const colorCanvas = $('imageColorCanvas');
    const colorCtx = colorCanvas.getContext('2d');
    const colorLoupe = $('imageColorLoupe');
    const loupePrev = $('loupePreview');
    const loupeTxt = $('loupeHex');
    const colorBadge = $('pickedColorBadge');
    const hexTxt = $('pickedColorHex');

    function getPointHex(e) {
      const rect = colorCanvas.getBoundingClientRect();
      const scaleX = colorCanvas.width / (rect.width || 1);
      const scaleY = colorCanvas.height / (rect.height || 1);
      const x = Math.max(0, Math.min(colorCanvas.width - 1, Math.floor((e.clientX - rect.left) * scaleX)));
      const y = Math.max(0, Math.min(colorCanvas.height - 1, Math.floor((e.clientY - rect.top) * scaleY)));
      const p = colorCtx.getImageData(x, y, 1, 1).data;
      return '#' + [p[0], p[1], p[2]].map((c) => c.toString(16).padStart(2, '0')).join('');
    }

    colorCanvas.addEventListener('mousemove', (e) => {
      try {
        const hex = getPointHex(e);
        pickerHoveredHex = hex;
        colorLoupe.style.left = `${e.offsetX}px`;
        colorLoupe.style.top = `${e.offsetY}px`;
        loupePrev.style.background = hex;
        loupeTxt.textContent = hex;
        colorLoupe.hidden = false;
      } catch {}
    });

    colorCanvas.addEventListener('mouseleave', () => { colorLoupe.hidden = true; });

    colorCanvas.addEventListener('click', (e) => {
      try {
        const hex = getPointHex(e);
        pickerHoveredHex = hex;
        colorBadge.style.background = hex;
        hexTxt.textContent = hex;
      } catch {}
    });

    $('imageColorPalette').addEventListener('click', (e) => {
      const swatch = e.target.closest('[data-hex]');
      if (!swatch) return;
      pickerHoveredHex = swatch.dataset.hex;
      colorBadge.style.background = pickerHoveredHex;
      hexTxt.textContent = pickerHoveredHex;
    });

    $('confirmPickedColorBtn').addEventListener('click', () => {
      if (activeColorPickerCallback && pickerHoveredHex) {
        activeColorPickerCallback(pickerHoveredHex);
      }
      imageColorDialog.close();
    });

    $('closeImageColorDialog').addEventListener('click', () => imageColorDialog.close());
  }

  window.addEventListener('beforeunload', (event) => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  boot();
})();
