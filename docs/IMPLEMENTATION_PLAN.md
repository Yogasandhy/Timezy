# Implementation Plan — Timezy

## Keputusan produk dan teknis

- Bare React Native CLI + TypeScript, tanpa Expo.
- Android-first untuk workstation Windows; jalur penggunaan yang dimaksud adalah HP Android fisik, bukan emulator.
- UI offline-first dengan AsyncStorage; belum ada akun, backend, atau sinkronisasi.
- Konsep logo C, Quiet Steps, dipakai sebagai arah identitas awal.

## Status

| Area | Status |
|---|---|
| React Native scaffold Android/iOS | Selesai; RN 0.88.0 |
| Domain, local date, selectors | Selesai dan diuji |
| AsyncStorage repository | Selesai; schema v1 dan error handling |
| Today, Calendar, Tasks, task form | Selesai |
| TypeScript, lint, Jest | Lulus; 5 suite / 16 test |
| Android debug APK | Build berhasil |
| Android release APK | Build berhasil untuk QA lokal; memakai debug signing |
| Install/launch dan restart di HP fisik | Menunggu perangkat terhubung dan terotorisasi di ADB |
| Build native iOS | Menunggu Mac/Xcode |
| GitHub push | Remote sudah disetel; menunggu autentikasi GitHub |

## Toolchain yang digunakan

- Node.js 22.13.1, npm 10.7.0, JDK 17.
- Android SDK `D:\android`, Platform 37, Build Tools 37.0.0, NDK `27.1.12297006`.
- Gradle wrapper 9.4.1; application id `com.timezy`.
- Lihat [Development setup](DEVELOPMENT.md) untuk perintah build, perangkat, dan keterbatasan.

## Pekerjaan yang tersisa

1. Sambungkan dan otorisasi HP Android; pastikan `adb devices -l` menampilkan status `device`.
2. Install/launch, coba CRUD dan status kosong/error, tutup lalu buka aplikasi untuk memverifikasi persistence.
3. Build dan smoke-test iOS pada Mac/Xcode sebelum menyatakan penerimaan lintas platform selesai.
4. Siapkan signing key dan pipeline distribusi hanya bila akan merilis ke tester/store.

## Definition of done

- Acceptance criteria PRD lulus pada HP Android fisik, termasuk restart persistence.
- Build iOS diverifikasi pada Mac/Xcode.
- Test domain dan repository tetap lulus.
- Release signing/store deployment ditangani terpisah dari APK QA lokal.
