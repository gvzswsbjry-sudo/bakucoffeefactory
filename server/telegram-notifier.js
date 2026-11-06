'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Baku Coffee Factory - Telegram Sifariş Bildirişçisi
 * 
 * Yeni sifariş daxil olduqda Telegram botu vasitəsilə dərhal adminə
 * ətraflı bildiriş mesajı göndərir.
 * Həmçinin arxa planda hər 5 saniyədən bir sifarişləri yoxlayaraq
 * çatdırılmamış sifariş qalmadığına əmin olur.
 */

const DEFAULT_BOT_TOKEN = '9001088933:AAGNDuXbV2cf2cKt7AqeAMVsf0HmSINCRRg';
const DEFAULT_CHAT_ID = '7106879887';

function getEnvValue(key, fallback = '') {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq > 0 && line.slice(0, eq).trim() === key) {
          let val = line.slice(eq + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
          return val;
        }
      }
    }
  } catch {}
  return fallback;
}

function getBotCredentials(options = {}) {
  const botToken = options.botToken ||
    options.token ||
    process.env.TELEGRAM_BOT_TOKEN ||
    getEnvValue('TELEGRAM_BOT_TOKEN', DEFAULT_BOT_TOKEN);

  const chatId = options.chatId ||
    options.targetChatId ||
    process.env.TELEGRAM_CHAT_ID ||
    getEnvValue('TELEGRAM_CHAT_ID', DEFAULT_CHAT_ID);

  return { botToken, chatId };
}

function isTestEnvironment() {
  return process.env.NODE_ENV === 'test' ||
    process.execArgv.includes('--test') ||
    Boolean(process.env.npm_lifecycle_event && process.env.npm_lifecycle_event.includes('test')) ||
    process.argv.some((arg) => typeof arg === 'string' && (arg.includes('test') || arg.includes('node:test')));
}

function formatOrderMessage(order) {
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleString('az-AZ', {
    timeZone: 'Asia/Baku',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemsList = (order.items || []).map((item, index) => {
    const qty = item.unit === 'g' ? `${item.quantity} q` : `${item.quantity} ədəd`;
    const priceStr = item.quoteRequired ? 'Qiymət sorğusu' : `${(item.total ?? 0).toFixed(2)} ₼`;
    return `  <b>${index + 1}.</b> ${escapeHtml(item.name)} — <code>${qty}</code> (${priceStr})`;
  }).join('\n');

  const totalStr = order.quoteRequired
    ? '<i>Dəqiqləşdirilməli (Sorğu)</i>'
    : `<b>${Number(order.total || 0).toFixed(2)} ₼</b>`;

  const noteStr = order.note ? `\n📝 <b>Müştəri qeydi:</b>\n<i>${escapeHtml(order.note)}</i>` : '';
  const phoneClean = String(order.phone || '').replace(/[^\d+]/g, '');

  return `🔔 <b>YENİ SİFARİŞ! #${escapeHtml(order.id)}</b>
━━━━━━━━━━━━━━━━━━━━
⏰ <b>Tarix:</b> ${dateStr}
📞 <b>Telefon:</b> <a href="tel:${phoneClean}">${escapeHtml(order.phone)}</a>
💰 <b>Ümumi məbləğ:</b> ${totalStr}
${noteStr}

📦 <b>Sifariş edilən məhsullar:</b>
${itemsList || '<i>Məhsul siyahısı boşdur</i>'}
━━━━━━━━━━━━━━━━━━━━
<i>Baku Coffee Factory İdarəetmə</i>`;
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramNotification(order, options = {}) {
  if (isTestEnvironment() && !options.forceNetwork) {
    return { ok: true, skipped: true, reason: 'test-environment' };
  }

  const { botToken, chatId } = getBotCredentials(options);
  if (!botToken || !chatId) {
    return { ok: false, skipped: true, reason: 'TELEGRAM_BOT_TOKEN və ya TELEGRAM_CHAT_ID təyin edilməyib.' };
  }

  const message = formatOrderMessage(order);
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const phoneDigits = String(order.phone || '').replace(/\D/g, '');
  const buttons = [];
  if (phoneDigits) {
    buttons.push({ text: '💬 WhatsApp-la əlaqə', url: `https://wa.me/${phoneDigits}` });
  }

  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };
  if (buttons.length) {
    payload.reply_markup = { inline_keyboard: [buttons] };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      console.warn('[Telegram Notification] Xəta:', data.description || response.statusText);
      return { ok: false, error: data.description || response.statusText };
    }

    return { ok: true, messageId: data.result?.message_id };
  } catch (err) {
    console.warn('[Telegram Notification] Şəbəkə xətası:', err.message);
    return { ok: false, error: err.message };
  }
}

async function sendTestMessage(options = {}) {
  const { botToken, chatId } = getBotCredentials(options);
  if (!botToken || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN və ya TELEGRAM_CHAT_ID tapılmadı.');
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '☕ <b>Baku Coffee Factory</b>\n\n✅ Təbriklər! Telegram bildiriş botu aktivdir. Sifarişlər həm anında, həm də arxa plan yoxlayıcısı ilə telefonunuza çatdırılacaq!',
      parse_mode: 'HTML',
    }),
    signal: AbortSignal.timeout(8000),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(data.description || response.statusText);
  }
  return data.result;
}

let watcherTimer = null;
let isChecking = false;

async function checkAndNotifyOrders(ordersStore, options = {}) {
  if (isChecking || !ordersStore) return { checked: 0, sent: 0 };
  isChecking = true;
  let sentCount = 0;
  try {
    const list = await ordersStore.list();
    if (!Array.isArray(list) || list.length === 0) return { checked: 0, sent: 0 };

    const now = Date.now();
    // Son 24 saatda gələn və hələ Telegram-a göndərilməyən sifarişləri tapırıq
    const pending = list.filter((order) => {
      if (order.telegramNotified === true) return false;
      const createdTime = new Date(order.createdAt).getTime();
      // Tarix düzgün deyilsə və ya 24 saatdan köhnədirsə bildiriş göndərmirik
      if (isNaN(createdTime) || (now - createdTime) > 24 * 60 * 60 * 1000) return false;
      return true;
    });

    for (const order of pending) {
      console.log(`[Telegram Watcher] Yeni sifariş aşkarlandı: ${order.id}. Telegram-a göndərilir...`);
      const result = await sendTelegramNotification(order, options);
      if (result.ok) {
        sentCount++;
        if (typeof ordersStore.markNotified === 'function') {
          await ordersStore.markNotified(order.id);
        } else {
          order.telegramNotified = true;
        }
        console.log(`[Telegram Watcher] Sifariş bildirişi çatdırıldı: ${order.id}`);
      } else {
        console.warn(`[Telegram Watcher] Sifariş göndərilə bilmədi (${order.id}):`, result.error || result.reason);
      }
    }
    return { checked: list.length, pending: pending.length, sent: sentCount };
  } catch (err) {
    console.warn('[Telegram Watcher] Yoxlama xətası:', err.message);
    return { checked: 0, sent: sentCount, error: err.message };
  } finally {
    isChecking = false;
  }
}

function startOrderWatcher(ordersStore, { intervalMs = 5000, initialDelayMs = 2000 } = {}) {
  if (watcherTimer) clearInterval(watcherTimer);
  if (!ordersStore) return null;

  const initialTimer = setTimeout(() => {
    checkAndNotifyOrders(ordersStore).catch(() => {});
  }, initialDelayMs);
  if (initialTimer && typeof initialTimer.unref === 'function') {
    initialTimer.unref();
  }

  watcherTimer = setInterval(() => {
    checkAndNotifyOrders(ordersStore).catch(() => {});
  }, intervalMs);

  if (watcherTimer && typeof watcherTimer.unref === 'function') {
    watcherTimer.unref();
  }
  return watcherTimer;
}

function stopOrderWatcher() {
  if (watcherTimer) {
    clearInterval(watcherTimer);
    watcherTimer = null;
  }
}

function getTelegramStatus() {
  const { botToken, chatId } = getBotCredentials();
  return {
    configured: Boolean(botToken && chatId),
    hasToken: Boolean(botToken),
    chatId: chatId ? `${chatId.slice(0, 3)}***` : null,
    fullChatId: chatId || null,
    botUsername: '@Bfc_order_bot',
    watcherActive: Boolean(watcherTimer),
  };
}

module.exports = {
  sendTelegramNotification,
  formatOrderMessage,
  sendTestMessage,
  checkAndNotifyOrders,
  startOrderWatcher,
  stopOrderWatcher,
  getTelegramStatus,
  getBotCredentials,
};
