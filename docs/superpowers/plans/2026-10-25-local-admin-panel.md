# Local Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localhost-only admin panel that persistently manages coffee, tea, and equipment products and makes those changes visible on the existing storefront.

**Architecture:** Replace the Python static server with a dependency-free Node.js HTTP server bound to `127.0.0.1:8017`. The server owns an atomically written `data/products.json`, exposes authenticated admin APIs plus read-only storefront APIs, and serves the existing site and a new `/admin/` interface.

**Tech Stack:** Node.js built-ins (`node:http`, `node:fs/promises`, `node:crypto`, `node:test`), existing HTML/CSS/vanilla JavaScript.

**Spec:** `docs/superpowers/specs/2026-10-25-local-admin-panel-design.md`

## Global Constraints

- The admin server binds to `127.0.0.1` only; it must not expose admin routes to the LAN.
- Product writes use temporary-file-plus-rename atomic persistence.
- The first admin visit creates a password; only a salted hash is persisted.
- No cloud service or third-party runtime dependency is introduced.
- Existing storefront design, mobile two-column catalogs, basket behavior, prices, product variants, and product IDs remain compatible.
- Product images in v1 must be selected from existing files under `assets/`; arbitrary filesystem paths are rejected.
- Orders and checkout management are out of scope.
- The project is not currently a Git repository; each task ends with a verification checkpoint rather than a commit unless version control is initialized separately.

## Review Focus

- Reject negative/NaN prices, invalid category/unit values, duplicate IDs, and `../` image paths; pin in Task 1 validation tests.
- Never leave truncated JSON after interrupted or concurrent saves; pin in Task 1 atomic-write tests.
- Return `401` for every admin mutation without a valid session while keeping storefront reads public; pin in Task 2 API tests.
- Preserve the last valid product file and return an actionable error when JSON is missing or malformed; pin in Task 1 recovery tests.
- Hide inactive/out-of-stock products appropriately without breaking old basket lines; pin in Task 5 storefront integration tests.

---

### Task 1: Product schema and atomic local storage

**Files:**
- Create: `server/product-schema.js`
- Create: `server/product-store.js`
- Create: `tests/admin/product-store.test.js`
- Create: `data/.gitkeep`

**Interfaces:**
- Produces: `validateProduct(product): { ok: boolean, errors: string[] }`
- Produces: `createProductStore({ filePath, assetsRoot }): { list, get, create, update, remove, replaceAll }`
- Product fields: `id`, `category`, `name`, `price`, `unit`, `image`, `description`, `active`, `stock`, `sortOrder`, `meta`, `variants`.
- Stock shape: `{ status: "available" | "out" | "counted", quantity: number | null }`.

- [ ] **Step 1: Write failing schema tests**

Cover valid coffee/tea/equipment records and rejection of negative price, unknown category/unit, duplicate ID, invalid stock count, and images escaping `assets/`.

- [ ] **Step 2: Run schema tests and verify RED**

Run: `node --test tests/admin/product-store.test.js`

Expected: FAIL because `server/product-schema.js` and store interfaces do not exist.

- [ ] **Step 3: Implement `validateProduct(product)`**

Allow categories `coffee`, `tea`, `equipment`; units `g`, `piece`; require finite non-negative price, stable string ID, boolean `active`, valid stock object, and `assets/`-relative image paths.

- [ ] **Step 4: Add failing storage tests**

Test CRUD, duplicate creation, missing/malformed JSON recovery, two sequential saves, and that failed rename/write leaves the previous valid file readable.

- [ ] **Step 5: Implement `createProductStore(...)`**

Load on demand, validate the full collection before saving, write `products.json.tmp`, `fsync`, then rename. Keep `products.json.bak` as the last valid snapshot and serialize writes through one promise queue.

- [ ] **Step 6: Run Task 1 tests**

Run: `node --test tests/admin/product-store.test.js`

Expected: all schema, recovery, and atomic-write tests PASS.

### Task 2: Local authentication and HTTP API

**Files:**
- Create: `server/auth.js`
- Create: `server/routes.js`
- Create: `server.js`
- Create: `tests/admin/server.test.js`
- Create: `package.json`

**Interfaces:**
- Consumes: `createProductStore(...)` from Task 1.
- Produces: `createAuth({ configPath }): { isConfigured, setup, login, verifySession, logout }`.
- Produces: `createServer({ rootDir, port, host }): http.Server`.
- Public: `GET /api/products`, `GET /api/products/:id`.
- Admin: `GET/POST /api/admin/session`, `DELETE /api/admin/session`, CRUD under `/api/admin/products`, `GET /api/admin/assets`.

- [ ] **Step 1: Write failing authentication tests**

Test first-run setup, minimum six-character password, salted `scrypt` hash persistence, successful/failed login, HttpOnly SameSite=Strict session cookie, logout, and session expiry.

- [ ] **Step 2: Run authentication tests and verify RED**

Run: `node --test tests/admin/server.test.js`

Expected: FAIL because auth and server modules do not exist.

- [ ] **Step 3: Implement `createAuth(...)`**

Persist only salt and derived hash in `data/admin-config.json`; keep opaque session tokens in memory with a 12-hour expiry.

- [ ] **Step 4: Add failing API tests**

Test public reads without login, `401` on every unauthenticated mutation, JSON content types, validation `400`, missing ID `404`, localhost binding, traversal rejection, and recursive asset listing limited to supported image extensions under `assets/`.

- [ ] **Step 5: Implement the HTTP server and routes**

Serve static files safely, parse JSON bodies with a 1 MB limit, route API requests, and bind to `127.0.0.1:8017` by default.

- [ ] **Step 6: Add project scripts**

Define `npm start` as `node server.js` and `npm test` as the complete Node plus existing shell test suite.

- [ ] **Step 7: Run Task 2 tests**

Run: `node --test tests/admin/server.test.js`

Expected: all auth, API, static-file, and access-control tests PASS.

### Task 3: Migrate current catalog into one product file

**Files:**
- Create: `scripts/build-products-data.js`
- Create: `data/products.json`
- Create: `tests/admin/product-migration.test.js`
- Read: `tea-data.js`
- Read: `equipment-data.js`
- Read: `qehveler.html`

**Interfaces:**
- Consumes: the Task 1 product schema.
- Produces: `buildProductsData(): Product[]` with all current IDs, prices, images, descriptions, variants, and category metadata.

- [ ] **Step 1: Write failing migration tests**

Assert exact current catalog counts, the ten coffee IDs/prices, all 17 tea IDs/prices/units, every equipment product and variant, unique IDs, existing image files, and preserved sort order.

- [ ] **Step 2: Run migration tests and verify RED**

Run: `node --test tests/admin/product-migration.test.js`

Expected: FAIL because the builder and unified JSON do not exist.

- [ ] **Step 3: Implement `buildProductsData()`**

Map existing tea/equipment exports and an explicit coffee seed into the Task 1 schema. Preserve category-specific data inside `meta` and variant-specific prices/images inside `variants`.

- [ ] **Step 4: Generate and validate `data/products.json`**

Run: `node scripts/build-products-data.js`

Expected: writes formatted UTF-8 JSON only after the full collection validates.

- [ ] **Step 5: Run migration and legacy catalog tests**

Run: `node --test tests/admin/product-migration.test.js && bash tests/test-coffee-origins.sh && node tests/test-tea-cart.js && node tests/test-equipment-product-details.js`

Expected: all PASS with unchanged current prices and product IDs.

### Task 4: MacBook desktop admin interface

**Files:**
- Create: `admin/index.html`
- Create: `admin/admin.css`
- Create: `admin/admin-api.js`
- Create: `admin/admin.js`
- Create: `tests/admin/admin-ui.test.js`

**Interfaces:**
- Consumes: Task 2 session, product CRUD, and asset APIs.
- Produces: `adminApi` methods `getSession`, `setup`, `login`, `logout`, `listProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `listAssets`.

- [ ] **Step 1: Write failing admin UI structure tests**

Assert accessible setup/login forms, category tabs, search, active/stock filters, product list, create/edit drawer, validation summary, unsaved-change warning, asset picker, save/cancel controls, and delete confirmation dialog.

- [ ] **Step 2: Run admin UI tests and verify RED**

Run: `node --test tests/admin/admin-ui.test.js`

Expected: FAIL because admin files do not exist.

- [ ] **Step 3: Implement auth and API client states**

Render first-run setup, login, expired-session recovery, loading, offline/server error, and logout without exposing the password in storage or URLs.

- [ ] **Step 4: Implement product list and filters**

Show category counts, search by normalized name/ID, active/stock filters, price/status labels, and empty states. Use the existing cream/brown/green design language.

- [ ] **Step 5: Implement create/edit drawer**

Support required base fields, category metadata, variant rows, existing asset selection with preview, client-side validation, cancel/reset, and save success/error feedback.

- [ ] **Step 6: Implement destructive confirmation**

Require an explicit confirm dialog naming the product before calling DELETE; preserve the editor state when deletion fails.

- [ ] **Step 7: Add MacBook layout tests**

Assert 1280 px and 1440 px layouts keep the sidebar fixed, product table readable, editor scrollable, action buttons reachable, and no horizontal page overflow.

- [ ] **Step 8: Run Task 4 tests**

Run: `node --test tests/admin/admin-ui.test.js`

Expected: all structure, state, accessibility, and responsive checks PASS.

### Task 5: Connect storefront pages to the product API

**Files:**
- Create: `storefront-products.js`
- Create: `tests/admin/storefront-products.test.js`
- Modify: `tea-data.js`
- Modify: `tea-shop.js`
- Modify: `coffee-shop.js`
- Modify: `equipment-data.js`
- Modify: `equipment-shop.js`
- Modify: `qehveler.html`
- Modify: `caylar.html`
- Modify: `avadanliqlar.html`

**Interfaces:**
- Consumes: public `GET /api/products` from Task 2 and unified schema from Task 1.
- Produces: `loadStorefrontProducts(category): Promise<Product[]>` and category adapters preserving existing cart item IDs and renderer inputs.

- [ ] **Step 1: Write failing storefront adapter tests**

Test category filtering, `active:false` exclusion, out-of-stock disabling, counted stock labels, variant mapping, stable cart IDs, API failure state, and preservation of already stored basket lines.

- [ ] **Step 2: Run adapter tests and verify RED**

Run: `node --test tests/admin/storefront-products.test.js`

Expected: FAIL because the storefront loader does not exist.

- [ ] **Step 3: Implement `loadStorefrontProducts(category)`**

Fetch once per page, validate the response shape, filter inactive products, and return an explicit typed error result rather than silently showing stale hardcoded data.

- [ ] **Step 4: Adapt the tea page**

Render tea cards and purchase metadata from API products while keeping “Daha çox,” 5 g quantity selection, 1 kg maximum, current images, two-column mobile layout, and shared cart behavior.

- [ ] **Step 5: Adapt the coffee page**

Render all coffee profile fields and purchase metadata from API products while keeping checkerboard colors, score bars, “Daha çox,” 5 g selection, 2 kg maximum, toast confirmation, and shared cart behavior.

- [ ] **Step 6: Adapt equipment listing and details**

Render products/variants from API data while keeping grouping, color swatches, variant price/image changes, filters, sorting, detail URLs, and cart behavior.

- [ ] **Step 7: Implement storefront failure and stock states**

Show a compact retry message if the API is unavailable. Disable add-to-cart for out-of-stock products; do not delete old basket entries automatically, but label them unavailable in the drawer.

- [ ] **Step 8: Run Task 5 and all legacy tests**

Run: `node --test tests/admin/storefront-products.test.js && npm test`

Expected: all new and existing storefront tests PASS.

### Task 6: End-to-end startup and operator documentation

**Files:**
- Create: `ADMIN.md`
- Create: `scripts/start-local-admin.sh`
- Create: `tests/admin/startup.test.js`
- Modify: `README.md` if present

**Interfaces:**
- Consumes: completed server, admin UI, product data, and storefront adapters.
- Produces: one local startup command and recovery instructions.

- [ ] **Step 1: Write failing startup smoke test**

Start the server on an ephemeral port; verify `/`, `/admin/`, public products, setup/login, authenticated edit, persisted reload, storefront visibility, and clean shutdown.

- [ ] **Step 2: Run startup test and verify RED**

Run: `node --test tests/admin/startup.test.js`

Expected: FAIL until the launcher and complete flow are wired.

- [ ] **Step 3: Implement the launcher**

Check Node availability, stop with a clear message if port 8017 is occupied, start `server.js`, and print the storefront and admin URLs without opening external services.

- [ ] **Step 4: Write operator documentation**

Document first password setup, startup/shutdown, product edits, image selection, backup recovery from `products.json.bak`, password reset, and the localhost-only limitation.

- [ ] **Step 5: Run the full verification suite**

Run: `npm test`

Expected: all admin, API, migration, responsive, storefront, basket, equipment, tea, coffee, and startup tests PASS with zero failures.

