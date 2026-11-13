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

  // Default selection: 70% Efiopiya (base) + 30% Robusta (accent)
  assert.ok(html.includes('<option value="efiopiya" selected>'), 'Efiopiya is selected by default for base');
  assert.ok(html.includes('<option value="robusta" selected>'), 'Robusta is selected by default for accent');
  assert.ok(html.includes('70% Efiopiya'), 'Base ratio pill displays 70% Efiopiya');
  assert.ok(html.includes('30% Robusta'), 'Accent ratio pill displays 30% Robusta');
  assert.ok(html.includes('70% Efiopiya · 30% Robusta'), 'Craft bag formula displays 70% Efiopiya · 30% Robusta');
  assert.ok(html.includes('28.75 ₼'), 'Initial price reflects 70% Efiopiya + 30% Robusta @ 250g (28.75 ₼)');

  // All 10 coffees must be available in both base and accent selectors
  const allCoffeeIds = ['efiopiya', 'colombia', 'brasil', 'guatemala', 'honduras', 'keniya', 'costa-rica', 'robusta', 'decaf', 'uqanda'];
  const baseSelectHtml = html.slice(html.indexOf('id="blendBaseSelect"'), html.indexOf('</select>', html.indexOf('id="blendBaseSelect"')));
  const accentSelectHtml = html.slice(html.indexOf('id="blendAccentSelect"'), html.indexOf('</select>', html.indexOf('id="blendAccentSelect"')));
  for (const cid of allCoffeeIds) {
    assert.ok(baseSelectHtml.includes(`value="${cid}"`), `Base selector contains ${cid}`);
    assert.ok(accentSelectHtml.includes(`value="${cid}"`), `Accent selector contains ${cid}`);
  }

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
    { id: 'robusta', category: 'coffee', name: 'Robusta', price: 8, active: true },
    { id: 'brasil', category: 'coffee', name: 'Brasil', price: 10, active: true },
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

test('order-store resolves multiple distinct custom blends with precise recipe prices', () => {
  const mockProducts = [
    { id: 'efiopiya', category: 'coffee', name: 'Efiopiya', price: 13, active: true },
    { id: 'robusta', category: 'coffee', name: 'Robusta', price: 8, active: true },
    { id: 'colombia', category: 'coffee', name: 'Colombia', price: 15, active: true },
    { id: 'brasil', category: 'coffee', name: 'Brasil', price: 10, active: true },
  ];

  // Blend 1: 70% Efiopiya (13) + 30% Robusta (8) => 0.7*13 + 0.3*8 = 11.50
  const blend1Id = 'coffee-custom-blend-efiopiya-70pct-robusta-30pct-dene';
  const res1 = resolveOrderSelection(blend1Id, mockProducts);
  assert.equal(res1.product.price, 11.5);
  assert.equal(res1.canonicalId, blend1Id);

  // Blend 2: 50% Colombia (15) + 50% Brasil (10) => 0.5*15 + 0.5*10 = 12.50
  const blend2Id = 'coffee-custom-blend-colombia-50pct-brasil-50pct-v60';
  const res2 = resolveOrderSelection(blend2Id, mockProducts);
  assert.equal(res2.product.price, 12.5);
  assert.equal(res2.canonicalId, blend2Id);

  const payload = {
    phone: '+994501234567',
    expectedTotal: 28.75 + 37.50, // 250g @ 11.50 = 28.75; 300g @ 12.50 = 37.50
    items: [
      {
        id: blend1Id,
        name: 'Fərdi Blend (70% Efiopiya + 30% Robusta) · Dənə (Bütöv)',
        quantity: 250,
      },
      {
        id: blend2Id,
        name: 'Fərdi Blend (50% Colombia + 50% Brasil) · V60 / Filtr',
        quantity: 300,
      },
    ],
  };

  const prepared = prepareOrder(payload, mockProducts);
  assert.equal(prepared.items.length, 2, 'Both custom blends are retained');
  assert.equal(prepared.items[0].id, blend1Id);
  assert.equal(prepared.items[0].total, 28.75);
  assert.equal(prepared.items[1].id, blend2Id);
  assert.equal(prepared.items[1].total, 37.50);
  assert.equal(prepared.total, 66.25);
});
