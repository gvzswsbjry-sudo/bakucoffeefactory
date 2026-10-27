# Order Status and Stock Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin panelində göndərilmiş sifarişləri izləmək və stok sayını problemsiz redaktə etmək.

**Architecture:** Order store atomik status yeniləməsi təqdim edir, qorunan admin PATCH marşrutu onu çağırır, sifariş səhifəsi isə filtr və əməliyyat düymələri göstərir. Məhsul redaktoru say daxil ediləndə stok rejimini avtomatik `counted` edir.

**Tech Stack:** Node.js, vanilla JavaScript, HTML/CSS, node:test

**Spec:** `docs/superpowers/specs/2026-10-27-order-status-stock-design.md`

## Global Constraints

- Köhnə sifarişlər status olmadıqda `new` sayılır.
- Admin yazma əməliyyatları autentifikasiya və same-origin yoxlamasından keçir.
- Məlumat faylları atomik yazılır.

## Review Focus

- Naməlum status 400 qaytarmalıdır.
- Mövcud olmayan sifariş 404 qaytarmalıdır.
- Köhnə status-suz sifariş “Yeni” görünməlidir.
- Stok sayı yazmaq statusu `counted` etməlidir.
- Status filtri kartları məlumatı silmədən gizlətməlidir.

---

### Task 1: Persistent order status

**Files:**
- Modify: `server/order-store.js`
- Modify: `server/routes.js`
- Modify: `tests/admin/orders.test.js`

- [ ] Failing tests: store status update and authenticated PATCH route.
- [ ] Run focused tests and confirm expected failure.
- [ ] Implement `orders.updateStatus(id, status)` and admin PATCH route.
- [ ] Run focused tests and confirm pass.

### Task 2: Orders UI and stock editor usability

**Files:**
- Modify: `admin/orders.html`
- Modify: `admin/orders.js`
- Modify: `admin/admin.js`
- Modify: `admin/index.html`
- Modify: `tests/admin/admin-ui.test.js`

- [ ] Failing source-level UI tests for status controls/filter and enabled stock input.
- [ ] Run focused tests and confirm expected failure.
- [ ] Implement filters, status toggle, feedback, and stock auto-count behavior.
- [ ] Run focused and full test suites.
