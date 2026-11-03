'use strict';

const http = require('node:http');
const path = require('node:path');
const { createProductStore } = require('./server/product-store');
const { createAuth } = require('./server/auth');
const { createRequestHandler } = require('./server/routes');
const { createDatabase } = require('./server/db');
const { createCustomerAuth } = require('./server/customer-auth');
const { createOrderStore } = require('./server/order-store');
const { createOidcVerifier } = require('./server/oidc-verifier');
const { createAnalyticsStore } = require('./server/analytics-store');

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
} = {}) {
  const store = createProductStore({ filePath: path.join(rootDir, 'data', 'products.json'), assetsRoot: path.join(rootDir, 'assets') });
  const auth = createAuth({ configPath: path.join(rootDir, 'data', 'admin-config.json') });
  const database = customerDatabase === undefined ? createDatabase() : customerDatabase;
  const customerAuth = database ? createCustomerAuth({ database }) : null;
  const socialVerifier = oidcVerifier || createOidcVerifier({ providers: socialProviders });
  const orders = createOrderStore({ filePath: path.join(rootDir, 'data', 'orders.json') });
  const server = http.createServer(createRequestHandler({
    rootDir, store, auth, orders, customerDatabase: database, customerAuth, secureCookies,
    allowedOrigins, trustProxy, adminInitialPassword, socialProviders, oidcVerifier: socialVerifier,
  }));
  server.headersTimeout = 15_000;
  server.requestTimeout = 30_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 100;
  server.customerDatabase = database;
  server.adminHost = host;
  server.adminPort = port;
  return server;
}

if (require.main === module) {
  const host = process.env.HOST || '127.0.0.1';
  const port = Number(process.env.PORT || 8017);
  const server = createServer({ rootDir: __dirname, host, port });
  server.listen(port, host, () => {
    console.log(`Baku Coffee Factory: http://${host}:${port}`);
    console.log(`Admin panel: http://${host}:${port}/admin/`);
  });
}

module.exports = { createServer, parseAllowedOrigins };
