import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNomorSurat } from "@/lib/nomor-surat";
import { submissionSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const nomorSurat = await generateNomorSurat();

  const submission = await prisma.submission.create({
    data: {
      nomorSurat,
      namaPerusahaan: data.namaPerusahaan,
      alamat: data.alamat,
      namaPemilikAlat: data.namaPemilikAlat,
      alamatPemilikAlat: data.alamatPemilikAlat,
      narahubung: data.narahubung,
      hp: data.hp,
      email: data.email,
      tanggalPermohonan: new Date(data.tanggalPermohonan),
      jenisLayanan: data.jenisLayanan,
      kecepatanLayanan: data.kecepatanLayanan,
      // Kolom lama dipertahankan untuk kompatibilitas data historis.
      penambahanTenggat: false,
      alatList: {
        create: data.alatList.map((a, i) => ({
          no: i + 1,
          namaAlat: a.namaAlat,
          rangeKalibrasi: a.rangeKalibrasi,
          jumlah: a.jumlah,
        })),
      },
    },
  });

  return NextResponse.json({ id: submission.id, nomorSurat: submission.nomorSurat });
}
