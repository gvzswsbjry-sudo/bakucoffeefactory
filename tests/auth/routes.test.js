const test = require('node:test');
const assert = require('node:assert/strict');
const { newDb } = require('pg-mem');
const { createDatabase } = require('../../server/db');
const { createServer } = require('../../server');
const {
  getEmailConfig,
  formatResetEmail,
  buildMimeMessage,
  formatResetTelegramMessage,
  sendPasswordResetCode,
} = require('../../server/password-reset-notifier');

async function fixture(withDatabase = true, options = {}) {
  let database;
  if (withDatabase) {
    const { Pool } = newDb().adapters.createPg();
    database = createDatabase({ connectionString: 'postgres://local/test', PoolClass: Pool });
  }
  const server = createServer({ customerDatabase: database, ...options });
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

test('provider discovery exposes only public OAuth configuration', async () => {
  const site = await fixture(true, {
    socialProviders: {
      google: { clientId: 'google-client.apps.exampleusercontent.com' },
      apple: { clientId: 'az.bakucoffeefactory.web' },
    },
  });
  try {
    const response = await fetch(`${site.base}/api/auth/providers`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(Object.keys(body).sort(), ['apple', 'google']);
    assert.deepEqual(body.google, { enabled: true, clientId: 'google-client.apps.exampleusercontent.com' });
    assert.deepEqual(body.apple, { enabled: true, clientId: 'az.bakucoffeefactory.web' });
    assert.doesNotMatch(JSON.stringify(body), /secret|privateKey|clientSecret/i);
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

test('social authentication requires a provider-verified ID token', async () => {
  const identities = {
    'google-good-token': { provider: 'google', subject: 'google-subject-1', email: 'tester@gmail.com', name: 'Tester User' },
    'apple-good-token': { provider: 'apple', subject: 'apple-subject-1', email: 'apple_user@icloud.com', name: 'Apple Fan' },
    'apple-repeat-token': { provider: 'apple', subject: 'apple-subject-1', email: null, name: '' },
  };
  const site = await fixture(true, {
    socialProviders: {
      google: { clientId: 'google-client.apps.exampleusercontent.com' },
      apple: { clientId: 'az.bakucoffeefactory.web' },
    },
    oidcVerifier: {
      verify: async (provider, idToken) => {
        const identity = identities[idToken];
        if (!identity || identity.provider !== provider) {
          const error = new Error('Provayder təsdiqi uğursuz oldu.');
          error.status = 401;
          throw error;
        }
        return identity;
      },
    },
  });
  try {
    const forged = await post(site.base, 'social', { provider: 'google', email: 'victim@gmail.com', name: 'Victim' });
    assert.equal(forged.status, 401);

    const googleAuth = await post(site.base, 'social', { provider: 'google', idToken: 'google-good-token' });
    assert.equal(googleAuth.status, 201);
    const googleData = await googleAuth.json();
    assert.equal(googleData.user.email, 'tester@gmail.com');
    const cookie = googleAuth.headers.get('set-cookie');
    assert.match(cookie, /^bcf_customer=/);

    const session = await fetch(`${site.base}/api/auth/me`, { headers: { cookie } });
    assert.equal((await session.json()).user.email, 'tester@gmail.com');

    const repeatGoogle = await post(site.base, 'social', { provider: 'google', idToken: 'google-good-token' });
    assert.equal(repeatGoogle.status, 200);

    const appleAuth = await post(site.base, 'social', { provider: 'apple', idToken: 'apple-good-token' });
    assert.equal(appleAuth.status, 201);
    assert.equal((await appleAuth.json()).user.email, 'apple_user@icloud.com');

    const repeatApple = await post(site.base, 'social', { provider: 'apple', idToken: 'apple-repeat-token' });
    assert.equal(repeatApple.status, 200);
    assert.equal((await repeatApple.json()).user.email, 'apple_user@icloud.com');

    const invalidProvider = await post(site.base, 'social', { provider: 'unknown', idToken: 'nope' });
    assert.equal(invalidProvider.status, 400);

    const oauthRedirect = await fetch(`${site.base}/api/auth/oauth/google`, { redirect: 'manual' });
    assert.equal(oauthRedirect.status, 404);
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

test('forgot-password and reset-password routes never leak OTPs and issue a fresh session on reset', async () => {
  const sent = [];
  const site = await fixture(true, {
    resetCooldownMs: 0,
    resetNotifier: {
      isEmailTransportConfigured: () => true,
      sendPasswordResetCode: async ({ user, code, expiresAt, identifier }) => {
        sent.push({ user, code, expiresAt, identifier });
        return { ok: true, channel: user.email ? 'email' : 'telegram' };
      },
    },
  });
  try {
    const withEmail = await post(site.base, 'register', {
      fullName: 'Farman Test',
      username: 'farman_reset',
      phone: '+994 55 123 45 67',
      email: 'farman.reset@gmail.com',
      password: person.password,
      privacyAccepted: true,
    });
    assert.equal(withEmail.status, 201);
    const oldCookie = withEmail.headers.get('set-cookie');

    const phoneOnly = await post(site.base, 'register', {
      fullName: 'Barista User',
      username: 'barista_no_email',
      phone: '+994 70 390 10 09',
      password: person.password,
      privacyAccepted: true,
    });
    assert.equal(phoneOnly.status, 201);

    // Unknown account still returns generic 200 without leaking existence or code
    const unknownRes = await post(site.base, 'forgot-password', { identifier: 'nonexistent_account' });
    assert.equal(unknownRes.status, 200);
    const unknownJson = await unknownRes.json();
    assert.equal(unknownJson.ok, true);
    assert.equal(sent.length, 0);

    // Account with Gmail routes OTP for email delivery and never exposes code in HTTP body
    const emailForgot = await post(site.base, 'forgot-password', { identifier: 'farman.reset@gmail.com' });
    assert.equal(emailForgot.status, 200);
    const emailForgotJson = await emailForgot.json();
    assert.equal(emailForgotJson.ok, true);
    assert.equal(sent.length, 1);
    assert.match(sent[0].code, /^\d{6}$/);
    assert.equal(sent[0].user.email, 'farman.reset@gmail.com');
    assert.doesNotMatch(JSON.stringify(emailForgotJson), new RegExp(sent[0].code));

    // Phone-only account falls back cleanly to Telegram delivery
    const phoneForgot = await post(site.base, 'forgot-password', { identifier: '070 390 10 09' });
    assert.equal(phoneForgot.status, 200);
    assert.equal(sent.length, 2);
    assert.equal(sent[1].user.email, null);
    assert.equal(sent[1].user.phone, '+994703901009');

    // Cross-origin reset request is blocked
    assert.equal(
      (await post(site.base, 'forgot-password', { identifier: 'farman_reset' }, { origin: 'https://evil.example' })).status,
      403
    );

    // Wrong OTP fails cleanly
    const badReset = await post(site.base, 'reset-password', {
      identifier: 'farman_reset',
      code: sent[0].code === '999999' ? '111111' : '999999',
      newPassword: 'UpdatedPassword123!',
    });
    assert.equal(badReset.status, 400);

    // Valid OTP resets password, invalidates old cookie, and sets new authenticated cookie
    const goodReset = await post(site.base, 'reset-password', {
      identifier: 'farman.reset@gmail.com',
      code: sent[0].code,
      newPassword: 'UpdatedPassword123!',
    });
    assert.equal(goodReset.status, 200);
    const resetCookie = goodReset.headers.get('set-cookie');
    assert.match(resetCookie, /^bcf_customer=/);

    assert.equal((await (await fetch(`${site.base}/api/auth/me`, { headers: { cookie: oldCookie } })).json()).user, null);
    assert.equal((await (await fetch(`${site.base}/api/auth/me`, { headers: { cookie: resetCookie } })).json()).user.username, 'farman_reset');

    assert.equal((await post(site.base, 'login', { identifier: 'farman_reset', password: person.password })).status, 401);
    assert.equal((await post(site.base, 'login', { identifier: 'farman_reset', password: 'UpdatedPassword123!' })).status, 200);
  } finally {
    await site.close();
  }
});

test('password-reset-notifier formats Gmail SMTP/Resend and Telegram payloads accurately', async () => {
  const emptyCfg = getEmailConfig({});
  assert.equal(emptyCfg.configured, false);

  const gmailCfg = getEmailConfig({ GMAIL_USER: 'baku@gmail.com', GMAIL_APP_PASSWORD: 'abcd efgh ijkl mnop' });
  assert.equal(gmailCfg.configured, true);
  assert.equal(gmailCfg.smtp.host, 'smtp.gmail.com');
  assert.equal(gmailCfg.smtp.port, 465);
  assert.equal(gmailCfg.smtp.pass, 'abcdefghijklmnop');

  const emailContent = formatResetEmail({ user: { fullName: 'Fərman', username: 'farman08' }, code: '482910' });
  assert.match(emailContent.html, /482910/);
  assert.match(emailContent.html, /paylaşmayın/);
  const mime = buildMimeMessage({
    from: 'Baku Coffee Factory <baku@gmail.com>',
    to: 'user@gmail.com',
    ...emailContent,
  });
  assert.match(mime, /MIME-Version: 1\.0/);
  assert.match(mime, /=\?UTF-8\?B\?/);

  const tgText = formatResetTelegramMessage({
    user: { fullName: 'Orxan', username: 'orxan1', phone: '+994703901009', email: null },
    code: '654321',
    identifier: '0703901009',
  });
  assert.match(tgText, /654321/);
  assert.match(tgText, /\+994703901009/);

  // Test skipped-network metadata respects hybrid rule in test mode
  const tgSkipped = await sendPasswordResetCode(
    { user: { username: 'u1', email: null, phone: '+994703901009' }, code: '123456', expiresAt: new Date() },
    { env: { GMAIL_USER: 'a@gmail.com', GMAIL_APP_PASSWORD: 'secret' } }
  );
  assert.equal(tgSkipped.channel, 'telegram');

  const emailSkipped = await sendPasswordResetCode(
    { user: { username: 'u2', email: 'u2@gmail.com', phone: '+994703901009' }, code: '123456', expiresAt: new Date() },
    { env: { GMAIL_USER: 'a@gmail.com', GMAIL_APP_PASSWORD: 'secret' } }
  );
  assert.equal(emailSkipped.channel, 'email');
});
