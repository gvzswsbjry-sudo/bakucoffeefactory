# Responsive Admin Panel Design

## Məqsəd

Admin panelinin mövcud masaüstü vizual dilini və funksiyalarını qoruyaraq onu telefon, planşet və MacBook ekranlarında rahat işləyən responsiv interfeysə çevirmək.

## Seçilmiş yanaşma

- Masaüstündə mövcud sol naviqasiya, məhsul cədvəli və sağdan açılan redaktor saxlanılır.
- Planşet və mobil ekranlarda sol naviqasiya yuxarıda kompakt, üfüqi sürüşən bölmə panelinə çevrilir.
- Məhsul cədvəli mobil ekranda məlumat etiketləri olan toxunması rahat məhsul kartları kimi göstərilir.
- Məhsul redaktoru mobil ekranda tam ekran açılır; forma sahələri bir sütuna keçir və yadda saxlama düymələri ekranın altında əlçatan qalır.
- Şəkil seçimi, təsdiq pəncərəsi, giriş ekranı və sifarişlər səhifəsi kiçik ekran ölçülərinə uyğunlaşdırılır.

## Responsiv sərhədlər

- `1100px`-dən yuxarı: hazırkı masaüstü quruluşu.
- `761px–1100px`: kompakt planşet quruluşu, yuxarı naviqasiya və daha sıx cədvəl.
- `760px` və aşağı: kart əsaslı məhsul siyahısı, tək sütun formalar və tam ekran redaktor.

## Əsas dəyişikliklər

### Naviqasiya

Mobil görünüşdə loqo, kateqoriya keçidləri və çıxış/saytı aç əmrləri yığcamlaşdırılacaq. Kateqoriya keçidləri sətirdən daşdıqda səhifəni genişləndirmədən üfüqi sürüşəcək.

### Məhsul siyahısı

Masaüstündə semantik cədvəl qalacaq. Mobil CSS eyni sətirləri kart görünüşünə çevirəcək. Hər qiymət, stok və status dəyərinin yanında öz etiketi görünəcək.

### Məhsul redaktoru

Masaüstündə 640px-lik sağ panel qalacaq. Mobil cihazda panel bütün ekranı tutacaq, `100dvh` istifadə ediləcək, iki sütunlu sahələr bir sütuna düşəcək və alt əməliyyat paneli təhlükəsiz sahə boşluğunu nəzərə alacaq.

### Dialoqlar və giriş

Şəkil seçimi və təsdiq dialoqları ekran sərhədindən daşmayacaq. Giriş kartı telefon ekranında yan boşluqlarla tam enə yaxın göstəriləcək.

## Funksional təhlükəsizlik

- Mövcud məhsul yaratma, redaktə, silmə, filtr, stok və şəkil seçimi davranışları dəyişdirilməyəcək.
- CSS dəyişiklikləri əvvəlcə avtomatlaşdırılmış UI struktur testləri ilə qorunacaq.
- Mobil kart etiketləri JavaScript-dən təhlükəsiz statik atributlarla əlavə ediləcək; istifadəçi məlumatı HTML atributlarına daxil edilməyəcək.

## Yoxlama

- Admin UI testləri əvvəlcə yeni responsiv tələblərlə yazılacaq və dəyişiklikdən əvvəl uğursuz olduğu təsdiqlənəcək.
- Sonra admin testləri və bütün layihə testləri işlədiləcək.
- Son görünüş həm masaüstü, həm də telefon ölçüsündə brauzerdə vizual yoxlanılacaq.

## Müştəri saytında favorit keçidi

- Səhifənin aşağı sağındakı ayrıca üzən favorit düyməsi yığışdırılacaq.
- Favorit keçidi bütün uyğun səhifələrin başlığında `Hesab` düyməsinin yanında göstəriləcək və məhsul sayı qorunacaq.
- Masaüstündə mövcud yan panel davranışı saxlanılacaq.
- Mobil cihazda favorit siyahısı bütün ekranı tutacaq; bağlama düyməsi və məhsul keçidləri həmişə əlçatan qalacaq.
