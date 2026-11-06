#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { createAuth } = require('../server/auth');

async function main() {
  const newPassword = process.argv[2] || process.env.ADMIN_PASSWORD || 'Farman11052008';
  const configPath = path.resolve(__dirname, '..', 'data', 'admin-config.json');
  const auth = createAuth({ configPath });

  try {
    await auth.setPassword(newPassword);
    console.log('--------------------------------------------------');
    console.log('✅ Admin şifrəsi uğurla yeniləndi!');
    console.log(`🔑 Yeni şifrə: ${newPassword}`);
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('❌ Xəta:', err.message);
    process.exit(1);
  }
}

main();
