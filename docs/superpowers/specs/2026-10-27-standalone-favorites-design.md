# Ayrı Favorilər Bölməsi — Qısa Dizayn

## Məqsəd

Favoriləri hesab modalından ayırmaq, qonaq istifadəçilər üçün də hər səhifədən əlçatan etmək və favoritdəki məhsula toxunanda birbaşa həmin məhsula aparmaq.

## Yanaşmalar

- Hesab modalının içində saxlamaq: hazırkı davranışdır, amma istəyə ziddir.
- Ayrıca səhifə yaratmaq: işləyir, lakin qısa favorit siyahısı üçün lazımsız naviqasiya yaradır.
- Ayrı, sürüşən favorit paneli: seçilən yanaşmadır; səbət kimi hər səhifədə əlçatandır və cari səhifəni itirmir.

## Davranış

- Hesab pəncərəsində yalnız “Hesab məlumatları” və “Keçmiş sifarişlər” qalır.
- Ayrı ürək düyməsi cari favorit sayını göstərir və favorit panelini açır.
- Paneldəki hər kartın şəkli və mətni kliklənəndir; avadanlıq detal səhifəsinə, qəhvə və çay isə kataloqdəki müvafiq məhsula gedir.
- Sil düyməsi naviqasiya etmədən favoriti silir, sayğacı və kartlardakı ürəkləri yeniləyir.
- Boş siyahı aydın boş-vəziyyət mətni göstərir.
- Giriş rejimində qeydiyyata aid Telefon/E-poçt seçim sətri `hidden` qaydası ilə görünmür; qeydiyyatda funksiyası saxlanılır.

## Məhdudiyyətlər

- Mövcud `bcf-favorites-v1` localStorage formatı qorunur.
- Server və hesab tələb olunmur.
- Mövcud kart ürəkləri və səbət davranışı dəyişmir.
