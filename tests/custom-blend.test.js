const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { prepareOrder, resolveOrderSelection } = require('../server/order-store');

const ROOT = path.resolve(__dirname, '..');

test('qehveler.html has custom blend studio elements, custom weight input, and no label inputs or discounts', () => {
  const html = fs.readFileSync(path.join(ROOT, 'qehveler.html'), 'utf8');

  assert.ok(html.includes('custom-blend.css'), 'custom-blend.css stylesheet link is present');
  assert.ok(html.includes('custom-blend.js'), 'custom-blend.js script tag is present');
  assert.ok(html.includes('id="oz-blendini-yarat"'), '#oz-blendini-yarat section exists');
  assert.ok(html.includes('href="#oz-blendini-yarat"'), 'Hero jump pill links to #oz-blendini-yarat');

  // Interactive controls
  assert.ok(html.includes('id="blendBaseSelect"'), 'Base coffee selector exists');
  assert.ok(html.includes('id="blendAccentSelect"'), 'Accent coffee selector exists');
  assert.ok(html.includes('id="blendRatioSlider"'), 'Ratio slider exists');

  // Custom weight input & presets
  assert.ok(html.includes('id="blendWeightInput"'), 'Custom weight input field exists');
  assert.ok(html.includes('id="blendWeightMinus"'), 'Weight minus stepper exists');
  assert.ok(html.includes('id="blendWeightPlus"'), 'Weight plus stepper exists');
  assert.ok(html.includes('blend-weight-preset-btn'), 'Weight preset chips exist');

  // Fərdi etiket inputs must NOT exist (user requested removal)
  assert.ok(!html.includes('id="blendTitleInput"'), 'blendTitleInput removed');
  assert.ok(!html.includes('id="blendDedicationInput"'), 'blendDedicationInput removed');

  // No discounts (user requested "endirim olmasin")
  assert.ok(!html.includes('5% qənaət'), '5% discount badge removed');
  assert.ok(!html.includes('10% qənaət'), '10% discount badge removed');

  // Live craft bag mockup elements
  assert.ok(html.includes('id="craftBagBlendName"'), 'Bag blend title element exists');
  assert.ok(html.includes('id="craftBagFormulaText"'), 'Bag formula element exists');
  assert.ok(html.includes('id="craftBagGrindText"'), 'Bag grind element exists');
  assert.ok(html.includes('id="craftBagWeightText"'), 'Bag weight element exists');

  // Checkout action
  assert.ok(html.includes('id="blendPriceTotal"'), 'Price display element exists');
  assert.ok(html.includes('id="blendAddToCartBtn"'), 'Add to cart button exists');
});

test('server routes whitelist custom-blend assets', () => {
  const routesSrc = fs.readFileSync(path.join(ROOT, 'server/routes.js'), 'utf8');
  assert.ok(routesSrc.includes("'/custom-blend.css'"), 'custom-blend.css is whitelisted');
  assert.ok(routesSrc.includes("'/custom-blend.js'"), 'custom-blend.js is whitelisted');
});

test('order-store resolves and prepares coffee-custom-blend orders correctly', () => {
  const mockProducts = [
    { id: 'colombia', category: 'coffee', name: 'Colombia', price: 15, active: true },
    { id: 'efiopiya', category: 'coffee', name: 'Efiopiya', price: 13, active: true },
  ];

  const resolution = resolveOrderSelection('coffee-custom-blend', mockProducts);
  assert.equal(resolution.product.id, 'custom-blend');
  assert.equal(resolution.product.category, 'coffee');
  assert.equal(resolution.product.unit, 'g');

  const payload = {
    customerName: 'Əli Həsənov',
    phone: '+994501234567',
    deliveryMethod: 'pickup',
    items: [
      {
        id: 'coffee-custom-blend',
        name: 'Fərdi Blend (70% Colombia + 30% Efiopiya) · V60 / Filtr',
        quantity: 350,
      },
    ],
  };

  const prepared = prepareOrder(payload, mockProducts);
  assert.equal(prepared.items.length, 1);
  const item = prepared.items[0];
  assert.equal(item.id, 'coffee-custom-blend');
  assert.equal(item.category, 'coffee');
  assert.equal(item.unit, 'g');
  assert.equal(item.quantity, 350);
  assert.ok(item.total > 0, 'Item total is computed');
  assert.ok(item.name.includes('Fərdi Blend'), 'Blend name is preserved');
});
