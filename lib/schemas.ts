import { z } from "zod";

export const alatSchema = z.object({
  namaAlat: z.string().min(1, "Nama alat wajib diisi"),
  rangeKalibrasi: z.string().min(1, "Range kalibrasi wajib diisi"),
  jumlah: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
});

export const submissionSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  namaPemilikAlat: z.string().min(1, "Nama pemilik alat wajib diisi"),
  alamatPemilikAlat: z.string().min(1, "Alamat pemilik alat wajib diisi"),
  narahubung: z.string().min(1, "Narahubung wajib diisi"),
  hp: z.string().min(1, "No. HP wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  tanggalPermohonan: z.string().min(1, "Tanggal permohonan wajib diisi"),
  jenisLayanan: z.enum(["IN_OUR_LAB", "ON_SITE", "HYBRID"]),
  kecepatanLayanan: z.enum(["REGULER", "PERCEPATAN"]),
  alatList: z.array(alatSchema).min(1, "Minimal 1 alat harus diisi"),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const approvalSchema = z.object({
  evalKesesuaianLingkup: z.boolean(),
  evalKesesuaianKelengkapan: z.boolean(),
  evalTeknisiKalibrasi: z.boolean(),
  evalKondisiPeralatan: z.boolean(),
  evalMetode: z.string().optional(),
  evalTanggal: z.string().min(1, "Tanggal evaluasi wajib diisi"),
  catatanKondisiAlat: z.string().optional(),
  kesimpulan: z.enum(["DIPROSES", "DITANGGUHKAN"]),
});

export type ApprovalInput = z.infer<typeof approvalSchema>;
