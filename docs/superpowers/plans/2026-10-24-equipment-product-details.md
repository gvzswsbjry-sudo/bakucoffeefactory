# Avadanlıq məhsul səhifəsi — icra planı

## Fayl xəritəsi

- `equipment-data.js`: məhsul qrupları və variantların vahid məlumat mənbəyi.
- `avadanliqlar.html`: kataloq qabığı və yeni məhsul sayğacı.
- `gear-shop.js`: kataloqu məlumatdan yaratmaq, kart keçidi, filtr və dəyişən qiymətli səbət.
- `mehsul.html`: ayrıca məhsul səhifəsi.
- `product-detail.js`: URL, variant naviqasiyası, rəng seçimi və səbət davranışı.
- `gear.css`: kataloq və məhsul səhifəsinin responsive dizaynı, kəsilməyən şəkil qaydası.
- `tests/test-equipment-product-details.js`: real məhsul məlumatı və variant seçimi davranışları.
- `tests/test-equipment-shop.sh`: hər iki səhifənin inteqrasiya strukturu.

## Addımlar

1. Məhsul qruplaşdırması, unikal variantlar, dövr edən naviqasiya və dəyişən qiymət üçün uğursuz testlər yaz və işə sal.
2. `equipment-data.js` məlumat modelini və saf seçim funksiyalarını yaz; testləri yaşıl et.
3. Kataloq inteqrasiya testini 12 qrup/17 seçim, məhsul linkləri və tam-kadr servis şəkli üçün əvvəlcə uğursuzlaşdır.
4. Kataloqu vahid məlumatdan render et, kart keçidini və qiymətə həssas səbəti tətbiq et.
5. Məhsul səhifəsini, oxları və rəng dairələrini yaz; inteqrasiya testini yaşıl et.
6. Masaüstü və mobil CSS-i tamamla, brauzerdə şəkil kəsilməsini və interaksiyaları yoxla.
7. Bütün sayt testlərini, JS sintaksis yoxlamalarını və brauzer xəta jurnalını yenidən işə sal.
