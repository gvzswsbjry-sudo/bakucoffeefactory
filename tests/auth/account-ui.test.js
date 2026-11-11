const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '../..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('the shared storefront script loads the accessible account interface without changing the cart', () => {
  const shared = read('script.js');
  const account = read('account.js');
  const css = read('account.css');
  assert.match(shared, /account\.js/);
  assert.match(shared, /account\.css/);
  assert.match(account, /role="dialog"/);
  assert.match(account, /type="tel"/);
  assert.match(account, /type="password"/);
  assert.match(account, /mexfilik\.html/);
  assert.match(account, /privacyAccepted/);
  assert.match(css, /\.account-consent input\[type="checkbox"\]/);
  assert.match(css, /appearance:\s*checkbox/);
  assert.match(account, /api\/auth\/me/);
  assert.match(account, /api\/auth\/logout/);
  assert.match(account, /class="account-code-value"[^>]*>\+994</);
  assert.match(account, /class="account-code-arrows"/);
  assert.match(account, /placeholder="123456789"/);
  assert.match(account, /\['\+994', 'Azərbaycan'\]/);
  assert.match(account, /data-contact="phone"/);
  assert.match(account, /data-contact="email"/);
  assert.match(account, /name="email"[^>]*type="email"/);
  assert.match(account, /data-provider="google"/);
  assert.doesNotMatch(account, /data-provider="apple"/);
  assert.match(account, /api\/auth\/providers/);
  assert.match(account, /id="accountSocialMessage"/);
  assert.match(account, /accounts\.google\.com\/gsi\/client/);
  assert.doesNotMatch(account, /appleid\.cdn-apple\.com\/appleauth/);
  assert.match(account, /idToken/);
  assert.doesNotMatch(account, /bcf_customer_user|istifadeci@icloud\.com|activeSocialProvider/);
  assert.doesNotMatch(account, /setItem\([^)]*password|sessionStorage/);

  const socialIndex = account.indexOf('<div class="account-social');
  const formIndex = account.indexOf('<form id="accountForm"');
  assert.ok(socialIndex > 0 && formIndex > socialIndex, 'Google sign-in section must render above accountForm so it stays visible in registration mode');

  assert.match(account, /id="accountForgotTrigger"/);
  assert.match(account, /class="account-reset-view"/);
  assert.match(account, /id="resetRequestForm"/);
  assert.match(account, /id="resetConfirmForm"/);
  assert.match(account, /api\/auth\/|request\('forgot-password'/);
  assert.match(account, /request\('reset-password'/);
  assert.doesNotMatch(account, /account-email-contact"[^>]*style="display:none;"/);
  assert.match(css, /\.account-reset-view\[hidden\]/);
  assert.match(css, /\.account-forgot-row\[hidden\]/);

  assert.match(account, /id="accountLogoutConfirmOverlay"/);
  assert.match(account, /role="alertdialog"/);
  assert.match(account, /id="accountLogoutCancel"/);
  assert.match(account, /id="accountLogoutConfirm"/);
  assert.match(account, /openLogoutConfirm/);
  assert.match(account, /closeLogoutConfirm/);
  assert.match(css, /\.account-confirm-backdrop\[hidden\]/);
  assert.match(css, /\.account-confirm-dialog/);
  assert.match(css, /\.account-overlay\s*\{[^}]*z-index:\s*10020/);
  assert.match(css, /\.account-confirm-backdrop\s*\{[^}]*z-index:\s*10040/);

  assert.match(account, /id="socialPhoneForm"/);
  assert.match(account, /requirePhone:\s*true/);
  assert.match(account, /id="socialPhoneCancel"/);
  assert.match(account, /id="socialPhoneConfirm"/);
  assert.match(account, /id="profilePhoneForm"/);
  assert.match(account, /request\('phone'/);
  assert.match(css, /\.account-profile-phone-box\[hidden\]/);
  assert.match(css, /\.account-social-prompt\[hidden\]/);
});

test('privacy page explains the account data and contains a contact method', () => {
  const policy = read('mexfilik.html');
  assert.match(policy, /Məxfilik siyasəti/);
  assert.match(policy, /telefon nömrəsi/i);
  assert.match(policy, /e-poçt/i);
  assert.match(policy, /şifrə/i);
  assert.match(policy, /070 390 10 09/);
});
