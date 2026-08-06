import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const archiveActionSchema = z.object({
  action: z.enum(["archive", "restore"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Tidak diizinkan, silakan login." }, { status: 401 });
  }

  const parsed = archiveActionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Aksi arsip tidak valid." }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    select: { id: true, archivedAt: true },
  });
  if (!submission) {
    return NextResponse.json({ error: "Permohonan tidak ditemukan." }, { status: 404 });
  }

  const shouldArchive = parsed.data.action === "archive";
  await prisma.submission.update({
    where: { id: submission.id },
    data: shouldArchive
      ? { archivedAt: new Date(), archivedBy: session.user?.name || session.user?.email || "Staf" }
      : { archivedAt: null, archivedBy: null },
  });

  return NextResponse.json({ ok: true, archived: shouldArchive });
}
