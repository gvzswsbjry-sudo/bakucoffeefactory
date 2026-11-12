'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('index.html, home-coffee-finder.css, and server/routes.js wire the Coffee Finder cleanly', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('href="home-coffee-finder.css'), 'links home-coffee-finder.css');
  assert.ok(html.includes('id="qehve-sec"'), 'renders #qehve-sec Coffee Finder section');
  assert.ok(html.includes('id="homeCoffeeFinderGrid"'), 'renders #homeCoffeeFinderGrid');
  assert.ok(html.includes('id="finderDecafToggle"'), 'renders Decaf toggle control');
  assert.ok(html.includes('id="finderResetBtn"'), 'renders Reset button');
  assert.ok(html.indexOf('id="secilmis"') < html.indexOf('id="qehve-sec"'), 'places finder after featured section');
  assert.ok(html.indexOf('id="qehve-sec"') < html.indexOf('id="haqqimizda"'), 'places finder before about section');

  const routes = fs.readFileSync('server/routes.js', 'utf8');
  assert.ok(routes.includes("'/home-coffee-finder.css'"), 'routes whitelist /home-coffee-finder.css');
  assert.ok(routes.includes("'/home-coffee-finder.js'"), 'routes whitelist /home-coffee-finder.js');

  const css = fs.readFileSync('home-coffee-finder.css', 'utf8');
  assert.ok(css.includes('.coffee-finder-groups'), 'styles parameter groups');
  assert.ok(css.includes('@media (min-width: 640px)'), 'includes tablet breakpoint');
  assert.ok(css.includes('[dir="rtl"] .coffee-finder'), 'includes RTL support');
});

test('home-coffee-finder.js ranks coffees accurately by parameters, handles Decaf/Reset, adds to cart, and translates', () => {
  const finderJs = fs.readFileSync('home-coffee-finder.js', 'utf8');
  const i18nJs = fs.readFileSync('i18n.js', 'utf8');
  const cartUtils = require('../cart-utils.js');
  const realCoffees = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

  const makeMockButton = (attrs = {}) => {
    const classes = new Set();
    const btnListeners = {};
    return {
      dataset: { ...attrs },
      attrs: { 'aria-pressed': 'false' },
      classList: {
        add: (c) => classes.add(c),
        remove: (c) => classes.delete(c),
        toggle: (c, force) => (force ? classes.add(c) : classes.delete(c)),
        contains: (c) => classes.has(c),
      },
      setAttribute(k, v) { this.attrs[k] = String(v); },
      getAttribute(k) { return this.attrs[k]; },
      addEventListener: (t, fn) => { (btnListeners[t] ||= []).push(fn); },
      click() { (btnListeners.click || []).forEach((fn) => fn({ target: this })); },
    };
  };

  const paramBtns = [
    makeMockButton({ finderGroup: 'brew', finderValue: 'espresso' }),
    makeMockButton({ finderGroup: 'brew', finderValue: 'filter' }),
    makeMockButton({ finderGroup: 'brew', finderValue: 'turkish' }),
    makeMockButton({ finderGroup: 'brew', finderValue: 'french' }),
    makeMockButton({ finderGroup: 'flavor', finderValue: 'nutty' }),
    makeMockButton({ finderGroup: 'flavor', finderValue: 'fruity' }),
    makeMockButton({ finderGroup: 'flavor', finderValue: 'intense' }),
    makeMockButton({ finderGroup: 'body', finderValue: 'light' }),
    makeMockButton({ finderGroup: 'body', finderValue: 'medium' }),
    makeMockButton({ finderGroup: 'body', finderValue: 'full' }),
    makeMockButton({ finderGroup: 'acidity', finderValue: 'low' }),
    makeMockButton({ finderGroup: 'acidity', finderValue: 'balanced' }),
    makeMockButton({ finderGroup: 'acidity', finderValue: 'bright' }),
  ];

  const decafBtn = makeMockButton();
  const resetBtn = makeMockButton();
  const summaryEl = {
    attrs: { 'data-i18n': 'finderSummaryPair' },
    textContent: 'Parametrlərinizə ən uyğun 2 qəhvə',
    setAttribute(k, v) { this.attrs[k] = String(v); },
  };
  const gridListeners = {};
  const gridEl = {
    innerHTML: '',
    dataset: {},
    querySelectorAll: () => [],
    addEventListener: (t, fn) => { (gridListeners[t] ||= []).push(fn); },
  };
  const sectionEl = {
    querySelectorAll: (selector) => {
      if (selector.includes('data-finder-group')) return paramBtns;
      return [];
    },
  };
  const toastEl = { hidden: true, textContent: '' };
  const listeners = {};
  const memoryStorage = {};

  const windowObj = {
    location: { pathname: '/index.html' },
    addEventListener: (t, fn) => { (listeners[t] ||= []).push(fn); },
    dispatchEvent: (ev) => { (listeners[ev.type] || []).forEach((fn) => fn(ev)); },
    loadSharedCart: cartUtils.loadSharedCart,
    saveSharedCart: cartUtils.saveSharedCart,
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
        'qehve-sec': sectionEl,
        homeCoffeeFinderGrid: gridEl,
        finderDecafToggle: decafBtn,
        finderResetBtn: resetBtn,
        finderSummaryText: summaryEl,
        homeCartToast: toastEl,
      }[id] || null),
      querySelector: () => null,
      querySelectorAll: () => [],
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
  global.localStorage = sandbox.localStorage;
  global.window = sandbox.window;
  vm.runInContext(finderJs, sandbox);

  const finder = sandbox.window.BCFCoffeeFinder;
  assert.ok(finder, 'exposes window.BCFCoffeeFinder');

  // 1. Default profile (Espresso + Chocolate/Nutty + Full + Low acidity) returns top 2 coffees (Brasil & Uqanda)
  const defaultMatches = gridEl.innerHTML.match(/data-product-id="([^"]+)"/g) || [];
  assert.equal(defaultMatches.length, 2, 'renders top 2 recommended coffee cards for close default matches');
  assert.equal(gridEl.dataset.resultCount, '2');
  assert.equal(defaultMatches[0], 'data-product-id="brasil"', 'Brasil ranks #1 for default espresso nutty full low-acidity profile');
  assert.equal(defaultMatches[1], 'data-product-id="uqanda"', 'Uqanda ranks #2');

  // 2. Switching manually to Filter + Fruity + Light + Bright returns top 2 (Efiopiya & Keniya)
  paramBtns.find((b) => b.dataset.finderValue === 'filter').click();
  paramBtns.find((b) => b.dataset.finderValue === 'fruity').click();
  paramBtns.find((b) => b.dataset.finderValue === 'light').click();
  paramBtns.find((b) => b.dataset.finderValue === 'bright').click();

  const filterMatches = gridEl.innerHTML.match(/data-product-id="([^"]+)"/g) || [];
  assert.equal(filterMatches.length, 2, 'renders top 2 coffees when top picks are close');
  assert.equal(filterMatches[0], 'data-product-id="efiopiya"', 'Efiopiya ranks #1 for bright fruity filter');
  assert.ok(gridEl.innerHTML.includes('data-product-id="keniya"'), 'includes Keniya as #2');

  // 3. Turkish + Intense + Full + Low prioritizes Uqanda / Robusta (top 1 or 2)
  paramBtns.find((b) => b.dataset.finderValue === 'turkish').click();
  paramBtns.find((b) => b.dataset.finderValue === 'intense').click();
  paramBtns.find((b) => b.dataset.finderValue === 'full').click();
  paramBtns.find((b) => b.dataset.finderValue === 'low').click();
  const intenseMatches = gridEl.innerHTML.match(/data-product-id="([^"]+)"/g) || [];
  assert.ok(intenseMatches.length >= 1 && intenseMatches.length <= 2, 'always shows 1 or 2 matches');
  assert.ok(['data-product-id="uqanda"', 'data-product-id="robusta"'].includes(intenseMatches[0]), 'Uqanda or Robusta leads intense Turkish profile');

  // 4. Decaf toggle focuses on the single Decaf match (1 card)
  decafBtn.click();
  const decafMatches = gridEl.innerHTML.match(/data-product-id="([^"]+)"/g) || [];
  assert.equal(decafMatches.length, 1, 'shows only 1 card when Decaf filter is active');
  assert.equal(gridEl.dataset.resultCount, '1');
  assert.equal(summaryEl.attrs['data-i18n'], 'finderSummarySingle');
  assert.equal(decafMatches[0], 'data-product-id="decaf"', 'Decaf is the sole card when Decaf filter is active');
  assert.equal(decafBtn.getAttribute('aria-pressed'), 'true');

  // 5. Sold-out items are pushed below available ones
  const cloned = realCoffees.map((c) => (c.id === 'brasil' ? { ...c, stock: { status: 'out', quantity: 0 } } : c));
  const soldOutTest = finder.rankCoffees(cloned, { brew: 'espresso', flavor: 'nutty', body: 'full', acidity: 'low', decafOnly: false }, 4);
  assert.notEqual(soldOutTest[0].item.id, 'brasil', 'demotes sold-out top match below available coffees');

  // 6. Reset returns to default criteria and Brasil #1
  resetBtn.click();
  assert.equal(decafBtn.getAttribute('aria-pressed'), 'false');
  const resetMatches = gridEl.innerHTML.match(/data-product-id="([^"]+)"/g) || [];
  assert.equal(resetMatches[0], 'data-product-id="brasil"', 'Reset restores default Brasil #1');

  // 7. Clicking add adds 100g to unified cart
  const addBtn = {
    disabled: false,
    isConnected: true,
    dataset: { finderAdd: 'brasil' },
    textContent: 'Səbətə əlavə et',
    classList: { add: () => {}, remove: () => {} },
  };
  gridListeners.click.forEach((fn) => fn({ target: { closest: () => addBtn } }));
  const cart = JSON.parse(memoryStorage['bcf-equipment-cart-v1']);
  assert.equal(cart['coffee-brasil'].quantity, 100);
  assert.equal(cart['coffee-brasil'].price, 10);
  assert.equal(toastEl.hidden, false);

  // 8. Switching language to English dynamically translates match badges, specs, and coffee notes
  sandbox.window.BCF_I18N.setLanguage('en');
  assert.ok(gridEl.innerHTML.includes('Best match'), 'translates top match badge to English');
  assert.ok(gridEl.innerHTML.includes('Body 4/5'), 'translates spec label to English');
  assert.ok(gridEl.innerHTML.includes('Add to Cart'), 'translates add button to English');

  delete global.localStorage;
  delete global.window;
});
