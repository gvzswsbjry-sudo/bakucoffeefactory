'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('checkout integration formats WhatsApp link to 994556452204 (0556452204)', () => {
  const checkoutJs = read('checkout.js');
  assert.match(checkoutJs, /WHATSAPP_TARGET_NUMBER\s*=\s*['"]994556452204['"]/);
  assert.match(checkoutJs, /https:\/\/wa\.me\/\$\{WHATSAPP_TARGET_NUMBER\}\?text=/);
  assert.match(checkoutJs, /checkoutWhatsAppBtn/);
  assert.match(checkoutJs, /WhatsApp ilə göndər/);
  assert.match(checkoutJs, /55 645 22 04/);
  assert.match(checkoutJs, /bcf:orders-changed/);
});

test('checkout CSS includes styling for WhatsApp button and destination notice', () => {
  const checkoutCss = read('checkout.css');
  assert.match(checkoutCss, /\.checkout-wa-btn/);
  assert.match(checkoutCss, /#25d366/);
  assert.match(checkoutCss, /\.checkout-destination-note/);
});
