'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  applySecurityHeaders,
  createRateLimiter,
  isJsonRequest,
  isTrustedOrigin,
} = require('../../server/security');
const { renderUnifiedCartItemsHtml } = require('../../cart-utils');
const { safeImage, safeProductUrl } = require('../../favorites');

test('security headers prevent framing, MIME sniffing, and unsafe default script execution', () => {
  const headers = {};
  const response = { setHeader(name, value) { headers[name.toLowerCase()] = value; } };
  applySecurityHeaders(response, { secure: true });

  assert.equal(headers['x-frame-options'], 'DENY');
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.match(headers['content-security-policy'], /default-src 'self'/);
  assert.match(headers['content-security-policy'], /object-src 'none'/);
  assert.match(headers['content-security-policy'], /frame-ancestors 'none'/);
  assert.match(headers['strict-transport-security'], /max-age=31536000/);
});

test('trusted origin validation supports configured production origins and rejects foreign origins', () => {
  const request = { headers: { origin: 'https://shop.example', host: 'internal:8017' } };
  assert.equal(isTrustedOrigin(request, ['https://shop.example']), true);
  assert.equal(isTrustedOrigin(request, ['https://other.example']), false);
  assert.equal(isTrustedOrigin({ headers: { host: 'shop.example', origin: 'https://shop.example' } }), true);
  assert.equal(isTrustedOrigin({ headers: { host: 'shop.example', origin: 'https://evil.example' } }), false);
  assert.equal(isTrustedOrigin({ headers: { host: 'shop.example' } }), true);
});

test('rate limiter blocks attempts within a bounded window without growing forever', () => {
  let now = 1_000;
  const limiter = createRateLimiter({ limit: 2, windowMs: 1_000, now: () => now });
  assert.equal(limiter.consume('client').allowed, true);
  assert.equal(limiter.consume('client').allowed, true);
  const blocked = limiter.consume('client');
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfter, 1);
  now += 1_001;
  assert.equal(limiter.consume('client').allowed, true);
});

test('JSON content type validation is strict but permits a charset', () => {
  assert.equal(isJsonRequest({ headers: { 'content-type': 'application/json' } }), true);
  assert.equal(isJsonRequest({ headers: { 'content-type': 'application/json; charset=utf-8' } }), true);
  assert.equal(isJsonRequest({ headers: { 'content-type': 'text/plain' } }), false);
});

test('cart renderer escapes localStorage-controlled text, attributes, and image paths', () => {
  const html = renderUnifiedCartItemsHtml({
    'evil\" onclick=\"alert(1)': {
      id: 'evil\" onclick=\"alert(1)',
      name: '<img src=x onerror=alert(1)>',
      image: 'javascript:alert(1)',
      price: 1,
      quantity: 1,
      unit: 'piece',
      category: 'equipment',
    },
  });
  assert.doesNotMatch(html, /<img src=x|src="javascript:|data-item-id="evil" onclick=/i);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /data-item-id="evil&quot;/);
});

test('favorite links and images cannot inject attributes or leave the storefront', () => {
  assert.equal(safeProductUrl('mehsul.html?id=wood-grinder&variant=wood'), 'mehsul.html?id=wood-grinder&variant=wood');
  assert.equal(safeProductUrl('mehsul.html?id=x%22%20onclick%3Dalert(1)'), 'mehsul.html');
  assert.equal(safeProductUrl('https://evil.example/mehsul.html?id=x'), '#');
  assert.equal(safeImage('assets/equipment/grinder.webp'), 'assets/equipment/grinder.webp');
  assert.equal(safeImage('https://evil.example/x.jpg" onerror="alert(1)'), 'assets/coffee/cart-coffee-beans.png');
  assert.equal(safeImage('assets/../.env.png'), 'assets/coffee/cart-coffee-beans.png');
});
