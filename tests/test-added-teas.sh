#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
html="$project_dir/caylar.html"

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

assert_tea() {
  local id="$1"
  local title="$2"
  local image="$3"
  local card

  card="$(rg -U "id=\"$id\"[\\s\\S]*?</article>" "$html" || true)"
  [[ -n "$card" ]] || fail "$title kartı yoxdur"
  for required in "$title" "Dad notları" "Dəmləmə" "assets/tea-packages/$image"; do
    [[ "$card" == *"$required"* ]] || fail "$title kartında '$required' yoxdur"
  done
  [[ -s "$project_dir/assets/tea-packages/$image" ]] || fail "$title şəkli yoxdur"
  rg -Fq "href=\"#$id\"" "$html" || fail "$title sürətli keçiddə yoxdur"
}

assert_tea geysa-yasil "Geyşa Yaşıl" geysa-yasil.jpg
assert_tea yasil-cay "Yaşıl Çay" yasil-cay.jpg
assert_tea mango-kuresi "Mango Kürəsi" mango-kuresi.jpg
assert_tea mango-cayi "Mango Çayı" mango-cayi.jpg
assert_tea qara-cay "Qara Çay" qara-cay.jpg
assert_tea jasminli-qara "Jasminli Qara Çay" jasminli-qara-cay.jpg
assert_tea hibiskus "Hibiskus" hibiskus.jpg

rg -Fq 'Yarpaqlı çay kolleksiyası · 17 seçim' "$html" || fail "Kolleksiya sayı 17 deyil"
card_count="$(rg -c '<article class="tea-product"' "$html")"
[[ "$card_count" == "17" ]] || fail "17 çay kartı gözlənilirdi, $card_count tapıldı"

printf 'PASS: 7 yeni çay və 17 kartlıq kolleksiya yoxlanıldı.\n'
