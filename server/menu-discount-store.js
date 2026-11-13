'use strict';

const nodeFs = require('node:fs/promises');
const path = require('node:path');
const { isAssetPath } = require('./product-schema');
const {
  DEFAULT_DAILY_DISCOUNT_SETTINGS,
  getMenuDrinkByKey,
  resolveDailyDiscountConfig,
} = require('../menu-drinks');

const SETTINGS_KEY = 'daily_menu_discount';

function validateDailyDiscountInput(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, errors: ['Məlumat obyekt formatında olmalıdır.'] };
  }

  const enabled = payload.enabled === undefined ? true : Boolean(payload.enabled);
  const itemKey = typeof payload.itemKey === 'string' ? payload.itemKey.trim() : '';
  const drink = getMenuDrinkByKey(itemKey);
  if (!drink) {
    errors.push('Menyudan düzgün içki seçin.');
  }

  const pct = Number(payload.discountPercent);
  if (!Number.isInteger(pct) || pct < 5 || pct > 90) {
    errors.push('Endirim faizi 5 ilə 90 arasında tam ədəd olmalıdır.');
  }

  let image = typeof payload.image === 'string' ? payload.image.trim() : '';
  if (image) {
    if (!isAssetPath(image)) {
      errors.push('Şəkil yolu yalnız assets/ qovluğundan təhlükəsiz şəkil faylı ola bilər.');
    }
  } else if (drink) {
    image = drink.defaultImage;
  }

  const customNote = typeof payload.customNote === 'string' ? payload.customNote.trim() : '';
  if (customNote.length > 240 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(customNote)) {
    errors.push('Qeyd mətni maksimum 240 simvol ola bilər.');
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      enabled,
      itemKey: drink.key,
      discountPercent: pct,
      image,
      customNote,
      updatedAt: new Date().toISOString(),
    },
  };
}

function createMenuDiscountStore({ filePath, fsImpl = nodeFs, database = null } = {}) {
  const targetPath = filePath || path.join(process.cwd(), 'data', 'menu-settings.json');
  const backupPath = `${targetPath}.bak`;
  const tempPath = `${targetPath}.tmp`;
  let writeQueue = Promise.resolve();
  let dbSynced = false;
  let cachedRaw = null;
  let lastDbAttempt = 0;
  const DB_FAILURE_COOLDOWN_MS = 60_000;

  async function readJsonSafe(candidate) {
    try {
      const raw = await fsImpl.readFile(candidate, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {}
    return null;
  }

  async function writeLocal(settings) {
    await fsImpl.mkdir(path.dirname(targetPath), { recursive: true });
    const serialized = `${JSON.stringify(settings, null, 2)}\n`;
    const prev = await readJsonSafe(targetPath);
    if (prev) {
      const bakTmp = `${backupPath}.tmp`;
      await fsImpl.writeFile(bakTmp, `${JSON.stringify(prev, null, 2)}\n`, 'utf8');
      await fsImpl.rename(bakTmp, backupPath);
    }
    await fsImpl.writeFile(tempPath, serialized, 'utf8');
    await fsImpl.rename(tempPath, targetPath);
  }

  async function loadRaw() {
    if (cachedRaw !== null) {
      return cachedRaw;
    }

    const fromPrimary = await readJsonSafe(targetPath);
    if (fromPrimary) {
      cachedRaw = { ...DEFAULT_DAILY_DISCOUNT_SETTINGS, ...fromPrimary };
    } else {
      const fromBackup = await readJsonSafe(backupPath);
      if (fromBackup) cachedRaw = { ...DEFAULT_DAILY_DISCOUNT_SETTINGS, ...fromBackup };
      else cachedRaw = { ...DEFAULT_DAILY_DISCOUNT_SETTINGS };
    }

    if (database && database.pool && !dbSynced) {
      const now = Date.now();
      if (now - lastDbAttempt >= DB_FAILURE_COOLDOWN_MS) {
        lastDbAttempt = now;
        (async () => {
          try {
            if (!dbSynced && typeof database.migrate === 'function') {
              await database.migrate();
            }
            dbSynced = true;
            const res = await database.pool.query('SELECT value, updated_at FROM storefront_settings WHERE key = $1', [SETTINGS_KEY]);
            if (res.rows.length > 0 && res.rows[0].value) {
              cachedRaw = {
                ...DEFAULT_DAILY_DISCOUNT_SETTINGS,
                ...res.rows[0].value,
                updatedAt: res.rows[0].value.updatedAt || res.rows[0].updated_at || null,
              };
              await writeLocal(cachedRaw);
            }
          } catch (err) {
            console.warn('[MenuDiscountStore] Database load notice:', err.message);
          }
        })().catch(() => {});
      }
    }

    return cachedRaw;
  }

  async function saveRaw(settings) {
    cachedRaw = { ...settings };
    await writeLocal(settings);
    if (database && database.pool) {
      try {
        if (!dbSynced && typeof database.migrate === 'function') {
          await database.migrate();
        }
        dbSynced = true;
        await database.pool.query(
          `INSERT INTO storefront_settings (key, value, updated_at)
           VALUES ($1, $2::jsonb, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [SETTINGS_KEY, JSON.stringify(settings)]
        );
      } catch (err) {
        console.warn('[MenuDiscountStore] Database persist notice:', err.message);
      }
    }
  }

  async function get() {
    await writeQueue;
    const raw = await loadRaw();
    return resolveDailyDiscountConfig(raw);
  }

  function update(payload) {
    const operation = writeQueue.then(async () => {
      const validation = validateDailyDiscountInput(payload);
      if (!validation.ok) {
        const error = new Error(validation.errors.join(' '));
        error.status = 400;
        throw error;
      }
      await saveRaw(validation.value);
      return resolveDailyDiscountConfig(validation.value);
    });
    writeQueue = operation.catch(() => {});
    return operation;
  }

  return { get, update, validateDailyDiscountInput };
}

module.exports = { createMenuDiscountStore, validateDailyDiscountInput };
