# UI Design Specification — Timezy

## Arah visual

Gunakan referensi terlampir sebagai inspirasi, bukan salinan pixel-perfect. Gaya utamanya adalah **soft neumorphism** dengan nuansa produktif dan ramah:

- Kanvas krem/hijau pucat.
- Hijau tua untuk CTA, status aktif, dan indikator progres.
- Kartu membulat dengan bayangan lembut atas-kiri terang dan bawah-kanan gelap.
- Ilustrasi welcome bersifat opsional; fungsi produk tidak bergantung pada ilustrasi.
- Tipografi tegas untuk judul dan ringkas untuk metadata.

Bayangan harus membantu hirarki visual, tidak boleh mengurangi keterbacaan atau membuat kontrol tampak non-interaktif. Gunakan outline/kontras tambahan untuk fokus, selected, pressed, dan disabled.

## Token awal

Nilai berikut adalah titik awal, sesuaikan lewat pengujian layar nyata.

| Token | Nilai | Pemakaian |
|---|---|---|
| `canvas` | `#F2F4EA` | Background aplikasi |
| `surface` | `#F7F8F2` | Kartu raised |
| `surfaceMuted` | `#E9EDE2` | Kartu inset/area input |
| `primary` | `#064B20` | CTA, tab aktif, checkbox selesai |
| `primarySoft` | `#DDE9DA` | Highlight lembut |
| `textPrimary` | `#18231B` | Judul dan teks utama |
| `textSecondary` | `#626C63` | Metadata |
| `outline` | `#D5DCCF` | Border/focus fallback |
| `danger` | `#A52E32` | Hapus dan error |

Ruang: kelipatan 4/8 dp. Radius kartu: 20–24 dp. Tombol utama: tinggi minimal 48 dp dan radius penuh. Area kontrol sentuh minimal 44–48 dp.

## Pola komponen

- **Raised surface:** kartu putih/krem dengan shadow ringan; border tipis sebagai fallback.
- **Inset surface:** input/pill dengan latar sedikit lebih gelap dan stroke halus.
- **Primary button:** hijau solid dengan label terang; hindari tombol neumorphic berkontras rendah untuk aksi utama.
- **Task row:** checkbox/status, judul, metadata tanggal/waktu, dan penanda prioritas berupa label/icon sekaligus warna.
- **Progress:** tampilkan persentase/progres dengan angka dan visual bar/circle agar tidak hanya berbasis warna.
- **Selected date:** pill hijau solid atau outline jelas, bukan perubahan shadow saja.

## Informasi layar

### Splash dan startup

- Android system splash and iOS launch storyboard share the Quiet Steps mark and the `#F2F4EA` canvas background.
- While authentication or task data initializes, the in-app loading screen continues with the same mark and background.

### Welcome

- Logo/nama Timezy.
- Ilustrasi jadwal kerja sebagai elemen dekoratif.
- Headline pendek setara pesan “Schedule smarter, work better”.
- Satu CTA “Mulai”.
- Muncul pada first launch; tidak meminta akun.

### Today

- Header sapaan dan tanggal.
- Ringkasan tiga angka: total, selesai, tersisa/progres.
- Bagian “Hari ini” berisi task row yang diurutkan berdasarkan waktu, lalu waktu kosong.
- CTA tambah tugas mudah dijangkau.
- Empty state dengan arahan membuat tugas pertama.

### Calendar

- Judul “Planner” dan navigasi minggu sebelumnya/berikutnya.
- Strip hari horizontal dengan tanggal terpilih berkontras tinggi.
- Daftar/timeline untuk tanggal terpilih; tugas tanpa waktu berada pada bagian “Kapan saja”.
- CTA tambah tugas menggunakan tanggal terpilih sebagai default.

### Tasks

- Daftar semua tugas.
- Filter dasar: Semua, Belum selesai, Selesai; prioritas dapat menjadi filter sekunder.
- Item membuka form edit.
- Empty state sesuai filter.

### Task form

- Neumorphic raised cards group the task title, schedule, priority, category, and notes; recessed inputs have a visible green focus outline.
- Today/Tomorrow shortcuts accompany the calendar picker; time stays optional. Category suggestions never prevent a custom category.
- The create and edit forms respect top and bottom safe areas. Keyboard avoidance and focused-field scrolling also apply to authentication fields, including changes of focus while the keyboard is already open.
- Field judul wajib dan catatan opsional.
- Date picker; waktu opsional.
- Prioritas tiga tingkat dan kategori opsional.
- Tombol Simpan yang jelas; validasi inline.
- Mode edit menyediakan hapus dengan konfirmasi.

## Navigasi

Bottom tabs: **Today**, **Planner**, **Tasks**, **Insights**, **Profile**. The rounded raised navigation dock uses Material 3-inspired active indicator pills, consistent native icons, persistent labels, and bottom safe-area padding. Task form/detail ditampilkan sebagai stack route di atas tab. Tab aktif memiliki ikon, label, dan indikator visual; jangan mengandalkan warna saja.

### Insights

- Summarize planned, completed, and remaining tasks for the current Monday–Sunday week, using each task's due date.
- Show a daily planned/completed chart and a category breakdown from the signed-in user's task list.
- Surface overdue and open high-priority counts, with overdue tasks available to complete or reschedule.
- Show the next few open tasks with shortcuts to edit or complete them. Empty states explain what will populate each section.

### Profile

- Show the signed-in account's name, avatar or initials, email, sign-in provider, and task totals.
- Sign out lives here, with a confirmation dialog and visible error/retry handling. It is removed from the Today, Planner, and Tasks headers.
- Account information and task counts come from the existing Auth and Task providers; no placeholder settings or additional account services.

## Motion dan feedback

- Animasi transisi sederhana 150–220 ms untuk press/selected state.
- Haptic feedback bukan syarat MVP.
- Setelah simpan, tutup form dan perbarui layar asal.
- Selesai tugas: animasi kecil pada checkbox; jangan menunda update data.
- Hapus: dialog konfirmasi yang menyebut judul tugas bila tersedia.

## Aksesibilitas

- Teks utama harus lolos rasio kontras minimum 4.5:1 sebagai target desain.
- Hormati font scaling OS dan jangan potong judul tugas panjang.
- Beri accessibility label/hint untuk ikon tanpa label visual.
- Tandai checkbox dengan role dan state checked.
- Fokus/selected state tampak jelas dengan border/shape, tidak hanya shadow.
- Pastikan layout tetap terbaca dengan font besar dan mode kontras tinggi.
