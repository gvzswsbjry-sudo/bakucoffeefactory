const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('Mac launcher starts the localhost-only Node admin server', () => {
  const script = read('start-admin.command');
  assert.match(script, /^#!\/bin\/zsh/);
  assert.match(script, /node server\.js/);
  assert.match(script, /127\.0\.0\.1:8017\/admin\//);
});

test('managed catalog pages load live data before their shop scripts', () => {
  for (const file of ['qehveler.html', 'caylar.html', 'avadanliqlar.html', 'mehsul.html']) {
    const html = read(file);
    const catalog = html.indexOf('api/catalog.js');
    const data = html.indexOf('equipment-data.js');
    assert.ok(catalog > -1, file);
    assert.ok(data > catalog, `${file}: catalog must load before data adapter`);
  }
});

test('README documents admin setup, local-only access, persistence, and backups', () => {
  const readme = read('README.md');
  assert.match(readme, /Admin panel/i);
  assert.match(readme, /http:\/\/127\.0\.0\.1:8017\/admin\//);
  assert.match(readme, /products\.json/);
  assert.match(readme, /products\.json\.bak/);
  assert.match(readme, /yalnız bu MacBook|yalnız lokal/i);
});
