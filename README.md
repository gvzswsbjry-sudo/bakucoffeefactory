# Baku Coffee Factory

Qəhvə, çay, menyu və avadanlıq kataloqu olan Node.js saytı. Müştərilər hesab açmadan məhsullara baxa və səbətə əlavə edə bilərlər. Müştəri hesabları PostgreSQL-də, məhsul kataloqu isə hazırda yerli JSON faylında saxlanır.

## Yerli işə salma

Node.js 20 və ya daha yeni versiya ilə layihə qovluğunda `npm install`, sonra `npm start` işlədin. Sayt `http://127.0.0.1:8017/`, Admin panel `http://127.0.0.1:8017/admin/` ünvanında açılır. İlkin ayarda server yalnız lokal MacBook-dan əlçatandır. `.env.example` faylını nümunə kimi istifadə edin, amma real `.env` faylını Git-ə əlavə etməyin. `PORT` və `HOST` mühit dəyişənləri ilə ünvanı dəyişmək olar. `HOST=0.0.0.0` lokal şəbəkədə telefon önizləməsi üçündür; belə açmazdan əvvəl admin şifrəsini gücləndirin.

## Müştəri hesabları

Qeydiyyat və giriş üçün PostgreSQL tələb olunur. Serverin mühitində `DATABASE_URL` təyin edin (məsələn, `postgres://user:password@localhost:5432/bcf`). Server ilk hesab sorğusunda `server/migrations/001_customer_auth.sql` sxemini tətbiq edir. Verilənlər bazası qoşulmayıbsa, sayt və qonaq səbəti işləyir, hesab əməliyyatları isə əlçatan olmur.

Qeydiyyatda istifadəçi adı, ən azı 12 simvollu şifrə, ölkə kodlu beynəlxalq telefon nömrəsi və Məxfilik siyasəti razılığı tələb olunur. Girişdə istifadəçi adı və ya telefon nömrəsi işləyir. Telefon nömrəsi hələ SMS ilə təsdiqlənmir; bu səbəbdən nömrə sahibliyi yoxlanmış sayılmamalıdır. Şifrələr açıq mətn kimi saxlanmır. Hesab sessiyası HttpOnly cookie ilə idarə edilir.

## Sifariş sorğuları

Müştəri səbətdən “Sifariş et” seçərək əlaqə nömrəsi və istəyə bağlı qeyd daxil edə bilər. Server qiymət və miqdarı məhsul kataloqu ilə yenidən yoxlayır, sorğunu `data/orders.json` faylına yazır və yalnız uğurlu saxlanmadan sonra sifariş nömrəsi göstərir. Bu, avtomatik ödəniş və ya stok təsdiqi deyil: sifarişlər `/admin/orders.html` ünvanında admin girişi ilə görünür və satıcı müştəri ilə əlaqə saxlamalıdır. Saytı `file://` ilə deyil, Node serveri vasitəsilə açın.

## Yayımdan əvvəl

- HTTPS qoşun, `NODE_ENV=production` təyin edin və `DATABASE_URL` üçün davamlı PostgreSQL xidməti qurun. Production rejimində müştəri sessiya cookie-si `Secure` olur.
- `ADMIN_INITIAL_PASSWORD` üçün ən azı 12 simvolluq, güclü və unikal ilkin admin şifrəsi təyin edin. Production-da bu dəyişən verilmədən ilk admin qurulması bloklanır. Admin panelini yalnız etibarlı operatorlara açın və ilkin girişdən sonra şifrəni rotasiya edin.
- `ALLOWED_ORIGINS` dəyişənini yalnız real HTTPS domenləri ilə doldurun (vergüllə ayrılmış). Reverse proxy arxasında işləyərkən `TRUST_PROXY=1`, birbaşa internetə açılan Node prosesində isə `TRUST_PROXY=0` saxlayın.
- `data/products.json`, `data/orders.json`, `data/admin-config.json` və `assets/uploads/` üçün davamlı disk və ehtiyat nüsxə təmin edin. Sifariş faylı itərsə, sifarişlər də itər. Birdən çox server instansiyası planlaşdırılırsa, məhsul, admin və sifariş yaddaşını ortaq verilənlər bazasına köçürün.
- `mexfilik.html` mətnini hüquqi şəxs, saxlama müddətləri və faktiki hostinq xidməti üzrə yoxlayın. Məxfilik siyasəti yayım öncəsi hüquqi baxış tələb edən ilkin mətndir.
- Real müştəri hesabı ilə qeydiyyat, giriş, çıxış, səhv şifrə, mobil görünüş və səbəti HTTPS üzərindən sınaqdan keçirin.

## Fayllar və testlər

`npm test` server, müştəri hesabları və mağaza testlərini işlədir. Məhsullar `data/products.json` faylındadır, uğurlu dəyişiklikdən əvvəl ehtiyat nüsxəsi `data/products.json.bak` olur. Sifarişlər `data/orders.json`, admin parametrləri `data/admin-config.json` faylındadır. İstifadəçi şifrələrini, sifarişlərdəki telefon nömrələrini və `DATABASE_URL`-u repozitoriyaya əlavə etməyin.
