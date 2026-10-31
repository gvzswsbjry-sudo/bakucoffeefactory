const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createOrderStore, prepareOrder } = require('../../server/order-store');
const { createServer } = require('../../server');
const { newDb } = require('pg-mem');
const { createDatabase } = require('../../server/db');

const products = [{
  id: 'colombia', category: 'coffee', name: 'Colombia', price: 15, unit: 'g', active: true,
  stock: { status: 'available', quantity: null }, image: 'assets/coffee/colombia.png', variants: [],
}, {
  id: 'admiral', category: 'tea', name: 'Admiral', price: 8, unit: 'g', active: true,
  stock: { status: 'available', quantity: null }, image: 'assets/tea/admiral.jpg', variants: [],
}, {
  id: 'tamper', category: 'equipment', name: 'Tamper', price: 55, unit: 'piece', active: true,
  stock: { status: 'available', quantity: null }, image: 'assets/equipment/tamper.jpg',
  variants: [{ id: 'tamper-black', name: 'Qara', price: 58, image: 'assets/equipment/tamper-black.jpg' }],
}];

test('equipment without variants can be ordered by its product ID', () => {
  const plain = { id: 'plain-grinder', category: 'equipment', name: 'Sadə dəyirman', price: 25,
    unit: 'piece', active: true, stock: { status: 'available', quantity: null }, image: 'assets/equipment/grinder.jpg', variants: [] };
  const payload = { phone: '+994703901009', items: [{ id: plain.id, quantity: 1 }] };
  const order = prepareOrder(payload, [...products, plain]);
  assert.equal(order.items[0].productId, plain.id);
  assert.equal(order.total, 25);
  assert.throws(() => prepareOrder(payload, [...products, { ...plain, active: false }]), /satışda deyil/i);
  assert.throws(() => prepareOrder(payload, [...products, { ...plain, stock: { status: 'out' } }]), /satışda deyil/i);
});

test('orders validate quantities and price from server catalog', () => {
  const make = (items, phone = '+994703901009') => prepareOrder({ phone, items, note: '  Zəng edin.  ' }, products);
  assert.throws(() => make([]), /məhsul/i);
  assert.throws(() => make([{ id: 'coffee-missing', quantity: 100 }]), /tapılmadı/i);
  assert.throws(() => make([{ id: 'coffee-colombia', quantity: 101 }]), /miqdar/i);
  assert.throws(() => make([{ id: 'coffee-colombia', quantity: 100 }], '0703901009'), /telefon/i);
  const order = make([{ id: 'coffee-colombia', quantity: 200, price: 0.01, name: 'fake' }]);
  assert.equal(order.total, 30);
  assert.equal(order.items[0].name, 'Colombia');
  assert.equal(order.items[0].price, 15);
  assert.equal(order.note, 'Zəng edin.');
  assert.throws(() => prepareOrder({ phone: '+994703901009', expectedTotal: 1, items: [{ id: 'coffee-colombia', quantity: 100 }] }, products), /dəyişib/i);
  const mixed = make([{ id: 'tea-admiral', quantity: 250 }, { id: 'tamper-black', quantity: 2 }]);
  assert.equal(mixed.total, 136);
  assert.equal(mixed.items[1].price, 58);
  assert.throws(() => prepareOrder({ phone: '+994703901009', items: [{ id: 'tea-admiral', quantity: 100 }] }, [{ ...products[1], stock: { status: 'out' } }]), /satışda deyil/i);
  assert.throws(() => prepareOrder({ phone: '+994703901009', items: [{ id: 'tea-admiral', quantity: 100 }] }, [{ ...products[1], price: 0 }]), /qiymət/i);
});

test('orders persist and remain readable after store recreation', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bcf-orders-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const filePath = path.join(dir, 'orders.json');
  const order = prepareOrder({ phone: '+994703901009', items: [{ id: 'coffee-colombia', quantity: 100 }] }, products);
  const saved = await createOrderStore({ filePath }).create(order);
  assert.match(saved.id, /^BCF-/);
  assert.equal((await createOrderStore({ filePath }).list())[0].id, saved.id);
  assert.equal((await fs.readFile(filePath, 'utf8')).includes(saved.id), true);
  assert.equal((await fs.stat(filePath)).mode & 0o777, 0o600);
});

test('order status updates persist and reject invalid transitions', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bcf-order-status-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const filePath = path.join(dir, 'orders.json');
  const store = createOrderStore({ filePath });
  const order = prepareOrder({ phone: '+994703901009', items: [{ id: 'coffee-colombia', quantity: 100 }] }, products);
  const saved = await store.create(order);
  const shipped = await store.updateStatus(saved.id, 'shipped');
  assert.equal(shipped.status, 'shipped');
  assert.equal((await createOrderStore({ filePath }).list())[0].status, 'shipped');
  await assert.rejects(() => store.updateStatus(saved.id, 'unknown'), /status/i);
  assert.equal(await store.updateStatus('BCF-MISSING', 'new'), null);
});

test('public checkout saves a receipt and admin can read orders after login', async (t) => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bcf-order-http-'));
  t.after(() => fs.rm(rootDir, { recursive: true, force: true }));
  await fs.mkdir(path.join(rootDir, 'data'));
  await fs.mkdir(path.join(rootDir, 'assets'));
  await fs.writeFile(path.join(rootDir, 'data', 'products.json'), JSON.stringify(products.map((product, index) => ({
    ...product, description: 'Test', sortOrder: index + 1, meta: {},
  }))));
  const server = createServer({ rootDir, port: 0 });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const payload = { phone: '+994703901009', note: 'Qeyd', items: [{ id: 'coffee-colombia', quantity: 100, price: 0.01 }] };
  const send = (body, headers = {}) => fetch(`${base}/api/orders`, {
    method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
  });
  assert.equal((await send(payload, { origin: 'https://other.example' })).status, 403);
  assert.equal((await send({ ...payload, phone: '0703901009' })).status, 400);
  const placed = await send(payload);
  assert.equal(placed.status, 201);
  const receipt = await placed.json();
  assert.equal(receipt.total, 15);
  assert.match(receipt.orderId, /^BCF-/);
  assert.equal((await fetch(`${base}/api/admin/orders`)).status, 401);
  const login = await fetch(`${base}/api/admin/session`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: 'coffee-test-123' }),
  });
  assert.equal(login.status, 200);
  const admin = await fetch(`${base}/api/admin/orders`, { headers: { cookie: login.headers.get('set-cookie') } });
  assert.equal(admin.status, 200);
  assert.equal((await admin.json())[0].id, receipt.orderId);
  const shipped = await fetch(`${base}/api/admin/orders/${encodeURIComponent(receipt.orderId)}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', cookie: login.headers.get('set-cookie') },
    body: JSON.stringify({ status: 'shipped' }),
  });
  assert.equal(shipped.status, 200);
  assert.equal((await shipped.json()).status, 'shipped');
  const invalid = await fetch(`${base}/api/admin/orders/${encodeURIComponent(receipt.orderId)}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', cookie: login.headers.get('set-cookie') },
    body: JSON.stringify({ status: 'invalid' }),
  });
  assert.equal(invalid.status, 400);
});

test('signed-in customers see only their own orders across sessions', async (t) => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bcf-customer-orders-'));
  t.after(() => fs.rm(rootDir, { recursive: true, force: true }));
  await fs.mkdir(path.join(rootDir, 'data'));
  await fs.mkdir(path.join(rootDir, 'assets'));
  await fs.writeFile(path.join(rootDir, 'data', 'products.json'), JSON.stringify(products.map((product, index) => ({
    ...product, description: 'Test', sortOrder: index + 1, meta: {},
  }))));
  const { Pool } = newDb().adapters.createPg();
  const customerDatabase = createDatabase({ connectionString: 'postgres://local/test', PoolClass: Pool });
  t.after(() => customerDatabase.close());
  const server = createServer({ rootDir, port: 0, customerDatabase });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const register = async (username, phone) => fetch(`${base}/api/auth/register`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, phone, password: 'LongEnough123!', privacyAccepted: true }),
  });
  const first = await register('first_customer', '+447700900123');
  const second = await register('second_customer', '+447700900124');
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  const firstCookie = first.headers.get('set-cookie');
  const secondCookie = second.headers.get('set-cookie');
  const payload = { phone: '+447700900123', items: [{ id: 'coffee-colombia', quantity: 100 }] };
  const placed = await fetch(`${base}/api/orders`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: firstCookie }, body: JSON.stringify(payload),
  });
  assert.equal(placed.status, 201);
  const { orderId } = await placed.json();
  assert.equal((await fetch(`${base}/api/account/orders`)).status, 401);
  const own = await fetch(`${base}/api/account/orders`, { headers: { cookie: firstCookie } });
  assert.equal(own.status, 200);
  const ownOrders = await own.json();
  assert.equal(ownOrders.length, 1);
  assert.equal(ownOrders[0].id, orderId);
  assert.equal(ownOrders[0].items[0].name, 'Colombia');
  const other = await fetch(`${base}/api/account/orders`, { headers: { cookie: secondCookie } });
  assert.deepEqual(await other.json(), []);
});
