const test = require('node:test');
const assert = require('node:assert/strict');
const { newDb } = require('pg-mem');
const { createDatabase } = require('../../server/db');
const { createCustomerAuth, normalizeEmail, normalizePhone, normalizeUsername } = require('../../server/customer-auth');

async function fixture(now = () => new Date('2026-10-26T10:00:00.000Z')) {
  const { Pool } = newDb().adapters.createPg();
  const database = createDatabase({ connectionString: 'postgres://local/test', PoolClass: Pool });
  await database.migrate();
  return { database, auth: createCustomerAuth({ database, now }) };
}

const person = { phone: '+44 7700 900123', username: 'coffee_fan', password: 'LongEnough123!', privacyAccepted: true, ip: '127.0.0.1' };

test('international phone normalization never inserts an Azerbaijan code', () => {
  assert.equal(normalizePhone('+1 (415) 555-2671'), '+14155552671');
  assert.equal(normalizePhone('0049 151 23456789'), '+4915123456789');
  assert.equal(normalizePhone('+44 7700 900123'), '+447700900123');
  assert.throws(() => normalizePhone('0703901009'), /ölkə kodu/i);
  assert.throws(() => normalizePhone('+0001234567'), /telefon/i);
  assert.equal(normalizeUsername(' Coffee_Fan '), 'coffee_fan');
  assert.equal(normalizeEmail(' Coffee.Fan@Example.COM '), 'coffee.fan@example.com');
  assert.throws(() => normalizeEmail('not-an-email'), /e-poçt/i);
});

test('registration accepts either email or phone and both can be used for login', async () => {
  const { database, auth } = await fixture();
  const emailPerson = { username: 'email_fan', email: 'Fan@Example.com', password: person.password, privacyAccepted: true, ip: '127.0.0.1' };
  const registered = await auth.register(emailPerson);
  assert.equal(registered.user.email, 'fan@example.com');
  assert.equal(registered.user.phone, null);
  const loggedIn = await auth.login({ identifier: 'FAN@example.COM', password: person.password, ip: '127.0.0.1' });
  assert.equal((await auth.getSession(loggedIn.token)).username, 'email_fan');
  await assert.rejects(auth.register({ username: 'no_contact', password: person.password, privacyAccepted: true }), /telefon.*e-poçt|e-poçt.*telefon/i);
  await database.close();
});

test('registration requires privacy consent and persists only salted hash and consent record', async () => {
  const { database, auth } = await fixture();
  await assert.rejects(auth.register({ ...person, privacyAccepted: false }), /məxfilik/i);
  const result = await auth.register(person);
  assert.equal(result.user.phone, '+447700900123');
  assert.equal(result.user.username, 'coffee_fan');
  assert.ok(result.token.length >= 40);
  const { rows } = await database.pool.query('SELECT * FROM customer_users');
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].password_hash, person.password);
  assert.equal(rows[0].password_algorithm, 'scrypt');
  assert.equal(rows[0].privacy_policy_version, '2026-10-26');
  assert.ok(rows[0].privacy_consent_at);
  await database.close();
});

test('username and phone logins share a persistent session and logout revokes it', async () => {
  const { database, auth } = await fixture();
  const registered = await auth.register(person);
  assert.equal((await auth.getSession(registered.token)).username, 'coffee_fan');
  const byName = await auth.login({ identifier: 'COFFEE_FAN', password: person.password, ip: '127.0.0.1' });
  const byPhone = await auth.login({ identifier: '0044 7700 900123', password: person.password, ip: '127.0.0.1' });
  assert.equal((await createCustomerAuth({ database }).getSession(byName.token)).phone, '+447700900123');
  assert.equal((await auth.getSession(byPhone.token)).username, 'coffee_fan');
  await auth.logout(byName.token);
  assert.equal(await auth.getSession(byName.token), null);
  assert.equal((await auth.getSession(byPhone.token)).username, 'coffee_fan');
  await database.close();
});

test('duplicate phone and username are rejected and invalid password is generic', async () => {
  const { database, auth } = await fixture();
  await auth.register(person);
  await assert.rejects(auth.register({ ...person, username: 'another' }), /artıq/i);
  await assert.rejects(auth.register({ ...person, phone: '+33123456789' }), /artıq/i);
  await assert.rejects(auth.login({ identifier: 'coffee_fan', password: 'wrongpass', ip: '127.0.0.1' }), /Giriş məlumatları düzgün deyil/);
  await assert.rejects(auth.login({ identifier: 'unknown', password: 'wrongpass', ip: '127.0.0.1' }), /Giriş məlumatları düzgün deyil/);
  await database.close();
});

test('five failed logins trigger a timed rate limit', async () => {
  const { database, auth } = await fixture();
  for (let i = 0; i < 5; i++) await assert.rejects(auth.login({ identifier: 'unknown', password: 'wrongpass', ip: '127.0.0.1' }), /Giriş məlumatları düzgün deyil/);
  await assert.rejects(auth.login({ identifier: 'unknown', password: 'wrongpass', ip: '127.0.0.1' }), /çox cəhd/i);
  await database.close();
});

test('expired session is invalid even after service recreation', async () => {
  let time = new Date('2026-10-26T10:00:00.000Z');
  const { database, auth } = await fixture(() => time);
  const registered = await auth.register(person);
  time = new Date('2026-11-26T10:00:00.000Z');
  assert.equal(await createCustomerAuth({ database, now: () => time }).getSession(registered.token), null);
  await database.close();
});
