'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('checkout integration formats WhatsApp link to 994703901009 (0703901009) and removes old number', () => {
  const checkoutJs = read('checkout.js');
  const i18nJs = read('i18n.js');
  assert.match(checkoutJs, /WHATSAPP_TARGET_NUMBER\s*=\s*['"]994703901009['"]/);
  assert.match(checkoutJs, /https:\/\/wa\.me\/\$\{WHATSAPP_TARGET_NUMBER\}\?text=/);
  assert.match(checkoutJs, /checkoutWhatsAppBtn/);
  assert.match(checkoutJs, /WhatsApp ilə göndər/);
  assert.match(checkoutJs, /\+994 70 390 10 09/);
  assert.doesNotMatch(checkoutJs, /994556452204|55 645 22 04/);
  assert.doesNotMatch(i18nJs, /994556452204|55 645 22 04/);
  assert.match(i18nJs, /checkoutDestinationNote: '✓ Sifariş admin panelə, Telegram-a və WhatsApp-a \(\+994 70 390 10 09\) göndərilir'/);
  assert.match(checkoutJs, /bcf:orders-changed/);
});

test('Telegram order notification remains unchanged', () => {
  const notifier = read('server/telegram-notifier.js');
  const routes = read('server/routes.js');
  assert.match(notifier, /DEFAULT_BOT_TOKEN/);
  assert.match(notifier, /DEFAULT_CHAT_IDS/);
  assert.match(routes, /sendTelegramNotification\(saved\)/);
});

test('checkout CSS includes styling for WhatsApp button and destination notice', () => {
  const checkoutCss = read('checkout.css');
  assert.match(checkoutCss, /\.checkout-wa-btn/);
  assert.match(checkoutCss, /#25d366/);
  assert.match(checkoutCss, /\.checkout-destination-note/);
  assert.match(checkoutCss, /\.checkout-phone-field\[hidden\]/);
  assert.match(checkoutCss, /\.checkout-phone-hint/);
});

test('checkout JS reveals phone field for accounts missing phone and saves it via /api/auth/phone', () => {
  const checkoutJs = read('checkout.js');
  assert.doesNotMatch(checkoutJs, /checkout-phone-field"[^>]*style="display:none;"/);
  assert.match(checkoutJs, /phoneField\.hidden\s*=\s*Boolean\(currentUser\?\.phone\)/);
  assert.match(checkoutJs, /fetch\('\/api\/auth\/phone'/);
  assert.match(checkoutJs, /data-i18n="checkoutPhoneHint"/);
});
