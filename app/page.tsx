"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CertindoBrand from "@/components/CertindoBrand";

type AlatRow = { namaAlat: string; rangeKalibrasi: string; jumlah: string };
type Step = 1 | 2 | 3;
type JenisLayanan = "IN_OUR_LAB" | "ON_SITE" | "HYBRID";

const emptyAlat = (): AlatRow => ({ namaAlat: "", rangeKalibrasi: "", jumlah: "1" });

const Icon = ({ name }: { name: "file" | "layers" | "shield" | "info" | "check" | "arrow" | "plus" | "trash" }) => {
  const paths = {
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
    shield: <><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/></>,
    info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></>,
  };
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

export default function FormPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const applicationRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sameAsPerusahaan, setSameAsPerusahaan] = useState(true);
  const [form, setForm] = useState({
    namaPerusahaan: "",
    alamat: "",
    namaPemilikAlat: "",
    alamatPemilikAlat: "",
    narahubung: "",
    hp: "",
    email: "",
    tanggalPermohonan: new Date().toISOString().slice(0, 10),
    jenisLayanan: "IN_OUR_LAB" as JenisLayanan,
    kecepatanLayanan: "REGULER" as "REGULER" | "PERCEPATAN",
  });
  const [alatList, setAlatList] = useState<AlatRow[]>([emptyAlat()]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateAlat(index: number, key: keyof AlatRow, value: string) {
    setAlatList((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function scrollToForm() {
    applicationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goNext() {
    if (!formRef.current?.reportValidity()) return;
    setError(null);
    setStep((current) => Math.min(current + 1, 3) as Step);
    setTimeout(scrollToForm, 0);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (step !== 3) return goNext();
    if (!confirmed) {
      setError("Konfirmasikan bahwa informasi yang diberikan sudah lengkap dan akurat.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const payload = {
      ...form,
      namaPemilikAlat: sameAsPerusahaan ? form.namaPerusahaan : form.namaPemilikAlat,
      alamatPemilikAlat: sameAsPerusahaan ? form.alamat : form.alamatPemilikAlat,
      alatList: alatList.map((alat) => ({ ...alat, jumlah: Number(alat.jumlah) })),
    };
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Permohonan belum dapat dikirim. Silakan periksa kembali data Anda.");
        setSubmitting(false);
        return;
      }
      router.push(`/berhasil/${data.id}`);
    } catch {
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda lalu coba kembali.");
      setSubmitting(false);
    }
  }

  const serviceLabels: Record<JenisLayanan, string> = {
    IN_OUR_LAB: "In Our Lab",
    ON_SITE: "On Site",
    HYBRID: "Hybrid — In Our Lab & On Site",
  };
  const serviceLabel = serviceLabels[form.jenisLayanan];
  const priorityLabel = form.kecepatanLayanan === "REGULER" ? "Reguler" : "Percepatan";

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" aria-label="CERTINDO Calibration"><CertindoBrand /></a>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Buka menu" aria-expanded={menuOpen}>
            <span></span><span></span><span></span>
          </button>
          <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Navigasi utama">
            <a className="active" href="#application">Formulir</a>
            <a href="#guide">Panduan</a>
            <a href="#faq">Bantuan</a>
            <a className="nav-button" href="https://certindo.id">Website CERTINDO</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-content">
              <span className="eyebrow">Permohonan Kalibrasi</span>
              <h1>Kalibrasi presisi, dimulai dari proses yang mudah.</h1>
              <p className="hero-lead">Ajukan permohonan kalibrasi dengan melengkapi informasi pemohon dan detail peralatan. Tim kami akan meninjau permohonan Anda untuk konfirmasi lebih lanjut.</p>
              <div className="hero-actions">
                <button className="btn" onClick={scrollToForm}>Mulai Permohonan <Icon name="arrow" /></button>
                <a className="btn btn-secondary" href="https://wa.me/6282211772209">Tanya via WhatsApp</a>
              </div>
              <p className="required-note"><span>*</span> Kolom bertanda bintang wajib diisi.</p>
            </div>
            <div className="hero-visual" aria-label="Ilustrasi proses kalibrasi instrumen">
              <div className="precision-grid"></div>
              <div className="instrument">
                <span className="instrument-label">PRESSURE CALIBRATOR</span>
                <div className="dial"><span className="needle"></span><strong>0.00</strong><small>bar</small></div>
                <div className="instrument-status"><i></i> CALIBRATION READY</div>
              </div>
              <div className="verified-card"><span><Icon name="shield" /></span><div><strong>Terpercaya & Terukur</strong><small>Evaluasi oleh tim teknis</small></div></div>
            </div>
          </div>
        </section>

        <section className="preflight" id="guide">
          <div className="container">
            <div className="section-heading centered">
              <span className="eyebrow">Sebelum Mengajukan</span>
              <h2>Siapkan kebutuhan kalibrasi Anda</h2>
              <p>Tiga hal sederhana untuk membantu proses pemeriksaan berjalan lebih cepat.</p>
            </div>
            <div className="feature-grid">
              {[
                ["file", "Informasi Lengkap", "Pastikan data perusahaan, pemilik alat, dan narahubung diisi dengan akurat."],
                ["layers", "Daftar Alat Fleksibel", "Tambahkan satu atau beberapa peralatan sesuai kebutuhan kalibrasi Anda."],
                ["shield", "Review Teknis CERTINDO", "Evaluasi teknis dan kondisi peralatan dilakukan oleh staf setelah pengajuan."],
              ].map(([icon, title, text], index) => (
                <article className="feature-card" key={title}>
                  <div className="feature-top"><span className="feature-icon"><Icon name={icon as "file" | "layers" | "shield"} /></span><span>0{index + 1}</span></div>
                  <h3>{title}</h3><p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="application-section" id="application" ref={applicationRef}>
          <div className="container form-container">
            <div className="section-heading centered">
              <span className="eyebrow">Formulir Online</span>
              <h2>Formulir Permohonan Kalibrasi</h2>
              <p>Lengkapi setiap langkah berikut. Data Anda akan tersimpan saat berpindah langkah.</p>
            </div>

            <ol className="stepper" aria-label={`Langkah ${step} dari 3`}>
              {([
                [1, "Informasi Pemohon"],
                [2, "Daftar Peralatan"],
                [3, "Tinjau & Kirim"],
              ] as Array<[Step, string]>).map(([number, label]) => (
                <li key={number} className={step === number ? "active" : step > number ? "complete" : ""}>
                  <span>{step > number ? <Icon name="check" /> : number}</span><div><small>Langkah {number}</small><strong>{label}</strong></div>
                </li>
              ))}
            </ol>

            <form ref={formRef} onSubmit={handleSubmit} className="application-card">
              {error && <div className="error-summary" role="alert" aria-live="assertive"><strong>Periksa kembali permohonan Anda</strong><span>{error}</span></div>}

              {step === 1 && (
                <div className="form-step">
                  <div className="form-title"><div><span>01</span><div><h3>Informasi Pemohon</h3><p>Data perusahaan dan narahubung yang dapat kami hubungi.</p></div></div><small>Semua kolom wajib diisi</small></div>
                  <div className="form-grid">
                    <Field label="Nama Perusahaan" required>
                      <input type="text" required placeholder="Contoh: PT Maju Industri" value={form.namaPerusahaan} onChange={(e) => updateField("namaPerusahaan", e.target.value)} />
                    </Field>
                    <Field label="Tanggal Permohonan" required>
                      <input type="date" required value={form.tanggalPermohonan} onChange={(e) => updateField("tanggalPermohonan", e.target.value)} />
                    </Field>
                    <Field label="Alamat Perusahaan" required wide>
                      <textarea required placeholder="Alamat lengkap perusahaan" value={form.alamat} onChange={(e) => updateField("alamat", e.target.value)} />
                    </Field>
                    <div className="field field-wide checkbox-field">
                      <label><input type="checkbox" checked={sameAsPerusahaan} onChange={(e) => setSameAsPerusahaan(e.target.checked)} /><span>Nama dan alamat pemilik alat pada sertifikat sama dengan data perusahaan</span></label>
                    </div>
                    {!sameAsPerusahaan && <>
                      <Field label="Nama Pemilik Alat pada Sertifikat" required>
                        <input type="text" required value={form.namaPemilikAlat} onChange={(e) => updateField("namaPemilikAlat", e.target.value)} />
                      </Field>
                      <Field label="Alamat Pemilik Alat pada Sertifikat" required>
                        <textarea required value={form.alamatPemilikAlat} onChange={(e) => updateField("alamatPemilikAlat", e.target.value)} />
                      </Field>
                    </>}
                  </div>
                  <div className="subsection-title"><h4>Informasi Narahubung</h4><span></span></div>
                  <div className="form-grid form-grid-three">
                    <Field label="Nama Narahubung" required><input type="text" required placeholder="Nama lengkap" value={form.narahubung} onChange={(e) => updateField("narahubung", e.target.value)} /></Field>
                    <Field label="Nomor Telepon" required hint="Format 08… atau +62… dapat digunakan.">
                      <input id="nomorTelepon" type="tel" inputMode="tel" autoComplete="tel" required pattern="[0-9+() -]{8,20}" placeholder="0812 0000 0000" aria-describedby="nomorTeleponHint" value={form.hp} onChange={(e) => updateField("hp", e.target.value)} />
                    </Field>
                    <Field label="Alamat Email" required><input type="email" required placeholder="nama@perusahaan.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} /></Field>
                  </div>
                  <div className="subsection-title"><h4>Informasi Layanan</h4><span></span></div>
                  <div className="form-grid service-grid">
                    <ChoiceGroup label="Lokasi Kalibrasi" name="lokasi" value={form.jenisLayanan} onChange={(value) => updateField("jenisLayanan", value as JenisLayanan)} options={[["IN_OUR_LAB", "In Our Lab"], ["ON_SITE", "On Site"], ["HYBRID", "Hybrid — In Our Lab & On Site"]]} />
                    <ChoiceGroup label="Prioritas Layanan" name="prioritas" value={form.kecepatanLayanan} onChange={(value) => updateField("kecepatanLayanan", value as "REGULER" | "PERCEPATAN")} options={[["REGULER", "Reguler"], ["PERCEPATAN", "Percepatan"]]} />
                  </div>
                  <div className="info-box"><Icon name="info" /><p><strong>Informasi untuk pemohon</strong><span>Evaluasi teknis, kondisi peralatan, dan persetujuan akhir akan dilengkapi oleh staf CERTINDO setelah permohonan diterima.</span></p></div>
                </div>
              )}

              {step === 2 && (
                <div className="form-step">
                  <div className="form-title"><div><span>02</span><div><h3>Daftar Peralatan</h3><p>Tambahkan seluruh peralatan yang ingin dikalibrasi.</p></div></div><small>{alatList.length} item peralatan</small></div>
                  <div className="equipment-list">
                    {alatList.map((row, index) => (
                      <fieldset className="equipment-card" key={index}>
                        <legend>Peralatan {index + 1}</legend>
                        <div className="equipment-grid">
                          <Field label="Nama Peralatan" required><input type="text" required placeholder="Contoh: Pressure Gauge" value={row.namaAlat} onChange={(e) => updateAlat(index, "namaAlat", e.target.value)} /></Field>
                          <Field label="Rentang Kalibrasi" required><input type="text" required placeholder="Contoh: 0–10 bar" value={row.rangeKalibrasi} onChange={(e) => updateAlat(index, "rangeKalibrasi", e.target.value)} /></Field>
                          <Field label="Jumlah" required><input type="number" min={1} step={1} required value={row.jumlah} onChange={(e) => updateAlat(index, "jumlah", e.target.value)} /></Field>
                          <button type="button" className="remove-btn" onClick={() => setAlatList((rows) => rows.filter((_, i) => i !== index))} disabled={alatList.length === 1} aria-label={`Hapus peralatan ${index + 1}`}><Icon name="trash" /><span>Hapus</span></button>
                        </div>
                      </fieldset>
                    ))}
                  </div>
                  <button type="button" className="add-equipment" onClick={() => setAlatList((rows) => [...rows, emptyAlat()])}><Icon name="plus" /> Tambah Peralatan Lain</button>
                </div>
              )}

              {step === 3 && (
                <div className="form-step">
                  <div className="form-title"><div><span>03</span><div><h3>Tinjau & Kirim</h3><p>Pastikan seluruh informasi sudah benar sebelum dikirim.</p></div></div><small>Langkah terakhir</small></div>
                  <div className="review-grid">
                    <section className="review-panel">
                      <div className="review-heading"><h4>Informasi Pemohon</h4><button type="button" onClick={() => setStep(1)}>Ubah</button></div>
                      <Review label="Perusahaan" value={form.namaPerusahaan} />
                      <Review label="Alamat" value={form.alamat} />
                      <Review label="Pemilik Alat" value={sameAsPerusahaan ? form.namaPerusahaan : form.namaPemilikAlat} />
                      <Review label="Narahubung" value={`${form.narahubung} · ${form.hp}`} />
                      <Review label="Email" value={form.email} />
                      <Review label="Tanggal" value={new Date(`${form.tanggalPermohonan}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
                    </section>
                    <section className="review-panel">
                      <div className="review-heading"><h4>Informasi Layanan</h4><button type="button" onClick={() => setStep(1)}>Ubah</button></div>
                      <Review label="Lokasi" value={serviceLabel} />
                      <Review label="Prioritas" value={priorityLabel} />
                    </section>
                  </div>
                  <section className="review-equipment">
                    <div className="review-heading"><h4>Daftar Peralatan ({alatList.length})</h4><button type="button" onClick={() => setStep(2)}>Ubah</button></div>
                    <div className="table-scroll"><table><thead><tr><th>No.</th><th>Nama Peralatan</th><th>Rentang Kalibrasi</th><th>Jumlah</th></tr></thead><tbody>{alatList.map((alat, index) => <tr key={index}><td data-label="No.">{index + 1}</td><td data-label="Nama">{alat.namaAlat}</td><td data-label="Rentang">{alat.rangeKalibrasi}</td><td data-label="Jumlah">{alat.jumlah}</td></tr>)}</tbody></table></div>
                  </section>
                  <label className="confirmation"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /><span><strong>Saya mengonfirmasi bahwa informasi dalam permohonan ini lengkap dan akurat.</strong><small>Dengan mengirimkan formulir, Anda menyetujui data diproses untuk keperluan layanan kalibrasi.</small></span></label>
                </div>
              )}

              <div className="form-actions">
                {step > 1 ? <button type="button" className="btn btn-secondary" onClick={() => { setStep((step - 1) as Step); setTimeout(scrollToForm, 0); }}>Kembali</button> : <span></span>}
                {step < 3 ? <button type="submit" className="btn">Lanjutkan <Icon name="arrow" /></button> : <button type="submit" className="btn" disabled={submitting}>{submitting ? <><span className="spinner"></span>Mengirim Permohonan...</> : <>Kirim Permohonan <Icon name="arrow" /></>}</button>}
              </div>
            </form>
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div className="container faq-grid">
            <div className="section-heading"><span className="eyebrow">Informasi</span><h2>Pertanyaan yang sering diajukan</h2><p>Temukan jawaban singkat mengenai proses permohonan kalibrasi.</p></div>
            <div className="faq-list">
              {[
                ["Siapa yang dapat mengajukan permohonan?", "Perusahaan, instansi, maupun pemilik peralatan dapat mengajukan permohonan melalui formulir ini."],
                ["Bisakah saya menambahkan beberapa alat?", "Bisa. Tambahkan sebanyak mungkin item peralatan dalam satu permohonan menggunakan tombol tambah peralatan."],
                ["Apakah tersedia kalibrasi di lokasi?", "Ya. Pilih opsi Insitu dan tim kami akan mengonfirmasi ketersediaan serta kebutuhan teknisnya."],
                ["Apa yang terjadi setelah permohonan dikirim?", "Anda akan menerima nomor permohonan. Tim CERTINDO kemudian melakukan evaluasi dan menghubungi narahubung yang terdaftar."],
              ].map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}
            </div>
          </div>
        </section>

        <section className="support-cta">
          <div className="container support-inner"><div><span className="eyebrow">Butuh Bantuan?</span><h2>Kami siap membantu permohonan Anda.</h2><p>Hubungi tim kami untuk ketersediaan layanan dan bantuan proses pengajuan.</p></div><div className="support-actions"><a className="btn" href="https://wa.me/6282211772209">Chat via WhatsApp</a><a className="btn btn-light" href="https://certindo.id">Website CERTINDO</a></div></div>
        </section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><CertindoBrand inverse /><p>Layanan kalibrasi yang presisi, andal, dan profesional untuk kebutuhan industri Anda.</p><div><a href="#application">Formulir</a><a href="#faq">Bantuan</a><a href="/staff/login">Portal Staf</a></div><small>© {new Date().getFullYear()} PT Certindonesia. Hak cipta dilindungi.</small></div></footer>
    </>
  );
}

function Field({ label, required, wide, hint, children }: { label: string; required?: boolean; wide?: boolean; hint?: string; children: React.ReactNode }) {
  return <div className={`field${wide ? " field-wide" : ""}`}><label>{label}{required && <span className="required"> *</span>}</label>{children}{hint && <small className="field-help" id="nomorTeleponHint">{hint}</small>}</div>;
}

function ChoiceGroup({ label, name, value, onChange, options }: { label: string; name: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <fieldset className={`choice-field${options.length > 2 ? " choice-field-wide" : ""}`}><legend>{label}<span className="required"> *</span></legend><div className="choice-group">{options.map(([optionValue, optionLabel]) => <label key={optionValue} className={value === optionValue ? "selected" : ""}><input type="radio" name={name} value={optionValue} checked={value === optionValue} onChange={() => onChange(optionValue)} /><span>{optionLabel}</span></label>)}</div></fieldset>;
}

function Review({ label, value }: { label: string; value: string }) {
  return <div className="review-row"><span>{label}</span><strong>{value || "—"}</strong></div>;
}
