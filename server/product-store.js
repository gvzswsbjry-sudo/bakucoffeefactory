'use strict';

const nodeFs = require('node:fs/promises');
const path = require('node:path');
const { validateProducts } = require('./product-schema');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function rowToProduct(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    price: Number(row.price),
    unit: row.unit || 'g',
    image: row.image,
    description: row.description || '',
    active: Boolean(row.active),
    stock: {
      status: row.stock_status || 'available',
      quantity: row.stock_quantity !== null && row.stock_quantity !== undefined ? Number(row.stock_quantity) : null,
    },
    sortOrder: Number(row.sort_order ?? 0),
    meta: row.meta || {},
    variants: Array.isArray(row.variants) ? row.variants : [],
  };
}

async function upsertProductInDb(pool, p) {
  const query = `
    INSERT INTO catalog_products (
      id, category, name, price, unit, image, description,
      active, stock_status, stock_quantity, sort_order, meta, variants, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    ON CONFLICT (id) DO UPDATE SET
      category = EXCLUDED.category,
      name = EXCLUDED.name,
      price = EXCLUDED.price,
      unit = EXCLUDED.unit,
      image = EXCLUDED.image,
      description = EXCLUDED.description,
      active = EXCLUDED.active,
      stock_status = EXCLUDED.stock_status,
      stock_quantity = EXCLUDED.stock_quantity,
      sort_order = EXCLUDED.sort_order,
      meta = EXCLUDED.meta,
      variants = EXCLUDED.variants,
      updated_at = NOW()
  `;
  await pool.query(query, [
    p.id,
    p.category,
    p.name,
    p.price,
    p.unit || 'g',
    p.image,
    p.description || '',
    p.active !== false,
    p.stock?.status || 'available',
    p.stock?.status === 'counted' && p.stock?.quantity !== null && p.stock?.quantity !== undefined ? Number(p.stock.quantity) : null,
    Number(p.sortOrder || 0),
    JSON.stringify(p.meta || {}),
    JSON.stringify(p.variants || []),
  ]);
}

function createProductStore({ filePath, assetsRoot, fsImpl = nodeFs, database = null }) {
  if (!filePath) throw new Error('filePath is required');
  if (!assetsRoot) throw new Error('assetsRoot is required');

  let writeQueue = Promise.resolve();
  const backupPath = `${filePath}.bak`;
  const tempPath = `${filePath}.tmp`;
  const localPersistentPath = path.join(path.dirname(filePath), 'products.local.json');
  let dbSynced = false;

  async function readValid(candidate, { allowMissing = false } = {}) {
    let raw;
    try {
      raw = await fsImpl.readFile(candidate, 'utf8');
    } catch (error) {
      if (allowMissing && error && error.code === 'ENOENT') return null;
      throw error;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      throw new Error(`Product data is malformed at ${candidate}: ${error.message}`);
    }
    const validation = validateProducts(data);
    if (!validation.ok) {
      throw new Error(`Product data is invalid at ${candidate}: ${validation.errors.join('; ')}`);
    }
    return data;
  }

  async function loadFromFile() {
    let primary = null;
    try {
      primary = await readValid(filePath, { allowMissing: true });
    } catch (primaryError) {
      try {
        const backup = await readValid(backupPath, { allowMissing: true });
        if (backup !== null) return backup;
      } catch (backupError) {
        throw new Error(`${primaryError.message}. Backup recovery also failed: ${backupError.message}`);
      }
      throw new Error(`${primaryError.message}. No valid backup is available.`);
    }

    if (primary === null) {
      const backup = await readValid(backupPath, { allowMissing: true });
      if (backup !== null) return backup;
    }

    // Check git-immune local persistent file to prevent data loss on git pull
    try {
      const localPersistent = await readValid(localPersistentPath, { allowMissing: true });
      if (localPersistent && Array.isArray(localPersistent) && localPersistent.length > 0) {
        if (!primary || localPersistent.length > primary.length) {
          // If local persistent file has more products (e.g. user added products and git pull wiped primary), restore them
          const primaryIds = new Set((primary || []).map((p) => p.id));
          const merged = [...(primary || [])];
          for (const item of localPersistent) {
            if (!primaryIds.has(item.id)) {
              merged.push(item);
            }
          }
          return merged;
        }
      }
    } catch {}

    return primary === null ? [] : primary;
  }

  async function syncWithDatabase() {
    if (!database || !database.pool) return;
    try {
      if (typeof database.migrate === 'function') {
        await database.migrate();
      }
      const res = await database.pool.query('SELECT * FROM catalog_products ORDER BY sort_order ASC, name ASC');
      const dbProducts = res.rows.map(rowToProduct);

      if (dbProducts.length === 0) {
        // First boot with empty DB: seed from local file into DB
        const fileProducts = await loadFromFile().catch(() => []);
        if (fileProducts.length > 0) {
          for (const item of fileProducts) {
            await upsertProductInDb(database.pool, item);
          }
          await saveToLocalFiles(fileProducts);
        }
      } else {
        // DB has products!
        // Check if local file has newly added items not yet in DB
        const fileProducts = await loadFromFile().catch(() => []);
        const dbIdSet = new Set(dbProducts.map((p) => p.id));
        let merged = false;
        for (const fileItem of fileProducts) {
          if (!dbIdSet.has(fileItem.id)) {
            await upsertProductInDb(database.pool, fileItem);
            dbProducts.push(fileItem);
            merged = true;
          }
        }
        if (merged) {
          dbProducts.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, 'az'));
        }
        // Save authoritative catalog to local file so static reads always match
        await saveToLocalFiles(dbProducts);
      }
      dbSynced = true;
    } catch (err) {
      console.warn('[ProductStore] Database sync notice:', err.message);
    }
  }

  async function load() {
    if (database && database.pool) {
      if (!dbSynced) {
        await syncWithDatabase();
      }
      try {
        const res = await database.pool.query('SELECT * FROM catalog_products ORDER BY sort_order ASC, name ASC');
        if (res.rows.length > 0) {
          return res.rows.map(rowToProduct);
        }
      } catch (err) {
        console.warn('[ProductStore] Fallback to file load:', err.message);
      }
    }
    return loadFromFile();
  }

  async function writeSynced(target, contents) {
    const handle = await fsImpl.open(target, 'w');
    try {
      await handle.writeFile(contents, 'utf8');
      await handle.sync();
    } finally {
      await handle.close();
    }
  }

  async function saveToLocalFiles(products) {
    await fsImpl.mkdir(path.dirname(filePath), { recursive: true });
    const serialized = `${JSON.stringify(products, null, 2)}\n`;

    const previous = await readValid(filePath, { allowMissing: true }).catch(() => null);
    if (previous !== null) {
      const backupTemp = `${backupPath}.tmp`;
      await writeSynced(backupTemp, `${JSON.stringify(previous, null, 2)}\n`);
      await fsImpl.rename(backupTemp, backupPath);
    }

    await writeSynced(tempPath, serialized);
    try {
      await fsImpl.rename(tempPath, filePath);
    } catch (error) {
      await fsImpl.unlink(tempPath).catch(() => {});
      throw error;
    }

    // Also persist to localPersistentPath (ignored by git) so git pull can never erase it
    try {
      const localTemp = `${localPersistentPath}.tmp`;
      await writeSynced(localTemp, serialized);
      await fsImpl.rename(localTemp, localPersistentPath);
    } catch {}
  }

  async function save(products) {
    const validation = validateProducts(products);
    if (!validation.ok) throw new Error(`Product validation failed: ${validation.errors.join('; ')}`);

    // 1. Save to local files (atomic rename + backup)
    await saveToLocalFiles(products);

    // 2. Save to database if connected
    if (database && database.pool) {
      try {
        if (!dbSynced) await syncWithDatabase();
        for (const item of products) {
          await upsertProductInDb(database.pool, item);
        }
        const currentIds = products.map((p) => p.id);
        if (currentIds.length > 0) {
          await database.pool.query('DELETE FROM catalog_products WHERE id != ALL($1::text[])', [currentIds]);
        }
      } catch (err) {
        console.warn('[ProductStore] Database persist notice:', err.message);
      }
    }
  }

  function enqueue(operation) {
    const pending = writeQueue.then(operation);
    writeQueue = pending.catch(() => {});
    return pending;
  }

  async function list() {
    await writeQueue;
    return clone(await load());
  }

  async function get(id) {
    const products = await list();
    return products.find((item) => item.id === id) || null;
  }

  function create(product) {
    return enqueue(async () => {
      const products = await load();
      if (products.some((item) => item.id === product.id)) throw new Error(`Product ${product.id} already exists`);
      products.push(clone(product));
      await save(products);
      return clone(product);
    });
  }

  function update(id, changes) {
    return enqueue(async () => {
      const products = await load();
      const index = products.findIndex((item) => item.id === id);
      if (index < 0) return null;
      const updated = { ...products[index], ...clone(changes), id };
      products[index] = updated;
      await save(products);
      return clone(updated);
    });
  }

  function remove(id) {
    return enqueue(async () => {
      const products = await load();
      const next = products.filter((item) => item.id !== id);
      if (next.length === products.length) return false;
      await save(next);
      if (database && database.pool) {
        try {
          await database.pool.query('DELETE FROM catalog_products WHERE id = $1', [id]);
        } catch (err) {
          console.warn('[ProductStore] DB delete notice:', err.message);
        }
      }
      return true;
    });
  }

  function replaceAll(products) {
    return enqueue(async () => {
      const next = clone(products);
      await save(next);
      return clone(next);
    });
  }

  return { list, get, create, update, remove, replaceAll, syncWithDatabase };
}

module.exports = { createProductStore };
