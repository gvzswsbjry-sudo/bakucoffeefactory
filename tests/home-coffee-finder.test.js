'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('index.html links to qehveler.html#qehve-sec and qehveler.html + qehve-secici.html embed interactive coffee finder', () => {
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  assert.ok(indexHtml.includes('href="qehveler.html#qehve-sec"'), 'index.html directs CTA straight to #qehve-sec on qehveler.html');
  assert.ok(indexHtml.includes('data-i18n="homeFinderCtaButton"'), 'index.html renders CTA button label');
  assert.ok(!indexHtml.includes('id="finderBodyRange"'), 'index.html stays clean without inline range sliders');

  const coffeeHtml = fs.readFileSync('qehveler.html', 'utf8');
  assert.ok(coffeeHtml.includes('id="qehve-sec"'), 'qehveler.html includes #qehve-sec anchor at bottom');
  assert.ok(coffeeHtml.includes('id="finderBodyRange"'), 'qehveler.html includes Body range slider');
  assert.ok(coffeeHtml.includes('id="finderAcidityRange"'), 'qehveler.html includes Acidity range slider');
  assert.ok(coffeeHtml.includes('id="finderBalanceRange"'), 'qehveler.html includes Balance range slider');
  assert.ok(coffeeHtml.includes('id="homeCoffeeFinderGrid"'), 'qehveler.html renders recommendation grid');
  assert.ok(coffeeHtml.includes('home-coffee-finder.css'), 'qehveler.html loads home-coffee-finder.css');
  assert.ok(coffeeHtml.includes('home-coffee-finder.js'), 'qehveler.html loads home-coffee-finder.js');

  const storefrontJs = fs.readFileSync('storefront-products.js', 'utf8');
  assert.ok(storefrontJs.includes('id="coffee-${esc(item.id)}"'), 'storefront-products.js sets coffee anchor IDs');

  const finderHtml = fs.readFileSync('qehve-secici.html', 'utf8');
  assert.ok(finderHtml.includes('id="finderBodyRange"'), 'qehve-secici.html includes Body range slider');
  assert.ok(finderHtml.includes('id="finderAcidityRange"'), 'qehve-secici.html includes Acidity range slider');
  assert.ok(finderHtml.includes('id="finderBalanceRange"'), 'qehve-secici.html includes Balance range slider');
  assert.ok(finderHtml.includes('id="homeCoffeeFinderGrid"'), 'qehve-secici.html renders recommendation grid');
  assert.ok(finderHtml.includes('id="cartDrawer"'), 'qehve-secici.html includes unified cart drawer');
  assert.ok(finderHtml.includes('home-coffee-finder.js'), 'qehve-secici.html loads home-coffee-finder.js');

  const routes = fs.readFileSync('server/routes.js', 'utf8');
  assert.ok(routes.includes("'/qehve-secici.html'"), 'routes whitelist /qehve-secici.html');
  assert.ok(routes.includes("'/home-coffee-finder.css'"), 'routes whitelist /home-coffee-finder.css');
  assert.ok(routes.includes("'/home-coffee-finder.js'"), 'routes whitelist /home-coffee-finder.js');

  const css = fs.readFileSync('home-coffee-finder.css', 'utf8');
  assert.ok(css.includes('.home-finder-cta-btn'), 'styles homepage CTA button');
  assert.ok(css.includes('.finder-range-input'), 'styles custom range sliders');
  assert.ok(css.includes('[dir="rtl"] .finder-range-input'), 'handles RTL slider alignment');
});

test('home-coffee-finder.js updates live on range slider drag, picks 1 or 2 matches, handles Decaf/Reset, cart & i18n', () => {
  const finderJs = fs.readFileSync('home-coffee-finder.js', 'utf8');
  const i18nJs = fs.readFileSync('i18n.js', 'utf8');
  const cartUtils = require('../cart-utils.js');
  const realCoffees = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

  const makeSlider = (initial) => {
    const ev = {};
    const styles = {};
    return {
      value: String(initial),
      style: { setProperty: (k, v) => { styles[k] = v; }, getPropertyValue: (k) => styles[k] },
      addEventListener: (t, fn) => { (ev[t] ||= []).push(fn); },
      slideTo(next) {
        this.value = String(next);
        (ev.input || []).forEach((fn) => fn({ target: this }));
      },
    };
  };

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

  const bodyRange = makeSlider(4);
  const acidityRange = makeSlider(2);
  const balanceRange = makeSlider(4.5);
  const bodyValEl = { textContent: '' };
  const acidityValEl = { textContent: '' };
  const balanceValEl = { textContent: '' };

  const paramBtns = [
    makeMockButton({ finderGroup: 'brew', finderValue: 'any' }),
    makeMockButton({ finderGroup: 'brew', finderValue: 'espresso' }),
    makeMockButton({ finderGroup: 'brew', finderValue: 'filter' }),
    makeMockButton({ finderGroup: 'brew', finderValue: 'turkish' }),
    makeMockButton({ finderGroup: 'brew', finderValue: 'french' }),
    makeMockButton({ finderGroup: 'flavor', finderValue: 'any' }),
    makeMockButton({ finderGroup: 'flavor', finderValue: 'nutty' }),
    makeMockButton({ finderGroup: 'flavor', finderValue: 'fruity' }),
    makeMockButton({ finderGroup: 'flavor', finderValue: 'intense' }),
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
    querySelectorAll: (selector) => (selector.includes('data-finder-group') ? paramBtns : []),
  };
  const toastEl = { hidden: true, textContent: '' };
  const listeners = {};
  const memoryStorage = {};

  const windowObj = {
    location: { pathname: '/qehve-secici.html' },
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
        'qehve-sec': sectionEl,
        homeCoffeeFinderGrid: gridEl,
        finderDecafToggle: decafBtn,
        finderResetBtn: resetBtn,
        finderSummaryText: summaryEl,
        finderBodyRange: bodyRange,
        finderAcidityRange: acidityRange,
        finderBalanceRange: balanceRange,
        finderBodyVal: bodyValEl,
        finderAcidityVal: acidityValEl,
        finderBalanceVal: balanceValEl,
        homeCartToast: toastEl,
        cartItems: null,
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

  // 1. Default slider values (Body 4, Acidity 2, Balance 4.5) render Brasil & set readouts + --pct
  assert.equal(bodyValEl.textContent, '4.0 / 5');
  assert.equal(acidityValEl.textContent, '2.0 / 5');
  assert.equal(balanceValEl.textContent, '4.5 / 5');
  assert.equal(bodyRange.style.getPropertyValue('--pct'), '75%');
  const defaultMatches = gridEl.innerHTML.match(/data-product-id="([^"]+)"/g) || [];
  assert.ok(defaultMatches.length >= 1 && defaultMatches.length <= 2, 'shows 1 or 2 matches');
  assert.equal(defaultMatches[0], 'data-product-id="brasil"', 'Brasil ranks #1 at Body 4 / Acidity 2 / Balance 4.5');

  // 2. Sliding sliders manually toward light fruity (Body 2.5, Acidity 4.5, Balance 4.0) selects Efiopiya & Keniya
  bodyRange.slideTo(2.5);
  acidityRange.slideTo(4.5);
  balanceRange.slideTo(4.0);
  assert.equal(bodyValEl.textContent, '2.5 / 5');
  assert.equal(acidityValEl.textContent, '4.5 / 5');
  const brightMatches = gridEl.innerHTML.match(/data-product-id="([^"]+)"/g) || [];
  assert.equal(brightMatches.length, 2, 'renders 2 bright/fruity matches (Efiopiya & Keniya)');
  assert.equal(brightMatches[0], 'data-product-id="efiopiya"', 'Efiopiya leads bright/light profile');
  assert.equal(brightMatches[1], 'data-product-id="keniya"', 'Keniya follows closely');

  // 3. Sliding to maximum bold (Body 5.0, Acidity 1.5, Balance 3.0) isolates Robusta as standout #1
  bodyRange.slideTo(5);
  acidityRange.slideTo(1.5);
  balanceRange.slideTo(3);
  const boldMatches = gridEl.innerHTML.match(/data-product-id="([^"]+)"/g) || [];
  assert.equal(boldMatches.length, 1, 'narrows to 1 exact standout card when Robusta dominates');
  assert.equal(boldMatches[0], 'data-product-id="robusta"');
  assert.equal(summaryEl.attrs['data-i18n'], 'finderSummarySingle');

  // 4. Decaf toggle always isolates 1 Decaf card
  decafBtn.click();
  const decafMatches = gridEl.innerHTML.match(/data-product-id="([^"]+)"/g) || [];
  assert.equal(decafMatches.length, 1);
  assert.equal(decafMatches[0], 'data-product-id="decaf"');

  // 5. Sold-out demotion works cleanly
  const cloned = realCoffees.map((c) => (c.id === 'brasil' ? { ...c, stock: { status: 'out', quantity: 0 } } : c));
  const soldOutTop = finder.rankCoffees(cloned, { body: 4, acidity: 2, balance: 4.5, brew: 'any', flavor: 'any', decafOnly: false }, 2);
  assert.notEqual(soldOutTop[0].item.id, 'brasil', 'demotes sold-out coffee');

  // 6. Reset restores initial sliders + Brasil
  resetBtn.click();
  assert.equal(bodyValEl.textContent, '4.0 / 5');
  assert.equal(decafBtn.getAttribute('aria-pressed'), 'false');
  const resetMatches = gridEl.innerHTML.match(/data-product-id="([^"]+)"/g) || [];
  assert.equal(resetMatches[0], 'data-product-id="brasil"');

  // 7. Cart add + language switch
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
  assert.equal(toastEl.hidden, false);

  sandbox.window.BCF_I18N.setLanguage('en');
  assert.ok(gridEl.innerHTML.includes('Best match'), 'translates match badge');
  assert.ok(gridEl.innerHTML.includes('Balance 4.5'), 'translates Balance stat');

  delete global.localStorage;
  delete global.window;
});
