# Mobil qəhvə kataloqu — dizayn

## Məqsəd

Telefonda yeni qəhvələrin hamısında Colombia şəklinin görünməsi problemini aradan qaldırmaq və qəhvə kartlarını mobil ekranda iki-iki yanaşı göstərmək.

## Seçilən yanaşma

Yeni dörd məhsulun şəkli yalnız gec yüklənən CSS selectoruna bağlı qalmayacaq: hər kartda ayrıca `<img>` olacaq və `catalog.css` keşdən yan keçmək üçün versiyalı URL ilə yüklənəcək. Mobil breakpoint-də `.coffee-list` iki sütunlu grid olacaq; şəkil, başlıq, qiymət, göstəricilər və detallı mətn daha kompakt ölçülərə uyğunlaşdırılacaq.

## Nəzərdən keçirilən alternativlər

- Yalnız CSS selectorlarını saxlamaq: ən az dəyişiklikdir, amma telefondakı köhnə CSS keşi eyni problemi təkrarlaya bilər.
- Inline `background-image`: keş problemini azaldır, lakin məhsul şəkli semantik `<img>` qədər etibarlı və əlçatan deyil.
- Ayrıca `<img>` və versiyalı stylesheet — seçildi; həm şəkil mənbəyi kartın özündə olur, həm də mobil layout yenilənməsi telefona məcburi çatır.

## Məhdudiyyətlər

- Bütün qəhvə məlumatları və qiymətlər saxlanılmalıdır.
- Mobil ekranda dəqiq iki kart yanaşı görünməlidir.
- Üfüqi daşma olmamalıdır.
- Desktop görünüşünün hazırkı böyük kart quruluşu dəyişməməlidir.
