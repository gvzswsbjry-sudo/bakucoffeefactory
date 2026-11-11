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
    'Jasminli Qara Çay', 'Hibiskus', 'Melisa Çayı'
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

test('first-time visitor defaults to Azerbaijani and language persists across visits', () => {
  const content = fs.readFileSync('i18n.js', 'utf8');
  let memoryStorage = {};
  let cookieString = '';

  function createSession() {
    const sandbox = {
      window: {
        location: { pathname: '/index.html' },
        addEventListener: () => {},
        dispatchEvent: () => {}
      },
      document: {
        readyState: 'complete',
        documentElement: { lang: 'az', dir: 'ltr' },
        body: { classList: { add: () => {}, remove: () => {} } },
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementById: () => null,
        addEventListener: () => {},
        get cookie() { return cookieString; },
        set cookie(val) {
          const pair = val.split(';')[0].split('=');
          cookieString = pair[0] + '=' + pair[1];
        }
      },
      localStorage: {
        getItem: (k) => memoryStorage[k] || null,
        setItem: (k, v) => { memoryStorage[k] = String(v); }
      },
      CustomEvent: class { constructor(t, i) { this.type = t; this.detail = i?.detail; } }
    };
    vm.createContext(sandbox);
    vm.runInContext(content, sandbox);
    return sandbox;
  }

  // 1. Initial visit without any prior choice must default to Azerbaijani (az)
  const session1 = createSession();
  assert.equal(session1.window.BCF_I18N.getLanguage(), 'az', 'Default language must be Azerbaijani (az)');

  // 2. User explicitly chooses Russian
  session1.window.BCF_I18N.setLanguage('ru');
  assert.equal(session1.window.BCF_I18N.getLanguage(), 'ru');
  assert.equal(memoryStorage['bcf_language'], 'ru', 'Must be saved to localStorage');
  assert.ok(cookieString.includes('bcf_language=ru'), 'Must be saved to cookie');

  // 3. User returns next time (new browser session) -> Russian is automatically restored
  const session2 = createSession();
  assert.equal(session2.window.BCF_I18N.getLanguage(), 'ru', 'Returning user automatically gets previously chosen language (ru)');

  // 4. User chooses English -> English is saved
  session2.window.BCF_I18N.setLanguage('en');
  assert.equal(memoryStorage['bcf_language'], 'en');

  // 5. User returns next time -> English is automatically restored
  const session3 = createSession();
  assert.equal(session3.window.BCF_I18N.getLanguage(), 'en', 'Returning user automatically gets English (en)');
});

test('clicking a different language option persists choice and triggers page reload', () => {
  const content = fs.readFileSync('i18n.js', 'utf8');
  const memoryStorage = {};
  let cookieString = '';
  let reloadCount = 0;

  function makeEl(tag, extra = {}) {
    const attrs = {};
    const classes = new Set();
    const listeners = {};
    const children = [];
    const el = {
      tagName: tag.toUpperCase(),
      dataset: {},
      style: {},
      hidden: false,
      children,
      childNodes: children,
      innerHTML: '',
      textContent: '',
      ...extra,
      classList: {
        contains: (c) => classes.has(c),
        add: (...cs) => cs.forEach((c) => classes.add(c)),
        remove: (...cs) => cs.forEach((c) => classes.delete(c)),
        toggle: (c, force) => {
          const next = force === undefined ? !classes.has(c) : Boolean(force);
          if (next) classes.add(c); else classes.delete(c);
          return next;
        },
      },
      setAttribute: (k, v) => { attrs[k] = String(v); },
      getAttribute: (k) => attrs[k],
      hasAttribute: (k) => k in attrs,
      addEventListener: (t, fn) => { (listeners[t] ||= []).push(fn); },
      dispatch: (t, ev = {}) => (listeners[t] || []).forEach((fn) => fn({ preventDefault() {}, stopPropagation() {}, ...ev })),
      append: (...nodes) => children.push(...nodes),
      insertBefore: (n) => children.unshift(n),
      contains: () => false,
      querySelectorAll: () => [],
      querySelector: () => null,
    };
    return el;
  }

  const triggerBtn = makeEl('button', { id: 'langTrigger' });
  const dropdownEl = makeEl('div', { id: 'langDropdown', hidden: true });
  const codeEl = makeEl('span', { id: 'langCurrentCode' });
  const optAz = makeEl('button'); optAz.dataset.lang = 'az';
  const optEn = makeEl('button'); optEn.dataset.lang = 'en';
  const optRu = makeEl('button'); optRu.dataset.lang = 'ru';
  const optAr = makeEl('button'); optAr.dataset.lang = 'ar';
  const options = [optAz, optEn, optRu, optAr];

  const wrapper = makeEl('div');
  wrapper.querySelector = (sel) => ({ '#langTrigger': triggerBtn, '#langDropdown': dropdownEl }[sel] || null);
  wrapper.querySelectorAll = (sel) => (sel === '.lang-option' ? options : []);

  const headerEl = makeEl('header');
  headerEl.insertBefore = (node) => { wrapper._mounted = node; };

  const mockDoc = {
    readyState: 'complete',
    documentElement: { lang: 'az', dir: 'ltr' },
    body: { classList: { add: () => {}, remove: () => {} } },
    get cookie() { return cookieString; },
    set cookie(val) { const p = val.split(';')[0].split('='); cookieString = p[0] + '=' + p[1]; },
    createElement: (tag) => (tag === 'div' ? wrapper : makeEl(tag)),
    querySelector: (sel) => (sel === '.site-header' ? headerEl : null),
    querySelectorAll: (sel) => (sel === '.lang-option' ? options : []),
    getElementById: (id) => ({ langTrigger: triggerBtn, langDropdown: dropdownEl, langCurrentCode: codeEl }[id] || null),
    addEventListener: () => {},
  };

  const sandbox = {
    window: {
      location: { pathname: '/index.html', reload: () => { reloadCount += 1; } },
      addEventListener: () => {},
      dispatchEvent: () => {},
    },
    document: mockDoc,
    localStorage: {
      getItem: (k) => memoryStorage[k] || null,
      setItem: (k, v) => { memoryStorage[k] = String(v); },
    },
    CustomEvent: class { constructor(t, i) { this.type = t; this.detail = i?.detail; } },
  };

  vm.createContext(sandbox);
  vm.runInContext(content, sandbox);

  // Initializing default AZ must never trigger reload
  assert.equal(reloadCount, 0);

  // Programmatic setLanguage without { reload: true } must never trigger reload
  sandbox.window.BCF_I18N.setLanguage('en');
  assert.equal(reloadCount, 0);

  // Clicking the currently active option ('en') closes dropdown without reloading
  dropdownEl.hidden = false;
  optEn.dispatch('click');
  assert.equal(dropdownEl.hidden, true);
  assert.equal(reloadCount, 0);

  // Clicking a different language option ('ru') persists 'ru' and reloads page
  optRu.dispatch('click');
  assert.equal(memoryStorage.bcf_language, 'ru');
  assert.ok(cookieString.includes('bcf_language=ru'));
  assert.equal(reloadCount, 1);

  // Subsequent visit after reload initializes directly into 'ru' with 0 reloads
  const sandboxAfterReload = {
    ...sandbox,
    window: {
      location: { pathname: '/index.html', reload: () => { reloadCount += 1; } },
      addEventListener: () => {},
      dispatchEvent: () => {},
    },
    document: { ...mockDoc, documentElement: { lang: 'az', dir: 'ltr' }, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null },
  };
  vm.createContext(sandboxAfterReload);
  vm.runInContext(content, sandboxAfterReload);
  assert.equal(sandboxAfterReload.window.BCF_I18N.getLanguage(), 'ru');
  assert.equal(sandboxAfterReload.document.documentElement.lang, 'ru');
  assert.equal(reloadCount, 1);
});

test('DICTIONARY has strict key parity and translateDynamicText covers dynamic strings across all 4 languages', () => {
  const content = fs.readFileSync('i18n.js', 'utf8');
  const sandbox = createSandbox('/avadanliqlar.html');
  vm.createContext(sandbox);
  vm.runInContext(content, sandbox);
  const { DICTIONARY, translateDynamicText } = sandbox.window.BCF_I18N;

  const baseKeys = Object.keys(DICTIONARY.az).sort();
  for (const lang of ['en', 'ru', 'ar']) {
    assert.deepEqual(Object.keys(DICTIONARY[lang]).sort(), baseKeys, `DICTIONARY.${lang} keys match az`);
  }

  assert.equal(translateDynamicText('Colombia · 100 q', 'ru'), 'Колумбия · 100 г');
  assert.equal(translateDynamicText('Colombia · 100 q', 'ar'), 'كولومبيا · 100 جم');
  assert.equal(translateDynamicText('15.00 ₼ / 100 q', 'en'), '15.00 ₼ / 100g');
  assert.equal(translateDynamicText('2.40 ₼ / ədəd', 'ru'), '2.40 ₼ / шт.');
  assert.equal(translateDynamicText('3 seçim', 'en'), '3 options');
  assert.equal(translateDynamicText('3 seçim', 'ru'), '3 варианта');
  assert.equal(translateDynamicText('1 ədəd qalıb', 'en'), '1 left in stock');
  assert.equal(translateDynamicText('5 ədəd qalıb', 'ru'), 'Осталось 5 шт.');
  assert.equal(translateDynamicText('Seçim 2', 'en'), 'Option 2');
  assert.equal(translateDynamicText('Azərbaycan (+994)', 'ru'), 'Азербайджан (+994)');
  assert.equal(
    translateDynamicText('Sadə, dolğun və rahat dəmləmə üçün klassik pres. (600 millilitrlik şüşə və paslanmayan polad French Press)', 'en'),
    'A classic press for simple, rich, and comforting brewing. (600 ml glass and stainless steel French Press)'
  );
  assert.equal(translateDynamicText('French Press · 600 ml', 'ar'), 'فرنش بريس · 600 مل');
  assert.equal(translateDynamicText('Колумбия · 100 г', 'az'), 'Colombia · 100 q');
});

test('coffee-more summary preserves icon span while translating label and pages wire data-i18n attributes', () => {
  const content = fs.readFileSync('i18n.js', 'utf8');
  const textNode = { nodeType: 3, nodeValue: 'Daha çox ' };
  const arrowSpan = { nodeType: 1, tagName: 'SPAN', textContent: '↗' };
  const summaryEl = {
    tagName: 'SUMMARY',
    childNodes: [textNode, arrowSpan],
    textContent: 'Daha çox ↗',
    hasAttribute: () => false,
    querySelector: (s) => (s === 'span' ? arrowSpan : null),
    insertBefore: () => {},
  };

  const sandbox = {
    window: { location: { pathname: '/qehveler.html' }, addEventListener: () => {}, dispatchEvent: () => {} },
    document: {
      readyState: 'complete',
      documentElement: { lang: 'az', dir: 'ltr' },
      body: { classList: { add: () => {}, remove: () => {} } },
      querySelector: () => null,
      querySelectorAll: (sel) => (sel.includes('.coffee-more summary') ? [summaryEl] : []),
      getElementById: () => null,
      addEventListener: () => {},
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    CustomEvent: class { constructor(t, i) { this.type = t; this.detail = i?.detail; } },
  };
  vm.createContext(sandbox);
  vm.runInContext(content, sandbox);

  sandbox.window.BCF_I18N.setLanguage('en');
  assert.equal(textNode.nodeValue, 'More details ');
  assert.equal(arrowSpan.textContent, '↗');

  sandbox.window.BCF_I18N.setLanguage('ru');
  assert.equal(textNode.nodeValue, 'Подробнее ');

  sandbox.window.BCF_I18N.setLanguage('az');
  assert.equal(textNode.nodeValue, 'Daha çox ');

  const policy = fs.readFileSync('mexfilik.html', 'utf8');
  assert.ok(policy.includes('data-i18n="policyContactHtml"'));
  assert.ok(policy.includes('data-i18n="backToHome"'));
  assert.ok(fs.readFileSync('index.html', 'utf8').includes('data-i18n="aboutCopyHtml"'));
  assert.ok(fs.readFileSync('caylar.html', 'utf8').includes('data-i18n="teaHeroCta"'));
  assert.ok(fs.readFileSync('avadanliqlar.html', 'utf8').includes('data-i18n="equipmentHeroTitle"'));
});

test('cart-utils renders coffee bean thumbnail and translated labels in non-AZ languages', () => {
  const cartUtils = require('../cart-utils.js');
  global.window = {
    BCF_I18N: {
      getLanguage: () => 'ru',
      t: (k, f) => ({ removeBtn: 'Удалить', cartEmpty: 'Ваша корзина пока пуста.', pricePending: 'Цена уточняется' }[k] || f),
      translateDynamicText: (txt) => (txt === 'Colombia' ? 'Колумбия' : txt),
    },
  };

  const html = cartUtils.renderUnifiedCartItemsHtml({
    'coffee-colombia': { id: 'colombia', category: 'coffee', name: 'Colombia', price: 15, quantity: 200, unit: 'g' },
  });
  assert.ok(html.includes('assets/coffee/cart-coffee-beans.png'), 'uses coffee beans image regardless of language');
  assert.ok(html.includes('Кофе'), 'renders Russian category label');
  assert.ok(html.includes('Колумбия'), 'renders translated coffee title');
  assert.ok(html.includes('200 г'), 'renders Russian gram unit');
  assert.ok(html.includes('Удалить'), 'renders Russian remove button');

  delete global.window;
});


