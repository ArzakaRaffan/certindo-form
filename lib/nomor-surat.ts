import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Generate nomor surat unik dengan format CC/LAB/{seq}/{MM}/{YYYY}.
 * Increment counter dilakukan di dalam transaction (SELECT ... FOR UPDATE via
 * Prisma's serializable-ish update) supaya aman walau ada 2 submission
 * bersamaan (race condition).
 */
export async function generateNomorSurat(): Promise<string> {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  const counter = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Pastikan row counter ada
    await tx.nomorSuratCounter.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, lastNumber: 0 },
    });

    const updated = await tx.nomorSuratCounter.update({
      where: { id: 1 },
      data: { lastNumber: { increment: 1 } },
    });

    return updated.lastNumber;
  }, { maxWait: 10000, timeout: 15000 });

  const seq = String(counter).padStart(4, "0");
  return `CC/LAB/${seq}/${month}/${year}`;
}
