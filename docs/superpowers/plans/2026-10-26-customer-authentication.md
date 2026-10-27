# Customer Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add publication-ready customer registration/login with international phone numbers, persistent PostgreSQL sessions, privacy consent, and guest storefront access.

**Architecture:** Keep the existing Node HTTP server and buildless storefront. Add a PostgreSQL-backed customer identity module and isolated auth routes; the existing admin authentication remains unchanged. A shared account UI progressively enhances storefront pages while the local cart remains independent.

**Tech Stack:** Node 24, `pg`, PostgreSQL, built-in `node:test`, HTML/CSS/JavaScript.

**Spec:** `docs/superpowers/specs/2026-10-26-customer-authentication-design.md`

## Global Constraints

- Accept `+` and any country code in E.164 form; do not default to `+994`.
- Do not store passwords or phone numbers in localStorage, cookies, or logs.
- Guest browsing and cart additions continue to work without `DATABASE_URL`.
- Admin and customer cookies/sessions are separate.
- Registration requires active privacy acceptance; preserve consent timestamp and policy version.
- Use `HttpOnly`, `SameSite=Lax`, `Path=/`, and production `Secure` for customer cookies.
- Keep the current `bcf-equipment-cart-v1` basket untouched through account transitions.

## Review Focus

- A malformed international phone number must not be silently changed into an Azerbaijan number.
- Two concurrent registrations for the same phone or username must yield one account, not a duplicate.
- A missing/unavailable database must not take public pages down.
- A session cookie stolen from the admin namespace must not authenticate as customer, or vice versa.
- An expired session must not continue to identify a customer after restart.

---

### Task 1: Database connection and migration

**Files:** `package.json`, `server/db.js`, `server/migrations/001_customer_auth.sql`, `scripts/migrate.js`, `tests/auth/db.test.js`, `README.md`.

**Interfaces:** `createDatabase({ connectionString })` returns `{ pool, migrate(), close() }`; a null database is allowed only for public browsing.

- [ ] Write failing tests for missing configuration, schema migration execution, and no secret in errors.
- [ ] Run `node --test tests/auth/db.test.js` and confirm failures are from missing implementation.
- [ ] Add `pg` dependency, connection pool, idempotent migration runner, and deployment instructions.
- [ ] Run `node --test tests/auth/db.test.js` and confirm green.

### Task 2: Customer identity and session service

**Files:** `server/customer-auth.js`, `tests/auth/customer-auth.test.js`.

**Interfaces:** `createCustomerAuth({ database, now })` returns `register`, `login`, `getSession`, `logout`; exports `normalizePhone`, `normalizeUsername`, `hashPassword`, `verifyPassword`.

- [ ] Write failing tests for E.164 phone normalization including non-994 codes, Unicode username uniqueness, password length/hash, consent, duplicate conflict, both login identifiers, token persistence/expiry, and rate limits.
- [ ] Run `node --test tests/auth/customer-auth.test.js` and confirm red.
- [ ] Implement service using parameterized SQL, transaction for registration/session, scrypt, hashed tokens, and database-backed attempts.
- [ ] Run `node --test tests/auth/customer-auth.test.js` and confirm green.

### Task 3: HTTP auth routes and server integration

**Files:** `server/customer-auth-routes.js`, `server/routes.js`, `server.js`, `tests/auth/routes.test.js`.

**Interfaces:** `handleCustomerAuthRequest(req, res, pathname, { customerAuth, secureCookies })` returns boolean if route handled.

- [ ] Write failing HTTP tests for register/login/me/logout, CSRF Origin mismatch, invalid JSON/content type, cookie flags, missing database `503`, session expiry, and unchanged admin routes.
- [ ] Run `node --test tests/auth/routes.test.js` and confirm red.
- [ ] Integrate customer auth without altering admin auth; resolve secure cookie mode from deployment configuration.
- [ ] Run `node --test tests/auth/routes.test.js` and confirm green.

### Task 4: Shared account UI and privacy page

**Files:** `account.js`, `account.css`, `mexfilik.html`, `index.html`, `menyu.html`, `qehveler.html`, `caylar.html`, `avadanliqlar.html`, `mehsul.html`, `tests/auth/account-ui.test.js`.

**Interfaces:** Account UI calls `/api/auth/*` with `credentials: same-origin`; it never changes shared cart storage.

- [ ] Write failing tests for accessible login/registration tabs, privacy checkbox/link, input types and viewport handling, all storefront headers, account state/logout, and cart persistence.
- [ ] Run `node --test tests/auth/account-ui.test.js` and confirm red.
- [ ] Add shared account controls, modal, styles, policy draft, and progressive enhancement scripts.
- [ ] Run `node --test tests/auth/account-ui.test.js` and confirm green.

### Task 5: Regression and deployment verification

**Files:** `README.md`, `tests/auth/deployment.test.js`.

- [ ] Write failing deployment test for `DATABASE_URL` and migration startup behavior.
- [ ] Run `node --test tests/auth/deployment.test.js` and confirm red.
- [ ] Finish environment documentation and startup integration.
- [ ] Run `npm test` and `node --test tests/auth/*.test.js`; record any blockers from an unavailable PostgreSQL service.

### Task 6: Header logo and dessert intro refinements

**Files:** `assets/brand/baku-coffee-factory-logo.jpg`, `brand.css`, storefront HTML, `script.js`, `tests/auth/brand-menu.test.js`.

- [ ] Write failing tests for the header logo asset and title that changes when Desert is selected and reverts for drink tabs.
- [ ] Run `node --test tests/auth/brand-menu.test.js` and confirm red.
- [ ] Place the supplied logo in the site asset tree, fit it in the header on desktop/mobile, and update menu intro on tab selection.
- [ ] Run `node --test tests/auth/brand-menu.test.js` and confirm green.

## Execution decision

The user previously asked not to be asked further implementation questions and approved the design. Execute natively in this workspace, test each task, and report any external database or legal-review prerequisites before publication.
