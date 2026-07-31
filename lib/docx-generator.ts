import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import type { Submission, AlatKalibrasi } from "@prisma/client";

type SubmissionWithAlat = Submission & { alatList: AlatKalibrasi[] };

const TEMPLATE_PATH = path.join(process.cwd(), "templates", "template.docx");

function formatTanggal(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Generate buffer .docx on-the-fly dari template + data submission.
 * Tidak ada file yang ditulis ke disk secara permanen - murni in-memory.
 */
export function generateDocx(submission: SubmissionWithAlat): Buffer {
  const templateBuffer = fs.readFileSync(TEMPLATE_PATH);
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render({
    nomor_surat: submission.nomorSurat,
    nama_perusahaan: submission.namaPerusahaan,
    alamat: submission.alamat,
    nama_pemilik_alat: submission.namaPemilikAlat,
    alamat_pemilik_alat: submission.alamatPemilikAlat,
    narahubung: submission.narahubung,
    hp: submission.hp,
    email: submission.email,
    tanggal_permohonan: formatTanggal(submission.tanggalPermohonan),

    cek_lab: submission.jenisLayanan === "LAB",
    cek_insitu: submission.jenisLayanan === "INSITU",
    cek_reguler: submission.kecepatanLayanan === "REGULER",
    cek_percepatan: submission.kecepatanLayanan === "PERCEPATAN",
    cek_tenggat_ya: submission.penambahanTenggat === true,
    cek_tenggat_tidak: submission.penambahanTenggat === false,

    alat: submission.alatList
      .sort((a: AlatKalibrasi, b: AlatKalibrasi) => a.no - b.no)
      .map((a: AlatKalibrasi) => ({
        no: String(a.no),
        nama_alat: a.namaAlat,
        merek: a.merek || "-",
        tipe: a.tipe || "-",
        no_seri: a.noSeri || "-",
        range_kalibrasi: a.rangeKalibrasi,
        jumlah: String(a.jumlah),
        cek_kesesuaian: "",
      })),

    eval_kesesuaian_lingkup: submission.evalKesesuaianLingkup === true,
    eval_kesesuaian_kelengkapan: submission.evalKesesuaianKelengkapan === true,
    eval_teknisi_kalibrasi: submission.evalTeknisiKalibrasi === true,
    eval_kondisi_peralatan: submission.evalKondisiPeralatan === true,

    eval_metode: submission.evalMetode || "",
    eval_tanggal: formatTanggal(submission.evalTanggal ?? null),
    catatan_kondisi_alat: submission.catatanKondisiAlat || "",
    kesimpulan_diproses: submission.kesimpulan === "DIPROSES",
    kesimpulan_ditangguhkan: submission.kesimpulan === "DITANGGUHKAN",

    nama_staf_teknis: submission.namaStafTeknis || "",
    nama_manajer_teknis: submission.diverifikasiOleh || "",

    // "Tanggal berlaku" di footer = tanggal saat staf menyetujui permohonan (evalTanggal)
    tanggal_berlaku: formatTanggal(submission.evalTanggal ?? null),
  });

  return doc.getZip().generate({ type: "nodebuffer" });
}
