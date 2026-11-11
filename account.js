(() => {
  const header = document.querySelector('.site-header');
  if (!header || document.getElementById('accountTrigger')) return;

  const tr = (key, fallback) => window.BCF_I18N?.t?.(key, fallback) ?? fallback;
  const dyn = (text) => window.BCF_I18N?.translateDynamicText?.(text) ?? text;

  const trigger = document.createElement('button');
  trigger.id = 'accountTrigger';
  trigger.className = 'account-trigger';
  trigger.type = 'button';
  trigger.dataset.i18n = 'navAccount';
  trigger.textContent = tr('navAccount', 'Hesab');
  trigger.setAttribute('aria-haspopup', 'dialog');
  header.insertBefore(trigger, header.querySelector('.tea-header-cart, .menu-toggle'));

  const overlay = document.createElement('div');
  overlay.className = 'account-overlay';
  overlay.hidden = true;
  const countryOptions = [
    ['+994', 'Azərbaycan'], ['+90', 'Türkiyə'], ['+995', 'Gürcüstan'], ['+7', 'Rusiya / Qazaxıstan'],
    ['+1', 'ABŞ / Kanada'], ['+44', 'Birləşmiş Krallıq'], ['+49', 'Almaniya'], ['+33', 'Fransa'],
    ['+39', 'İtaliya'], ['+34', 'İspaniya'], ['+971', 'BƏƏ'], ['+380', 'Ukrayna'],
    ['+91', 'Hindistan'], ['+92', 'Pakistan'], ['+98', 'İran'], ['+966', 'Səudiyyə Ərəbistanı'],
    ['+31', 'Niderland'], ['+41', 'İsveçrə'], ['+48', 'Polşa'], ['+86', 'Çin'],
  ];
  const buildCountryOptionsHtml = () => `${countryOptions.map(([code, name]) => `<option value="${code}">${dyn(`${name} (${code})`)}</option>`).join('')}<option value="other">${dyn('Digər ölkə kodu…')}</option>`;
  overlay.innerHTML = `
    <section class="account-dialog" role="dialog" aria-modal="true" aria-labelledby="accountTitle" tabindex="-1">
      <button class="account-close" type="button" aria-label="Bağla">×</button>
      <p class="account-eyebrow">BAKU COFFEE FACTORY</p>
      <h2 id="accountTitle" data-i18n="accountHeading">Hesabınız</h2>
      <div class="account-center-tabs" role="tablist" aria-label="Hesab bölmələri">
        <button type="button" class="account-center-tab active" data-center="details" data-i18n="accountDetailsTab" role="tab" aria-selected="true">Hesab məlumatları</button>
        <button type="button" class="account-center-tab" data-center="orders" data-i18n="accountOrdersTab" role="tab" aria-selected="false">Keçmiş sifarişlər</button>
      </div>
      <div class="account-center-panel active" data-center-panel="details">
       <div class="account-auth-view">
        <div class="account-tabs" role="tablist" aria-label="Hesab əməliyyatları">
          <button type="button" class="account-tab active" data-mode="login" data-i18n="tabLogin" role="tab" aria-selected="true">Giriş</button>
          <button type="button" class="account-tab" data-mode="register" data-i18n="tabRegister" role="tab" aria-selected="false">Qeydiyyat</button>
        </div>
        <div class="account-social account-social--top">
          <div id="googleButtonSlot" style="display:none;width:100%;margin-bottom:8px;justify-content:center;"></div>
          <button class="account-provider account-provider-google" type="button" data-provider="google"><span aria-hidden="true">G</span><em style="font-style:normal" data-i18n="continueWithGoogle">Google ilə davam et</em></button>
          <p class="account-social-message" id="accountSocialMessage" role="status" aria-live="polite" hidden></p>
          <p class="account-provider-note" data-i18n="googleProviderNote">Google ilə bir kliklə sürətli giriş və qeydiyyat.</p>
          <div class="account-divider"><span data-i18n="socialOr">və ya</span></div>
        </div>
        <form id="accountForm" novalidate>
          <label class="account-field account-login-only"><span data-i18n="identifierLabel">İstifadəçi adı və ya telefon nömrəsi</span>
            <input name="identifier" autocomplete="username" data-i18n-placeholder="identifierPlaceholder" placeholder="İstifadəçi adı, telefon və ya e-poçt" />
          </label>
          <label class="account-field account-register-only" hidden><span data-i18n="fullNameLabel">Ad və Soyad</span>
            <input name="fullName" autocomplete="name" data-i18n-placeholder="fullNamePlaceholder" placeholder="Ad və soyadınız" maxlength="100" />
          </label>
          <label class="account-field account-register-only" hidden><div><span data-i18n="usernameLabel">İstifadəçi adı</span> <span class="account-field-hint" data-i18n="usernameHint">(unikal olmalıdır)</span></div>
            <input name="username" autocomplete="username" minlength="3" maxlength="30" data-i18n-placeholder="usernamePlaceholder" placeholder="İstifadəçi adınız (məs: farman08)" />
          </label>
          <div class="account-contact-choice account-register-only" role="group" aria-label="Qeydiyyat üsulu" style="display:none;" hidden>
            <button type="button" class="active" data-contact="phone" data-i18n="contactPhone" aria-pressed="true">Telefon</button>
            <button type="button" data-contact="email" data-i18n="emailShortLabel" aria-pressed="false">E-poçt</button>
          </div>
          <div class="account-field account-register-only account-phone-contact" hidden>
            <span data-i18n="phoneLabel">Mobil nömrə</span>
            <div class="account-phone-row">
              <label class="account-code-picker"><span class="account-sr-only" data-i18n="countryCodeLabel">Ölkə kodu</span><span class="account-code-display" aria-hidden="true"><span class="account-code-value">+994</span><span class="account-code-arrows"><svg viewBox="0 0 12 18" width="12" height="18"><path d="m2 7 4-4 4 4M2 11l4 4 4-4" /></svg></span></span><select name="countryCode" aria-label="Ölkə və telefon kodu">${buildCountryOptionsHtml()}</select></label>
              <label><span class="account-sr-only" data-i18n="phoneNumberLabel">Telefon nömrəsi</span><input name="phoneLocal" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="123456789" /></label>
            </div>
            <input class="account-custom-code" name="customCode" type="tel" inputmode="tel" data-i18n-placeholder="customCodePlaceholder" placeholder="Ölkə kodu, məsələn +81" aria-label="Digər ölkə kodu" hidden />
          </div>
          <label class="account-field account-register-only account-email-contact" hidden><div><span data-i18n="emailLabel">E-poçt ünvanı</span> <span class="account-field-hint" data-i18n="emailResetHint">(şifrə bərpası üçün — istəyə bağlı)</span></div>
            <input name="email" type="email" inputmode="email" autocomplete="email" data-i18n-placeholder="emailPlaceholder" placeholder="ad@example.com" />
          </label>
          <label class="account-field"><span data-i18n="passwordLabel">Şifrə</span>
            <span class="account-password-wrap"><input name="password" type="password" autocomplete="current-password" minlength="12" data-i18n-placeholder="passwordPlaceholder" placeholder="Ən azı 12 simvol" /><button class="account-password-toggle" type="button" aria-label="Şifrəni göstər" aria-pressed="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span>
          </label>
          <div class="account-forgot-row account-login-only">
            <button type="button" class="account-forgot-link" id="accountForgotTrigger" data-i18n="forgotPasswordBtn">Şifrəni unutdun?</button>
          </div>
          <label class="account-consent account-register-only" hidden>
            <input name="privacyAccepted" type="checkbox" />
            <span data-i18n="privacyConsentHtml"><a href="mexfilik.html" target="_blank" rel="noopener">Məxfilik siyasətini</a> oxudum və şəxsi məlumatlarımın hesab yaratmaq üçün işlənməsinə razıyam.</span>
          </label>
          <p class="account-message" id="accountMessage" role="status" aria-live="polite"></p>
          <button class="account-submit" type="submit" data-i18n="loginSubmit">Daxil ol</button>
        </form>
        <p class="account-note" data-i18n="accountGuestNote">Hesab açmadan da sayta baxa, səbətə məhsul əlavə edə və sifariş verə bilərsiniz.</p>
        <form id="socialPhoneForm" class="account-social-prompt" hidden novalidate>
          <div class="account-social-header">
            <span class="account-social-badge" aria-hidden="true">G</span>
            <div>
              <h4 id="socialPromptTitle" data-i18n="googlePhoneTitle">Google ilə qeydiyyatı tamamlayın</h4>
              <p id="socialPromptIdentity"></p>
            </div>
          </div>
          <p class="account-social-desc" data-i18n="googlePhoneDesc">Sifariş verə bilmək və sifariş təsdiqi üçün mobil telefon nömrənizi daxil edin.</p>
          <div class="account-field">
            <span data-i18n="phoneLabel">Mobil nömrə</span>
            <div class="account-phone-row">
              <label class="account-code-picker"><span class="account-sr-only" data-i18n="countryCodeLabel">Ölkə kodu</span><span class="account-code-display" aria-hidden="true"><span class="account-code-value" id="socialCodeValue">+994</span><span class="account-code-arrows"><svg viewBox="0 0 12 18" width="12" height="18"><path d="m2 7 4-4 4 4M2 11l4 4 4-4" /></svg></span></span><select name="socialCountryCode" aria-label="Ölkə və telefon kodu">${buildCountryOptionsHtml()}</select></label>
              <label><span class="account-sr-only" data-i18n="phoneNumberLabel">Telefon nömrəsi</span><input name="socialPhoneLocal" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="123456789" /></label>
            </div>
            <input class="account-custom-code" name="socialCustomCode" type="tel" inputmode="tel" data-i18n-placeholder="customCodePlaceholder" placeholder="Ölkə kodu, məsələn +81" aria-label="Digər ölkə kodu" hidden />
          </div>
          <p class="account-message" id="socialPhoneMessage" role="status" aria-live="polite"></p>
          <div class="account-social-actions">
            <button type="button" class="account-social-cancel" id="socialPhoneCancel" data-i18n="googlePhoneCancel">Geri</button>
            <button type="submit" class="account-social-confirm" id="socialPhoneConfirm" data-i18n="googlePhoneSubmit">Nömrəni təsdiqlə və daxil ol</button>
          </div>
        </form>
        <div class="account-reset-view" hidden>
          <div class="account-reset-head">
            <button type="button" class="account-reset-back" id="resetBackToLogin" data-i18n="resetBackToLogin">← Girişə qayıt</button>
            <h3 class="account-reset-title" data-i18n="resetPasswordTitle">Şifrəni yenilə</h3>
            <p class="account-reset-note" data-i18n="resetRequestDesc">Hesabınıza bağlı istifadəçi adı, telefon nömrəsi və ya Gmail ünvanını daxil edin. E-poçtunuz varsa 6 rəqəmli kod Gmail-ə, əks halda dəstək xəttimizə (Telegram / WhatsApp) yönləndiriləcək.</p>
          </div>
          <form id="resetRequestForm" class="account-reset-form" novalidate>
            <label class="account-field">
              <span data-i18n="resetIdentifierLabel">İstifadəçi adı, telefon və ya e-poçt</span>
              <input name="resetIdentifier" autocomplete="username" data-i18n-placeholder="identifierPlaceholder" placeholder="İstifadəçi adı, telefon və ya e-poçt" />
            </label>
            <p class="account-message" id="resetRequestMessage" role="status" aria-live="polite"></p>
            <button class="account-submit" type="submit" id="resetRequestSubmit" data-i18n="resetSendCodeBtn">Təsdiq kodu göndər</button>
            <button type="button" class="account-secondary-link" id="resetHaveCodeBtn" data-i18n="resetHaveCodeBtn">Artıq bərpa kodum var</button>
          </form>
          <form id="resetConfirmForm" class="account-reset-form" novalidate hidden>
            <p class="account-reset-sent-banner" id="resetSentBanner" role="status" aria-live="polite" hidden></p>
            <label class="account-field">
              <span data-i18n="resetIdentifierLabel">İstifadəçi adı, telefon və ya e-poçt</span>
              <input name="confirmIdentifier" autocomplete="username" data-i18n-placeholder="identifierPlaceholder" placeholder="İstifadəçi adı, telefon və ya e-poçt" />
            </label>
            <label class="account-field">
              <span data-i18n="resetCodeLabel">6 rəqəmli təsdiq kodu</span>
              <input name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" data-i18n-placeholder="resetCodePlaceholder" placeholder="123456" class="account-otp-input" />
            </label>
            <label class="account-field">
              <span data-i18n="resetNewPasswordLabel">Yeni şifrə</span>
              <span class="account-password-wrap">
                <input name="newPassword" type="password" autocomplete="new-password" minlength="12" data-i18n-placeholder="passwordPlaceholder" placeholder="Ən azı 12 simvol" />
                <button class="account-password-toggle account-reset-pw-toggle" type="button" data-target="newPassword" aria-label="Şifrəni göstər" aria-pressed="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button>
              </span>
            </label>
            <label class="account-field">
              <span data-i18n="resetConfirmPasswordLabel">Yeni şifrəni təkrarla</span>
              <span class="account-password-wrap">
                <input name="confirmPassword" type="password" autocomplete="new-password" minlength="12" data-i18n-placeholder="passwordPlaceholder" placeholder="Ən azı 12 simvol" />
                <button class="account-password-toggle account-reset-pw-toggle" type="button" data-target="confirmPassword" aria-label="Şifrəni göstər" aria-pressed="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button>
              </span>
            </label>
            <p class="account-message" id="resetConfirmMessage" role="status" aria-live="polite"></p>
            <button class="account-submit" type="submit" id="resetConfirmSubmit" data-i18n="resetConfirmSubmitBtn">Şifrəni yenilə və daxil ol</button>
            <div class="account-reset-footer-actions">
              <button type="button" class="account-secondary-link" id="resetResendBtn" data-i18n="resetResendCodeBtn">Yenidən kod göndər</button>
              <a class="account-support-wa" href="https://wa.me/994703901009" target="_blank" rel="noopener" data-i18n="resetSupportWhatsApp">Kod gəlmirsə WhatsApp: 070 390 10 09</a>
            </div>
          </form>
        </div>
       </div>
       <div class="account-profile-view" hidden>
        <div class="account-profile-card">
          <span class="account-profile-avatar" aria-hidden="true"></span>
          <div><p class="account-greeting"></p><p class="account-phone"></p></div>
        </div>
        <p class="account-reset-sent-banner account-profile-saved-banner" id="profilePhoneSavedBanner" role="status" aria-live="polite" hidden data-i18n="profilePhoneSavedMsg">Telefon nömrəniz hesabınıza əlavə edildi.</p>
        <form id="profilePhoneForm" class="account-profile-phone-box" hidden novalidate>
          <p class="account-profile-phone-warn" data-i18n="profilePhoneMissingNote">Hesabınızda telefon nömrəsi qeyd olunmayıb. Sifariş vermək üçün mobil nömrənizi əlavə edin.</p>
          <div class="account-field">
            <span data-i18n="phoneLabel">Mobil nömrə</span>
            <div class="account-phone-row">
              <label class="account-code-picker"><span class="account-sr-only" data-i18n="countryCodeLabel">Ölkə kodu</span><span class="account-code-display" aria-hidden="true"><span class="account-code-value" id="profileCodeValue">+994</span><span class="account-code-arrows"><svg viewBox="0 0 12 18" width="12" height="18"><path d="m2 7 4-4 4 4M2 11l4 4 4-4" /></svg></span></span><select name="profileCountryCode" aria-label="Ölkə və telefon kodu">${buildCountryOptionsHtml()}</select></label>
              <label><span class="account-sr-only" data-i18n="phoneNumberLabel">Telefon nömrəsi</span><input name="profilePhoneLocal" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="123456789" /></label>
            </div>
            <input class="account-custom-code" name="profileCustomCode" type="tel" inputmode="tel" data-i18n-placeholder="customCodePlaceholder" placeholder="Ölkə kodu, məsələn +81" aria-label="Digər ölkə kodu" hidden />
          </div>
          <p class="account-message" id="profilePhoneMessage" role="status" aria-live="polite"></p>
          <button type="submit" class="account-submit" id="profilePhoneSubmit" data-i18n="profilePhoneSaveBtn">Nömrəni yadda saxla</button>
        </form>
        <p class="account-security-note" data-i18n="accountSecurityNote">Hesabınız bu cihazda təhlükəsiz sessiya ilə açıqdır.</p>
        <button class="account-logout" type="button" data-i18n="logoutBtn">Hesabdan çıx</button>
       </div>
      </div>
      <div class="account-center-panel" data-center-panel="orders" hidden>
        <div class="account-section-heading"><div><p class="account-eyebrow" data-i18n="ordersArchiveEyebrow">SİFARİŞ ARXİVİ</p><h3 data-i18n="accountOrdersTab">Keçmiş sifarişlər</h3></div></div>
        <div class="account-orders-list"></div>
      </div>
    </section>
    <div class="account-confirm-backdrop" id="accountLogoutConfirmOverlay" hidden>
      <div class="account-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="accountLogoutConfirmTitle" aria-describedby="accountLogoutConfirmDesc" tabindex="-1">
        <p class="account-confirm-eyebrow" data-i18n="logoutConfirmEyebrow">HESAB · TƏSDİQ</p>
        <h3 id="accountLogoutConfirmTitle" data-i18n="logoutConfirmTitle">Hesabdan çıxmaq istəyirsiniz?</h3>
        <p id="accountLogoutConfirmDesc" data-i18n="logoutConfirmDesc">Çıxış etdikdən sonra sifariş tarixçənizi görmək və hesab məlumatlarından istifadə etmək üçün yenidən daxil olmalı olacaqsınız.</p>
        <div class="account-confirm-actions">
          <button type="button" class="account-confirm-cancel" id="accountLogoutCancel" data-i18n="logoutConfirmCancel">Xeyr, qal</button>
          <button type="button" class="account-confirm-accept" id="accountLogoutConfirm" data-i18n="logoutConfirmAccept">Bəli, çıxış et</button>
        </div>
      </div>
    </div>`;
  document.body.append(overlay);

  const dialog = overlay.querySelector('.account-dialog');
  const form = overlay.querySelector('#accountForm');
  const message = overlay.querySelector('#accountMessage');
  const profile = overlay.querySelector('.account-profile-view');
  const logoutTriggerBtn = overlay.querySelector('.account-logout');
  const logoutConfirmOverlay = overlay.querySelector('#accountLogoutConfirmOverlay');
  const logoutConfirmDialog = logoutConfirmOverlay?.querySelector('.account-confirm-dialog');
  const logoutCancelBtn = overlay.querySelector('#accountLogoutCancel');
  const logoutAcceptBtn = overlay.querySelector('#accountLogoutConfirm');
  const authView = overlay.querySelector('.account-auth-view');
  const accountTabs = overlay.querySelector('.account-tabs');
  const socialSection = overlay.querySelector('.account-social');
  const guestNote = overlay.querySelector('.account-note');
  const resetView = overlay.querySelector('.account-reset-view');
  const resetRequestForm = overlay.querySelector('#resetRequestForm');
  const resetConfirmForm = overlay.querySelector('#resetConfirmForm');
  const resetRequestMessage = overlay.querySelector('#resetRequestMessage');
  const resetConfirmMessage = overlay.querySelector('#resetConfirmMessage');
  const resetSentBanner = overlay.querySelector('#resetSentBanner');
  const resetRequestSubmit = overlay.querySelector('#resetRequestSubmit');
  const resetConfirmSubmit = overlay.querySelector('#resetConfirmSubmit');
  const submit = overlay.querySelector('.account-submit');
  const countryCode = form.elements.countryCode;
  const customCode = form.elements.customCode;
  const codeValue = overlay.querySelector('.account-code-value');
  const socialPhoneForm = overlay.querySelector('#socialPhoneForm');
  const socialPromptIdentity = overlay.querySelector('#socialPromptIdentity');
  const socialCountryCode = socialPhoneForm?.elements.socialCountryCode;
  const socialCustomCode = socialPhoneForm?.elements.socialCustomCode;
  const socialCodeValue = overlay.querySelector('#socialCodeValue');
  const socialPhoneMessage = overlay.querySelector('#socialPhoneMessage');
  const socialPhoneCancel = overlay.querySelector('#socialPhoneCancel');
  const socialPhoneConfirm = overlay.querySelector('#socialPhoneConfirm');
  const profilePhoneForm = overlay.querySelector('#profilePhoneForm');
  const profilePhoneSavedBanner = overlay.querySelector('#profilePhoneSavedBanner');
  const profileCountryCode = profilePhoneForm?.elements.profileCountryCode;
  const profileCustomCode = profilePhoneForm?.elements.profileCustomCode;
  const profileCodeValue = overlay.querySelector('#profileCodeValue');
  const profilePhoneMessage = overlay.querySelector('#profilePhoneMessage');
  const profilePhoneSubmit = overlay.querySelector('#profilePhoneSubmit');
  const passwordToggle = overlay.querySelector('.account-password-toggle');
  let mode = 'login';
  let contactMode = 'phone';
  let resetMode = false;
  let resetStep = 'request';
  let pendingSocial = null;
  let user = null;
  let previousFocus = null;
  function announceAuthChange() {
    window.bcfCurrentUser = user;
    window.dispatchEvent(new CustomEvent('bcf:auth-changed', { detail: { user } }));
  }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  async function renderOrders() {
    const list = overlay.querySelector('.account-orders-list');
    if (!user) {
      list.innerHTML = `<div class="account-empty"><span aria-hidden="true">⌁</span><h3 data-i18n="accountOrdersSignInTitle">${escapeHtml(tr('accountOrdersSignInTitle', 'Hesabınıza daxil olun.'))}</h3><p data-i18n="accountOrdersSignInDesc">${escapeHtml(tr('accountOrdersSignInDesc', 'Şəxsi sifariş tarixçəniz giriş etdikdən sonra burada görünəcək.'))}</p></div>`;
      return;
    }
    const ownerId = user.id;
    list.innerHTML = `<p class="account-list-status" role="status" data-i18n="ordersLoading">${escapeHtml(tr('ordersLoading', 'Sifarişlər yüklənir…'))}</p>`;
    let orders;
    try {
      const response = await fetch('/api/account/orders', { credentials: 'same-origin' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const fallback = response.status === 503
          ? tr('authServiceUnavailable', 'Hesab xidməti serverdə hələ aktiv deyil. PostgreSQL bazası qoşulduqdan sonra sifariş tarixçəsi işləyəcək.')
          : response.status === 401
            ? tr('authReauthRequired', 'Sifarişlərinizi görmək üçün hesabınıza yenidən daxil olun.')
            : tr('authOrdersError', 'Sifariş tarixçəsini yükləmək mümkün olmadı. Yenidən cəhd edin.');
        throw new Error(result.error || fallback);
      }
      orders = result;
    } catch (error) {
      if (user?.id === ownerId) list.innerHTML = `<p class="account-list-status" role="alert">${escapeHtml(error.message)}</p>`;
      return;
    }
    if (user?.id !== ownerId) return;
    const lang = window.BCF_I18N?.getLanguage?.() || 'az';
    const dateLocale = { az: 'az-AZ', en: 'en-US', ru: 'ru-RU', ar: 'ar-EG' }[lang] || 'az-AZ';
    const gramUnit = { az: 'q', en: 'g', ru: ' г', ar: ' جم' }[lang] || 'q';
    const pendingWord = tr('pricePending', 'Qiymət təsdiqlənəcək');
    const pendingInline = dyn('qiymət təsdiqlənəcək');
    list.innerHTML = Array.isArray(orders) && orders.length ? orders.map((order) => `
      <article class="account-order-card">
        <div><span>${escapeHtml(tr('orderPrefix', 'Sifariş #'))}${escapeHtml(order.id)}</span><time datetime="${escapeHtml(order.createdAt)}">${escapeHtml(new Date(order.createdAt).toLocaleDateString(dateLocale))}</time></div>
        <strong>${escapeHtml(order.quoteRequired
          ? (Number(order.total || 0) > 0 ? `${Number(order.total).toFixed(2)} ₼ + ${pendingInline}` : pendingWord)
          : `${Number(order.total || 0).toFixed(2)} ₼`)}</strong>
        <p>${escapeHtml((Array.isArray(order.items) ? order.items : []).map((item) => `${dyn(item.name)} × ${item.quantity}${item.unit === 'g' ? gramUnit : ''}`).join(' · '))}</p>
        <small>${escapeHtml(order.status === 'new' ? tr('orderStatusReceived', 'Sifariş qeydə alınıb') : (dyn(order.status) || tr('orderStatusReceived', 'Sifariş qeydə alınıb')))}</small>
      </article>`).join('') : `<div class="account-empty"><span aria-hidden="true">⌁</span><h3 data-i18n="noOrdersYet">${escapeHtml(tr('noOrdersYet', 'Hələ sifariş yoxdur.'))}</h3><p data-i18n="noOrdersDesc">${escapeHtml(tr('noOrdersDesc', 'Hesabınıza daxil olaraq verdiyiniz sifarişlər burada görünəcək.'))}</p></div>`;
  }

  function renderCollections() {
    renderOrders();
  }

  function renderUser() {
    profile.hidden = !user;
    authView.hidden = Boolean(user);
    if (user) {
      trigger.classList.add('is-logged-in');
      trigger.removeAttribute('data-i18n');
      trigger.setAttribute('aria-label', `${tr('navAccount', 'Hesab')}: ${user.username}`);
      trigger.title = user.username;
      trigger.innerHTML = '<span class="account-user-avatar" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg></span>';
      profile.querySelector('.account-greeting').textContent = `${tr('greetingPrefix', 'Salam')}, ${user.fullName || user.username}!`;
      profile.querySelector('.account-phone').textContent = user.phone ? `${tr('phoneShortPrefix', 'Tel')}: ${user.phone}` : (user.email || '');
      if (profilePhoneForm) {
        profilePhoneForm.hidden = Boolean(user.phone);
        if (profilePhoneMessage) profilePhoneMessage.textContent = '';
      }
      if (user.phone && profilePhoneSavedBanner) {
        // Keep banner visibility managed by explicit save action
      } else if (profilePhoneSavedBanner) {
        profilePhoneSavedBanner.hidden = true;
      }
    } else {
      trigger.classList.remove('is-logged-in');
      trigger.removeAttribute('aria-label');
      trigger.removeAttribute('title');
      trigger.dataset.i18n = 'navAccount';
      trigger.textContent = tr('navAccount', 'Hesab');
      if (profilePhoneForm) profilePhoneForm.hidden = true;
      if (profilePhoneSavedBanner) profilePhoneSavedBanner.hidden = true;
    }
    if (overlay.querySelector('[data-center="orders"]').classList.contains('active')) renderOrders();
  }

  function setMode(nextMode) {
    mode = nextMode;
    message.textContent = '';
    overlay.querySelectorAll('.account-tab').forEach((tab) => {
      const active = tab.dataset.mode === mode;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    overlay.querySelectorAll('.account-login-only').forEach((field) => { field.hidden = mode !== 'login'; });
    overlay.querySelectorAll('.account-register-only').forEach((field) => { field.hidden = mode !== 'register'; });
    form.elements.password.autocomplete = mode === 'register' ? 'new-password' : 'current-password';
    form.elements.password.type = 'password';
    passwordToggle.setAttribute('aria-pressed', 'false');
    passwordToggle.setAttribute('aria-label', tr('authShowPassword', 'Şifrəni göstər'));
    submit.dataset.i18n = mode === 'register' ? 'registerSubmit' : 'loginSubmit';
    submit.textContent = mode === 'register' ? tr('registerSubmit', 'Hesab yarat') : tr('loginSubmit', 'Daxil ol');
    setContactMode(contactMode);
  }

  function setResetStep(nextStep) {
    resetStep = nextStep === 'confirm' ? 'confirm' : 'request';
    resetRequestForm.hidden = resetStep !== 'request';
    resetConfirmForm.hidden = resetStep !== 'confirm';
    resetRequestMessage.textContent = '';
    resetConfirmMessage.textContent = '';
    if (resetStep === 'request') resetSentBanner.hidden = true;
    overlay.querySelectorAll('.account-reset-pw-toggle').forEach((btn) => {
      const target = resetConfirmForm.elements[btn.dataset.target];
      if (target) target.type = 'password';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', tr('authShowPassword', 'Şifrəni göstər'));
    });
    window.BCF_I18N?.translateDom?.(overlay);
  }

  function setCenterTab(targetCenter) {
    const next = targetCenter === 'orders' ? 'orders' : 'details';
    overlay.querySelectorAll('.account-center-tab').forEach((item) => {
      const selected = item.dataset.center === next;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    overlay.querySelectorAll('.account-center-panel').forEach((panel) => {
      const selected = panel.dataset.centerPanel === next;
      panel.hidden = !selected;
      panel.classList.toggle('active', selected);
    });
  }

  function setSocialPhoneMode(active, profileInfo = null) {
    const show = Boolean(active);
    if (!show) {
      pendingSocial = null;
      if (socialPhoneForm) socialPhoneForm.hidden = true;
      if (socialPhoneMessage) socialPhoneMessage.textContent = '';
      if (!resetMode) {
        accountTabs.hidden = false;
        socialSection.hidden = false;
        form.hidden = false;
        guestNote.hidden = false;
      }
      return;
    }
    resetMode = false;
    resetView.hidden = true;
    accountTabs.hidden = true;
    socialSection.hidden = true;
    form.hidden = true;
    guestNote.hidden = true;
    if (socialPhoneForm) socialPhoneForm.hidden = false;
    if (socialPhoneMessage) socialPhoneMessage.textContent = '';
    socialStatus('');
    if (socialPromptIdentity) {
      socialPromptIdentity.textContent = [profileInfo?.fullName, profileInfo?.email].filter(Boolean).join(' · ');
    }
    setCenterTab('details');
    if (overlay.hidden) {
      previousFocus = previousFocus || document.activeElement;
      overlay.hidden = false;
      document.body.classList.add('account-open');
      document.documentElement.classList.add('account-open');
    }
    updateCountryCode();
    window.BCF_I18N?.translateDom?.(socialPhoneForm || overlay);
    socialPhoneForm?.elements.socialPhoneLocal?.focus();
  }

  function setResetMode(active, nextStep = 'request') {
    resetMode = Boolean(active);
    if (resetMode) {
      pendingSocial = null;
      if (socialPhoneForm) socialPhoneForm.hidden = true;
    }
    accountTabs.hidden = resetMode;
    socialSection.hidden = resetMode;
    form.hidden = resetMode;
    guestNote.hidden = resetMode;
    resetView.hidden = !resetMode;
    message.textContent = '';
    if (resetMode) {
      setResetStep(nextStep);
    } else {
      resetRequestMessage.textContent = '';
      resetConfirmMessage.textContent = '';
      resetSentBanner.hidden = true;
      window.BCF_I18N?.translateDom?.(overlay);
    }
  }

  function setContactMode(nextMode) {
    contactMode = nextMode === 'email' ? 'email' : 'phone';
    overlay.querySelectorAll('[data-contact]').forEach((button) => {
      const active = button.dataset.contact === contactMode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const registering = mode === 'register';
    overlay.querySelector('.account-phone-contact').hidden = !registering;
    overlay.querySelector('.account-email-contact').hidden = !registering;
  }

  let isLoggingOut = false;

  function openLogoutConfirm() {
    if (!logoutConfirmOverlay || !user) return;
    if (logoutCancelBtn) logoutCancelBtn.disabled = false;
    if (logoutAcceptBtn) logoutAcceptBtn.disabled = false;
    logoutConfirmOverlay.hidden = false;
    window.BCF_I18N?.translateDom?.(logoutConfirmOverlay);
    (logoutCancelBtn || logoutConfirmDialog)?.focus();
  }

  function closeLogoutConfirm(restoreFocus = true) {
    if (!logoutConfirmOverlay) return;
    logoutConfirmOverlay.hidden = true;
    if (logoutCancelBtn) logoutCancelBtn.disabled = false;
    if (logoutAcceptBtn) logoutAcceptBtn.disabled = false;
    if (restoreFocus && !overlay.hidden && !profile.hidden) {
      logoutTriggerBtn?.focus();
    }
  }

  async function performLogout() {
    if (isLoggingOut) return;
    isLoggingOut = true;
    if (logoutCancelBtn) logoutCancelBtn.disabled = true;
    if (logoutAcceptBtn) logoutAcceptBtn.disabled = true;
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    } catch {} finally {
      isLoggingOut = false;
      user = null;
      announceAuthChange();
      renderUser();
      closeLogoutConfirm(false);
      close();
    }
  }

  function close() {
    closeLogoutConfirm(false);
    setSocialPhoneMode(false);
    overlay.hidden = true;
    document.body.classList.remove('account-open');
    document.documentElement.classList.remove('account-open');
    previousFocus?.focus();
  }

  trigger.addEventListener('click', () => {
    previousFocus = document.activeElement;
    closeLogoutConfirm(false);
    setSocialPhoneMode(false);
    if (profilePhoneSavedBanner) profilePhoneSavedBanner.hidden = true;
    overlay.hidden = false;
    document.body.classList.add('account-open');
    document.documentElement.classList.add('account-open');
    message.textContent = '';
    if (!user && resetMode) setResetMode(false);
    if (overlay.querySelector('[data-center="orders"]')?.classList.contains('active')) renderOrders();
    window.BCF_I18N?.translateDom?.(overlay);
    dialog.focus();
  });
  overlay.querySelector('.account-close').addEventListener('click', close);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  overlay.addEventListener('keydown', (event) => {
    if (logoutConfirmOverlay && !logoutConfirmOverlay.hidden) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeLogoutConfirm(true);
        return;
      }
      if (event.key === 'Tab') {
        const confirmFocusables = [logoutCancelBtn, logoutAcceptBtn].filter((el) => el && !el.disabled);
        if (confirmFocusables.length) {
          const firstConfirm = confirmFocusables[0];
          const lastConfirm = confirmFocusables.at(-1);
          if (!logoutConfirmDialog?.contains(document.activeElement)) {
            event.preventDefault();
            firstConfirm.focus();
          } else if (event.shiftKey && document.activeElement === firstConfirm) {
            event.preventDefault();
            lastConfirm.focus();
          } else if (!event.shiftKey && document.activeElement === lastConfirm) {
            event.preventDefault();
            firstConfirm.focus();
          }
        }
        return;
      }
    }
    if (event.key === 'Escape') close();
    if (event.key !== 'Tab') return;
    const focusables = [...overlay.querySelectorAll('button:not([hidden]), input:not([hidden]), select:not([hidden]), a')]
      .filter((element) => !element.closest('[hidden]'));
    const first = focusables[0];
    const last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  overlay.querySelectorAll('.account-tab').forEach((tab) => tab.addEventListener('click', () => {
    setResetMode(false);
    setMode(tab.dataset.mode);
  }));
  overlay.querySelectorAll('[data-contact]').forEach((button) => button.addEventListener('click', () => setContactMode(button.dataset.contact)));
  overlay.querySelectorAll('.account-center-tab').forEach((tab) => tab.addEventListener('click', () => {
    overlay.querySelectorAll('.account-center-tab').forEach((item) => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    overlay.querySelectorAll('.account-center-panel').forEach((panel) => {
      const selected = panel.dataset.centerPanel === tab.dataset.center;
      panel.hidden = !selected;
      panel.classList.toggle('active', selected);
    });
    renderCollections();
  }));
  function syncPhonePicker(selectEl, customEl, codeEl) {
    if (!selectEl || !customEl || !codeEl) return;
    const isCustom = selectEl.value === 'other';
    customEl.hidden = !isCustom;
    codeEl.textContent = isCustom ? tr('otherLabel', 'Digər') : selectEl.value;
  }

  function extractPhoneValue(selectEl, customEl, localEl) {
    const rawDial = selectEl?.value === 'other' ? customEl?.value.trim() : selectEl?.value;
    const dialClean = String(rawDial || '').replace(/[\s()-]/g, '');
    const dialCode = dialClean.startsWith('00') ? `+${dialClean.slice(2)}` : dialClean;
    const rawDigits = String(localEl?.value || '').replace(/\D/g, '');
    const localDigits = dialCode === '+994' && /^0[1-9]\d{8}$/.test(rawDigits)
      ? rawDigits.slice(1)
      : rawDigits;
    const phone = `${dialCode}${localDigits}`;
    const valid = /^\+[1-9]\d{0,3}$/.test(dialCode) && /^\d{5,14}$/.test(localDigits) && /^\+[1-9]\d{6,14}$/.test(phone);
    return { dialCode, localDigits, phone, valid };
  }

  function updateCountryCode() {
    syncPhonePicker(countryCode, customCode, codeValue);
    syncPhonePicker(socialCountryCode, socialCustomCode, socialCodeValue);
    syncPhonePicker(profileCountryCode, profileCustomCode, profileCodeValue);
  }
  countryCode.addEventListener('change', updateCountryCode);
  socialCountryCode?.addEventListener('change', updateCountryCode);
  profileCountryCode?.addEventListener('change', updateCountryCode);
  passwordToggle.addEventListener('click', () => {
    const visible = form.elements.password.type === 'password';
    form.elements.password.type = visible ? 'text' : 'password';
    passwordToggle.setAttribute('aria-pressed', String(visible));
    passwordToggle.setAttribute('aria-label', visible ? tr('authHidePassword', 'Şifrəni gizlət') : tr('authShowPassword', 'Şifrəni göstər'));
  });
  const providerButtons = [...overlay.querySelectorAll('[data-provider]')];
  const googleSlot = overlay.querySelector('#googleButtonSlot');
  const googleBtn = overlay.querySelector('.account-provider-google');
  let providerConfig = {};

  async function setupGoogleGsi(config) {
    if (!config?.clientId || !googleSlot) return;
    try {
      await loadProviderScript('https://accounts.google.com/gsi/client');
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: config.clientId,
        callback: async (response) => {
          socialStatus(tr('authGoogleSigningIn', 'Google ilə daxil olunur…'));
          try {
            await finishSocial('google', response.credential);
          } catch (error) {
            socialStatus(error.message || tr('authNotCompleted', 'Giriş tamamlanmadı.'), true);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const gsiWidth = Math.min(360, Math.max(240, (window.innerWidth ? window.innerWidth - 76 : 320)));
      googleSlot.style.display = 'flex';
      window.google.accounts.id.renderButton(googleSlot, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'continue_with',
        logo_alignment: 'left',
        width: gsiWidth,
        locale: window.BCF_I18N?.getLanguage?.() || 'az',
      });
      if (googleBtn && googleSlot.querySelector('iframe, div[role="button"]')) {
        googleBtn.style.display = 'none';
      }
    } catch (e) {
      console.warn('Google GSI render error:', e);
    }
  }

  fetch('/api/auth/providers', { credentials: 'same-origin' }).then((response) => response.ok ? response.json() : null).then((providers) => {
    providerConfig = providers || {};
    providerButtons.forEach((button) => {
      const enabled = Boolean(providerConfig?.[button.dataset.provider]?.enabled);
      button.dataset.available = String(enabled);
      button.disabled = !enabled;
      if (!enabled) button.title = tr('authProviderUnavailable', 'Bu giriş üsulu serverdə hələ aktiv edilməyib.');
    });
    if (providerConfig.google?.enabled && providerConfig.google?.clientId) {
      setupGoogleGsi(providerConfig.google);
    }
  }).catch(() => {});

  const socialMessage = overlay.querySelector('#accountSocialMessage');
  const loadedScripts = new Map();
  function loadProviderScript(url) {
    if (loadedScripts.has(url)) return loadedScripts.get(url);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(tr('authGoogleNotReady', 'Giriş provayderini yükləmək mümkün olmadı.')));
      document.head.append(script);
    });
    loadedScripts.set(url, promise);
    return promise;
  }
  function socialStatus(text, isError = false) {
    socialMessage.textContent = text || '';
    socialMessage.hidden = !text;
    socialMessage.classList.toggle('error', isError);
  }
  async function finishSocial(provider, idToken) {
    const result = await request('social', { provider, idToken, requirePhone: true });
    if (result.needsPhone) {
      pendingSocial = { provider, idToken, profile: result.profile || null };
      setSocialPhoneMode(true, result.profile || null);
      return;
    }
    pendingSocial = null;
    user = result.user;
    announceAuthChange();
    form.reset();
    socialPhoneForm?.reset();
    updateCountryCode();
    setSocialPhoneMode(false);
    renderUser();
    close();
  }
  async function signInWithGoogle(config) {
    await loadProviderScript('https://accounts.google.com/gsi/client');
    if (!window.google?.accounts?.id) throw new Error(tr('authGoogleNotReady', 'Google giriş xidməti yüklənmədi.'));
    await setupGoogleGsi(config);
    const innerBtn = googleSlot?.querySelector('div[role="button"]') || googleSlot?.querySelector('iframe');
    if (innerBtn) {
      innerBtn.click();
      return;
    }
    await new Promise((resolve, reject) => {
      let completed = false;
      window.google.accounts.id.initialize({
        client_id: config.clientId,
        callback: async (response) => {
          if (completed) return;
          completed = true;
          try { await finishSocial('google', response.credential); resolve(); }
          catch (error) { reject(error); }
        },
      });
      window.google.accounts.id.prompt((notice) => {
        if (!completed && (notice.isNotDisplayed?.() || notice.isSkippedMoment?.())) {
          completed = true;
          socialStatus('Google seçim pəncərəsi açılmadısa, brauzerdə üçüncü tərəf kukilərini aktiv edin və ya rəsmi Google düyməsinə klikləyin.', true);
          resolve();
        }
      });
      setTimeout(() => { if (!completed) { completed = true; resolve(); } }, 4000);
    });
  }
  providerButtons.forEach((button) => button.addEventListener('click', async () => {
    const provider = button.dataset.provider;
    const config = providerConfig?.[provider];
    if (!config?.enabled) return socialStatus(tr('authProviderUnavailable', 'Bu giriş üsulu serverdə hələ aktiv edilməyib.'), true);
    socialStatus(tr('authGoogleOpening', 'Google hesab seçimi açılır…'));
    providerButtons.forEach((item) => { item.disabled = true; });
    try {
      if (provider === 'google') await signInWithGoogle(config);
    } catch (error) {
      socialStatus(error.message || tr('authNotCompleted', 'Giriş tamamlanmadı.'), true);
    } finally {
      providerButtons.forEach((item) => { item.disabled = !providerConfig?.[item.dataset.provider]?.enabled; });
    }
  }));
  overlay.querySelectorAll('input').forEach((input) => input.addEventListener('focus', () => {
    if (window.visualViewport && window.visualViewport.height < window.innerHeight * .75) {
      setTimeout(() => input.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120);
    }
  }));

  async function request(endpoint, body) {
    if (location.protocol === 'file:') throw new Error(tr('authFileError', 'Hesab üçün saytı fayl kimi deyil, işləyən server ünvanından açın.'));
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || tr('authNotCompleted', 'Sorğu tamamlanmadı. Yenidən cəhd edin.'));
    return data;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    const password = form.elements.password.value;
    const { dialCode, localDigits, phone, valid: phoneValid } = extractPhoneValue(
      countryCode,
      customCode,
      form.elements.phoneLocal
    );
    const email = form.elements.email ? form.elements.email.value.trim() : '';
    const fullName = form.elements.fullName ? form.elements.fullName.value.trim() : '';
    const username = form.elements.username ? form.elements.username.value.trim() : '';

    if (mode === 'register') {
      if (!fullName) {
        message.textContent = tr('authFullNameRequired', 'Ad və soyadınızı daxil edin.');
        form.elements.fullName?.focus();
        return;
      }
      if (!username || username.length < 3) {
        message.textContent = tr('authUsernameMin', 'İstifadəçi adı ən azı 3 simvol olmalıdır.');
        form.elements.username?.focus();
        return;
      }
      if (!phoneValid || !dialCode || !localDigits) {
        message.textContent = tr('authPhoneRequired', 'Mobil telefon nömrənizi tam daxil edin.');
        form.elements.phoneLocal?.focus();
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        message.textContent = tr('authEmailInvalid', 'E-poçt ünvanını düzgün daxil edin.');
        form.elements.email?.focus();
        return;
      }
      if (!password || password.length < 12) {
        message.textContent = tr('authPasswordMin', 'Şifrə ən azı 12 simvoldan ibarət olmalıdır.');
        form.elements.password?.focus();
        return;
      }
      if (!form.elements.privacyAccepted?.checked) {
        message.textContent = tr('authPrivacyRequired', 'Məxfilik siyasətinə razılıq verin.');
        return;
      }
    } else {
      if (!form.elements.identifier?.value.trim()) {
        message.textContent = tr('authIdentifierRequired', 'İstifadəçi adı və ya telefon nömrənizi daxil edin.');
        form.elements.identifier?.focus();
        return;
      }
      if (!password) {
        message.textContent = tr('authPasswordRequired', 'Şifrənizi daxil edin.');
        form.elements.password?.focus();
        return;
      }
    }

    const body = mode === 'register' ? {
      fullName,
      username,
      phone,
      ...(email ? { email } : {}),
      password,
      privacyAccepted: form.elements.privacyAccepted.checked,
    } : { identifier: form.elements.identifier.value.trim(), password };
    submit.disabled = true;
    try {
      const result = await request(mode, body);
      user = result.user;
      announceAuthChange();
      form.reset();
      updateCountryCode();
      form.elements.password.type = 'password';
      renderUser();
      close();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });

  overlay.querySelector('#accountForgotTrigger')?.addEventListener('click', () => {
    const typedId = form.elements.identifier?.value.trim() || '';
    if (typedId && resetRequestForm.elements.resetIdentifier) {
      resetRequestForm.elements.resetIdentifier.value = typedId;
    }
    setResetMode(true, 'request');
    resetRequestForm.elements.resetIdentifier?.focus();
  });

  overlay.querySelector('#resetBackToLogin')?.addEventListener('click', () => {
    setResetMode(false);
    setMode('login');
    form.elements.identifier?.focus();
  });

  overlay.querySelector('#resetHaveCodeBtn')?.addEventListener('click', () => {
    const typedId = resetRequestForm.elements.resetIdentifier?.value.trim() || '';
    if (typedId && resetConfirmForm.elements.confirmIdentifier) {
      resetConfirmForm.elements.confirmIdentifier.value = typedId;
    }
    setResetStep('confirm');
    resetSentBanner.hidden = true;
    (typedId ? resetConfirmForm.elements.code : resetConfirmForm.elements.confirmIdentifier)?.focus();
  });

  overlay.querySelector('#resetResendBtn')?.addEventListener('click', () => {
    const typedId = resetConfirmForm.elements.confirmIdentifier?.value.trim() || '';
    if (typedId && resetRequestForm.elements.resetIdentifier) {
      resetRequestForm.elements.resetIdentifier.value = typedId;
    }
    setResetStep('request');
    resetRequestForm.elements.resetIdentifier?.focus();
  });

  overlay.querySelectorAll('.account-reset-pw-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = resetConfirmForm.elements[btn.dataset.target];
      if (!input) return;
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(visible));
      btn.setAttribute('aria-label', visible ? tr('authHidePassword', 'Şifrəni gizlət') : tr('authShowPassword', 'Şifrəni göstər'));
    });
  });

  resetConfirmForm?.elements.code?.addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 6);
  });

  resetRequestForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetRequestMessage.textContent = '';
    const identifier = resetRequestForm.elements.resetIdentifier?.value.trim() || '';
    if (!identifier) {
      resetRequestMessage.textContent = tr('authIdentifierRequired', 'İstifadəçi adı, telefon nömrəsi və ya e-poçtunuzu daxil edin.');
      resetRequestForm.elements.resetIdentifier?.focus();
      return;
    }
    resetRequestSubmit.disabled = true;
    try {
      await request('forgot-password', { identifier });
      resetConfirmForm.reset();
      resetConfirmForm.elements.confirmIdentifier.value = identifier;
      setResetStep('confirm');
      resetSentBanner.textContent = tr(
        'resetCodeSentBanner',
        'Hesab varsa 6 rəqəmli kod göndərildi (Gmail-ə və ya dəstək xəttinə). Gmail-də görünməsə Spam qovluğunu yoxlayın; e-poçt bağlı deyilsə WhatsApp (+994 70 390 10 09) ilə kodu əldə edin.'
      );
      resetSentBanner.hidden = false;
      resetConfirmForm.elements.code?.focus();
    } catch (error) {
      resetRequestMessage.textContent = error.message;
    } finally {
      resetRequestSubmit.disabled = false;
    }
  });

  resetConfirmForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetConfirmMessage.textContent = '';
    const identifier = resetConfirmForm.elements.confirmIdentifier?.value.trim() || '';
    const code = resetConfirmForm.elements.code?.value.replace(/\D/g, '') || '';
    const newPassword = resetConfirmForm.elements.newPassword?.value || '';
    const confirmPassword = resetConfirmForm.elements.confirmPassword?.value || '';

    if (!identifier) {
      resetConfirmMessage.textContent = tr('authIdentifierRequired', 'İstifadəçi adı, telefon nömrəsi və ya e-poçtunuzu daxil edin.');
      resetConfirmForm.elements.confirmIdentifier?.focus();
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      resetConfirmMessage.textContent = tr('resetCodeInvalid', '6 rəqəmli təsdiq kodunu düzgün daxil edin.');
      resetConfirmForm.elements.code?.focus();
      return;
    }
    if (!newPassword || newPassword.length < 12) {
      resetConfirmMessage.textContent = tr('authPasswordMin', 'Şifrə ən azı 12 simvoldan ibarət olmalıdır.');
      resetConfirmForm.elements.newPassword?.focus();
      return;
    }
    if (newPassword !== confirmPassword) {
      resetConfirmMessage.textContent = tr('resetPasswordMismatch', 'Yeni şifrələr uyğun gəlmir.');
      resetConfirmForm.elements.confirmPassword?.focus();
      return;
    }

    resetConfirmSubmit.disabled = true;
    try {
      const result = await request('reset-password', { identifier, code, newPassword });
      user = result.user;
      announceAuthChange();
      form.reset();
      resetRequestForm.reset();
      resetConfirmForm.reset();
      updateCountryCode();
      form.elements.password.type = 'password';
      setResetMode(false);
      setMode('login');
      renderUser();
      close();
    } catch (error) {
      resetConfirmMessage.textContent = error.message;
    } finally {
      resetConfirmSubmit.disabled = false;
    }
  });

  socialPhoneCancel?.addEventListener('click', () => {
    setSocialPhoneMode(false);
    socialStatus('');
    form.elements.identifier?.focus();
  });

  socialPhoneForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (socialPhoneMessage) socialPhoneMessage.textContent = '';
    if (!pendingSocial?.idToken) {
      setSocialPhoneMode(false);
      return;
    }
    const { phone, valid } = extractPhoneValue(
      socialCountryCode,
      socialCustomCode,
      socialPhoneForm.elements.socialPhoneLocal
    );
    if (!valid) {
      if (socialPhoneMessage) {
        socialPhoneMessage.textContent = tr('authPhoneRequired', 'Mobil telefon nömrənizi tam daxil edin.');
      }
      socialPhoneForm.elements.socialPhoneLocal?.focus();
      return;
    }
    if (socialPhoneConfirm) socialPhoneConfirm.disabled = true;
    try {
      const result = await request('social', {
        provider: pendingSocial.provider,
        idToken: pendingSocial.idToken,
        phone,
        requirePhone: true,
      });
      if (result.needsPhone) {
        if (socialPhoneMessage) {
          socialPhoneMessage.textContent = tr('authPhoneRequired', 'Mobil telefon nömrənizi tam daxil edin.');
        }
        return;
      }
      pendingSocial = null;
      user = result.user;
      announceAuthChange();
      form.reset();
      socialPhoneForm.reset();
      updateCountryCode();
      setSocialPhoneMode(false);
      renderUser();
      close();
    } catch (error) {
      if (socialPhoneMessage) socialPhoneMessage.textContent = error.message;
    } finally {
      if (socialPhoneConfirm) socialPhoneConfirm.disabled = false;
    }
  });

  profilePhoneForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (profilePhoneMessage) profilePhoneMessage.textContent = '';
    if (!user) return;
    const { phone, valid } = extractPhoneValue(
      profileCountryCode,
      profileCustomCode,
      profilePhoneForm.elements.profilePhoneLocal
    );
    if (!valid) {
      if (profilePhoneMessage) {
        profilePhoneMessage.textContent = tr('authPhoneRequired', 'Mobil telefon nömrənizi tam daxil edin.');
      }
      profilePhoneForm.elements.profilePhoneLocal?.focus();
      return;
    }
    if (profilePhoneSubmit) profilePhoneSubmit.disabled = true;
    try {
      const result = await request('phone', { phone });
      user = result.user;
      profilePhoneForm.reset();
      updateCountryCode();
      renderUser();
      if (profilePhoneSavedBanner) profilePhoneSavedBanner.hidden = false;
      announceAuthChange();
    } catch (error) {
      if (profilePhoneMessage) profilePhoneMessage.textContent = error.message;
    } finally {
      if (profilePhoneSubmit) profilePhoneSubmit.disabled = false;
    }
  });

  logoutTriggerBtn?.addEventListener('click', openLogoutConfirm);
  logoutCancelBtn?.addEventListener('click', () => closeLogoutConfirm(true));
  logoutAcceptBtn?.addEventListener('click', performLogout);
  logoutConfirmOverlay?.addEventListener('click', (event) => {
    if (event.target === logoutConfirmOverlay) {
      event.stopPropagation();
      closeLogoutConfirm(true);
    }
  });

  window.bcfAccount = {
    getUser: () => user,
    open: (options = {}) => {
      previousFocus = document.activeElement;
      closeLogoutConfirm(false);
      setSocialPhoneMode(false);
      if (profilePhoneSavedBanner) profilePhoneSavedBanner.hidden = true;
      overlay.hidden = false;
      document.body.classList.add('account-open');
      document.documentElement.classList.add('account-open');
      if (options.mode === 'forgot') {
        setResetMode(true, 'request');
      } else {
        setResetMode(false);
        if (options.mode) setMode(options.mode);
      }
      if (options.message) message.textContent = options.message;
      window.BCF_I18N?.translateDom?.(overlay);
      dialog.focus();
    },
    close: () => close(),
  };

  setMode('login');
  renderUser();
  renderCollections();
  window.BCF_I18N?.translateDom?.(overlay);
  window.dispatchEvent(new CustomEvent('bcf:ui-mounted'));
  window.addEventListener('bcf:auth-changed', (event) => {
    const nextUser = event.detail?.user || null;
    if (nextUser && (!user || nextUser.id !== user.id || nextUser.phone !== user.phone)) {
      user = nextUser;
      renderUser();
    }
  });
  window.addEventListener('bcf:language-changed', () => {
    setMode(mode);
    renderUser();
    updateCountryCode();
    if (!resetSentBanner.hidden) {
      resetSentBanner.textContent = tr(
        'resetCodeSentBanner',
        'Hesab varsa 6 rəqəmli kod göndərildi (Gmail-ə və ya dəstək xəttinə). Gmail-də görünməsə Spam qovluğunu yoxlayın; e-poçt bağlı deyilsə WhatsApp (+994 70 390 10 09) ilə kodu əldə edin.'
      );
    }
    overlay.querySelectorAll('select[name="countryCode"] option, select[name="socialCountryCode"] option, select[name="profileCountryCode"] option').forEach((opt) => {
      if (opt.value === 'other') {
        opt.textContent = dyn('Digər ölkə kodu…');
      } else {
        const entry = countryOptions.find(([code]) => code === opt.value);
        if (entry) opt.textContent = dyn(`${entry[1]} (${entry[0]})`);
      }
    });
    window.BCF_I18N?.translateDom?.(overlay);
  });
  window.addEventListener('bcf:orders-changed', renderOrders);
  fetch('/api/auth/me', { credentials: 'same-origin' }).then((response) => response.ok ? response.json() : null)
    .then((data) => {
      if (data?.user) {
        user = data.user;
        renderUser();
        announceAuthChange();
      }
    }).catch(() => {});

})();
