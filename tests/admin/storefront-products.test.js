const test = require('node:test');
const assert = require('node:assert/strict');

const {
  loadStorefrontProducts,
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
