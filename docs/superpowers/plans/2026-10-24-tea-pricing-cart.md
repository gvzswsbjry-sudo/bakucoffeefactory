# Tea Pricing and Cart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add photographed tea prices, a quantity modal capped at 1 kg, and image-rich shared basket rows while improving dessert readability.

**Architecture:** `tea-data.js` owns price metadata, `cart-utils.js` owns unit-aware basket math, and `tea-shop.js` progressively enhances the existing tea cards and modal. The equipment basket consumes the same cart utilities and stores variant images.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js tests, shell structure checks

**Spec:** `docs/superpowers/specs/2026-10-24-tea-pricing-cart-design.md`

## Global Constraints

- Use only prices visible in the supplied photos.
- Loose tea quantity must stay between 50 g and 1000 g in 50 g steps.
- Mango Kürəsi remains priced per piece.
- Preserve existing mobile navigation and product layouts.

## Review Focus

- Manual numeric input above 1000 g is clamped before basket insertion.
- Basket totals calculate per-100-g tea prices rather than multiplying by grams directly.
- Existing equipment basket entries still calculate per piece.
- Missing photographed prices do not produce active purchase controls.
- Basket rows show a thumbnail for both tea and newly added equipment entries.

---

### Task 1: Price and quantity rules

**Files:**
- Create: `tea-data.js`
- Create: `cart-utils.js`
- Test: `tests/test-tea-cart.js`

**Interfaces:**
- Produces: `TEA_PRODUCTS`, `getTeaProduct(id)`, `normalizeTeaQuantity(value, unit)`, `getCartItemTotal(item)`, `adjustCartItemQuantity(item, direction)`

- [ ] Write failing tests for photographed prices, gram clamping, per-100-g totals, per-piece totals, and quantity adjustment.
- [ ] Run `node tests/test-tea-cart.js` and confirm it fails because the modules do not exist.
- [ ] Implement the two modules with the exact price and quantity rules.
- [ ] Run `node tests/test-tea-cart.js` and confirm it passes.

### Task 2: Tea purchasing interface

**Files:**
- Modify: `caylar.html`
- Create: `tea-shop.js`
- Create: `cart.css`
- Modify: `tea-mobile.css`
- Test: `tests/test-tea-shop.sh`

**Interfaces:**
- Consumes: Task 1 APIs and localStorage key `bcf-equipment-cart-v1`.
- Produces: card price/actions, `#teaOrderModal`, and shared cart drawer interactions.

- [ ] Write a failing structure test for scripts, modal, cart, and purchasable-card metadata.
- [ ] Run `sh tests/test-tea-shop.sh` and confirm it fails on missing interface elements.
- [ ] Add the modal/drawer shells and progressively enhance matching tea cards.
- [ ] Add responsive styles and accessible close/Escape/overlay behavior.
- [ ] Run the tea tests and confirm they pass.

### Task 3: Shared basket thumbnails and dessert weight

**Files:**
- Modify: `gear-shop.js`
- Modify: `product-detail.js`
- Modify: `avadanliqlar.html`
- Modify: `gear.css`
- Modify: `menu-background.css`
- Test: `tests/test-equipment-product-details.js`
- Test: `tests/test-tea-shop.sh`

**Interfaces:**
- Consumes: Task 1 cart utilities.
- Produces: image metadata on equipment basket entries and visible basket thumbnails.

- [ ] Extend failing tests to require images in basket entries and the dessert readability class/rule.
- [ ] Update equipment add/render paths to include variant images and unit-aware math.
- [ ] Apply the small dessert font-weight override.
- [ ] Run all repository tests and browser QA on mobile and desktop widths.

