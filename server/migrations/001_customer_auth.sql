CREATE TABLE IF NOT EXISTS customer_users (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  username_normalized TEXT NOT NULL UNIQUE,
  phone_e164 TEXT UNIQUE,
  email_normalized TEXT UNIQUE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_algorithm TEXT NOT NULL DEFAULT 'scrypt',
  phone_verified_at TIMESTAMPTZ,
  privacy_consent_at TIMESTAMPTZ NOT NULL,
  privacy_policy_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE customer_users ALTER COLUMN phone_e164 DROP NOT NULL;
ALTER TABLE customer_users ADD COLUMN IF NOT EXISTS email_normalized TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS customer_users_email_normalized_idx ON customer_users(email_normalized);

CREATE TABLE IF NOT EXISTS customer_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES customer_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_agent_hash TEXT
);

CREATE INDEX IF NOT EXISTS customer_sessions_user_id_idx ON customer_sessions(user_id);
CREATE INDEX IF NOT EXISTS customer_sessions_expires_at_idx ON customer_sessions(expires_at);

CREATE TABLE IF NOT EXISTS auth_attempts (
  attempt_key TEXT PRIMARY KEY,
  failure_count INTEGER NOT NULL,
  first_attempt_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
