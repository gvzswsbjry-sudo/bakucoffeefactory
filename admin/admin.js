(function () {
  'use strict';
  const api = createAdminApi();
  const $ = (id) => document.getElementById(id);
  const EMPTY_STATE_CLASS = 'empty-state';
  const assetDialog = $('assetDialog');
  const deleteDialog = $('deleteDialog');
  const imageColorDialog = $('imageColorDialog');
  const menuDrinksApi = window.BCF_MENU_DRINKS || {
    MENU_DRINKS: [],
    DEFAULT_DAILY_DISCOUNT_SETTINGS: { enabled: true, itemKey: 'latte', discountPercent: 50, image: 'assets/menu/daily-latte.jpg', customNote: '' },
    getMenuDrinkByKey: () => null,
    computeDailyDiscountPrices: () => [],
    resolveDailyDiscountConfig: (v) => v,
  };
  const state = {
    products: [],
    assets: [],
    category: 'all',
    view: 'catalog',
    editingId: null,
    dirty: false,
    assetTarget: null,
    idManuallyEdited: false,
    dailyFilter: 'all',
    dailyDiscount: menuDrinksApi.resolveDailyDiscountConfig(menuDrinksApi.DEFAULT_DAILY_DISCOUNT_SETTINGS),
  };
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
      populateDailyDrinkSelect();
      await loadCatalog();
      await loadDashboardSummary();
      if (window.location.hash === '#daily-discount') {
        switchAdminView('daily-discount');
      }
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
      updateQuickCatalogStats();
    } catch (error) {
      if (error.status === 401) return showAuth(true, 'Sessiya bitib. Yenidən daxil olun.');
      $('appMessage').textContent = 'Şəbəkə və ya server xətası: ' + error.message;
    }
  }

  function updateQuickCatalogStats() {
    const coffeeCount = state.products.filter((item) => item.category === 'coffee' && item.active !== false).length;
    if ($('quickCoffeeProfilesCount')) {
      $('quickCoffeeProfilesCount').textContent = `${coffeeCount} aktiv qəhvə`;
    }
  }

  async function loadDashboardSummary() {
    const [discountRes, ordersRes, analyticsRes] = await Promise.allSettled([
      api.getMenuDiscount(),
      api.listOrders(),
      api.getAnalytics(),
    ]);

    if (discountRes.status === 'fulfilled' && discountRes.value) {
      state.dailyDiscount = menuDrinksApi.resolveDailyDiscountConfig(discountRes.value);
      syncDailyDiscountNavAndSummary();
      syncDailyDiscountFormFromState();
    }

    if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
      const pendingCount = ordersRes.value.filter((o) => o.status !== 'shipped').length;
      if ($('pendingOrdersNavCount')) $('pendingOrdersNavCount').textContent = String(pendingCount);
      if ($('quickOrdersCount')) $('quickOrdersCount').textContent = String(pendingCount);
    }

    if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
      const stats = analyticsRes.value;
      if ($('quickLiveVisitors')) $('quickLiveVisitors').textContent = String(stats.activeUsers || 0);
      if ($('quickTodayViews')) $('quickTodayViews').textContent = `Bugün: ${Number(stats.today?.pageviews || 0)} baxış ↗`;
    }
  }

  function switchAdminView(viewName) {
    state.view = viewName === 'daily-discount' ? 'daily-discount' : 'catalog';
    const isDaily = state.view === 'daily-discount';
    if ($('catalogView')) $('catalogView').hidden = isDaily;
    if ($('dailyDiscountView')) $('dailyDiscountView').hidden = !isDaily;

    document.querySelectorAll('#categoryNav .category-button').forEach((btn) => {
      if (btn.dataset.view) {
        btn.classList.toggle('active', isDaily && btn.dataset.view === 'daily-discount');
      } else if (btn.dataset.category) {
        btn.classList.toggle('active', !isDaily && btn.dataset.category === state.category);
      }
    });

    if (isDaily) {
      if (window.location.hash !== '#daily-discount') {
        history.replaceState?.(null, '', '#daily-discount');
      }
      renderDailyDrinkGrid();
      updateDailyPreview();
    } else if (window.location.hash === '#daily-discount') {
      history.replaceState?.(null, '', './');
    }
  }

  function syncDailyDiscountNavAndSummary() {
    const cfg = menuDrinksApi.resolveDailyDiscountConfig(state.dailyDiscount);
    const navBadge = $('dailyDiscountNavBadge');
    if (navBadge) {
      navBadge.textContent = cfg.enabled ? `-${cfg.discountPercent}%` : 'Söndürüldü';
    }
    const quickTitle = $('quickDailyTitle');
    if (quickTitle) {
      quickTitle.textContent = cfg.enabled ? `${cfg.itemName} · -${cfg.discountPercent}%` : 'Söndürülüb';
    }
    const quickSub = $('quickDailySub');
    if (quickSub) {
      if (!cfg.enabled) {
        quickSub.textContent = 'Menyu təklifini aktiv et →';
      } else if (cfg.prices?.length) {
        const first = Number(cfg.prices[0].discounted).toFixed(2);
        const last = Number(cfg.prices[cfg.prices.length - 1].discounted).toFixed(2);
        quickSub.textContent = first === last ? `${first} ₼ · Dəyiş →` : `${first} – ${last} ₼ · Dəyiş →`;
      }
    }
  }

  function setDailyImagePreview(src) {
    const preview = $('dailyImagePreview');
    if (!preview) return;
    preview.innerHTML = src
      ? `<img src="../${escapeHtml(src)}" alt="Günün endirimli içki şəkli" />`
      : '<div class="no-img">📷 Şəkil seçilməyib</div>';
  }

  function populateDailyDrinkSelect() {
    const select = $('dailyDrinkSelect');
    if (!select) return;
    const grouped = new Map();
    menuDrinksApi.MENU_DRINKS.forEach((drink) => {
      if (!grouped.has(drink.category)) grouped.set(drink.category, []);
      grouped.get(drink.category).push(drink);
    });
    select.innerHTML = [...grouped.entries()].map(([cat, drinks]) => `
      <optgroup label="${escapeHtml(cat)}">
        ${drinks.map((d) => {
          const priceSummary = d.prices.map((p) => (p.size ? `${p.size} ${Number(p.price).toFixed(2)}` : Number(p.price).toFixed(2))).join(' / ');
          return `<option value="${escapeHtml(d.key)}">${escapeHtml(d.name)} (${priceSummary} ₼)</option>`;
        }).join('')}
      </optgroup>
    `).join('');
  }

  function renderDailyDrinkGrid() {
    const grid = $('dailyDrinkGrid');
    const select = $('dailyDrinkSelect');
    if (!grid || !select) return;
    const activeKey = select.value || state.dailyDiscount.itemKey || 'latte';
    const filtered = menuDrinksApi.MENU_DRINKS.filter((drink) =>
      state.dailyFilter === 'all' || drink.filterGroup === state.dailyFilter
    );
    if ($('dailyDrinkCountHint')) {
      $('dailyDrinkCountHint').textContent = `${filtered.length} içki`;
    }
    grid.innerHTML = filtered.map((drink) => {
      const priceText = drink.prices.map((p) => (p.size ? `${p.size} ${Number(p.price).toFixed(2)}` : `${Number(p.price).toFixed(2)}`)).join(' · ') + ' ₼';
      const isSelected = drink.key === activeKey;
      return `<button type="button" class="daily-drink-chip ${isSelected ? 'active' : ''}" data-drink-pick="${escapeHtml(drink.key)}" role="option" aria-selected="${isSelected}">
        <strong>${escapeHtml(drink.name)}</strong>
        <small>${escapeHtml(drink.category)} · ${escapeHtml(priceText)}</small>
      </button>`;
    }).join('');
  }

  function readDailyDraftFromForm() {
    const select = $('dailyDrinkSelect');
    const enabledEl = $('dailyDiscountEnabled');
    const pctEl = $('dailyDiscountPercent');
    const imgEl = $('dailyImageInput');
    const noteEl = $('dailyCustomNote');

    return menuDrinksApi.resolveDailyDiscountConfig({
      enabled: enabledEl ? enabledEl.checked : true,
      itemKey: select?.value || 'latte',
      discountPercent: Number(pctEl?.value) || 50,
      image: imgEl?.value.trim() || '',
      customNote: noteEl?.value.trim() || '',
    });
  }

  function syncDailyDiscountFormFromState() {
    const cfg = menuDrinksApi.resolveDailyDiscountConfig(state.dailyDiscount);
    if ($('dailyDiscountEnabled')) $('dailyDiscountEnabled').checked = cfg.enabled;
    if ($('dailyDrinkSelect')) $('dailyDrinkSelect').value = cfg.itemKey;
    if ($('dailyDiscountPercent')) $('dailyDiscountPercent').value = String(cfg.discountPercent);
    if ($('dailyDiscountRange')) $('dailyDiscountRange').value = String(cfg.discountPercent);
    if ($('dailyDiscountPercentBadge')) $('dailyDiscountPercentBadge').textContent = `-${cfg.discountPercent}%`;
    if ($('dailyImageInput')) $('dailyImageInput').value = cfg.image;
    if ($('dailyCustomNote')) $('dailyCustomNote').value = cfg.customNote || '';
    setDailyImagePreview(cfg.image);
    renderDailyDrinkGrid();
    syncPresetButtons(cfg.discountPercent);
    updateDailyPreview();
  }

  function syncPresetButtons(pct) {
    document.querySelectorAll('.discount-preset-btn').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.discountPreset) === Number(pct));
    });
  }

  function updateDailyPreview() {
    const cfg = readDailyDraftFromForm();
    if ($('dailyDiscountPercentBadge')) $('dailyDiscountPercentBadge').textContent = `-${cfg.discountPercent}%`;
    syncPresetButtons(cfg.discountPercent);

    const card = $('dailyPreviewSpotlight');
    if (card) card.classList.toggle('is-disabled', !cfg.enabled);
    if ($('previewDailyImg')) {
      $('previewDailyImg').src = `../${cfg.image}`;
      $('previewDailyImg').alt = cfg.itemName;
    }
    if ($('previewDailyPercent')) $('previewDailyPercent').textContent = cfg.enabled ? `-${cfg.discountPercent}%` : 'GİZLİ';
    if ($('previewDailyTag')) $('previewDailyTag').textContent = cfg.enabled ? `-${cfg.discountPercent}% · GÜNÜN TƏKLİFİ` : 'TƏKLİF DEAKTİVDİR';
    if ($('previewDailyCategory')) $('previewDailyCategory').textContent = cfg.category;
    if ($('previewDailyTitle')) $('previewDailyTitle').textContent = `Günün seçimi: ${cfg.itemName}`;
    if ($('previewDailyNote')) {
      $('previewDailyNote').textContent = cfg.customNote
        || `Kofeşopumuzda hər gün bir içkiyə ${cfg.discountPercent}% endirim tətbiq olunur. Bu gün günün endirimli seçimi ${cfg.itemName}-dir.`;
    }
    if ($('previewDailyPrices')) {
      $('previewDailyPrices').innerHTML = cfg.prices.map((entry) => `
        <span class="daily-preview-chip">
          <b>${escapeHtml(entry.size || 'Standart')}</b>
          <del>${Number(entry.original).toFixed(2)}</del>
          <strong>${Number(entry.discounted).toFixed(2)} ₼</strong>
        </span>
      `).join('');
    }
    if ($('previewDailyMenuRow')) {
      const badge = cfg.enabled ? `<span class="daily-preview-row-badge">-${cfg.discountPercent}% BUGÜN</span>` : '';
      const chips = cfg.prices.map((entry) => {
        const size = entry.size ? `<b>${escapeHtml(entry.size)}</b> ` : '';
        return cfg.enabled
          ? `<span class="daily-preview-chip">${size}<del>${Number(entry.original).toFixed(2)}</del> <strong>${Number(entry.discounted).toFixed(2)} ₼</strong></span>`
          : `<span class="daily-preview-chip">${size}<strong>${Number(entry.original).toFixed(2)} ₼</strong></span>`;
      }).join(' ');
      $('previewDailyMenuRow').innerHTML = `<strong>${escapeHtml(cfg.itemName)}</strong> ${badge} <span>${chips}</span>`;
    }
  }

  async function persistDailyDiscount(payload) {
    const saveBtn = $('saveDailyDiscountBtn');
    const statusEl = $('dailyDiscountStatus');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Yadda saxlanılır…';
    }
    if (statusEl) {
      statusEl.classList.remove('error');
      statusEl.textContent = '';
    }
    try {
      const saved = await api.updateMenuDiscount(payload);
      state.dailyDiscount = menuDrinksApi.resolveDailyDiscountConfig(saved);
      syncDailyDiscountNavAndSummary();
      syncDailyDiscountFormFromState();
      const label = state.dailyDiscount.enabled
        ? `✅ Günün endirimi yeniləndi: ${state.dailyDiscount.itemName} (-${state.dailyDiscount.discountPercent}%).`
        : '✅ Günün endirim banneri müvəqqəti gizlədildi.';
      if (statusEl) statusEl.textContent = label;
      $('appMessage').textContent = label;
    } catch (error) {
      if (error.status === 401 || /authentication required/i.test(error.message)) {
        const pass = window.prompt('⚠️ Sessiyanızın vaxtı bitib. Dəyişikliyi saxlamaq üçün admin şifrəsini daxil edin:');
        if (pass) {
          try {
            await api.login(pass);
            return await persistDailyDiscount(payload);
          } catch (loginErr) {
            if (statusEl) {
              statusEl.classList.add('error');
              statusEl.textContent = 'Giriş uğursuz oldu: ' + (loginErr.message || 'Şifrə yanlışdır');
            }
            return;
          }
        }
      }
      if (statusEl) {
        statusEl.classList.add('error');
        statusEl.textContent = 'Xəta: ' + error.message;
      }
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Yadda saxla';
      }
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
    if (imagePath.startsWith('http') && !imagePath.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }
    const cleanSrc = imagePath.startsWith('http') || imagePath.startsWith('/')
      ? imagePath
      : `/${imagePath.replace(/^\.?\/?/, '')}`;
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
    img.src = cleanSrc;
  }

  let activeColorPickerCallback = null;
  let activePickerImageInput = null;
  let pickerHoveredHex = '#8b8177';

  function openImageColorPicker(imagePath, onPick, associatedImageInput = null) {
    activeColorPickerCallback = onPick;
    activePickerImageInput = associatedImageInput;
    const canvas = $('imageColorCanvas');
    const ctx = canvas.getContext('2d');
    const palette = $('imageColorPalette');
    const loupe = $('imageColorLoupe');
    const badge = $('pickedColorBadge');
    const hexLabel = $('pickedColorHex');

    palette.innerHTML = '<span style="font-size:11px;color:var(--muted);">Şəkil açılır və rənglər aşkar edilir…</span>';
    loupe.hidden = true;
    pickerHoveredHex = '#8b8177';
    badge.style.background = pickerHoveredHex;
    hexLabel.textContent = pickerHoveredHex;

    const img = new Image();
    if (imagePath.startsWith('http') && !imagePath.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }
    const cleanSrc = imagePath.startsWith('http') || imagePath.startsWith('/')
      ? imagePath
      : `/${imagePath.replace(/^\.?\/?/, '')}`;

    img.onload = () => {
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 400;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      extractDominantColors(imagePath, (colors) => {
        if (!colors.length) {
          palette.innerHTML = '<span style="font-size:11px;color:var(--muted);">Şəklin üzərinə klikləyərək rəngi seçin</span>';
          return;
        }
        palette.innerHTML = colors.map((c) =>
          `<button type="button" class="detected-swatch" data-hex="${c}" style="background:${c};" title="Aşkar edilmiş rəng: ${c}"></button>`
        ).join('');
      });
    };
    img.onerror = () => {
      palette.innerHTML = '<span style="font-size:12px;color:var(--danger);">Şəkil açılmadı. Zəhmət olmasa "Şəkli dəyiş" düyməsi ilə başqa şəkil seçin.</span>';
    };
    img.src = cleanSrc;

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
    eyedropperBtn.addEventListener('click', () => {
      const targetImg = imageInput.value.trim() || $('productImage').value.trim();
      if (!targetImg) {
        alert('Şəkildən rəng seçmək üçün əvvəlcə variant və ya məhsul şəkli seçin.');
        openAssetLibrary(imageInput, (selectedAsset) => {
          openImageColorPicker(selectedAsset, (pickedColor) => {
            applyColor(pickedColor);
          }, imageInput);
        });
        return;
      }
      openImageColorPicker(targetImg, (pickedColor) => {
        applyColor(pickedColor);
      }, imageInput);
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
    syncMetaProfileSections($('productCategory').value, product?.meta || {}, product?.id);
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

  function syncMetaProfileSections(category, meta = null, productId = '') {
    if ($('coffeeProfileSection')) $('coffeeProfileSection').hidden = category !== 'coffee';
    if ($('teaProfileSection')) $('teaProfileSection').hidden = category !== 'tea';
    if ($('equipmentProfileSection')) $('equipmentProfileSection').hidden = category !== 'equipment';
    if (!meta) return;

    if (category === 'coffee') {
      const body = Number(meta.body) || 3;
      const acidity = Number(meta.acidity) || 3;
      const balance = Number(meta.balance) || 4;
      if ($('coffeeBodyRange')) $('coffeeBodyRange').value = String(body);
      if ($('coffeeBodyVal')) $('coffeeBodyVal').textContent = `${body.toFixed(1)} / 5`;
      if ($('coffeeAcidityRange')) $('coffeeAcidityRange').value = String(acidity);
      if ($('coffeeAcidityVal')) $('coffeeAcidityVal').textContent = `${acidity.toFixed(1)} / 5`;
      if ($('coffeeBalanceRange')) $('coffeeBalanceRange').value = String(balance);
      if ($('coffeeBalanceVal')) $('coffeeBalanceVal').textContent = `${balance.toFixed(1)} / 5`;
      if ($('coffeeWeight')) $('coffeeWeight').value = String(meta.weight || 100);
      if ($('coffeeTasteNotes')) $('coffeeTasteNotes').value = meta.tasteNotes || '';
      if ($('coffeeIsDecaf')) $('coffeeIsDecaf').checked = Boolean(meta.isDecaf || productId === 'decaf');
    } else if (category === 'tea') {
      if ($('teaKind')) $('teaKind').value = meta.kind || '';
      if ($('teaBrew')) $('teaBrew').value = meta.brew || '';
      if ($('teaTasteNotes')) $('teaTasteNotes').value = meta.tasteNotes || '';
    } else if (category === 'equipment') {
      if ($('equipmentCategory')) $('equipmentCategory').value = meta.equipmentCategory || 'accessory';
      if ($('equipmentCategoryLabel')) $('equipmentCategoryLabel').value = meta.categoryLabel || '';
    }
  }

  function mergeProfileFieldsIntoMetaJson() {
    let meta = {};
    try {
      meta = JSON.parse($('productMeta').value || '{}');
    } catch {
      meta = {};
    }
    const category = $('productCategory').value;
    if (category === 'coffee') {
      meta.body = Number($('coffeeBodyRange')?.value || 3);
      meta.acidity = Number($('coffeeAcidityRange')?.value || 3);
      meta.balance = Number($('coffeeBalanceRange')?.value || 4);
      meta.weight = Math.max(1, Math.round(Number($('coffeeWeight')?.value) || 100));
      const notes = $('coffeeTasteNotes')?.value.trim();
      if (notes) meta.tasteNotes = notes;
      else delete meta.tasteNotes;
      if ($('coffeeIsDecaf')?.checked) meta.isDecaf = true;
      else delete meta.isDecaf;
    } else if (category === 'tea') {
      const kind = $('teaKind')?.value.trim();
      const brew = $('teaBrew')?.value.trim();
      const notes = $('teaTasteNotes')?.value.trim();
      if (kind) meta.kind = kind;
      if (brew) meta.brew = brew;
      if (notes) meta.tasteNotes = notes;
      meta.weight = meta.weight || 100;
    } else if (category === 'equipment') {
      const eqCat = $('equipmentCategory')?.value || 'accessory';
      const eqLabel = $('equipmentCategoryLabel')?.value.trim();
      meta.equipmentCategory = eqCat;
      if (eqLabel) meta.categoryLabel = eqLabel;
      meta.imageFit = meta.imageFit || 'cover';
    }
    $('productMeta').value = JSON.stringify(meta, null, 2);
    return meta;
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
    const meta = mergeProfileFieldsIntoMetaJson();

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

  function openAssetLibrary(target, onSelectCallback = null) {
    state.assetTarget = target;
    state.assetCallback = onSelectCallback;
    $('assetUploadMessage').textContent = '';
    $('assetUploadMessage').classList.remove('error');
    $('assetSearch').value = '';
    renderAssets();
    assetDialog.showModal();
  }

  function selectAsset(asset) {
    const target = state.assetTarget || $('productImage');
    if (target) target.value = asset;
    if (target === $('productImage')) setImagePreview(asset);
    if (target === $('dailyImageInput')) {
      setDailyImagePreview(asset);
      updateDailyPreview();
    }
    const row = target?.closest?.('.variant-row');
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
    if (state.assetCallback) {
      const cb = state.assetCallback;
      state.assetCallback = null;
      cb(asset);
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

  async function uploadAsset(file, explicitTarget = null) {
    const message = $('assetUploadMessage');
    const statusMsg = $('imageStatusMessage');
    const type = inferUploadType(file);
    if (explicitTarget) {
      state.assetTarget = explicitTarget;
    }

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
    const viewBtn = event.target.closest('[data-view]');
    if (viewBtn) {
      switchAdminView(viewBtn.dataset.view);
      return;
    }
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    switchAdminView('catalog');
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

  // Category switch can auto-select sensible units and profile fields
  $('productCategory').addEventListener('change', () => {
    markDirty();
    const cat = $('productCategory').value;
    if (cat === 'equipment') {
      $('productUnit').value = 'piece';
    } else {
      $('productUnit').value = 'g';
    }
    let parsedMeta = {};
    try { parsedMeta = JSON.parse($('productMeta').value || '{}'); } catch {}
    syncMetaProfileSections(cat, parsedMeta, $('productId').value.trim());
  });

  [
    ['coffeeBodyRange', 'coffeeBodyVal'],
    ['coffeeAcidityRange', 'coffeeAcidityVal'],
    ['coffeeBalanceRange', 'coffeeBalanceVal'],
  ].forEach(([rangeId, valId]) => {
    const rangeEl = $(rangeId);
    if (rangeEl) {
      rangeEl.addEventListener('input', () => {
        if ($(valId)) $(valId).textContent = `${Number(rangeEl.value).toFixed(1)} / 5`;
        mergeProfileFieldsIntoMetaJson();
        markDirty();
      });
    }
  });

  ['coffeeWeight', 'coffeeTasteNotes', 'coffeeIsDecaf', 'teaKind', 'teaBrew', 'teaTasteNotes', 'equipmentCategory', 'equipmentCategoryLabel'].forEach((id) => {
    const el = $(id);
    if (el) {
      el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => {
        mergeProfileFieldsIntoMetaJson();
        markDirty();
      });
    }
  });

  $('productMeta').addEventListener('change', () => {
    try {
      const parsed = JSON.parse($('productMeta').value || '{}');
      syncMetaProfileSections($('productCategory').value, parsed, $('productId').value.trim());
    } catch {}
  });

  // Daily Discount Controls
  if ($('quickDailyCardBtn')) {
    $('quickDailyCardBtn').addEventListener('click', () => switchAdminView('daily-discount'));
  }
  if ($('backToCatalogBtn')) {
    $('backToCatalogBtn').addEventListener('click', () => switchAdminView('catalog'));
  }
  if ($('dailyCategoryPills')) {
    $('dailyCategoryPills').addEventListener('click', (event) => {
      const pill = event.target.closest('[data-daily-cat]');
      if (!pill) return;
      state.dailyFilter = pill.dataset.dailyCat || 'all';
      document.querySelectorAll('.daily-cat-pill').forEach((btn) => btn.classList.toggle('active', btn === pill));
      renderDailyDrinkGrid();
    });
  }
  if ($('dailyDrinkGrid')) {
    $('dailyDrinkGrid').addEventListener('click', (event) => {
      const card = event.target.closest('[data-drink-pick]');
      if (!card) return;
      const drinkKey = card.dataset.drinkPick;
      const drink = menuDrinksApi.getMenuDrinkByKey(drinkKey);
      if (!drink) return;
      const prevDrink = menuDrinksApi.getMenuDrinkByKey($('dailyDrinkSelect').value);
      $('dailyDrinkSelect').value = drinkKey;
      if (!$('dailyImageInput').value.trim() || $('dailyImageInput').value.trim() === prevDrink?.defaultImage) {
        $('dailyImageInput').value = drink.defaultImage;
        setDailyImagePreview(drink.defaultImage);
      }
      renderDailyDrinkGrid();
      updateDailyPreview();
    });
  }
  if ($('dailyDrinkSelect')) {
    $('dailyDrinkSelect').addEventListener('change', () => {
      const drink = menuDrinksApi.getMenuDrinkByKey($('dailyDrinkSelect').value);
      if (drink) {
        $('dailyImageInput').value = drink.defaultImage;
        setDailyImagePreview(drink.defaultImage);
      }
      renderDailyDrinkGrid();
      updateDailyPreview();
    });
  }
  if ($('dailyDiscountEnabled')) {
    $('dailyDiscountEnabled').addEventListener('change', updateDailyPreview);
  }
  if ($('dailyCustomNote')) {
    $('dailyCustomNote').addEventListener('input', updateDailyPreview);
  }
  if ($('dailyPresetRow')) {
    $('dailyPresetRow').addEventListener('click', (event) => {
      const btn = event.target.closest('[data-discount-preset]');
      if (!btn) return;
      const val = Number(btn.dataset.discountPreset) || 50;
      $('dailyDiscountRange').value = String(val);
      $('dailyDiscountPercent').value = String(val);
      updateDailyPreview();
    });
  }
  if ($('dailyDiscountRange')) {
    $('dailyDiscountRange').addEventListener('input', () => {
      $('dailyDiscountPercent').value = $('dailyDiscountRange').value;
      updateDailyPreview();
    });
  }
  if ($('dailyDiscountPercent')) {
    $('dailyDiscountPercent').addEventListener('input', () => {
      const clamped = Math.max(5, Math.min(90, Math.round(Number($('dailyDiscountPercent').value) || 50)));
      $('dailyDiscountRange').value = String(clamped);
      updateDailyPreview();
    });
  }
  if ($('dailyOpenAssetPicker')) {
    $('dailyOpenAssetPicker').addEventListener('click', () => openAssetLibrary($('dailyImageInput')));
  }
  if ($('dailyResetImageBtn')) {
    $('dailyResetImageBtn').addEventListener('click', () => {
      const drink = menuDrinksApi.getMenuDrinkByKey($('dailyDrinkSelect').value);
      const fallback = drink?.defaultImage || 'assets/menu/daily-latte.jpg';
      $('dailyImageInput').value = fallback;
      setDailyImagePreview(fallback);
      updateDailyPreview();
    });
  }
  if ($('dailyDirectUpload')) {
    $('dailyDirectUpload').addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (file) {
        uploadAsset(file, $('dailyImageInput'));
        event.target.value = '';
      }
    });
  }
  if ($('dailyDiscountForm')) {
    $('dailyDiscountForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const draft = readDailyDraftFromForm();
      persistDailyDiscount({
        enabled: draft.enabled,
        itemKey: draft.itemKey,
        discountPercent: draft.discountPercent,
        image: draft.image,
        customNote: draft.customNote,
      });
    });
  }
  if ($('resetDailyDiscountBtn')) {
    $('resetDailyDiscountBtn').addEventListener('click', () => {
      const def = menuDrinksApi.DEFAULT_DAILY_DISCOUNT_SETTINGS;
      persistDailyDiscount({
        enabled: true,
        itemKey: def.itemKey,
        discountPercent: def.discountPercent,
        image: def.image,
        customNote: '',
      });
    });
  }

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
        uploadAsset(file, $('productImage'));
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
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = Math.max(0, Math.min(colorCanvas.width - 1, Math.floor((clientX - rect.left) * scaleX)));
      const y = Math.max(0, Math.min(colorCanvas.height - 1, Math.floor((clientY - rect.top) * scaleY)));
      const p = colorCtx.getImageData(x, y, 1, 1).data;
      return '#' + [p[0], p[1], p[2]].map((c) => c.toString(16).padStart(2, '0')).join('');
    }

    function updateLoupe(e) {
      try {
        const hex = getPointHex(e);
        pickerHoveredHex = hex;
        const rect = colorCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        colorLoupe.style.left = `${clientX - rect.left}px`;
        colorLoupe.style.top = `${clientY - rect.top}px`;
        loupePrev.style.background = hex;
        loupeTxt.textContent = hex;
        colorLoupe.hidden = false;
      } catch {}
    }

    colorCanvas.addEventListener('mousemove', updateLoupe);
    colorCanvas.addEventListener('mouseleave', () => { colorLoupe.hidden = true; });

    colorCanvas.addEventListener('click', (e) => {
      try {
        const hex = getPointHex(e);
        pickerHoveredHex = hex;
        colorBadge.style.background = hex;
        hexTxt.textContent = hex;
      } catch {}
    });

    colorCanvas.addEventListener('touchstart', (e) => {
      try {
        const hex = getPointHex(e);
        pickerHoveredHex = hex;
        colorBadge.style.background = hex;
        hexTxt.textContent = hex;
      } catch {}
    }, { passive: true });

    colorCanvas.addEventListener('touchmove', (e) => {
      updateLoupe(e);
    }, { passive: true });

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

    const changePickerImgBtn = $('changePickerImageBtn');
    if (changePickerImgBtn) {
      changePickerImgBtn.addEventListener('click', () => {
        openAssetLibrary(activePickerImageInput || $('productImage'), (newAsset) => {
          openImageColorPicker(newAsset, activeColorPickerCallback, activePickerImageInput);
        });
      });
    }

    $('closeImageColorDialog').addEventListener('click', () => imageColorDialog.close());
  }

  window.addEventListener('beforeunload', (event) => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  window.addEventListener('hashchange', () => {
    if ($('adminApp') && !$('adminApp').hidden) {
      switchAdminView(window.location.hash === '#daily-discount' ? 'daily-discount' : 'catalog');
    }
  });

  boot();
})();
