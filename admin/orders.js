(() => {
  const list = document.getElementById('ordersList');
  const message = document.getElementById('ordersMessage');
  const filter = document.getElementById('orderStatusFilter');
  let orders = [];
  const money = (value) => `${Number(value || 0).toFixed(2)} ₼`;
  const normalizedStatus = (order) => order.status === 'shipped' ? 'shipped' : 'new';
  const element = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = String(value);
    return node;
  };

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
      const card = element('article', `order-card ${status}`);
      card.dataset.orderId = order.id;
      const top = element('div', 'order-top');
      const heading = element('div');
      heading.append(element('h2', '', order.id));
      const time = element('time', '', new Date(order.createdAt).toLocaleString('az-AZ'));
      time.dateTime = order.createdAt;
      heading.append(time);
      top.append(heading, element('strong', '', money(order.total)));
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
        row.append(element('span', '', `${item.name} · ${item.quantity} ${item.unit === 'g' ? 'q' : 'ədəd'}`), element('strong', '', money(item.total)));
        items.append(row);
      });
      card.append(top, contact, items);
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

  async function load() {
    try {
      const response = await fetch('/api/admin/orders', { credentials: 'same-origin' });
      if (response.status === 401) { location.href = './'; return; }
      if (!response.ok) throw new Error('Sifarişləri yükləmək mümkün olmadı.');
      orders = await response.json();
      render();
    } catch (error) {
      message.className = 'order-error';
      message.textContent = error.message;
    }
  }

  filter.addEventListener('change', render);
  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-status-order]');
    if (button) updateStatus(button);
  });
  load();
})();
