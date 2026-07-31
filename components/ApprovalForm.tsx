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
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={form.evalKesesuaianLingkup}
            onChange={(e) => update("evalKesesuaianLingkup", e.target.checked)}
            style={{ width: "auto", marginRight: 6 }}
          />
          Kesesuaian Lingkup Akreditasi
        </label>
      </div>
      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={form.evalKesesuaianKelengkapan}
            onChange={(e) => update("evalKesesuaianKelengkapan", e.target.checked)}
            style={{ width: "auto", marginRight: 6 }}
          />
          Kesesuaian dan Kelengkapan Alat
        </label>
      </div>
      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={form.evalTeknisiKalibrasi}
            onChange={(e) => update("evalTeknisiKalibrasi", e.target.checked)}
            style={{ width: "auto", marginRight: 6 }}
          />
          Teknisi kalibrasi
        </label>
      </div>
      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={form.evalKondisiPeralatan}
            onChange={(e) => update("evalKondisiPeralatan", e.target.checked)}
            style={{ width: "auto", marginRight: 6 }}
          />
          Kondisi Peralatan/Kalibrator/Standar sesuai
        </label>
      </div>
      <div className="field">
        <label>Metode (CCI-KAL-WI- ...)</label>
        <input type="text" value={form.evalMetode} onChange={(e) => update("evalMetode", e.target.value)} />
      </div>
      <div className="field">
        <label>Tanggal Evaluasi</label>
        <input
          type="date"
          required
          value={form.evalTanggal}
          onChange={(e) => update("evalTanggal", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Catatan Kondisi Alat</label>
        <textarea
          value={form.catatanKondisiAlat}
          onChange={(e) => update("catatanKondisiAlat", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Kesimpulan</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="kesimpulan"
              checked={form.kesimpulan === "DIPROSES"}
              onChange={() => update("kesimpulan", "DIPROSES")}
            />
            Diproses
          </label>
          <label>
            <input
              type="radio"
              name="kesimpulan"
              checked={form.kesimpulan === "DITANGGUHKAN"}
              onChange={() => update("kesimpulan", "DITANGGUHKAN")}
            />
            Ditangguhkan
          </label>
        </div>
      </div>
      {error && <p className="error">{error}</p>}

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? "Menyimpan..." : "Setujui & Selesaikan"}
      </button>
    </form>
  );
}
