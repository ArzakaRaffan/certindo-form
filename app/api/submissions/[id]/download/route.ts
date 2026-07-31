import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDocx } from "@/lib/docx-generator";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
