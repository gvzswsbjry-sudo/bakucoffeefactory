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
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    throw authError('Şifrə 12–128 simvol olmalıdır.');
  }
  return { salt, hash: (await scrypt(password, Buffer.from(salt, 'hex'), 64)).toString('hex') };
}

async function verifyPassword(password, salt, hash) {
  const supplied = String(password ?? '');
  if (supplied.length > 128) return false;
  const candidate = await scrypt(supplied, Buffer.from(salt, 'hex'), 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === candidate.length && crypto.timingSafeEqual(candidate, expected);
}

const tokenHash = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');
const publicUser = (row) => ({
  id: row.id,
  fullName: row.full_name || row.username,
  username: row.username,
  phone: row.phone_e164 || null,
  email: row.email_normalized || null,
});
const attemptKey = (ip, identifier) => tokenHash(`${String(ip || 'unknown').slice(0, 80)}\0${identifier}`);

function resolveAccountLookup(identifier) {
  const raw = String(identifier ?? '').trim();
  if (!raw) throw authError('İstifadəçi adı, telefon nömrəsi və ya e-poçt daxil edin.', 400);
  if (raw.includes('@')) {
    return { field: 'email_normalized', normalized: normalizeEmail(raw) };
  }
  if (raw.startsWith('+') || /^00\d/.test(raw)) {
    return { field: 'phone_e164', normalized: normalizePhone(raw) };
  }
  const cleanDigits = raw.replace(/[\s().-]/g, '');
  if (/^0[1-9]\d{8}$/.test(cleanDigits)) {
    return { field: 'phone_e164', normalized: `+994${cleanDigits.slice(1)}` };
  }
  if (/^994[1-9]\d{8}$/.test(cleanDigits)) {
    return { field: 'phone_e164', normalized: `+${cleanDigits}` };
  }
  return { field: 'username_normalized', normalized: normalizeUsername(raw) };
}

function createCustomerAuth({ database, now = () => new Date(), resetCooldownMs = 45_000 }) {
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

  async function register({ fullName, phone, email, username, password, privacyAccepted, ip, userAgent } = {}) {
    if (privacyAccepted !== true) throw authError('Məxfilik siyasətinə razılıq tələb olunur.');
    if (!phone && !email) throw authError('Telefon nömrəsi və ya e-poçt ünvanı daxil edin.');
    const phoneE164 = phone ? normalizePhone(phone) : null;
    const emailNormalized = email ? normalizeEmail(email) : null;
    const usernameNormalized = normalizeUsername(username);
    const displayName = String(username).trim().normalize('NFKC');
    const customerFullName = String(fullName || displayName).trim().normalize('NFKC').slice(0, 100);
    const { salt, hash } = await hashPassword(password);
    const key = attemptKey(ip, phoneE164 || emailNormalized || usernameNormalized);
    await checkAttempts(key);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(`INSERT INTO customer_users
        (id, full_name, username, username_normalized, phone_e164, email_normalized, password_salt, password_hash, privacy_consent_at, privacy_policy_version, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $9, $9) RETURNING id, full_name, username, phone_e164, email_normalized`,
      [crypto.randomUUID(), customerFullName, displayName, usernameNormalized, phoneE164, emailNormalized, salt, hash, current(), POLICY_VERSION]);
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
    let lookup;
    try {
      lookup = resolveAccountLookup(raw);
    } catch {
      throw authError('Giriş məlumatları düzgün deyil.', 401);
    }
    const key = attemptKey(ip, lookup.normalized);
    await checkAttempts(key);
    const { rows } = await pool.query(`SELECT id, full_name, username, phone_e164, email_normalized, password_salt, password_hash FROM customer_users WHERE ${lookup.field} = $1 AND is_active = TRUE`, [lookup.normalized]);
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
    const { rows } = await pool.query(`SELECT u.id, u.full_name, u.username, u.phone_e164, u.email_normalized FROM customer_sessions s
      JOIN customer_users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > $2 AND u.is_active = TRUE`, [tokenHash(token), current()]);
    return rows[0] ? publicUser(rows[0]) : null;
  }

  async function logout(token) {
    if (!/^[0-9a-f]{64}$/.test(String(token ?? ''))) return;
    await pool.query('DELETE FROM customer_sessions WHERE token_hash = $1', [tokenHash(token)]);
  }

  async function socialAuth({ provider, subject, email, name, phone, requirePhone = false, ip, userAgent } = {}) {
    const rawProvider = String(provider ?? '').trim().toLowerCase();
    if (rawProvider !== 'google' && rawProvider !== 'apple') {
      throw authError('Dəstəklənməyən giriş təminatçısı.', 400);
    }
    const subjectNormalized = String(subject ?? '').trim();
    if (!subjectNormalized || subjectNormalized.length > 255) throw authError('Provayder təsdiqi uğursuz oldu.', 401);
    const hasPhoneInput = phone !== undefined && phone !== null && String(phone).trim() !== '';
    const phoneE164 = hasPhoneInput ? normalizePhone(phone) : null;
    const key = attemptKey(ip, `${rawProvider}:${subjectNormalized}`);
    await checkAttempts(key);

    const { rows: identityRows } = await pool.query(`SELECT u.id, u.full_name, u.username, u.phone_e164, u.email_normalized
      FROM customer_identities i JOIN customer_users u ON u.id = i.user_id
      WHERE i.provider = $1 AND i.subject = $2 AND u.is_active = TRUE`, [rawProvider, subjectNormalized]);

    if (identityRows.length > 0) {
      const existing = identityRows[0];
      if (!existing.phone_e164) {
        if (phoneE164) {
          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            const taken = await client.query('SELECT 1 FROM customer_users WHERE phone_e164 = $1 AND id <> $2', [phoneE164, existing.id]);
            if (taken.rows.length > 0) {
              await recordFailure(key);
              throw authError('Bu telefon nömrəsi artıq başqa hesabda qeydiyyatdan keçib.', 409);
            }
            const timestamp = current();
            const { rows: updatedRows } = await client.query(
              `UPDATE customer_users SET phone_e164 = $2, updated_at = $3, last_login_at = $3
               WHERE id = $1 RETURNING id, full_name, username, phone_e164, email_normalized`,
              [existing.id, phoneE164, timestamp]
            );
            const token = await createSession(client, existing.id, userAgent);
            await client.query('COMMIT');
            await pool.query('DELETE FROM auth_attempts WHERE attempt_key = $1', [key]);
            return { user: publicUser(updatedRows[0]), token, isNew: false };
          } catch (error) {
            await client.query('ROLLBACK');
            if (error.status) throw error;
            if (error.code === '23505' || /duplicate key|unique constraint/i.test(error.message)) {
              await recordFailure(key);
              throw authError('Bu telefon nömrəsi artıq başqa hesabda qeydiyyatdan keçib.', 409);
            }
            throw error;
          } finally { client.release(); }
        }
        if (requirePhone) {
          return {
            needsPhone: true,
            isNew: false,
            profile: {
              fullName: existing.full_name || existing.username,
              email: existing.email_normalized || null,
            },
          };
        }
      }
      const token = await createSession(pool, existing.id, userAgent);
      await pool.query('UPDATE customer_users SET last_login_at = $2 WHERE id = $1', [existing.id, current()]);
      await pool.query('DELETE FROM auth_attempts WHERE attempt_key = $1', [key]);
      return { user: publicUser(existing), token, isNew: false };
    }

    if (!email) throw authError('Provayder e-poçt ünvanı qaytarmadı.', 401);
    const emailNormalized = normalizeEmail(email);

    const { rows: existingRows } = await pool.query(
      'SELECT id, full_name, username, phone_e164, email_normalized FROM customer_users WHERE email_normalized = $1 AND is_active = TRUE',
      [emailNormalized]);

    if (existingRows.length > 0) {
      let existing = existingRows[0];
      if (!existing.phone_e164 && !phoneE164 && requirePhone) {
        return {
          needsPhone: true,
          isNew: false,
          profile: {
            fullName: existing.full_name || existing.username,
            email: existing.email_normalized || null,
          },
        };
      }
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const timestamp = current();
        if (!existing.phone_e164 && phoneE164) {
          const taken = await client.query('SELECT 1 FROM customer_users WHERE phone_e164 = $1 AND id <> $2', [phoneE164, existing.id]);
          if (taken.rows.length > 0) {
            await recordFailure(key);
            throw authError('Bu telefon nömrəsi artıq başqa hesabda qeydiyyatdan keçib.', 409);
          }
          const { rows: updatedRows } = await client.query(
            `UPDATE customer_users SET phone_e164 = $2, updated_at = $3, last_login_at = $3
             WHERE id = $1 RETURNING id, full_name, username, phone_e164, email_normalized`,
            [existing.id, phoneE164, timestamp]
          );
          existing = updatedRows[0];
        } else {
          await client.query('UPDATE customer_users SET last_login_at = $2 WHERE id = $1', [existing.id, timestamp]);
        }
        await client.query(`INSERT INTO customer_identities(provider, subject, user_id, email_normalized, created_at)
          VALUES($1, $2, $3, $4, $5)`, [rawProvider, subjectNormalized, existing.id, emailNormalized, timestamp]);
        const token = await createSession(client, existing.id, userAgent);
        await client.query('COMMIT');
        await pool.query('DELETE FROM auth_attempts WHERE attempt_key = $1', [key]);
        return { user: publicUser(existing), token, isNew: false };
      } catch (error) {
        await client.query('ROLLBACK');
        if (error.status) throw error;
        if (error.code === '23505' || /duplicate key|unique constraint/i.test(error.message)) {
          await recordFailure(key);
          throw authError('Bu telefon nömrəsi artıq başqa hesabda qeydiyyatdan keçib.', 409);
        }
        throw error;
      } finally { client.release(); }
    }

    let baseName = String(name ?? '').trim().normalize('NFKC');
    if (!baseName) {
      baseName = emailNormalized.split('@')[0];
    }
    if (!phoneE164 && requirePhone) {
      return {
        needsPhone: true,
        isNew: true,
        profile: { fullName: baseName, email: emailNormalized },
      };
    }

    let cleanBase = baseName.replace(/[^\p{L}\p{N}._-]/gu, '_').slice(0, 20);
    if (cleanBase.length < 3) cleanBase = `user_${cleanBase}`.slice(0, 20);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (phoneE164) {
        const taken = await client.query('SELECT 1 FROM customer_users WHERE phone_e164 = $1', [phoneE164]);
        if (taken.rows.length > 0) {
          await recordFailure(key);
          throw authError('Bu telefon nömrəsi artıq başqa hesabda qeydiyyatdan keçib.', 409);
        }
      }
      let candidateUsername = cleanBase;
      let candidateNormalized = candidateUsername.toLocaleLowerCase('und');
      let counter = 1;

      while (true) {
        const check = await client.query(
          'SELECT 1 FROM customer_users WHERE username_normalized = $1',
          [candidateNormalized]
        );
        if (check.rows.length === 0) break;
        candidateUsername = `${cleanBase}_${counter++}`;
        candidateNormalized = candidateUsername.toLocaleLowerCase('und');
      }

      const randomPassword = crypto.randomBytes(32).toString('hex');
      const { salt, hash } = await hashPassword(randomPassword);

      const { rows } = await client.query(`INSERT INTO customer_users
        (id, full_name, username, username_normalized, phone_e164, email_normalized, password_salt, password_hash, privacy_consent_at, privacy_policy_version, created_at, updated_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $9, $9, $9) RETURNING id, full_name, username, phone_e164, email_normalized`,
      [crypto.randomUUID(), baseName, candidateUsername, candidateNormalized, phoneE164, emailNormalized, salt, hash, current(), POLICY_VERSION]);

      await client.query(`INSERT INTO customer_identities(provider, subject, user_id, email_normalized, created_at)
        VALUES($1, $2, $3, $4, $5)`, [rawProvider, subjectNormalized, rows[0].id, emailNormalized, current()]);

      const token = await createSession(client, rows[0].id, userAgent);
      await client.query('COMMIT');
      await pool.query('DELETE FROM auth_attempts WHERE attempt_key = $1', [key]);
      return { user: publicUser(rows[0]), token, isNew: true };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.status) throw error;
      if (error.code === '23505' || /duplicate key|unique constraint/i.test(error.message)) {
        await recordFailure(key);
        throw authError('Bu telefon nömrəsi artıq başqa hesabda qeydiyyatdan keçib.', 409);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async function updatePhone({ userId, phone, ip } = {}) {
    if (!userId) throw authError('Hesaba daxil olun.', 401);
    const phoneE164 = normalizePhone(phone);
    const key = attemptKey(ip, `phone:${userId}`);
    await checkAttempts(key);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: existingRows } = await client.query(
        'SELECT id FROM customer_users WHERE id = $1 AND is_active = TRUE',
        [userId]
      );
      if (!existingRows.length) throw authError('Hesab tapılmadı.', 404);
      const taken = await client.query('SELECT 1 FROM customer_users WHERE phone_e164 = $1 AND id <> $2', [phoneE164, userId]);
      if (taken.rows.length > 0) {
        await recordFailure(key);
        throw authError('Bu telefon nömrəsi artıq başqa hesabda qeydiyyatdan keçib.', 409);
      }
      const { rows } = await client.query(
        'UPDATE customer_users SET phone_e164 = $2, updated_at = $3 WHERE id = $1 RETURNING id, full_name, username, phone_e164, email_normalized',
        [userId, phoneE164, current()]
      );
      await client.query('COMMIT');
      await pool.query('DELETE FROM auth_attempts WHERE attempt_key = $1', [key]);
      return { user: publicUser(rows[0]) };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.status) throw error;
      if (error.code === '23505' || /duplicate key|unique constraint/i.test(error.message)) {
        await recordFailure(key);
        throw authError('Bu telefon nömrəsi artıq başqa hesabda qeydiyyatdan keçib.', 409);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async function requestPasswordReset({
    identifier,
    ip,
    ttlMinutes = 15,
    cooldownMs = resetCooldownMs,
    emailTransportConfigured = false,
  } = {}) {
    const raw = String(identifier ?? '').trim();
    if (!raw) throw authError('İstifadəçi adı, telefon nömrəsi və ya e-poçt daxil edin.', 400);
    const lookup = resolveAccountLookup(raw);
    const key = attemptKey(ip, `reset:${lookup.normalized}`);
    await checkAttempts(key);

    const { rows } = await pool.query(
      `SELECT id, full_name, username, phone_e164, email_normalized FROM customer_users WHERE ${lookup.field} = $1 AND is_active = TRUE`,
      [lookup.normalized]
    );
    const user = rows[0];
    if (!user) return { dispatched: false, reason: 'not-found' };

    const createdAt = current();
    if (cooldownMs > 0) {
      const latest = await pool.query(
        'SELECT created_at FROM password_reset_tokens WHERE user_id = $1 AND used_at IS NULL ORDER BY created_at DESC LIMIT 1',
        [user.id]
      );
      if (latest.rows.length > 0 && createdAt.getTime() - new Date(latest.rows[0].created_at).getTime() < cooldownMs) {
        return { dispatched: false, reason: 'cooldown' };
      }
    }

    const tokenId = crypto.randomUUID();
    const code = String(crypto.randomInt(100000, 1000000));
    const digest = tokenHash(`${tokenId}:${user.id}:${code}`);
    const expiresAt = new Date(createdAt.getTime() + ttlMinutes * 60 * 1000);
    const deliveryChannel = user.email_normalized && emailTransportConfigured ? 'email' : 'telegram';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE password_reset_tokens SET used_at = $2 WHERE user_id = $1 AND used_at IS NULL',
        [user.id, createdAt]
      );
      await client.query(
        `INSERT INTO password_reset_tokens (id, user_id, code_hash, delivery_channel, attempts, created_at, expires_at)
         VALUES ($1, $2, $3, $4, 0, $5, $6)`,
        [tokenId, user.id, digest, deliveryChannel, createdAt, expiresAt]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return {
      dispatched: true,
      tokenId,
      user: publicUser(user),
      code,
      expiresAt,
      deliveryChannel,
    };
  }

  async function resetPassword({ identifier, code, newPassword, ip, userAgent } = {}) {
    const raw = String(identifier ?? '').trim();
    if (!raw) throw authError('İstifadəçi adı, telefon nömrəsi və ya e-poçt daxil edin.', 400);
    const cleanCode = String(code ?? '').replace(/\s+/g, '').trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      throw authError('6 rəqəmli bərpa kodunu düzgün daxil edin.', 400);
    }
    if (typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 128) {
      throw authError('Şifrə 12–128 simvol olmalıdır.', 400);
    }

    let lookup;
    try {
      lookup = resolveAccountLookup(raw);
    } catch {
      throw authError('Bərpa kodu yanlışdır və ya vaxtı bitib.', 400);
    }

    const key = attemptKey(ip, `reset:${lookup.normalized}`);
    await checkAttempts(key);

    const { rows } = await pool.query(
      `SELECT id, full_name, username, phone_e164, email_normalized FROM customer_users WHERE ${lookup.field} = $1 AND is_active = TRUE`,
      [lookup.normalized]
    );
    const user = rows[0];
    if (!user) {
      await recordFailure(key);
      throw authError('Bərpa kodu yanlışdır və ya vaxtı bitib.', 400);
    }

    const tokenRes = await pool.query(
      'SELECT id, code_hash, attempts, expires_at FROM password_reset_tokens WHERE user_id = $1 AND used_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );
    const tokenRow = tokenRes.rows[0];
    const nowTime = current();

    if (!tokenRow || new Date(tokenRow.expires_at).getTime() <= nowTime.getTime()) {
      if (tokenRow) {
        await pool.query(
          'UPDATE password_reset_tokens SET used_at = $2 WHERE id = $1 AND used_at IS NULL',
          [tokenRow.id, nowTime]
        );
      }
      await recordFailure(key);
      throw authError('Bərpa kodu yanlışdır və ya vaxtı bitib.', 400);
    }

    const candidateHash = Buffer.from(tokenHash(`${tokenRow.id}:${user.id}:${cleanCode}`), 'hex');
    const expectedHash = Buffer.from(tokenRow.code_hash, 'hex');
    const codeMatches = candidateHash.length === expectedHash.length && crypto.timingSafeEqual(candidateHash, expectedHash);

    if (!codeMatches) {
      const nextAttempts = Number(tokenRow.attempts || 0) + 1;
      const burned = nextAttempts >= 5;
      await pool.query(
        'UPDATE password_reset_tokens SET attempts = $2, used_at = $3 WHERE id = $1',
        [tokenRow.id, nextAttempts, burned ? nowTime : null]
      );
      await recordFailure(key);
      throw authError(
        burned
          ? 'Kod etibarsız oldu. Yenidən şifrə bərpa kodu tələb edin.'
          : 'Bərpa kodu yanlışdır və ya vaxtı bitib.',
        400
      );
    }

    const { salt, hash } = await hashPassword(newPassword);
    let sessionToken;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE customer_users SET password_salt = $2, password_hash = $3, updated_at = $4, last_login_at = $4 WHERE id = $1',
        [user.id, salt, hash, nowTime]
      );
      await client.query(
        'UPDATE password_reset_tokens SET used_at = $2 WHERE user_id = $1 AND used_at IS NULL',
        [user.id, nowTime]
      );
      await client.query('DELETE FROM customer_sessions WHERE user_id = $1', [user.id]);
      sessionToken = await createSession(client, user.id, userAgent);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    await pool.query(
      'DELETE FROM auth_attempts WHERE attempt_key = $1 OR attempt_key = $2',
      [key, attemptKey(ip, lookup.normalized)]
    );

    return { user: publicUser(user), token: sessionToken };
  }

  return { register, login, getSession, logout, socialAuth, updatePhone, requestPasswordReset, resetPassword };
}

module.exports = {
  createCustomerAuth,
  normalizeEmail,
  normalizePhone,
  normalizeUsername,
  resolveAccountLookup,
  hashPassword,
  verifyPassword,
  tokenHash,
  POLICY_VERSION,
};
