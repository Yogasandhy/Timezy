# Technical Architecture — Timezy MVP

## Prinsip

- Bare React Native Community CLI + TypeScript; Android dan iOS native projects tetap tersedia.
- Pisahkan aturan domain, persistence, app state, dan tampilan agar bagian inti bisa diuji tanpa perangkat.
- AsyncStorage hanya diakses oleh repository; UI menggunakan `TaskProvider`.
- Simpan tanggal jatuh tempo sebagai kalender lokal `YYYY-MM-DD`, bukan timestamp UTC.
- Hindari abstraksi dan layanan eksternal yang belum diperlukan oleh MVP.

## Struktur implementasi

```text
src/
  app/
    AppBootstrap.tsx
    LoadingScreen.tsx
    WelcomeScreen.tsx
    navigation/
  features/tasks/
    domain/
      task.ts
      selectors.ts
    data/
      taskRepository.ts
      localTaskRepository.ts
    state/
      TaskContext.tsx
    screens/
      TodayScreen.tsx
      CalendarScreen.tsx
      TasksScreen.tsx
      TaskFormScreen.tsx
  shared/
    components/
    theme/tokens.ts
assets/quiet-steps.svg
```

## Alur data

```text
Screen → TaskProvider (React Context) → TaskRepository → AsyncStorage
  ↑                 ↓
  └── domain selectors & refreshed task state
```

`TaskContext` memuat task saat bootstrap dan menyediakan operasi create, update, complete/reopen, delete, refresh, serta pesan error. Mutasi state baru diterapkan setelah operasi repository berhasil. Repository mengantrekan operasi storage agar dua write berdekatan tidak saling menimpa.

## Domain dan tanggal

`Task` menyimpan `id`, `title`, `notes`, `dueDate`, `dueTime`, `priority`, `category`, waktu pembuatan/perubahan, serta `completedAt`. Judul dinormalisasi dan divalidasi; waktu bersifat opsional. Selector mengurutkan task dan menghitung daftar/progres Today.

Tanggal disimpan sebagai string tanggal lokal (`YYYY-MM-DD`). `parseLocalDateKey` membuat tanggal lokal pada tengah hari untuk operasi kalender; jangan parse date key langsung dengan `new Date(dateKey)`, karena itu dapat menggeser hari melalui UTC.

## Persistence dan kegagalan

- `localTaskRepository.ts` membangun AsyncStorage scope `timezy`.
- `taskRepository.ts` mengelola key `timezy.tasks.v1` dan payload schema version 1.
- Repository memvalidasi payload, mengurutkan read/write, dan tidak mengganti data rusak dengan daftar kosong.
- Kegagalan storage dipropagasikan ke provider agar UI dapat menampilkan error; state task tidak diperbarui sebelum operasi tulis berhasil.

## Navigasi dan UI

React Navigation menyediakan tab Today, Calendar, dan Tasks serta native-stack route untuk form. Calendar menyimpan tanggal terpilih di state layar; form menerima task yang diedit atau tanggal awal. Komponen berbagi token warna, spacing, dan permukaan di `src/shared`.

## Dependency utama

- React Native `0.88.0`, React `19.3.0`, TypeScript.
- React Navigation `7.x`, React Native Screens, dan Safe Area Context.
- AsyncStorage `3.x` untuk penyimpanan lokal.
- Jest untuk domain, selector, repository, dan komponen.

## Batas platform

Android dapat dibangun dari Windows dengan JDK 17 dan Android SDK yang sesuai template. Build iOS memerlukan macOS/Xcode; source iOS tersedia, tetapi belum dapat diverifikasi pada host Windows. Release APK saat ini menggunakan debug signing untuk QA lokal, bukan signing key distribusi.
