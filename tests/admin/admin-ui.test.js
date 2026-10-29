const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('admin HTML includes accessible setup/login and desktop catalog controls', () => {
  const html = read('admin/index.html');
  for (const required of [
    'id="setupForm"', 'id="loginForm"', 'id="adminApp"', 'id="categoryNav"',
    'id="productSearch"', 'id="activeFilter"', 'id="stockFilter"', 'id="productTableBody"',
    'id="newProductButton"', 'id="logoutButton"', 'aria-live="polite"',
  ]) assert.match(html, new RegExp(required));
  assert.match(html, /<script src="product-values\.js"><\/script><script src="admin-api\.js">/);
  assert.match(html, /<label[^>]*for="setupPassword"/);
  assert.match(html, /<label[^>]*for="loginPassword"/);
});

test('admin editor exposes base fields, metadata, variants, image picker, and guarded actions', () => {
  const html = read('admin/index.html');
  for (const id of [
    'productEditor', 'productForm', 'productId', 'productCategory', 'productName', 'productPrice',
    'productUnit', 'productImage', 'productDescription', 'productActive', 'stockStatus',
    'stockQuantity', 'sortOrder', 'productMeta', 'variantRows', 'addVariantButton',
    'openAssetPicker', 'assetDialog', 'validationSummary', 'saveProductButton',
    'cancelEditButton', 'deleteProductButton', 'deleteDialog',
  ]) assert.match(html, new RegExp(`id="${id}"`), id);
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-labelledby="deleteDialogTitle"/);
  assert.doesNotMatch(html, /id="stockQuantity"[^>]*disabled/);
});

test('desktop CSS is MacBook-oriented with fixed navigation and scrollable editor', () => {
  const css = read('admin/admin.css');
  assert.match(css, /--sidebar-width:\s*2(?:4|5|6)\dpx/);
  assert.match(css, /\.admin-shell[\s\S]*grid-template-columns:\s*var\(--sidebar-width\)\s+minmax\(0,\s*1fr\)/);
  assert.match(css, /\.admin-sidebar[\s\S]*position:\s*fixed/);
  assert.match(css, /\.product-editor[\s\S]*position:\s*fixed[\s\S]*overflow-y:\s*auto/);
  assert.match(css, /body[\s\S]*overflow-x:\s*hidden/);
  assert.match(css, /@media\s*\(max-width:\s*1100px\)/);
  assert.doesNotMatch(css, /body\s*\{[^}]*min-width:\s*1100px/);
});

test('admin catalog becomes a readable card grid on tablet and mobile screens', () => {
  const css = read('admin/admin.css');
  const js = read('admin/admin.js');

  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /#categoryNav[\s\S]*overflow-x:\s*auto/);
  assert.match(css, /\.product-table\s+thead[\s\S]*display:\s*none/);
  assert.match(css, /\.product-table\s+tbody[\s\S]*display:\s*grid/);
  assert.match(css, /\.product-table\s+td::before[\s\S]*content:\s*attr\(data-label\)/);
  assert.match(css, /\.product-cell\s*>\s*div[\s\S]*min-width:\s*0/);
  assert.match(css, /\.product-cell\s+strong[\s\S]*text-overflow:\s*ellipsis/);

  for (const label of ['Məhsul', 'Kateqoriya', 'Qiymət', 'Stok', 'Status', 'Əməliyyat']) {
    assert.match(js, new RegExp(`data-label="${label}"`));
  }
});

test('admin editor, authentication, and dialogs fit mobile viewports safely', () => {
  const css = read('admin/admin.css');

  assert.match(css, /\.auth-card[\s\S]*width:\s*min\(460px,\s*calc\(100vw\s*-\s*24px\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.product-editor\s*\{[^}]*inset:\s*0[^}]*width:\s*100%[^}]*min-height:\s*100vh[^}]*height:\s*100dvh/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.editor-actions\s*\{[^}]*width:\s*100%[^}]*padding-bottom:\s*calc\([^)]*safe-area-inset-bottom/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.form-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.image-field\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.variant-row-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.asset-dialog\s*\{[^}]*width:\s*calc\(100vw\s*-\s*20px\)[^}]*max-height:\s*calc\(100dvh\s*-\s*20px\)/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.asset-dialog header\s*\{[^}]*position:\s*sticky[^}]*top:\s*0/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.product-editor\s*\{[^}]*safe-area-inset-right[^}]*safe-area-inset-left/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.asset-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});

test('admin API client exposes all session, product, and asset methods', async () => {
  const calls = [];
  const { createAdminApi } = require('../../admin/admin-api');
  const api = createAdminApi(async (url, options = {}) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: options.method === 'DELETE' ? 204 : 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true }),
    };
  });

  await api.getSession();
  await api.setup('secret1');
  await api.login('secret1');
  await api.logout();
  await api.listProducts();
  await api.createProduct({ id: 'new' });
  await api.updateProduct('new', { price: 2 });
  await api.deleteProduct('new');
  await api.listAssets();
  await api.uploadAsset({ name: 'coffee.png', type: 'image/png', data: 'abc' });

  assert.deepEqual(calls.map((call) => [call.url, call.options.method || 'GET']), [
    ['/api/admin/session', 'GET'], ['/api/admin/session', 'POST'], ['/api/admin/session', 'POST'],
    ['/api/admin/session', 'DELETE'], ['/api/admin/products', 'GET'], ['/api/admin/products', 'POST'],
    ['/api/admin/products/new', 'PATCH'], ['/api/admin/products/new', 'DELETE'], ['/api/admin/assets', 'GET'],
    ['/api/admin/assets', 'POST'],
  ]);
  assert.ok(calls.every((call) => call.options.credentials === 'same-origin'));
});

test('admin controller covers unsaved changes, validation, empty/error states, and delete confirmation', () => {
  const js = read('admin/admin.js');
  assert.match(js, /beforeunload/);
  assert.match(js, /validationSummary/);
  assert.match(js, /empty-state/);
  assert.match(js, /offline|server|şəbəkə/i);
  assert.match(js, /deleteDialog\.showModal/);
  assert.match(js, /confirmDeleteButton/);
  assert.match(js, /assetDialog\.showModal/);
  assert.match(js, /stockQuantity[\s\S]*stockStatus[\s\S]*counted/);
});

test('orders page can filter and persist shipped status', () => {
  const html = read('admin/orders.html');
  const js = read('admin/orders.js');
  assert.match(html, /id="orderStatusFilter"/);
  assert.match(html, /value="shipped"[^>]*>Göndərildi/);
  assert.match(js, /\/api\/admin\/orders\//);
  assert.match(js, /method:\s*'PATCH'/);
  assert.match(js, /Göndərildi/);
  assert.match(js, /Göndərilməyib/);
});

test('orders page keeps order details and status actions usable on mobile', () => {
  const html = read('admin/orders.html');
  assert.match(html, /@media\s*\(max-width:\s*700px\)[\s\S]*\.order-top\s*\{[^}]*flex-direction:\s*column/);
  assert.match(html, /@media\s*\(max-width:\s*700px\)[\s\S]*\.order-items\s+li\s*\{[^}]*grid-template-columns:\s*48px\s+minmax\(0,\s*1fr\)/);
  assert.match(html, /@media\s*\(max-width:\s*700px\)[\s\S]*\.order-items\s+li\s*>\s*strong\s*\{[^}]*grid-column:\s*2/);
  assert.match(html, /@media\s*\(max-width:\s*700px\)[\s\S]*\.order-status-action\s*\{[^}]*width:\s*100%/);
  assert.match(html, /@media\s*\(max-width:\s*700px\)[\s\S]*\.orders-toolbar\s+select\s*\{[^}]*width:\s*100%/);
});

test('equipment variant editing preserves color and accessible image text', () => {
  const js = read('admin/admin.js');
  assert.match(js, /data-variant="color"/);
  assert.match(js, /data-variant="alt"/);
  assert.match(js, /color:\s*row\.querySelector\('\[data-variant="color"\]'\)/);
  assert.match(js, /alt:\s*row\.querySelector\('\[data-variant="alt"\]'\)/);
});

test('product detail blocks purchasing when managed stock is unavailable', () => {
  const js = read('product-detail.js');
  assert.match(js, /detailProduct\.stock/);
  assert.match(js, /detailAdd\.disabled\s*=\s*!purchasable/);
  assert.match(js, /if\s*\(!purchasable\)\s*return/);
});
