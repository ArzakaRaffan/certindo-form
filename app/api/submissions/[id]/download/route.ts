import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDocx } from "@/lib/docx-generator";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Tidak diizinkan. Dokumen hanya dapat diakses oleh staf CERTINDO." },
      { status: 401 }
    );
  }

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: { alatList: true },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission tidak ditemukan." }, { status: 404 });
  }

  if (submission.status !== "SELESAI") {
    return NextResponse.json(
      { error: "Dokumen belum bisa diunduh, permohonan masih menunggu approval staf teknis." },
      { status: 403 }
    );
  }

  const buffer = generateDocx(submission);
  const filename = `Permohonan-Kalibrasi-${submission.nomorSurat.replace(/\//g, "-")}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
