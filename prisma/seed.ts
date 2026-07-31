import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Counter row buat nomor surat, wajib ada 1 baris dengan id=1
  await prisma.nomorSuratCounter.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, lastNumber: 0 },
  });

  // Contoh akun staf teknis pertama. GANTI email & password ini setelah seed jalan.
  const email = "staf@certindonesia.com";
  const passwordHash = await bcrypt.hash("gantipassword123", 10);

  await prisma.staffUser.upsert({
    where: { email },
    update: {},
    create: {
      name: "Staf Teknis",
      email,
      passwordHash,
    },
  });

  console.log("Seed selesai.");
  console.log(`Login staf: ${email} / gantipassword123 (segera ganti password-nya)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
