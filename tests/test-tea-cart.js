const assert = require('node:assert/strict');
const { TEA_PRODUCTS, getTeaProduct } = require('../tea-data.js');
const {
  normalizeTeaQuantity,
  getCartItemTotal,
  adjustCartItemQuantity,
  applyCartAction,
  hydrateEquipmentCart,
  formatCartCount,
} = require('../cart-utils.js');

const expectedPrices = {
  '1001-gece': [7, 'g'],
  admiral: [8, 'g'],
  'geysa-qara': [8, 'g'],
  jasmin: [2, 'piece'],
  limon: [8, 'g'],
  malina: [8, 'g'],
  meyveli: [7, 'g'],
  portagal: [7, 'g'],
  'geysa-yasil': [8, 'g'],
  'mango-kuresi': [2.4, 'piece'],
  'qara-cay': [7, 'g'],
  'jasminli-qara': [7, 'g'],
  melisa: [9, 'g'],
};

assert.equal(Object.keys(TEA_PRODUCTS).length, 18, 'all tea cards should have metadata');
for (const [id, [price, unit]] of Object.entries(expectedPrices)) {
  const tea = getTeaProduct(id);
  assert.ok(tea, `${id} should exist`);
  assert.equal(tea.price, price, `${id} should use the photographed price`);
  assert.equal(tea.unit, unit, `${id} should use the photographed unit`);
  assert.match(tea.image, /^assets\/tea-packages\/.+\.(jpg|png)$/);
}

assert.equal(normalizeTeaQuantity(0, 'g'), 5);
assert.equal(normalizeTeaQuantity(76, 'g'), 75);
assert.equal(normalizeTeaQuantity(53, 'g'), 55, 'weight should round to the nearest 5 grams');
assert.equal(normalizeTeaQuantity(1400, 'g'), 1000);
assert.equal(normalizeTeaQuantity(2400, 'g', 2000), 2000, 'coffee orders may reach 2 kg');
assert.equal(normalizeTeaQuantity(0, 'piece'), 1);
assert.equal(normalizeTeaQuantity(99, 'piece'), 20);

assert.equal(getCartItemTotal({ price: 8, quantity: 250, unit: 'g' }), 20);
assert.equal(getCartItemTotal({ price: 3.4, quantity: 2, unit: 'piece' }), 6.8);
assert.equal(getCartItemTotal({ price: 1, quantity: 3, unit: 'piece' }), 3);

assert.equal(adjustCartItemQuantity({ quantity: 995, unit: 'g' }, 1), 1000);
assert.equal(adjustCartItemQuantity({ quantity: 1000, unit: 'g' }, 1), 1000);
assert.equal(adjustCartItemQuantity({ quantity: 1995, unit: 'g', maxQuantity: 2000 }, 1), 2000);
assert.equal(adjustCartItemQuantity({ quantity: 5, unit: 'g' }, -1), 0);
assert.equal(adjustCartItemQuantity({ quantity: 1, unit: 'piece' }, -1), 0);
const removableCart = {
  tea: { name: 'Admiral', quantity: 500, unit: 'g' },
  grinder: { name: 'Dəyirman', quantity: 1, unit: 'piece' },
};
assert.deepEqual(
  applyCartAction(removableCart, 'tea', 'remove'),
  { grinder: { name: 'Dəyirman', quantity: 1, unit: 'piece' } },
  'remove should delete the selected line immediately regardless of its quantity'
);
assert.equal(formatCartCount({ a: { quantity: 4, unit: 'piece' }, b: { quantity: 500, unit: 'g' } }), '5 məhsul');

const migrated = hydrateEquipmentCart(
  { 'french-press': { name: 'French Press', quantity: 1, price: 1 } },
  [{ name: 'French Press', variants: [{ id: 'french-press', image: 'assets/equipment/french-press.jpg', price: 25 }] }],
);
assert.deepEqual(migrated['french-press'], {
  name: 'French Press',
  quantity: 1,
  image: 'assets/equipment/french-press.jpg',
  price: 25,
  unit: 'piece',
});

console.log('PASS: tea prices, quantity limits, and basket totals are valid.');

