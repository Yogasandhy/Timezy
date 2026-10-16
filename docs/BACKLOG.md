# MVP Backlog — Timezy

Status per 16 Oktober 2026. Pekerjaan aplikasi MVP sudah diimplementasikan; QA perangkat nyata dan validasi iOS masih terbuka.

## Selesai

- [x] Bare React Native CLI + TypeScript Android/iOS scaffold.
- [x] React Navigation: Today, Calendar, Tasks, dan task form.
- [x] Theme tokens, Quiet Steps branding, accessible controls, loading/empty/error states.
- [x] Task model, local-date helpers, validation, sorting, filters, dan progress selectors.
- [x] AsyncStorage repository berversi; create/update/complete/delete, serialized writes, serta penanganan payload/error.
- [x] Welcome, Today dashboard, weekly Calendar, All Tasks, dan create/edit/delete flow.
- [x] Unit/repository/component tests; TypeScript dan lint.
- [x] Android debug dan release QA APK berhasil dibuat.

## QA terbuka

- [ ] Sambungkan HP Android fisik dengan USB debugging dan status ADB `device`.
- [ ] Install/launch dan smoke-test Today, Calendar, filter, create/edit/complete/delete.
- [ ] Tutup dan buka ulang app untuk memastikan task tetap tersimpan.
- [ ] Uji font scaling, keyboard, dan tampilan layar kecil pada perangkat.
- [ ] Build/smoke-test iOS pada Mac/Xcode.
- [ ] Siapkan release signing key terpisah jika ada distribusi; APK QA saat ini debug-signed.

## Bukan scope MVP

Reminder, recurrence, subtasks, akun/cloud sync, kolaborasi, backend, SQLite migration, widget, analytics, dan publikasi store.
