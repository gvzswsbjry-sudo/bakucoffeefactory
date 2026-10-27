# Yeni qəhvə mənşələri — dizayn

## Məqsəd

Qəhvələr səhifəsinə mövcud vizual və məlumat strukturunu pozmadan Efiopiya, Keniya, Decaf və Uqanda seçimlərini əlavə etmək. Qiymətlər 100 qram üçün göstəriləcək.

## Məzmun

- Efiopiya — 13.00 ₼ / 100 q
- Keniya — 8.00 ₼ / 100 q
- Decaf — 12.00 ₼ / 100 q
- Uqanda — 11.00 ₼ / 100 q
- Hər məhsulda qısa təsvir, dad notları, turşuluq, bədən, balans, uyğun dəmləmə və qovrum məlumatı olacaq.
- Konkret ferma, lot və emal məlumatı olmadığı üçün profillər mənşənin ümumi xarakterinə əsaslanan istiqamətləndirici məlumat kimi yazılacaq.

## Vizual yanaşma

İstifadəçinin `Kofe silolar` qovluğundakı dörd şəkli saytın lokal asset qovluğuna aydın fayl adları ilə köçürüləcək. Yeni kartlar hazırkı `.coffee-profile` quruluşundan və mobil davranışdan istifadə edəcək.

## Yanaşmalar

1. **Mövcud kartları davam etdirmək — seçilən yanaşma.** Dizayn bütöv qalır, istifadəçi köhnə və yeni məhsulları eyni qaydada müqayisə edir.
2. Ayrı “Yeni məhsullar” bölməsi yaratmaq. Yeni məhsulları vurğulayır, amma səhifənin hazırkı ardıcıl kataloq dilini lazımsız yerə bölür.
3. Yalnız şəkil, ad və qiymət əlavə etmək. Daha sürətlidir, lakin səhifənin məlumatlandırıcı məqsədinə və istifadəçinin dad notları tələbinə cavab vermir.

## Məhdudiyyətlər

- Mövcud qəhvə kartları və qiymətləri dəyişdirilməyəcək.
- Qəhvələrin dəqiq dadı lot, emal və qovrumdan asılı olduğuna görə əsassız spesifik iddialar yazılmayacaq.
- Səhifə mobil görünüşdə hazırkı oxunaqlılığı qoruyacaq.

## Yoxlama

- Dörd məhsulun adı, qiyməti və `100 q` işarəsi avtomatik yoxlanılacaq.
- Dörd şəkil faylının mövcudluğu və HTML/CSS əlaqələri yoxlanılacaq.
- Səhifənin lokal HTTP cavabı yoxlanılacaq.
