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
  assert.match(favorites, /<a href="\$\{escapeHtml\(safeProductUrl\(item\.url\)\)\}"/);
  assert.match(favorites, /data-remove-favorite/);
  assert.doesNotMatch(checkout, /bcf-order-history-v1/);
  assert.match(checkout, /bcf:orders-changed/);
});

test('registration contact selector is hidden outside registration mode', () => {
  const accountCss = read('account.css');
  assert.match(accountCss, /\.account-contact-choice\[hidden\]/);
});

test('favorites trigger sits beside the account control and mobile drawer fills the viewport', () => {
  const favorites = read('favorites.js');
  const favoritesCss = read('favorites.css');
  assert.match(favorites, /function placeTriggerBesideAccount/);
  assert.match(favorites, /function placeTriggerInFallback/);
  assert.match(favorites, /document\.querySelector\('\.site-header'\) \|\| document\.body/);
  assert.match(favorites, /trigger\.classList\.add\('favorites-trigger--fallback'\)/);
  assert.match(favorites, /placeTriggerInFallback\(\);\s*placeTriggerBesideAccount\(\)/);
  assert.match(favorites, /accountTrigger\.insertAdjacentElement\('beforebegin', trigger\)/);
  assert.doesNotMatch(favorites, /document\.body\.append\(trigger,\s*overlay,\s*drawer\)/);
  assert.match(favoritesCss, /\.favorites-trigger\{position:relative/);
  assert.match(favoritesCss, /\.favorites-trigger\.favorites-trigger--fallback\{position:fixed/);
  assert.match(favoritesCss, /@media\(max-width:720px\)[\s\S]*\.favorites-drawer\{inset:0;width:100%;height:100dvh;max-height:none/);
  assert.doesNotMatch(favoritesCss, /\.favorites-trigger\{[^}]*bottom:/);
});

