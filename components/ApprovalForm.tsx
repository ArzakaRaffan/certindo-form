"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApprovalForm({
  submissionId,
}: {
  submissionId: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    evalKesesuaianLingkup: false,
    evalKesesuaianKelengkapan: false,
    evalTeknisiKalibrasi: false,
    evalKondisiPeralatan: false,
    evalMetode: "",
    evalTanggal: new Date().toISOString().slice(0, 10),
    catatanKondisiAlat: "",
    kesimpulan: "DIPROSES" as "DIPROSES" | "DITANGGUHKAN",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/submissions/${submissionId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Gagal menyimpan approval.");
      return;
    }

    router.refresh();
  }

  return (
    <form className="approval-form" onSubmit={handleSubmit}>
      <div className="approval-intro">
        <span className="approval-intro-icon" aria-hidden="true">✓</span>
        <div>
          <strong>Area evaluasi staf</strong>
          <p>Centang setiap poin yang sudah diperiksa, lalu lengkapi hasil evaluasi di bawah.</p>
        </div>
      </div>

      <fieldset className="evaluation-checklist">
        <legend>Checklist pemeriksaan</legend>
        <label className="evaluation-option">
          <input
            type="checkbox"
            checked={form.evalKesesuaianLingkup}
            onChange={(e) => update("evalKesesuaianLingkup", e.target.checked)}
          />
          <span><strong>Kesesuaian Lingkup Akreditasi</strong><small>Pastikan layanan tercakup dalam lingkup yang berlaku.</small></span>
        </label>
        <label className="evaluation-option">
          <input
            type="checkbox"
            checked={form.evalKesesuaianKelengkapan}
            onChange={(e) => update("evalKesesuaianKelengkapan", e.target.checked)}
          />
          <span><strong>Kesesuaian dan Kelengkapan Alat</strong><small>Verifikasi data, jumlah, dan informasi alat yang diajukan.</small></span>
        </label>
        <label className="evaluation-option">
          <input
            type="checkbox"
            checked={form.evalTeknisiKalibrasi}
            onChange={(e) => update("evalTeknisiKalibrasi", e.target.checked)}
          />
          <span><strong>Ketersediaan Teknisi Kalibrasi</strong><small>Konfirmasi teknisi yang sesuai tersedia untuk pekerjaan ini.</small></span>
        </label>
        <label className="evaluation-option">
          <input
            type="checkbox"
            checked={form.evalKondisiPeralatan}
            onChange={(e) => update("evalKondisiPeralatan", e.target.checked)}
          />
          <span><strong>Kondisi Peralatan/Kalibrator/Standar</strong><small>Pastikan peralatan dan standar dalam kondisi sesuai.</small></span>
        </label>
      </fieldset>

      <div className="evaluation-fields">
        <h3>Detail hasil evaluasi</h3>
        <div className="evaluation-field-grid">
          <div className="field">
            <label htmlFor="evalMetode">Metode evaluasi</label>
            <input id="evalMetode" type="text" placeholder="Contoh: CCI-KAL-WI-001" value={form.evalMetode} onChange={(e) => update("evalMetode", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="evalTanggal">Tanggal evaluasi <span className="required">*</span></label>
            <input
              id="evalTanggal"
              type="date"
              required
              value={form.evalTanggal}
              onChange={(e) => update("evalTanggal", e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="catatanKondisiAlat">Catatan kondisi alat</label>
          <textarea
            id="catatanKondisiAlat"
            placeholder="Tuliskan temuan atau catatan penting terkait kondisi alat..."
            value={form.catatanKondisiAlat}
            onChange={(e) => update("catatanKondisiAlat", e.target.value)}
          />
        </div>
        <fieldset className="conclusion-field">
          <legend>Kesimpulan evaluasi</legend>
          <div className="radio-group">
            <label className={form.kesimpulan === "DIPROSES" ? "selected" : ""}>
            <input
              type="radio"
              name="kesimpulan"
              checked={form.kesimpulan === "DIPROSES"}
              onChange={() => update("kesimpulan", "DIPROSES")}
            />
              <span><strong>Diproses</strong><small>Permohonan dapat dilanjutkan.</small></span>
            </label>
            <label className={form.kesimpulan === "DITANGGUHKAN" ? "selected" : ""}>
            <input
              type="radio"
              name="kesimpulan"
              checked={form.kesimpulan === "DITANGGUHKAN"}
              onChange={() => update("kesimpulan", "DITANGGUHKAN")}
            />
              <span><strong>Ditangguhkan</strong><small>Permohonan memerlukan tindak lanjut.</small></span>
            </label>
          </div>
        </fieldset>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="approval-submit">
        <p>Pastikan seluruh hasil evaluasi sudah benar sebelum menyelesaikan permohonan.</p>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Menyimpan..." : "Setujui & Selesaikan"}
        </button>
      </div>
    </form>
  );
}
