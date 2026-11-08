'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:vm');
const fsPromises = require('node:fs/promises');

test('i18n module provides az, en, and ar with matching dictionaries', () => {
  const content = fs.readFileSync('i18n.js', 'utf8');
  assert.ok(content.includes("az: {"), 'contains az dictionary');
  assert.ok(content.includes("en: {"), 'contains en dictionary');
  assert.ok(content.includes("ar: {"), 'contains ar dictionary');
  assert.ok(content.includes("dir: 'rtl'"), 'Arabic is configured as RTL');
});

test('server routes whitelist /i18n.css and /i18n.js in PUBLIC_FILES', () => {
  const routesContent = fs.readFileSync('server/routes.js', 'utf8');
  assert.ok(routesContent.includes("'/i18n.css'"), 'routes.js whitelists /i18n.css');
  assert.ok(routesContent.includes("'/i18n.js'"), 'routes.js whitelists /i18n.js');
});

test('all storefront HTML files include i18n resources', () => {
  const files = ['index.html', 'qehveler.html', 'caylar.html', 'avadanliqlar.html', 'mehsul.html', 'menyu.html', 'mexfilik.html'];
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    assert.ok(html.includes('i18n.css'), `${file} must include i18n.css`);
    assert.ok(html.includes('i18n.js'), `${file} must include i18n.js`);
  }
});

test('script.js ensures i18n is dynamically loaded if absent', () => {
  const script = fs.readFileSync('script.js', 'utf8');
  assert.ok(script.includes('i18n.css'), 'script.js links i18n.css');
  assert.ok(script.includes('i18n.js'), 'script.js links i18n.js');
});
