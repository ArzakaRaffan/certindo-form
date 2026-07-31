# Aplikasi Permohonan Kalibrasi

Web app buat client PT Certindonesia isi form permohonan kalibrasi online, staf teknis approve,
lalu dokumen `.docx` resmi (format & layout persis sama kayak template asli, termasuk logo)
di-generate on-the-fly setiap kali ada yang download — tidak ada file yang disimpan permanen
di server maupun cloud storage manapun.

## Stack

- **Next.js 14** (App Router) — satu app, form client + dashboard staf jadi satu
- **Neon (Postgres) + Prisma** — cuma nyimpen data teks (submission, daftar alat, counter nomor surat)
- **NextAuth (Credentials)** — login staf teknis
- **docxtemplater + pizzip** — isi ulang template `.docx` asli, generate on-demand pas didownload

## Alur

1. Client isi form di `/` (data perusahaan + daftar alat) → nomor surat auto-generate (unik, aman dari race condition karena di-increment dalam DB transaction) → status `MENUNGGU_APPROVAL`.
2. Staf login di `/staff/login`, buka dashboard `/staff`, klik submission → isi bagian evaluasi & kesimpulan → klik **Setujui & Selesaikan** → status jadi `SELESAI`.
3. Client (di halaman `/berhasil/[id]`, simpan link-nya) atau staf (di `/staff/[id]`) bisa klik **Download Dokumen** → API route generate `.docx` dari template + data DB, langsung di-stream ke browser sebagai file download. Tidak pernah ditulis ke disk.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Siapin database Neon

1. Bikin project baru di [neon.tech](https://neon.tech) (gratis).
2. Dari dashboard, buka **Connection Details**, pilih **Prisma**. Copy 2 connection string yang muncul (pooled & direct).
3. Copy `.env.example` jadi `.env`, isi `DATABASE_URL` (pooled) dan `DIRECT_URL` (direct/unpooled).
4. Isi juga `NEXTAUTH_SECRET` (generate random string, misal `openssl rand -base64 32`).

### 3. Migrate & seed

```bash
npx prisma migrate dev --name init
npm run seed
```

`seed` bakal bikin 1 row counter nomor surat (mulai dari 0) dan 1 akun staf teknis contoh:
- Email: `staf@certindonesia.com`
- Password: `gantipassword123`

**Segera ganti password ini** (lewat Prisma Studio: `npx prisma studio`, atau bikin halaman ganti password kalau mau lanjut develop).

### 4. Jalankan

```bash
npm run dev
```

- Form client: http://localhost:3000
- Login staf: http://localhost:3000/staff/login

## Struktur folder penting

```
app/
  page.tsx                          -> form client (page 1 + page 2)
  berhasil/[id]/page.tsx            -> halaman konfirmasi + download (kalau sudah approved)
  staff/login/page.tsx              -> login staf
  staff/page.tsx                    -> dashboard list semua submission
  staff/[id]/page.tsx               -> detail submission + form approval
  api/
    submissions/route.ts                    -> POST: client submit form baru
    submissions/[id]/approve/route.ts       -> POST: staf approve
    submissions/[id]/download/route.ts      -> GET: generate & stream docx on-demand
    auth/[...nextauth]/route.ts             -> NextAuth handler

lib/
  prisma.ts            -> Prisma client singleton
  auth.ts              -> konfigurasi NextAuth (Credentials provider)
  nomor-surat.ts        -> generator nomor surat unik (transaction-safe)
  docx-generator.ts     -> isi template docx dari data submission
  schemas.ts            -> validasi input pakai Zod

templates/
  template.docx          -> template asli CCI-KAL-FOM-001 yang sudah ditaruh placeholder
                             docxtemplater ({nama_perusahaan}, {#alat}...{/alat}, dst).
                             JANGAN diedit manual formatnya di Word tanpa hati-hati -
                             placeholder-nya sensitif terhadap struktur run/paragraph.

prisma/
  schema.prisma          -> model Submission, AlatKalibrasi, StaffUser, NomorSuratCounter
  seed.ts                -> bikin counter awal + 1 akun staf contoh
```

## Placeholder yang dipakai di template.docx

| Placeholder | Sumber data |
|---|---|
| `{nomor_surat}` | Auto-generate, format `CC/LAB/{seq}/{MM}/{YYYY}` |
| `{nama_perusahaan}`, `{alamat}`, `{nama_pemilik_alat}`, `{alamat_pemilik_alat}` | Form client |
| `{narahubung}`, `{hp}`, `{email}` | Form client |
| `{tanggal_permohonan}` | Form client |
| `{#cek_lab}`/`{#cek_insitu}`, `{#cek_reguler}`/`{#cek_percepatan}`, `{#cek_tenggat_ya}`/`{#cek_tenggat_tidak}` | Conditional checkbox (√ kalau true, □ kalau false) |
| `{#alat}...{/alat}` (loop) berisi `{no}`, `{nama_alat}`, `{merek}`, `{tipe}`, `{no_seri}`, `{range_kalibrasi}`, `{jumlah}` | Daftar alat, jumlah baris dinamis |
| `{eval_metode}`, `{eval_tanggal}`, `{catatan_kondisi_alat}` | Form approval staf |
| `{#kesimpulan_diproses}`/`{#kesimpulan_ditangguhkan}` | Form approval staf |

## Yang masih perlu kamu putuskan / kembangin lagi

- **Kolom Merek/Tipe/No. Seri** di tabel Daftar Alat: sekarang selalu terisi `"-"` karena belum ada input-nya di form client (sesuai instruksi awal kamu). Kalau ternyata perlu diisi staf pas alat diterima, tinggal tambah field di `ApprovalForm` + schema + docx-generator.
- **Validasi nomor HP/format lain** masih basic (cuma "wajib diisi"), belum ada validasi format Indonesia.
- **Notifikasi email** ke client waktu status berubah jadi `SELESAI` belum ada — bisa ditambah pakai Resend/Nodemailer di endpoint approve.
- **Rate limiting** endpoint `/api/submissions` (POST) belum ada, biar gak di-spam.
- Auth staf sekarang single credentials manual lewat seed — kalau mau banyak staf, bikin halaman admin buat tambah akun.

Semua ini aman buat dilanjutin pakai Claude Code — struktur project-nya standar Next.js App Router + Prisma, gak ada bagian yang "nyeleneh" yang bakal bikin Claude Code bingung.
