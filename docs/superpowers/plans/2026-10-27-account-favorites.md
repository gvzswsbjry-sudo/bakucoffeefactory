# Hesab mərkəzi və favorilər — icra planı

**Spec:** `docs/superpowers/specs/2026-10-27-account-favorites-design.md`

## Task 1: Naviqasiya və artıq mətnlər

**Files:** `qehveler.html`, `caylar.html`, `avadanliqlar.html`, `coffee-shop.js`, `tea-shop.js`, mövcud testlər.

1. Header/toolbar səbət düymələrinin və müvəqqəti qiymət qeydinin silinməsini tələb edən test yaz.
2. Testi işlədib tələb olunan səbəbdən qırıldığını yoxla.
3. Elementləri sil, cart aç/bağla kodunu null-safe et.
4. Fokusun üzən səbət düyməsinə qayıtmasını qoru.

## Task 2: Favorilər sistemi

**Files:** `favorites.js`, `favorites.css`, `script.js`, `server/routes.js`, `tests/account-favorites.test.js`.

1. Saxlama API-si və məhsul kartı favorit düymələri üçün test yaz.
2. `favorites.js`-də təhlükəsiz localStorage oxu/yazı, üç kataloq üçün descriptor və MutationObserver qur.
3. `favorites.css` ilə masaüstü və mobil düymələri dizayn et.
4. Shared script və server allowlist vasitəsilə assetləri bütün səhifələrə qoş.

## Task 3: Hesab mərkəzi və sifariş tarixçəsi

**Files:** `account.js`, `account.css`, `checkout.js`, `server/routes.js`, `tests/account-favorites.test.js`, `tests/admin/orders.test.js`.

1. Hesab tabları və hesablar arasında sifariş məxfiliyi üçün test yaz.
2. Profil, favorilər və sifarişlər tablarını render et; favorit dəyişikliklərini canlı dinlə.
3. Uğurlu checkout-u serverdə təsdiqlənmiş hesab ID-si ilə əlaqələndir və `/api/account/orders` marşrutundan yalnız həmin hesabın sifarişlərini göstər.
4. Fokus, boş vəziyyətlər və mobil görünüşü yoxla.

## Verification

- `node --test tests/account-favorites.test.js tests/auth/account-ui.test.js`
- `node tests/test-sticky-cart-and-logo.js`
- `npm test`

