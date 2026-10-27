#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
html="$project_dir/qehveler.html"
css="$project_dir/catalog.css"

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

assert_contains() {
  local file="$1"
  local text="$2"
  local label="$3"
  rg -Fq "$text" "$file" || fail "$label"
}

assert_card() {
  local class_name="$1"
  local title="$2"
  local price="$3"
  local image_name="$4"
  local card_line

  card_line="$(rg -F "coffee-profile $class_name" "$html" || true)"
  [[ -n "$card_line" ]] || fail "$title kartı yoxdur"

  for required in "$title" "100 q" "$price" "Turşuluq" "Bədən" "Balans" \
    "Dad notları" "Uyğun dəmləmə" "Qovrum"; do
    [[ "$card_line" == *"$required"* ]] || fail "$title kartında '$required' yoxdur"
  done

  [[ "$card_line" == *"<img src=\"assets/coffee-origins/$image_name\""* ]] || \
    fail "$title kartında birbaşa məhsul şəkli yoxdur"

  [[ -s "$project_dir/assets/coffee-origins/$image_name" ]] || fail "$title şəkli yoxdur və ya boşdur"
}

for existing in Colombia Guatemala Brasil Honduras Robusta "Costa Rica"; do
  assert_contains "$html" "<h2>$existing</h2>" "Mövcud $existing kartı qorunmayıb"
done

while IFS= read -r card_line; do
  [[ "$card_line" == *'<details class="coffee-more"><summary>Daha çox'* ]] || fail "Kartda açılan Daha çox bölməsi yoxdur"
  visible_part="${card_line%%<details class=*}"
  [[ "$visible_part" == *'Dad notları'* ]] || fail "Dad notları birbaşa görünmür"
  [[ "$visible_part" != *'coffee-summary'* && "$visible_part" != *'Uyğun dəmləmə'* && "$visible_part" != *'Qovrum'* ]] || fail "Geniş məlumat bağlı bölmədən kənardadır"
done < <(rg '^<article class="coffee-profile ' "$html")

assert_card efiopiya Efiopiya "13.00 ₼" efiopiya.jpeg
assert_card keniya Keniya "8.00 ₼" keniya.jpeg
assert_card decaf Decaf "12.00 ₼" decaf.jpeg
assert_card uqanda Uqanda "11.00 ₼" uqanda.jpeg

assert_contains "$html" 'catalog.css?v=20261025-coffee-cart2' "Qəhvə kataloqu stylesheet-i keşdən qorunmur"
assert_contains "$css" 'grid-template-columns: repeat(3, minmax(0, 1fr));' "Masaüstü qəhvə kataloqu 3 sütun deyil"
assert_contains "$css" '.coffee-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));' "Mobil qəhvə kataloqu iki sütun deyil"
assert_contains "$css" '.coffee-photo { position: relative; aspect-ratio:' "Qəhvə şəkillərinin sabit nisbəti yoxdur"
assert_contains "$css" '.coffee-photo > img { position: absolute; inset: 0;' "Yeni qəhvə şəkilləri fotonun içində sabitlənməyib"
if rg -q '\.coffee-profile\.(efiopiya|keniya|decaf|uqanda) \.coffee-photo \{ background-image: url' "$css"; then
  fail "Yeni qəhvə şəkilləri həm fon, həm də img kimi təkrarlanır"
fi

card_count="$(rg -o 'class="coffee-profile [^"]+"' "$html" | wc -l | tr -d ' ')"
[[ "$card_count" == "10" ]] || fail "10 qəhvə kartı gözlənilirdi, $card_count tapıldı"

printf 'PASS: 10 qəhvə kartı, qiymətlər, profil sahələri və şəkillər yoxlanıldı.\n'
