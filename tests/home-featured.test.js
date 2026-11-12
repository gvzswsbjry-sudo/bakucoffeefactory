'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('index.html wires mobile-first Featured Products section, cart drawer, and scripts in order', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('href="cart.css'), 'links cart.css');
  assert.ok(html.includes('href="home-featured.css'), 'links home-featured.css');
  assert.ok(html.includes('id="secilmis"'), 'renders #secilmis featured section');
  assert.ok(html.includes('id="homeFeaturedGrid"'), 'renders #homeFeaturedGrid');
  assert.ok(html.includes('data-featured-filter="all"'), 'renders All filter');
  assert.ok(html.includes('data-featured-filter="coffee"'), 'renders Coffee filter');
  assert.ok(html.includes('data-featured-filter="tea"'), 'renders Tea filter');
  assert.ok(html.includes('data-featured-filter="equipment"'), 'renders Equipment filter');
  assert.ok(html.includes('id="homeCartToast"'), 'includes toast element');
  assert.ok(html.includes('id="cartDrawer"'), 'includes unified cart drawer');
  assert.ok(html.includes('id="floatingCartTrigger"'), 'includes floating cart button');
  assert.ok(!html.includes('id="headerCartTrigger"'), 'does not duplicate header cart button');

  const posI18n = html.indexOf('i18n.js');
  const posScript = html.indexOf('script.js');
  const posStore = html.indexOf('storefront-products.js');
  const posCart = html.indexOf('cart-utils.js');
  const posFeatured = html.indexOf('home-featured.js');
  assert.ok(posI18n < posScript && posScript < posStore && posStore < posCart && posCart < posFeatured, 'loads homepage scripts in dependency order');
});

test('home-featured.css uses mobile-first breakpoints and RTL overrides', () => {
  const css = fs.readFileSync('home-featured.css', 'utf8');
  assert.ok(css.includes('grid-template-columns: 1fr;'), 'base grid is 1-column mobile-first');
  assert.ok(css.includes('@media (min-width: 640px)'), 'scales to 2-col at 640px');
  assert.ok(css.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'), 'sets 2 columns at tablet width');
  assert.ok(css.includes('@media (min-width: 1080px)'), 'scales to 4-col at 1080px');
  assert.ok(css.includes('grid-template-columns: repeat(4, minmax(0, 1fr))'), 'sets 4 columns at desktop width');
  assert.ok(css.includes('[dir="rtl"] .home-featured-badge'), 'positions badges cleanly in RTL');
  assert.ok(css.includes('[dir="rtl"] .home-featured-card .favorite-toggle'), 'positions favorite button cleanly in RTL');
});

test('server/routes.js and favorites modules support home-featured storefront assets', () => {
  const routes = fs.readFileSync('server/routes.js', 'utf8');
  assert.ok(routes.includes("'/home-featured.css'"), 'routes whitelist /home-featured.css');
  assert.ok(routes.includes("'/home-featured.js'"), 'routes whitelist /home-featured.js');

  const favJs = fs.readFileSync('favorites.js', 'utf8');
  const favCss = fs.readFileSync('favorites.css', 'utf8');
  assert.ok(favJs.includes('.home-featured-card'), 'favorites.js attaches hearts to .home-featured-card');
  assert.ok(favCss.includes('.home-featured-card'), 'favorites.css sets relative positioning on .home-featured-card');
});

test('home-featured.js renders curated cards, switches category filters, adds items to unified cart, and translates on language switch', () => {
  const featuredJs = fs.readFileSync('home-featured.js', 'utf8');
  const i18nJs = fs.readFileSync('i18n.js', 'utf8');
  const cartUtils = require('../cart-utils.js');

  const listeners = {};
  const filterBtns = ['all', 'coffee', 'tea', 'equipment'].map((filter) => {
    const cls = new Set(filter === 'all' ? ['home-featured-filter', 'active'] : ['home-featured-filter']);
    const attrs = { 'aria-pressed': String(filter === 'all') };
    const btnListeners = {};
    return {
      dataset: { featuredFilter: filter },
      classList: {
        toggle: (name, force) => (force ? cls.add(name) : cls.delete(name)),
        contains: (name) => cls.has(name),
      },
      setAttribute: (k, v) => { attrs[k] = String(v); },
      getAttribute: (k) => attrs[k],
      addEventListener: (t, fn) => { (btnListeners[t] ||= []).push(fn); },
      click: () => (btnListeners.click || []).forEach((fn) => fn()),
    };
  });

  const labelEl = {
    attrs: { 'data-i18n': 'homeFeaturedAll' },
    textContent: 'Bütün məhsullara bax',
    setAttribute(k, v) { this.attrs[k] = String(v); },
  };
  const allLinkEl = {
    attrs: { href: 'qehveler.html' },
    setAttribute(k, v) { this.attrs[k] = String(v); },
    querySelector: () => labelEl,
  };
  const gridListeners = {};
  const gridEl = {
    innerHTML: '',
    querySelectorAll: () => [],
    addEventListener: (t, fn) => { (gridListeners[t] ||= []).push(fn); },
  };
  const toastEl = { hidden: true, textContent: '' };
  const memoryStorage = {};

  const windowObj = {
    location: { pathname: '/index.html' },
    addEventListener: (t, fn) => { (listeners[t] ||= []).push(fn); },
    dispatchEvent: (ev) => { (listeners[ev.type] || []).forEach((fn) => fn(ev)); },
    loadSharedCart: cartUtils.loadSharedCart,
    saveSharedCart: cartUtils.saveSharedCart,
    applyCartAction: cartUtils.applyCartAction,
    syncUnifiedCartDom: () => {},
  };

  const sandbox = {
    window: windowObj,
    globalThis: windowObj,
    document: {
      readyState: 'complete',
      documentElement: { lang: 'az', dir: 'ltr' },
      body: { classList: { add: () => {}, remove: () => {} } },
      getElementById: (id) => ({
        homeFeaturedGrid: gridEl,
        homeFeaturedAllLink: allLinkEl,
        homeCartToast: toastEl,
        cartItems: null,
      }[id] || null),
      querySelector: () => null,
      querySelectorAll: (sel) => (sel === '.home-featured-filter' ? filterBtns : []),
      addEventListener: () => {},
    },
    localStorage: {
      getItem: (k) => memoryStorage[k] || null,
      setItem: (k, v) => { memoryStorage[k] = String(v); },
    },
    CustomEvent: class {
      constructor(type, init) {
        this.type = type;
        this.detail = init?.detail;
      }
    },
    setTimeout,
    clearTimeout,
  };

  vm.createContext(sandbox);
  vm.runInContext(i18nJs, sandbox);
  // Make cart-utils share the same localStorage inside sandbox
  global.localStorage = sandbox.localStorage;
  global.window = sandbox.window;
  vm.runInContext(featuredJs, sandbox);

  // Default "all" view renders 4 curated items including Colombia & Melisa
  assert.ok(gridEl.innerHTML.includes('data-product-id="colombia"'), 'renders Colombia');
  assert.ok(gridEl.innerHTML.includes('data-product-id="melisa"'), 'renders Melisa Çayı');
  assert.ok(gridEl.innerHTML.includes('data-product-id="wheel-grinder"'), 'renders wheel-grinder');
  assert.ok(gridEl.innerHTML.includes('data-product-id="millifincan"'), 'renders millifincan');

  // Switching to tea updates grid & footer link
  filterBtns[2].click();
  assert.equal(allLinkEl.attrs.href, 'caylar.html');
  assert.equal(labelEl.attrs['data-i18n'], 'homeFeaturedAllTea');
  assert.ok(gridEl.innerHTML.includes('Melisa Çayı'));
  assert.ok(!gridEl.innerHTML.includes('data-product-id="colombia"'));

  // Clicking "add" for Melisa adds 100g to unified cart
  filterBtns[0].click();
  const addBtn = {
    disabled: false,
    isConnected: true,
    dataset: { featuredAdd: 'melisa' },
    textContent: 'Səbətə əlavə et',
    classList: { add: () => {}, remove: () => {} },
  };
  gridListeners.click.forEach((fn) => fn({ target: { closest: () => addBtn } }));
  const cart = JSON.parse(memoryStorage['bcf-equipment-cart-v1']);
  assert.equal(cart['tea-melisa'].quantity, 100);
  assert.equal(cart['tea-melisa'].price, 9);
  assert.equal(toastEl.hidden, false);

  // Switching language to English translates dynamically
  sandbox.window.BCF_I18N.setLanguage('en');
  assert.ok(gridEl.innerHTML.includes('Melissa Tea'), 'renders English product title after language change');
  assert.ok(gridEl.innerHTML.includes('Add to Cart'), 'renders English CTA button');

  delete global.localStorage;
  delete global.window;
});
