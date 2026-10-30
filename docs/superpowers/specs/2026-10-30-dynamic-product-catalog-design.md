# Dynamic Product Catalog Design

## Goal

`qehveler.html`, `caylar.html`, `avadanliqlar.html`, and `mehsul.html` must use `GET /api/products` as their browser-side source of truth. A refresh after an admin change must show the current name, price, stock, image, active state, variants, and newly created products.

## Design

- `storefront-products.js` owns the public API fetch and requests it with `cache: "no-store"`.
- `storefront-bootstrap.js` starts one page-specific catalog boot promise.
- The promise stores the received rows in `window.BCF_PRODUCT_DATA`, renders coffee/tea markup, and then loads the existing page adapter and shop script in order.
- Equipment adapters continue to provide product/variant helpers, but receive the freshly fetched API rows before they are evaluated.
- The old generated `api/catalog.js` script is removed from product pages. `tea-data.js` is no longer a browser data source; when used by the tea page it adapts the already fetched API rows.
- If the API fails, stale catalog markup is replaced by an accessible error message and shopping code is not started.

## Compatibility

Static fallback datasets remain available to Node migration tests only. The browser path always waits for `/api/products`.

