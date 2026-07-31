import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function BerhasilPage({ params }: { params: { id: string } }) {
  const submission = await prisma.submission.findUnique({ where: { id: params.id } });
  if (!submission) return notFound();

  return (
    <div className="page">
      <div className="success-box card">
        <div className="checkmark">✓</div>
        <h1>Permohonan Terkirim</h1>
        <p className="subtitle">
          Nomor surat permohonan kamu: <strong>{submission.nomorSurat}</strong>
        </p>
        {submission.status === "SELESAI" ? (
          <>
            <p>Permohonan kamu sudah disetujui. Dokumen resmi siap diunduh.</p>
            <a className="btn" href={`/api/submissions/${submission.id}/download`}>
              Download Dokumen (.docx)
            </a>
          </>
        ) : (
          <p>
            Permohonan sedang menunggu verifikasi dari staf teknis kami. Dokumen resmi (.docx)
            baru bisa diunduh setelah permohonan disetujui. Kami akan menghubungi kamu melalui
            email/HP yang terdaftar begitu prosesnya selesai. Simpan link halaman ini untuk cek
            status dan download nanti.
          </p>
        )}
      </div>
    </div>
  );
}
