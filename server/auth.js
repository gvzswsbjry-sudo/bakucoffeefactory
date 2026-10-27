'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const SESSION_TTL = 12 * 60 * 60 * 1000;

function createAuth({ configPath, now = () => Date.now() }) {
  const sessions = new Map();

  async function readConfig() {
    try {
      return JSON.parse(await fs.readFile(configPath, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw new Error(`Admin config could not be read: ${error.message}`);
    }
  }

  async function isConfigured() {
    return (await readConfig()) !== null;
  }

  function createSession() {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = now() + SESSION_TTL;
    sessions.set(token, expiresAt);
    return { token, expiresAt };
  }

  async function derive(password, salt) {
    return (await scrypt(password, Buffer.from(salt, 'hex'), 64)).toString('hex');
  }

  async function setup(password) {
    if (typeof password !== 'string' || password.length < 6) throw new Error('Password must be at least 6 characters');
    if (await isConfigured()) throw new Error('Admin password is already configured');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await derive(password, salt);
    const config = { algorithm: 'scrypt', salt, hash, createdAt: new Date(now()).toISOString() };
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    const tempPath = `${configPath}.tmp`;
    await fs.writeFile(tempPath, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
    await fs.rename(tempPath, configPath);
    return createSession();
  }

  async function login(password) {
    const config = await readConfig();
    if (!config) throw new Error('Admin password is not configured');
    const candidate = Buffer.from(await derive(String(password || ''), config.salt), 'hex');
    const expected = Buffer.from(config.hash, 'hex');
    if (candidate.length !== expected.length || !crypto.timingSafeEqual(candidate, expected)) {
      throw new Error('Invalid password');
    }
    return createSession();
  }

  function verifySession(token) {
    if (!token || !sessions.has(token)) return false;
    if (sessions.get(token) <= now()) {
      sessions.delete(token);
      return false;
    }
    return true;
  }

  function logout(token) {
    return sessions.delete(token);
  }

  return { isConfigured, setup, login, verifySession, logout };
}

module.exports = { createAuth, SESSION_TTL };
