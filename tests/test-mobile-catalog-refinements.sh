#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

# Mobile menu tabs are part of the sticky header, so no content can appear
# between the main navigation and the menu choices.
grep -q 'menu-tabs-bar-mobile' menyu.html
grep -q 'menu-tabs-bar:not(.menu-tabs-bar-mobile)' menu-mobile.css
grep -q 'position: static;' menu-mobile.css

# Tea cards keep their purchase row aligned, while the long explanation stays
# behind a native, accessible "Daha çox" disclosure.
grep -q 'className = .tea-more.' tea-shop.js
grep -q 'Daha çox' tea-shop.js
grep -q '^  display: flex;$' tea-mobile.css
grep -q '^  margin-top: auto;$' tea-mobile.css

# The corrected single-piece prices are stored in the product data.
grep -q "'mango-kuresi': { name: 'Mango Kürəsi'.*price: 2.4, unit: 'piece'" tea-data.js
grep -q "'jasmin': { name: 'Jasmin Çayı'.*price: 2, unit: 'piece'" tea-data.js

# Coffee cards alternate warm and light backgrounds like a checkerboard.
grep -q '.coffee-profile:nth-child(odd) { border-right: 1px solid var(--line); background: #ded1bf; }' catalog.css
grep -q '.coffee-profile:nth-child(even) { background: #f4efe6; }' catalog.css

# The mobile tea hero is intentionally more compact.
grep -A3 '^\.tea-hero {' tea-mobile.css | grep -q 'min-height: 460px;'

echo "Mobile catalog refinements are valid."
