# Production Security Audit Design

## Məqsəd

Mövcud UI və mağaza funksiyalarını dəyişmədən Node HTTP serveri, admin paneli,
müştəri hesabları, sifariş axını və frontend DOM əməliyyatları üçün müdafiəni
gücləndirmək.

## Yanaşma

1. Mövcud təhlükəsiz davranışları testlərlə sabitləmək.
2. Server səviyyəsində vahid security headers, məhdud origin siyasəti, request
   limitləri və təhlükəsiz xəta cavabları tətbiq etmək.
3. Auth və yazma endpoint-lərinə IP əsaslı, yaddaş-limitli rate limiting əlavə
   etmək; mövcud verilənlər bazası əsaslı login limitini qorumaq.
4. DOM-a yazılan bütün dinamik məlumatı text node və təhlükəsiz atributlarla
   render etmək; zəruri olmayan `innerHTML` sink-lərini aradan qaldırmaq.
5. URL, məhsul ID-si, sifariş, upload və statik fayl yollarını whitelist və
   sərhəd yoxlamaları ilə qorumaq.
6. Dəyişiklikləri unit/integration testləri, secret scan, dependency audit və
   tam test paketi ilə təsdiqləmək.

## Uyğunluq prinsipi

Təhlükəsizlik dəyişiklikləri mövcud CSS siniflərinə və DOM strukturuna mümkün
qədər toxunmayacaq; qoruma əsasən server middleware funksiyaları və təhlükəsiz
render helper-ləri ilə əlavə ediləcək.
