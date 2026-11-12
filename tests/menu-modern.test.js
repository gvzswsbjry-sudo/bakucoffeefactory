'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const { DAILY_DISCOUNT, applyMenuFilter, syncDailyDiscountDom, formatAzn } = require('../menu-modern.js');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function makeClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...c) => c.forEach((x) => set.add(x)),
    remove: (...c) => c.forEach((x) => set.delete(x)),
    toggle: (x, force) => {
      if (force === undefined) {
        if (set.has(x)) { set.delete(x); return false; }
        set.add(x);
        return true;
      }
      if (force) set.add(x);
      else set.delete(x);
      return force;
    },
    contains: (x) => set.has(x),
  };
}

test('menyu.html and script.js adopt Version 1 modern theme without dark atmosphere override', () => {
  const html = read('menyu.html');
  assert.ok(html.includes('<main class="menu-page menu-modern">'), 'menyu.html has menu-modern class on main');
  assert.ok(html.includes('href="menu-modern.css'), 'menyu.html links menu-modern.css');
  assert.ok(html.includes('src="menu-modern.js'), 'menyu.html loads menu-modern.js');
  assert.ok(!html.includes('href="menu-background.css"'), 'menyu.html omits legacy dark menu-background.css');
  assert.ok(!html.includes('href="summer-menu.css"'), 'menyu.html removes standalone summer-menu.css');
  assert.ok(!html.includes('id="summerMenu"'), 'menyu.html removes separate summerMenu tab panel');
  for (const drink of [
    'Coffee Creations', 'Bumble Coffee', 'Espresso Tropical', 'Espresso Flower', 'Orange Chocolate',
    'Refreshing Lemonades', 'Mojito', 'Strawberry Lemonade', 'Mango Maracuya', 'Blu Curaçao',
  ]) {
    assert.ok(html.includes(drink), `Ana menyu includes summer item without separate tab: ${drink}`);
  }
  assert.ok(!html.includes('assets/summer-escape/'), 'no summer-escape photos rendered per request');

  const script = read('script.js');
  assert.ok(
    script.includes("Boolean(document.querySelector('.menu-modern'))") && script.includes('!isModernMenuPage'),
    'script.js guards dark menu atmosphere when .menu-modern exists'
  );

  const modernCss = read('menu-modern.css');
  assert.ok(
    modernCss.includes('.site-header .menu-tabs-bar-mobile .menu-tab span:first-child') && modernCss.includes('display: inline;'),
    'menu-modern.css restores visible text span inside mobile menu tabs'
  );
  assert.ok(
    modernCss.includes('.menu-modern .menu-top h1 br'),
    'menu-modern.css keeps line break spacing in mobile menu heading'
  );
  assert.ok(
    modernCss.includes('.menu-modern .menu-group.menu-card p.menu-row span') && modernCss.includes('max-width: none;'),
    'menu-modern.css overrides style.css 65% span cap on menu rows so price chips never clip'
  );
  assert.ok(
    modernCss.includes('@media (min-width: 721px)') && modernCss.includes('@media (min-width: 981px)'),
    'menu-modern.css uses mobile-first progressive min-width breakpoints'
  );
  assert.ok(
    modernCss.includes(':root {') && modernCss.includes('background: #4a5043;') && modernCss.includes('color: #ffffff;'),
    'mobile tab active pill defines root variables and explicit fallback contrast colors outside .menu-modern'
  );
  assert.ok(
    modernCss.includes('flex-wrap: nowrap;') && !modernCss.includes('.menu-row-multi .price-chips {\n  flex: 1 0 100%'),
    'every coffee row places prices cleanly opposite the name rather than wrapping underneath'
  );
  assert.ok(
    modernCss.includes('.site-header .menu-tabs-bar-mobile {\n  position: static;\n  z-index: 1;'),
    'mobile menu tab bar stays at z-index: 1 inside site-header so header dropdowns stay on top'
  );

  const i18nCss = read('i18n.css');
  assert.ok(
    i18nCss.includes('.lang-selector {\n  position: relative;\n  z-index: 10050;') &&
    i18nCss.includes('.site-header .lang-selector {\n    position: absolute !important;\n    z-index: 10050;'),
    'lang-selector keeps high stacking order across desktop and mobile header bars'
  );
});

test('server/routes.js whitelists /menu-modern.css and /menu-modern.js', () => {
  const routes = read('server/routes.js');
  assert.ok(routes.includes("'/menu-modern.css'"), 'routes whitelist /menu-modern.css');
  assert.ok(routes.includes("'/menu-modern.js'"), 'routes whitelist /menu-modern.js');
});

test('daily 50% discount spotlight highlights Latte at exact half price across S/M/L', () => {
  const html = read('menyu.html');
  assert.ok(html.includes('id="dailyOfferCard"'), 'daily offer card exists');
  assert.ok(html.includes('assets/menu/daily-latte.jpg'), 'daily offer uses daily latte photo');
  assert.ok(html.includes('-50%'), 'daily offer highlights -50% discount');
  assert.equal(DAILY_DISCOUNT.itemKey, 'latte');
  assert.equal(DAILY_DISCOUNT.discountPercent, 50);

  for (const p of DAILY_DISCOUNT.prices) {
    assert.equal(Number((p.original * 0.5).toFixed(2)), p.discounted, `Size ${p.size} is exact 50% off`);
    assert.ok(html.includes(formatAzn(p.original)), `HTML lists original price ${formatAzn(p.original)}`);
    assert.ok(html.includes(formatAzn(p.discounted)), `HTML lists discounted price ${formatAzn(p.discounted)}`);
  }
});

test('signature section showcases Baku Coffee Factory Special (Raf/hil/hazelnut/shekerbura) and Filtr coffee (V60)', () => {
  const html = read('menyu.html');
  assert.ok(html.includes('Baku Coffee Factory Special'), 'special signature drink present');
  assert.ok(html.includes('assets/menu/baku-coffee-factory-special.jpg'), 'special signature uses generated Raf/hil/hazelnut image');
  assert.match(html, /raff.*hil.*fındıq əzməsi.*şəkərbura/i, 'special description mentions Raf style, cardamom, hazelnut paste, and shekerbura flavor');
  assert.ok(html.includes('Filtr coffee (V60)'), 'V60 signature drink present');
  assert.ok(html.includes('assets/menu-background/v60.jpg'), 'V60 signature uses crisp V60 bloom image');

  for (const imgPath of [
    'assets/menu/baku-coffee-factory-special.jpg',
    'assets/menu/daily-latte.jpg',
    'assets/menu-background/v60.jpg',
    'assets/dessert-background/cheesecake.jpg',
    'assets/dessert-background/brownie.jpg',
    'assets/dessert-background/tiramisu.jpg',
    'assets/dessert-background/cake.jpg',
    'assets/dessert-background/crepe.jpg',
  ]) {
    assert.ok(fs.existsSync(path.join(ROOT, imgPath)), `asset exists on disk: ${imgPath}`);
  }
});

test('applyMenuFilter and syncDailyDiscountDom toggle category cards and update daily discounted price chips', () => {
  const filterBtns = ['all', 'milk', 'espresso'].map((key) => ({
    dataset: { menuFilter: key },
    classList: makeClassList(key === 'all' ? ['active'] : []),
    attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
  }));
  const cards = ['espresso', 'milk', 'tea'].map((cat) => ({
    dataset: { menuCategory: cat },
    classList: makeClassList(),
  }));
  const signatures = { classList: makeClassList() };
  const cardsGrid = { classList: makeClassList() };
  const latteRow = {
    dataset: { menuItem: 'latte' },
    classList: makeClassList(),
    querySelector: (sel) => (sel === '.price-chips' ? { innerHTML: '' } : null),
  };

  global.document = {
    querySelectorAll: (sel) => {
      if (sel === '.menu-filter-pill[data-menu-filter]') return filterBtns;
      if (sel === '#mainMenu .menu-card[data-menu-category]') return cards;
      if (sel === '#mainMenu .menu-row[data-menu-item]') return [latteRow];
      return [];
    },
    querySelector: (sel) => {
      if (sel === '.menu-signatures') return signatures;
      if (sel === '#mainMenu .menu-cards-grid') return cardsGrid;
      return null;
    },
  };

  try {
    applyMenuFilter('milk');
    assert.equal(signatures.classList.contains('is-hidden'), true);
    assert.equal(cards[0].classList.contains('is-hidden'), true);
    assert.equal(cards[1].classList.contains('is-hidden'), false);
    assert.equal(cardsGrid.classList.contains('is-filtered'), true);

    applyMenuFilter('alt');
    assert.equal(signatures.classList.contains('is-hidden'), false);

    applyMenuFilter('all');
    assert.equal(signatures.classList.contains('is-hidden'), false);
    assert.equal(cards.every((c) => !c.classList.contains('is-hidden')), true);
    assert.equal(cardsGrid.classList.contains('is-filtered'), false);

    const priceHost = { innerHTML: '' };
    latteRow.querySelector = (sel) => (sel === '.price-chips' ? priceHost : null);
    syncDailyDiscountDom(DAILY_DISCOUNT);
    assert.ok(latteRow.classList.contains('menu-row-discount'));
    assert.ok(priceHost.innerHTML.includes('<del>6.80</del><strong>3.40</strong>'));
  } finally {
    delete global.document;
  }
});
