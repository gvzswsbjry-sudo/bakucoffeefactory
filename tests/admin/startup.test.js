const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('Mac launcher starts the localhost-only Node admin server', () => {
  const script = read('start-admin.command');
  assert.match(script, /^#!\/bin\/zsh/);
  assert.match(script, /node server\.js/);
  assert.match(script, /127\.0\.0\.1:8017\/admin\//);
});

test('managed catalog pages bootstrap directly from /api/products instead of generated catalog data', () => {
  for (const file of ['qehveler.html', 'caylar.html', 'avadanliqlar.html', 'mehsul.html']) {
    const html = read(file);
    assert.doesNotMatch(html, /api\/catalog\.js/, file);
    assert.match(html, /storefront-products\.js/, file);
    assert.match(html, /storefront-bootstrap\.js/, file);
    assert.doesNotMatch(html, /<script[^>]+src="(?:tea-data|equipment-data|tea-shop|coffee-shop|gear-shop|product-detail)\.js/, file);
  }
});

test('the dynamic storefront bootstrap is allowed through the static-file route', () => {
  const routes = read('server/routes.js');
  assert.match(routes, /PUBLIC_FILES = new Set\([\s\S]*'\/storefront-bootstrap\.js'/);
});

test('README documents admin setup, local-only access, persistence, and backups', () => {
  const readme = read('README.md');
  assert.match(readme, /Admin panel/i);
  assert.match(readme, /http:\/\/127\.0\.0\.1:8017\/admin\//);
  assert.match(readme, /products\.json/);
  assert.match(readme, /products\.json\.bak/);
  assert.match(readme, /yalnız bu MacBook|yalnız lokal/i);
});
