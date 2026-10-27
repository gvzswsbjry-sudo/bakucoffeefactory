# Lokal admin panel — dizayn

## Məqsəd

Baku Coffee Factory saytındakı qəhvə, çay və avadanlıq məhsullarını kod fayllarına əl ilə toxunmadan lokal admin səhifəsindən idarə etmək. Sistem hələ yayımlanmadan Mac-da işləyəcək və sonradan onlayn hostinqə köçürülə biləcək.

## Seçilmiş yanaşma

Lokal server və layihə daxilində JSON məlumat faylı istifadə ediləcək.

- `http://127.0.0.1:8017/admin/` admin paneli açacaq.
- Kiçik Node.js server statik saytı və admin API-sini təqdim edəcək.
- Məhsullar `data/products.json` faylında saxlanacaq.
- Şəkillər layihənin `assets/` qovluğunda qalacaq.
- Admin dəyişiklikləri təhlükəsiz şəkildə əvvəl müvəqqəti fayla yazılıb sonra əsas faylla əvəzlənəcək.

## Niyə bu yanaşma

### Seçilən: lokal server + JSON

Məlumatlar brauzer keşindən asılı olmur, layihə ilə birlikdə qalır və sonradan verilənlər bazasına köçürülə bilir.

### Alternativ: localStorage

Daha sadədir, amma məlumat yalnız bir brauzerdə qalır və keş silinəndə itə bilər. Daimi idarəetmə üçün uyğun deyil.

### Alternativ: Supabase

Login və uzaqdan idarəetmə üçün daha güclüdür, amma hazırda hesab, internet və cloud konfiqurasiyası tələb edir. Sayt yayımlananda ikinci mərhələ kimi daha uyğundur.

## Birinci versiyanın imkanları

- Qəhvə, çay və avadanlıq məhsullarını siyahıda göstərmək
- Yeni məhsul əlavə etmək
- Mövcud məhsulu redaktə etmək
- Qiyməti və ölçü vahidini dəyişmək
- Şəkil yolunu seçmək və önizləmək
- Məhsulu aktiv/passiv etmək
- Stok vəziyyətini `stokda var`, `bitib` və ya sayla göstərmək
- Kateqoriya üzrə filtr və adla axtarış
- Dəyişiklikləri yadda saxlamaq və ləğv etmək
- Məhsulu silməzdən əvvəl təsdiq istəmək

## Admin ekranının quruluşu

Sol tərəfdə qəhvə, çay və avadanlıq kateqoriyaları olacaq. Əsas hissədə məhsul cədvəli/kartları, yuxarıda axtarış və “Yeni məhsul” düyməsi görünəcək. Məhsula klikləyəndə MacBook ekranı üçün optimallaşdırılmış redaktə paneli açılacaq.

Admin panel saytın mövcud krem, qəhvəyi və yaşıl dizayn dilini saxlayacaq, lakin idarəetmə üçün daha sıx və oxunaqlı olacaq.

## Məlumat modeli

Hər məhsulda aşağıdakı əsas sahələr olacaq:

- `id`
- `category`
- `name`
- `price`
- `unit`
- `image`
- `description`
- `active`
- `stock`
- kateqoriyaya aid əlavə sahələr: dad notları, dəmləmə məlumatı, variantlar və s.

## Mövcud saytla inteqrasiya

Hazırda qəhvələrin bir hissəsi HTML-də, çay və avadanlıqlar isə JavaScript məlumat fayllarında saxlanır. İlk keçiddə bunlar vahid `products.json` faylına köçürüləcək. Saytın görünüşü dəyişməyəcək; səhifələr məhsulları serverin `/api/products` ünvanından oxuyacaq.

Əgər server işləmirsə, səhifə istifadəçiyə aydın xəta mesajı göstərəcək. Admin panel server olmadan faylları dəyişə bilməyəcək.

## Təhlükəsizlik və məhdudiyyətlər

- İlk versiya yalnız lokal istifadə üçündür.
- Admin səhifəsi localhost xaricindən açılmayacaq.
- Sadə lokal parol qoruması əlavə ediləcək; bu, internet üçün tam təhlükəsizlik hesab edilmir.
- Şəkil yükləmə ilk versiyada yalnız layihə daxilindəki şəkilləri seçəcək; sonrakı mərhələdə fayl yükləmə əlavə edilə bilər.
- Sifariş idarəsi bu mərhələyə daxil deyil, çünki saytda hələ checkout və sifariş göndərmə sistemi yoxdur.

## Yoxlama meyarları

- Admin panel bütün mövcud məhsulları göstərir.
- Qiymət və stok dəyişiklikləri səhifə yeniləndikdən sonra qalır.
- Dəyişikliklər qəhvə, çay və avadanlıq səhifələrində görünür.
- Yanlış və ya natamam məlumat saxlanmır və istifadəçiyə xəta göstərilir.
- Admin panel 1280–1728 px MacBook ekranlarında rahat istifadə edilir.
- Mövcud səbət və məhsul səhifələrinin testləri keçməyə davam edir.

