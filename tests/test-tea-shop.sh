#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
html="$project_dir/caylar.html"

fail() { printf 'FAIL: %s\n' "$1" >&2; exit 1; }

for required in \
  'id="floatingCartTrigger"' \
  'id="teaOrderModal"' \
  'id="teaCartToast"' \
  'id="teaQuantity"' \
  'input id="teaQuantity" type="text" inputmode="numeric" pattern="[0-9]*"' \
  'id="cartItems"' \
  'src="storefront-products.js' \
  'src="cart-utils.js' \
  'src="storefront-bootstrap.js' \
  'data-catalog-page="tea"'; do
  rg -Fq "$required" "$html" || fail "caylar.html daxilində $required yoxdur"
done

rg -Fq "tea: ['tea-data.js', 'tea-shop.js']" "$project_dir/storefront-products.js" || fail 'çay adapteri və mağaza skripti API məlumatından sonra yüklənmir'

rg -Fq "isWeight ? 'Maksimum 1 kq'" "$project_dir/tea-shop.js" || fail 'çəki limiti izahı yoxdur'

rg -Fq 'font: 600 16px var(--mono)' "$project_dir/cart.css" || fail 'mobil zoomun qarşısı üçün 16px miqdar sahəsi yoxdur'
rg -Fq "teaQuantity?.addEventListener('focus'" "$project_dir/tea-shop.js" || fail 'miqdar sahəsi fokusda görünən yerə sürüşmür'

for id in 1001-gece admiral geysa-qara jasmin limon malina meyveli portagal geysa-yasil mango-kuresi qara-cay; do
  rg -Fq "'$id'" "$project_dir/tea-data.js" || fail "$id qiymət məlumatında yoxdur"
done

rg -Fq '.cart-item-thumb' "$project_dir/cart.css" || fail 'səbət şəkli stili yoxdur'
rg -Fq 'position: static' "$project_dir/tea-mobile.css" || fail 'çay qiymətinin köhnə absolute mövqeyi sıfırlanmayıb'
rg -Fq '#dessertMenu .menu-group p' "$project_dir/menu-background.css" || fail 'desert oxunaqlığı qaydası yoxdur'

rg -Fq 'step = isWeight ? 50 : 1' "$project_dir/tea-shop.js" || fail 'çay miqdarı üçün 50 q addımı yoxdur'
rg -Fq 'Math.max(min, Number(teaQuantity.value) - step)' "$project_dir/tea-shop.js" || fail 'çay miqdarı azaltma addımı yoxdur'
rg -Fq 'Səbətə uğurla əlavə edildi' "$project_dir/tea-shop.js" || fail 'çay səbətə əlavə olunma bildirişi yoxdur'
rg -Fq 'closeTeaModal();' "$project_dir/tea-shop.js" || fail 'əlavədən sonra çay modalı bağlanmır'
rg -Fq 'showTeaToast();' "$project_dir/tea-shop.js" || fail 'əlavədən sonra çay bildirişi çağırılmır'

printf 'PASS: tea purchase UI, 50 g quantity step, and image basket structure are present.\n'
