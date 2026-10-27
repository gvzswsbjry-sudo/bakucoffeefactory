# Hesab mərkəzi və favorilər — dizayn

## Məqsəd

Yuxarı naviqasiyada təkrarlanan səbət düymələrini vahid “Hesab” giriş nöqtəsi ilə əvəz etmək, səbəti yalnız üzən düymədə saxlamaq və qəhvə, çay, avadanlıq məhsullarını favoritlərə əlavə etməyə imkan vermək.

## İstifadəçi təcrübəsi

- Header-də “Hesab” düyməsi həmişə görünür. Daxil olmayan istifadəçiyə giriş/qeydiyyat, daxil olan istifadəçiyə hesab mərkəzi açılır.
- Hesab mərkəzində “Məlumatlar”, “Favorilər” və “Sifarişlər” bölmələri, həmçinin təhlükəsiz çıxış düyməsi olur.
- Favorilər qonaq istifadəçidə də cihazda saxlanır; hər məhsul kartının sağ yuxarı hissəsində ürək düyməsi olur.
- Giriş etmiş istifadəçinin sifarişləri serverdə hesab ID-si ilə əlaqələndirilir və hesab mərkəzində yalnız ona göstərilir. Qonaq sifarişləri hesab tarixçəsinə qarışmır.
- Səbətə giriş kataloqların aşağı sağındakı mövcud üzən düymə ilə davam edir.

## Məlumat modeli

- `bcf-favorites-v1`: `{ [key]: { key, id, category, name, image, price, url } }`
- Server sifariş qeydinə yalnız təsdiqlənmiş sessiyadan alınan `customerId` əlavə edir. `GET /api/account/orders` yalnız həmin ID-yə aid sifarişlərin məhdud xülasəsini qaytarır.

Favorilər hələlik cari brauzerdə saxlanır; hesablar arasında və ya cihazlar arasında sinxronizasiya ayrıca mərhələdə əlavə edilə bilər.

## Əlçatanlıq və mobil görünüş

- Ürək düymələri `aria-pressed` və aydın `aria-label` istifadə edir.
- Hesab bölmələri tab semantikasına malikdir və boş vəziyyətlər izahlıdır.
- Mobil panel tam eni aşmır, məhsul siyahıları toxunma üçün uyğun hündürlükdə qalır.

## Qəbul meyarları

1. Header və avadanlıq toolbar-ində təkrarlanan səbət düymələri yoxdur; üzən səbət işləyir.
2. “Qiymətlər müvəqqətidir...” yazısı yoxdur.
3. Qəhvə, çay və avadanlıq kartlarında favorit düyməsi var və seçim yenilənəndən sonra qalır.
4. Hesab paneli profil, favorilər, sifarişlər və çıxış funksiyalarını göstərir.
5. Giriş etmiş istifadəçinin uğurlu sifarişi onun tarixçəsində serverdən görünür; başqa hesab həmin sifarişi görə bilmir.

