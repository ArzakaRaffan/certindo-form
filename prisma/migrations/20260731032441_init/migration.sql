-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('MENUNGGU_APPROVAL', 'SELESAI');

-- CreateEnum
CREATE TYPE "JenisLayanan" AS ENUM ('LAB', 'INSITU');

-- CreateEnum
CREATE TYPE "KecepatanLayanan" AS ENUM ('REGULER', 'PERCEPATAN');

-- CreateEnum
CREATE TYPE "Kesimpulan" AS ENUM ('DIPROSES', 'DITANGGUHKAN');

-- CreateTable
CREATE TABLE "NomorSuratCounter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NomorSuratCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "namaPerusahaan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "namaPemilikAlat" TEXT NOT NULL,
    "alamatPemilikAlat" TEXT NOT NULL,
    "narahubung" TEXT NOT NULL,
    "hp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tanggalPermohonan" TIMESTAMP(3) NOT NULL,
    "jenisLayanan" "JenisLayanan" NOT NULL,
    "kecepatanLayanan" "KecepatanLayanan" NOT NULL,
    "penambahanTenggat" BOOLEAN NOT NULL,
    "evalKesesuaianLingkup" BOOLEAN,
    "evalKesesuaianKelengkapan" BOOLEAN,
    "evalTeknisiKalibrasi" TEXT,
    "evalKondisiPeralatan" BOOLEAN,
    "evalMetode" TEXT,
    "evalCatatanTambahan" TEXT,
    "evalTanggal" TIMESTAMP(3),
    "catatanKondisiAlat" TEXT,
    "kesimpulan" "Kesimpulan",
    "diverifikasiOleh" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'MENUNGGU_APPROVAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlatKalibrasi" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "no" INTEGER NOT NULL,
    "namaAlat" TEXT NOT NULL,
    "merek" TEXT,
    "tipe" TEXT,
    "noSeri" TEXT,
    "rangeKalibrasi" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,

    CONSTRAINT "AlatKalibrasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffUser_email_key" ON "StaffUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_nomorSurat_key" ON "Submission"("nomorSurat");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "AlatKalibrasi_submissionId_idx" ON "AlatKalibrasi"("submissionId");

-- AddForeignKey
ALTER TABLE "AlatKalibrasi" ADD CONSTRAINT "AlatKalibrasi_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
