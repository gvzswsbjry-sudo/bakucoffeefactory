'use strict';

/**
 * Baku Coffee Factory - Telegram Sifariş Bildirişçisi
 * 
 * Yeni sifariş daxil olduqda Telegram botu vasitəsilə dərhal adminə
 * ətraflı bildiriş mesajı göndərir.
 */

function formatOrderMessage(order, options = {}) {
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

async function sendTelegramNotification(order, {
  botToken = process.env.TELEGRAM_BOT_TOKEN,
  chatId = process.env.TELEGRAM_CHAT_ID,
} = {}) {
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

async function sendTestMessage({
  botToken = process.env.TELEGRAM_BOT_TOKEN,
  chatId = process.env.TELEGRAM_CHAT_ID,
} = {}) {
  if (!botToken || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN və ya TELEGRAM_CHAT_ID tapılmadı.');
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '☕ <b>Baku Coffee Factory</b>\n\n✅ Təbriklər! Telegram bildiriş botu uğurla qoşuldu. İndi saytdan gələn bütün sifarişlər birbaşa bura göndəriləcək!',
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

module.exports = {
  sendTelegramNotification,
  formatOrderMessage,
  sendTestMessage,
};
