'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:vm');
const fsPromises = require('node:fs/promises');

test('i18n module provides az, en, and ar with matching dictionaries', () => {
  const content = fs.readFileSync('i18n.js', 'utf8');
  assert.ok(content.includes("az: {"), 'contains az dictionary');
  assert.ok(content.includes("en: {"), 'contains en dictionary');
  assert.ok(content.includes("ar: {"), 'contains ar dictionary');
  assert.ok(content.includes("dir: 'rtl'"), 'Arabic is configured as RTL');
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

test('script.js ensures i18n is dynamically loaded if absent', () => {
  const script = fs.readFileSync('script.js', 'utf8');
  assert.ok(script.includes('i18n.css'), 'script.js links i18n.css');
  assert.ok(script.includes('i18n.js'), 'script.js links i18n.js');
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

test('i18n PHRASE_MAP translates all coffees, teas, equipment, and menu items', () => {
  const content = fs.readFileSync('i18n.js', 'utf8');
  const vm = require('node:vm');
  const sandbox = {
    window: {
      location: { pathname: '/index.html' },
      dispatchEvent: () => {},
      addEventListener: () => {},
    },
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
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
  vm.createContext(sandbox);
  vm.runInContext(content, sandbox);
  const phraseMap = sandbox.window.BCF_I18N.PHRASE_MAP;
  assert.ok(phraseMap, 'PHRASE_MAP is exported');

  // 1. Coffees
  const coffeeOrigins = ['Colombia', 'Guatemala', 'Brasil', 'Honduras', 'Robusta', 'Costa Rica', 'Efiopiya', 'Keniya', 'Decaf', 'Uqanda'];
  for (const c of coffeeOrigins) {
    assert.ok(phraseMap[c]?.en, `Coffee ${c} has English translation`);
    assert.ok(phraseMap[c]?.ar, `Coffee ${c} has Arabic translation`);
  }

  // 2. Teas
  const teaNames = [
    '1001 Gecə Çayı', 'Admiral', 'Geyşa Qara', 'Jasmin Çayı', 'Limon Çayı',
    'Malina Şərbəti', 'Meyvəli Çay', 'Nar Çayı', 'Portağal Çayı', 'Qarpız Çayı',
    'Geyşa Yaşıl', 'Yaşıl Çay', 'Mango Kürəsi', 'Mango Çayı', 'Qara Çay',
    'Jasminli Qara Çay', 'Hibiskus'
  ];
  for (const t of teaNames) {
    assert.ok(phraseMap[t]?.en, `Tea ${t} has English translation`);
    assert.ok(phraseMap[t]?.ar, `Tea ${t} has Arabic translation`);
  }

  // 3. Equipment
  const equipmentNames = [
    'French Press', 'Əl dəyirmanı', 'Naxışlı əl dəyirmanı', 'Moka Pot',
    'Naxışlı cezvə', 'Gooseneck çaydan', 'Naxışlı Dallah', 'Manual Press',
    'Çarxlı əl dəyirmanı', 'Şüşə server · 400 ml', 'Azərbaycan qəhvə dəsti',
    'Espresso tamper', 'Şərq üslublu servis dəsti'
  ];
  for (const eq of equipmentNames) {
    assert.ok(phraseMap[eq]?.en, `Equipment ${eq} has English translation`);
    assert.ok(phraseMap[eq]?.ar, `Equipment ${eq} has Arabic translation`);
  }

  // 4. Menu Items
  const menuItems = [
    'Espresso (Single)', 'Triple Joy', 'Americano (S / M / L)', 'Latte (S / M / L)',
    'Türk qəhvəsi', 'İsti şokolad', 'Bumble Coffee', 'Mojito', 'San Sebastian', 'Ballı tort'
  ];
  for (const item of menuItems) {
    assert.ok(phraseMap[item]?.en, `Menu item ${item} has English translation`);
    assert.ok(phraseMap[item]?.ar, `Menu item ${item} has Arabic translation`);
  }
});

