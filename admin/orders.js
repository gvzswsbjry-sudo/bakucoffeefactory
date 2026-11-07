(() => {
  const list = document.getElementById('ordersList');
  const message = document.getElementById('ordersMessage');
  const filter = document.getElementById('orderStatusFilter');
  const refreshBtn = document.getElementById('manualRefreshBtn');
  let orders = [];
  let knownIds = new Set();
  let newlyArrivedIds = new Set();
  let isFirstLoad = true;
  let isFetching = false;
  let pollInterval = null;

  const money = (value) => `${Number(value || 0).toFixed(2)} ₼`;
  const totalLabel = (value, quoteRequired = false) => {
    const known = Number(value || 0);
    if (!quoteRequired) return money(known);
    return known > 0 ? `${money(known)} + qiymət təsdiqlənəcək` : 'Qiymət təsdiqlənəcək';
  };
  const normalizedStatus = (order) => order.status === 'shipped' ? 'shipped' : 'new';
  const element = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = String(value);
    return node;
  };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

  function playAlertSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  function render() {
    list.innerHTML = '';
    const visible = orders.filter((order) => filter.value === 'all' || normalizedStatus(order) === filter.value);
    const remaining = orders.filter((order) => normalizedStatus(order) === 'new').length;
    const shipped = orders.length - remaining;
    message.className = '';
    message.textContent = orders.length
      ? `${remaining} qalıb · ${shipped} göndərilib · cəmi ${orders.length} sifariş`
      : 'Hələ sifariş yoxdur.';
    if (orders.length && !visible.length) list.append(element('p', 'orders-empty', 'Bu statusda sifariş yoxdur.'));
    visible.forEach((order) => {
      const status = normalizedStatus(order);
      const isNewArrival = newlyArrivedIds.has(order.id);
      const card = element('article', `order-card ${status}${isNewArrival ? ' newly-arrived' : ''}`);
      card.dataset.orderId = order.id;
      const top = element('div', 'order-top');
      const heading = element('div');
      heading.append(element('h2', '', order.id));
      const time = element('time', '', new Date(order.createdAt).toLocaleString('az-AZ'));
      time.dateTime = order.createdAt;
      heading.append(time);
      top.append(heading, element('strong', '', totalLabel(order.total, order.quoteRequired)));
      const customerBox = element('div', 'order-customer-box');
      const customerName = order.customerName || order.fullName;
      const parts = [];
      if (customerName) parts.push(`<span>👤 <strong>${escapeHtml(customerName)}</strong></span>`);
      if (order.username) parts.push(`<span>🏷 <strong>@${escapeHtml(order.username)}</strong></span>`);
      if (order.email) parts.push(`<span>✉️ <a href="mailto:${escapeHtml(order.email)}">${escapeHtml(order.email)}</a></span>`);
      if (parts.length) {
        customerBox.innerHTML = parts.join(' · ');
      }
      const contact = element('div', 'order-contact');
      const phone = element('a', '', order.phone);
      phone.href = `tel:${order.phone}`;
      const badge = element('span', `order-status ${status}`, status === 'shipped' ? 'Göndərildi' : 'Göndərilməyib');
      const action = element('button', `order-status-action ${status === 'shipped' ? 'undo' : ''}`,
        status === 'shipped' ? 'Göndərilməyib kimi qaytar' : 'Sifariş göndərildi');
      action.type = 'button';
      action.dataset.statusOrder = order.id;
      action.dataset.nextStatus = status === 'shipped' ? 'new' : 'shipped';
      contact.append(phone, badge, action);
      const items = element('ul', 'order-items');
      (order.items || []).forEach((item) => {
        const row = element('li');
        if (/^assets\/[a-zA-Z0-9/_\-.]+$/.test(item.image || '')) {
          const img = document.createElement('img');
          img.src = `../${item.image}`;
          img.alt = '';
          row.append(img);
        }
        row.append(
          element('span', '', `${item.name} · ${item.quantity} ${item.unit === 'g' ? 'q' : 'ədəd'}`),
          element('strong', '', totalLabel(item.total, item.quoteRequired)),
        );
        items.append(row);
      });
      card.append(top);
      if (parts.length) card.append(customerBox);
      card.append(contact, items);
      if (order.note) card.append(element('p', 'order-note', `Satıcıya qeyd: ${order.note}`));
      list.append(card);
    });
  }

  async function updateStatus(button) {
    button.disabled = true;
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(button.dataset.statusOrder)}`, {
        method: 'PATCH', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: button.dataset.nextStatus }),
      });
      if (response.status === 401) { location.href = './'; return; }
      if (!response.ok) throw new Error('Sifariş statusunu dəyişmək mümkün olmadı.');
      const updated = await response.json();
      orders = orders.map((order) => order.id === updated.id ? updated : order);
      render();
    } catch (error) {
      button.disabled = false;
      message.className = 'order-error';
      message.textContent = error.message;
    }
  }

  async function load({ isPoll = false } = {}) {
    if (isFetching) return;
    isFetching = true;
    try {
      const response = await fetch('/api/admin/orders', { credentials: 'same-origin' });
      if (response.status === 401) { location.href = './'; return; }
      if (!response.ok) throw new Error('Sifarişləri yükləmək mümkün olmadı.');
      const incoming = await response.json();

      if (isFirstLoad) {
        orders = incoming;
        incoming.forEach((o) => knownIds.add(o.id));
        isFirstLoad = false;
        render();
      } else {
        const brandNew = incoming.filter((o) => !knownIds.has(o.id));
        let changed = brandNew.length > 0 || incoming.length !== orders.length;

        if (!changed) {
          for (let i = 0; i < incoming.length; i++) {
            if (incoming[i].id !== orders[i]?.id || incoming[i].status !== orders[i]?.status) {
              changed = true;
              break;
            }
          }
        }

        if (changed) {
          if (brandNew.length > 0) {
            brandNew.forEach((o) => {
              knownIds.add(o.id);
              newlyArrivedIds.add(o.id);
            });
            playAlertSound();
            setTimeout(() => {
              newlyArrivedIds.clear();
            }, 4000);
          }
          orders = incoming;
          render();
        }
      }
    } catch (error) {
      if (!isPoll) {
        message.className = 'order-error';
        message.textContent = error.message;
      }
    } finally {
      isFetching = false;
    }
  }

  filter.addEventListener('change', render);
  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-status-order]');
    if (button) updateStatus(button);
  });
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.disabled = true;
      load().finally(() => {
        setTimeout(() => { refreshBtn.disabled = false; }, 600);
      });
    });
  }

  // Səhifə açılanda dərhal yüklə
  load();

  // Hər 4 saniyədən bir avtomatik yoxlayır, səhifəni yeniləməyə ehtiyac qalmır
  pollInterval = setInterval(() => load({ isPoll: true }), 4000);
  window.addEventListener('focus', () => load({ isPoll: true }));
})();
