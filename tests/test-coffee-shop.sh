#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
html="$project_dir/qehveler.html"
script="$project_dir/coffee-shop.js"

fail() { printf 'FAIL: %s\n' "$1" >&2; exit 1; }

for required in \
  'id="floatingCartTrigger"' \
  'id="coffeeOrderModal"' \
  'id="coffeeQuantity"' \
  'id="coffeeCartDrawer"' \
  'id="coffeeCartToast"' \
  'src="storefront-products.js' \
  'src="storefront-bootstrap.js' \
  'data-catalog-page="coffee"'; do
  rg -Fq "$required" "$html" || fail "qehveler.html daxilində $required yoxdur"
done

rg -Fq "coffee: ['coffee-shop.js']" "$project_dir/storefront-products.js" || fail 'qəhvə mağaza skripti API məlumatından sonra yüklənmir'

rg -Fq 'maxQuantity: 2000' "$script" || fail 'qəhvə üçün 2 kq limiti yoxdur'
rg -Fq "className = 'coffee-buy'" "$script" || fail 'qəhvə kartlarında səbət düyməsi yaradılmır'
rg -Fq "normalizeTeaQuantity(value, 'g', 2000)" "$script" || fail 'qəhvə miqdarı 2 kq limit ilə normallaşdırılmır'
rg -Fq 'Səbətə uğurla əlavə edildi' "$script" || fail 'səbətə əlavə olunma bildirişi yoxdur'
rg -Fq 'closeCoffeeModal();' "$script" || fail 'əlavədən sonra miqdar pəncərəsi bağlanmır'
rg -Fq 'showCoffeeToast();' "$script" || fail 'əlavədən sonra bildiriş çağırılmır'

rg -Fq 'Math.max(50, Number(coffeeQuantity.value) - 50)' "$script" || fail 'qəhvə miqdarı üçün 50 q azaltma addımı yoxdur'
rg -Fq 'Math.min(2000, Number(coffeeQuantity.value) + 50)' "$script" || fail 'qəhvə miqdarı üçün 50 q artırma addımı yoxdur'

printf 'PASS: coffee purchase UI, 50 g quantity step, and 2 kg limit are present.\n'
