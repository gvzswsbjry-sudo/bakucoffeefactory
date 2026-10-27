const fs = require('fs');
const assert = require('assert');

// 1. Verify HTML pages include the floating cart button
['caylar.html', 'qehveler.html', 'avadanliqlar.html'].forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('id="floatingCartTrigger"'), `${file} must contain floatingCartTrigger id`);
  assert(content.includes('class="floating-cart-btn"'), `${file} must contain floating-cart-btn class`);
  assert(content.includes('class="floating-cart-icon"'), `${file} must contain floating-cart-icon`);
  assert(content.includes('class="floating-cart-badge"'), `${file} must contain floating-cart-badge`);
  assert(content.includes('<svg') && content.includes('path d="M2.5 9h19'), `${file} must contain basket SVG icon`);
});

// 2. Verify cart.css styles the floating cart button
const cartCss = fs.readFileSync('cart.css', 'utf8');
assert(cartCss.includes('.floating-cart-btn'), 'cart.css must style .floating-cart-btn');
assert(cartCss.includes('position: fixed'), 'cart.css must set position: fixed for floating button');
assert(cartCss.includes('z-index: 65'), 'cart.css must set appropriate z-index for floating button');
assert(cartCss.includes('body.cart-open .floating-cart-btn'), 'cart.css must hide floating button when cart is open');

// 3. Verify cart-utils.js wires floating cart badge and click trigger
const cartUtilsJs = fs.readFileSync('cart-utils.js', 'utf8');
assert(cartUtilsJs.includes('floatingCartBadge'), 'cart-utils.js must sync floatingCartBadge');
assert(cartUtilsJs.includes('floatingCartTrigger'), 'cart-utils.js must listen for floatingCartTrigger clicks');
assert(cartUtilsJs.includes('openUnifiedCart'), 'cart-utils.js must support openUnifiedCart');

// 4. Verify shop scripts wire floatingCartTrigger
const teaShopJs = fs.readFileSync('tea-shop.js', 'utf8');
assert(teaShopJs.includes('floatingCartTrigger?.addEventListener(\'click\', openTeaCart)'), 'tea-shop.js must listen for floatingCartTrigger clicks');

const coffeeShopJs = fs.readFileSync('coffee-shop.js', 'utf8');
assert(coffeeShopJs.includes('floatingCartTrigger?.addEventListener(\'click\', openCoffeeCart)'), 'coffee-shop.js must listen for floatingCartTrigger clicks');

const gearShopJs = fs.readFileSync('gear-shop.js', 'utf8');
assert(gearShopJs.includes('floatingCartTrigger?.addEventListener(\'click\', openCart)'), 'gear-shop.js must listen for floatingCartTrigger clicks');

console.log('PASS: Floating basket button present in coffees, teas, and equipment pages with synchronized count and cart opening.');
