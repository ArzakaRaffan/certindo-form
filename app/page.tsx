"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AlatRow = { namaAlat: string; rangeKalibrasi: string; jumlah: string };

const emptyAlat = (): AlatRow => ({ namaAlat: "", rangeKalibrasi: "", jumlah: "1" });

export default function FormPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    namaPerusahaan: "",
    alamat: "",
    namaPemilikAlat: "",
    alamatPemilikAlat: "",
    narahubung: "",
    hp: "",
    email: "",
    tanggalPermohonan: new Date().toISOString().slice(0, 10),
    jenisLayanan: "LAB" as "LAB" | "INSITU",
    kecepatanLayanan: "REGULER" as "REGULER" | "PERCEPATAN",
    penambahanTenggat: false,
  });

  const [alatList, setAlatList] = useState<AlatRow[]>([emptyAlat()]);
  const [sameAsPerusahaan, setSameAsPerusahaan] = useState(true);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateAlat(index: number, key: keyof AlatRow, value: string) {
    setAlatList((rows) => rows.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  }

  function addAlat() {
    setAlatList((rows) => [...rows, emptyAlat()]);
  }

  function removeAlat(index: number) {
    setAlatList((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      ...form,
      namaPemilikAlat: sameAsPerusahaan ? form.namaPerusahaan : form.namaPemilikAlat,
      alamatPemilikAlat: sameAsPerusahaan ? form.alamat : form.alamatPemilikAlat,
      alatList: alatList.map((a) => ({ ...a, jumlah: Number(a.jumlah) })),
    };

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan, coba lagi.");
        setSubmitting(false);
        return;
      }
      router.push(`/berhasil/${data.id}`);
    } catch (err) {
      setError("Gagal mengirim form. Cek koneksi internet kamu.");
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Aplikasi Permohonan Kalibrasi</h1>
      <p className="subtitle">PT Certindonesia — isi data di bawah untuk mengajukan permohonan kalibrasi alat.</p>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2>Data Perusahaan</h2>

          <div className="field">
            <label>Nama Perusahaan</label>
            <input
              type="text"
              required
              value={form.namaPerusahaan}
              onChange={(e) => updateField("namaPerusahaan", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Alamat</label>
            <textarea
              required
              value={form.alamat}
              onChange={(e) => updateField("alamat", e.target.value)}
            />
          </div>

          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={sameAsPerusahaan}
                onChange={(e) => setSameAsPerusahaan(e.target.checked)}
                style={{ width: "auto", marginRight: 6 }}
              />
              Nama & alamat pemilik alat pada sertifikat sama dengan di atas
            </label>
          </div>

          {!sameAsPerusahaan && (
            <>
              <div className="field">
                <label>Nama Pemilik Alat pada Sertifikat</label>
                <input
                  type="text"
                  required
                  value={form.namaPemilikAlat}
                  onChange={(e) => updateField("namaPemilikAlat", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Alamat Pemilik Alat pada Sertifikat</label>
                <textarea
                  required
                  value={form.alamatPemilikAlat}
                  onChange={(e) => updateField("alamatPemilikAlat", e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h2>Narahubung</h2>
          <div className="field">
            <label>Nama Narahubung</label>
            <input
              type="text"
              required
              value={form.narahubung}
              onChange={(e) => updateField("narahubung", e.target.value)}
            />
          </div>
          <div className="field">
            <label>No. HP</label>
            <input
              type="tel"
              required
              value={form.hp}
              onChange={(e) => updateField("hp", e.target.value)}
            />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <h2>Detail Permohonan</h2>

          <div className="field">
            <label>Tanggal Permohonan</label>
            <input
              type="date"
              required
              value={form.tanggalPermohonan}
              onChange={(e) => updateField("tanggalPermohonan", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Jenis Permintaan Layanan</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="jenisLayanan"
                  checked={form.jenisLayanan === "LAB"}
                  onChange={() => updateField("jenisLayanan", "LAB")}
                />
                Lab PT Certindonesia
              </label>
              <label>
                <input
                  type="radio"
                  name="jenisLayanan"
                  checked={form.jenisLayanan === "INSITU"}
                  onChange={() => updateField("jenisLayanan", "INSITU")}
                />
                Insitu
              </label>
            </div>
          </div>

          <div className="field">
            <label>Kecepatan Layanan</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="kecepatan"
                  checked={form.kecepatanLayanan === "REGULER"}
                  onChange={() => updateField("kecepatanLayanan", "REGULER")}
                />
                Reguler
              </label>
              <label>
                <input
                  type="radio"
                  name="kecepatan"
                  checked={form.kecepatanLayanan === "PERCEPATAN"}
                  onChange={() => updateField("kecepatanLayanan", "PERCEPATAN")}
                />
                Percepatan
              </label>
            </div>
          </div>

          <div className="field">
            <label>Penambahan Tenggat Kalibrasi pada Sertifikat</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="tenggat"
                  checked={form.penambahanTenggat === true}
                  onChange={() => updateField("penambahanTenggat", true)}
                />
                Ya
              </label>
              <label>
                <input
                  type="radio"
                  name="tenggat"
                  checked={form.penambahanTenggat === false}
                  onChange={() => updateField("penambahanTenggat", false)}
                />
                Tidak
              </label>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Daftar Alat Kalibrasi</h2>

          {alatList.map((row, i) => (
            <div className="alat-row" key={i}>
              <div className="field" style={{ marginBottom: 0 }}>
                {i === 0 && <label>Nama Alat</label>}
                <input
                  type="text"
                  required
                  value={row.namaAlat}
                  onChange={(e) => updateAlat(i, "namaAlat", e.target.value)}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                {i === 0 && <label>Range Kalibrasi</label>}
                <input
                  type="text"
                  required
                  value={row.rangeKalibrasi}
                  onChange={(e) => updateAlat(i, "rangeKalibrasi", e.target.value)}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                {i === 0 && <label>Jumlah</label>}
                <input
                  type="number"
                  min={1}
                  required
                  value={row.jumlah}
                  onChange={(e) => updateAlat(i, "jumlah", e.target.value)}
                />
              </div>
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeAlat(i)}
                disabled={alatList.length === 1}
                title="Hapus baris"
              >
                ✕
              </button>
            </div>
          ))}

          <button type="button" className="btn btn-secondary btn-small" onClick={addAlat}>
            + Tambah Alat
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Mengirim..." : "Kirim Permohonan"}
        </button>
      </form>
    </div>
  );
}
