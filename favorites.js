(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.BCFFavorites = api;
  if (root?.document) api.init();
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  const STORAGE_KEY = 'bcf-favorites-v1';
  const CARD_SELECTOR = '.coffee-profile, .tea-product, .shop-product';
  let drawer;
  let overlay;
  let trigger;
  let previousFocus;

  function read() {
    try {
      const value = JSON.parse(root.localStorage.getItem(STORAGE_KEY));
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch { return {}; }
  }

  function write(items) {
    try { root.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
    root.dispatchEvent?.(new CustomEvent('bcf:favorites-changed', { detail: Object.values(items) }));
    return items;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    }[character]));
  }

  function safeProductUrl(value) {
    try {
      const parsed = new URL(String(value || ''), 'https://storefront.invalid/');
      const pathname = parsed.pathname.replace(/^\//, '');
      if (!['qehveler.html', 'caylar.html', 'avadanliqlar.html', 'mehsul.html'].includes(pathname)) return '#';
      if (parsed.origin !== 'https://storefront.invalid') return '#';
      const clean = new URL(`https://storefront.invalid/${pathname}`);
      if (pathname === 'mehsul.html') {
        for (const key of ['id', 'variant']) {
          const field = parsed.searchParams.get(key);
          if (field && /^[a-z0-9-]{1,80}$/i.test(field)) clean.searchParams.set(key, field);
        }
      }
      if (parsed.hash && /^#[a-z0-9-]{1,100}$/i.test(parsed.hash)) clean.hash = parsed.hash;
      return `${clean.pathname.slice(1)}${clean.search}${clean.hash}`;
    } catch { return '#'; }
  }

  function safeImage(value) {
    const image = String(value || '');
    return /^assets\/[a-z0-9_./-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(image) && !image.includes('..')
      ? image : 'assets/coffee/cart-coffee-beans.png';
  }

  function slug(value) {
    return String(value || '').toLocaleLowerCase('az').normalize('NFKD')
      .replace(/[^a-z0-9əğıöşüç]+/gi, '-').replace(/^-|-$/g, '') || 'mehsul';
  }

  function backgroundImage(card) {
    const visual = card.querySelector('.coffee-photo');
    if (!visual || !root.getComputedStyle) return '';
    const match = root.getComputedStyle(visual).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    return match?.[1] || '';
  }

  function describe(card) {
    if (card.matches('.shop-product')) {
      const id = card.dataset.productId || slug(card.querySelector('h3')?.textContent);
      return {
        key: `equipment:${id}`, id, category: 'Avadanlıq',
        name: card.querySelector('h3')?.textContent.trim() || 'Məhsul',
        image: card.querySelector('img')?.getAttribute('src') || '',
        price: card.querySelector('.product-price')?.textContent.trim() || '',
        url: card.dataset.productUrl || `mehsul.html?id=${encodeURIComponent(id)}`,
      };
    }
    if (card.matches('.tea-product')) {
      const id = card.id || slug(card.querySelector('h2')?.textContent);
      return {
        key: `tea:${id}`, id, category: 'Çay',
        name: card.querySelector('h2')?.textContent.trim() || 'Çay',
        image: card.querySelector('img')?.getAttribute('src') || '',
        price: card.querySelector('.tea-price')?.textContent.replace(/\s+/g, ' ').trim() || '',
        url: `caylar.html#${encodeURIComponent(id)}`,
      };
    }
    const id = card.dataset.managedId || [...card.classList].find((name) => name !== 'coffee-profile') || slug(card.querySelector('h2')?.textContent);
    if (!card.id) card.id = `coffee-${id}`;
    return {
      key: `coffee:${id}`, id, category: 'Qəhvə',
      name: card.querySelector('h2')?.textContent.trim() || 'Qəhvə',
      image: card.querySelector('img')?.getAttribute('src') || backgroundImage(card) || 'assets/coffee/cart-coffee-beans.png',
      price: card.querySelector('.coffee-title p')?.textContent.trim() || '',
      url: `qehveler.html#${encodeURIComponent(card.id)}`,
    };
  }

  function setButtonState(button, active, name) {
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? `${name} favoritlərdən sil` : `${name} favoritlərə əlavə et`);
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  }

  function enhance(card) {
    if (card.dataset.favoriteReady === 'true') return;
    const item = describe(card);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'favorite-toggle';
    setButtonState(button, Boolean(read()[item.key]), item.name);
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const items = read();
      if (items[item.key]) delete items[item.key];
      else items[item.key] = describe(card);
      write(items);
    });
    card.prepend(button);
    card.dataset.favoriteReady = 'true';
  }

  function renderDrawer() {
    if (!drawer || !trigger) return;
    const favorites = Object.values(read());
    trigger.querySelector('.favorites-count').textContent = String(favorites.length);
    trigger.setAttribute('aria-label', `Favorilər: ${favorites.length} məhsul`);
    const list = drawer.querySelector('.favorites-list');
    list.innerHTML = favorites.length ? favorites.map((item) => `
      <article class="favorites-list-item" data-favorite-key="${escapeHtml(item.key)}">
        <a href="${escapeHtml(safeProductUrl(item.url))}">
          <img src="${escapeHtml(safeImage(item.image))}" alt="" />
          <span><small>${escapeHtml(item.category)}</small><strong>${escapeHtml(item.name)}</strong><em>${escapeHtml(item.price || 'Məhsula bax')}</em></span>
        </a>
        <button type="button" data-remove-favorite="${escapeHtml(item.key)}" aria-label="${escapeHtml(item.name)} favoritlərdən sil">Sil</button>
      </article>`).join('') : '<div class="favorites-empty"><span aria-hidden="true">♡</span><h3>Favorit siyahınız boşdur.</h3><p>Məhsul kartındakı ürək işarəsinə toxunaraq seçimlərinizi burada toplayın.</p></div>';
  }

  function sync() {
    const items = read();
    document.querySelectorAll(CARD_SELECTOR).forEach((card) => {
      enhance(card);
      const item = describe(card);
      const button = card.querySelector(':scope > .favorite-toggle');
      if (button) setButtonState(button, Boolean(items[item.key]), item.name);
    });
    renderDrawer();
  }

  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true;
    overlay.hidden = true;
    document.documentElement.classList.remove('favorites-open');
    document.body.classList.remove('favorites-open');
    trigger.setAttribute('aria-expanded', 'false');
    previousFocus?.focus();
  }

  function openDrawer() {
    previousFocus = document.activeElement;
    renderDrawer();
    overlay.hidden = false;
    drawer.hidden = false;
    document.documentElement.classList.add('favorites-open');
    document.body.classList.add('favorites-open');
    trigger.setAttribute('aria-expanded', 'true');
    drawer.focus();
  }

  function placeTriggerBesideAccount() {
    const accountTrigger = document.getElementById('accountTrigger');
    if (!trigger || !accountTrigger) return false;
    if (trigger.nextElementSibling !== accountTrigger) {
      accountTrigger.insertAdjacentElement('beforebegin', trigger);
    }
    trigger.hidden = false;
    return true;
  }

  function createDrawer() {
    if (document.getElementById('favoritesTrigger')) return;
    trigger = document.createElement('button');
    trigger.id = 'favoritesTrigger';
    trigger.className = 'favorites-trigger';
    trigger.type = 'button';
    trigger.hidden = true;
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/></svg><span class="favorites-count">0</span>';

    overlay = document.createElement('div');
    overlay.className = 'favorites-overlay';
    overlay.hidden = true;

    drawer = document.createElement('aside');
    drawer.className = 'favorites-drawer';
    drawer.hidden = true;
    drawer.tabIndex = -1;
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'favoritesTitle');
    drawer.innerHTML = `
      <header><div><p>SİZİN SEÇİMLƏRİNİZ</p><h2 id="favoritesTitle">Favorilər</h2></div><button class="favorites-close" type="button" aria-label="Bağla">×</button></header>
      <div class="favorites-list"></div>`;

    document.body.append(overlay, drawer);
    placeTriggerBesideAccount();
    trigger.addEventListener('click', openDrawer);
    overlay.addEventListener('click', closeDrawer);
    drawer.querySelector('.favorites-close').addEventListener('click', closeDrawer);
    drawer.addEventListener('click', (event) => {
      const remove = event.target.closest('[data-remove-favorite]');
      if (!remove) return;
      const favorites = read();
      delete favorites[remove.dataset.removeFavorite];
      write(favorites);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !drawer.hidden) closeDrawer();
    });
  }

  function init() {
    createDrawer();
    sync();
    const observer = new MutationObserver((records) => {
      placeTriggerBesideAccount();
      if (records.some((record) => [...record.addedNodes].some((node) => node.nodeType === 1 && (node.matches?.(CARD_SELECTOR) || node.querySelector?.(CARD_SELECTOR))))) sync();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    root.addEventListener('storage', (event) => { if (event.key === STORAGE_KEY) sync(); });
    root.addEventListener('bcf:favorites-changed', sync);
  }

  return { STORAGE_KEY, read, write, describe, safeProductUrl, safeImage, init };
});
