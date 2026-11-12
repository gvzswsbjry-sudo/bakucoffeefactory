(function () {
  const FEATURED_DEFAULT_IDS = ['efiopiya', 'melisa', 'wheel-grinder', 'millifincan'];
  const TEA_PRIORITY_IDS = ['melisa', '1001-gece', 'admiral', 'hibiskus'];
  const EQUIPMENT_PRIORITY_IDS = ['wheel-grinder', 'millifincan', 'french-press', 'azerbaijan-coffee-set'];

  const FALLBACK_PRODUCTS = [
    {
      id: 'colombia',
      category: 'coffee',
      name: 'Colombia',
      price: 15,
      unit: 'g',
      image: 'assets/coffee/colombia.png',
      description: 'Yumşaq şirinliyi, canlı meyvə xarakteri və kakaolu bitişi ilə balanslı gündəlik qəhvə.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 1,
      meta: { weight: 100, tasteNotes: 'Qırmızı alma, karamel, süd şokoladı, yüngül fındıq.' },
      variants: [],
    },
    {
      id: 'brasil',
      category: 'coffee',
      name: 'Brasil',
      price: 13,
      unit: 'g',
      image: 'assets/coffee/brasil.png',
      description: 'Aşağı turşuluqlu, kremli və şokoladlı espresso profili.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 2,
      meta: { weight: 100, tasteNotes: 'Fındıq, kakao, qəhvəyi şəkər, karamel.' },
      variants: [],
    },
    {
      id: 'costa-rica',
      category: 'coffee',
      name: 'Costa Rica',
      price: 14,
      unit: 'g',
      image: 'assets/coffee/costa-rica.png',
      description: 'Parlaq turşuluq və balabənzər şirinliyi olan təmiz fincan.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 4,
      meta: { weight: 100, tasteNotes: 'Portağal, sarı meyvələr, bal, yüngül kakao.' },
      variants: [],
    },
    {
      id: 'efiopiya',
      category: 'coffee',
      name: 'Efiopiya',
      price: 13,
      unit: 'g',
      image: 'assets/coffee-origins/efiopiya.jpeg',
      description: 'Ətirli, zərif və parlaq xarakterli, çayabənzər yüngül fincan.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 6,
      meta: { weight: 100, tasteNotes: 'Berqamot, yasəmən, limon qabığı və çəyirdəkli meyvələr.' },
      variants: [],
    },
    {
      id: 'melisa',
      category: 'tea',
      name: 'Melisa Çayı',
      price: 9,
      unit: 'g',
      image: 'assets/tea-packages/melisa.jpg',
      description: 'Təbii melisa yarpaqlarından ibarət kofeinsiz, zərif bitki çayıdır. İlk qurtumda yüngül sitrus-limon ətri, ardınca təmiz yarpaq təravəti və yumşaq rahatladıcı dad hiss olunur. Xüsusilə axşam saatlarında sakit və balanslı içim üçün uyğundur.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 18,
      meta: { weight: 100, kind: 'Bitki çayı · sakitləşdirici', tasteNotes: 'Melisa yarpağı, yüngül limon, təzə bitki' },
      variants: [],
    },
    {
      id: '1001-gece',
      category: 'tea',
      name: '1001 Gecə Çayı',
      price: 7,
      unit: 'g',
      image: 'assets/tea-packages/1001-gece.jpg',
      description: 'Yaşıl və tünd çay yarpaqlarının rəngli çiçək ləçəkləri və meyvə parçaları ilə birləşdiyi zərif qarışıqdır. İlk qurtumda təravətli yarpaq dadı, ardınca yumşaq çiçək ətri və meyvəli şirinlik hiss olunur. Orta gövdəli və uzun, ətirli bitişlidir.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 1,
      meta: { weight: 100, kind: 'Aromatik qarışıq · çiçəkli', tasteNotes: 'Çiçək, sitrus, quru meyvə' },
      variants: [],
    },
    {
      id: 'admiral',
      category: 'tea',
      name: 'Admiral',
      price: 7,
      unit: 'g',
      image: 'assets/tea-packages/admiral.jpg',
      description: 'Qara çayın güclü əsasını mavi və açıq rəngli çiçək ləçəkləri, eləcə də giləmeyvə toxunuşları yumşaldır. Dəmləndikdə dərin kəhrəba rəngi, aydın qara çay xarakteri və zərif meyvə ətri verir. Səhər və günorta üçün balanslı, ifadəli seçimdir.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 2,
      meta: { weight: 100, kind: 'Qara çay · dolğun', tasteNotes: 'Qara çay, giləmeyvə, çiçək' },
      variants: [],
    },
    {
      id: 'hibiskus',
      category: 'tea',
      name: 'Hibiskus',
      price: 8,
      unit: 'g',
      image: 'assets/tea-packages/hibiskus.jpg',
      description: 'Hibiskus ləçəkləri və meyvə parçalarından ibarət kofeinsiz, canlı rəngli infuziyadır. Parlaq turşuluq, qırmızı meyvə xarakteri və təmiz bitiş verir. İsti içildikdə dolğun və rahat, buzla servis edildikdə isə xüsusilə təravətli olur.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 17,
      meta: { weight: 100, kind: 'Bitki infuziyası · turşməzə', tasteNotes: 'Hibiskus, qırmızı giləmeyvə, sitrus' },
      variants: [],
    },
    {
      id: 'wheel-grinder',
      category: 'equipment',
      name: 'Çarxlı əl dəyirmanı',
      price: 95,
      unit: 'piece',
      image: 'assets/equipment/wheel-grinder.jpg',
      description: 'Möhkəm metal gövdəli, klassik çarx mexanizmi ilə.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 8,
      meta: { categoryLabel: 'Dəyirman' },
      variants: [{ id: 'wheel-grinder', name: 'Çarxlı əl dəyirmanı', price: 95, image: 'assets/equipment/wheel-grinder.jpg' }],
    },
    {
      id: 'millifincan',
      category: 'equipment',
      name: 'Milli Fincan (qaşıqlı)',
      price: 18,
      unit: 'piece',
      image: 'assets/catalog/milli-fincan.jpg',
      description: 'Xüsusi naxışlı milli qəhvə fincanı və qaşıq dəsti.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 17,
      meta: { categoryLabel: 'Aksesuar' },
      variants: [{ id: 'millifincan', name: 'Milli Fincan (qaşıqlı)', price: 18, image: 'assets/catalog/milli-fincan.jpg' }],
    },
    {
      id: 'french-press',
      category: 'equipment',
      name: 'French Press',
      price: 25,
      unit: 'piece',
      image: 'assets/equipment/french-press.jpg',
      description: '350 ml, 600 ml və 850 ml ölçülərdə sadə və dolğun dəmləmə üçün klassik pres.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 1,
      meta: { categoryLabel: 'Dəmləmə' },
      variants: [{ id: 'french-press', name: 'French Press', price: 25, image: 'assets/equipment/french-press.jpg' }],
    },
    {
      id: 'azerbaijan-coffee-set',
      category: 'equipment',
      name: 'Azərbaycan qəhvə dəsti',
      price: 83,
      unit: 'piece',
      image: 'assets/equipment/azerbaijan-coffee-set-bronze.jpg',
      description: 'Cezvə, iki fincan və servis detalları ilə zərif hədiyyə dəsti.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 7,
      meta: { categoryLabel: 'Servis' },
      variants: [{ id: 'azerbaijan-set-bronze', name: 'Bürünc · Azərbaycan qəhvə dəsti', price: 83, image: 'assets/equipment/azerbaijan-coffee-set-bronze.jpg' }],
    },
  ];

  const gridEl = document.getElementById('homeFeaturedGrid');
  if (!gridEl) return;

  const filterButtons = [...document.querySelectorAll('button.home-featured-filter[data-featured-filter]')];
  const allLinkEl = document.getElementById('homeFeaturedAllLink');
  const cartItemsEl = document.getElementById('cartItems');
  const toastEl = document.getElementById('homeCartToast');

  const tr = (key, fallback) => window.BCF_I18N?.t?.(key, fallback) ?? fallback;
  const dyn = (text) => window.BCF_I18N?.translateDynamicText?.(text) ?? text;
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[ch]));

  const safeImage = (value, category) => {
    const src = String(value || '').trim();
    if (/^assets\/[a-z0-9_./-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(src) && !src.includes('..')) {
      return src;
    }
    return category === 'equipment' ? 'assets/equipment/french-press.jpg' : 'assets/coffee/cart-coffee-beans.png';
  };

  let activeFilter = 'all';
  let catalogProducts = [...FALLBACK_PRODUCTS];
  let toastTimer = null;

  const showToast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message || tr('cartAddedToast', 'Səbətə uğurla əlavə edildi');
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2400);
  };

  const getProductUrl = (item) => {
    if (item.category === 'tea') return `caylar.html#${encodeURIComponent(item.id)}`;
    if (item.category === 'equipment') return `mehsul.html?id=${encodeURIComponent(item.id)}`;
    return `qehveler.html#coffee-${encodeURIComponent(item.id)}`;
  };

  const getProductKind = (item) => {
    if (item.category === 'coffee') return 'Qəhvə · Orta qovurma';
    if (item.category === 'tea') return item.meta?.kind || 'Çay kolleksiyası';
    return item.meta?.categoryLabel || 'Avadanlıq';
  };

  const getProductNotes = (item) => {
    const notes = item.meta?.tasteNotes ? dyn(item.meta.tasteNotes) : '';
    const desc = item.description ? dyn(item.description) : '';
    if (notes && desc) {
      return /[.!?]$/.test(notes) ? `${notes} ${desc}` : `${notes} · ${desc}`;
    }
    return notes || desc || '';
  };

  const getProductPriceInfo = (item) => {
    const firstVariant = Array.isArray(item.variants) && item.variants.length ? item.variants[0] : null;
    const rawPrice = firstVariant?.price ?? item.price;
    const isPending = item.meta?.pricePending && !(Number(rawPrice) > 0);
    const price = isPending || rawPrice == null ? null : Number(rawPrice);
    const isWeight = item.unit === 'g';
    const unit = isWeight ? '/ 100 q' : '/ ədəd';
    const image = safeImage(firstVariant?.image || item.image, item.category);
    const cartKey = item.category === 'coffee'
      ? `coffee-${item.id}`
      : item.category === 'tea'
        ? `tea-${item.id}`
        : (firstVariant?.id || item.id);
    return { price, unit, isWeight, image, cartKey };
  };

  const isSoldOut = (item) => {
    const stock = item?.stock;
    return stock?.status === 'out' || (stock?.status === 'counted' && Number(stock.quantity) <= 0);
  };

  const getBadge = (item) => {
    if (item.id === 'melisa') return { key: 'homeBadgeNew', text: 'YENİ', cls: 'home-featured-badge home-featured-badge--new' };
    if (item.id === 'efiopiya') return { key: 'homeBadgePopular', text: 'POPULYAR', cls: 'home-featured-badge' };
    return null;
  };

  const pickByPriority = (list, priorityIds, count = 4) => {
    const byId = new Map(list.map((item) => [item.id, item]));
    const picked = [];
    const seen = new Set();
    for (const id of priorityIds) {
      const found = byId.get(id);
      if (found && !seen.has(found.id)) {
        picked.push(found);
        seen.add(found.id);
      }
    }
    const rest = [...list]
      .filter((item) => !seen.has(item.id) && item.id !== 'test')
      .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
    for (const item of rest) {
      if (picked.length >= count) break;
      picked.push(item);
      seen.add(item.id);
    }
    return picked.slice(0, count);
  };

  const getVisibleProducts = () => {
    const active = catalogProducts.filter((item) => item && item.active !== false);
    if (activeFilter === 'coffee') {
      const coffees = active.filter((item) => item.category === 'coffee')
        .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
      return coffees.slice(0, 4);
    }
    if (activeFilter === 'tea') {
      const teas = active.filter((item) => item.category === 'tea');
      return pickByPriority(teas, TEA_PRIORITY_IDS, 4);
    }
    if (activeFilter === 'equipment') {
      const eq = active.filter((item) => item.category === 'equipment' && item.id !== 'test');
      return pickByPriority(eq, EQUIPMENT_PRIORITY_IDS, 4);
    }
    return pickByPriority(active.filter((item) => item.id !== 'test'), FEATURED_DEFAULT_IDS, 4);
  };

  const updateFooterLink = () => {
    if (!allLinkEl) return;
    const config = {
      all: { href: 'qehveler.html', key: 'homeFeaturedAll', fallback: 'Bütün məhsullara bax' },
      coffee: { href: 'qehveler.html', key: 'homeFeaturedAllCoffee', fallback: 'Bütün qəhvələrə bax' },
      tea: { href: 'caylar.html', key: 'homeFeaturedAllTea', fallback: 'Bütün çaylara bax' },
      equipment: { href: 'avadanliqlar.html', key: 'homeFeaturedAllEquipment', fallback: 'Bütün avadanlıqlara bax' },
    }[activeFilter] || { href: 'qehveler.html', key: 'homeFeaturedAll', fallback: 'Bütün məhsullara bax' };

    allLinkEl.setAttribute('href', config.href);
    const labelEl = allLinkEl.querySelector('[data-i18n]');
    if (labelEl) {
      labelEl.setAttribute('data-i18n', config.key);
      labelEl._bcfOrigHtml = config.fallback;
      labelEl.textContent = tr(config.key, config.fallback);
    }
  };

  const renderGrid = () => {
    const visible = getVisibleProducts();
    gridEl.innerHTML = visible.map((item) => {
      const info = getProductPriceInfo(item);
      const url = getProductUrl(item);
      const kind = getProductKind(item);
      const notes = getProductNotes(item);
      const soldOut = isSoldOut(item);
      const badge = getBadge(item);
      const displayName = dyn(item.name);
      const displayKind = dyn(kind);
      const displayNotes = notes;
      const displayUnit = dyn(info.unit);
      const fallbackSrc = item.category === 'equipment' ? 'assets/equipment/french-press.jpg' : 'assets/coffee/cart-coffee-beans.png';

      let priceHtml;
      if (soldOut) {
        priceHtml = `<span class="home-featured-price home-featured-price--pending" data-i18n="soldOut">${esc(tr('soldOut', 'Bitib'))}</span>`;
      } else if (info.price == null) {
        priceHtml = `<span class="home-featured-price home-featured-price--pending" data-i18n="pricePending">${esc(tr('pricePending', 'Qiymət təsdiqlənəcək'))}</span>`;
      } else {
        priceHtml = `
          <span class="home-featured-price">${Number(info.price).toFixed(2)} ₼</span>
          <span class="home-featured-unit">${esc(displayUnit)}</span>
        `;
      }

      const btnHtml = soldOut
        ? `<button class="home-featured-add" type="button" data-i18n="soldOut" disabled>${esc(tr('soldOut', 'Bitib'))}</button>`
        : `<button class="home-featured-add" type="button" data-featured-add="${esc(item.id)}" data-i18n="${info.price == null ? 'addToOrderRequest' : 'addToCart'}">${esc(tr(info.price == null ? 'addToOrderRequest' : 'addToCart', info.price == null ? 'Sifariş sorğusuna əlavə et' : 'Səbətə əlavə et'))}</button>`;

      return `
        <article class="home-featured-card" data-product-id="${esc(item.id)}" data-product-name="${esc(item.name)}" data-featured-category="${esc(item.category)}" data-product-url="${esc(url)}">
          <a class="home-featured-media" href="${esc(url)}" aria-label="${esc(displayName)}">
            ${badge ? `<span class="${badge.cls}" data-i18n="${badge.key}">${esc(tr(badge.key, badge.text))}</span>` : ''}
            <img src="${esc(info.image)}" alt="${esc(displayName)}" loading="lazy" decoding="async" data-fallback-src="${esc(fallbackSrc)}" />
          </a>
          <div class="home-featured-body">
            <p class="home-featured-kind">${esc(displayKind)}</p>
            <h3><a class="home-featured-name-link" href="${esc(url)}">${esc(displayName)}</a></h3>
            <p class="home-featured-notes">${esc(displayNotes)}</p>
            <div class="home-featured-foot">
              <div class="home-featured-price-wrap">${priceHtml}</div>
              ${btnHtml}
            </div>
          </div>
        </article>
      `;
    }).join('');

    gridEl.querySelectorAll('img[data-fallback-src]').forEach((img) => {
      img.addEventListener('error', () => {
        if (img.dataset.fallbackApplied === 'true') return;
        img.dataset.fallbackApplied = 'true';
        img.src = img.dataset.fallbackSrc;
      });
    });

    updateFooterLink();
    window.BCF_I18N?.translateDom?.(gridEl);
  };

  const addProductToCart = (productId, triggerBtn) => {
    const item = catalogProducts.find((candidate) => candidate.id === productId);
    if (!item || isSoldOut(item) || typeof window.loadSharedCart !== 'function' || typeof window.saveSharedCart !== 'function') return;

    const info = getProductPriceInfo(item);
    const cart = window.loadSharedCart();
    const currentQty = Number(cart[info.cartKey]?.quantity || 0);
    const stepQty = info.isWeight ? 100 : 1;
    const maxQty = info.isWeight ? (item.category === 'coffee' ? 2000 : 1000) : 99;
    const nextQty = Math.min(maxQty, currentQty + stepQty);

    const firstVariant = Array.isArray(item.variants) && item.variants.length ? item.variants[0] : null;
    const itemName = item.category === 'equipment' && firstVariant?.name ? firstVariant.name : item.name;
    const cartImage = item.category === 'coffee' ? 'assets/coffee/cart-coffee-beans.png' : info.image;

    cart[info.cartKey] = {
      id: item.category === 'equipment' ? info.cartKey : item.id,
      name: itemName,
      price: info.price,
      unit: info.isWeight ? 'g' : 'piece',
      maxQuantity: maxQty,
      image: cartImage,
      category: item.category,
      quantity: nextQty,
    };

    window.saveSharedCart(cart);
    showToast(tr('cartAddedToast', 'Səbətə uğurla əlavə edildi'));

    if (triggerBtn) {
      triggerBtn.classList.add('is-added');
      triggerBtn.textContent = tr('added', 'Əlavə edildi');
      setTimeout(() => {
        if (!triggerBtn.isConnected) return;
        triggerBtn.classList.remove('is-added');
        const key = info.price == null ? 'addToOrderRequest' : 'addToCart';
        triggerBtn.textContent = tr(key, info.price == null ? 'Sifariş sorğusuna əlavə et' : 'Səbətə əlavə et');
      }, 1300);
    }
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.featuredFilter || 'all';
      if (next === activeFilter) return;
      activeFilter = next;
      filterButtons.forEach((candidate) => {
        const selected = candidate === btn;
        candidate.classList.toggle('active', selected);
        candidate.setAttribute('aria-pressed', String(selected));
      });
      renderGrid();
    });
  });

  gridEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-featured-add]');
    if (!btn || btn.disabled) return;
    addProductToCart(btn.dataset.featuredAdd, btn);
  });

  cartItemsEl?.addEventListener('click', (event) => {
    const actionBtn = event.target.closest('[data-cart-action]');
    if (!actionBtn || typeof window.applyCartAction !== 'function') return;
    const next = window.applyCartAction(window.loadSharedCart(), actionBtn.dataset.productId, actionBtn.dataset.cartAction);
    window.saveSharedCart(next);
  });

  window.addEventListener('bcf:language-changed', () => {
    renderGrid();
  });

  // Render immediately with built-in catalog fallback, then refresh from live API
  renderGrid();
  if (typeof window.syncUnifiedCartDom === 'function') {
    window.syncUnifiedCartDom();
  }

  if (typeof window.loadAllStorefrontProducts === 'function') {
    window.loadAllStorefrontProducts()
      .then((products) => {
        if (Array.isArray(products) && products.length) {
          catalogProducts = products;
          window.BCF_PRODUCT_DATA = products;
          renderGrid();
        }
      })
      .catch(() => {
        // Keep seamless fallback showcase when API is unreachable
      });
  }
})();
