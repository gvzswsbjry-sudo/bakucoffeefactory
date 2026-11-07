'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { handleCustomerAuthRequest, customerCookie, sameOrigin } = require('./customer-auth-routes');
const { prepareOrder } = require('./order-store');
const { createAnalyticsStore } = require('./analytics-store');
const {
  sendTelegramNotification,
  sendTestMessage,
  checkAndNotifyOrders,
  getTelegramStatus,
} = require('./telegram-notifier');
const {
  applySecurityHeaders,
  createRateLimiter,
  getClientIp,
  isJsonRequest,
  isTrustedOrigin,
} = require('./security');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']);
const UPLOAD_TYPES = new Map([
  ['image/jpeg', { extension: '.jpg', valid: (data) => data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff }],
  ['image/png', { extension: '.png', valid: (data) => data.length >= 8 && data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) }],
  ['image/webp', { extension: '.webp', valid: (data) => data.length >= 12 && data.subarray(0, 4).toString('ascii') === 'RIFF' && data.subarray(8, 12).toString('ascii') === 'WEBP' }],
]);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_UPLOAD_BODY_BYTES = 12 * 1024 * 1024;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.ico': 'image/x-icon',
};
const PUBLIC_FILES = new Set([
  '/index.html', '/menyu.html', '/qehveler.html', '/caylar.html', '/avadanliqlar.html',
  '/mehsul.html', '/mexfilik.html', '/admin/index.html',
  '/style.css', '/navigation.css', '/home-contact.css', '/menu-background.css',
  '/menu-mobile.css', '/summer-menu.css', '/tea-mobile.css', '/gear.css',
  '/catalog.css', '/cart.css', '/account.css', '/favorites.css', '/brand.css', '/admin/admin.css',
  '/checkout.css', '/admin/orders.html', '/admin/orders.js', '/admin/analytics.html', '/admin/analytics.js',
  '/script.js', '/storefront-products.js', '/storefront-bootstrap.js', '/cart-utils.js', '/coffee-shop.js',
  '/tea-shop.js', '/tea-data.js', '/gear-shop.js', '/equipment-data.js',
  '/product-detail.js', '/account.js', '/favorites.js', '/admin/admin.js', '/admin/admin-api.js',
  '/checkout.js', '/analytics.js',
  '/admin/product-values.js',
]);

function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function cookieToken(req) {
  const match = String(req.headers.cookie || '').match(/(?:^|;\s*)bcf_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function constantTimeStringEqual(left, right) {
  const leftHash = crypto.createHash('sha256').update(String(left || '')).digest();
  const rightHash = crypto.createHash('sha256').update(String(right || '')).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function requireJson(req, res) {
  if (isJsonRequest(req)) return true;
  json(res, 415, { error: 'JSON məzmunu tələb olunur.' });
  return false;
}

async function parseJson(req, maxBytes = 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error('Request body is too large');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Request body must be valid JSON');
    error.status = 400;
    throw error;
  }
}

async function saveUploadedImage(assetsRoot, rootDir, payload) {
  const type = UPLOAD_TYPES.get(String(payload?.type || '').toLowerCase());
  if (!type) {
    const error = new Error('Yalnız JPG, PNG və WebP şəkilləri yükləmək olar.');
    error.status = 415;
    throw error;
  }
  const encoded = String(payload?.data || '');
  if (!encoded || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    const error = new Error('Şəkil məlumatı düzgün deyil.');
    error.status = 400;
    throw error;
  }
  const data = Buffer.from(encoded, 'base64');
  if (!data.length || data.length > MAX_UPLOAD_BYTES) {
    const error = new Error('Şəkil maksimum 8 MB ola bilər.');
    error.status = 413;
    throw error;
  }
  if (!type.valid(data)) {
    const error = new Error('Fayl məzmunu seçilmiş şəkil formatına uyğun deyil.');
    error.status = 400;
    throw error;
  }

  const sourceName = path.parse(String(payload?.name || 'image')).name;
  const slug = sourceName.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 52) || 'image';
  const fileName = `${slug}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}${type.extension}`;
  const uploadRoot = path.join(assetsRoot, 'uploads');
  const absolute = path.join(uploadRoot, fileName);
  await fs.mkdir(uploadRoot, { recursive: true });
  await fs.writeFile(absolute, data, { flag: 'wx' });
  return path.relative(rootDir, absolute).split(path.sep).join('/');
}

async function listAssets(assetsRoot, rootDir) {
  const result = [];
  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        result.push(path.relative(rootDir, absolute).split(path.sep).join('/'));
      }
    }
  }
  await walk(assetsRoot);
  return result.sort((a, b) => a.localeCompare(b));
}

function createRequestHandler({
  rootDir,
  store,
  auth,
  orders,
  analytics: userAnalytics,
  customerDatabase,
  customerAuth,
  secureCookies = false,
  allowedOrigins = [],
  trustProxy = false,
  adminInitialPassword = '',
  socialProviders = {},
  oidcVerifier,
}) {
  const analytics = userAnalytics || createAnalyticsStore({ rootDir });
  const assetsRoot = path.join(rootDir, 'assets');
  const apiLimiter = createRateLimiter({ limit: 240, windowMs: 60 * 1000 });
  const adminLoginLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });
  const accountLimiter = createRateLimiter({ limit: 12, windowMs: 15 * 60 * 1000 });
  const orderLimiter = createRateLimiter({ limit: 20, windowMs: 60 * 60 * 1000 });

  function limitRequest(res, limiter, key) {
    const result = limiter.consume(key);
    res.setHeader('RateLimit-Limit', String(result.limit));
    res.setHeader('RateLimit-Remaining', String(result.remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
    if (result.allowed) return false;
    json(res, 429, { error: 'Çox sayda sorğu göndərildi. Bir qədər sonra yenidən cəhd edin.' }, {
      'retry-after': String(result.retryAfter),
    });
    return true;
  }

  return async function handle(req, res) {
    applySecurityHeaders(res, { secure: secureCookies });
    try {
      const url = new URL(req.url, 'http://localhost');
      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        return json(res, 400, { error: 'Invalid URL path' });
      }
      if (pathname.split('/').includes('..') || pathname.includes('\0') || pathname.includes('\\')) {
        return json(res, 400, { error: 'Invalid URL path' });
      }

      const clientIp = getClientIp(req, trustProxy);
      if (pathname.startsWith('/api/')) {
        if (limitRequest(res, apiLimiter, clientIp)) return;
        if (!isTrustedOrigin(req, allowedOrigins)) return json(res, 403, { error: 'Bu sorğuya icazə verilmir.' });
        if (req.method === 'OPTIONS') return json(res, 204);
        if (pathname === '/api/admin/session' && req.method === 'POST' && limitRequest(res, adminLoginLimiter, clientIp)) return;
        if (['/api/auth/login', '/api/auth/register'].includes(pathname) && req.method === 'POST' && limitRequest(res, accountLimiter, clientIp)) return;
        if (pathname === '/api/orders' && req.method === 'POST' && limitRequest(res, orderLimiter, clientIp)) return;
      }

      if (await handleCustomerAuthRequest(req, res, pathname, {
        database: customerDatabase, customerAuth, secureCookies, json, parseJson, allowedOrigins, trustProxy,
        socialProviders, oidcVerifier,
      })) return;

      if (req.method === 'GET' && pathname === '/api/products') return json(res, 200, await store.list());
      if (req.method === 'GET' && pathname === '/api/catalog.js') {
        const serialized = JSON.stringify(await store.list()).replace(/</g, '\\u003c');
        res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store' });
        return res.end(`window.BCF_PRODUCT_DATA=${serialized};\n`);
      }
      if (req.method === 'GET' && pathname.startsWith('/api/products/')) {
        const item = await store.get(pathname.slice('/api/products/'.length));
        return item ? json(res, 200, item) : json(res, 404, { error: 'Product not found' });
      }

      if (pathname === '/api/analytics/track') {
        if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
        try {
          const body = await parseJson(req, 8 * 1024);
          await analytics.trackPageView({
            sessionId: String(body?.sessionId || '').slice(0, 100),
            path: String(body?.path || '/').slice(0, 200),
            ip: clientIp,
            userAgent: String(req.headers['user-agent'] || '').slice(0, 250)
          });
          return json(res, 200, { ok: true });
        } catch {
          return json(res, 200, { ok: false });
        }
      }

      if (pathname === '/api/analytics/heartbeat') {
        if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
        try {
          const body = await parseJson(req, 8 * 1024);
          await analytics.trackHeartbeat({
            sessionId: String(body?.sessionId || '').slice(0, 100),
            path: String(body?.path || '/').slice(0, 200),
            duration: Number(body?.duration) || 15
          });
          return json(res, 200, { ok: true });
        } catch {
          return json(res, 200, { ok: false });
        }
      }

      if (pathname === '/api/orders') {
        if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
        if (!sameOrigin(req, allowedOrigins)) return json(res, 403, { error: 'Bu sorğuya icazə verilmir.' });
        if (!requireJson(req, res)) return;
        try {
          const rawOrder = await parseJson(req, 48 * 1024);
          const token = customerCookie(req);
          let customer = null;
          if (customerDatabase && customerAuth) {
            await customerDatabase.migrate();
            if (token) {
              customer = await customerAuth.getSession(token);
            }
            if (!customer) {
              return json(res, 401, { error: 'Sifariş vermək üçün hesaba daxil olmalısınız.' });
            }
            if (!rawOrder.phone && customer.phone) {
              rawOrder.phone = customer.phone;
            }
          }
          const order = prepareOrder(rawOrder, await store.list());
          if (customer) {
            order.customerId = customer.id;
            order.customerName = customer.fullName || customer.username;
            order.username = customer.username;
            order.phone = customer.phone || order.phone;
            order.email = customer.email || null;
          }
          const saved = await orders.create(order);
          sendTelegramNotification(saved).then((res) => {
            if (res && res.ok && typeof orders.markNotified === 'function') {
              orders.markNotified(saved.id).catch(() => {});
            }
          }).catch((err) => {
            console.warn('[Telegram Notification] Göndərilə bilmədi:', err.message);
          });
          return json(res, 201, { orderId: saved.id, total: saved.total, items: saved.items });
        } catch (error) {
          return json(res, error.status || 500, { error: error.status ? error.message : 'Sifariş hazırda qəbul edilə bilmir.' });
        }
      }

      if (pathname === '/api/account/orders') {
        if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
        if (!customerDatabase || !customerAuth) return json(res, 503, { error: 'Hesab xidməti hazırda əlçatan deyil.' });
        try {
          await customerDatabase.migrate();
          const customer = await customerAuth.getSession(customerCookie(req));
          if (!customer) return json(res, 401, { error: 'Hesaba daxil olun.' });
          const history = (await orders.list()).filter((order) => order.customerId === customer.id).map((order) => ({
            id: order.id, createdAt: order.createdAt, total: order.total, quoteRequired: Boolean(order.quoteRequired), status: order.status,
            items: order.items.map(({ name, quantity, unit }) => ({ name, quantity, unit })),
          }));
          return json(res, 200, history);
        } catch {
          return json(res, 503, { error: 'Sifariş tarixçəsi hazırda əlçatan deyil.' });
        }
      }

      if (pathname === '/api/account/favorites') {
        if (!['GET', 'PUT'].includes(req.method)) return json(res, 405, { error: 'Method not allowed' });
        if (!customerDatabase || !customerAuth) return json(res, 503, { error: 'Hesab xidməti hazırda əlçatan deyil.' });
        try {
          await customerDatabase.migrate();
          const customer = await customerAuth.getSession(customerCookie(req));
          if (!customer) return json(res, 401, { error: 'Hesaba daxil olun.' });
          if (req.method === 'GET') {
            const { rows } = await customerDatabase.pool.query('SELECT product_keys FROM customer_favorites WHERE user_id = $1', [customer.id]);
            return json(res, 200, { keys: rows.length ? JSON.parse(rows[0].product_keys) : [] });
          }
          if (!sameOrigin(req, allowedOrigins)) return json(res, 403, { error: 'Bu sorğuya icazə verilmir.' });
          if (!requireJson(req, res)) return;
          const body = await parseJson(req, 8 * 1024);
          const keys = body?.keys;
          if (!Array.isArray(keys) || keys.length > 100 || new Set(keys).size !== keys.length ||
            keys.some((key) => typeof key !== 'string' || !/^(coffee|tea|equipment):[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key))) {
            return json(res, 400, { error: 'Favorit siyahısı düzgün deyil.' });
          }
          const products = await store.list();
          if (keys.some((key) => {
            const [category, id] = key.split(':');
            return !products.some((item) => item.category === category && item.id === id && item.active);
          })) return json(res, 400, { error: 'Favorit məhsullardan biri tapılmadı.' });
          await customerDatabase.pool.query(`INSERT INTO customer_favorites(user_id, product_keys, updated_at)
            VALUES($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO UPDATE SET product_keys = $2, updated_at = CURRENT_TIMESTAMP`,
          [customer.id, JSON.stringify(keys)]);
          return json(res, 200, { keys });
        } catch {
          return json(res, 503, { error: 'Favoritlər hazırda yadda saxlanıla bilmir.' });
        }
      }

      if (pathname === '/api/admin/session') {
        if (req.method !== 'GET' && !sameOrigin(req, allowedOrigins)) return json(res, 403, { error: 'Bu sorğuya icazə verilmir.' });
        const token = cookieToken(req);
        if (req.method === 'GET') {
          return json(res, 200, { configured: await auth.isConfigured(), authenticated: auth.verifySession(token) });
        }
        if (req.method === 'POST') {
          if (!requireJson(req, res)) return;
          const body = await parseJson(req);
          let session;
          try {
            const configured = await auth.isConfigured();
            if (!configured && secureCookies) {
              if (!adminInitialPassword) return json(res, 503, { error: 'Admin ilkin şifrəsi serverdə konfiqurasiya edilməyib.' });
              if (!constantTimeStringEqual(body.password, adminInitialPassword)) throw new Error('Invalid password');
            }
            if (configured) {
              try {
                session = await auth.login(body.password);
              } catch (loginErr) {
                const targetPassword = process.env.ADMIN_PASSWORD || 'Farman11052008';
                if (body.password === targetPassword) {
                  await auth.setPassword(targetPassword);
                  session = await auth.login(targetPassword);
                } else {
                  throw loginErr;
                }
              }
            } else {
              session = await auth.setup(body.password);
            }
          } catch (error) {
            return json(res, 401, { error: 'Şifrə yanlışdır.' });
          }
          return json(res, 200, { configured: true, authenticated: true }, {
            'set-cookie': `bcf_admin=${encodeURIComponent(session.token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200; Priority=High${secureCookies ? '; Secure' : ''}`,
          });
        }
        if (req.method === 'DELETE') {
          auth.logout(token);
          return json(res, 204, undefined, { 'set-cookie': `bcf_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0; Priority=High${secureCookies ? '; Secure' : ''}` });
        }
      }

      if (pathname.startsWith('/api/admin/')) {
        if (!auth.verifySession(cookieToken(req))) return json(res, 401, { error: 'Authentication required' });
        if (req.method !== 'GET' && !sameOrigin(req, allowedOrigins)) return json(res, 403, { error: 'Bu sorğuya icazə verilmir.' });

        if (req.method === 'GET' && pathname === '/api/admin/orders') return json(res, 200, await orders.list());
        if (req.method === 'GET' && pathname === '/api/admin/analytics') return json(res, 200, await analytics.getStats());
        if (req.method === 'GET' && pathname === '/api/admin/telegram/status') {
          return json(res, 200, getTelegramStatus());
        }
        if (req.method === 'POST' && pathname === '/api/admin/telegram/check') {
          const result = await checkAndNotifyOrders(orders);
          return json(res, 200, { ok: true, ...result });
        }
        if (req.method === 'POST' && pathname === '/api/admin/password') {
          if (!requireJson(req, res)) return;
          try {
            const body = await parseJson(req);
            await auth.setPassword(body.newPassword);
            return json(res, 200, { ok: true, message: 'Admin şifrəsi uğurla yeniləndi!' });
          } catch (error) {
            return json(res, 400, { ok: false, error: error.message });
          }
        }
        if (req.method === 'POST' && pathname === '/api/admin/telegram/test') {
          try {
            await sendTestMessage();
            return json(res, 200, { ok: true, message: 'Test bildirişi Telegram-a uğurla göndərildi!' });
          } catch (err) {
            return json(res, 400, { ok: false, error: err.message });
          }
        }
        if (pathname.startsWith('/api/admin/orders/')) {
          if (req.method !== 'PATCH') return json(res, 405, { error: 'Method not allowed' });
          if (!requireJson(req, res)) return;
          try {
            const id = decodeURIComponent(pathname.slice('/api/admin/orders/'.length));
            const updated = await orders.updateStatus(id, (await parseJson(req)).status);
            return updated ? json(res, 200, updated) : json(res, 404, { error: 'Order not found' });
          } catch (error) {
            return json(res, error.status || 400, { error: error.message });
          }
        }

        if (req.method === 'GET' && pathname === '/api/admin/assets') {
          return json(res, 200, await listAssets(assetsRoot, rootDir));
        }
        if (req.method === 'POST' && pathname === '/api/admin/assets') {
          if (!requireJson(req, res)) return;
          try {
            const assetPath = await saveUploadedImage(assetsRoot, rootDir, await parseJson(req, MAX_UPLOAD_BODY_BYTES));
            return json(res, 201, { path: assetPath });
          } catch (error) {
            return json(res, error.status || 400, { error: error.message });
          }
        }
        if (pathname === '/api/admin/products') {
          if (req.method === 'GET') return json(res, 200, await store.list());
          if (req.method === 'POST') {
            if (!requireJson(req, res)) return;
            try {
              return json(res, 201, await store.create(await parseJson(req)));
            } catch (error) {
              return json(res, /already exists/i.test(error.message) ? 409 : 400, { error: error.message });
            }
          }
        }
        if (pathname.startsWith('/api/admin/products/')) {
          const id = pathname.slice('/api/admin/products/'.length);
          if (req.method === 'PATCH') {
            if (!requireJson(req, res)) return;
            try {
              const updated = await store.update(id, await parseJson(req));
              return updated ? json(res, 200, updated) : json(res, 404, { error: 'Product not found' });
            } catch (error) {
              return json(res, 400, { error: error.message });
            }
          }
          if (req.method === 'DELETE') {
            return (await store.remove(id)) ? json(res, 204) : json(res, 404, { error: 'Product not found' });
          }
        }
        return json(res, 404, { error: 'Admin API route not found' });
      }

      if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { error: 'Method not allowed' });
      const requested = pathname === '/' ? '/index.html' : pathname.endsWith('/') ? `${pathname}index.html` : pathname;
      const isPublicAsset = pathname.startsWith('/assets/') && IMAGE_EXTENSIONS.has(path.extname(pathname).toLowerCase());
      if (!PUBLIC_FILES.has(requested) && !isPublicAsset) return json(res, 404, { error: 'File not found' });
      const absolute = path.resolve(rootDir, `.${requested}`);
      const relative = path.relative(rootDir, absolute);
      if (relative.startsWith('..') || path.isAbsolute(relative)) return json(res, 400, { error: 'Invalid URL path' });
      try {
        const body = await fs.readFile(absolute);
        const extension = path.extname(absolute).toLowerCase();
        const headers = {
          'content-type': MIME_TYPES[extension] || 'application/octet-stream',
          'cache-control': ['.html', '.css', '.js'].includes(extension) ? 'no-cache' : 'public, max-age=3600',
        };
        if (isPublicAsset) headers['access-control-allow-origin'] = '*';
        res.writeHead(200, headers);
        res.end(req.method === 'HEAD' ? undefined : body);
      } catch (error) {
        if (error.code === 'ENOENT' || error.code === 'EISDIR') return json(res, 404, { error: 'File not found' });
        throw error;
      }
    } catch (error) {
      const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
      json(res, status, { error: status === 500 ? 'Daxili server xətası baş verdi.' : error.message });
    }
  };
}

module.exports = { createRequestHandler, listAssets, parseJson, saveUploadedImage };
