# Responsive Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the catalog, editor, dialogs, login, and order-management views comfortable on mobile, tablet, and desktop without changing admin behavior.

**Architecture:** Keep the existing semantic table and desktop sidebar, then progressively transform them with two CSS breakpoints. Add fixed, trusted `data-label` attributes to generated table cells so mobile cards remain understandable without duplicating product markup.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js test runner.

**Spec:** `docs/superpowers/specs/2026-10-28-responsive-admin-design.md`

## Global Constraints

- Desktop layout remains visually compatible with the current MacBook interface.
- Tablet breakpoint is `1100px`; mobile card breakpoint is `760px`.
- Existing create, edit, delete, filter, image, stock, and order behavior must not change.
- Mobile editor and dialogs must respect safe-area insets and dynamic viewport height.

## Review Focus

- A 320px-wide screen must not create horizontal page overflow.
- Long product names and IDs must truncate instead of expanding cards.
- Editor action buttons must remain reachable with the on-screen keyboard open.
- Category navigation must scroll horizontally without moving the whole page.
- Dialogs with many images must scroll internally and keep their close controls visible.

---

### Task 1: Responsive admin shell and catalog cards

**Files:**
- Modify: `tests/admin/admin-ui.test.js`
- Modify: `admin/admin.css`
- Modify: `admin/admin.js`

**Interfaces:**
- Consumes: existing product objects rendered by `renderProducts()`.
- Produces: static `data-label` attributes on table cells and responsive shell/card rules.

- [ ] **Step 1: Write failing structural tests**

Assert that the CSS no longer contains `body { min-width:1100px; }`, defines tablet/mobile breakpoints, converts table rows to cards below `760px`, uses `data-label`, provides horizontal category navigation, and prevents long names from widening cards.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/admin/admin-ui.test.js`

Expected: FAIL on missing responsive/card assertions.

- [ ] **Step 3: Add trusted cell labels in `renderProducts()` and responsive shell/card CSS**

Use fixed Azerbaijani labels for category, price, stock, status, and action. At `1100px`, move the sidebar to a compact sticky top region; at `760px`, hide the table header and display each row as a one-column product card.

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/admin/admin-ui.test.js`

Expected: PASS.

### Task 2: Responsive editor, authentication, and dialogs

**Files:**
- Modify: `tests/admin/admin-ui.test.js`
- Modify: `admin/admin.css`

**Interfaces:**
- Consumes: existing `#productEditor`, `#assetDialog`, `#deleteDialog`, and authentication markup.
- Produces: full-screen mobile editor, one-column forms, safe-area action bar, and bounded dialogs.

- [ ] **Step 1: Extend failing CSS tests**

Assert mobile full-width editor and footer, one-column `.form-grid`, responsive `.auth-card`, two-column asset thumbnails, safe-area padding, and `100dvh` fallback behavior.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/admin/admin-ui.test.js`

Expected: FAIL on editor/dialog assertions.

- [ ] **Step 3: Implement responsive editor and dialog rules**

Keep desktop widths unchanged; collapse editor grids and variant fields on mobile, make dialogs fit inside the viewport, and keep primary controls at least 44px high.

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/admin/admin-ui.test.js`

Expected: PASS.

### Task 3: Responsive order-management page and full verification

**Files:**
- Modify: `tests/admin/admin-ui.test.js`
- Modify: `admin/orders.html`

**Interfaces:**
- Consumes: existing order cards and status controls.
- Produces: mobile-safe order headers, items, filters, and status actions.

- [ ] **Step 1: Write failing order-layout assertions**

Assert that order cards stack their top section, item prices remain visible, and the status action becomes full width below `700px`.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/admin/admin-ui.test.js`

Expected: FAIL on the new order-layout assertions.

- [ ] **Step 3: Implement compact order-page rules**

Update the page-local CSS without changing `orders.js` or order state transitions.

- [ ] **Step 4: Run focused and full suites**

Run: `node --test tests/admin/admin-ui.test.js && npm test`

Expected: all tests PASS.

- [ ] **Step 5: Visually verify desktop and mobile**

Open `/admin/` and `/admin/orders.html` at desktop and approximately `390×844`; verify navigation, card list, editor, asset dialog, and order status controls.

