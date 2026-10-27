const assert = require('assert');
const cartUtils = require('../cart-utils.js');

// 1. Start with an empty cart
let cart = {};

// 2. Add coffee (100g @ 15.00 per 100g)
cart['coffee-colombia'] = {
  id: 'colombia',
  name: 'Colombia',
  price: 15,
  unit: 'g',
  maxQuantity: 2000,
  image: 'assets/coffee/bcf-coffee-logo.jpg',
  quantity: 100,
};

// 3. Add tea (150g @ 7.00 per 100g)
cart['tea-1001-gece'] = {
  id: '1001-gece',
  name: '1001 Gecə Çayı',
  price: 7,
  unit: 'g',
  maxQuantity: 1000,
  image: 'assets/tea-packages/1001-gece.jpg',
  quantity: 150,
};

// 4. Add equipment (1 piece @ 25.00)
cart['french-press'] = {
  id: 'french-press',
  name: 'French Press',
  price: 25,
  unit: 'piece',
  maxQuantity: 99,
  image: 'assets/equipment/french-press.jpg',
  quantity: 1,
};

// Test Badge Count: 1 coffee line + 1 tea line + 1 equipment piece = 3 items
assert.strictEqual(cartUtils.getCartBadgeCount(cart), 3, 'Badge count should be 3');
assert.strictEqual(cartUtils.formatCartCount(cart), '3 məhsul', 'Formatted count should be "3 məhsul"');

// Test Total Price: 15.00 + (7 * 1.5 = 10.50) + 25.00 = 50.50
const expectedTotal = 15.00 + 10.50 + 25.00;
const actualTotal = Object.values(cart).reduce((sum, item) => sum + cartUtils.getCartItemTotal(item), 0);
assert.strictEqual(actualTotal, expectedTotal, 'Total price must match sum of all 3 categories');
assert.strictEqual(cartUtils.formatCartPrice(actualTotal), '50.50 ₼');

// Test Unified HTML rendering
const html = cartUtils.renderUnifiedCartItemsHtml(cart);
assert(html.includes('Qəhvə'), 'Unified cart HTML must include Qəhvə category');
assert(html.includes('Çay'), 'Unified cart HTML must include Çay category');
assert(html.includes('Avadanlıq'), 'Unified cart HTML must include Avadanlıq category');
assert(html.includes('Colombia'), 'Must render Colombia');
assert(html.includes('1001 Gecə Çayı'), 'Must render 1001 Gecə');
assert(html.includes('French Press'), 'Must render French Press');
assert(html.includes('assets/coffee/cart-coffee-beans.png'), 'Must render the shared coffee-bean image');
assert(html.includes('assets/tea-packages/1001-gece.jpg'), 'Must render tea photo');
assert(html.includes('assets/equipment/french-press.jpg'), 'Must render equipment photo');

// Test increase coffee: 100 + 5 = 105g
cart = cartUtils.applyCartAction(cart, 'coffee-colombia', 'increase');
assert.strictEqual(cart['coffee-colombia'].quantity, 105);

// Test increase equipment: 1 + 1 = 2
cart = cartUtils.applyCartAction(cart, 'french-press', 'increase');
assert.strictEqual(cart['french-press'].quantity, 2);
assert.strictEqual(cartUtils.getCartBadgeCount(cart), 4, 'Badge count now 4 (1 coffee + 1 tea + 2 french presses)');

// Test remove tea
cart = cartUtils.applyCartAction(cart, 'tea-1001-gece', 'remove');
assert.strictEqual(cart['tea-1001-gece'], undefined, 'Tea should be removed');
assert.strictEqual(cartUtils.getCartBadgeCount(cart), 3, 'Badge count back to 3');

console.log('PASS: Unified multi-category cart operations and rendering are fully validated.');
