# PRD — Timezy Task Management

- Status: MVP implemented; physical-device acceptance still pending
- Nama kerja: Timezy
- Platform: Android dan iOS
- Stack: bare React Native CLI + TypeScript
- Tanggal: 16 Oktober 2026

## Status implementasi

Fitur MVP, unit/repository tests, Android debug APK, dan Android release APK sudah dibuat. TypeScript, lint, dan tests lulus. Yang belum dapat ditutup adalah install/launch dan pemeriksaan persistence setelah restart pada HP fisik (ADB tidak menemukan perangkat) serta build native iOS pada Mac/Xcode.

## 1. Ringkasan

Timezy adalah aplikasi task management pribadi yang membantu pengguna merencanakan hari, melihat pekerjaan berdasarkan tanggal, dan menyelesaikan tugas tanpa pengalaman yang terasa berat. Desain mengambil arah dari referensi yang diberikan: palet terang bernuansa krem, hijau tua sebagai aksen, komponen membulat, ilustrasi ramah, dan permukaan bergaya neumorphism.

MVP berfokus pada alur inti yang bisa dipakai: buka aplikasi → lihat ringkasan hari → buat atau pilih tanggal tugas → tandai selesai → progres tersimpan saat aplikasi dibuka kembali. Data disimpan di perangkat. Akun, sinkronisasi cloud, dan kolaborasi belum masuk lingkup awal.

## 2. Masalah dan peluang

Daftar tugas yang tersebar atau terlalu padat membuat pengguna kesulitan menentukan apa yang harus dikerjakan hari ini. Timezy menyatukan daftar tugas dan tampilan kalender sederhana agar tugas mudah ditangkap, dijadwalkan, dan ditinjau.

## 3. Pengguna sasaran

### Persona utama

Individu yang mengelola pekerjaan, kuliah, atau urusan pribadi lewat ponsel dan membutuhkan daftar harian yang cepat dipahami.

### Kebutuhan utama

- Menambahkan tugas tanpa banyak langkah.
- Mengetahui tugas yang jatuh tempo hari ini dan yang akan datang.
- Menyelesaikan atau mengubah tugas dengan cepat.
- Melihat progres hari tanpa konfigurasi rumit.
- Tetap dapat memakai aplikasi tanpa internet.

## 4. Tujuan produk dan metrik MVP

### Tujuan

1. Membuat pengelolaan tugas harian dapat dipahami tanpa onboarding panjang.
2. Menyediakan alur lengkap create, read, update, complete, dan delete.
3. Menghubungkan ringkasan harian dengan planner berbasis tanggal.
4. Memastikan tugas tersimpan lokal dan tersedia setelah aplikasi dimulai ulang.

### Indikator keberhasilan untuk uji internal

- Pengguna baru dapat membuat tugas pertama tanpa bantuan.
- Tugas yang dibuat tampil pada dashboard atau tanggal yang dipilih.
- Menandai tugas selesai memperbarui hitungan dan progres secara konsisten.
- Data tetap ada setelah aplikasi ditutup dan dibuka ulang.
- Layar utama dapat digunakan dengan teks layar besar dan kontras yang memadai.

## 5. Prinsip produk

- Utamakan tindakan utama: tambah tugas dan selesaikan tugas.
- Informasi harian tampil lebih dahulu; fitur sekunder tidak memenuhi dashboard.
- Offline-first: data lokal tidak bergantung pada akun atau server.
- Neumorphism menjadi treatment visual, bukan alasan mengurangi kontras atau kejelasan kontrol.
- Bangun satu alur end-to-end sebelum memperluas fitur.

## 6. Lingkup MVP

### Termasuk

- Welcome/onboarding satu layar yang dapat dilewati setelah penggunaan pertama.
- Navigasi utama: Today, Calendar, dan Tasks.
- Membuat, mengubah, menyelesaikan, dan menghapus tugas.
- Field tugas: judul wajib, catatan opsional, tanggal jatuh tempo wajib dengan default hari ini, waktu opsional, prioritas, dan kategori opsional.
- Ringkasan jumlah tugas hari ini, jumlah selesai, dan progres penyelesaian.
- Tampilan kalender mingguan sederhana dan daftar tugas pada tanggal terpilih.
- Daftar semua tugas dengan filter status/tanggal/prioritas dasar.
- Empty state, konfirmasi penghapusan, validasi judul, dan penyimpanan lokal.
- Tampilan adaptif untuk ukuran layar ponsel umum di Android dan iOS.

### Tidak termasuk MVP

- Login, akun, backend, sinkronisasi lintas perangkat, atau multi-user.
- Kolaborasi tim, komentar, assignment, chat, atau lampiran media.
- Push notification, alarm, dan reminder terjadwal.
- Tugas berulang, subtasks, dependency, time tracking, atau project board.
- AI, analitik penggunaan, widget home screen, dan integrasi kalender sistem.
- Web, tablet-specific layout, serta publikasi store pada fase awal.

## 7. Informasi arsitektur

### Model tugas

- `id`: identifier unik.
- `title`: teks wajib, spasi di awal/akhir dihapus.
- `notes`: teks opsional.
- `dueDate`: tanggal lokal dalam format ISO date (`YYYY-MM-DD`).
- `dueTime`: waktu lokal `HH:mm` atau `null`.
- `priority`: `low`, `normal`, atau `high`.
- `category`: label opsional.
- `createdAt`, `updatedAt`: timestamp ISO.
- `completedAt`: timestamp ISO atau `null`; status selesai diturunkan dari field ini.

Zona waktu perangkat menjadi dasar untuk pemilihan hari. Simpan tanggal jatuh tempo sebagai tanggal kalender, bukan mengubahnya ke UTC, agar tugas tidak berpindah hari karena konversi zona waktu.

## 8. User journey utama

### A. Pengguna baru melihat hari ini

1. Pengguna membuka welcome screen.
2. Pengguna memilih “Mulai”.
3. Dashboard Today terbuka dengan tanggal hari ini, ringkasan kosong, dan CTA “Tambah tugas”.

### B. Membuat dan menyelesaikan tugas

1. Pengguna mengetuk “Tambah tugas”.
2. Form terbuka dengan tanggal hari ini sebagai default.
3. Pengguna mengisi judul dan opsional mengisi waktu, prioritas, catatan, atau kategori.
4. Setelah disimpan, tugas muncul pada Today dan Calendar untuk tanggal tersebut.
5. Pengguna menandai tugas selesai; hitungan dan progres diperbarui.
6. Setelah aplikasi dibuka kembali, status dan detail tetap tersimpan.

### C. Merencanakan tanggal lain

1. Pengguna membuka Calendar.
2. Pengguna memilih tanggal pada strip mingguan.
3. Daftar tugas untuk tanggal tersebut tampil, termasuk empty state jika belum ada.
4. Pengguna dapat menambah tugas untuk tanggal terpilih atau membuka detail tugas.

## 9. Persyaratan fungsional

| ID | Persyaratan | Prioritas |
|---|---|---|
| FR-01 | Pengguna dapat membuat tugas dengan judul dan tanggal jatuh tempo. | P0 |
| FR-02 | Form menerima catatan, waktu, prioritas, dan kategori opsional. | P1 |
| FR-03 | Pengguna dapat mengubah detail tugas yang ada. | P0 |
| FR-04 | Pengguna dapat mengubah status selesai/belum selesai. | P0 |
| FR-05 | Pengguna dapat menghapus tugas setelah konfirmasi. | P0 |
| FR-06 | Today hanya menghitung tugas yang tanggalnya sama dengan hari lokal perangkat. | P0 |
| FR-07 | Ringkasan Today menampilkan total, selesai, dan progres dari tugas hari itu. | P0 |
| FR-08 | Calendar menampilkan tanggal mingguan dan tugas tanggal terpilih. | P0 |
| FR-09 | Tasks menampilkan semua tugas dengan filter sederhana. | P1 |
| FR-10 | Perubahan tersimpan lokal dan bertahan setelah aplikasi restart. | P0 |
| FR-11 | Aplikasi memberi feedback saat simpan gagal, daftar kosong, atau input judul tidak valid. | P0 |
| FR-12 | Semua layar utama mendukung Android dan iOS tanpa logika bisnis bercabang yang tidak perlu. | P0 |

## 10. Persyaratan non-fungsional

- Operasi inti tidak memerlukan koneksi internet.
- UI tidak kehilangan perubahan yang telah berhasil disimpan ketika aplikasi masuk background atau ditutup normal.
- Kontrol utama dapat diakses dengan label aksesibilitas dan area sentuh yang cukup.
- Informasi penting tidak dibedakan hanya dengan warna.
- Tidak ada secret atau data pengguna yang dikirim ke layanan eksternal pada MVP.
- Daftar tetap responsif untuk pemakaian pribadi dengan ratusan tugas; optimisasi list dilakukan bila pengukuran menunjukkan kebutuhan.

## 11. Acceptance criteria

1. Pengguna dapat membuat tugas bertanggal hari ini dan melihatnya pada Today.
2. Pengguna dapat membuat tugas untuk tanggal mendatang dan melihatnya pada Calendar setelah memilih tanggal itu.
3. Mengedit judul/tanggal memperbarui item dan urutan daftar yang relevan.
4. Menandai selesai memperbarui ringkasan hari itu tanpa membuat duplikat.
5. Menghapus tugas meminta konfirmasi dan menghilangkan tugas setelah dikonfirmasi.
6. Menutup dan membuka ulang aplikasi mempertahankan tugas yang tersimpan.
7. Hari tanpa tugas menampilkan instruksi tindakan yang jelas.
8. Input judul kosong tidak dapat disimpan dan pesan kesalahannya dapat dibaca.
9. Status selesai, prioritas, dan tanggal masih dapat dibedakan tanpa mengandalkan warna saja.

## 12. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Bayangan neumorphic membuat teks/kontrol kurang kontras. | Terapkan kontras pada teks dan tombol; shadow hanya dekoratif; uji dengan font scaling. |
| Batas hari dan zona waktu membuat tugas tampil pada tanggal salah. | Simpan `dueDate` sebagai tanggal kalender lokal dan uji sekitar tengah malam/perubahan zona. |
| AsyncStorage tidak ideal untuk dataset besar atau pencarian kompleks. | Batasi MVP untuk penggunaan personal; akses data hanya lewat repository agar migrasi ke SQLite/backend tetap terlokalisasi. |
| Paket native tidak kompatibel dengan versi RN yang dipilih. | Kunci versi yang dihasilkan CLI dan verifikasi compatibility saat dependency ditambahkan. |

## 13. Definisi selesai MVP

MVP siap untuk QA perangkat: acceptance criteria 1–9 sudah diimplementasikan dan memiliki cakupan unit/repository yang relevan. Penerimaan penuh tetap menunggu kriteria yang memerlukan HP fisik dan pemeriksaan build iOS pada Mac/Xcode. APK berhasil dibuat bukan pengganti uji perangkat.
