# Header Favorites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the favorites trigger beside the account control and make the favorites drawer full-screen on mobile.

**Architecture:** Keep `favorites.js` as the sole owner of favorite state and drawer rendering. Replace the floating trigger styling with a header-action trigger that is inserted next to the existing account entry, while retaining a safe fallback host for pages whose header differs.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js test runner.

**Spec:** `docs/superpowers/specs/2026-10-28-responsive-admin-design.md` and `docs/superpowers/specs/2026-10-27-standalone-favorites-design.md`

## Global Constraints

- Preserve `bcf-favorites-v1` localStorage data and favorite counts.
- Preserve existing product-card heart buttons and safe product links.
- The trigger must not remain fixed at the lower-right corner.
- The drawer must fill the mobile viewport and respect safe-area insets.

## Review Focus

- Pages with different header markup must still receive exactly one trigger.
- Signed-in and signed-out account button text must not affect placement.
- A zero count must remain visible and accessible.
- Mobile drawer content must scroll without scrolling the page behind it.
- Favorite item links and remove buttons must keep their current behavior.

---

### Task 1: Header trigger and full-screen mobile drawer

**Files:**
- Modify: `tests/account-favorites.test.js`
- Modify: `favorites.js`
- Modify: `favorites.css`

**Interfaces:**
- Consumes: `#accountTrigger`, existing storefront header, and `BCFFavorites` storage helpers.
- Produces: one `.favorites-trigger` adjacent to account control and a mobile full-screen `.favorites-drawer`.

- [ ] **Step 1: Write failing placement and mobile-layout tests**

Assert that `favorites.js` inserts the trigger relative to `#accountTrigger`, does not append it as a floating body-only control, and that mobile CSS uses full viewport inset/width with no lower-right fixed trigger position.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/account-favorites.test.js`

Expected: FAIL on placement and mobile layout assertions.

- [ ] **Step 3: Implement header placement and mobile full-screen styling**

Insert the trigger immediately before or after the account control inside a dedicated header-actions wrapper when needed. Retain current count updates, drawer focus behavior, safe links, and remove actions.

- [ ] **Step 4: Run focused and full suites**

Run: `node --test tests/account-favorites.test.js tests/security/security.test.js && npm test`

Expected: all tests PASS.

- [ ] **Step 5: Visually verify**

Open coffee, tea, and equipment pages at desktop and mobile widths; verify one header trigger, live count, full-screen mobile drawer, item navigation, removal, and page scroll lock.

