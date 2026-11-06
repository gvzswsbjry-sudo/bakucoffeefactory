'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const SESSION_TTL = 12 * 60 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

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
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      throw new Error(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`);
    }
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
    const supplied = String(password || '');
    if (supplied.length > MAX_PASSWORD_LENGTH) throw new Error('Invalid password');
    if (typeof config.salt !== 'string' || !/^[a-f0-9]{32}$/i.test(config.salt) || typeof config.hash !== 'string' || !/^[a-f0-9]{128}$/i.test(config.hash)) {
      throw new Error('Admin password configuration is invalid');
    }
    const candidate = Buffer.from(await derive(supplied, config.salt), 'hex');
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

  async function setPassword(newPassword) {
    if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
      throw new Error(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`);
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await derive(newPassword, salt);
    const config = { algorithm: 'scrypt', salt, hash, updatedAt: new Date(now()).toISOString() };
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    const tempPath = `${configPath}.tmp`;
    await fs.writeFile(tempPath, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
    await fs.rename(tempPath, configPath);
    sessions.clear();
    return true;
  }

  return { isConfigured, setup, login, verifySession, logout, setPassword };
}

module.exports = { createAuth, SESSION_TTL, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH };
