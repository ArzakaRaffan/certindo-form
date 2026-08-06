import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { approvalSchema } from "@/lib/schemas";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Tidak diizinkan, silakan login." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = approvalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const submission = await prisma.submission.findUnique({ where: { id: params.id } });
  if (!submission) {
    return NextResponse.json({ error: "Submission tidak ditemukan." }, { status: 404 });
  }
  if (submission.archivedAt) {
    return NextResponse.json(
      { error: "Permohonan sedang diarsipkan. Pulihkan terlebih dahulu untuk memprosesnya." },
      { status: 409 },
    );
  }

  await prisma.submission.update({
    where: { id: params.id },
    data: {
      evalKesesuaianLingkup: data.evalKesesuaianLingkup,
      evalKesesuaianKelengkapan: data.evalKesesuaianKelengkapan,
      evalTeknisiKalibrasi: data.evalTeknisiKalibrasi,
      evalKondisiPeralatan: data.evalKondisiPeralatan,
      evalMetode: data.evalMetode,
      evalTanggal: new Date(data.evalTanggal),
      catatanKondisiAlat: data.catatanKondisiAlat,
      kesimpulan: data.kesimpulan,
      status: "SELESAI",
    },
  });

  return NextResponse.json({ ok: true });
}
