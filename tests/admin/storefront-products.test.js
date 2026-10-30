const test = require('node:test');
const assert = require('node:assert/strict');

const {
  loadAllStorefrontProducts,
  loadStorefrontProducts,
  bootstrapStorefrontPage,
  adaptTeaProducts,
  adaptEquipmentProducts,
  getProductAvailability,
  preserveCartLines,
} = require('../../storefront-products');

const product = (overrides = {}) => ({
  id: 'item', category: 'tea', name: 'Item', price: 8, unit: 'g', image: 'assets/item.jpg',
  description: 'Description', active: true, stock: { status: 'available', quantity: null },
  sortOrder: 1, meta: {}, variants: [], ...overrides,
});

test('loader fetches public products, filters category/inactive records, and sorts', async () => {
  const rows = [
    product({ id: 'late', sortOrder: 5 }),
    product({ id: 'coffee', category: 'coffee' }),
    product({ id: 'hidden', active: false }),
    product({ id: 'first', sortOrder: 1 }),
  ];
  const result = await loadStorefrontProducts('tea', async () => ({ ok: true, json: async () => rows }));
  assert.deepEqual(result.map((item) => item.id), ['first', 'late']);
});

test('all-product loader bypasses browser cache and validates the API payload', async () => {
  let request;
  const rows = [product({ id: 'fresh' })];
  const result = await loadAllStorefrontProducts(async (...args) => {
    request = args;
    return { ok: true, json: async () => rows };
  });
  assert.deepEqual(result, rows);
  assert.equal(request[0], '/api/products');
  assert.equal(request[1].cache, 'no-store');
  assert.equal(request[1].headers.Accept, 'application/json');

  await assert.rejects(
    () => loadAllStorefrontProducts(async () => ({ ok: true, json: async () => ({ products: rows }) })),
    /formatı düzgün deyil/i
  );
});

test('page bootstrap publishes fresh rows, hydrates markup, then starts shop scripts', async () => {
  const calls = [];
  const root = {
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init.detail; } },
    dispatchEvent(event) { calls.push(`event:${event.type}:${event.detail.length}`); },
  };
  const rows = [product({ id: 'fresh' })];
  const result = await bootstrapStorefrontPage({
    page: 'tea',
    root,
    fetchImpl: async () => ({ ok: true, json: async () => rows }),
    hydrate: (items) => calls.push(`hydrate:${items[0].id}`),
    loadScript: async (src) => calls.push(`script:${src}`),
  });

  assert.equal(root.BCF_PRODUCT_DATA, rows);
  assert.deepEqual(calls, [
    'hydrate:fresh',
    'script:tea-data.js',
    'script:tea-shop.js',
    'event:bcf:catalog-ready:1',
  ]);
  assert.deepEqual(result, rows);
});

test('page bootstrap reports API failures without starting stale shop scripts', async () => {
  const calls = [];
  await assert.rejects(
    () => bootstrapStorefrontPage({
      page: 'coffee',
      root: {},
      fetchImpl: async () => ({ ok: false, status: 503 }),
      hydrate: () => calls.push('hydrate'),
      loadScript: async () => calls.push('script'),
      showError: (error) => calls.push(error.message),
    }),
    /503/
  );
  assert.equal(calls.length, 1);
  assert.match(calls[0], /kataloq məlumatları/i);
});

test('loader reports an actionable API failure', async () => {
  await assert.rejects(
    () => loadStorefrontProducts('tea', async () => ({ ok: false, status: 500 })),
    /kataloq məlumatları/i
  );
});

test('availability disables out/count-depleted products and labels counted stock', () => {
  assert.deepEqual(getProductAvailability(product()), { purchasable: true, label: 'Mövcuddur' });
  assert.deepEqual(getProductAvailability(product({ stock: { status: 'out', quantity: null } })), { purchasable: false, label: 'Bitib' });
  assert.deepEqual(getProductAvailability(product({ stock: { status: 'counted', quantity: 4 } })), { purchasable: true, label: '4 ədəd qalıb' });
  assert.deepEqual(getProductAvailability(product({ stock: { status: 'counted', quantity: 0 } })), { purchasable: false, label: 'Bitib' });
});

test('tea and equipment adapters preserve cart IDs and variants', () => {
  const teas = adaptTeaProducts([product({ id: 'admiral', meta: { pricePending: false } })]);
  assert.equal(teas.admiral.id, 'admiral');
  assert.equal(teas.admiral.cartId, 'tea-admiral');

  const equipment = adaptEquipmentProducts([product({
    id: 'press', category: 'equipment', unit: 'piece',
    meta: { equipmentCategory: 'brewing', categoryLabel: 'Dəmləmə', imageFit: 'contain' },
    variants: [{ id: 'press-350', name: '350 ml', price: 20, image: 'assets/press.jpg', color: '#aaa', alt: 'Press' }],
  })]);
  assert.equal(equipment[0].category, 'brewing');
  assert.equal(equipment[0].variants[0].id, 'press-350');
  assert.equal(equipment[0].variants[0].label, '350 ml');
});

test('tea adapter uses a positive price even when an old pending flag remains', () => {
  const teas = adaptTeaProducts([product({ id: 'hibiskus', price: 8, meta: { pricePending: true } })]);
  assert.equal(teas.hibiskus.price, 8);
});

test('preserveCartLines keeps old basket rows even when a product is hidden or removed', () => {
  const cart = { 'tea-old': { id: 'old', name: 'Old tea', quantity: 100, price: 7 } };
  const next = preserveCartLines(cart, [product({ id: 'new' })]);
  assert.deepEqual(next, cart);
  assert.notEqual(next, cart);
});
