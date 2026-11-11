'use strict';

const crypto = require('node:crypto');
const net = require('node:net');
const tls = require('node:tls');
const {
  escapeHtml,
  getBotCredentials,
  isTestEnvironment,
  sendToSingleChat,
} = require('./telegram-notifier');

function sanitizeHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function extractEmailAddress(value) {
  const clean = sanitizeHeader(value);
  const angled = clean.match(/<([^<>\s]+@[^<>\s]+)>/);
  return angled ? angled[1] : clean;
}

function encodeRfc2047(value) {
  const clean = sanitizeHeader(value);
  if (/^[\x20-\x7e]*$/.test(clean)) return clean;
  return `=?UTF-8?B?${Buffer.from(clean, 'utf8').toString('base64')}?=`;
}

function wrapBase64(text) {
  const b64 = Buffer.from(String(text || ''), 'utf8').toString('base64');
  return b64.match(/.{1,76}/g)?.join('\r\n') || '';
}

function getEmailConfig(env = process.env) {
  const gmailUser = sanitizeHeader(env.GMAIL_USER || '');
  const gmailAppPassword = String(env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  const smtpHost = sanitizeHeader(env.SMTP_HOST || (gmailUser && gmailAppPassword ? 'smtp.gmail.com' : ''));
  const smtpPort = Number(env.SMTP_PORT || 465);
  const smtpUser = sanitizeHeader(env.SMTP_USER || gmailUser);
  const smtpPass = String(env.SMTP_PASS || gmailAppPassword || '');
  const smtpFrom = sanitizeHeader(env.SMTP_FROM || (smtpUser ? `Baku Coffee Factory <${smtpUser}>` : ''));

  const resendApiKey = sanitizeHeader(env.RESEND_API_KEY || '');
  const resendFrom = sanitizeHeader(
    env.RESEND_FROM || (gmailUser ? `Baku Coffee Factory <${gmailUser}>` : 'Baku Coffee Factory <onboarding@resend.dev>')
  );

  const hasSmtp = Boolean(smtpHost && smtpUser && smtpPass && Number.isInteger(smtpPort) && smtpPort > 0);
  const hasResend = Boolean(resendApiKey);

  return {
    configured: hasSmtp || hasResend,
    smtp: hasSmtp ? { host: smtpHost, port: smtpPort, secure: env.SMTP_SECURE === '1' || smtpPort === 465, user: smtpUser, pass: smtpPass, from: smtpFrom } : null,
    resend: hasResend ? { apiKey: resendApiKey, from: resendFrom } : null,
  };
}

function isEmailTransportConfigured(env = process.env) {
  return getEmailConfig(env).configured;
}

function formatResetEmail({ user, code }) {
  const safeName = escapeHtml(user?.fullName || user?.username || 'Müştəri');
  const safeUsername = escapeHtml(user?.username || '');
  const safeCode = escapeHtml(code);
  const subject = 'Baku Coffee Factory — Şifrə bərpa kodu';

  const text = [
    `Salam${user?.fullName || user?.username ? `, ${user.fullName || user.username}` : ''}!`,
    '',
    'Baku Coffee Factory hesabınız üçün şifrə yeniləmə sorğusu aldıq.',
    `Təsdiq kodunuz: ${code}`,
    'Kod 15 dəqiqə ərzində etibarlıdır.',
    '',
    'Bu sorğunu siz göndərməmisinizsə, bu mesajı nəzərə almayın.',
    '',
    `Password reset code: ${code} (valid for 15 minutes).`,
  ].join('\n');

  const html = `<!doctype html>
<html lang="az">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f7f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#211b17;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #d8cdbf;padding:30px;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;color:#857b72;text-transform:uppercase;">BAKU COFFEE FACTORY</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#211b17;">Şifrə bərpa kodu</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.55;">Salam, <strong>${safeName}</strong>${safeUsername ? ` (<span style="color:#6c6259;">@${safeUsername}</span>)` : ''}!</p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.55;color:#4f453d;">Hesabınızın şifrəsini yeniləmək üçün aşağıdakı 6 rəqəmli təsdiq kodunu saytda müvafiq xanaya daxil edin:</p>
    <div style="margin:0 0 20px;padding:18px;background:#f7f5f0;border:1px solid #d5c9bb;text-align:center;">
      <span style="font-family:'SFMono-Regular',Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:0.24em;color:#4a3525;">${safeCode}</span>
    </div>
    <p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:#51473f;">Bu kod <strong>15 dəqiqə</strong> ərzində etibarlıdır.</p>
    <p style="margin:0;font-size:12px;line-height:1.5;color:#857b72;">Əgər bu sorğunu siz göndərməmisinizsə, hesabınızın təhlükəsizliyi üçün bu mesajı nəzərə almayın. Kodu 3-cü şəxslərlə paylaşmayın.</p>
  </div>
</body>
</html>`;

  return { subject, text, html };
}

function buildMimeMessage({ from, to, subject, text, html }) {
  const boundary = `bcf-${crypto.randomBytes(12).toString('hex')}`;
  const fromAddr = extractEmailAddress(from);
  const domain = (fromAddr.split('@')[1] || 'bakucoffeefactory.az').replace(/[^a-zA-Z0-9.-]/g, '') || 'bakucoffeefactory.az';
  const headers = [
    `From: ${sanitizeHeader(from)}`,
    `To: <${extractEmailAddress(to)}>`,
    `Subject: ${encodeRfc2047(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];

  return [
    ...headers,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(text),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(html),
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

function createSmtpClient(initialSocket) {
  let socket = null;
  let buffer = '';
  const pendingLines = [];
  let waiter = null;
  let fatalError = null;

  function flushWaiter() {
    if (!waiter) return;
    if (fatalError) {
      const { reject } = waiter;
      waiter = null;
      reject(fatalError);
      return;
    }
    while (pendingLines.length > 0) {
      const line = pendingLines.shift();
      waiter.collected.push(line);
      const match = line.match(/^(\d{3})([ -])(.*)$/);
      if (match && match[2] === ' ') {
        const { resolve, collected } = waiter;
        waiter = null;
        resolve({ code: Number(match[1]), text: collected.join('\n') });
        return;
      }
      if (!match) {
        const { reject, collected } = waiter;
        waiter = null;
        reject(new Error(`Unexpected SMTP reply: ${collected.join('\n')}`));
        return;
      }
    }
  }

  const onData = (chunk) => {
    buffer += chunk;
    let idx;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, idx).replace(/\r$/, '');
      buffer = buffer.slice(idx + 1);
      if (line.length > 0) pendingLines.push(line);
    }
    flushWaiter();
  };

  const onError = (err) => {
    if (!fatalError) fatalError = err;
    flushWaiter();
  };

  const onClose = () => {
    if (!fatalError) fatalError = new Error('SMTP connection closed unexpectedly');
    flushWaiter();
  };

  function attachSocket(nextSocket) {
    if (socket) {
      socket.off('data', onData);
      socket.off('error', onError);
      socket.off('close', onClose);
    }
    socket = nextSocket;
    socket.setEncoding('utf8');
    socket.on('data', onData);
    socket.on('error', onError);
    socket.on('close', onClose);
  }

  attachSocket(initialSocket);

  function readReply() {
    if (fatalError) return Promise.reject(fatalError);
    return new Promise((resolve, reject) => {
      waiter = { resolve, reject, collected: [] };
      flushWaiter();
    });
  }

  async function command(line, expectedCodes) {
    socket.write(`${line}\r\n`);
    const reply = await readReply();
    if (!expectedCodes.includes(reply.code)) {
      throw new Error(`SMTP ${reply.code}: ${reply.text}`);
    }
    return reply;
  }

  return { readReply, command, attachSocket };
}

async function sendViaSmtps({ host, port, secure, user, pass, from, to, subject, text, html }, timeoutMs = 12000) {
  let activeSocket = null;
  let timer = null;

  try {
    return await Promise.race([
      (async () => {
        activeSocket = await new Promise((resolve, reject) => {
          const sock = secure
            ? tls.connect({ host, port, servername: host }, () => resolve(sock))
            : net.connect({ host, port }, () => resolve(sock));
          sock.once('error', reject);
        });

        const smtp = createSmtpClient(activeSocket);
        const greeting = await smtp.readReply();
        if (greeting.code !== 220) throw new Error(`SMTP greeting ${greeting.code}: ${greeting.text}`);

        await smtp.command('EHLO bakucoffeefactory.az', [250]);

        if (!secure) {
          await smtp.command('STARTTLS', [220]);
          const tlsSocket = await new Promise((resolve, reject) => {
            const upgraded = tls.connect({ socket: activeSocket, servername: host }, () => resolve(upgraded));
            upgraded.once('error', reject);
          });
          activeSocket = tlsSocket;
          smtp.attachSocket(tlsSocket);
          await smtp.command('EHLO bakucoffeefactory.az', [250]);
        }

        await smtp.command('AUTH LOGIN', [334]);
        await smtp.command(Buffer.from(user, 'utf8').toString('base64'), [334]);
        await smtp.command(Buffer.from(pass, 'utf8').toString('base64'), [235]);
        await smtp.command(`MAIL FROM:<${extractEmailAddress(from)}>`, [250]);
        await smtp.command(`RCPT TO:<${extractEmailAddress(to)}>`, [250, 251]);
        await smtp.command('DATA', [354]);

        const mime = buildMimeMessage({ from, to, subject, text, html }).replace(/^\./gm, '..');
        activeSocket.write(`${mime}\r\n.\r\n`);
        const dataReply = await smtp.readReply();
        if (dataReply.code !== 250) throw new Error(`SMTP DATA ${dataReply.code}: ${dataReply.text}`);

        try {
          await smtp.command('QUIT', [221, 250]);
        } catch {}

        return { ok: true, provider: 'smtp' };
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          try { activeSocket?.destroy(); } catch {}
          reject(new Error('SMTP connection timed out'));
        }, timeoutMs);
        if (typeof timer.unref === 'function') timer.unref();
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
    try { activeSocket?.destroy(); } catch {}
  }
}

async function sendViaResend({ apiKey, from, to, subject, text, html }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [extractEmailAddress(to)],
      subject,
      html,
      text,
    }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `Resend ${response.status}`);
  }
  return { ok: true, provider: 'resend', id: data.id };
}

function formatResetTelegramMessage({ user, code, identifier }) {
  const fullName = user?.fullName ? escapeHtml(user.fullName) : '';
  const username = user?.username ? `@${escapeHtml(user.username)}` : '—';
  const phone = user?.phone ? escapeHtml(user.phone) : null;
  const email = user?.email ? escapeHtml(user.email) : null;
  const phoneClean = String(user?.phone || '').replace(/[^\d+]/g, '');

  const lines = [
    '🔐 <b>ŞİFRƏ BƏRPA SORĞUSU</b>',
    '━━━━━━━━━━━━━━━━━━━━',
    `👤 <b>Müştəri:</b> ${fullName ? `${fullName} (${username})` : username}`,
  ];
  if (phone) lines.push(`📞 <b>Telefon:</b> <a href="tel:${phoneClean}">${phone}</a>`);
  if (email) lines.push(`✉️ <b>E-poçt:</b> ${email}`);
  if (identifier) lines.push(`🔎 <b>Sorğu:</b> ${escapeHtml(identifier)}`);
  lines.push(`🔑 <b>Bərpa kodu (OTP):</b> <code>${escapeHtml(code)}</code>`);
  lines.push('⏳ <b>Etibarlıdır:</b> 15 dəqiqə');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('<i>Müştəri e-poçt qeyd etmədiyi (və ya Gmail çıxışı aktiv olmadığı) üçün kodu WhatsApp / zəng ilə müştəriyə ötürün.</i>');
  return lines.join('\n');
}

async function sendResetViaTelegram({ user, code, identifier }, options = {}) {
  const { botToken, chatIds } = getBotCredentials(options);
  if (!botToken || chatIds.length === 0) {
    return { ok: false, channel: 'telegram', reason: 'Telegram konfiqurasiya edilməyib.' };
  }
  const message = formatResetTelegramMessage({ user, code, identifier });
  const phoneDigits = String(user?.phone || '').replace(/\D/g, '');
  const buttons = phoneDigits ? [{ text: '💬 WhatsApp-la əlaqə', url: `https://wa.me/${phoneDigits}` }] : [];

  const results = await Promise.allSettled(
    chatIds.map((chatId) => sendToSingleChat({ botToken, chatId, message, buttons }))
  );
  const delivery = results.map((r, i) => (r.status === 'fulfilled' ? r.value : { ok: false, chatId: chatIds[i], error: r.reason?.message }));
  return {
    ok: delivery.some((item) => item.ok),
    channel: 'telegram',
    delivery,
  };
}

async function sendPasswordResetCode({ user, code, expiresAt, identifier }, options = {}) {
  const emailConfig = getEmailConfig(options.env || process.env);
  const canEmail = Boolean(user?.email && emailConfig.configured);

  if (isTestEnvironment() && !options.forceNetwork) {
    return {
      ok: true,
      skipped: true,
      channel: canEmail ? 'email' : 'telegram',
      reason: 'test-environment',
      expiresAt,
    };
  }

  if (canEmail) {
    const content = formatResetEmail({ user, code });
    const senders = [];
    if (emailConfig.smtp) {
      senders.push(() => sendViaSmtps({ ...emailConfig.smtp, to: user.email, ...content }));
    }
    if (emailConfig.resend) {
      senders.push(() => sendViaResend({ ...emailConfig.resend, to: user.email, ...content }));
    }

    for (const sendFn of senders) {
      try {
        const res = await sendFn();
        return { ok: true, channel: 'email', provider: res.provider, expiresAt };
      } catch (err) {
        console.warn('[Password Reset Email] Göndərilə bilmədi:', err.message);
      }
    }

    const fallback = await sendResetViaTelegram({ user, code, identifier }, options);
    return { ...fallback, fallback: true, attemptedChannel: 'email', expiresAt };
  }

  const tgResult = await sendResetViaTelegram({ user, code, identifier }, options);
  return { ...tgResult, expiresAt };
}

module.exports = {
  getEmailConfig,
  isEmailTransportConfigured,
  formatResetEmail,
  buildMimeMessage,
  formatResetTelegramMessage,
  sendViaSmtps,
  sendViaResend,
  sendResetViaTelegram,
  sendPasswordResetCode,
};
