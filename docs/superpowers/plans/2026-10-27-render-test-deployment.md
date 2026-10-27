# Render Test Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish the existing Node.js shop on a free Render URL for short multi-device testing without exposing local customer, order, or admin credentials.

**Architecture:** Store the source in a private GitHub repository and deploy it as a Render Blueprint containing one free Node.js web service and one free PostgreSQL database. Runtime JSON orders, admin credentials, uploads, and environment secrets stay outside Git; the free service remains explicitly test-only because its filesystem is ephemeral.

**Tech Stack:** Node.js 20+, PostgreSQL, GitHub, Render Blueprint

**Spec:** User-requested temporary public test deployment on 2026-10-27.

## Global Constraints

- Do not commit `data/admin-config.json`, `data/orders.json`, uploaded images, `.env` files, or database credentials.
- Bind the Render service to `0.0.0.0` and Render's supplied `PORT`.
- Use HTTPS and `NODE_ENV=production`.
- Treat Render Free as a temporary test environment; do not promise durable orders, uploads, or database availability.

## Review Focus

- A fresh clone must install with `npm ci` and start without local admin/order files.
- The application must accept Render's dynamic port and public network interface.
- Customer account APIs must receive `DATABASE_URL` from the managed database.
- No customer phone numbers, password hashes, or local secrets may appear in Git history.
- The published root path must return the storefront successfully.

---

### Task 1: Safe repository boundary

**Files:**
- Create: `.gitignore`
- Verify: `data/admin-config.json`, `data/orders.json`, `assets/uploads/`, `.env*`

- [ ] Add runtime and secret paths to `.gitignore`.
- [ ] Initialize Git and verify ignored files do not appear in `git status`.
- [ ] Run the existing test suite.

### Task 2: Render Blueprint

**Files:**
- Create: `render.yaml`

- [ ] Define the free Node.js web service and free PostgreSQL database.
- [ ] Configure `npm ci --omit=dev`, `npm start`, `NODE_ENV=production`, `HOST=0.0.0.0`, and database linkage.
- [ ] Validate YAML syntax and local production startup behavior.

### Task 3: Private GitHub repository and deployment

**Files:**
- Repository metadata only.

- [ ] Create a private GitHub repository and push the sanitized initial commit.
- [ ] Connect the repository to Render as a Blueprint.
- [ ] Deploy and confirm the public HTTPS URL loads.
- [ ] Smoke-test storefront, account registration, cart, order submission, and admin setup.

