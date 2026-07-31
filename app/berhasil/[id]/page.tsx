import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CertindoBrand from "@/components/CertindoBrand";

export default async function BerhasilPage({ params }: { params: { id: string } }) {
  const submission = await prisma.submission.findUnique({ where: { id: params.id } });
  if (!submission) return notFound();

  const isComplete = submission.status === "SELESAI";

  return (
    <div className="page">
      <div className="success-box card">
        <a className="success-brand" href="https://certindo.id" aria-label="Website CERTINDO">
          <CertindoBrand />
        </a>
        <div className="checkmark" aria-hidden="true">✓</div>
        <span className="eyebrow">Permohonan Diterima</span>
        <h1>Permohonan Berhasil Dikirim</h1>
        <p className="success-message">
          Terima kasih. Permohonan kalibrasi Anda telah diterima oleh CERTINDO. Tim kami akan
          meninjau permohonan dan menghubungi Anda untuk konfirmasi lebih lanjut.
        </p>
        <dl className="success-details">
          <div>
            <dt>Nomor Permohonan</dt>
            <dd>{submission.nomorSurat}</dd>
          </div>
          <div>
            <dt>Nama Perusahaan</dt>
            <dd>{submission.namaPerusahaan}</dd>
          </div>
          <div>
            <dt>Tanggal Pengiriman</dt>
            <dd>
              {new Date(submission.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span className={`badge ${isComplete ? "badge-done" : "badge-pending"}`}>
                {isComplete ? "Selesai Ditinjau" : "Menunggu Review"}
              </span>
            </dd>
          </div>
        </dl>
        <a className="btn btn-secondary" href="https://certindo.id">
          Kembali ke Website CERTINDO
        </a>
      </div>
    </div>
  );
}
