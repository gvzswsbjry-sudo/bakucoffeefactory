const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { prepareOrder, resolveOrderSelection } = require('../server/order-store');
const { createServer } = require('../server/routes');

const ROOT = path.resolve(__dirname, '..');

test('qehveler.html has custom blend studio elements and scripts', () => {
  const html = fs.readFileSync(path.join(ROOT, 'qehveler.html'), 'utf8');

  assert.ok(html.includes('custom-blend.css'), 'custom-blend.css stylesheet link is present');
  assert.ok(html.includes('custom-blend.js'), 'custom-blend.js script tag is present');
  assert.ok(html.includes('id="oz-blendini-yarat"'), '#oz-blendini-yarat section exists');
  assert.ok(html.includes('href="#oz-blendini-yarat"'), 'Hero jump pill links to #oz-blendini-yarat');

  // Interactive controls
  assert.ok(html.includes('id="blendBaseSelect"'), 'Base coffee selector exists');
  assert.ok(html.includes('id="blendAccentSelect"'), 'Accent coffee selector exists');
  assert.ok(html.includes('id="blendRatioSlider"'), 'Ratio slider exists');
  assert.ok(html.includes('id="blendTitleInput"'), 'Custom blend title input exists');
  assert.ok(html.includes('id="blendDedicationInput"'), 'Custom dedication input exists');

  // Live craft bag mockup elements
  assert.ok(html.includes('id="craftBagBlendName"'), 'Bag blend title element exists');
  assert.ok(html.includes('id="craftBagDedication"'), 'Bag dedication quote element exists');
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
        name: 'Fərdi Blend: "Muradın Səhər Enerjisi" (70% Colombia + 30% Efiopiya)',
        quantity: 250,
      },
    ],
  };

  const prepared = prepareOrder(payload, mockProducts);
  assert.equal(prepared.items.length, 1);
  const item = prepared.items[0];
  assert.equal(item.id, 'coffee-custom-blend');
  assert.equal(item.category, 'coffee');
  assert.equal(item.unit, 'g');
  assert.equal(item.quantity, 250);
  assert.ok(item.total > 0, 'Item total is computed');
  assert.ok(item.name.includes('Muradın Səhər Enerjisi'), 'Custom blend title is preserved');
});
