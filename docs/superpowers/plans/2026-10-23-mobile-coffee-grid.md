# Mobil Qəhvə Grid-i Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Yeni qəhvələrin düzgün şəkillərini telefonda etibarlı göstərmək və bütün qəhvə kartlarını mobil ekranda iki sütuna yerləşdirmək.

**Architecture:** Yeni məhsulların şəkilləri HTML `<img>` elementləri ilə birbaşa bağlanır. `catalog.css` versiyalı URL ilə yüklənir və 720 px-dən aşağıda iki sütunlu, kompakt kart dizaynı tətbiq edir.

**Tech Stack:** HTML5, CSS3, JavaScript, Bash

**Spec:** `docs/superpowers/specs/2026-10-23-mobile-coffee-grid-design.md`

## Global Constraints

- Qəhvə məlumatları və qiymətlər dəyişməməlidir.
- Mobil görünüş iki sütun olmalı və üfüqi daşmamalıdır.
- Desktop görünüş saxlanılmalıdır.

## Review Focus

- Köhnə CSS keşi səbəbilə Colombia fallback-ının yenidən görünməsi
- 390 px telefonda kartın viewport-dan daşması
- Uzun `Costa Rica` və `Kofeinsiz qəhvə` mətnlərinin kəsilməsi
- Yeni `<img>` şəkillərinin düzgün məhsulla uyğunlaşmaması
- Desktop kart görünüşünün təsadüfən dəyişməsi

---

### Task 1: Şəkil və mobil grid regresiya testi

**Files:**
- Modify: `tests/test-coffee-origins.sh`

- [ ] Yeni dörd kartın ayrıca `<img src>` mənbəyini yoxlayan test yaz.
- [ ] Versiyalı `catalog.css` bağlantısını və mobil iki sütun qaydasını yoxlayan test yaz.
- [ ] Testi işlədib mövcud kodda uğursuz olduğunu təsdiqlə.

### Task 2: Etibarlı şəkillər və iki sütunlu mobil dizayn

**Files:**
- Modify: `qehveler.html`
- Modify: `catalog.css`
- Modify: `script.js`

- [ ] Yeni dörd `.coffee-photo` daxilinə uyğun lokal `<img>` əlavə et.
- [ ] Şəkillərin konteyneri doldurması üçün `object-fit: cover` qaydası əlavə et.
- [ ] `catalog.css` yüklənməsini versiyala.
- [ ] Mobil `.coffee-list`-i iki sütunlu grid et və mətn/şəkil ölçülərini kompaktlaşdır.
- [ ] Testi keçir.
- [ ] 390 px mobil və desktop viewport-da vizual yoxla; overflow olmamalıdır.
