'use strict';

const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const ATTEMPT_MS = 15 * 60 * 1000;
const POLICY_VERSION = '2026-10-26';
const DUMMY_SALT = '8c66928fcdab9f7190cdf2d7d514e72d';

function authError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizePhone(value) {
  const input = String(value ?? '').trim();
  if (!input.startsWith('+') && !input.startsWith('00')) throw authError('Telefon nömrəsini ölkə kodu ilə daxil edin.');
  const phone = (input.startsWith('00') ? `+${input.slice(2)}` : input).replace(/[\s().-]/g, '');
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) throw authError('Telefon nömrəsi düzgün deyil.');
  return phone;
}

function normalizeEmail(value) {
  const email = String(value ?? '').trim().normalize('NFKC').toLocaleLowerCase('und');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw authError('E-poçt ünvanı düzgün deyil.');
  }
  return email;
}

function normalizeUsername(value) {
  const username = String(value ?? '').trim().normalize('NFKC');
  if (username.length < 3 || username.length > 30 || !/^[\p{L}\p{N}._-]+$/u.test(username)) {
    throw authError('İstifadəçi adı 3–30 hərf, rəqəm, nöqtə, tire və ya alt xətdən ibarət olmalıdır.');
  }
  return username.toLocaleLowerCase('und');
}

async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw authError('Şifrə 8–128 simvol olmalıdır.');
  }
  return { salt, hash: (await scrypt(password, Buffer.from(salt, 'hex'), 64)).toString('hex') };
}

async function verifyPassword(password, salt, hash) {
  const candidate = await scrypt(String(password ?? ''), Buffer.from(salt, 'hex'), 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === candidate.length && crypto.timingSafeEqual(candidate, expected);
}

const tokenHash = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');
const publicUser = (row) => ({ id: row.id, username: row.username, phone: row.phone_e164 || null, email: row.email_normalized || null });
const attemptKey = (ip, identifier) => tokenHash(`${String(ip || 'unknown').slice(0, 80)}\0${identifier}`);

function createCustomerAuth({ database, now = () => new Date() }) {
  if (!database) throw new Error('Customer database is required');
  const pool = database.pool;
  const current = () => new Date(now());

  async function checkAttempts(key) {
    const { rows } = await pool.query('SELECT failure_count, first_attempt_at FROM auth_attempts WHERE attempt_key = $1', [key]);
    if (!rows.length) return;
    if (current().getTime() - new Date(rows[0].first_attempt_at).getTime() >= ATTEMPT_MS) {
      await pool.query('DELETE FROM auth_attempts WHERE attempt_key = $1', [key]);
      return;
    }
    if (rows[0].failure_count >= 5) throw authError('Çox cəhd edildi. 15 dəqiqə sonra yenidən yoxlayın.', 429);
  }

  async function recordFailure(key) {
    const timestamp = current();
    await pool.query(`INSERT INTO auth_attempts(attempt_key, failure_count, first_attempt_at, updated_at)
      VALUES($1, 1, $2, $2)
      ON CONFLICT (attempt_key) DO UPDATE SET failure_count = auth_attempts.failure_count + 1, updated_at = $2`, [key, timestamp]);
  }

  async function createSession(client, userId, userAgent = '') {
    const token = crypto.randomBytes(32).toString('hex');
    const createdAt = current();
    const expiresAt = new Date(createdAt.getTime() + SESSION_MS);
    await client.query(`INSERT INTO customer_sessions(id, user_id, token_hash, created_at, expires_at, last_seen_at, user_agent_hash)
      VALUES($1, $2, $3, $4, $5, $4, $6)`, [crypto.randomUUID(), userId, tokenHash(token), createdAt, expiresAt, userAgent ? tokenHash(userAgent) : null]);
    return token;
  }

  async function register({ phone, email, username, password, privacyAccepted, ip, userAgent } = {}) {
    if (privacyAccepted !== true) throw authError('Məxfilik siyasətinə razılıq tələb olunur.');
    if (!phone && !email) throw authError('Telefon nömrəsi və ya e-poçt ünvanı daxil edin.');
    const phoneE164 = phone ? normalizePhone(phone) : null;
    const emailNormalized = email ? normalizeEmail(email) : null;
    const usernameNormalized = normalizeUsername(username);
    const displayName = String(username).trim().normalize('NFKC');
    const { salt, hash } = await hashPassword(password);
    const key = attemptKey(ip, phoneE164 || emailNormalized);
    await checkAttempts(key);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(`INSERT INTO customer_users
        (id, username, username_normalized, phone_e164, email_normalized, password_salt, password_hash, privacy_consent_at, privacy_policy_version, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $8, $8) RETURNING id, username, phone_e164, email_normalized`,
      [crypto.randomUUID(), displayName, usernameNormalized, phoneE164, emailNormalized, salt, hash, current(), POLICY_VERSION]);
      const token = await createSession(client, rows[0].id, userAgent);
      await client.query('COMMIT');
      return { user: publicUser(rows[0]), token };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505' || /duplicate key|unique constraint/i.test(error.message)) {
        await recordFailure(key);
        throw authError('Bu telefon nömrəsi, e-poçt və ya istifadəçi adı artıq qeydiyyatdan keçib.', 409);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async function login({ identifier, password, ip, userAgent } = {}) {
    const raw = String(identifier ?? '').trim();
    if (!raw || typeof password !== 'string') throw authError('Giriş məlumatları düzgün deyil.', 401);
    let normalized;
    let field;
    try {
      field = raw.includes('@') ? 'email_normalized' : raw.startsWith('+') || /^00\d/.test(raw) ? 'phone_e164' : 'username_normalized';
      normalized = field === 'phone_e164' ? normalizePhone(raw) : field === 'email_normalized' ? normalizeEmail(raw) : normalizeUsername(raw);
    } catch {
      throw authError('Giriş məlumatları düzgün deyil.', 401);
    }
    const key = attemptKey(ip, normalized);
    await checkAttempts(key);
    const { rows } = await pool.query(`SELECT id, username, phone_e164, email_normalized, password_salt, password_hash FROM customer_users WHERE ${field} = $1 AND is_active = TRUE`, [normalized]);
    const user = rows[0];
    const passwordOk = await verifyPassword(password, user?.password_salt || DUMMY_SALT, user?.password_hash || '00'.repeat(64));
    if (!user || !passwordOk) {
      await recordFailure(key);
      throw authError('Giriş məlumatları düzgün deyil.', 401);
    }
    await pool.query('DELETE FROM auth_attempts WHERE attempt_key = $1', [key]);
    const token = await createSession(pool, user.id, userAgent);
    await pool.query('UPDATE customer_users SET last_login_at = $2 WHERE id = $1', [user.id, current()]);
    return { user: publicUser(user), token };
  }

  async function getSession(token) {
    if (!/^[0-9a-f]{64}$/.test(String(token ?? ''))) return null;
    const { rows } = await pool.query(`SELECT u.id, u.username, u.phone_e164, u.email_normalized FROM customer_sessions s
      JOIN customer_users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > $2 AND u.is_active = TRUE`, [tokenHash(token), current()]);
    return rows[0] ? publicUser(rows[0]) : null;
  }

  async function logout(token) {
    if (!/^[0-9a-f]{64}$/.test(String(token ?? ''))) return;
    await pool.query('DELETE FROM customer_sessions WHERE token_hash = $1', [tokenHash(token)]);
  }

  return { register, login, getSession, logout };
}

module.exports = { createCustomerAuth, normalizeEmail, normalizePhone, normalizeUsername, hashPassword, verifyPassword, tokenHash, POLICY_VERSION };
