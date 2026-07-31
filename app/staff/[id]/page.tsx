import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApprovalForm from "@/components/ApprovalForm";
import type { AlatKalibrasi } from "@prisma/client";

export default async function StaffDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/staff/login");

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: { alatList: true },
  });
  if (!submission) return notFound();

  const serviceLabels: Record<string, string> = {
    LAB: "In Our Lab (data lama)",
    INSITU: "On Site (data lama)",
    IN_OUR_LAB: "In Our Lab",
    ON_SITE: "On Site",
    HYBRID: "Hybrid — In Our Lab & On Site",
  };

  return (
    <div className="page">
      <p>
        <a href="/staff">&larr; Kembali ke dashboard</a>
      </p>
      <h1>{submission.nomorSurat}</h1>
      <p className="subtitle">
        Diajukan {new Date(submission.createdAt).toLocaleString("id-ID")}
      </p>

      <div className="card">
        <h2>Data Perusahaan (diisi client)</h2>
        <p><strong>Nama Perusahaan:</strong> {submission.namaPerusahaan}</p>
        <p><strong>Alamat:</strong> {submission.alamat}</p>
        <p><strong>Nama Pemilik Alat:</strong> {submission.namaPemilikAlat}</p>
        <p><strong>Alamat Pemilik Alat:</strong> {submission.alamatPemilikAlat}</p>
        <p><strong>Narahubung:</strong> {submission.narahubung} — {submission.hp} — {submission.email}</p>
        <p><strong>Tanggal Permohonan:</strong> {new Date(submission.tanggalPermohonan).toLocaleDateString("id-ID")}</p>
        <p><strong>Jenis Layanan:</strong> {serviceLabels[submission.jenisLayanan] ?? submission.jenisLayanan}</p>
        <p><strong>Kecepatan Layanan:</strong> {submission.kecepatanLayanan === "REGULER" ? "Reguler" : "Percepatan"}</p>
      </div>

      <div className="card">
        <h2>Daftar Alat</h2>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Alat</th>
              <th>Range Kalibrasi</th>
              <th>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {submission.alatList
              .sort((a: AlatKalibrasi, b: AlatKalibrasi) => a.no - b.no)
              .map((a: AlatKalibrasi) => (
                <tr key={a.id}>
                  <td>{a.no}</td>
                  <td>{a.namaAlat}</td>
                  <td>{a.rangeKalibrasi}</td>
                  <td>{a.jumlah}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {submission.status === "SELESAI" ? (
        <div className="card">
          <h2>Sudah Disetujui</h2>
          <p>Kesimpulan: <strong>{submission.kesimpulan === "DIPROSES" ? "Diproses" : "Ditangguhkan"}</strong></p>
          <a className="btn" href={`/api/submissions/${submission.id}/download`}>
            Download Dokumen (.docx)
          </a>
        </div>
      ) : (
        <div className="card">
          <h2>Evaluasi Permintaan & Persetujuan</h2>
          <ApprovalForm submissionId={submission.id} />
        </div>
      )}
    </div>
  );
}
