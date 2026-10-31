const test = require('node:test');
const assert = require('node:assert/strict');
const { newDb } = require('pg-mem');
const { createDatabase } = require('../../server/db');
const { createServer } = require('../../server');

async function fixture(withDatabase = true) {
  let database;
  if (withDatabase) {
    const { Pool } = newDb().adapters.createPg();
    database = createDatabase({ connectionString: 'postgres://local/test', PoolClass: Pool });
  }
  const server = createServer({ customerDatabase: database });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, database, close: async () => {
    await new Promise((resolve) => server.close(resolve));
    await database?.close();
  } };
}

const person = { phone: '+44 7700 900123', username: 'coffee_fan', password: 'LongEnough123!', privacyAccepted: true };
const post = (base, endpoint, body, headers = {}) => fetch(`${base}/api/auth/${endpoint}`, {
  method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
});

test('register, me, logout, and phone login use a separate secure customer cookie', async () => {
  const site = await fixture();
  try {
    const registered = await post(site.base, 'register', person);
    assert.equal(registered.status, 201);
    assert.equal((await registered.json()).user.phone, '+447700900123');
    const cookie = registered.headers.get('set-cookie');
    assert.match(cookie, /^bcf_customer=/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/);
    assert.doesNotMatch(cookie, /bcf_admin=/);
    const session = await fetch(`${site.base}/api/auth/me`, { headers: { cookie } });
    assert.equal((await session.json()).user.username, 'coffee_fan');
    const loggedOut = await fetch(`${site.base}/api/auth/logout`, { method: 'POST', headers: { cookie } });
    assert.equal(loggedOut.status, 204);
    assert.equal((await (await fetch(`${site.base}/api/auth/me`, { headers: { cookie } })).json()).user, null);
    const loggedIn = await post(site.base, 'login', { identifier: '0044 7700 900123', password: person.password });
    assert.equal(loggedIn.status, 200);
    assert.equal((await loggedIn.json()).user.username, 'coffee_fan');
  } finally { await site.close(); }
});

test('provider discovery never exposes OAuth secrets', async () => {
  const site = await fixture();
  try {
    const response = await fetch(`${site.base}/api/auth/providers`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(Object.keys(body).sort(), ['apple', 'google']);
    assert.equal(typeof body.google, 'boolean');
    assert.equal(typeof body.apple, 'boolean');
    assert.doesNotMatch(JSON.stringify(body), /secret|clientId|private/i);
  } finally { await site.close(); }
});

test('auth rejects cross-origin writes and invalid content while public pages remain available', async () => {
  const site = await fixture();
  try {
    assert.equal((await fetch(`${site.base}/menyu.html`)).status, 200);
    assert.equal((await post(site.base, 'register', person, { origin: 'https://evil.example' })).status, 403);
    assert.equal((await fetch(`${site.base}/api/auth/register`, { method: 'POST', body: 'bad' })).status, 415);
    assert.equal((await fetch(`${site.base}/api/auth/register`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' })).status, 400);
    assert.equal((await fetch(`${site.base}/api/admin/session`)).status, 200);
  } finally { await site.close(); }
});

test('missing database disables account routes without taking the storefront down', async () => {
  const site = await fixture(false);
  try {
    assert.equal((await fetch(`${site.base}/api/auth/me`)).status, 503);
    assert.equal((await fetch(`${site.base}/menyu.html`)).status, 200);
  } finally { await site.close(); }
});

test('static serving exposes only storefront assets, never private server files', async () => {
  const site = await fixture(false);
  try {
    for (const pathname of ['/server.js', '/server/db.js', '/data/admin-config.json', '/package.json', '/.env', '/node_modules/pg/package.json']) {
      assert.equal((await fetch(`${site.base}${pathname}`)).status, 404, pathname);
    }
    assert.equal((await fetch(`${site.base}/account.js`)).status, 200);
    assert.equal((await fetch(`${site.base}/assets/brand/baku-coffee-factory-logo.jpg`)).status, 200);
  } finally { await site.close(); }
});

test('social authentication allows Google and Apple sign-in and session generation', async () => {
  const site = await fixture();
  try {
    const googleAuth = await post(site.base, 'social', { provider: 'google', email: 'tester@gmail.com', name: 'Tester User' });
    assert.equal(googleAuth.status, 201);
    const googleData = await googleAuth.json();
    assert.equal(googleData.user.email, 'tester@gmail.com');
    const cookie = googleAuth.headers.get('set-cookie');
    assert.match(cookie, /^bcf_customer=/);

    const session = await fetch(`${site.base}/api/auth/me`, { headers: { cookie } });
    assert.equal((await session.json()).user.email, 'tester@gmail.com');

    const repeatGoogle = await post(site.base, 'social', { provider: 'google', email: 'tester@gmail.com' });
    assert.equal(repeatGoogle.status, 200);

    const appleAuth = await post(site.base, 'social', { provider: 'apple', email: 'apple_user@icloud.com', name: 'Apple Fan' });
    assert.equal(appleAuth.status, 201);
    assert.equal((await appleAuth.json()).user.email, 'apple_user@icloud.com');

    const invalidProvider = await post(site.base, 'social', { provider: 'unknown', email: 'x@example.com' });
    assert.equal(invalidProvider.status, 400);

    const oauthRedirect = await fetch(`${site.base}/api/auth/oauth/google`, { redirect: 'manual' });
    assert.equal(oauthRedirect.status, 302);
    assert.match(oauthRedirect.headers.get('location'), /auth=social&provider=google/);
  } finally { await site.close(); }
});

test('production customer cookie is marked Secure', async () => {
  const { Pool } = newDb().adapters.createPg();
  const database = createDatabase({ connectionString: 'postgres://local/test', PoolClass: Pool });
  const server = createServer({ customerDatabase: database, secureCookies: true });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const response = await post(base, 'register', { ...person, username: 'secure_cookie' });
    assert.equal(response.status, 201);
    assert.match(response.headers.get('set-cookie'), /; Secure/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await database.close();
  }
});
