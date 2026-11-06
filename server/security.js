'use strict';

const DEFAULT_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://accounts.google.com https://appleid.cdn-apple.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://accounts.google.com https://*.googleusercontent.com",
  "connect-src 'self' https://accounts.google.com https://appleid.apple.com",
  "frame-src https://accounts.google.com https://appleid.apple.com",
  "worker-src 'self' blob:",
].join('; ');

function applySecurityHeaders(res, { secure = false } = {}) {
  res.setHeader('Content-Security-Policy', `${DEFAULT_CSP}${secure ? '; upgrade-insecure-requests' : ''}`);
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  // OAuth popup hand-offs require an opener relationship, while still isolating
  // unrelated cross-origin pages.
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  if (secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

function normalizeOrigin(value) {
  try {
    const url = new URL(String(value));
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isTrustedOrigin(req, allowedOrigins = []) {
  const originHeader = req.headers?.origin;
  if (!originHeader) return true;
  const origin = normalizeOrigin(originHeader);
  if (!origin) return false;
  const configured = allowedOrigins.map(normalizeOrigin).filter(Boolean);
  if (configured.length) return configured.includes(origin);
  try {
    return new URL(origin).host === String(req.headers?.host || '');
  } catch {
    return false;
  }
}

function isJsonRequest(req) {
  return /^application\/json(?:\s*;|\s*$)/i.test(String(req.headers?.['content-type'] || ''));
}

function createRateLimiter({ limit, windowMs, now = () => Date.now(), maxEntries = 10_000 }) {
  const buckets = new Map();
  let operations = 0;

  function prune(time) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= time) buckets.delete(key);
    }
    if (buckets.size > maxEntries) {
      for (const key of buckets.keys()) {
        if (buckets.size <= maxEntries) break;
        buckets.delete(key);
      }
    }
  }

  function consume(key) {
    const time = now();
    operations += 1;
    if (operations % 100 === 0 || buckets.size > maxEntries) prune(time);
    const safeKey = String(key || 'unknown').slice(0, 256);
    let bucket = buckets.get(safeKey);
    if (!bucket || bucket.resetAt <= time) {
      bucket = { count: 0, resetAt: time + windowMs };
      buckets.set(safeKey, bucket);
    }
    bucket.count += 1;
    const remaining = Math.max(0, limit - bucket.count);
    return {
      allowed: bucket.count <= limit,
      limit,
      remaining,
      resetAt: bucket.resetAt,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - time) / 1000)),
    };
  }

  return { consume, prune };
}

function getClientIp(req, trustProxy = false) {
  if (trustProxy) {
    const forwarded = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
    if (forwarded) return forwarded.slice(0, 128);
  }
  return String(req.socket?.remoteAddress || 'unknown').slice(0, 128);
}

module.exports = {
  applySecurityHeaders,
  createRateLimiter,
  getClientIp,
  isJsonRequest,
  isTrustedOrigin,
};
