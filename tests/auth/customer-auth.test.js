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

test('password reset issues 6-digit OTP by email or phone, validates without burning on weak password, and revokes old sessions', async () => {
  let time = new Date('2026-10-26T10:00:00.000Z');
  const { database } = await fixture(() => time);
  const auth = createCustomerAuth({ database, now: () => time });

  const regPhoneOnly = await auth.register({
    phone: '+994 70 390 10 09',
    username: 'phone_only_user',
    password: person.password,
    privacyAccepted: true,
    ip: '127.0.0.1',
  });
  const regWithEmail = await auth.register({
    phone: '+994 50 111 22 33',
    email: 'ResetUser@Gmail.com',
    username: 'gmail_user',
    password: person.password,
    privacyAccepted: true,
    ip: '127.0.0.1',
  });

  const missing = await auth.requestPasswordReset({ identifier: 'nobody_here', ip: '127.0.0.1' });
  assert.equal(missing.dispatched, false);

  const tgReq = await auth.requestPasswordReset({
    identifier: '070 390 10 09',
    ip: '127.0.0.1',
    emailTransportConfigured: true,
  });
  assert.equal(tgReq.dispatched, true);
  assert.match(tgReq.code, /^\d{6}$/);
  assert.equal(tgReq.deliveryChannel, 'telegram');

  const emailReq = await auth.requestPasswordReset({
    identifier: 'resetuser@gmail.com',
    ip: '127.0.0.1',
    emailTransportConfigured: true,
  });
  assert.equal(emailReq.dispatched, true);
  assert.match(emailReq.code, /^\d{6}$/);
  assert.equal(emailReq.deliveryChannel, 'email');

  // Cooldown prevents accidental immediate re-dispatch for the same user
  const tooSoon = await auth.requestPasswordReset({
    identifier: 'gmail_user',
    ip: '127.0.0.1',
    emailTransportConfigured: true,
  });
  assert.equal(tooSoon.dispatched, false);
  assert.equal(tooSoon.reason, 'cooldown');

  // Weak password rejected BEFORE consuming OTP code
  await assert.rejects(
    auth.resetPassword({ identifier: 'gmail_user', code: emailReq.code, newPassword: 'short', ip: '127.0.0.1' }),
    /12–128 simvol/i
  );

  const resetOk = await auth.resetPassword({
    identifier: 'gmail_user',
    code: emailReq.code,
    newPassword: 'BrandNewPassword123!',
    ip: '127.0.0.1',
  });
  assert.equal(resetOk.user.username, 'gmail_user');
  assert.ok(resetOk.token);

  // Old session was revoked, new session works, and only new password works
  assert.equal(await auth.getSession(regWithEmail.token), null);
  assert.equal((await auth.getSession(resetOk.token)).username, 'gmail_user');
  assert.equal((await auth.getSession(regPhoneOnly.token)).username, 'phone_only_user');
  await assert.rejects(auth.login({ identifier: 'gmail_user', password: person.password, ip: '127.0.0.1' }), /düzgün deyil/);
  const loginNew = await auth.login({ identifier: 'gmail_user', password: 'BrandNewPassword123!', ip: '127.0.0.1' });
  assert.equal(loginNew.user.username, 'gmail_user');

  // Reusing spent OTP fails
  await assert.rejects(
    auth.resetPassword({ identifier: 'gmail_user', code: emailReq.code, newPassword: 'AnotherPassword123!', ip: '127.0.0.1' }),
    /yanlışdır|vaxtı bitib/i
  );

  // Expired OTP (>15 min) fails
  time = new Date(time.getTime() + 16 * 60 * 1000);
  await assert.rejects(
    auth.resetPassword({ identifier: 'phone_only_user', code: tgReq.code, newPassword: 'AnotherPassword123!', ip: '127.0.0.1' }),
    /yanlışdır|vaxtı bitib/i
  );

  // Five wrong OTP guesses burn the token and trigger rate limit
  time = new Date(time.getTime() + 16 * 60 * 1000);
  const freshReq = await auth.requestPasswordReset({ identifier: 'phone_only_user', ip: '10.0.0.5' });
  for (let i = 0; i < 4; i++) {
    await assert.rejects(
      auth.resetPassword({ identifier: 'phone_only_user', code: '000000', newPassword: 'ValidNewPassword123!', ip: '10.0.0.5' }),
      /yanlışdır/i
    );
  }
  await assert.rejects(
    auth.resetPassword({ identifier: 'phone_only_user', code: '000000', newPassword: 'ValidNewPassword123!', ip: '10.0.0.5' }),
    /etibarsız oldu/i
  );
  await assert.rejects(
    auth.resetPassword({ identifier: 'phone_only_user', code: freshReq.code, newPassword: 'ValidNewPassword123!', ip: '10.0.0.5' }),
    /çox cəhd/i
  );

  await database.close();
});
