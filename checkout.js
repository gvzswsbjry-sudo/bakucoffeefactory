(() => {
  const summary = document.querySelector('.cart-summary');
  if (!summary || document.getElementById('checkoutOpen')) return;

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
  openButton.textContent = 'Sifariş et';
  summary.append(openButton);

  const overlay = document.createElement('div');
  overlay.className = 'checkout-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkoutTitle" tabindex="-1">
      <button class="checkout-close" type="button" aria-label="Sifariş pəncərəsini bağla">×</button>
      <div class="checkout-form-view">
        <p class="checkout-eyebrow">SİFARİŞ SORĞUSU</p>
        <h2 id="checkoutTitle">Sifarişi tamamlayın.</h2>
        <p class="checkout-intro">Əlaqə nömrənizi qeyd edin. Komandamız sifarişinizi və mövcudluğu sizinlə dəqiqləşdirəcək.</p>
        <form id="checkoutForm">
          <fieldset class="checkout-phone-field">
            <legend>Telefon nömrəsi</legend>
            <div class="checkout-phone-row">
              <label class="checkout-country"><span class="checkout-sr-only">Ölkə kodu</span>
                <select name="countryCode" aria-label="Ölkə və telefon kodu">${countryOptions.map(([code, name]) => `<option value="${code}">${name} (${code})</option>`).join('')}</select>
              </label>
              <label><span class="checkout-sr-only">Telefon nömrəsinin qalan hissəsi</span>
                <input name="phoneLocal" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="123456789" maxlength="14" required />
              </label>
            </div>
          </fieldset>
          <label>Satıcıya qeyd <span>(istəyə bağlı)</span>
            <textarea name="note" rows="4" maxlength="1000" placeholder="Sifarişlə bağlı əlavə istəyiniz varsa yazın"></textarea>
          </label>
          <div class="checkout-total"><span>Cəmi</span><strong id="checkoutTotal">0.00 ₼</strong></div>
          <p class="checkout-error" role="alert" aria-live="polite"></p>
          <button class="checkout-confirm" type="submit">Sifarişi təsdiqlə</button>
        </form>
      </div>
      <div class="checkout-success" hidden role="status" aria-live="polite">
        <span class="checkout-success-icon" aria-hidden="true">✓</span>
        <p class="checkout-eyebrow">SİFARİŞ QEYDƏ ALINDI</p>
        <h2>Sifariş sorğunuz qəbul edildi.</h2>
        <p>Seçdiyiniz məhsulları nəzərdən keçirəcəyik. Təsdiq və növbəti addımlar üçün göstərdiyiniz telefon nömrəsi ilə əlaqə saxlayacağıq.</p>
        <p class="checkout-reference"></p>
        <button class="checkout-done" type="button">Alış-verişə davam et</button>
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

  openButton.addEventListener('click', async () => {
    const items = readCart();
    if (!items.length) {
      openButton.textContent = 'Səbətiniz boşdur';
      setTimeout(() => { openButton.textContent = 'Sifariş et'; }, 2200);
      return;
    }
    previousFocus = document.activeElement;
    formView.hidden = false;
    successView.hidden = true;
    errorBox.textContent = '';
    form.reset();
    form.elements.countryCode.value = '+994';
    overlay.querySelector('#checkoutTotal').textContent = cartTotalLabel(Object.fromEntries(items.map((item) => [item.id, item])));
    overlay.hidden = false;
    document.body.classList.add('checkout-active');
    dialog.focus();
    try {
      const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (response.ok && !overlay.hidden) {
        const data = await response.json();
        if (data.user?.phone && !form.elements.phoneLocal.value) {
          const savedPhone = splitPhone(data.user.phone);
          form.elements.countryCode.value = savedPhone.code;
          form.elements.phoneLocal.value = savedPhone.local;
        }
      }
    } catch {}
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.textContent = '';
    if (location.protocol === 'file:') {
      errorBox.textContent = 'Sifariş göndərmək üçün saytı fayl kimi deyil, işləyən server ünvanından açın.';
      return;
    }
    const localDigits = form.elements.phoneLocal.value.replace(/\D/g, '');
    const phone = `${form.elements.countryCode.value}${localDigits}`;
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      errorBox.textContent = 'Ölkə kodunu seçin və telefon nömrəsinin qalan rəqəmlərini daxil edin.';
      form.elements.phoneLocal.focus();
      return;
    }
    const cartSnapshot = readCart();
    const items = cartSnapshot.map(({ id, quantity }) => ({ id, quantity }));
    if (!items.length) { errorBox.textContent = 'Səbətiniz boşdur.'; return; }
    confirmButton.disabled = true;
    confirmButton.textContent = 'Sifariş göndərilir…';
    try {
      const response = await fetch('/api/orders', {
        method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone, note: form.elements.note.value.trim(), items,
          expectedTotal: Math.round(cartSnapshot.reduce((sum, item) => sum + getCartItemTotal(item), 0) * 100) / 100 }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Sifarişi göndərmək mümkün olmadı. Yenidən cəhd edin.');
      window.dispatchEvent(new CustomEvent('bcf:orders-changed', { detail: { id: result.orderId } }));
      saveSharedCart({});
      formView.hidden = true;
      successView.hidden = false;
      successView.querySelector('.checkout-reference').textContent = `Sifariş nömrəsi: ${result.orderId}`;
      successView.querySelector('.checkout-done').focus();
    } catch (error) {
      errorBox.textContent = error.message;
    } finally {
      confirmButton.disabled = false;
      confirmButton.textContent = 'Sifarişi təsdiqlə';
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
})();
