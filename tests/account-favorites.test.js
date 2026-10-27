const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('catalog headers keep one account entry and remove duplicate cart triggers', () => {
  const coffee = read('qehveler.html');
  const tea = read('caylar.html');
  const equipment = read('avadanliqlar.html');
  assert.doesNotMatch(coffee, /id="coffeeCartTrigger"/);
  assert.doesNotMatch(tea, /id="teaCartTrigger"/);
  assert.doesNotMatch(equipment, /id="headerCartTrigger"|id="cartTrigger"/);
  assert.doesNotMatch(equipment, /Qiymətlər müvəqqətidir və daha sonra yenilənəcək/);
  for (const html of [coffee, tea, equipment]) assert.match(html, /id="floatingCartTrigger"/);
});

test('shared storefront loads the favorites feature and server exposes its assets', () => {
  const shared = read('script.js');
  const routes = read('server/routes.js');
  const favorites = read('favorites.js');
  assert.match(shared, /favorites\.css/);
  assert.match(shared, /favorites\.js/);
  assert.match(routes, /'\/favorites\.css'/);
  assert.match(routes, /'\/favorites\.js'/);
  assert.match(favorites, /bcf-favorites-v1/);
  assert.match(favorites, /\.coffee-profile/);
  assert.match(favorites, /\.tea-product/);
  assert.match(favorites, /\.shop-product/);
  assert.match(favorites, /aria-pressed/);
  assert.match(favorites, /bcf:favorites-changed/);
});

test('account center keeps profile and order history while favorites live in a separate drawer', () => {
  const account = read('account.js');
  const favorites = read('favorites.js');
  const checkout = read('checkout.js');
  assert.match(account, /Hesab məlumatları/);
  assert.match(account, /Keçmiş sifarişlər/);
  assert.match(account, /Hesabdan çıx/);
  assert.doesNotMatch(account, /data-center="favorites"/);
  assert.doesNotMatch(account, /account-favorites-list/);
  assert.doesNotMatch(account, /bcf-favorites-v1/);
  assert.match(account, /\/api\/account\/orders/);
  assert.match(favorites, /id = 'favoritesTrigger'/);
  assert.match(favorites, /className = 'favorites-drawer'/);
  assert.match(favorites, /favorites-list/);
  assert.match(favorites, /safeProductUrl/);
  assert.match(favorites, /<a href="\$\{safeProductUrl\(item\.url\)\}"/);
  assert.match(favorites, /data-remove-favorite/);
  assert.doesNotMatch(checkout, /bcf-order-history-v1/);
  assert.match(checkout, /bcf:orders-changed/);
});

test('registration contact selector is hidden outside registration mode', () => {
  const accountCss = read('account.css');
  assert.match(accountCss, /\.account-contact-choice\[hidden\]/);
});

