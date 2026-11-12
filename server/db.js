'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

function createDatabase({ connectionString = process.env.DATABASE_URL, PoolClass } = {}) {
  if (!connectionString) return null;
  const Pool = PoolClass || require('pg').Pool;
  const pool = new Pool({ connectionString, max: 10, connectionTimeoutMillis: 3000, idleTimeoutMillis: 30000 });
  let migrated = false;
  let migrationPromise;

  async function migrate() {
    if (migrated) return;
    if (!migrationPromise) {
      migrationPromise = (async () => {
        const authSql = await fs.readFile(path.join(__dirname, 'migrations', '001_customer_auth.sql'), 'utf8');
        await pool.query(authSql);
        const catalogSql = await fs.readFile(path.join(__dirname, 'migrations', '002_catalog_products.sql'), 'utf8');
        await pool.query(catalogSql);
        const settingsSql = await fs.readFile(path.join(__dirname, 'migrations', '003_storefront_settings.sql'), 'utf8');
        await pool.query(settingsSql);
        migrated = true;
      })().finally(() => { migrationPromise = null; });
    }
    return migrationPromise;
  }

  return { pool, migrate, close: () => pool.end() };
}

module.exports = { createDatabase };
