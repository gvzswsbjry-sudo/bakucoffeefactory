'use strict';

const nodeFs = require('node:fs/promises');
const path = require('node:path');
const { validateProducts } = require('./product-schema');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createProductStore({ filePath, assetsRoot, fsImpl = nodeFs }) {
  if (!filePath) throw new Error('filePath is required');
  if (!assetsRoot) throw new Error('assetsRoot is required');

  let writeQueue = Promise.resolve();
  const backupPath = `${filePath}.bak`;
  const tempPath = `${filePath}.tmp`;

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

  async function load() {
    try {
      const primary = await readValid(filePath, { allowMissing: true });
      if (primary !== null) return primary;
    } catch (primaryError) {
      try {
        const backup = await readValid(backupPath, { allowMissing: true });
        if (backup !== null) return backup;
      } catch (backupError) {
        throw new Error(`${primaryError.message}. Backup recovery also failed: ${backupError.message}`);
      }
      throw new Error(`${primaryError.message}. No valid backup is available.`);
    }

    const backup = await readValid(backupPath, { allowMissing: true });
    return backup === null ? [] : backup;
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

  async function save(products) {
    const validation = validateProducts(products);
    if (!validation.ok) throw new Error(`Product validation failed: ${validation.errors.join('; ')}`);

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

  return { list, get, create, update, remove, replaceAll };
}

module.exports = { createProductStore };
