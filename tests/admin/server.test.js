const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { createAuth } = require('../../server/auth');
const { createServer } = require('../../server');

function sample(overrides = {}) {
  return {
    id: 'ethiopia', category: 'coffee', name: 'Efiopiya', price: 13, unit: 'g',
    image: 'assets/coffee/ethiopia.jpg', description: 'Meyvəli qəhvə', active: true,
    stock: { status: 'available', quantity: null }, sortOrder: 1, meta: {}, variants: [],
    ...overrides,
  };
}

async function tempDir(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bcf-server-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}

test('auth supports first-run setup and persists only a salted scrypt hash', async (t) => {
  const dir = await tempDir(t);
  const configPath = path.join(dir, 'admin-config.json');
  const auth = createAuth({ configPath });

  assert.equal(await auth.isConfigured(), false);
  await assert.rejects(() => auth.setup('12345'), /at least 6/i);
  const session = await auth.setup('coffee123');
  assert.match(session.token, /^[a-f0-9]{64}$/);
  assert.equal(await auth.isConfigured(), true);

  const persisted = JSON.parse(await fs.readFile(configPath, 'utf8'));
  assert.equal(Object.hasOwn(persisted, 'password'), false);
  assert.notEqual(persisted.hash, 'coffee123');
  assert.match(persisted.salt, /^[a-f0-9]+$/);
  assert.equal(persisted.algorithm, 'scrypt');

  await assert.rejects(() => auth.login('wrong-pass'), /invalid password/i);
  const loggedIn = await auth.login('coffee123');
  assert.equal(auth.verifySession(loggedIn.token), true);
  assert.equal(auth.logout(loggedIn.token), true);
  assert.equal(auth.verifySession(loggedIn.token), false);
});

test('auth expires sessions after twelve hours', async (t) => {
  const dir = await tempDir(t);
  let clock = 1_000;
  const auth = createAuth({ configPath: path.join(dir, 'admin-config.json'), now: () => clock });
  const session = await auth.setup('coffee123');
  clock += 12 * 60 * 60 * 1000 + 1;
  assert.equal(auth.verifySession(session.token), false);
});

async function startFixture(t, options = {}) {
  const rootDir = await tempDir(t);
  await fs.mkdir(path.join(rootDir, 'assets', 'nested'), { recursive: true });
  await fs.mkdir(path.join(rootDir, 'admin'), { recursive: true });
  await fs.mkdir(path.join(rootDir, 'data'), { recursive: true });
  await fs.writeFile(path.join(rootDir, 'index.html'), '<h1>Storefront</h1>');
  await fs.writeFile(path.join(rootDir, 'admin', 'index.html'), '<h1>Admin</h1>');
  await fs.writeFile(path.join(rootDir, 'assets', 'nested', 'coffee.jpg'), 'jpeg');
  await fs.writeFile(path.join(rootDir, 'assets', 'ignore.txt'), 'no');
  await fs.writeFile(path.join(rootDir, 'data', 'products.json'), `${JSON.stringify([sample()])}\n`);

  const server = createServer({ rootDir, host: '127.0.0.1', port: 0, ...options });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  return { rootDir, server, base: `http://127.0.0.1:${address.port}` };
}

async function request(base, url, options = {}) {
  const headers = { ...(options.body ? { 'content-type': 'application/json' } : {}), ...options.headers };
  return fetch(`${base}${url}`, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined });
}

test('server exposes public reads, static files, and binds to localhost', async (t) => {
  const fixture = await startFixture(t);
  assert.equal(fixture.server.address().address, '127.0.0.1');

  const products = await request(fixture.base, '/api/products');
  assert.equal(products.status, 200);
  assert.match(products.headers.get('content-type'), /application\/json/);
  assert.equal((await products.json())[0].id, 'ethiopia');

  assert.equal((await request(fixture.base, '/api/products/ethiopia')).status, 200);
  assert.equal((await request(fixture.base, '/api/products/missing')).status, 404);
  const catalogScript = await request(fixture.base, '/api/catalog.js');
  assert.equal(catalogScript.status, 200);
  assert.match(catalogScript.headers.get('content-type'), /javascript/);
  assert.match(await catalogScript.text(), /window\.BCF_PRODUCT_DATA/);
  assert.equal((await request(fixture.base, '/')).status, 200);
  assert.equal((await request(fixture.base, '/admin/')).status, 200);
  assert.equal((await request(fixture.base, '/..%2F..%2Fetc%2Fpasswd')).status, 400);
});

test('admin mutations require a valid HttpOnly strict session', async (t) => {
  const fixture = await startFixture(t);
  assert.equal((await request(fixture.base, '/api/admin/products')).status, 401);
  assert.equal((await request(fixture.base, '/api/admin/products', { method: 'POST', body: sample({ id: 'new' }) })).status, 401);
  assert.equal((await request(fixture.base, '/api/admin/products/ethiopia', { method: 'PATCH', body: { price: 14 } })).status, 401);
  assert.equal((await request(fixture.base, '/api/admin/products/ethiopia', { method: 'DELETE' })).status, 401);

  const setup = await request(fixture.base, '/api/admin/session', { method: 'POST', body: { password: 'coffee123' } });
  assert.equal(setup.status, 200);
  const cookie = setup.headers.get('set-cookie');
  assert.match(cookie, /bcf_admin=/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);

  const session = await request(fixture.base, '/api/admin/session', { headers: { cookie } });
  assert.deepEqual(await session.json(), { configured: true, authenticated: true });

  const adminProducts = await request(fixture.base, '/api/admin/products', { headers: { cookie } });
  assert.equal(adminProducts.status, 200);

  const invalid = await request(fixture.base, '/api/admin/products', {
    method: 'POST', headers: { cookie }, body: sample({ id: 'bad', price: -1 }),
  });
  assert.equal(invalid.status, 400);

  const created = await request(fixture.base, '/api/admin/products', {
    method: 'POST', headers: { cookie }, body: sample({ id: 'kenya', name: 'Keniya', price: 8 }),
  });
  assert.equal(created.status, 201);

  const updated = await request(fixture.base, '/api/admin/products/kenya', {
    method: 'PATCH', headers: { cookie }, body: { price: 9 },
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).price, 9);

  assert.equal((await request(fixture.base, '/api/admin/products/missing', { method: 'DELETE', headers: { cookie } })).status, 404);
  assert.equal((await request(fixture.base, '/api/admin/products/kenya', { method: 'DELETE', headers: { cookie } })).status, 204);

  const assets = await request(fixture.base, '/api/admin/assets', { headers: { cookie } });
  assert.deepEqual(await assets.json(), ['assets/nested/coffee.jpg']);

  const logout = await request(fixture.base, '/api/admin/session', { method: 'DELETE', headers: { cookie } });
  assert.equal(logout.status, 204);
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/i);
});

test('admin cookies are secure in production and foreign-origin writes are rejected', async (t) => {
  const fixture = await startFixture(t, { secureCookies: true });
  const forged = await request(fixture.base, '/api/admin/session', {
    method: 'POST', headers: { origin: 'https://other.example' }, body: { password: 'coffee123' },
  });
  assert.equal(forged.status, 403);
  const setup = await request(fixture.base, '/api/admin/session', { method: 'POST', body: { password: 'coffee123' } });
  const cookie = setup.headers.get('set-cookie');
  assert.match(cookie, /; Secure/);
  const update = await request(fixture.base, '/api/admin/products/ethiopia', {
    method: 'PATCH', headers: { cookie, origin: 'https://other.example' }, body: { price: 14 },
  });
  assert.equal(update.status, 403);
});

test('admin image upload requires authentication', async (t) => {
  const fixture = await startFixture(t);
  const response = await request(fixture.base, '/api/admin/assets', {
    method: 'POST',
    body: { name: 'coffee.png', type: 'image/png', data: 'iVBORw0KGgo=' },
  });
  assert.equal(response.status, 401);
});

test('admin uploads a supported image into the asset library', async (t) => {
  const fixture = await startFixture(t);
  const setup = await request(fixture.base, '/api/admin/session', { method: 'POST', body: { password: 'coffee123' } });
  const cookie = setup.headers.get('set-cookie');
  const imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

  const response = await request(fixture.base, '/api/admin/assets', {
    method: 'POST', headers: { cookie }, body: { name: 'Mənim Qəhvəm.png', type: 'image/png', data: imageBase64 },
  });
  assert.equal(response.status, 201);
  const uploaded = await response.json();
  assert.match(uploaded.path, /^assets\/uploads\/[a-z0-9-]+\.png$/);
  assert.deepEqual(await fs.readFile(path.join(fixture.rootDir, uploaded.path)), Buffer.from(imageBase64, 'base64'));

  const assets = await request(fixture.base, '/api/admin/assets', { headers: { cookie } });
  assert.ok((await assets.json()).includes(uploaded.path));
});

test('admin rejects unsupported image upload formats', async (t) => {
  const fixture = await startFixture(t);
  const setup = await request(fixture.base, '/api/admin/session', { method: 'POST', body: { password: 'coffee123' } });
  const cookie = setup.headers.get('set-cookie');
  const response = await request(fixture.base, '/api/admin/assets', {
    method: 'POST', headers: { cookie }, body: { name: 'animation.gif', type: 'image/gif', data: 'R0lGODlh' },
  });
  assert.equal(response.status, 415);
  assert.match((await response.json()).error, /JPG, PNG|WebP/i);
});

test('server rejects oversized JSON request bodies', async (t) => {
  const fixture = await startFixture(t);
  const response = await fetch(`${fixture.base}/api/admin/session`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: 'x'.repeat(1_100_000) }),
  });
  assert.equal(response.status, 413);
});
