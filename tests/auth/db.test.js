const test = require('node:test');
const assert = require('node:assert/strict');
const { newDb } = require('pg-mem');
const { createDatabase } = require('../../server/db');

test('customer database is optional for guest storefront requests', () => {
  assert.equal(createDatabase({ connectionString: '' }), null);
});

test('customer migration creates persistent user, session, and attempt tables', async () => {
  const memory = newDb();
  const { Pool } = memory.adapters.createPg();
  const database = createDatabase({ connectionString: 'postgres://local/test', PoolClass: Pool });
  await database.migrate();
  await database.migrate();
  const tables = await database.pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  const names = tables.rows.map((row) => row.table_name);
  for (const table of ['customer_users', 'customer_sessions', 'customer_identities', 'customer_favorites', 'auth_attempts']) {
    assert.ok(names.includes(table), table);
  }
  await database.close();
});
