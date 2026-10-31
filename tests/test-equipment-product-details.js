const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dataPath = path.join(__dirname, '..', 'equipment-data.js');
assert.ok(fs.existsSync(dataPath), 'equipment-data.js should provide the shared product catalog');

const {
  EQUIPMENT_PRODUCTS,
  getEquipmentProduct,
  resolveEquipmentVariant,
  cycleEquipmentVariant,
  buildEquipmentDetailUrl,
  buildEquipmentCatalogUrl,
  sortEquipmentProducts,
} = require(dataPath);

assert.equal(EQUIPMENT_PRODUCTS.length, 13, 'the two manual grinders should be separate catalog products');
assert.equal(
  EQUIPMENT_PRODUCTS.reduce((sum, product) => sum + product.variants.length, 0),
  24,
  'all 24 catalog choices should remain available as variants'
);

const frenchPress = getEquipmentProduct('french-press');
assert.deepEqual(
  frenchPress.variants.map(({ id, label, price }) => ({ id, label, price })),
  [
    { id: 'french-press', label: '600 ml', price: 25 },
    { id: 'french-press-350', label: '350 ml', price: 20 },
    { id: 'french-press-850', label: '850 ml', price: 30 },
  ],
  'French Press should show 600 ml first and retain all requested capacities'
);

const tamper = getEquipmentProduct('espresso-tamper');
assert.deepEqual(
  tamper.variants.map((variant) => variant.label),
  ['Taxta', 'Gümüşü', 'Qara'],
  'tamper colors should be one product with three selectable variants'
);

const fixture = {
  variants: [
    { id: 'first', price: 1 },
    { id: 'second', price: 4.5 },
  ],
};
assert.equal(resolveEquipmentVariant(fixture, 'second').price, 4.5, 'selected variant should provide its own price');
assert.equal(resolveEquipmentVariant(fixture, 'missing').id, 'first', 'unknown variants should fall back safely');
assert.equal(cycleEquipmentVariant(fixture, 'first', 1).id, 'second', 'next should advance the gallery');
assert.equal(cycleEquipmentVariant(fixture, 'second', 1).id, 'first', 'next should wrap to the first variant');
assert.equal(cycleEquipmentVariant(fixture, 'first', -1).id, 'second', 'previous should wrap to the last variant');
assert.equal(typeof buildEquipmentDetailUrl, 'function', 'detail URL builder should exist');
assert.equal(typeof buildEquipmentCatalogUrl, 'function', 'catalog URL builder should exist');
assert.equal(
  buildEquipmentDetailUrl('espresso-tamper', 'accessory'),
  'mehsul.html?id=espresso-tamper&from=accessory',
  'product links should remember the active catalog filter'
);
assert.equal(
  buildEquipmentCatalogUrl('accessory'),
  'avadanliqlar.html?filter=accessory',
  'the product back link should restore the active catalog filter'
);

const sortFixture = [
  { id: 'old', name: 'Beta', variants: [{ price: 30 }] },
  { id: 'middle', name: 'Alfa', variants: [{ price: 10 }] },
  { id: 'new', name: 'Çaydan', variants: [{ price: 20 }] },
];
assert.deepEqual(sortEquipmentProducts(sortFixture, 'price-asc').map((item) => item.id), ['middle', 'new', 'old']);
assert.deepEqual(sortEquipmentProducts(sortFixture, 'price-desc').map((item) => item.id), ['old', 'new', 'middle']);
assert.deepEqual(sortEquipmentProducts(sortFixture, 'newest').map((item) => item.id), ['new', 'middle', 'old']);
assert.deepEqual(sortEquipmentProducts(sortFixture, 'oldest').map((item) => item.id), ['old', 'middle', 'new']);
assert.deepEqual(sortEquipmentProducts(sortFixture, 'name-asc').map((item) => item.id), ['middle', 'old', 'new']);

const servingSet = getEquipmentProduct('oriental-serving-set');
assert.equal(servingSet.imageFit, 'contain', 'the wide serving-set photo should be fully visible');
assert.deepEqual(
  servingSet.variants.map((variant) => variant.id),
  ['oriental-serving-set-six-cup', 'oriental-serving-set'],
  'the more expensive six-cup set should be the catalog default'
);
assert.deepEqual(servingSet.variants.map((variant) => variant.price), [120, 72]);

const cezve = getEquipmentProduct('cezve');
assert.deepEqual(
  cezve.variants.map((variant) => variant.id),
  ['cezve', 'cezve-classic', 'cezve-fluted', 'cezve-lidded'],
  'all four brass cezves should be grouped as variants'
);

const handGrinder = getEquipmentProduct('wood-grinder');
assert.deepEqual(
  handGrinder.variants.map((variant) => variant.id),
  ['wood-grinder'],
  'the wooden manual grinder should have its own product page'
);
const ornateHandGrinder = getEquipmentProduct('ornate-manual-grinder');
assert.deepEqual(
  ornateHandGrinder.variants.map((variant) => variant.id),
  ['ornate-manual-grinder'],
  'the ornate manual grinder should have its own product page'
);

const expectedPrices = {
  'wood-grinder': 55,
  'ornate-manual-grinder': 55,
  'moka-pot-steel': 90,
  'moka-pot-gray': 90,
  cezve: 70,
  'cezve-classic': 70,
  'cezve-fluted': 70,
  'cezve-lidded': 75,
  'gooseneck-kettle': 55,
  'manual-press': 80,
  'wheel-grinder': 95,
  'glass-server': 38,
  'azerbaijan-set-bronze': 83,
  'azerbaijan-set-silver': 83,
  'tamper-wood': 58,
  'tamper-silver': 55,
  'tamper-black': 55,
  'oriental-serving-set-six-cup': 120,
  'oriental-serving-set': 72,
};

const actualVariants = Object.fromEntries(
  EQUIPMENT_PRODUCTS.flatMap((product) => product.variants).map((variant) => [variant.id, variant])
);
for (const [id, price] of Object.entries(expectedPrices)) {
  assert.equal(actualVariants[id]?.price, price, `${id} should cost ${price} AZN`);
}

const htmlPath = path.join(__dirname, '..', 'avadanliqlar.html');
const html = fs.readFileSync(htmlPath, 'utf8');
assert.match(html, /data-product-id="test"/, 'avadanliqlar.html must contain static test product');
assert.match(html, />Test<\/h3>/, 'avadanliqlar.html must show product title Test');
assert.match(html, /1\.00 ₼/, 'avadanliqlar.html must show price 1.00 ₼');

const productsJsonPath = path.join(__dirname, '..', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
const testProduct = products.find((p) => p.id === 'test');
assert.ok(testProduct, 'data/products.json must contain test product');
assert.equal(testProduct.price, 1, 'test product price must be 1');

console.log('Equipment grouping and variant behavior are valid.');
