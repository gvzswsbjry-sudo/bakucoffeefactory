const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { buildProductsData } = require('../../scripts/build-products-data');
const { validateProducts } = require('../../server/product-schema');
const { TEA_PRODUCTS } = require('../../tea-data');
const { EQUIPMENT_PRODUCTS } = require('../../equipment-data');

const ROOT = path.resolve(__dirname, '../..');

test('migration contains every current coffee, tea, and equipment product', () => {
  const products = buildProductsData();
  const byCategory = (category) => products.filter((item) => item.category === category);
  assert.equal(byCategory('coffee').length, 10);
  assert.equal(byCategory('tea').length, 17);
  assert.equal(byCategory('equipment').length, EQUIPMENT_PRODUCTS.length);
  assert.equal(products.length, 10 + Object.keys(TEA_PRODUCTS).length + EQUIPMENT_PRODUCTS.length);
});

test('migration preserves coffee IDs and prices', () => {
  const coffees = Object.fromEntries(buildProductsData().filter((item) => item.category === 'coffee').map((item) => [item.id, item.price]));
  assert.deepEqual(coffees, {
    colombia: 15, guatemala: 12, brasil: 10, honduras: 11, robusta: 8,
    'costa-rica': 13, efiopiya: 13, keniya: 8, decaf: 12, uqanda: 11,
  });
});

test('migration preserves every tea price/unit and marks pending prices', () => {
  const teas = buildProductsData().filter((item) => item.category === 'tea');
  for (const [id, source] of Object.entries(TEA_PRODUCTS)) {
    const migrated = teas.find((item) => item.id === id);
    assert.ok(migrated, id);
    assert.equal(migrated.unit, source.unit, id);
    assert.equal(migrated.price, source.price ?? 0, id);
    assert.equal(Boolean(migrated.meta.pricePending), source.price === null, id);
  }
});

test('migration preserves equipment variants, default price, and sort order', () => {
  const equipment = buildProductsData().filter((item) => item.category === 'equipment');
  assert.deepEqual(equipment.map((item) => item.id), EQUIPMENT_PRODUCTS.map((item) => item.id));
  EQUIPMENT_PRODUCTS.forEach((source, index) => {
    const migrated = equipment[index];
    assert.equal(migrated.price, source.variants[0].price);
    assert.deepEqual(migrated.variants.map((variant) => variant.id), source.variants.map((variant) => variant.id));
    assert.deepEqual(migrated.variants.map((variant) => variant.price), source.variants.map((variant) => variant.price));
  });
});

test('migration output is schema-valid, uniquely identified, ordered, and uses existing images', () => {
  const products = buildProductsData();
  const validation = validateProducts(products);
  assert.deepEqual(validation, { ok: true, errors: [] });
  assert.equal(new Set(products.map((item) => item.id)).size, products.length);

  for (const category of ['coffee', 'tea', 'equipment']) {
    const orders = products.filter((item) => item.category === category).map((item) => item.sortOrder);
    assert.deepEqual(orders, [...orders].sort((a, b) => a - b));
  }

  for (const item of products) {
    assert.equal(fs.existsSync(path.join(ROOT, item.image)), true, `${item.id}: ${item.image}`);
    for (const variant of item.variants) {
      assert.equal(fs.existsSync(path.join(ROOT, variant.image)), true, `${item.id}/${variant.id}: ${variant.image}`);
    }
  }
});

test('live products.json stays valid and retains every migrated product ID', () => {
  const live = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'products.json'), 'utf8'));
  const seed = buildProductsData();
  assert.deepEqual(validateProducts(live), { ok: true, errors: [] });
  const liveIds = new Set(live.map((item) => item.id));
  for (const item of seed) {
    assert.equal(liveIds.has(item.id), true, `migrated product ${item.id} must be retained in live products.json`);
  }
});
