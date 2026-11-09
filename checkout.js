(() => {
  const summary = document.querySelector('.cart-summary');
  if (!summary || document.getElementById('checkoutOpen')) return;

  const tr = (key, fallback) => window.BCF_I18N?.t?.(key, fallback) ?? fallback;
  const dyn = (text) => window.BCF_I18N?.translateDynamicText?.(text) ?? text;

  const countryOptions = [
    ['+994', 'Azərbaycan'], ['+90', 'Türkiyə'], ['+995', 'Gürcüstan'], ['+7', 'Rusiya / Qazaxıstan'],
    ['+1', 'ABŞ / Kanada'], ['+44', 'Birləşmiş Krallıq'], ['+49', 'Almaniya'], ['+33', 'Fransa'],
    ['+39', 'İtaliya'], ['+34', 'İspaniya'], ['+971', 'BƏƏ'], ['+380', 'Ukrayna'],
    ['+91', 'Hindistan'], ['+92', 'Pakistan'], ['+98', 'İran'], ['+966', 'Səudiyyə Ərəbistanı'],
    ['+31', 'Niderland'], ['+41', 'İsveçrə'], ['+48', 'Polşa'], ['+86', 'Çin'],
  ];

  function splitPhone(value) {
    const normalized = String(value || '').replace(/[^\d+]/g, '');
    const codes = countryOptions.map(([code]) => code).sort((a, b) => b.length - a.length);
    const code = codes.find((item) => normalized.startsWith(item)) || '+994';
    return { code, local: normalized.startsWith(code) ? normalized.slice(code.length).replace(/\D/g, '') : '' };
  }

  const openButton = document.createElement('button');
  openButton.id = 'checkoutOpen';
  openButton.className = 'checkout-open';
  openButton.type = 'button';
  openButton.dataset.i18n = 'orderNow';
  openButton.textContent = tr('orderNow', 'Sifariş et');
  summary.append(openButton);

  const overlay = document.createElement('div');
  overlay.className = 'checkout-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkoutTitle" tabindex="-1">
      <button class="checkout-close" type="button" aria-label="Sifariş pəncərəsini bağla">×</button>
      <div class="checkout-form-view">
        <p class="checkout-eyebrow" data-i18n="checkoutEyebrow">SİFARİŞ SORĞUSU</p>
        <h2 id="checkoutTitle" data-i18n="checkoutTitle">Sifarişi tamamlayın.</h2>
        <div class="checkout-customer-box" id="checkoutCustomerBox" hidden>
          <div class="checkout-customer-avatar" aria-hidden="true">👤</div>
          <div class="checkout-customer-details">
            <strong class="checkout-customer-name" id="checkoutCustomerName"></strong>
            <span class="checkout-customer-phone" id="checkoutCustomerPhone"></span>
            <span class="checkout-customer-username" id="checkoutCustomerUser"></span>
          </div>
        </div>
        <form id="checkoutForm">
          <fieldset class="checkout-phone-field" style="display:none;" hidden>
            <legend data-i18n="phoneLegend">Telefon nömrəsi</legend>
            <div class="checkout-phone-row">
              <label class="checkout-country"><span class="checkout-sr-only" data-i18n="countryCodeLabel">Ölkə kodu</span>
                <select name="countryCode" aria-label="Ölkə və telefon kodu">${countryOptions.map(([code, name]) => `<option value="${code}">${dyn(`${name} (${code})`)}</option>`).join('')}</select>
              </label>
              <label><span class="checkout-sr-only" data-i18n="phoneRemainderLabel">Telefon nömrəsinin qalan hissəsi</span>
                <input name="phoneLocal" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="123456789" maxlength="14" />
              </label>
            </div>
          </fieldset>
          <label><em style="font-style:normal" data-i18n="sellerNote">Satıcıya qeyd</em> <span data-i18n="optional">(istəyə bağlı)</span>
            <textarea name="note" rows="4" maxlength="1000" data-i18n-placeholder="notePlaceholder" placeholder="Sifarişlə bağlı əlavə istəyiniz varsa yazın"></textarea>
          </label>
          <div class="checkout-total"><span data-i18n="total">Cəmi</span><strong id="checkoutTotal">0.00 ₼</strong></div>
          <p class="checkout-error" role="alert" aria-live="polite"></p>
          <button class="checkout-confirm" type="submit" data-i18n="confirmCheckoutBtn">Sifarişi təsdiqlə və WhatsApp-a göndər</button>
          <p class="checkout-destination-note" data-i18n="checkoutDestinationNote">✓ Sifariş admin panelə, Telegram-a və WhatsApp-a (+994 55 645 22 04) göndərilir</p>
        </form>
      </div>
      <div class="checkout-success" hidden role="status" aria-live="polite">
        <span class="checkout-success-icon" aria-hidden="true">✓</span>
        <p class="checkout-eyebrow" data-i18n="orderReceivedEyebrow">SİFARİŞ QEYDƏ ALINDI</p>
        <h2 data-i18n="orderReceivedTitle">Sifariş sorğunuz qəbul edildi.</h2>
        <p class="checkout-reference"></p>
        <div class="checkout-wa-box">
          <p class="checkout-wa-hint" data-i18n="orderWhatsAppHint">Sifarişiniz sistemə qeyd olundu! Sürətli təsdiq üçün birbaşa WhatsApp-a göndərin:</p>
          <a class="checkout-wa-btn" id="checkoutWhatsAppBtn" target="_blank" rel="noopener noreferrer" href="#">
            <svg class="checkout-wa-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.9 11.9 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.16 1.6 5.97L0 24l6.23-1.63a11.93 11.93 0 0 0 5.83 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.43zm-8.46 18.42h-.01a9.92 9.92 0 0 1-5.06-1.39l-.36-.22-3.76.99 1-3.66-.24-.38a9.92 9.92 0 0 1-1.52-5.27c0-5.48 4.46-9.94 9.95-9.94 2.66 0 5.15 1.03 7.03 2.91a9.88 9.88 0 0 1 2.91 7.03c0 5.48-4.47 9.93-9.94 9.93zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.18.2-.35.23-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.52-.07-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.52.08-.8.38-.27.3-1.05 1.03-1.05 2.51 0 1.48 1.08 2.91 1.23 3.11.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35z"/></svg>
            <span data-i18n="sendWhatsAppBtn">WhatsApp ilə göndər</span>
          </a>
        </div>
        <p class="checkout-subnote" data-i18n="teamContactSubnote">Komandamız həmçinin göstərdiyiniz telefon nömrəsi ilə əlaqə saxlayacaq.</p>
        <button class="checkout-done" type="button" data-i18n="continueShopping">Alış-verişə davam et</button>
      </div>
    </section>`;
  document.body.append(overlay);

  const dialog = overlay.querySelector('.checkout-dialog');
  const form = overlay.querySelector('#checkoutForm');
  const errorBox = overlay.querySelector('.checkout-error');
  const confirmButton = overlay.querySelector('.checkout-confirm');
  const successView = overlay.querySelector('.checkout-success');
  const formView = overlay.querySelector('.checkout-form-view');
  let previousFocus = null;

  function readCart() {
    const cart = loadSharedCart();
    return typeof getCheckoutCartItems === 'function'
      ? getCheckoutCartItems(cart)
      : Object.entries(cart).filter(([, item]) => Number(item?.quantity) > 0)
        .map(([id, item]) => ({ ...item, id }));
  }

  function close() {
    const completed = !successView.hidden;
    overlay.hidden = true;
    document.body.classList.remove('checkout-active');
    if (completed) {
      document.querySelector('.cart-close')?.click();
      (document.querySelector('#headerCartTrigger') || document.querySelector('#cartTrigger') || document.querySelector('#floatingCartTrigger'))?.focus();
    } else previousFocus?.focus();
  }

  let currentUser = null;
  let pendingCheckoutAfterAuth = false;

  async function checkCurrentUser() {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (response.ok) {
        const data = await response.json();
        currentUser = data?.user || null;
      } else {
        currentUser = null;
      }
    } catch {
      currentUser = null;
    }
    return currentUser;
  }

  window.addEventListener('bcf:auth-changed', (event) => {
    currentUser = event.detail?.user || null;
    if (currentUser && pendingCheckoutAfterAuth) {
      pendingCheckoutAfterAuth = false;
      setTimeout(() => {
        openCheckout();
      }, 150);
    }
  });

  function openCheckout() {
    const items = readCart();
    if (!items.length) return;
    previousFocus = document.activeElement;
    formView.hidden = false;
    successView.hidden = true;
    errorBox.textContent = '';
    form.reset();

    const customerBox = overlay.querySelector('#checkoutCustomerBox');
    if (customerBox) {
      const nameEl = customerBox.querySelector('#checkoutCustomerName');
      const phoneEl = customerBox.querySelector('#checkoutCustomerPhone');
      const userEl = customerBox.querySelector('#checkoutCustomerUser');
      if (currentUser) {
        if (nameEl) nameEl.textContent = currentUser.fullName || currentUser.username || '';
        if (phoneEl) phoneEl.textContent = currentUser.phone ? `📞 ${currentUser.phone}` : (currentUser.email ? `✉️ ${currentUser.email}` : '');
        if (userEl) userEl.textContent = currentUser.username ? `@${currentUser.username}` : '';
        customerBox.hidden = false;
      } else {
        customerBox.hidden = true;
      }
    }

    if (currentUser?.phone) {
      const savedPhone = splitPhone(currentUser.phone);
      if (form.elements.countryCode) form.elements.countryCode.value = savedPhone.code;
      if (form.elements.phoneLocal) form.elements.phoneLocal.value = savedPhone.local;
    }

    overlay.querySelector('#checkoutTotal').textContent = cartTotalLabel(Object.fromEntries(items.map((item) => [item.id, item])));
    window.BCF_I18N?.translateDom?.(overlay);
    overlay.hidden = false;
    document.body.classList.add('checkout-active');
    dialog.focus();
  }

  openButton.addEventListener('click', async () => {
    const items = readCart();
    if (!items.length) {
      openButton.textContent = tr('checkoutEmptyBtn', 'Səbətiniz boşdur');
      setTimeout(() => { openButton.textContent = tr('orderNow', 'Sifariş et'); }, 2200);
      return;
    }

    const user = await checkCurrentUser();
    if (!user) {
      pendingCheckoutAfterAuth = true;
      if (window.bcfAccount?.open) {
        window.bcfAccount.open({
          mode: 'register',
          message: tr('checkoutAuthPrompt', 'Sifariş vermək üçün zəhmət olmasa hesabınıza daxil olun və ya qeydiyyatdan keçin.'),
        });
      } else {
        const trigger = document.getElementById('accountTrigger');
        if (trigger) trigger.click();
      }
      return;
    }

    openCheckout();
  });

  const WHATSAPP_TARGET_NUMBER = '994556452204';

  function formatWhatsAppOrderMessage({ orderId, phone, note, items, total }) {
    const lines = [
      '☕ *Baku Coffee Factory — Yeni Sifariş*',
      `📋 *Sifariş №:* ${orderId || 'Yeni'}`,
      `📞 *Müştəri Tel:* ${phone}`,
      '',
      '*Sifariş edilən məhsullar:*',
    ];

    (items || []).forEach((item, index) => {
      const qty = item.unit === 'g' || item.unit === 'q'
        ? `${item.quantity} q`
        : `${item.quantity} ədəd`;
      let line = `${index + 1}. *${item.name || item.id}* — ${qty}`;
      const itemTotal = typeof getCartItemTotal === 'function'
        ? getCartItemTotal(item)
        : (item.total ?? (item.price ? item.price * item.quantity : null));
      if (itemTotal != null && itemTotal > 0) {
        line += ` (${Number(itemTotal).toFixed(2)} ₼)`;
      } else if (item.quoteRequired || item.price == null) {
        line += ` (Qiymət dəqiqləşdiriləcək)`;
      }
      lines.push(line);
    });

    lines.push('');
    if (total != null && total > 0) {
      lines.push(`💰 *Cəmi məbləğ:* ${Number(total).toFixed(2)} ₼`);
    }
    if (note && note.trim()) {
      lines.push(`📝 *Qeyd:* ${note.trim()}`);
    }
    lines.push('');
    lines.push('Salam! Saytdan sifariş verdim, zəhmət olmasa təsdiqləyəsiniz.');

    return lines.join('\n');
  }

  function getWhatsAppUrl(orderData) {
    const text = formatWhatsAppOrderMessage(orderData);
    return `https://wa.me/${WHATSAPP_TARGET_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.textContent = '';
    if (location.protocol === 'file:') {
      errorBox.textContent = tr('checkoutFileError', 'Sifariş göndərmək üçün saytı fayl kimi deyil, işləyən server ünvanından açın.');
      return;
    }

    const user = await checkCurrentUser();
    if (!user) {
      errorBox.textContent = tr('checkoutAuthRequired', 'Sifariş göndərmək üçün zəhmət olmasa hesaba daxil olun.');
      pendingCheckoutAfterAuth = true;
      if (window.bcfAccount?.open) {
        window.bcfAccount.open({ mode: 'register', message: tr('checkoutAuthPrompt', 'Sifariş vermək üçün hesaba daxil olun və ya qeydiyyatdan keçin.') });
      }
      return;
    }

    const localDigits = form.elements.phoneLocal ? form.elements.phoneLocal.value.replace(/\D/g, '') : '';
    const formPhone = form.elements.countryCode && localDigits ? `${form.elements.countryCode.value}${localDigits}` : '';
    const phone = user.phone || formPhone;
    if (!phone || !/^\+[1-9]\d{6,14}$/.test(phone)) {
      errorBox.textContent = tr('checkoutNoPhoneError', 'Hesabınızda qeydiyyatdan keçmiş telefon nömrəsi tapılmadı.');
      return;
    }

    const cartSnapshot = readCart();
    const items = cartSnapshot.map(({ id, quantity }) => ({ id, quantity }));
    if (!items.length) { errorBox.textContent = tr('checkoutEmptyError', 'Səbətiniz boşdur.'); return; }
    confirmButton.disabled = true;
    confirmButton.textContent = tr('checkoutSubmittingBtn', 'Sifariş göndərilir…');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone, note: form.elements.note.value.trim(), items,
          expectedTotal: Math.round(cartSnapshot.reduce((sum, item) => sum + getCartItemTotal(item), 0) * 100) / 100 }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || tr('checkoutGenericError', 'Sifarişi göndərmək mümkün olmadı. Yenidən cəhd edin.'));

      const note = form.elements.note.value.trim();
      const itemsForWhatsApp = result.items && result.items.length ? result.items : cartSnapshot;
      const totalForWhatsApp = result.total ?? Math.round(cartSnapshot.reduce((sum, item) => sum + getCartItemTotal(item), 0) * 100) / 100;
      const waUrl = getWhatsAppUrl({
        orderId: result.orderId,
        phone,
        note,
        items: itemsForWhatsApp,
        total: totalForWhatsApp,
      });

      const waBtn = successView.querySelector('#checkoutWhatsAppBtn');
      if (waBtn) {
        waBtn.href = waUrl;
      }

      window.dispatchEvent(new CustomEvent('bcf:orders-changed', { detail: { id: result.orderId } }));
      saveSharedCart({});
      formView.hidden = true;
      successView.hidden = false;
      successView.querySelector('.checkout-reference').textContent = `${tr('orderReferencePrefix', 'Sifariş nömrəsi:')} ${result.orderId}`;
      window.BCF_I18N?.translateDom?.(overlay);
      successView.querySelector('.checkout-done').focus();

      try {
        window.open(waUrl, '_blank');
      } catch {}
    } catch (error) {
      errorBox.textContent = error.message;
    } finally {
      confirmButton.disabled = false;
      confirmButton.textContent = tr('confirmCheckoutBtn', 'Sifarişi təsdiqlə və WhatsApp-a göndər');
    }
  });

  overlay.querySelector('.checkout-close').addEventListener('click', close);
  overlay.querySelector('.checkout-done').addEventListener('click', close);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
    if (event.key !== 'Tab') return;
    const focusables = [...overlay.querySelectorAll('button, input, select, textarea')].filter((element) => !element.closest('[hidden]'));
    if (event.shiftKey && document.activeElement === focusables[0]) { event.preventDefault(); focusables.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === focusables.at(-1)) { event.preventDefault(); focusables[0].focus(); }
  });

  window.BCF_I18N?.translateDom?.(overlay);
  window.BCF_I18N?.translateDom?.(openButton);
  window.dispatchEvent(new CustomEvent('bcf:ui-mounted'));
  window.addEventListener('bcf:language-changed', () => {
    overlay.querySelectorAll('select[name="countryCode"] option').forEach((opt) => {
      const entry = countryOptions.find(([code]) => code === opt.value);
      if (entry) opt.textContent = dyn(`${entry[1]} (${entry[0]})`);
    });
    const items = readCart();
    const totalEl = overlay.querySelector('#checkoutTotal');
    if (totalEl && items.length) totalEl.textContent = cartTotalLabel(Object.fromEntries(items.map((item) => [item.id, item])));
    window.BCF_I18N?.translateDom?.(overlay);
    window.BCF_I18N?.translateDom?.(openButton);
  });
})();
