'use strict';

const COOKIE_NAME = 'bcf_customer';
const COOKIE_AGE = 30 * 24 * 60 * 60;

function customerCookie(req) {
  const entry = String(req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return entry ? entry.slice(COOKIE_NAME.length + 1) : null;
}

function cookieHeader(token, secureCookies) {
  return `${COOKIE_NAME}=${token || ''}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${token ? COOKIE_AGE : 0}${secureCookies ? '; Secure' : ''}`;
}

function sameOrigin(req) {
  if (!req.headers.origin) return true;
  try {
    return new URL(req.headers.origin).host === req.headers.host;
  } catch {
    return false;
  }
}

async function handleCustomerAuthRequest(req, res, pathname, { database, customerAuth, secureCookies, json, parseJson }) {
  if (!pathname.startsWith('/api/auth/')) return false;
  if (pathname === '/api/auth/providers' && req.method === 'GET') {
    json(res, 200, { google: false, apple: false });
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
  if (!['register', 'login', 'logout'].some((name) => pathname === `/api/auth/${name}`)) {
    json(res, 404, { error: 'Account route not found' });
    return true;
  }
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return true;
  }
  if (!sameOrigin(req)) {
    json(res, 403, { error: 'Bu sorğuya icazə verilmir.' });
    return true;
  }
  if (pathname === '/api/auth/logout') {
    await customerAuth.logout(customerCookie(req));
    json(res, 204, undefined, { 'set-cookie': cookieHeader('', secureCookies) });
    return true;
  }
  if (!/^application\/json(?:\s*;|\s*$)/i.test(String(req.headers['content-type'] || ''))) {
    json(res, 415, { error: 'JSON məzmunu tələb olunur.' });
    return true;
  }
  try {
    const body = await parseJson(req, 16 * 1024);
    const input = { ...body, ip: req.socket.remoteAddress, userAgent: req.headers['user-agent'] };
    const result = pathname === '/api/auth/register' ? await customerAuth.register(input) : await customerAuth.login(input);
    json(res, pathname === '/api/auth/register' ? 201 : 200, { user: result.user }, { 'set-cookie': cookieHeader(result.token, secureCookies) });
  } catch (error) {
    json(res, error.status || 500, { error: error.status ? error.message : 'Hesab xidməti hazırda əlçatan deyil.' });
  }
  return true;
}

module.exports = { handleCustomerAuthRequest, customerCookie, cookieHeader, sameOrigin };
