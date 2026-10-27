# Müştəri Girişi və Qeydiyyatı — Dizayn

## Məqsəd və səbəb

Baku Coffee Factory saytına yayıma uyğun müştəri hesabı sistemi əlavə etmək. Ziyarətçi məhsullara qonaq kimi baxa və səbəti doldura biləcək; hesab yaratmaq və giriş etmək ayrıca “Hesab” idarəsi ilə mümkün olacaq. Gələcək sifariş tamamlama axını istifadəçi sessiyasını yoxlaya biləcək, lakin bu layihə yeni ödəniş və ya sifariş idarəetmə sistemi yaratmır.

## Məqsədlər

- Qeydiyyatda telefon nömrəsi, unikal istifadəçi adı və şifrə istəmək.
- Girişdə telefon nömrəsi və ya istifadəçi adı ilə eyni şifrəni qəbul etmək.
- Qeydiyyatda məxfilik siyasətini göstərmək və ayrıca razılıq xanasını tələb etmək.
- Telefonları yalnız `+994` ilə məhdudlaşdırmamaq; beynəlxalq nömrələri E.164 formatında qəbul etmək.
- Sayta baxışı və səbətə məhsul əlavə etməyi qonaqlar üçün açıq saxlamaq.
- Mövcud lokal səbəti qeydiyyat/giriş zamanı itirməmək.
- Müştəri məlumatlarını PostgreSQL-də, şifrələri geri çevrilməyən `scrypt` hash kimi saxlamaq.
- Mobil və MacBook görünüşlərində mövcud vizual dilə uyğun, əlçatan giriş/qeydiyyat interfeysi yaratmaq.
- Yayımdan sonra HTTPS və təhlükəsiz cookie ilə işləyən, server restartından sonra sessiyanı saxlayan sistem qurmaq.

## Qeyri-məqsədlər

- Bu mərhələdə ödəniş, sifariş qeydi, çatdırılma və ya Wolt inteqrasiyası qurulmur.
- SMS OTP və şifrəni telefonla bərpa axını hələ aktivləşdirilmir; məlumat modeli sonradan bunları əlavə etməyə imkan verəcək.
- Sosial giriş (Google, Apple və s.) əlavə edilmir.
- Mövcud admin girişi müştəri hesab sistemi ilə birləşdirilmir.

## Uğursuz sayılacaq hallar

- Şifrələrin açıq mətnlə, telefon nömrələrinin brauzer `localStorage`-ında saxlanması.
- Sayt açılan kimi məcburi giriş göstərilməsi.
- Yalnız Azərbaycan nömrələrinin qəbul edilməsi.
- Login zamanı səbətin silinməsi və ya səhifənin istifadəyə yararsız dərəcədə böyüyüb-kiçilməsi.
- Müştəri sessiyasının server restartında səbəbsiz itməsi.

## Mövcud sistem və məhdudiyyətlər

- Sayt build mərhələsi olmayan HTML/CSS/JavaScript frontend və Node `http` serverindən ibarətdir.
- Məhsullar JSON faylı ilə idarə olunur; səbət `bcf-equipment-cart-v1` açarı ilə brauzerdə saxlanır.
- Hazırda yalnız admin üçün fayl əsaslı scrypt parolu və yaddaşdaxili sessiya var; bu sistem müştərilər üçün istifadə edilməyəcək.
- Saytda hazırda sifariş/checkout endpoint-i yoxdur. Müştəri hesabı gələcək checkout üçün hazır autentifikasiya sərhədi verəcək.
- Yayıma çıxmaq üçün hostinq PostgreSQL bağlantısı, `DATABASE_URL`, HTTPS və mühit dəyişənlərini dəstəkləməlidir.

## Nəzərdən keçirilən yanaşmalar

### 1. Yalnız brauzerdə lokal hesab

Ən sürətli variantdır, lakin şifrələri təhlükəsiz saxlamaq olmur, hesab başqa cihazda işləmir və yayıma yararlı deyil.

### 2. JSON faylında server hesabları

Hazırkı admin həllinə bənzəyir və lokal prototip üçün sadədir. Paralel yazılar, çox server nüsxəsi, backup və deploy zamanı davamlı disk problemləri səbəbindən ictimai sayt üçün zəif seçimdir.

### 3. PostgreSQL və server sessiyaları — seçilən yanaşma

İstifadəçi və sessiya məlumatları davamlı bazada qalır, unikal telefon/istifadəçi adı bazada qorunur və sayt birdən çox server nüsxəsinə keçə bilir. Yaxın yayıma və gələcək sifariş sisteminə ən uyğun seçimdir.

## İstifadəçi axını və interfeys

1. Bütün mağaza səhifələrinin header hissəsində yığcam “Hesab” düyməsi görünür.
2. Qonaq bu düyməyə basanda iki tablı modal açılır: “Giriş” və “Qeydiyyat”. Modal mobil klaviatura açıldıqda zoom yaratmır, görünən sahəyə uyğun sürüşür və bağlandıqda fokus əvvəlki düyməyə qayıdır.
3. Qeydiyyat forması telefon nömrəsi, istifadəçi adı və şifrə istəyir. Telefon sahəsi `tel`, şifrə sahəsi göstər/gizlət idarəsi ilə təqdim olunur. İstifadəçi məxfilik siyasətinə keçə və aktiv razılıq xanasını işarələyə bilir; öncədən seçilmiş razılıq yoxdur.
4. Giriş forması “Telefon və ya istifadəçi adı” və “Şifrə” istəyir.
5. Uğurlu qeydiyyat dərhal sessiya yaradır. Modal bağlanır, header düyməsi istifadəçi adını göstərir və səbət toxunulmaz qalır.
6. Uğurlu girişdə eyni davranış tətbiq olunur. Səhifə məcburi yönləndirilmir.
7. Daxil olmuş istifadəçi hesab menyusundan istifadəçi adını və normallaşdırılmış telefonunu görə, həmçinin çıxış edə bilir.
8. Sessiya müddəti bitibsə UI yenidən qonaq vəziyyətinə qayıdır; səbət yenə saxlanır.

## Məlumat modeli

### `customer_users`

- `id UUID PRIMARY KEY`
- `username TEXT NOT NULL`
- `username_normalized TEXT NOT NULL UNIQUE`
- `phone_e164 TEXT NOT NULL UNIQUE`
- `password_salt TEXT NOT NULL`
- `password_hash TEXT NOT NULL`
- `password_algorithm TEXT NOT NULL DEFAULT 'scrypt'`
- `phone_verified_at TIMESTAMPTZ NULL` — gələcək SMS təsdiqi üçün
- `privacy_consent_at TIMESTAMPTZ NOT NULL` və `privacy_policy_version TEXT NOT NULL`
- `created_at`, `updated_at`, `last_login_at TIMESTAMPTZ`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`

### `customer_sessions`

- `id UUID PRIMARY KEY`
- `user_id UUID NOT NULL REFERENCES customer_users(id) ON DELETE CASCADE`
- `token_hash TEXT NOT NULL UNIQUE` — cookie-dəki xam token bazada saxlanmır
- `created_at`, `expires_at`, `last_seen_at TIMESTAMPTZ`
- `user_agent_hash TEXT NULL`

### `auth_attempts`

- IP və normallaşdırılmış login identifikatorunun hash-i üzrə uğursuz cəhd vaxtlarını saxlayır.
- Köhnə cəhdlər sorğu zamanı və ya periodik təmizlənir.

## Normallaşdırma və validasiya

- Telefon sahəsi boşluq, mötərizə və defisləri təmizləyir; `00` prefiksini `+` formasına çevirir.
- Nəticə `+` və 7–15 rəqəmdən ibarət E.164 dəyəri olmalıdır. Heç bir ölkə kodu avtomatik əlavə edilmir.
- İstifadəçi adı 3–30 simvol olur; Unicode hərf/rəqəmləri, nöqtə, alt xətt və defis qəbul edilir. Unikallıq case-insensitive normallaşdırılmış dəyər üzrə yoxlanır.
- Şifrə minimum 8 simvol olur və maksimum 128 simvolla məhdudlaşdırılır.
- Eyni telefon və ya istifadəçi adı üçün Azərbaycan dilində ümumi, aydın konflikt mesajı göstərilir.
- Login xətası telefon/istifadəçi adının mövcudluğunu açıqlamayan “Giriş məlumatları düzgün deyil” mesajıdır.

## Server API-si

- `POST /api/auth/register` — telefon, istifadəçi adı, şifrə; istifadəçi və sessiya yaradır.
- Qeydiyyat sorğusu `privacyAccepted: true` dəyərini tələb edir; server razılıq vaxtını və siyasət versiyasını saxlayır.
- `POST /api/auth/login` — identifikator və şifrə; sessiya yaradır.
- `GET /api/auth/me` — sessiya varsa təhlükəsiz profil məlumatını qaytarır, yoxdursa `401`.
- `POST /api/auth/logout` — cari sessiyanı ləğv edir və cookie-ni silir.
- Bütün dəyişdirici auth sorğuları JSON qəbul edir, `Origin`/`Host` uyğunluğunu yoxlayır və `Cache-Control: no-store` qaytarır.
- Müştəri cookie adı admin cookie-dən fərqli olaraq `bcf_customer` olur.

## Təhlükəsizlik

- Şifrə Node-un `crypto.scrypt` funksiyası, hər istifadəçi üçün ayrıca random salt və sabit vaxtlı müqayisə ilə işlənir.
- Sessiya tokeni 32 random baytdır; yalnız SHA-256 hash bazada saxlanır.
- Cookie `HttpOnly`, `SameSite=Lax`, `Path=/`, production-da `Secure` və 30 günlük `Max-Age` ilə verilir.
- Login və qeydiyyat IP + identifikator üzrə 15 dəqiqədə maksimum 5 uğursuz cəhdlə məhdudlaşdırılır. Uğurlu giriş identifikator üzrə cəhd sayını təmizləyir.
- Sorğu bədəninin ölçüsü məhdudlaşdırılır; bütün SQL parametrli sorğularla icra olunur.
- Müştəri məlumatları loglara, HTML-ə və ya lokal storage-a yazılmır.
- `mexfilik.html` səhifəsi toplanan məlumatları, hesab məqsədini, saxlanma və silinmə sorğusunun əlaqə kanalını sadə dildə izah edir. Bu mətn yayımdan əvvəl sayt sahibinin hüquqi yoxlamasından keçirilməlidir; checkbox-un özü qanuna tam uyğunluq zəmanəti kimi təqdim edilmir.
- Production server yalnız HTTPS arxasında işlədilir; proxy istifadə ediləndə etibarlı `X-Forwarded-Proto` nəzərə alınır.

## Kod quruluşu

- `server/db.js` — PostgreSQL pool və transaction köməkçiləri.
- `server/migrations/*.sql` və migration runner — auth cədvəlləri və indekslər.
- `server/customer-auth.js` — normallaşdırma, scrypt, sessiya və rate-limit domen məntiqi.
- `server/customer-auth-routes.js` — dörd auth endpoint-i və cookie/Origin davranışı.
- `account.js` — paylaşılmış frontend sessiya vəziyyəti, modal və form sorğuları.
- `account.css` — responsiv account modalı/header idarəsi.
- Mövcud HTML səhifələri yalnız paylaşılmış CSS/JS və “Hesab” host nöqtəsini daxil edəcək; hər səhifədə auth məntiqi təkrarlanmayacaq.

## Xəta və dayanıqlılıq davranışı

- PostgreSQL əlçatan deyilsə public məhsul səhifələri açılmağa davam edir, account əməliyyatları isə təhlükəsiz `503` mesajı qaytarır.
- Duplicate qeydiyyat yarışları database unique constraint ilə həll edilir.
- Vaxtı keçmiş və silinmiş sessiya tokenləri `401` qaytarır və cookie təmizlənir.
- Frontend şəbəkə xətasında formanı itirmir, düyməni yenidən aktivləşdirir və təkrar cəhdi mümkün edir.

## Test və qəbul meyarları

- Unit testlər telefon/username normallaşdırması, şifrə hash/yoxlama və token hashing-i əhatə edir.
- API testləri qeydiyyat, iki login identifikatoru, çıxış, duplicate dəyərlər, invalid input, rate limit, restart sonrası sessiya və admin cookie ilə ayrılığı yoxlayır.
- Frontend testləri modal tabları, form validasiyası, sessiya vəziyyəti, logout, səbətin qorunması və klaviatura/fokus davranışını yoxlayır.
- Mövcud admin və mağaza testləri regressiyasız keçməlidir.
- Production yoxlaması HTTPS altında cookie atributlarını, `DATABASE_URL` migration-ını və health/startup səhvlərini yoxlayır.

## Builder üçün buraxılan qərarlar

- PostgreSQL hostinq provayderinin seçimi və SMS provayderi bu dizayndan kənardır.
- Mövcud vizual tokenlərə uyğun dəqiq spacing və animasiya dəyərləri builder tərəfindən seçilə bilər.
- Sessiya təmizlənməsinin ayrıca job və ya sorğu zamanı batch silinməsi deploy platformasına görə seçilə bilər.
