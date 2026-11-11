'use strict';

const { getClientIp, isJsonRequest, isTrustedOrigin } = require('./security');
const defaultResetNotifier = require('./password-reset-notifier');

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
  socialProviders = {}, oidcVerifier, resetNotifier = defaultResetNotifier,
}) {
  if (!pathname.startsWith('/api/auth/')) return false;
  if (pathname === '/api/auth/providers' && req.method === 'GET') {
    json(res, 200, Object.fromEntries(['google', 'apple'].map((provider) => [provider, {
      enabled: Boolean(socialProviders[provider]?.clientId),
      clientId: socialProviders[provider]?.clientId || null,
    }])));
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
  if (!['register', 'login', 'logout', 'social', 'forgot-password', 'reset-password', 'phone'].some((name) => pathname === `/api/auth/${name}`)) {
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
    if (pathname === '/api/auth/social') {
      if (!oidcVerifier) throw Object.assign(new Error('Bu giriş üsulu hazırda aktiv deyil.'), { status: 503 });
      const provider = String(body.provider || '').toLowerCase();
      if (!['google', 'apple'].includes(provider)) {
        throw Object.assign(new Error('Dəstəklənməyən giriş təminatçısı.'), { status: 400 });
      }
      const identity = await oidcVerifier.verify(provider, body.idToken);
      const result = await customerAuth.socialAuth({
        ...identity,
        phone: body.phone,
        requirePhone: body.requirePhone === true,
        ip: input.ip,
        userAgent: input.userAgent,
      });
      if (result.needsPhone) {
        json(res, 200, { needsPhone: true, isNew: Boolean(result.isNew), profile: result.profile });
        return true;
      }
      json(res, result.isNew ? 201 : 200, { user: result.user }, { 'set-cookie': cookieHeader(result.token, secureCookies) });
      return true;
    }
    if (pathname === '/api/auth/phone') {
      const sessionUser = await customerAuth.getSession(customerCookie(req));
      if (!sessionUser) {
        json(res, 401, { error: 'Hesaba daxil olun.' });
        return true;
      }
      const result = await customerAuth.updatePhone({
        userId: sessionUser.id,
        phone: body?.phone,
        ip: input.ip,
      });
      json(res, 200, { user: result.user });
      return true;
    }
    if (pathname === '/api/auth/forgot-password') {
      const identifier = String(body?.identifier || '').trim();
      const emailReady = typeof resetNotifier.isEmailTransportConfigured === 'function'
        ? Boolean(resetNotifier.isEmailTransportConfigured())
        : defaultResetNotifier.isEmailTransportConfigured();
      const prep = await customerAuth.requestPasswordReset({
        identifier,
        ip: input.ip,
        emailTransportConfigured: emailReady,
      });
      if (prep.dispatched && typeof resetNotifier.sendPasswordResetCode === 'function') {
        const sendResult = await resetNotifier.sendPasswordResetCode({
          user: prep.user,
          code: prep.code,
          expiresAt: prep.expiresAt,
          identifier,
        });
        if (sendResult?.fallback && sendResult.channel === 'telegram') {
          await database.pool.query(
            'UPDATE password_reset_tokens SET delivery_channel = $2 WHERE id = $1',
            [prep.tokenId, 'telegram']
          ).catch(() => {});
        } else if (sendResult && !sendResult.ok && !sendResult.skipped) {
          console.warn('[Password Reset] Bərpa kodu göndərilmədi:', sendResult.reason || sendResult.error);
        }
      }
      json(res, 200, {
        ok: true,
        message: 'Əgər bu məlumata uyğun hesab mövcuddursa, 6 rəqəmli təsdiq kodu göndərildi.',
      });
      return true;
    }
    if (pathname === '/api/auth/reset-password') {
      const result = await customerAuth.resetPassword({
        identifier: body?.identifier,
        code: body?.code,
        newPassword: body?.newPassword,
        ip: input.ip,
        userAgent: input.userAgent,
      });
      json(res, 200, { ok: true, user: result.user }, { 'set-cookie': cookieHeader(result.token, secureCookies) });
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
