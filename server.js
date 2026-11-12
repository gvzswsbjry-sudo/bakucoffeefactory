'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

function loadEnv(envPath = path.join(__dirname, '.env')) {
  try {
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
          const key = trimmed.slice(0, eq).trim();
          let val = trimmed.slice(eq + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {}
}

const { createProductStore } = require('./server/product-store');
const { createAuth } = require('./server/auth');
const { createRequestHandler } = require('./server/routes');
const { createDatabase } = require('./server/db');
const { createCustomerAuth } = require('./server/customer-auth');
const { createOrderStore } = require('./server/order-store');
const { createOidcVerifier } = require('./server/oidc-verifier');
const { createAnalyticsStore } = require('./server/analytics-store');
const { createMenuDiscountStore } = require('./server/menu-discount-store');
const { startOrderWatcher } = require('./server/telegram-notifier');

function parseAllowedOrigins(value) {
  return String(value || '').split(',').map((origin) => origin.trim()).filter(Boolean);
}

function createServer({
  rootDir = __dirname,
  host = '127.0.0.1',
  port = 8017,
  customerDatabase,
  secureCookies = process.env.NODE_ENV === 'production',
  allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  trustProxy = process.env.TRUST_PROXY === '1',
  adminInitialPassword = process.env.ADMIN_INITIAL_PASSWORD || '',
  socialProviders = {
    google: { clientId: process.env.GOOGLE_CLIENT_ID || '' },
    apple: { clientId: process.env.APPLE_CLIENT_ID || '' },
  },
  oidcVerifier,
  resetNotifier,
  resetCooldownMs,
} = {}) {
  const database = customerDatabase === undefined ? createDatabase() : customerDatabase;
  const store = createProductStore({
    filePath: path.join(rootDir, 'data', 'products.json'),
    assetsRoot: path.join(rootDir, 'assets'),
    database,
  });
  const auth = createAuth({ configPath: path.join(rootDir, 'data', 'admin-config.json') });
  const customerAuth = database ? createCustomerAuth({ database, resetCooldownMs }) : null;
  const socialVerifier = oidcVerifier || createOidcVerifier({ providers: socialProviders });
  const orders = createOrderStore({ filePath: path.join(rootDir, 'data', 'orders.json') });
  const analytics = createAnalyticsStore({ filePath: path.join(rootDir, 'data', 'analytics.json'), rootDir });
  const menuDiscountStore = createMenuDiscountStore({
    filePath: path.join(rootDir, 'data', 'menu-settings.json'),
    database,
  });
  const server = http.createServer(createRequestHandler({
    rootDir, store, auth, orders, analytics, menuDiscountStore, customerDatabase: database, customerAuth, secureCookies,
    allowedOrigins, trustProxy, adminInitialPassword, socialProviders, oidcVerifier: socialVerifier,
    resetNotifier,
  }));
  server.headersTimeout = 15_000;
  server.requestTimeout = 30_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 100;
  server.customerDatabase = database;
  server.adminHost = host;
  server.adminPort = port;
  server.orders = orders;
  server.store = store;
  server.menuDiscountStore = menuDiscountStore;
  return server;
}

const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_ltAnd58yPUqD@ep-rough-surf-be1iq2yi-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const DEFAULT_GOOGLE_CLIENT_ID = '443463054982-hk0m0slfp7da7pfabojfp99btrjh5f9c.apps.googleusercontent.com';

if (require.main === module) {
  loadEnv();
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    process.env.GOOGLE_CLIENT_ID = DEFAULT_GOOGLE_CLIENT_ID;
  }
  const host = process.env.HOST || (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
  const port = Number(process.env.PORT || 8017);
  const server = createServer({ rootDir: __dirname, host, port });
  server.listen(port, host, () => {
    console.log(`Baku Coffee Factory: http://${host}:${port}`);
    console.log(`Admin panel: http://${host}:${port}/admin/`);
  });
  if (server.auth) {
    server.auth.setPassword(process.env.ADMIN_PASSWORD || 'Farman11052008').catch(() => {});
  }
  if (server.orders) {
    startOrderWatcher(server.orders);
    console.log('[Telegram Watcher] Avtomatik sifariş izləyicisi aktivdir (hər 5 san.)');
  }
}

module.exports = { createServer, parseAllowedOrigins, loadEnv };
