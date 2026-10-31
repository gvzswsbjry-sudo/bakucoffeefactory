(() => {
  const header = document.querySelector('.site-header');
  if (!header || document.getElementById('accountTrigger')) return;

  const trigger = document.createElement('button');
  trigger.id = 'accountTrigger';
  trigger.className = 'account-trigger';
  trigger.type = 'button';
  trigger.textContent = 'Hesab';
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
  overlay.innerHTML = `
    <section class="account-dialog" role="dialog" aria-modal="true" aria-labelledby="accountTitle" tabindex="-1">
      <button class="account-close" type="button" aria-label="Bağla">×</button>
      <p class="account-eyebrow">BAKU COFFEE FACTORY</p>
      <h2 id="accountTitle">Hesabınız</h2>
      <div class="account-center-tabs" role="tablist" aria-label="Hesab bölmələri">
        <button type="button" class="account-center-tab active" data-center="details" role="tab" aria-selected="true">Hesab məlumatları</button>
        <button type="button" class="account-center-tab" data-center="orders" role="tab" aria-selected="false">Keçmiş sifarişlər</button>
      </div>
      <div class="account-center-panel active" data-center-panel="details">
       <div class="account-auth-view">
        <div class="account-tabs" role="tablist" aria-label="Hesab əməliyyatları">
          <button type="button" class="account-tab active" data-mode="login" role="tab" aria-selected="true">Giriş</button>
          <button type="button" class="account-tab" data-mode="register" role="tab" aria-selected="false">Qeydiyyat</button>
        </div>
        <form id="accountForm" novalidate>
          <label class="account-field account-login-only">İstifadəçi adı, telefon və ya e-poçt
            <input name="identifier" autocomplete="username" placeholder="Adınız, telefonunuz və ya e-poçtiniz" />
          </label>
          <label class="account-field account-register-only" hidden>İstifadəçi adı
            <input name="username" autocomplete="username" minlength="3" maxlength="30" />
          </label>
          <div class="account-contact-choice account-register-only" role="group" aria-label="Qeydiyyat üsulu" hidden>
            <button type="button" class="active" data-contact="phone" aria-pressed="true">Telefon</button>
            <button type="button" data-contact="email" aria-pressed="false">E-poçt</button>
          </div>
          <div class="account-field account-register-only account-phone-contact" hidden>
            <span>Telefon nömrəsi</span>
            <div class="account-phone-row">
              <label class="account-code-picker"><span class="account-sr-only">Ölkə kodu</span><span class="account-code-display" aria-hidden="true"><span class="account-code-value">+994</span><span class="account-code-arrows"><svg viewBox="0 0 12 18" width="12" height="18"><path d="m2 7 4-4 4 4M2 11l4 4 4-4" /></svg></span></span><select name="countryCode" aria-label="Ölkə və telefon kodu">${countryOptions.map(([code, name]) => `<option value="${code}">${name} (${code})</option>`).join('')}<option value="other">Digər ölkə kodu…</option></select></label>
              <label><span class="account-sr-only">Telefon nömrəsi</span><input name="phoneLocal" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="123456789" /></label>
            </div>
            <input class="account-custom-code" name="customCode" type="tel" inputmode="tel" placeholder="Ölkə kodu, məsələn +81" aria-label="Digər ölkə kodu" hidden />
          </div>
          <label class="account-field account-register-only account-email-contact" hidden>E-poçt ünvanı
            <input name="email" type="email" inputmode="email" autocomplete="email" placeholder="ad@example.com" />
          </label>
          <label class="account-field">Şifrə
            <span class="account-password-wrap"><input name="password" type="password" autocomplete="current-password" minlength="8" /><button class="account-password-toggle" type="button" aria-label="Şifrəni göstər" aria-pressed="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span>
          </label>
          <label class="account-consent account-register-only" hidden>
            <input name="privacyAccepted" type="checkbox" />
            <span><a href="mexfilik.html" target="_blank" rel="noopener">Məxfilik siyasətini</a> oxudum və şəxsi məlumatlarımın hesab yaratmaq üçün işlənməsinə razıyam.</span>
          </label>
          <p class="account-message" id="accountMessage" role="status" aria-live="polite"></p>
          <button class="account-submit" type="submit">Daxil ol</button>
        </form>
        <div class="account-social">
          <div class="account-divider"><span>və ya</span></div>
          <button class="account-provider account-provider-google" type="button" data-provider="google"><span aria-hidden="true">G</span>Google ilə davam et</button>
          <button class="account-provider account-provider-apple" type="button" data-provider="apple"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M16.7 12.8c0-2.7 2.2-4 2.3-4.1-1.3-1.9-3.3-2.1-4-2.1-1.7-.2-3.3 1-4.2 1-.9 0-2.3-1-3.7-.9-1.9 0-3.6 1.1-4.6 2.8-2 3.4-.5 8.4 1.4 11.2.9 1.4 2.1 2.9 3.6 2.8 1.4-.1 2-1 3.7-1s2.2 1 3.7 1c1.5 0 2.5-1.4 3.4-2.7 1.1-1.6 1.6-3.2 1.6-3.3-.1 0-3.2-1.2-3.2-4.7ZM13.9 4.8c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.6.8-3.5 1.8-.8.9-1.4 2.3-1.2 3.7 1.3.1 2.7-.7 3.5-1.7Z"/></svg>Apple ilə davam et</button>
          <div class="account-social-prompt" id="accountSocialPrompt" hidden>
            <div class="account-social-header">
              <span class="account-social-icon" id="accountSocialIcon" aria-hidden="true"></span>
              <div>
                <h4 id="accountSocialTitle">Google ilə davam et</h4>
                <p id="accountSocialSubtitle">E-poçt ünvanınız ilə dərhal daxil olun və ya qeydiyyatdan keçin</p>
              </div>
            </div>
            <label class="account-field">
              <span>E-poçt ünvanınız</span>
              <input type="email" id="accountSocialEmail" autocomplete="email" placeholder="ad@gmail.com" />
            </label>
            <label class="account-field">
              <span>Adınız (istəyə bağlı)</span>
              <input type="text" id="accountSocialName" autocomplete="name" placeholder="Adınız və ya ləqəbiniz" />
            </label>
            <p class="account-social-message" id="accountSocialMessage" role="alert" style="color:#b23b3b;font-size:12px;margin:2px 0 0;font-weight:600;" hidden></p>
            <div class="account-social-actions">
              <button type="button" class="account-social-cancel" id="accountSocialCancel">Geri</button>
              <button type="button" class="account-social-confirm" id="accountSocialConfirm">Daxil ol</button>
            </div>
          </div>
          <p class="account-provider-note">Google və Apple ilə bir kliklə sürətli giriş və qeydiyyat.</p>
        </div>
        <p class="account-note">Hesab açmadan da sayta baxa və səbətə məhsul əlavə edə bilərsiniz.</p>
       </div>
       <div class="account-profile-view" hidden>
        <div class="account-profile-card">
          <span class="account-profile-avatar" aria-hidden="true"></span>
          <div><p class="account-greeting"></p><p class="account-phone"></p></div>
        </div>
        <p class="account-security-note">Hesabınız bu cihazda təhlükəsiz sessiya ilə açıqdır.</p>
        <button class="account-logout" type="button">Hesabdan çıx</button>
       </div>
      </div>
      <div class="account-center-panel" data-center-panel="orders" hidden>
        <div class="account-section-heading"><div><p class="account-eyebrow">SİFARİŞ ARXİVİ</p><h3>Keçmiş sifarişlər</h3></div></div>
        <div class="account-orders-list"></div>
      </div>
    </section>`;
  document.body.append(overlay);

  const dialog = overlay.querySelector('.account-dialog');
  const form = overlay.querySelector('#accountForm');
  const message = overlay.querySelector('#accountMessage');
  const profile = overlay.querySelector('.account-profile-view');
  const authView = overlay.querySelector('.account-auth-view');
  const submit = overlay.querySelector('.account-submit');
  const countryCode = form.elements.countryCode;
  const customCode = form.elements.customCode;
  const codeValue = overlay.querySelector('.account-code-value');
  const passwordToggle = overlay.querySelector('.account-password-toggle');
  let mode = 'login';
  let contactMode = 'phone';
  let user = null;
  let previousFocus = null;
  function announceAuthChange() {
    window.dispatchEvent(new CustomEvent('bcf:auth-changed', { detail: { user } }));
  }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  async function renderOrders() {
    const list = overlay.querySelector('.account-orders-list');
    if (!user) {
      list.innerHTML = '<div class="account-empty"><span aria-hidden="true">⌁</span><h3>Hesabınıza daxil olun.</h3><p>Şəxsi sifariş tarixçəniz giriş etdikdən sonra burada görünəcək.</p></div>';
      return;
    }
    const ownerId = user.id;
    list.innerHTML = '<p class="account-list-status" role="status">Sifarişlər yüklənir…</p>';
    let orders;
    try {
      const response = await fetch('/api/account/orders', { credentials: 'same-origin' });
      if (!response.ok) throw new Error('Sifariş tarixçəsini yükləmək mümkün olmadı. Yenidən cəhd edin.');
      orders = await response.json();
    } catch (error) {
      if (user?.id === ownerId) list.innerHTML = `<p class="account-list-status" role="alert">${escapeHtml(error.message)}</p>`;
      return;
    }
    if (user?.id !== ownerId) return;
    list.innerHTML = Array.isArray(orders) && orders.length ? orders.map((order) => `
      <article class="account-order-card">
        <div><span>Sifariş #${escapeHtml(order.id)}</span><time datetime="${escapeHtml(order.createdAt)}">${escapeHtml(new Date(order.createdAt).toLocaleDateString('az-AZ'))}</time></div>
        <strong>${escapeHtml(Number(order.total || 0).toFixed(2))} ₼</strong>
        <p>${escapeHtml((Array.isArray(order.items) ? order.items : []).map((item) => `${item.name} × ${item.quantity}${item.unit === 'g' ? 'q' : ''}`).join(' · '))}</p>
        <small>${order.status === 'new' ? 'Sifariş qeydə alınıb' : escapeHtml(order.status || 'Sifariş qeydə alınıb')}</small>
      </article>`).join('') : '<div class="account-empty"><span aria-hidden="true">⌁</span><h3>Hələ sifariş yoxdur.</h3><p>Hesabınıza daxil olaraq verdiyiniz sifarişlər burada görünəcək.</p></div>';
  }

  function renderCollections() {
    renderOrders();
  }

  function renderUser() {
    trigger.textContent = 'Hesab';
    profile.hidden = !user;
    authView.hidden = Boolean(user);
    if (user) {
      profile.querySelector('.account-greeting').textContent = `Salam, ${user.username}!`;
      profile.querySelector('.account-phone').textContent = user.phone || user.email || '';
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
    passwordToggle.setAttribute('aria-label', 'Şifrəni göstər');
    submit.textContent = mode === 'register' ? 'Hesab yarat' : 'Daxil ol';
    setContactMode(contactMode);
  }

  function setContactMode(nextMode) {
    contactMode = nextMode === 'email' ? 'email' : 'phone';
    overlay.querySelectorAll('[data-contact]').forEach((button) => {
      const active = button.dataset.contact === contactMode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const registering = mode === 'register';
    overlay.querySelector('.account-phone-contact').hidden = !registering || contactMode !== 'phone';
    overlay.querySelector('.account-email-contact').hidden = !registering || contactMode !== 'email';
  }

  function close() {
    closeSocialPrompt();
    overlay.hidden = true;
    document.body.classList.remove('account-open');
    document.documentElement.classList.remove('account-open');
    previousFocus?.focus();
  }

  trigger.addEventListener('click', () => {
    previousFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('account-open');
    document.documentElement.classList.add('account-open');
    message.textContent = '';
    renderCollections();
    dialog.focus();
  });
  overlay.querySelector('.account-close').addEventListener('click', close);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
    if (event.key !== 'Tab') return;
    const focusables = [...overlay.querySelectorAll('button:not([hidden]), input:not([hidden]), a')]
      .filter((element) => !element.closest('[hidden]'));
    const first = focusables[0];
    const last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  overlay.querySelectorAll('.account-tab').forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
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
  function updateCountryCode() {
    const isCustom = countryCode.value === 'other';
    customCode.hidden = !isCustom;
    codeValue.textContent = isCustom ? 'Digər' : countryCode.value;
  }
  countryCode.addEventListener('change', updateCountryCode);
  passwordToggle.addEventListener('click', () => {
    const visible = form.elements.password.type === 'password';
    form.elements.password.type = visible ? 'text' : 'password';
    passwordToggle.setAttribute('aria-pressed', String(visible));
    passwordToggle.setAttribute('aria-label', visible ? 'Şifrəni gizlət' : 'Şifrəni göstər');
  });
  const providerButtons = [...overlay.querySelectorAll('[data-provider]')];
  fetch('/api/auth/providers', { credentials: 'same-origin' }).then((response) => response.ok ? response.json() : null).then((providers) => {
    providerButtons.forEach((button) => { button.dataset.available = String(Boolean(providers?.[button.dataset.provider])); });
  }).catch(() => {});

  const socialPrompt = overlay.querySelector('#accountSocialPrompt');
  const socialTitle = overlay.querySelector('#accountSocialTitle');
  const socialSubtitle = overlay.querySelector('#accountSocialSubtitle');
  const socialIcon = overlay.querySelector('#accountSocialIcon');
  const socialEmail = overlay.querySelector('#accountSocialEmail');
  const socialName = overlay.querySelector('#accountSocialName');
  const socialCancel = overlay.querySelector('#accountSocialCancel');
  const socialConfirm = overlay.querySelector('#accountSocialConfirm');
  let activeSocialProvider = null;

  function openSocialPrompt(provider) {
    activeSocialProvider = provider;
    message.textContent = '';
    const isGoogle = provider === 'google';
    socialTitle.textContent = isGoogle ? 'Google ilə davam et' : 'Apple ilə davam et';
    socialSubtitle.textContent = isGoogle
      ? 'Google e-poçtunuz ilə bir kliklə hesab yaradın və ya daxil olun'
      : 'Apple ID e-poçtunuz ilə bir kliklə hesab yaradın və ya daxil olun';
    socialIcon.innerHTML = isGoogle
      ? '<span style="display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:conic-gradient(from -45deg,#4285f4 0 25%,#34a853 0 50%,#fbbc05 0 75%,#ea4335 0);color:#fff;font-weight:700;font-size:13px;">G</span>'
      : '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16.7 12.8c0-2.7 2.2-4 2.3-4.1-1.3-1.9-3.3-2.1-4-2.1-1.7-.2-3.3 1-4.2 1-.9 0-2.3-1-3.7-.9-1.9 0-3.6 1.1-4.6 2.8-2 3.4-.5 8.4 1.4 11.2.9 1.4 2.1 2.9 3.6 2.8 1.4-.1 2-1 3.7-1s2.2 1 3.7 1c1.5 0 2.5-1.4 3.4-2.7 1.1-1.6 1.6-3.2 1.6-3.3-.1 0-3.2-1.2-3.2-4.7ZM13.9 4.8c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.6.8-3.5 1.8-.8.9-1.4 2.3-1.2 3.7 1.3.1 2.7-.7 3.5-1.7Z"/></svg>';
    socialEmail.placeholder = isGoogle ? 'ad@gmail.com' : 'ad@icloud.com';
    const formEmail = form.elements.email?.value?.trim() || (form.elements.identifier?.value?.includes('@') ? form.elements.identifier.value.trim() : '');
    socialEmail.value = formEmail || '';
    socialName.value = form.elements.username?.value?.trim() || '';
    socialPrompt.hidden = false;
    providerButtons.forEach((b) => { b.hidden = true; });
    setTimeout(() => socialEmail.focus(), 60);
  }

  function closeSocialPrompt() {
    activeSocialProvider = null;
    if (socialPrompt) socialPrompt.hidden = true;
    providerButtons.forEach((b) => { b.hidden = false; });
  }

  socialCancel?.addEventListener('click', closeSocialPrompt);

  providerButtons.forEach((button) => button.addEventListener('click', () => {
    openSocialPrompt(button.dataset.provider);
  }));

  socialConfirm?.addEventListener('click', async () => {
    if (!activeSocialProvider) return;
    const email = socialEmail.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.textContent = 'Düzgün e-poçt ünvanı daxil edin.';
      socialEmail.focus();
      return;
    }
    socialConfirm.disabled = true;
    message.textContent = '';
    try {
      const result = await request('social', {
        provider: activeSocialProvider,
        email,
        name: socialName.value.trim(),
      });
      user = result.user;
      announceAuthChange();
      closeSocialPrompt();
      form.reset();
      updateCountryCode();
      renderUser();
      close();
    } catch (err) {
      message.textContent = err.message;
    } finally {
      socialConfirm.disabled = false;
    }
  });

  socialEmail?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); socialConfirm.click(); }
  });
  socialName?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); socialConfirm.click(); }
  });
  overlay.querySelectorAll('input').forEach((input) => input.addEventListener('focus', () => {
    if (window.visualViewport && window.visualViewport.height < window.innerHeight * .75) {
      setTimeout(() => input.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120);
    }
  }));

  async function request(endpoint, body) {
    if (location.protocol === 'file:') throw new Error('Hesab üçün saytı fayl kimi deyil, işləyən server ünvanından açın.');
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Sorğu tamamlanmadı. Yenidən cəhd edin.');
    return data;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    const password = form.elements.password.value;
    const dialCode = countryCode.value === 'other' ? customCode.value.trim() : countryCode.value;
    const localDigits = form.elements.phoneLocal.value.replace(/\D/g, '');
    const body = mode === 'register' ? {
      username: form.elements.username.value.trim(),
      ...(contactMode === 'phone' ? { phone: `${dialCode}${localDigits}` } : { email: form.elements.email.value.trim() }),
      password, privacyAccepted: form.elements.privacyAccepted.checked,
    } : { identifier: form.elements.identifier.value.trim(), password };
    if (mode === 'register' && contactMode === 'phone' && (!/^\+[1-9]\d{0,3}$/.test(dialCode) || !/^\d{5,14}$/.test(localDigits))) {
      message.textContent = 'Ölkə kodunu seçin və telefon nömrəsinin qalan rəqəmlərini daxil edin.';
      return;
    }
    if (mode === 'register' && contactMode === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      message.textContent = 'Düzgün e-poçt ünvanı daxil edin.';
      return;
    }
    if (mode === 'register' && !body.privacyAccepted) {
      message.textContent = 'Məxfilik siyasətinə razılıq verin.';
      return;
    }
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

  overlay.querySelector('.account-logout').addEventListener('click', async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Logout failed');
      user = null;
      announceAuthChange();
      renderUser();
      close();
    } catch {
      message.textContent = 'Çıxış mümkün olmadı. Yenidən cəhd edin.';
    }
  });

  setMode('login');
  renderUser();
  renderCollections();
  window.addEventListener('bcf:orders-changed', renderOrders);
  fetch('/api/auth/me', { credentials: 'same-origin' }).then((response) => response.ok ? response.json() : null)
    .then((data) => { if (data) { user = data.user; renderUser(); announceAuthChange(); } }).catch(() => {});

  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'social') {
      const provider = urlParams.get('provider') || 'google';
      setTimeout(() => {
        trigger.click();
        openSocialPrompt(provider);
      }, 100);
    }
  } catch {}
})();
