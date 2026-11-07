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
          <label class="account-field account-login-only">İstifadəçi adı və ya telefon nömrəsi
            <input name="identifier" autocomplete="username" placeholder="İstifadəçi adı, telefon və ya e-poçt" />
          </label>
          <label class="account-field account-register-only" hidden>Ad və Soyad
            <input name="fullName" autocomplete="name" placeholder="Ad və soyadınız" maxlength="100" />
          </label>
          <label class="account-field account-register-only" hidden>İstifadəçi adı <span class="account-field-hint">(unikal olmalıdır)</span>
            <input name="username" autocomplete="username" minlength="3" maxlength="30" placeholder="İstifadəçi adınız (məs: farman08)" />
          </label>
          <div class="account-contact-choice account-register-only" role="group" aria-label="Qeydiyyat üsulu" style="display:none;" hidden>
            <button type="button" class="active" data-contact="phone" aria-pressed="true">Telefon</button>
            <button type="button" data-contact="email" aria-pressed="false">E-poçt</button>
          </div>
          <div class="account-field account-register-only account-phone-contact" hidden>
            <span>Mobil nömrə</span>
            <div class="account-phone-row">
              <label class="account-code-picker"><span class="account-sr-only">Ölkə kodu</span><span class="account-code-display" aria-hidden="true"><span class="account-code-value">+994</span><span class="account-code-arrows"><svg viewBox="0 0 12 18" width="12" height="18"><path d="m2 7 4-4 4 4M2 11l4 4 4-4" /></svg></span></span><select name="countryCode" aria-label="Ölkə və telefon kodu">${countryOptions.map(([code, name]) => `<option value="${code}">${name} (${code})</option>`).join('')}<option value="other">Digər ölkə kodu…</option></select></label>
              <label><span class="account-sr-only">Telefon nömrəsi</span><input name="phoneLocal" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="123456789" /></label>
            </div>
            <input class="account-custom-code" name="customCode" type="tel" inputmode="tel" placeholder="Ölkə kodu, məsələn +81" aria-label="Digər ölkə kodu" hidden />
          </div>
          <label class="account-field account-register-only account-email-contact" style="display:none;" hidden>E-poçt ünvanı
            <input name="email" type="email" inputmode="email" autocomplete="email" placeholder="ad@example.com" />
          </label>
          <label class="account-field">Şifrə
            <span class="account-password-wrap"><input name="password" type="password" autocomplete="current-password" minlength="12" placeholder="Ən azı 12 simvol" /><button class="account-password-toggle" type="button" aria-label="Şifrəni göstər" aria-pressed="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span>
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
          <div id="googleButtonSlot" style="display:none;width:100%;margin-bottom:8px;justify-content:center;"></div>
          <button class="account-provider account-provider-google" type="button" data-provider="google"><span aria-hidden="true">G</span>Google ilə davam et</button>
          <p class="account-social-message" id="accountSocialMessage" role="status" aria-live="polite" hidden></p>
          <p class="account-provider-note">Google ilə bir kliklə sürətli giriş və qeydiyyat.</p>
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
    window.bcfCurrentUser = user;
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
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const fallback = response.status === 503
          ? 'Hesab xidməti serverdə hələ aktiv deyil. PostgreSQL bazası qoşulduqdan sonra sifariş tarixçəsi işləyəcək.'
          : response.status === 401
            ? 'Sifarişlərinizi görmək üçün hesabınıza yenidən daxil olun.'
            : 'Sifariş tarixçəsini yükləmək mümkün olmadı. Yenidən cəhd edin.';
        throw new Error(result.error || fallback);
      }
      orders = result;
    } catch (error) {
      if (user?.id === ownerId) list.innerHTML = `<p class="account-list-status" role="alert">${escapeHtml(error.message)}</p>`;
      return;
    }
    if (user?.id !== ownerId) return;
    list.innerHTML = Array.isArray(orders) && orders.length ? orders.map((order) => `
      <article class="account-order-card">
        <div><span>Sifariş #${escapeHtml(order.id)}</span><time datetime="${escapeHtml(order.createdAt)}">${escapeHtml(new Date(order.createdAt).toLocaleDateString('az-AZ'))}</time></div>
        <strong>${escapeHtml(order.quoteRequired
          ? (Number(order.total || 0) > 0 ? `${Number(order.total).toFixed(2)} ₼ + qiymət təsdiqlənəcək` : 'Qiymət təsdiqlənəcək')
          : `${Number(order.total || 0).toFixed(2)} ₼`)}</strong>
        <p>${escapeHtml((Array.isArray(order.items) ? order.items : []).map((item) => `${item.name} × ${item.quantity}${item.unit === 'g' ? 'q' : ''}`).join(' · '))}</p>
        <small>${order.status === 'new' ? 'Sifariş qeydə alınıb' : escapeHtml(order.status || 'Sifariş qeydə alınıb')}</small>
      </article>`).join('') : '<div class="account-empty"><span aria-hidden="true">⌁</span><h3>Hələ sifariş yoxdur.</h3><p>Hesabınıza daxil olaraq verdiyiniz sifarişlər burada görünəcək.</p></div>';
  }

  function renderCollections() {
    renderOrders();
  }

  function renderUser() {
    profile.hidden = !user;
    authView.hidden = Boolean(user);
    if (user) {
      trigger.classList.add('is-logged-in');
      trigger.setAttribute('aria-label', `Hesab: ${user.username}`);
      trigger.title = user.username;
      trigger.innerHTML = '<span class="account-user-avatar" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg></span>';
      profile.querySelector('.account-greeting').textContent = `Salam, ${user.fullName || user.username}!`;
      profile.querySelector('.account-phone').textContent = user.phone ? `Tel: ${user.phone}` : (user.email || '');
    } else {
      trigger.classList.remove('is-logged-in');
      trigger.removeAttribute('aria-label');
      trigger.removeAttribute('title');
      trigger.textContent = 'Hesab';
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
    if (tab.dataset.center === 'orders') renderOrders();
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
          socialStatus('Google ilə daxil olunur…');
          try {
            await finishSocial('google', response.credential);
          } catch (error) {
            socialStatus(error.message || 'Giriş tamamlanmadı.', true);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      googleSlot.style.display = 'flex';
      window.google.accounts.id.renderButton(googleSlot, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'continue_with',
        logo_alignment: 'left',
        width: 320,
        locale: 'az',
      });
      if (googleBtn) {
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
      if (!enabled) button.title = 'Bu giriş üsulu serverdə hələ konfiqurasiya edilməyib.';
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
      script.onerror = () => reject(new Error('Giriş provayderini yükləmək mümkün olmadı.'));
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
    const result = await request('social', { provider, idToken });
    user = result.user;
    announceAuthChange();
    form.reset();
    updateCountryCode();
    renderUser();
    close();
  }
  async function signInWithGoogle(config) {
    await loadProviderScript('https://accounts.google.com/gsi/client');
    if (!window.google?.accounts?.id) throw new Error('Google giriş xidməti yüklənmədi.');
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
    if (!config?.enabled) return socialStatus('Bu giriş üsulu serverdə hələ aktiv edilməyib.', true);
    socialStatus('Google hesab seçimi açılır…');
    providerButtons.forEach((item) => { item.disabled = true; });
    try {
      if (provider === 'google') await signInWithGoogle(config);
    } catch (error) {
      socialStatus(error.message || 'Giriş tamamlanmadı.', true);
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
    const phone = `${dialCode}${localDigits}`;
    const fullName = form.elements.fullName ? form.elements.fullName.value.trim() : '';
    const username = form.elements.username ? form.elements.username.value.trim() : '';

    if (mode === 'register') {
      if (!fullName) {
        message.textContent = 'Ad və soyadınızı daxil edin.';
        form.elements.fullName?.focus();
        return;
      }
      if (!username || username.length < 3) {
        message.textContent = 'İstifadəçi adı ən azı 3 simvol olmalıdır.';
        form.elements.username?.focus();
        return;
      }
      if (!/^\+[1-9]\d{0,3}$/.test(dialCode) || !/^\d{5,14}$/.test(localDigits)) {
        message.textContent = 'Mobil telefon nömrənizi tam daxil edin.';
        form.elements.phoneLocal?.focus();
        return;
      }
      if (!password || password.length < 12) {
        message.textContent = 'Şifrə ən azı 12 simvoldan ibarət olmalıdır.';
        form.elements.password?.focus();
        return;
      }
      if (!form.elements.privacyAccepted?.checked) {
        message.textContent = 'Məxfilik siyasətinə razılıq verin.';
        return;
      }
    } else {
      if (!form.elements.identifier?.value.trim()) {
        message.textContent = 'İstifadəçi adı və ya telefon nömrənizi daxil edin.';
        form.elements.identifier?.focus();
        return;
      }
      if (!password) {
        message.textContent = 'Şifrənizi daxil edin.';
        form.elements.password?.focus();
        return;
      }
    }

    const body = mode === 'register' ? {
      fullName,
      username,
      ...(contactMode === 'email' && form.elements.email?.value.trim() ? { email: form.elements.email.value.trim() } : { phone }),
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

  overlay.querySelector('.account-logout').addEventListener('click', async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    } catch {}
    user = null;
    announceAuthChange();
    renderUser();
    close();
  });

  window.bcfAccount = {
    getUser: () => user,
    open: (options = {}) => {
      previousFocus = document.activeElement;
      overlay.hidden = false;
      document.body.classList.add('account-open');
      document.documentElement.classList.add('account-open');
      if (options.mode) setMode(options.mode);
      if (options.message) message.textContent = options.message;
      dialog.focus();
    },
    close: () => close(),
  };

  setMode('login');
  renderUser();
  renderCollections();
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
