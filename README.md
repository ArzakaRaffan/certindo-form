# Aplikasi Permohonan Kalibrasi

Aplikasi web untuk pengajuan layanan kalibrasi PT Certindonesia. Pelanggan dapat mengisi formulir permohonan secara daring, sedangkan staf teknis dapat meninjau dan menyetujui permohonan melalui dashboard internal.

Dokumen resmi berformat `.docx` dibuat sesuai template saat diunduh. Dokumen hasil generasi tidak disimpan secara permanen di server maupun cloud storage.

## Fitur utama

- Formulir permohonan kalibrasi bertahap.
- Daftar peralatan dengan jumlah baris dinamis.
- Nomor surat unik yang dibuat secara transaction-safe.
- Dashboard dan autentikasi staf teknis.
- Alur evaluasi, persetujuan, dan penyelesaian permohonan.
- Pembuatan dokumen `.docx` secara on-demand.

## Teknologi

- [Next.js 14](https://nextjs.org/) dengan App Router.
- [Neon Postgres](https://neon.tech/) dan [Prisma](https://www.prisma.io/).
- [NextAuth.js](https://next-auth.js.org/) dengan Credentials Provider.
- [docxtemplater](https://docxtemplater.com/) dan [PizZip](https://github.com/open-xml-templating/pizzip).
- [Zod](https://zod.dev/) untuk validasi data.

## Alur aplikasi

1. Pelanggan mengisi data pemohon, informasi layanan, dan daftar peralatan melalui halaman utama.
2. Sistem membuat nomor surat unik dan menyimpan permohonan dengan status `MENUNGGU_APPROVAL`.
3. Staf masuk melalui `/staff/login`, membuka detail permohonan, lalu mengisi evaluasi dan kesimpulan.
4. Setelah disetujui, status permohonan berubah menjadi `SELESAI`.
5. Staf dapat mengunduh dokumen resmi dari halaman detail. Pelanggan tidak memiliki akses ke dokumen tersebut.

## Menjalankan proyek secara lokal

### Prasyarat

- Node.js 18.17 atau versi lebih baru.
- Database PostgreSQL. Konfigurasi bawaan ditujukan untuk Neon.

### 1. Instal dependensi

```bash
npm install
```

### 2. Konfigurasi environment

Salin `.env.example` menjadi `.env`, kemudian isi variabel berikut:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

Gunakan connection string pooled untuk `DATABASE_URL` dan koneksi direct/unpooled untuk `DIRECT_URL`. Buat `NEXTAUTH_SECRET` yang kuat, misalnya dengan:

```bash
openssl rand -base64 32
```

### 3. Siapkan database

```bash
npx prisma migrate dev
npm run seed
```

Seed membuat counter nomor surat dan satu akun staf awal:

- Email: `staf@certindonesia.com`
- Password: `gantipassword123`

> Ganti kredensial bawaan segera sebelum aplikasi digunakan di lingkungan produksi.

### 4. Jalankan development server

```bash
npm run dev
```

Aplikasi dapat diakses melalui:

- Formulir pelanggan: `http://localhost:3000`
- Login staf: `http://localhost:3000/staff/login`

## Struktur proyek

```text
app/
  page.tsx                                # Formulir pelanggan
  berhasil/[id]/page.tsx                 # Halaman konfirmasi
  staff/login/page.tsx                   # Login staf
  staff/page.tsx                         # Dashboard permohonan
  staff/[id]/page.tsx                    # Detail dan persetujuan
  api/
    submissions/route.ts                 # Membuat permohonan
    submissions/[id]/approve/route.ts    # Menyetujui permohonan
    submissions/[id]/download/route.ts   # Membuat dan mengunduh DOCX
    auth/[...nextauth]/route.ts           # NextAuth handler

lib/
  prisma.ts                               # Prisma client singleton
  auth.ts                                 # Konfigurasi NextAuth
  nomor-surat.ts                          # Generator nomor surat
  docx-generator.ts                       # Generator dokumen DOCX
  schemas.ts                              # Validasi input

prisma/
  schema.prisma                           # Skema database
  seed.ts                                 # Data awal

templates/
  template.docx                           # Template dokumen resmi
```

## Placeholder dokumen

| Placeholder | Sumber data |
| --- | --- |
| `{nomor_surat}` | Nomor surat yang dibuat otomatis dengan format `CC/LAB/{seq}/{MM}/{YYYY}` |
| `{nama_perusahaan}`, `{alamat}`, `{nama_pemilik_alat}`, `{alamat_pemilik_alat}` | Data pemohon |
| `{narahubung}`, `{hp}`, `{email}` | Data kontak |
| `{tanggal_permohonan}` | Tanggal permohonan |
| `{#cek_in_our_lab}`, `{#cek_on_site}`, `{#cek_hybrid}` | Pilihan lokasi layanan |
| `{#cek_reguler}`, `{#cek_percepatan}` | Pilihan prioritas layanan |
| `{#alat}...{/alat}` | Daftar peralatan |
| `{eval_metode}`, `{eval_tanggal}`, `{catatan_kondisi_alat}` | Evaluasi staf |
| `{#kesimpulan_diproses}`, `{#kesimpulan_ditangguhkan}` | Kesimpulan evaluasi |

Template menggunakan struktur internal Word yang sensitif terhadap perubahan run dan paragraph. Hindari mengubah placeholder secara manual tanpa menguji kembali hasil dokumen.

## Pengembangan lanjutan

- Menambahkan input merek, tipe, dan nomor seri peralatan.
- Memperketat validasi nomor telepon dan format data lainnya.
- Mengirim notifikasi email saat status permohonan berubah.
- Menambahkan rate limiting pada endpoint publik.
- Menyediakan pengelolaan akun staf melalui halaman admin.
