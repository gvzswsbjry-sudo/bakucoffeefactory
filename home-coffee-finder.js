(function () {
  const DEFAULT_CRITERIA = {
    body: 4.0,
    acidity: 2.0,
    balance: 4.5,
    brew: 'any',
    flavor: 'any',
    decafOnly: false,
  };

  // Authentic fallback list mirroring data/products.json coffee items
  const FALLBACK_COFFEES = [
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
      meta: { body: 3, weight: 100, acidity: 3, balance: 4, tasteNotes: 'Qırmızı alma, karamel, süd şokoladı, yüngül fındıq.' },
    },
    {
      id: 'guatemala',
      category: 'coffee',
      name: 'Guatemala',
      price: 12,
      unit: 'g',
      image: 'assets/coffee/guatemala.png',
      description: 'Dərin, klassik və şokoladlı gövdəsi olan çox yönlü qəhvə.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 2,
      meta: { body: 3.5, weight: 100, acidity: 3.5, balance: 4, tasteNotes: 'Tünd şokolad, badam, qəhvəyi şəkər, qurudulmuş portağal.' },
    },
    {
      id: 'brasil',
      category: 'coffee',
      name: 'Brasil',
      price: 10,
      unit: 'g',
      image: 'assets/coffee/brasil.png',
      description: 'Aşağı turşuluqlu, kremli və şokoladlı espresso profili.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 3,
      meta: { body: 4, weight: 100, acidity: 2, balance: 4.5, tasteNotes: 'Fındıq, kakao, qəhvəyi şəkər, karamel.' },
    },
    {
      id: 'honduras',
      category: 'coffee',
      name: 'Honduras',
      price: 11,
      unit: 'g',
      image: 'assets/coffee/honduras.png',
      description: 'Meyvə təravəti və kakaolu rahatlığı birləşdirən canlı profil.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 4,
      meta: { body: 3, weight: 100, acidity: 3, balance: 4, tasteNotes: 'Qırmızı giləmeyvə, kakao, qəhvəyi şəkər, yumşaq sitrus.' },
    },
    {
      id: 'robusta',
      category: 'coffee',
      name: 'Robusta',
      price: 8,
      unit: 'g',
      image: 'assets/coffee/robusta.png',
      description: 'Güclü, intensiv və dolğun içim üçün seçilən qəhvə.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 5,
      meta: { body: 5, weight: 100, acidity: 1.5, balance: 3, tasteNotes: 'Tünd kakao, qovrulmuş qoz, odunsu tonlar, ədviyyəli bitiş.' },
    },
    {
      id: 'costa-rica',
      category: 'coffee',
      name: 'Costa Rica',
      price: 13,
      unit: 'g',
      image: 'assets/coffee/costa-rica.png',
      description: 'Parlaq turşuluq və balabənzər şirinliyi olan təmiz fincan.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 6,
      meta: { body: 3, weight: 100, acidity: 4, balance: 4, tasteNotes: 'Portağal, sarı meyvələr, bal, yüngül kakao.' },
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
      sortOrder: 7,
      meta: { body: 2.5, weight: 100, acidity: 4.5, balance: 4, tasteNotes: 'Berqamot, yasəmən, limon qabığı və çəyirdəkli meyvələr.' },
    },
    {
      id: 'keniya',
      category: 'coffee',
      name: 'Keniya',
      price: 8,
      unit: 'g',
      image: 'assets/coffee-origins/keniya.jpeg',
      description: 'Şirəli meyvə xarakteri və parlaq turşuluğu ilə ifadəli qəhvə.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 8,
      meta: { body: 3, weight: 100, acidity: 4.5, balance: 4, tasteNotes: 'Qara qarağat, qırmızı giləmeyvə, qreypfrut və qamış şəkəri.' },
    },
    {
      id: 'decaf',
      category: 'coffee',
      name: 'Decaf',
      price: 12,
      unit: 'g',
      image: 'assets/coffee-origins/decaf.jpeg',
      description: 'Kofeinsiz, yumşaq və dolğun qəhvə seçimi.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 9,
      meta: { body: 3.5, weight: 100, acidity: 2, balance: 4, tasteNotes: 'Karamel, kakao, badam və yumşaq quru meyvə çalarları.' },
    },
    {
      id: 'uqanda',
      category: 'coffee',
      name: 'Uqanda',
      price: 11,
      unit: 'g',
      image: 'assets/coffee-origins/uqanda.jpeg',
      description: 'Dolğun bədənli, aşağı–orta turşuluqlu və uzun kakaolu fincan.',
      active: true,
      stock: { status: 'available', quantity: null },
      sortOrder: 10,
      meta: { body: 4, weight: 100, acidity: 2.5, balance: 3.5, tasteNotes: 'Tünd şokolad, quru gavalı, isti ədviyyat və qovrulmuş qoz.' },
    },
  ];

  // Calibrated origin affinity profiles supplementing numeric body/acidity/balance sliders
  const ORIGIN_AFFINITY = {
    brasil: { brews: { espresso: 16, turkish: 14, french: 10, filter: 5 }, flavors: { nutty: 16, intense: 8, fruity: 3 } },
    guatemala: { brews: { espresso: 14, turkish: 14, french: 15, filter: 9 }, flavors: { nutty: 15, intense: 12, fruity: 7 } },
    colombia: { brews: { french: 16, espresso: 12, filter: 13, turkish: 11 }, flavors: { nutty: 13, fruity: 13, intense: 6 } },
    honduras: { brews: { filter: 14, french: 14, espresso: 10, turkish: 8 }, flavors: { fruity: 14, nutty: 13, intense: 5 } },
    efiopiya: { brews: { filter: 17, french: 11, espresso: 6, turkish: 4 }, flavors: { fruity: 17, nutty: 4, intense: 3 } },
    'costa-rica': { brews: { filter: 16, french: 12, espresso: 9, turkish: 6 }, flavors: { fruity: 16, nutty: 8, intense: 4 } },
    keniya: { brews: { filter: 16, french: 10, espresso: 6, turkish: 4 }, flavors: { fruity: 16, nutty: 4, intense: 5 } },
    uqanda: { brews: { turkish: 16, espresso: 15, french: 12, filter: 6 }, flavors: { intense: 16, nutty: 13, fruity: 5 } },
    robusta: { brews: { espresso: 15, turkish: 16, french: 9, filter: 2 }, flavors: { intense: 17, nutty: 10, fruity: 1 } },
    decaf: { brews: { espresso: 14, french: 14, turkish: 11, filter: 10 }, flavors: { nutty: 15, intense: 8, fruity: 8 }, isDecaf: true },
  };

  const clampLevel = (value, fallback) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(5, Math.max(1, Math.round(n * 2) / 2));
  };

  const isSoldOut = (item) => {
    const stock = item?.stock;
    return stock?.status === 'out' || (stock?.status === 'counted' && Number(stock.quantity) <= 0);
  };

  const inferFlavorScore = (item, flavor) => {
    if (!flavor || flavor === 'any') return 14;
    const text = `${item.meta?.tasteNotes || ''} ${item.description || ''}`.toLowerCase();
    const keywords = {
      nutty: ['şokolad', 'kakao', 'fındıq', 'badam', 'karamel', 'şəkər'],
      fruity: ['meyvə', 'giləmeyvə', 'alma', 'portağal', 'sitrus', 'limon', 'qarağat', 'yasəmən', 'berqamot', 'bal', 'qreypfrut'],
      intense: ['tünd', 'qoz', 'odunsu', 'ədviyy', 'gavalı', 'güclü', 'intensiv'],
    }[flavor] || [];
    const hits = keywords.filter((kw) => text.includes(kw)).length;
    return Math.min(16, 4 + hits * 4);
  };

  const inferBrewScore = (item, brew) => {
    if (!brew || brew === 'any') return 14;
    const body = Number(item.meta?.body) || 3;
    const acidity = Number(item.meta?.acidity) || 3;
    const balance = Number(item.meta?.balance) || 3.5;
    if (brew === 'espresso') return Math.max(4, Math.round(15 - Math.abs(body - 4) * 3 - Math.abs(acidity - 2.3) * 2));
    if (brew === 'filter') return Math.max(4, Math.round(15 - Math.abs(acidity - 4.2) * 3 - Math.abs(body - 2.8) * 2.5));
    if (brew === 'turkish') return Math.max(4, Math.round(15 - Math.abs(body - 4.2) * 3 - Math.max(0, acidity - 3.2) * 3));
    return Math.max(4, Math.round(14 - Math.abs(body - 3.3) * 2.5 + (balance - 3) * 2));
  };

  const scoreCoffee = (item, criteria = DEFAULT_CRITERIA) => {
    const affinity = ORIGIN_AFFINITY[item.id];
    const bodyVal = Number(item.meta?.body) || 3;
    const acidityVal = Number(item.meta?.acidity) || 3;
    const balanceVal = Number(item.meta?.balance) || 4;

    const targetBody = clampLevel(criteria.body, DEFAULT_CRITERIA.body);
    const targetAcidity = clampLevel(criteria.acidity, DEFAULT_CRITERIA.acidity);
    const targetBalance = clampLevel(criteria.balance, DEFAULT_CRITERIA.balance);

    // 70 points driven directly by the 3 interactive sliders (Body 25, Acidity 25, Balance 20)
    const bodyScore = Math.max(0, 25 - Math.abs(bodyVal - targetBody) * 9.5);
    const acidScore = Math.max(0, 25 - Math.abs(acidityVal - targetAcidity) * 9.5);
    const balanceScore = Math.max(0, 20 - Math.abs(balanceVal - targetBalance) * 8.5);

    // 29 points from brew + flavor (neutral 14+15=29 when 'any' is selected)
    const brewScore = !criteria.brew || criteria.brew === 'any'
      ? 15
      : (affinity?.brews?.[criteria.brew] ?? inferBrewScore(item, criteria.brew));
    const flavorScore = !criteria.flavor || criteria.flavor === 'any'
      ? 14
      : (affinity?.flavors?.[criteria.flavor] ?? inferFlavorScore(item, criteria.flavor));

    const isDecaf = Boolean(affinity?.isDecaf || item.id === 'decaf');
    let decafBonus = 0;
    if (criteria.decafOnly) {
      decafBonus = isDecaf ? 45 : -12;
    } else if (isDecaf) {
      decafBonus = -14;
    }

    const raw = Math.round(bodyScore + acidScore + balanceScore + brewScore + flavorScore + decafBonus);
    const matchPercent = Math.max(55, Math.min(99, raw));
    const soldOutPenalty = isSoldOut(item) ? -1000 : 0;

    return {
      item,
      matchPercent,
      rankScore: raw + soldOutPenalty,
      bodyVal,
      acidityVal,
      balanceVal,
    };
  };

  const rankCoffees = (products, criteria = DEFAULT_CRITERIA, limit = 4) => {
    const coffees = (Array.isArray(products) ? products : [])
      .filter((item) => item && item.category === 'coffee' && item.active !== false);

    return coffees
      .map((item) => scoreCoffee(item, criteria))
      .sort((a, b) => (
        b.rankScore - a.rankScore
        || (a.item.sortOrder || 999) - (b.item.sortOrder || 999)
      ))
      .slice(0, limit);
  };

  const pickBestMatches = (ranked, criteria = DEFAULT_CRITERIA) => {
    if (!ranked.length) return [];
    if (criteria.decafOnly) return [ranked[0]];
    if (ranked.length === 1) return [ranked[0]];
    const first = ranked[0];
    const second = ranked[1];
    if (isSoldOut(second.item) || (first.matchPercent - second.matchPercent >= 10) || second.matchPercent < 78) {
      return [first];
    }
    return [first, second];
  };

  const sectionEl = document.getElementById('qehve-sec');
  const gridEl = document.getElementById('homeCoffeeFinderGrid');
  if (!sectionEl || !gridEl) {
    if (typeof window !== 'undefined') {
      window.BCFCoffeeFinder = { scoreCoffee, rankCoffees, pickBestMatches, DEFAULT_CRITERIA };
    }
    return;
  }

  const toastEl = document.getElementById('homeCartToast');
  const decafBtn = document.getElementById('finderDecafToggle');
  const resetBtn = document.getElementById('finderResetBtn');
  const summaryEl = document.getElementById('finderSummaryText');
  const cartItemsEl = document.getElementById('cartItems');

  const bodyRange = document.getElementById('finderBodyRange');
  const acidityRange = document.getElementById('finderAcidityRange');
  const balanceRange = document.getElementById('finderBalanceRange');
  const bodyValEl = document.getElementById('finderBodyVal');
  const acidityValEl = document.getElementById('finderAcidityVal');
  const balanceValEl = document.getElementById('finderBalanceVal');
  const paramButtons = [...sectionEl.querySelectorAll('[data-finder-group][data-finder-value]')];

  let criteria = { ...DEFAULT_CRITERIA };
  let catalogCoffees = [...FALLBACK_COFFEES];
  let toastTimer = null;

  const tr = (key, fallback) => window.BCF_I18N?.t?.(key, fallback) ?? fallback;
  const dyn = (text) => window.BCF_I18N?.translateDynamicText?.(text) ?? text;
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[ch]));

  const safeImage = (value) => {
    const src = String(value || '').trim();
    if (/^assets\/[a-z0-9_./-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(src) && !src.includes('..')) {
      return src;
    }
    return 'assets/coffee/cart-coffee-beans.png';
  };

  const formatScoreStat = (val) => (Number.isInteger(val) ? String(val) : Number(val).toFixed(1));
  const formatSliderVal = (val) => `${Number(val).toFixed(1)} / 5`;

  const showToast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message || tr('cartAddedToast', 'Səbətə uğurla əlavə edildi');
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2400);
  };

  const syncSliderVisual = (inputEl, valueEl, val) => {
    if (!inputEl) return;
    inputEl.value = String(val);
    const pct = `${((val - 1) / 4) * 100}%`;
    inputEl.style?.setProperty?.('--pct', pct);
    if (valueEl) valueEl.textContent = formatSliderVal(val);
  };

  const syncControlStates = () => {
    syncSliderVisual(bodyRange, bodyValEl, criteria.body);
    syncSliderVisual(acidityRange, acidityValEl, criteria.acidity);
    syncSliderVisual(balanceRange, balanceValEl, criteria.balance);

    paramButtons.forEach((btn) => {
      const group = btn.dataset.finderGroup;
      const val = btn.dataset.finderValue;
      const active = criteria[group] === val;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    if (decafBtn) {
      decafBtn.classList.toggle('active', Boolean(criteria.decafOnly));
      decafBtn.setAttribute('aria-pressed', String(Boolean(criteria.decafOnly)));
    }
  };

  const renderRecommendations = () => {
    const ranked = pickBestMatches(rankCoffees(catalogCoffees, criteria, 4), criteria);
    gridEl.dataset.resultCount = String(ranked.length);
    if (summaryEl) {
      const summaryKey = ranked.length === 1 ? 'finderSummarySingle' : 'finderSummaryPair';
      const summaryFallback = ranked.length === 1 ? 'Sizin üçün ən uyğun 1 qəhvə' : 'Parametrlərinizə ən uyğun 2 qəhvə';
      summaryEl.setAttribute('data-i18n', summaryKey);
      summaryEl._bcfOrigHtml = summaryFallback;
      summaryEl.textContent = tr(summaryKey, summaryFallback);
    }

    const bestLabel = tr('finderBestPick', 'Ən uyğun');
    const matchWord = tr('finderMatchWord', 'uyğun');
    const bodyWord = tr('finderBodyStat', 'Gövdə');
    const acidWord = tr('finderAcidStat', 'Turşuluq');
    const balWord = tr('finderBalanceStat', 'Balans');
    const kindText = dyn('Qəhvə · Orta qovurma');
    const unitText = dyn('/ 100 q');

    gridEl.innerHTML = ranked.map(({ item, matchPercent, bodyVal, acidityVal, balanceVal }, idx) => {
      const url = `qehveler.html#coffee-${encodeURIComponent(item.id)}`;
      const soldOut = isSoldOut(item);
      const displayName = dyn(item.name);
      const notesRaw = item.meta?.tasteNotes || item.description || '';
      const notes = dyn(notesRaw);
      const imgSrc = safeImage(item.image);
      const badgeClass = idx === 0
        ? 'home-featured-badge finder-match-badge--top'
        : 'home-featured-badge finder-match-badge--alt';
      const badgeLabel = idx === 0
        ? `${bestLabel} · ${matchPercent}%`
        : `${matchPercent}% ${matchWord}`;
      const priceValue = Number(item.price);

      const priceHtml = soldOut
        ? `<span class="home-featured-price home-featured-price--pending" data-i18n="soldOut">${esc(tr('soldOut', 'Bitib'))}</span>`
        : Number.isFinite(priceValue)
          ? `<span class="home-featured-price">${priceValue.toFixed(2)} ₼</span><span class="home-featured-unit">${esc(unitText)}</span>`
          : `<span class="home-featured-price home-featured-price--pending" data-i18n="pricePending">${esc(tr('pricePending', 'Qiymət təsdiqlənəcək'))}</span>`;

      const btnHtml = soldOut
        ? `<button class="home-featured-add" type="button" data-i18n="soldOut" disabled>${esc(tr('soldOut', 'Bitib'))}</button>`
        : `<button class="home-featured-add" type="button" data-finder-add="${esc(item.id)}" data-i18n="addToCart">${esc(tr('addToCart', 'Səbətə əlavə et'))}</button>`;

      return `
        <article class="home-featured-card finder-card" data-product-id="${esc(item.id)}" data-product-name="${esc(item.name)}" data-featured-category="coffee" data-product-url="${esc(url)}">
          <a class="home-featured-media" href="${esc(url)}" aria-label="${esc(displayName)}">
            <span class="${badgeClass}">${esc(badgeLabel)}</span>
            <img src="${esc(imgSrc)}" alt="${esc(displayName)}" loading="lazy" decoding="async" data-fallback-src="assets/coffee/cart-coffee-beans.png" />
          </a>
          <div class="home-featured-body">
            <p class="home-featured-kind">${esc(kindText)}</p>
            <h3><a class="home-featured-name-link" href="${esc(url)}">${esc(displayName)}</a></h3>
            <p class="finder-card-specs">${esc(`${bodyWord} ${formatScoreStat(bodyVal)} · ${acidWord} ${formatScoreStat(acidityVal)} · ${balWord} ${formatScoreStat(balanceVal)}`)}</p>
            <p class="home-featured-notes">${esc(notes)}</p>
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

    window.BCF_I18N?.translateDom?.(sectionEl);
  };

  const addRecommendedCoffee = (productId, triggerBtn) => {
    const item = catalogCoffees.find((candidate) => candidate.id === productId);
    if (!item || isSoldOut(item) || typeof window.loadSharedCart !== 'function' || typeof window.saveSharedCart !== 'function') return;

    const cartKey = `coffee-${item.id}`;
    const cart = window.loadSharedCart();
    const currentQty = Number(cart[cartKey]?.quantity || 0);
    const nextQty = Math.min(2000, currentQty + 100);

    cart[cartKey] = {
      id: item.id,
      name: item.name,
      price: Number(item.price),
      unit: 'g',
      maxQuantity: 2000,
      image: 'assets/coffee/cart-coffee-beans.png',
      category: 'coffee',
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
        triggerBtn.textContent = tr('addToCart', 'Səbətə əlavə et');
      }, 1300);
    }
  };

  const bindRange = (inputEl, key) => {
    if (!inputEl) return;
    const handleSlide = () => {
      const nextVal = clampLevel(inputEl.value, criteria[key]);
      criteria = { ...criteria, [key]: nextVal };
      syncControlStates();
      renderRecommendations();
    };
    inputEl.addEventListener('input', handleSlide);
    inputEl.addEventListener('change', handleSlide);
  };

  bindRange(bodyRange, 'body');
  bindRange(acidityRange, 'acidity');
  bindRange(balanceRange, 'balance');

  paramButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.finderGroup;
      const val = btn.dataset.finderValue;
      if (!group || !val || criteria[group] === val) return;
      criteria = { ...criteria, [group]: val };
      syncControlStates();
      renderRecommendations();
    });
  });

  decafBtn?.addEventListener('click', () => {
    criteria = { ...criteria, decafOnly: !criteria.decafOnly };
    syncControlStates();
    renderRecommendations();
  });

  resetBtn?.addEventListener('click', () => {
    criteria = { ...DEFAULT_CRITERIA };
    syncControlStates();
    renderRecommendations();
  });

  gridEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-finder-add]');
    if (!btn || btn.disabled) return;
    addRecommendedCoffee(btn.dataset.finderAdd, btn);
  });

  cartItemsEl?.addEventListener('click', (event) => {
    const actionBtn = event.target.closest('[data-cart-action]');
    if (!actionBtn || typeof window.applyCartAction !== 'function') return;
    const next = window.applyCartAction(window.loadSharedCart(), actionBtn.dataset.productId, actionBtn.dataset.cartAction);
    window.saveSharedCart(next);
  });

  window.addEventListener('bcf:language-changed', () => {
    renderRecommendations();
  });

  syncControlStates();
  renderRecommendations();
  if (typeof window.syncUnifiedCartDom === 'function') {
    window.syncUnifiedCartDom();
  }

  if (typeof window.loadAllStorefrontProducts === 'function') {
    window.loadAllStorefrontProducts()
      .then((products) => {
        const coffees = Array.isArray(products)
          ? products.filter((item) => item && item.category === 'coffee')
          : [];
        if (coffees.length) {
          catalogCoffees = coffees;
          renderRecommendations();
        }
      })
      .catch(() => {
        // Keep seamless fallback coffee list offline
      });
  }

  window.BCFCoffeeFinder = {
    scoreCoffee,
    rankCoffees,
    pickBestMatches,
    getCriteria: () => ({ ...criteria }),
    setCriteria: (next) => {
      criteria = {
        ...DEFAULT_CRITERIA,
        ...next,
        body: clampLevel(next?.body ?? DEFAULT_CRITERIA.body, DEFAULT_CRITERIA.body),
        acidity: clampLevel(next?.acidity ?? DEFAULT_CRITERIA.acidity, DEFAULT_CRITERIA.acidity),
        balance: clampLevel(next?.balance ?? DEFAULT_CRITERIA.balance, DEFAULT_CRITERIA.balance),
      };
      syncControlStates();
      renderRecommendations();
    },
    reset: () => {
      criteria = { ...DEFAULT_CRITERIA };
      syncControlStates();
      renderRecommendations();
    },
  };
})();
