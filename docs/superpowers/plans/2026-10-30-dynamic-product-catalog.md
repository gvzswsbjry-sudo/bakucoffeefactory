# Dynamic Product Catalog Implementation Plan

**Spec:** `docs/superpowers/specs/2026-10-30-dynamic-product-catalog-design.md`

1. Add failing tests for no-store API loading, page boot order, error handling, and removal of `api/catalog.js` from managed pages.
2. Add generic all-product loading and page boot helpers to `storefront-products.js`.
3. Add `storefront-bootstrap.js` and configure every product page with its page type.
4. Remove the generated catalog script dependency and ensure shop scripts load only after live API data.
5. Run focused tests, the full suite, and browser smoke checks for coffee, tea, equipment, and product detail pages.

