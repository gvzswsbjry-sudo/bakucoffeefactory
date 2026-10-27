# New Equipment Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add five supplied equipment photos without creating duplicate catalog cards.

**Architecture:** Keep `equipment-data.js` as the single product source. Add the three cezves, the ornate hand grinder, and the six-cup serving set as variants of existing products so catalog, detail gallery, pricing, and cart continue to use the existing flow.

**Tech Stack:** Static HTML, CSS, JavaScript, Node assertions.

**Spec:** User request in this chat; extends `docs/superpowers/specs/2026-10-24-equipment-product-details-design.md`.

## Global Constraints

- Preserve 12 catalog product groups.
- Increase selectable variants from 17 to 22.
- Use temporary `1.00 ₼` pricing.
- Store copied images locally in `assets/equipment/`.

## Review Focus

- Every supplied image is reachable through a detail-page variant.
- Cezves remain one product with four choices.
- Manual grinders remain one product with two choices.
- Serving sets remain one product with two choices.
- Wide serving-set images use `contain` and do not crop.

### Task 1: Variant data and assets

**Files:**
- Modify: `tests/test-equipment-product-details.js`
- Modify: `tests/test-equipment-shop.sh`
- Modify: `equipment-data.js`
- Add: `assets/equipment/oriental-serving-set-six-cup.jpg`
- Add: `assets/equipment/brass-cezve-classic.jpg`
- Add: `assets/equipment/brass-cezve-fluted.jpg`
- Add: `assets/equipment/brass-cezve-lidded.jpg`
- Add: `assets/equipment/ornate-manual-grinder.jpg`

- [ ] Add assertions for 12 groups, 22 variants, grouped variant IDs, image paths, and temporary prices.
- [ ] Run the equipment tests and confirm they fail because the new variants are absent.
- [ ] Copy the five assets and add the variants to the existing product records.
- [ ] Run the equipment tests and confirm they pass.

### Task 2: Generalized variant labels and visual verification

**Files:**
- Modify: `gear-shop.js`
- Modify: `mehsul.html`
- Modify: `product-detail.js`
- Modify: `avadanliqlar.html`

- [ ] Change product-card copy from “rəng seçimi” to “seçim” and detail copy from “Rəng” to “Variant”.
- [ ] Bump local asset versions to avoid stale browser caches.
- [ ] Verify in the browser that grouped cards have the correct choice counts, arrows/swatches change all supplied images, and there are no console errors.
