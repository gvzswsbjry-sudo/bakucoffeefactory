'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const TEST_PASSWORD = 'coffee-test-123';

const {
  MENU_DRINKS,
  computeDailyDiscountPrices,
  resolveDailyDiscountConfig,
} = require('../../menu-drinks');
const { createMenuDiscountStore } = require('../../server/menu-discount-store');
const { createAnalyticsStore } = require('../../server/analytics-store');
const { createServer } = require('../../server');
const { syncDailyDiscountDom } = require('../../menu-modern');

async function tempDir(t) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'bcf-menu-discount-'));
  t.after(() => fsp.rm(dir, { recursive: true, force: true }));
  return dir;
}

test('menu-drinks catalog exposes all coffeeshop drinks and exact discount pricing', () => {
  assert.ok(MENU_DRINKS.length >= 30);
  const cappuccino = MENU_DRINKS.find((d) => d.key === 'cappuccino');
  assert.ok(cappuccino);
  assert.equal(cappuccino.name, 'Cappuccino');
  assert.equal(cappuccino.prices.length, 3);

  const discounted = computeDailyDiscountPrices(cappuccino, 40);
  assert.deepEqual(discounted, [
    { size: 'S', original: 6.2, discounted: 3.72, showCurrency: false },
    { size: 'M', original: 7.3, discounted: 4.38, showCurrency: false },
    { size: 'L', original: 8.0, discounted: 4.8, showCurrency: true },
  ]);

  const resolved = resolveDailyDiscountConfig({ itemKey: 'baku-coffee-factory-special', discountPercent: 25 });
  assert.equal(resolved.itemName, 'Baku Coffee Factory Special');
  assert.equal(resolved.image, 'assets/menu/baku-coffee-factory-special.jpg');
  assert.equal(resolved.prices[0].discounted, 9.98);
});

test('every menu drink has an existing dedicated preset image and admin auto-switches photos', () => {
  const uniqueImages = new Set();
  for (const drink of MENU_DRINKS) {
    assert.ok(typeof drink.defaultImage === 'string' && drink.defaultImage.startsWith('assets/'), `${drink.key} has assets/ defaultImage`);
    assert.ok(fs.existsSync(path.join(ROOT, drink.defaultImage)), `${drink.key} image exists: ${drink.defaultImage}`);
    uniqueImages.add(drink.defaultImage);
  }
  assert.ok(uniqueImages.size >= 25, `expected rich per-drink photo variety, got ${uniqueImages.size}`);

  assert.equal(MENU_DRINKS.find((d) => d.key === 'espresso-single')?.defaultImage, 'assets/menu/espresso-single.jpg');
  assert.equal(MENU_DRINKS.find((d) => d.key === 'americano')?.defaultImage, 'assets/menu/americano.jpg');
  assert.equal(MENU_DRINKS.find((d) => d.key === 'cappuccino')?.defaultImage, 'assets/menu/cappuccino.jpg');
  assert.equal(MENU_DRINKS.find((d) => d.key === 'turk-qehvesi')?.defaultImage, 'assets/equipment/brass-cezve-classic.jpg');
  assert.equal(MENU_DRINKS.find((d) => d.key === 'mojito')?.defaultImage, 'assets/menu/mojito.jpg');
  assert.equal(MENU_DRINKS.find((d) => d.key === 'cold-brew')?.defaultImage, 'assets/menu/cold-brew-tower.jpg');

  const adminJs = fs.readFileSync(path.join(ROOT, 'admin/admin.js'), 'utf8');
  assert.match(adminJs, /function selectDailyDrink\(drinkKey\)/);
  assert.match(adminJs, /daily-drink-chip-thumb/);
  assert.match(adminJs, /selectDailyDrink\(card\.dataset\.drinkPick\)/);
  assert.doesNotMatch(adminJs, /prevDrink\?\.defaultImage/);
});

test('menu-discount-store persists settings atomically and rejects invalid input', async (t) => {
  const dir = await tempDir(t);
  const store = createMenuDiscountStore({ filePath: path.join(dir, 'menu-settings.json') });

  const initial = await store.get();
  assert.equal(initial.itemKey, 'latte');
  assert.equal(initial.discountPercent, 50);
  assert.equal(initial.enabled, true);

  await assert.rejects(() => store.update({ itemKey: 'unknown-drink', discountPercent: 50 }), /düzgün içki/i);
  await assert.rejects(() => store.update({ itemKey: 'latte', discountPercent: 2 }), /5 ilə 90/);
  await assert.rejects(() => store.update({ itemKey: 'latte', discountPercent: 50, image: '../secret.png' }), /assets\//);

  const saved = await store.update({
    enabled: true,
    itemKey: 'flat-white',
    discountPercent: 30,
    image: 'assets/menu/daily-latte.jpg',
    customNote: 'Bugün Flat White xüsusi endirimdədir!',
  });

  assert.equal(saved.itemKey, 'flat-white');
  assert.equal(saved.itemName, 'Flat White');
  assert.equal(saved.discountPercent, 30);
  assert.equal(saved.prices.length, 2);
  assert.equal(saved.prices[0].discounted, 4.69);
  assert.equal(saved.prices[1].discounted, 5.25);

  const reloadedStore = createMenuDiscountStore({ filePath: path.join(dir, 'menu-settings.json') });
  const reloaded = await reloadedStore.get();
  assert.equal(reloaded.itemKey, 'flat-white');
  assert.equal(reloaded.discountPercent, 30);
  assert.equal(reloaded.customNote, 'Bugün Flat White xüsusi endirimdədir!');
});

test('menu discount API requires authenticated same-origin admin session and updates public endpoint', async (t) => {
  const rootDir = await tempDir(t);
  await fsp.mkdir(path.join(rootDir, 'assets', 'menu'), { recursive: true });
  await fsp.mkdir(path.join(rootDir, 'data'), { recursive: true });
  await fsp.writeFile(path.join(rootDir, 'data', 'products.json'), '[]\n');

  const server = createServer({ rootDir, host: '127.0.0.1', port: 0, customerDatabase: null });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const publicBefore = await fetch(`${base}/api/menu-discount`);
  assert.equal(publicBefore.status, 200);
  assert.equal((await publicBefore.json()).itemKey, 'latte');

  const unauthPut = await fetch(`${base}/api/admin/menu-discount`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ itemKey: 'cappuccino', discountPercent: 40 }),
  });
  assert.equal(unauthPut.status, 401);

  const login = await fetch(`${base}/api/admin/session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: TEST_PASSWORD }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie');

  const foreignOriginPut = await fetch(`${base}/api/admin/menu-discount`, {
    method: 'PUT',
    headers: { cookie, origin: 'https://evil.example', 'content-type': 'application/json' },
    body: JSON.stringify({ itemKey: 'cappuccino', discountPercent: 40 }),
  });
  assert.equal(foreignOriginPut.status, 403);

  const validPut = await fetch(`${base}/api/admin/menu-discount`, {
    method: 'PUT',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify({
      enabled: true,
      itemKey: 'cappuccino',
      discountPercent: 35,
      image: 'assets/menu/daily-latte.jpg',
      customNote: 'Cappuccino sevənlər üçün günün fürsəti',
    }),
  });
  assert.equal(validPut.status, 200);
  const saved = await validPut.json();
  assert.equal(saved.itemKey, 'cappuccino');
  assert.equal(saved.discountPercent, 35);

  const publicAfter = await fetch(`${base}/api/menu-discount`);
  assert.equal(publicAfter.status, 200);
  const live = await publicAfter.json();
  assert.equal(live.itemKey, 'cappuccino');
  assert.equal(live.itemName, 'Cappuccino');
  assert.equal(live.discountPercent, 35);
  assert.equal(live.prices[2].discounted, 5.2);
});

test('syncDailyDiscountDom switches active daily discount row and spotlight card live', () => {
  function makeRow(itemKey) {
    const classSet = new Set(itemKey === 'latte' ? ['menu-row-discount'] : []);
    const chipsHost = { innerHTML: '' };
    const row = {
      dataset: { menuItem: itemKey },
      _badge: itemKey === 'latte' ? { textContent: '-50% BUGÜN', removeAttribute() {}, remove() { row._badge = null; } } : null,
      classList: {
        toggle: (cls, force) => (force ? classSet.add(cls) : classSet.delete(cls)),
        contains: (cls) => classSet.has(cls),
      },
      querySelector: (sel) => (sel === '.price-chips' ? chipsHost : sel === '.menu-row-badge' ? row._badge : null),
      insertBefore: (el) => { row._badge = el; },
    };
    return row;
  }

  const latteRow = makeRow('latte');
  const cappuccinoRow = makeRow('cappuccino');
  const offerCard = { hidden: false };
  const titleEl = { textContent: '', removeAttribute() {} };
  const pctEl = { textContent: '' };
  const sizeGridEl = { innerHTML: '' };

  global.document = {
    createElement: () => ({ className: '', textContent: '' }),
    getElementById: (id) => (id === 'dailyOfferCard' ? offerCard : id === 'dailyOfferTitle' ? titleEl : null),
    querySelectorAll: (sel) => (sel === '#mainMenu .menu-row[data-menu-item]' ? [latteRow, cappuccinoRow] : []),
    querySelector: (sel) => {
      if (sel === '.menu-daily-percent') return pctEl;
      if (sel === '#dailyOfferCard .daily-size-grid') return sizeGridEl;
      return null;
    },
  };

  try {
    syncDailyDiscountDom({ enabled: true, itemKey: 'cappuccino', discountPercent: 40 });
    assert.equal(offerCard.hidden, false);
    assert.equal(pctEl.textContent, '-40%');
    assert.equal(titleEl.textContent, 'Günün seçimi: Cappuccino');
    assert.equal(latteRow.classList.contains('menu-row-discount'), false);
    assert.equal(latteRow._badge, null);
    assert.ok(latteRow.querySelector('.price-chips').innerHTML.includes('6.80'));
    assert.equal(cappuccinoRow.classList.contains('menu-row-discount'), true);
    assert.equal(cappuccinoRow._badge.textContent, '-40% BUGÜN');
    assert.ok(cappuccinoRow.querySelector('.price-chips').innerHTML.includes('<strong>3.72</strong>'));

    syncDailyDiscountDom({ enabled: false, itemKey: 'cappuccino', discountPercent: 40 });
    assert.equal(offerCard.hidden, true);
    assert.equal(cappuccinoRow.classList.contains('menu-row-discount'), false);
  } finally {
    delete global.document;
  }
});

test('admin UI, routes, and analytics support daily discount settings and coffee finder profiles', async (t) => {
  const html = fs.readFileSync(path.join(ROOT, 'admin/index.html'), 'utf8');
  for (const id of [
    'dailyDiscountNavBtn', 'dailyDiscountView', 'dailyDiscountForm', 'dailyDrinkSelect',
    'dailyDiscountPercent', 'dailyDiscountRange', 'dailyImageInput',
    'coffeeProfileSection', 'coffeeBodyRange', 'coffeeAcidityRange', 'coffeeBalanceRange',
    'teaProfileSection', 'equipmentProfileSection',
  ]) {
    assert.ok(html.includes(`id="${id}"`), `admin/index.html contains #${id}`);
  }

  const menyuHtml = fs.readFileSync(path.join(ROOT, 'menyu.html'), 'utf8');
  for (const drink of MENU_DRINKS) {
    assert.ok(menyuHtml.includes(`data-menu-item="${drink.key}"`), `menyu.html tags drink row ${drink.key}`);
  }

  const routes = fs.readFileSync(path.join(ROOT, 'server/routes.js'), 'utf8');
  assert.ok(routes.includes("'/menu-drinks.js'"));
  assert.ok(routes.includes('/api/menu-discount'));
  assert.ok(routes.includes('/api/admin/menu-discount'));

  const analyticsDir = await tempDir(t);
  const analytics = createAnalyticsStore({ filePath: path.join(analyticsDir, 'analytics.json') });
  await analytics.trackPageView({ sessionId: 's1', path: '/qehve-secici.html' });
  const stats = await analytics.getStats();
  const finderPage = stats.pages.find((p) => p.path === '/qehve-secici.html');
  assert.ok(finderPage);
  assert.equal(finderPage.title, 'Qəhvə seçicisi');
});
