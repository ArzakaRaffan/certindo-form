import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/SignOutButton";
import type { Submission, AlatKalibrasi } from "@prisma/client";

type SubmissionRow = Submission & { alatList: AlatKalibrasi[] };

export default async function StaffDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/staff/login");

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: { alatList: true },
  });

  return (
    <div className="page-wide">
      <div className="top-nav">
        <div>
          <h1>Dashboard Permohonan Kalibrasi</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Masuk sebagai {session.user?.name}
          </p>
        </div>
        <SignOutButton />
      </div>

      <table>
        <thead>
          <tr>
            <th>Nomor Surat</th>
            <th>Perusahaan</th>
            <th>Tanggal</th>
            <th>Jumlah Alat</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s: SubmissionRow) => (
            <tr key={s.id}>
              <td>{s.nomorSurat}</td>
              <td>{s.namaPerusahaan}</td>
              <td>{new Date(s.tanggalPermohonan).toLocaleDateString("id-ID")}</td>
              <td>{s.alatList.length}</td>
              <td>
                <span className={`badge ${s.status === "SELESAI" ? "badge-done" : "badge-pending"}`}>
                  {s.status === "SELESAI" ? "Selesai" : "Menunggu Approval"}
                </span>
              </td>
              <td>
                <Link href={`/staff/${s.id}`}>Buka</Link>
              </td>
            </tr>
          ))}
          {submissions.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", color: "#999" }}>
                Belum ada permohonan masuk.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
