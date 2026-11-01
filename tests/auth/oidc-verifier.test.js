const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createOidcVerifier } = require('../../server/oidc-verifier');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const kid = 'test-key-1';
const jwk = { ...publicKey.export({ format: 'jwk' }), kid, alg: 'RS256', use: 'sig' };
const nowMs = Date.parse('2026-11-01T12:00:00Z');
const nowSeconds = Math.floor(nowMs / 1000);

function token(claims, header = { alg: 'RS256', kid, typ: 'JWT' }) {
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedClaims = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const data = `${encodedHeader}.${encodedClaims}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(data), privateKey).toString('base64url');
  return `${data}.${signature}`;
}

function verifier() {
  return createOidcVerifier({
    providers: {
      google: { clientId: 'google-client-id' },
      apple: { clientId: 'apple-client-id' },
    },
    now: () => nowMs,
    fetchImpl: async () => ({
      ok: true,
      headers: { get: () => 'public, max-age=3600' },
      json: async () => ({ keys: [jwk] }),
    }),
  });
}

test('OIDC verifier accepts a correctly signed Google identity token', async () => {
  const identity = await verifier().verify('google', token({
    iss: 'https://accounts.google.com', aud: 'google-client-id', sub: 'subject-1',
    email: 'verified@example.com', email_verified: true, name: 'Verified User',
    iat: nowSeconds - 30, exp: nowSeconds + 300,
  }));
  assert.deepEqual(identity, {
    provider: 'google', subject: 'subject-1', email: 'verified@example.com', name: 'Verified User',
  });
});

test('OIDC verifier rejects forged, expired, wrong-audience and unverified tokens', async () => {
  const base = {
    iss: 'https://accounts.google.com', aud: 'google-client-id', sub: 'subject-1',
    email: 'verified@example.com', email_verified: true, iat: nowSeconds - 30, exp: nowSeconds + 300,
  };
  const forgedParts = token(base).split('.');
  forgedParts[1] = Buffer.from(JSON.stringify({ ...base, email: 'victim@example.com' })).toString('base64url');
  await assert.rejects(() => verifier().verify('google', forgedParts.join('.')), { status: 401 });
  await assert.rejects(() => verifier().verify('google', token({ ...base, exp: nowSeconds - 60 })), { status: 401 });
  await assert.rejects(() => verifier().verify('google', token({ ...base, aud: 'other-client' })), { status: 401 });
  await assert.rejects(() => verifier().verify('google', token({ ...base, email_verified: false })), { status: 401 });
});

test('OIDC verifier validates Apple issuer and client audience', async () => {
  const identity = await verifier().verify('apple', token({
    iss: 'https://appleid.apple.com', aud: 'apple-client-id', sub: 'apple-subject',
    email: 'private@privaterelay.appleid.com', iat: nowSeconds - 30, exp: nowSeconds + 300,
  }));
  assert.equal(identity.provider, 'apple');
  assert.equal(identity.subject, 'apple-subject');
});
