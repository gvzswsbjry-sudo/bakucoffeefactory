# Standalone Favorites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move favorites out of the account modal into a dedicated, globally accessible drawer whose item links open the saved product.

**Architecture:** Keep `favorites.js` as the owner of localStorage and card heart state, and extend it to own the standalone trigger/drawer. Simplify `account.js` to account and order-history concerns only.

**Tech Stack:** Buildless HTML, CSS, vanilla JavaScript, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-27-standalone-favorites-design.md`

## Global Constraints

- Preserve `bcf-favorites-v1` data.
- Preserve guest favorites and existing product-card hearts.
- Do not alter cart behavior.

## Review Focus

- Empty or corrupt localStorage must render an empty state without crashing.
- Unsafe saved URLs and image paths must not be injected into the drawer.
- Remove action must not follow the product link.
- Escape and backdrop click must close the drawer and restore scrolling.
- Login mode must not show registration-only contact controls.

---

### Task 1: Separate favorites UI

**Files:**
- Modify: `tests/account-favorites.test.js`
- Modify: `favorites.js`
- Modify: `favorites.css`
- Modify: `account.js`
- Modify: `account.css`

**Interfaces:**
- Consumes: `BCFFavorites.read()` and `BCFFavorites.write(items)`.
- Produces: `#favoritesTrigger`, `.favorites-drawer`, linked favorite rows, live count.

- [ ] Write failing structural tests for standalone favorites and the reduced account tabs.
- [ ] Run the focused tests and verify the new assertions fail.
- [ ] Move favorites rendering/removal/open-close behavior to `favorites.js` and style it in `favorites.css`.
- [ ] Remove favorites data/UI from `account.js` and make hidden contact choice obey `[hidden]`.
- [ ] Run focused tests and the full suite.
