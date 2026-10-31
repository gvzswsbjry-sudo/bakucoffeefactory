'use strict';

const { getClientIp, isJsonRequest, isTrustedOrigin } = require('./security');

const COOKIE_NAME = 'bcf_customer';
const COOKIE_AGE = 30 * 24 * 60 * 60;

function customerCookie(req) {
  const entry = String(req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return entry ? entry.slice(COOKIE_NAME.length + 1) : null;
}

function cookieHeader(token, secureCookies) {
  return `${COOKIE_NAME}=${token || ''}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${token ? COOKIE_AGE : 0}; Priority=High${secureCookies ? '; Secure' : ''}`;
}

function sameOrigin(req, allowedOrigins = []) {
  return isTrustedOrigin(req, allowedOrigins);
}

async function handleCustomerAuthRequest(req, res, pathname, {
  database, customerAuth, secureCookies, json, parseJson, allowedOrigins = [], trustProxy = false,
}) {
  if (!pathname.startsWith('/api/auth/')) return false;
  if (pathname === '/api/auth/providers' && req.method === 'GET') {
    json(res, 200, { google: true, apple: true });
    return true;
  }
  if (pathname.startsWith('/api/auth/oauth/') && req.method === 'GET') {
    const provider = pathname.slice('/api/auth/oauth/'.length);
    res.writeHead(302, { Location: `/?auth=social&provider=${encodeURIComponent(provider)}` });
    res.end();
    return true;
  }
  if (!database || !customerAuth) {
    json(res, 503, { error: 'Hesab xidməti hazırda əlçatan deyil.' });
    return true;
  }
  try {
    await database.migrate();
  } catch {
    json(res, 503, { error: 'Hesab xidməti hazırda əlçatan deyil.' });
    return true;
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    json(res, 200, { user: await customerAuth.getSession(customerCookie(req)) });
    return true;
  }
  if (!['register', 'login', 'logout', 'social', 'oauth'].some((name) => pathname === `/api/auth/${name}`)) {
    json(res, 404, { error: 'Account route not found' });
    return true;
  }
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return true;
  }
  if (!sameOrigin(req, allowedOrigins)) {
    json(res, 403, { error: 'Bu sorğuya icazə verilmir.' });
    return true;
  }
  if (pathname === '/api/auth/logout') {
    await customerAuth.logout(customerCookie(req));
    json(res, 204, undefined, { 'set-cookie': cookieHeader('', secureCookies) });
    return true;
  }
  if (!isJsonRequest(req)) {
    json(res, 415, { error: 'JSON məzmunu tələb olunur.' });
    return true;
  }
  try {
    const body = await parseJson(req, 16 * 1024);
    const input = { ...body, ip: getClientIp(req, trustProxy), userAgent: String(req.headers['user-agent'] || '').slice(0, 512) };
    if (pathname === '/api/auth/social' || pathname === '/api/auth/oauth') {
      const result = await customerAuth.socialAuth(input);
      json(res, result.isNew ? 201 : 200, { user: result.user }, { 'set-cookie': cookieHeader(result.token, secureCookies) });
      return true;
    }
    const result = pathname === '/api/auth/register' ? await customerAuth.register(input) : await customerAuth.login(input);
    json(res, pathname === '/api/auth/register' ? 201 : 200, { user: result.user }, { 'set-cookie': cookieHeader(result.token, secureCookies) });
  } catch (error) {
    json(res, error.status || 500, { error: error.status ? error.message : 'Hesab xidməti hazırda əlçatan deyil.' });
  }
  return true;
}

module.exports = { handleCustomerAuthRequest, customerCookie, cookieHeader, sameOrigin };
