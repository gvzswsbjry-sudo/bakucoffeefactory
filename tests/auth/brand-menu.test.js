const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '../..');
test('provided brand image is used in the storefront header', () => {
  const image = path.join(root, 'assets/brand/baku-coffee-factory-logo.jpg');
  assert.ok(fs.statSync(image).size > 1000);
  const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
  assert.match(script, /baku-coffee-factory-logo\.jpg/);
});

test('dessert tab has a dessert-appropriate heading and drink tabs restore the original', () => {
  const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
  assert.match(script, /dessertMenu[\s\S]*Şirin bir/);
  assert.match(script, /Bir fincan/);
  assert.match(script, /dataset\.menuTarget/);
});
