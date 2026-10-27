const fs = require('fs');
const assert = require('assert');

// 1. Verify the shared coffee-bean cart image exists
assert(fs.existsSync('assets/coffee/cart-coffee-beans.png'), 'Coffee-bean cart image must exist');

// 2. Verify cart-utils.js hydrates coffee logo
const cartUtils = require('../cart-utils.js');
const rawCart = {
  'coffee-colombia': { name: 'Colombia', price: 15, quantity: 100, unit: 'g' },
  'tea-1001-gece': { name: '1001 Gecə Çayı', price: 7, quantity: 100, unit: 'g', image: 'assets/tea-packages/1001-gece.jpg' },
};
const hydrated = cartUtils.hydrateEquipmentCart(rawCart, []);
assert.strictEqual(hydrated['coffee-colombia'].image, 'assets/coffee/cart-coffee-beans.png', 'Hydrated coffee item must use the shared bean image');

// 3. Verify coffee-shop.js includes COFFEE_LOGO and renders it
const coffeeShopJs = fs.readFileSync('coffee-shop.js', 'utf8');
assert(coffeeShopJs.includes('cart-coffee-beans.png'), 'coffee-shop.js must reference the shared bean image');
assert(coffeeShopJs.includes('cart-item-thumb'), 'coffee-shop.js must render cart-item-thumb');

// 4. Duplicate header/toolbar carts are removed; floating cart remains.
const avadanliqlarHtml = fs.readFileSync('avadanliqlar.html', 'utf8');
assert(!avadanliqlarHtml.includes('id="headerCartTrigger"'), 'avadanliqlar.html must not duplicate the cart in the header');
assert(!avadanliqlarHtml.includes('id="cartTrigger"'), 'avadanliqlar.html must not duplicate the cart in the catalog toolbar');
assert(avadanliqlarHtml.includes('id="floatingCartTrigger"'), 'avadanliqlar.html must keep the floating cart');

// 5. Coffee and tea pages use the floating cart instead of a header cart.
const qehvelerHtml = fs.readFileSync('qehveler.html', 'utf8');
assert(!qehvelerHtml.includes('id="coffeeCartTrigger"'), 'qehveler.html must not duplicate the cart in the header');
assert(qehvelerHtml.includes('id="floatingCartTrigger"'), 'qehveler.html must keep the floating cart');

const caylarHtml = fs.readFileSync('caylar.html', 'utf8');
assert(!caylarHtml.includes('id="teaCartTrigger"'), 'caylar.html must not duplicate the cart in the header');
assert(caylarHtml.includes('id="floatingCartTrigger"'), 'caylar.html must keep the floating cart');

// 6. Verify cart.css has sticky header and mobile positioning
const cartCss = fs.readFileSync('cart.css', 'utf8');
assert(cartCss.includes('.site-header'), 'cart.css must style .site-header');
assert(cartCss.includes('position: sticky'), 'cart.css must make .site-header sticky');
assert(cartCss.includes('.site-header .tea-header-cart'), 'cart.css must position .site-header .tea-header-cart');

// 7. Verify double-tap zoom is disabled in viewport meta and touch-action
['index.html', 'qehveler.html', 'caylar.html', 'avadanliqlar.html', 'mehsul.html', 'menyu.html'].forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('user-scalable=no'), `${file} must include user-scalable=no`);
  assert(content.includes('maximum-scale=1.0'), `${file} must include maximum-scale=1.0`);
});

const styleCss = fs.readFileSync('style.css', 'utf8');
assert(styleCss.includes('touch-action:manipulation'), 'style.css must include touch-action:manipulation');

// 8. Verify modal zoom prevention in CSS and JS
assert(cartCss.includes('.tea-order-modal'), 'cart.css must style .tea-order-modal');
assert(cartCss.includes('touch-action: pan-y'), 'cart.css must set touch-action: pan-y on .tea-order-modal');
assert(cartCss.includes('pointer-events: none'), 'cart.css must disable pointer events on modal image to prevent zoom');

const scriptJs = fs.readFileSync('script.js', 'utf8');
assert(scriptJs.includes('gesturestart'), 'script.js must intercept gesturestart to prevent pinch zoom');
assert(scriptJs.includes('touchend'), 'script.js must intercept touchend to prevent double-tap zoom');
assert(scriptJs.includes('timeDiff <= 350'), 'script.js must detect rapid double-tap');

const cartUtilsJs = fs.readFileSync('cart-utils.js', 'utf8');
assert(cartUtilsJs.includes('gesturestart'), 'cart-utils.js must intercept gesturestart');
assert(cartUtilsJs.includes('touchend'), 'cart-utils.js must intercept touchend');

console.log('PASS: Coffee logo in cart, sticky header cart, and double-tap zoom prevention on all pages and modals are verified.');
