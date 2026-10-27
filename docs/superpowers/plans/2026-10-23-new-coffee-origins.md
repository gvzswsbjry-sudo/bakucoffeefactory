# Yeni qəhvə mənşələri Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Qəhvələr səhifəsinə Efiopiya, Keniya, Decaf və Uqanda məhsullarını istifadəçinin verdiyi silo şəkilləri, 100 qram qiymətləri və aydın dad profilləri ilə əlavə etmək.

**Architecture:** Mövcud statik HTML/CSS quruluşu saxlanılacaq. Yeni məhsullar hazırkı `.coffee-profile` kartlarının davamı kimi əlavə ediləcək; şəkillər layihənin lokal `assets/coffee-origins/` qovluğunda saxlanacaq və CSS sinifləri ilə kartlara bağlanacaq. Sadə shell testi məzmunu, qiymətləri, çəkini, şəkil istinadlarını və mövcud məhsulların qorunmasını yoxlayacaq.

**Tech Stack:** HTML5, CSS3, Bash, `rg`, Python static HTTP server, `curl`

**Spec:** [2026-10-23-new-coffee-origins-design.md](../specs/2026-10-23-new-coffee-origins-design.md)

## Global Constraints

- Mövcud altı qəhvə kartının məzmunu və görünüşü dəyişdirilməməlidir.
- Bütün yeni qiymətlər dəqiq olaraq 100 qram üçün göstərilməlidir.
- Dad profilləri origin səviyyəsində anlaşılan və ehtiyatlı dildə yazılmalı; lota aid sübutsuz dəqiq iddialar edilməməlidir.
- Decaf mənşə ölkəsi kimi təqdim edilməməli, “kofeinsiz qəhvə” kimi izah edilməlidir.
- Mobil görünüşdə kartlar mövcud responsive davranışı davam etdirməlidir.

## Review Focus

- Yanlış qiymət və ya “10 q” yazılması
- Silo şəkillərinin məhsullarla səhv uyğunlaşdırılması
- Yeni kartlarda dad notları, turşuluq, bədən, balans, dəmləmə və qovrum sahələrinin çatışmaması
- Mövcud altı kartın təsadüfən dəyişməsi və ya silinməsi
- Mobil ölçüdə daşma, kəsilmə və oxunmaz mətn

---

## File Map

- Modify: `qehveler.html` — dörd yeni məhsul kartı
- Modify: `style.css` — dörd yeni silo şəkli üçün vizual siniflər və yalnız zəruri responsive düzəlişlər
- Create: `assets/coffee-origins/efiopiya.jpeg`
- Create: `assets/coffee-origins/keniya.jpeg`
- Create: `assets/coffee-origins/decaf.jpeg`
- Create: `assets/coffee-origins/uqanda.jpeg`
- Create: `tests/test-coffee-origins.sh` — statik məzmun və asset regresiya testi

### Task 1: Yeni qəhvə kartları üçün uğursuz testi yarat

- [ ] `tests/test-coffee-origins.sh` faylında Efiopiya, Keniya, Decaf və Uqanda adlarını yoxlayan testlər yaz.
- [ ] Qiymətlərin müvafiq olaraq `13.00 ₼`, `8.00 ₼`, `12.00 ₼`, `11.00 ₼` və hər kartda `100 q` kimi göstərildiyini yoxla.
- [ ] Hər məhsulda turşuluq, bədən, balans, dad notları, uyğun dəmləmə və qovrum sahələrinin mövcudluğunu yoxla.
- [ ] Dörd lokal şəkil faylının və HTML/CSS istinadlarının mövcudluğunu yoxla.
- [ ] Colombia, Guatemala, Brasil, Honduras, Robusta və Costa Rica kartlarının hələ mövcud olduğunu yoxla.
- [ ] Testi işlət: `bash tests/test-coffee-origins.sh`.
- [ ] Gözlənilən nəticəni təsdiqlə: test yeni kartlar və assetlər olmadığı üçün uğursuz olmalıdır.

### Task 2: Şəkilləri layihəyə əlavə et

- [ ] `/Users/fermanehmedov/Desktop/Kofe silolar/Image 4.jpeg` faylını `assets/coffee-origins/efiopiya.jpeg` kimi kopyala.
- [ ] `/Users/fermanehmedov/Desktop/Kofe silolar/Image.jpeg` faylını `assets/coffee-origins/keniya.jpeg` kimi kopyala.
- [ ] `/Users/fermanehmedov/Desktop/Kofe silolar/Image 2.jpeg` faylını `assets/coffee-origins/decaf.jpeg` kimi kopyala.
- [ ] `/Users/fermanehmedov/Desktop/Kofe silolar/Image 3.jpeg` faylını `assets/coffee-origins/uqanda.jpeg` kimi kopyala.
- [ ] Faylların açıldığını və ölçülərinin sıfırdan böyük olduğunu yoxla.

### Task 3: Dörd məhsul kartını hazırkı dizaynla əlavə et

- [ ] `qehveler.html` faylında mövcud kartların ardınca eyni semantik quruluşla Efiopiya kartını əlavə et: çiçək, berqamot, yasəmən və sitrus notları; yüksək turşuluq, yüngül–orta bədən, yaxşı balans; V60/Chemex/AeroPress; açıq–orta qovrum; `13.00 ₼ / 100 q`.
- [ ] Keniya kartını əlavə et: qara qarağat, qırmızı giləmeyvə, qreypfrut və qamış şəkəri; yüksək turşuluq, orta bədən, yaxşı balans; V60/Kalita/AeroPress; açıq–orta qovrum; `8.00 ₼ / 100 q`.
- [ ] Decaf kartını kofeinsiz qəhvə kimi əlavə et: karamel, kakao, badam və quru meyvə; aşağı turşuluq, orta–dolğun bədən, yumşaq balans; espresso/French press/moka pot; orta qovrum; `12.00 ₼ / 100 q`.
- [ ] Uqanda kartını əlavə et: tünd şokolad, quru gavalı, ədviyyat və qovrulmuş qoz; aşağı–orta turşuluq, dolğun bədən, davamlı balans; espresso/moka pot/French press; orta–tünd qovrum; `11.00 ₼ / 100 q`.
- [ ] `style.css` faylında hər kartın vizual sinfini düzgün lokal şəkillə bağla və mövcud `coffee-photo` kadr davranışını saxla.
- [ ] Mobil breakpoint-lərdə yeni xüsusi ölçü qaydası tələb olunmadığını yoxla; yalnız real daşma aşkarlanarsa minimal düzəliş et.

### Task 4: Test və vizual regresiya yoxlaması

- [ ] Testi yenidən işlət: `bash tests/test-coffee-origins.sh`.
- [ ] Gözlənilən nəticəni təsdiqlə: bütün testlər keçməlidir.
- [ ] Lokal serveri layihə qovluğunda başladıb `qehveler.html` üçün HTTP 200 cavabını `curl` ilə yoxla.
- [ ] Səhifəni desktop və təxminən 390 px mobil viewport-da yoxla.
- [ ] Dörd şəklin düzgün məhsula aid olduğunu, kartların tam göründüyünü, mətnlərin oxunduğunu və üfüqi daşma olmadığını təsdiqlə.
- [ ] Mövcud altı kartın dəyişmədiyini yenidən yoxla.
- [ ] Dəyişiklikləri spesifikasiya və “Review Focus” siyahısına qarşı özün yoxla.

