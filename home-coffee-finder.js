(function () {
  const DEFAULT_CRITERIA = {
    brew: 'espresso',
    flavor: 'nutty',
    body: 'full',
    acidity: 'low',
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

  // Calibrated origin affinity profiles supplementing numeric body/acidity metrics
  const ORIGIN_AFFINITY = {
    brasil: { brews: { espresso: 26, turkish: 22, french: 16, filter: 8 }, flavors: { nutty: 28, intense: 14, fruity: 6 } },
    guatemala: { brews: { espresso: 23, turkish: 22, french: 24, filter: 14 }, flavors: { nutty: 25, intense: 20, fruity: 12 } },
    colombia: { brews: { french: 26, espresso: 19, filter: 20, turkish: 18 }, flavors: { nutty: 22, fruity: 20, intense: 10 } },
    honduras: { brews: { filter: 22, french: 22, espresso: 16, turkish: 12 }, flavors: { fruity: 22, nutty: 20, intense: 8 } },
    efiopiya: { brews: { filter: 28, french: 18, espresso: 10, turkish: 8 }, flavors: { fruity: 28, nutty: 6, intense: 4 } },
    'costa-rica': { brews: { filter: 26, french: 20, espresso: 14, turkish: 10 }, flavors: { fruity: 26, nutty: 12, intense: 6 } },
    keniya: { brews: { filter: 26, french: 16, espresso: 10, turkish: 8 }, flavors: { fruity: 27, nutty: 6, intense: 8 } },
    uqanda: { brews: { turkish: 26, espresso: 24, french: 20, filter: 10 }, flavors: { intense: 26, nutty: 22, fruity: 8 } },
    robusta: { brews: { espresso: 24, turkish: 25, french: 15, filter: 4 }, flavors: { intense: 28, nutty: 16, fruity: 2 } },
    decaf: { brews: { espresso: 22, french: 22, turkish: 18, filter: 16 }, flavors: { nutty: 24, intense: 12, fruity: 12 }, isDecaf: true },
  };

  const BODY_TARGET = { light: 2.5, medium: 3.25, full: 4.35 };
  const ACIDITY_TARGET = { low: 2.0, balanced: 3.25, bright: 4.35 };

  const isSoldOut = (item) => {
    const stock = item?.stock;
    return stock?.status === 'out' || (stock?.status === 'counted' && Number(stock.quantity) <= 0);
  };

  const inferFlavorScore = (item, flavor) => {
    const text = `${item.meta?.tasteNotes || ''} ${item.description || ''}`.toLowerCase();
    const keywords = {
      nutty: ['şokolad', 'kakao', 'fındıq', 'badam', 'karamel', 'şəkər'],
      fruity: ['meyvə', 'giləmeyvə', 'alma', 'portağal', 'sitrus', 'limon', 'qarağat', 'yasəmən', 'berqamot', 'bal', 'qreypfrut'],
      intense: ['tünd', 'qoz', 'odunsu', 'ədviyy', 'gavalı', 'güclü', 'intensiv'],
    }[flavor] || [];
    const hits = keywords.filter((kw) => text.includes(kw)).length;
    return Math.min(26, 6 + hits * 6);
  };

  const inferBrewScore = (item, brew) => {
    const body = Number(item.meta?.body) || 3;
    const acidity = Number(item.meta?.acidity) || 3;
    const balance = Number(item.meta?.balance) || 3.5;
    if (brew === 'espresso') return Math.max(6, Math.round(24 - Math.abs(body - 4) * 5 - Math.abs(acidity - 2.3) * 3));
    if (brew === 'filter') return Math.max(6, Math.round(24 - Math.abs(acidity - 4.2) * 5 - Math.abs(body - 2.8) * 4));
    if (brew === 'turkish') return Math.max(6, Math.round(24 - Math.abs(body - 4.2) * 5 - Math.max(0, acidity - 3.2) * 5));
    return Math.max(6, Math.round(22 - Math.abs(body - 3.3) * 4 + (balance - 3) * 3));
  };

  const scoreCoffee = (item, criteria = DEFAULT_CRITERIA) => {
    const affinity = ORIGIN_AFFINITY[item.id];
    const bodyVal = Number(item.meta?.body) || 3;
    const acidityVal = Number(item.meta?.acidity) || 3;

    const brewScore = affinity?.brews?.[criteria.brew] ?? inferBrewScore(item, criteria.brew);
    const flavorScore = affinity?.flavors?.[criteria.flavor] ?? inferFlavorScore(item, criteria.flavor);

    const targetBody = BODY_TARGET[criteria.body] ?? 3.25;
    const bodyDiff = Math.abs(bodyVal - targetBody);
    const bodyScore = Math.max(0, Math.round(24 - bodyDiff * 9.5));

    const targetAcid = ACIDITY_TARGET[criteria.acidity] ?? 3.25;
    const acidDiff = Math.abs(acidityVal - targetAcid);
    const acidScore = Math.max(0, Math.round(22 - acidDiff * 8.5));

    const isDecaf = Boolean(affinity?.isDecaf || item.id === 'decaf');
    let decafBonus = 0;
    if (criteria.decafOnly) {
      decafBonus = isDecaf ? 42 : -10;
    } else if (isDecaf) {
      decafBonus = -12;
    }

    const raw = brewScore + flavorScore + bodyScore + acidScore + decafBonus;
    const matchPercent = Math.max(64, Math.min(99, raw));
    const soldOutPenalty = isSoldOut(item) ? -1000 : 0;

    return {
      item,
      matchPercent,
      rankScore: raw + soldOutPenalty,
      bodyVal,
      acidityVal,
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
    if (isSoldOut(second.item) || (first.matchPercent - second.matchPercent >= 14) || second.matchPercent < 76) {
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

  const formatScoreStat = (val) => (Number.isInteger(val) ? String(val) : String(val));

  const showToast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message || tr('cartAddedToast', 'Səbətə uğurla əlavə edildi');
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2400);
  };

  const syncControlStates = () => {
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
    const kindText = dyn('Qəhvə · Orta qovurma');
    const unitText = dyn('/ 100 q');

    gridEl.innerHTML = ranked.map(({ item, matchPercent, bodyVal, acidityVal }, idx) => {
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
            <p class="finder-card-specs">${esc(`${bodyWord} ${formatScoreStat(bodyVal)}/5 · ${acidWord} ${formatScoreStat(acidityVal)}/5`)}</p>
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

  window.addEventListener('bcf:language-changed', () => {
    renderRecommendations();
  });

  syncControlStates();
  renderRecommendations();

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
        // Retain fallback coffee list smoothly when offline
      });
  }

  window.BCFCoffeeFinder = {
    scoreCoffee,
    rankCoffees,
    pickBestMatches,
    getCriteria: () => ({ ...criteria }),
    setCriteria: (next) => {
      criteria = { ...DEFAULT_CRITERIA, ...next };
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
