'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function createSandbox(pathname = '/index.html') {
  return {
    window: {
      location: { pathname },
      dispatchEvent: () => {},
      addEventListener: () => {},
    },
    CustomEvent: class CustomEvent {
      constructor(type, init) {
        this.type = type;
        this.detail = init?.detail;
      }
    },
    document: {
      addEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      documentElement: { lang: 'az', dir: 'ltr' },
      body: { classList: { remove: () => {}, add: () => {} } },
    },
    localStorage: { getItem: () => null, setItem: () => {} },
  };
}

test('i18n module provides az, en, ru, and ar with matching dictionaries', () => {
  const content = fs.readFileSync('i18n.js', 'utf8');
  assert.ok(content.includes("az: {"), 'contains az dictionary');
  assert.ok(content.includes("en: {"), 'contains en dictionary');
  assert.ok(content.includes("ru: {"), 'contains ru dictionary');
  assert.ok(content.includes("ar: {"), 'contains ar dictionary');
  assert.ok(content.includes("data-lang=\"ru\""), 'contains Russian dropdown button');
  assert.ok(content.includes("🇷🇺"), 'contains Russian flag in selector');
  assert.ok(content.includes("dir: 'rtl'"), 'Arabic is configured as RTL');
  assert.ok(content.includes("ru: { code: 'ru', name: 'Русский'"), 'Russian language metadata configured');
});

test('server routes whitelist /i18n.css and /i18n.js in PUBLIC_FILES', () => {
  const routesContent = fs.readFileSync('server/routes.js', 'utf8');
  assert.ok(routesContent.includes("'/i18n.css'"), 'routes.js whitelists /i18n.css');
  assert.ok(routesContent.includes("'/i18n.js'"), 'routes.js whitelists /i18n.js');
});

test('all storefront HTML files include i18n resources', () => {
  const files = ['index.html', 'qehveler.html', 'caylar.html', 'avadanliqlar.html', 'mehsul.html', 'menyu.html', 'mexfilik.html'];
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    assert.ok(html.includes('i18n.css'), `${file} must include i18n.css`);
    assert.ok(html.includes('i18n.js'), `${file} must include i18n.js`);
  }
});

test('script.js ensures i18n is dynamically loaded and updates menu headings with data-i18n', () => {
  const script = fs.readFileSync('script.js', 'utf8');
  assert.ok(script.includes('i18n.css'), 'script.js links i18n.css');
  assert.ok(script.includes('i18n.js'), 'script.js links i18n.js');
  assert.ok(script.includes('menuIntroHeading.setAttribute(\'data-i18n\''), 'script.js sets data-i18n on menu intro heading');
});

test('i18n script contains infinite-loop guard and does not observe entire main tree', () => {
  const content = fs.readFileSync('i18n.js', 'utf8');
  assert.ok(content.includes('let isTranslating = false;'), 'has isTranslating mutex');
  assert.ok(content.includes('window.__BCF_I18N_INITIALIZED__'), 'has singleton initialization guard');
  assert.ok(!content.includes('observer.observe(main'), 'does NOT attach unthrottled mutation observer to entire main');
});

test('i18n css enforces dropdown visibility rules and RTL header collision prevention', () => {
  const css = fs.readFileSync('i18n.css', 'utf8');
  assert.ok(css.includes('.lang-dropdown[hidden]'), 'has explicit [hidden] display:none rule');
  assert.ok(css.includes('[dir="rtl"] .site-header'), 'has RTL site-header rule');
  assert.ok(css.includes('direction: ltr !important'), 'preserves header structural direction to prevent collisions');
  assert.ok(css.includes('[dir="rtl"] .site-header .main-nav a'), 'has explicit Arabic navigation link styling');
  assert.ok(css.includes('font-size: 13px !important'), 'desktop Arabic nav link size matches Latin uppercase presence');
  assert.ok(css.includes('font-size: 11px !important'), 'mobile Arabic nav link size matches Latin presence');
});

test('cart-utils.js provides Russian formatting for quantities, units, and categories', () => {
  const cartUtils = require('../cart-utils.js');

  // Test with mock window language 'ru'
  global.window = {
    BCF_I18N: {
      getLanguage: () => 'ru',
    },
  };

  const gramItem = { quantity: 250, unit: 'g' };
  const pieceItem = { quantity: 2, unit: 'piece' };

  assert.equal(cartUtils.formatCartItemQuantity(gramItem), '250 г');
  assert.equal(cartUtils.formatCartItemQuantity(pieceItem), '2 шт.');
  assert.equal(cartUtils.formatCartCount({ a: { quantity: 3, unit: 'piece' } }), '3 шт.');
  assert.equal(cartUtils.getProductCategory('coffee-colombia'), 'Кофе');
  assert.equal(cartUtils.getProductCategory('tea-1001'), 'Чай');
  assert.equal(cartUtils.getProductCategory('gear-tamper'), 'Оборудование');

  delete global.window;
});

test('tea-shop.js attaches data-i18n attributes to summary and pending price buttons', () => {
  const teaShopContent = fs.readFileSync('tea-shop.js', 'utf8');
  assert.ok(teaShopContent.includes('data-i18n="moreDetails"'), 'tea-shop.js adds data-i18n="moreDetails"');
  assert.ok(teaShopContent.includes('data-i18n="pricePending"'), 'tea-shop.js adds data-i18n="pricePending"');
  assert.ok(teaShopContent.includes('data-i18n="addToOrderRequest"'), 'tea-shop.js adds data-i18n="addToOrderRequest"');
});

test('menyu.html has data-i18n on page heading and menu tabs', () => {
  const menuHtml = fs.readFileSync('menyu.html', 'utf8');
  assert.ok(menuHtml.includes('data-i18n="menuHeadingDrink"'), 'menyu.html has data-i18n="menuHeadingDrink" on h1');
  assert.ok(menuHtml.includes('data-i18n="tabMainMenu"'), 'menyu.html has data-i18n="tabMainMenu"');
  assert.ok(menuHtml.includes('data-i18n="tabSummerMenu"'), 'menyu.html has data-i18n="tabSummerMenu"');
  assert.ok(menuHtml.includes('data-i18n="tabDessertMenu"'), 'menyu.html has data-i18n="tabDessertMenu"');
});

test('i18n PHRASE_MAP translates all coffees, teas, equipment, menu items, and dynamic catalog descriptions into English, Arabic, and Russian', () => {
  const content = fs.readFileSync('i18n.js', 'utf8');
  const sandbox = createSandbox('/qehveler.html');
  vm.createContext(sandbox);
  vm.runInContext(content, sandbox);
  const phraseMap = sandbox.window.BCF_I18N.PHRASE_MAP;
  assert.ok(phraseMap, 'PHRASE_MAP is exported');

  // 1. Coffees
  const coffeeOrigins = ['Colombia', 'Guatemala', 'Brasil', 'Honduras', 'Robusta', 'Costa Rica', 'Efiopiya', 'Keniya', 'Decaf', 'Uqanda'];
  for (const c of coffeeOrigins) {
    assert.ok(phraseMap[c]?.en, `Coffee ${c} has English translation`);
    assert.ok(phraseMap[c]?.ar, `Coffee ${c} has Arabic translation`);
    assert.ok(phraseMap[c]?.ru, `Coffee ${c} has Russian translation`);
  }

  // 2. Coffee short descriptions from products.json
  const coffeeDescs = [
    'Yumşaq şirinliyi, canlı meyvə xarakteri və kakaolu bitişi ilə balanslı gündəlik qəhvə.',
    'Dərin, klassik və şokoladlı gövdəsi olan çox yönlü qəhvə.',
    'Aşağı turşuluqlu, kremli və şokoladlı espresso profili.',
    'Meyvə təravəti və kakaolu rahatlığı birləşdirən canlı profil.',
    'Güclü, intensiv və dolğun içim üçün seçilən qəhvə.',
    'Parlaq turşuluq və balabənzər şirinliyi olan təmiz fincan.',
    'Ətirli, zərif və parlaq xarakterli, çayabənzər yüngül fincan.',
    'Şirəli meyvə xarakteri və parlaq turşuluğu ilə ifadəli qəhvə.',
    'Kofeinsiz, yumşaq və dolğun qəhvə seçimi.',
    'Dolğun bədənli, aşağı–orta turşuluqlu və uzun kakaolu fincan.',
  ];
  for (const desc of coffeeDescs) {
    assert.ok(phraseMap[desc]?.en, `Coffee desc "${desc.slice(0, 20)}..." has English translation`);
    assert.ok(phraseMap[desc]?.ar, `Coffee desc "${desc.slice(0, 20)}..." has Arabic translation`);
    assert.ok(phraseMap[desc]?.ru, `Coffee desc "${desc.slice(0, 20)}..." has Russian translation`);
  }

  // 3. Teas
  const teaNames = [
    '1001 Gecə Çayı', 'Admiral', 'Geyşa Qara', 'Jasmin Çayı', 'Limon Çayı',
    'Malina Şərbəti', 'Meyvəli Çay', 'Nar Çayı', 'Portağal Çayı', 'Qarpız Çayı',
    'Geyşa Yaşıl', 'Yaşıl Çay', 'Mango Kürəsi', 'Mango Çayı', 'Qara Çay',
    'Jasminli Qara Çay', 'Hibiskus'
  ];
  for (const t of teaNames) {
    assert.ok(phraseMap[t]?.en, `Tea ${t} has English translation`);
    assert.ok(phraseMap[t]?.ar, `Tea ${t} has Arabic translation`);
    assert.ok(phraseMap[t]?.ru, `Tea ${t} has Russian translation`);
  }

  // 4. Equipment
  const equipmentNames = [
    'French Press', 'Əl dəyirmanı', 'Naxışlı əl dəyirmanı', 'Moka Pot',
    'Naxışlı cezvə', 'Gooseneck çaydan', 'Naxışlı Dallah', 'Manual Press',
    'Çarxlı əl dəyirmanı', 'Şüşə server · 400 ml', 'Azərbaycan qəhvə dəsti',
    'Espresso tamper', 'Şərq üslublu servis dəsti', 'Tamper', 'Fincan',
    'Fincan(handmade)', 'Milli Fincan (qaşıqlı)'
  ];
  for (const eq of equipmentNames) {
    assert.ok(phraseMap[eq]?.en, `Equipment ${eq} has English translation`);
    assert.ok(phraseMap[eq]?.ar, `Equipment ${eq} has Arabic translation`);
    assert.ok(phraseMap[eq]?.ru, `Equipment ${eq} has Russian translation`);
  }

  // 5. Menu Items
  const menuItems = [
    'Espresso (Single)', 'Triple Joy', 'Americano (S / M / L)', 'Latte (S / M / L)',
    'Türk qəhvəsi', 'İsti şokolad', 'Bumble Coffee', 'Mojito', 'San Sebastian', 'Ballı tort',
    'Bir fincan seçin.', 'Şirin bir fasilə.', 'Ana menyu', 'Summer menu', 'Desert', 'Fresh Lemonades'
  ];
  for (const item of menuItems) {
    assert.ok(phraseMap[item]?.en, `Menu item ${item} has English translation`);
    assert.ok(phraseMap[item]?.ar, `Menu item ${item} has Arabic translation`);
    assert.ok(phraseMap[item]?.ru, `Menu item ${item} has Russian translation`);
  }
});

test('every storefront HTML page includes data-i18n on header navigation links', () => {
  const files = ['index.html', 'qehveler.html', 'caylar.html', 'avadanliqlar.html', 'mehsul.html', 'menyu.html', 'mexfilik.html'];
  const requiredKeys = ['navHome', 'navCoffee', 'navTea', 'navEquipment', 'navMenu'];
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    for (const key of requiredKeys) {
      assert.ok(
        html.includes(`data-i18n="${key}"`),
        `${file} must contain navigation link with data-i18n="${key}"`
      );
    }
  }
});

test('switching languages dynamically translates navigation and phrases without requiring page reload', () => {
  const content = fs.readFileSync('i18n.js', 'utf8');

  class MockElement {
    constructor(tag, text = '', attrs = {}) {
      this.tagName = tag.toUpperCase();
      this.textContent = text;
      this.attrs = Object.assign({}, attrs);
      this.dataset = {};
      for (const [k, v] of Object.entries(attrs)) {
        if (k.startsWith('data-')) {
          const camel = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          this.dataset[camel] = v;
        }
      }
      this.classList = { contains: () => false, add: () => {}, remove: () => {}, toggle: () => {} };
      this.style = {};
    }
    getAttribute(n) { return this.attrs[n]; }
    setAttribute(n, v) { this.attrs[n] = v; }
    hasAttribute(n) { return n in this.attrs; }
  }

  const navHome = new MockElement('a', 'Ana səhifə', { 'data-i18n': 'navHome' });
  const navCoffee = new MockElement('a', 'Qəhvələr', { 'data-i18n': 'navCoffee' });
  const navTea = new MockElement('a', 'Çaylar', { 'data-i18n': 'navTea' });
  const navMenu = new MockElement('a', 'Menyu', { 'data-i18n': 'navMenu' });
  const unlabelledTarget = new MockElement('a', 'Qəhvələr', {});

  const allElements = [navHome, navCoffee, navTea, navMenu, unlabelledTarget];

  const mockDoc = {
    readyState: 'complete',
    documentElement: { lang: 'az', dir: 'ltr' },
    body: { classList: { add: () => {}, remove: () => {} } },
    querySelector: () => null,
    querySelectorAll: (sel) => {
      if (sel.includes('[data-i18n]')) return allElements.filter(e => e.hasAttribute('data-i18n'));
      if (sel.includes('.main-nav a')) return allElements;
      return [];
    },
    getElementById: () => null,
    addEventListener: () => {}
  };

  const mockWindow = {
    addEventListener: () => {},
    dispatchEvent: () => {},
    location: { pathname: '/qehveler.html' }
  };

  const sandbox = {
    window: mockWindow,
    document: mockDoc,
    localStorage: { getItem: () => null, setItem: () => {} },
    CustomEvent: class { constructor(t, i) { this.type = t; this.detail = i?.detail; } }
  };

  vm.createContext(sandbox);
  vm.runInContext(content, sandbox);

  // 1. Switch to Russian
  sandbox.window.BCF_I18N.setLanguage('ru');
  assert.equal(navCoffee.textContent, 'Кофе', 'navCoffee -> Russian');
  assert.equal(navTea.textContent, 'Чай', 'navTea -> Russian');
  assert.equal(navMenu.textContent, 'Меню', 'navMenu -> Russian');
  assert.equal(unlabelledTarget.textContent, 'Кофе', 'unlabelledTarget -> Russian');

  // 2. Switch to English (without reloading page)
  sandbox.window.BCF_I18N.setLanguage('en');
  assert.equal(navCoffee.textContent, 'Coffee', 'navCoffee -> English');
  assert.equal(navTea.textContent, 'Tea', 'navTea -> English');
  assert.equal(navMenu.textContent, 'Menu', 'navMenu -> English');
  assert.equal(unlabelledTarget.textContent, 'Coffee', 'unlabelledTarget -> English');

  // 3. Switch to Arabic (without reloading page)
  sandbox.window.BCF_I18N.setLanguage('ar');
  assert.equal(navCoffee.textContent, 'القهوة', 'navCoffee -> Arabic');
  assert.equal(navTea.textContent, 'الشاي', 'navTea -> Arabic');
  assert.equal(navMenu.textContent, 'القائمة', 'navMenu -> Arabic');
  assert.equal(unlabelledTarget.textContent, 'القهوة', 'unlabelledTarget -> Arabic');

  // 4. Switch back to Azerbaijani (without reloading page)
  sandbox.window.BCF_I18N.setLanguage('az');
  assert.equal(navCoffee.textContent, 'Qəhvələr', 'navCoffee -> Azerbaijani');
  assert.equal(navTea.textContent, 'Çaylar', 'navTea -> Azerbaijani');
  assert.equal(navMenu.textContent, 'Menyu', 'navMenu -> Azerbaijani');
  assert.equal(unlabelledTarget.textContent, 'Qəhvələr', 'unlabelledTarget -> Azerbaijani');
});

