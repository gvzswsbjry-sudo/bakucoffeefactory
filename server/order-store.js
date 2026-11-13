'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

function bad(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

function stripCategoryPrefix(value, category) {
  const prefix = `${category}-`;
  let normalized = String(value || '').trim();
  while (normalized.startsWith(prefix)) normalized = normalized.slice(prefix.length);
  return normalized;
}

function resolveOrderSelection(rawId, products) {
  const id = String(rawId || '').trim();
  if (!id) return {};

  if (id === 'custom-blend' || id.startsWith('coffee-custom-blend') || id.startsWith('custom-blend')) {
    const baseCoffee = products.find((entry) => entry.category === 'coffee' && entry.active) || { price: 14 };
    return {
      product: {
        id: 'custom-blend',
        category: 'coffee',
        name: 'Fərdi Qəhvə Blendi',
        price: Number(baseCoffee.price) || 14,
        unit: 'g',
        active: true,
        image: 'assets/coffee/cart-coffee-beans.png',
        stock: { status: 'available', quantity: null },
      },
      canonicalId: id,
    };
  }

  for (const category of ['coffee', 'tea']) {
    const hasPrefix = id.startsWith(`${category}-`);
    const candidateId = stripCategoryPrefix(id, category);
    const product = products.find((entry) => entry.category === category &&
      (entry.id === candidateId || (!hasPrefix && entry.id === id)));
    if (product) return { product, canonicalId: `${category}-${product.id}` };
  }

  const product = products.find((entry) => entry.category === 'equipment' &&
    (entry.id === id || entry.variants?.some((candidate) => candidate.id === id)));
  if (!product) return {};
  const variant = product.variants?.find((candidate) => candidate.id === id)
    || (product.id === id ? product.variants?.find((candidate) => candidate.active !== false) : undefined);
  return { product, variant, canonicalId: variant?.id || product.id };
}

function prepareOrder(payload, products) {
  const phone = String(payload?.phone || '').replace(/[\s().-]/g, '');
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) bad('Telefon nömrəsini ölkə kodu ilə daxil edin.');
  const note = String(payload?.note || '').trim();
  if (note.length > 1000) bad('Qeyd maksimum 1000 simvol ola bilər.');
  const requested = payload?.items;
  if (!Array.isArray(requested) || !requested.length || requested.length > 50) bad('Səbətdə 1–50 məhsul olmalıdır.');
  const seen = new Set();
  const items = requested.map((selection) => {
    const { product, variant, canonicalId } = resolveOrderSelection(selection?.id, products);
    if (!product || !product.active || product.stock?.status === 'out' ||
      (product.stock?.status === 'counted' && Number(product.stock.quantity) <= 0) ||
      (variant && variant.active === false)) bad('Məhsul tapılmadı və ya hazırda satışda deyil.');
    if (seen.has(canonicalId)) bad('Eyni məhsul səbətdə təkrarlana bilməz.');
    seen.add(canonicalId);
    const unit = product.category === 'equipment' ? 'piece' : product.unit;
    const quantity = Number(selection?.quantity);
    const max = unit === 'g' ? (product.category === 'coffee' ? 2000 : 1000) : 99;
    if (!Number.isInteger(quantity) || quantity < (unit === 'g' ? 5 : 1) || quantity > max || (unit === 'g' && quantity % 5 !== 0)) bad('Məhsul miqdarı düzgün deyil.');
    const price = Number(variant?.price ?? product.price);
    const quoteRequired = product.category === 'tea' && product.meta?.pricePending === true && !(price > 0);
    if (!quoteRequired && (!Number.isFinite(price) || price <= 0)) bad('Məhsul qiyməti düzgün deyil.');
    const total = quoteRequired ? null : Math.round((unit === 'g' ? price * quantity / 100 : price * quantity) * 100) / 100;
    const itemName = variant
      ? `${product.name} · ${variant.name}`
      : (product.id === 'custom-blend' && selection?.name ? String(selection.name).slice(0, 120) : product.name);
    return { id: canonicalId, productId: product.id, name: itemName,
      category: product.category, image: variant?.image || product.image, unit, quantity,
      price: quoteRequired ? null : price, total, quoteRequired };
  });
  const total = Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
  if (payload.expectedTotal !== undefined && Math.abs(Number(payload.expectedTotal) - total) > 0.009) {
    const error = new Error('Qiymətlər dəyişib. Səbəti yeniləyib yenidən yoxlayın.');
    error.status = 409;
    throw error;
  }
  return { phone, note, items, total, quoteRequired: items.some((item) => item.quoteRequired), status: 'new' };
}

function createOrderStore({ filePath }) {
  let queue = Promise.resolve();
  async function list() {
    try {
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      if (!Array.isArray(data)) throw new Error('Order data is invalid');
      return data;
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }
  async function write(orders) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const temp = `${filePath}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    await fs.writeFile(temp, `${JSON.stringify(orders, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    try { await fs.rename(temp, filePath); } catch (error) { await fs.unlink(temp).catch(() => {}); throw error; }
  }
  function create(order) {
    const operation = queue.then(async () => {
      const orders = await list();
      const saved = {
        id: `BCF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        createdAt: new Date().toISOString(),
        telegramNotified: false,
        ...order,
      };
      orders.unshift(saved);
      await write(orders);
      return saved;
    });
    queue = operation.catch(() => {});
    return operation;
  }
  function updateStatus(id, status) {
    const operation = queue.then(async () => {
      if (!['new', 'shipped'].includes(status)) bad('Sifariş statusu düzgün deyil.');
      const orders = await list();
      const index = orders.findIndex((order) => order.id === id);
      if (index < 0) return null;
      orders[index] = { ...orders[index], status, statusUpdatedAt: new Date().toISOString() };
      await write(orders);
      return orders[index];
    });
    queue = operation.catch(() => {});
    return operation;
  }
  function markNotified(id) {
    const operation = queue.then(async () => {
      const orders = await list();
      const index = orders.findIndex((order) => order.id === id);
      if (index < 0) return null;
      orders[index] = {
        ...orders[index],
        telegramNotified: true,
        telegramNotifiedAt: new Date().toISOString(),
      };
      await write(orders);
      return orders[index];
    });
    queue = operation.catch(() => {});
    return operation;
  }
  return { list, create, updateStatus, markNotified };
}

module.exports = { prepareOrder, createOrderStore, resolveOrderSelection };
