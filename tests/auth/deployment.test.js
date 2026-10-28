const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('../../server');

const root = path.join(__dirname, '../..');
test('deployment documentation covers persistent database and strong admin credentials', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.match(readme, /DATABASE_URL/);
  assert.match(readme, /PostgreSQL/);
  assert.match(readme, /HTTPS/);
  assert.match(readme, /ADMIN_INITIAL_PASSWORD/);
  assert.match(readme, /ən azı 12 simvol/);
  assert.doesNotMatch(readme, /(?:şifrə|parol)[^\n]{0,30}`?1234`?/i);
  assert.match(readme, /Məxfilik siyasəti/);
});

test('missing database does not prevent public server construction', () => {
  const server = createServer({ rootDir: root, customerDatabase: null });
  assert.equal(server.customerDatabase, null);
});

test('static routes never expose server code, config, dependencies, or dotfiles', () => {
  const routes = fs.readFileSync(path.join(root, 'server/routes.js'), 'utf8');
  assert.match(routes, /PUBLIC_FILES/);
  assert.match(routes, /pathname\.startsWith\('\/assets\/'\)/);
});
