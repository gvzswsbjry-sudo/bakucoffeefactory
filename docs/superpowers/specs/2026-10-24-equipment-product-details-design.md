# Avadanlıq məhsul səhifəsi — dizayn

## Məqsəd

Avadanlıq kataloqunu mobil yönümlü mağaza təcrübəsinə çevirmək: kart seçiləndə ayrıca məhsul səhifəsi açılsın, eyni məhsulun rəngləri bir kartda toplansın və variant dəyişəndə şəkil, ad və qiymət birlikdə yenilənsin.

## Əhatə

- Şərq üslublu servis dəstinin kataloq şəklini kəsilmədən göstərmək.
- Tamper, Azərbaycan qəhvə dəsti, Moka Pot və Dallah rənglərini/variantlarını bir məhsul altında toplamaq.
- Kataloq kartını kliklənən etmək; səbət düyməsi kart keçidini işə salmamalıdır.
- `mehsul.html?id=...` səhifəsində böyük şəkil, əvvəlki/növbəti oxları, rəng dairələri, variant adı, dəyişən qiymət və səbət düyməsi göstərmək.
- Variant qiymətini səbətdə ayrıca saxlamaq və cəmi real qiymətlərdən hesablamaq.

## Yanaşma

Seçilən yanaşma: bir mərkəzi məhsul məlumat faylı və iki istehlakçı səhifə. Bu, kataloqla məhsul səhifəsində ad, şəkil və qiymətlərin ayrılmasının qarşısını alır. Statik HTML-də hər variantı təkrarlamaq daha sadə görünsə də məlumatı iki yerdə saxlayardı; ayrıca hər məhsul üçün HTML faylı yaratmaq isə lazımsız təkrar yaradardı.

## Davranış

- Kataloqda 12 məhsul qrupu və ümumilikdə 17 seçim göstərilir.
- Rəng dairələri yalnız birdən çox variantı olan məhsullarda göstərilir.
- Oxlar variantlar arasında dövr edir; son variantdan sonra birinciyə qayıdır.
- Variant seçimi URL-də saxlanır və səhifə yenilənəndə qorunur.
- Bütün hazır qiymətlər 1.00 ₼ qalır; məlumat modeli fərqli variant qiymətlərini dəstəkləyir.
- Naməlum məhsul ID-si təhlükəsiz “məhsul tapılmadı” vəziyyəti göstərir.

## Məhdudiyyətlər

Layihə build sistemi olmayan HTML/CSS/JS saytdır. Yeni asılılıq əlavə edilmir, mövcud vizual dil və `localStorage` səbəti qorunur.
