const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { newDb } = require('pg-mem');
const { createDatabase } = require('../../server/db');
const { createServer } = require('../../server');

test('favorites follow the signed-in customer across sessions, not other customers', async (t) => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bcf-favorites-'));
  t.after(() => fs.rm(rootDir, { recursive: true, force: true }));
  await fs.mkdir(path.join(rootDir, 'data'));
  await fs.mkdir(path.join(rootDir, 'assets'));
  const product = { id: 'colombia', category: 'coffee', name: 'Colombia', price: 15, unit: 'g',
    active: true, stock: { status: 'available', quantity: null }, image: 'assets/coffee/colombia.png',
    description: 'Test', sortOrder: 1, meta: {}, variants: [] };
  await fs.writeFile(path.join(rootDir, 'data', 'products.json'), JSON.stringify([product]));
  const { Pool } = newDb().adapters.createPg();
  const customerDatabase = createDatabase({ connectionString: 'postgres://local/test', PoolClass: Pool });
  t.after(() => customerDatabase.close());
  const server = createServer({ rootDir, port: 0, customerDatabase });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const register = async (username) => {
    const response = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, email: `${username}@example.com`, password: 'LongEnough123!', privacyAccepted: true }) });
    assert.equal(response.status, 201);
    return response.headers.get('set-cookie');
  };
  const first = await register('first_user');
  const second = await register('second_user');
  const request = (cookie, method = 'GET', body) => fetch(`${base}/api/account/favorites`, {
    method, headers: { cookie, ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal((await request('', 'GET')).status, 401);
  const saved = await request(first, 'PUT', { keys: ['coffee:colombia'] });
  assert.equal(saved.status, 200);
  assert.deepEqual((await saved.json()).keys, ['coffee:colombia']);
  assert.deepEqual((await (await request(first)).json()).keys, ['coffee:colombia']);
  assert.deepEqual((await (await request(second)).json()).keys, []);
  assert.equal((await request(first, 'PUT', { keys: ['coffee:missing'] })).status, 400);
});
