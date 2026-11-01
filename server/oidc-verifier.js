'use strict';

const crypto = require('node:crypto');

const PROVIDERS = {
  google: { issuer: ['https://accounts.google.com', 'accounts.google.com'], jwks: 'https://www.googleapis.com/oauth2/v3/certs' },
  apple: { issuer: ['https://appleid.apple.com'], jwks: 'https://appleid.apple.com/auth/keys' },
};

function oidcError(message = 'Provayder təsdiqi uğursuz oldu.', status = 401) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function decodeSegment(segment) {
  try { return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')); }
  catch { throw oidcError(); }
}

function hasAudience(audience, clientId) {
  return Array.isArray(audience) ? audience.includes(clientId) : audience === clientId;
}

function createOidcVerifier({ providers = {}, fetchImpl = globalThis.fetch, now = () => Date.now() } = {}) {
  const cache = new Map();

  async function getKey(provider, kid) {
    const metadata = PROVIDERS[provider];
    const cached = cache.get(provider);
    if (cached && cached.expiresAt > now() && cached.keys.has(kid)) return cached.keys.get(kid);
    if (typeof fetchImpl !== 'function') throw oidcError('Provayder xidməti əlçatan deyil.', 503);
    let response;
    try {
      response = await fetchImpl(metadata.jwks, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(5000) });
    } catch { throw oidcError('Provayder xidməti əlçatan deyil.', 503); }
    if (!response.ok) throw oidcError('Provayder xidməti əlçatan deyil.', 503);
    const body = await response.json();
    const keys = new Map((Array.isArray(body.keys) ? body.keys : []).filter((key) => key?.kid).map((key) => [key.kid, key]));
    const maxAge = /max-age=(\d+)/i.exec(String(response.headers.get('cache-control') || ''));
    cache.set(provider, { keys, expiresAt: now() + Math.min(Number(maxAge?.[1] || 3600), 86400) * 1000 });
    if (!keys.has(kid)) throw oidcError();
    return keys.get(kid);
  }

  async function verify(provider, idToken) {
    const config = providers[provider];
    const metadata = PROVIDERS[provider];
    if (!metadata || !config?.clientId) throw oidcError('Bu giriş üsulu hazırda aktiv deyil.', 503);
    const parts = String(idToken || '').split('.');
    if (parts.length !== 3 || parts.some((part) => !part)) throw oidcError();
    const header = decodeSegment(parts[0]);
    const claims = decodeSegment(parts[1]);
    if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw oidcError();
    let publicKey;
    try { publicKey = crypto.createPublicKey({ key: await getKey(provider, header.kid), format: 'jwk' }); }
    catch (error) { if (error.status) throw error; throw oidcError(); }
    const signatureOk = crypto.verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), publicKey, Buffer.from(parts[2], 'base64url'));
    const current = Math.floor(now() / 1000);
    if (!signatureOk || !metadata.issuer.includes(claims.iss) || !hasAudience(claims.aud, config.clientId)
      || !Number.isFinite(claims.exp) || claims.exp <= current - 30
      || (Number.isFinite(claims.iat) && claims.iat > current + 60)
      || typeof claims.sub !== 'string' || claims.sub.length > 255) throw oidcError();
    if (provider === 'google' && claims.email_verified !== true) throw oidcError('Google e-poçtu təsdiqlənməyib.');
    if (typeof claims.email !== 'string') throw oidcError('Provayder e-poçt ünvanı qaytarmadı.');
    return { provider, subject: claims.sub, email: claims.email, name: typeof claims.name === 'string' ? claims.name : '' };
  }

  return { verify };
}

module.exports = { createOidcVerifier, oidcError };
