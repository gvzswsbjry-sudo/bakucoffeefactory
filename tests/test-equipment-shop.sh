#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

for image in \
  french-press.jpg \
  manual-grinder-wood.jpg \
  moka-pot.jpg \
  brass-cezve.jpg \
  gooseneck-kettle.jpg \
  decorative-dallah.jpg \
  manual-press.jpg \
  wheel-grinder.jpg \
  glass-server-400ml.jpg \
  azerbaijan-coffee-set-bronze.jpg \
  silver-dallah.jpg \
  espresso-tamper-wood.jpg \
  espresso-tamper-silver.jpg \
  espresso-tamper-black.jpg \
  oriental-serving-set.jpg \
  classic-moka-pot-gray.jpg \
  azerbaijan-coffee-set-silver.jpg \
  oriental-serving-set-six-cup.jpg \
  brass-cezve-classic.jpg \
  brass-cezve-fluted.jpg \
  brass-cezve-lidded.jpg \
  ornate-manual-grinder.jpg
do
  test -f "assets/equipment/$image" || {
    echo "Missing equipment image: $image" >&2
    exit 1
  }
  grep -q "assets/equipment/$image" equipment-data.js || {
    echo "Image is not used in equipment data: $image" >&2
    exit 1
  }
done

grep -q 'id="shopFilters"' avadanliqlar.html
grep -q 'id="shopSort"' avadanliqlar.html
grep -q 'data-filter="accessory"' avadanliqlar.html
grep -q '13 məhsul · 24 seçim' avadanliqlar.html
grep -q 'id="cartCount"' avadanliqlar.html
grep -q 'id="cartDrawer"' avadanliqlar.html
grep -q 'id="cartItems"' avadanliqlar.html
grep -q 'src="equipment-data.js' avadanliqlar.html
grep -q 'src="gear-shop.js' avadanliqlar.html

grep -q 'id="productDetail"' mehsul.html
grep -q 'id="detailImage"' mehsul.html
grep -q 'id="variantSwatches"' mehsul.html
grep -q 'id="detailPrev"' mehsul.html
grep -q 'id="detailNext"' mehsul.html
grep -q 'src="equipment-data.js' mehsul.html
grep -q 'src="product-detail.js' mehsul.html

node tests/test-equipment-product-details.js

echo "Equipment shop structure is valid."
