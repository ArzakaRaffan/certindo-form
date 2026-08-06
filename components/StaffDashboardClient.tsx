"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SubmissionArchiveButton from "@/components/SubmissionArchiveButton";

type DashboardSubmission = {
  id: string;
  nomorSurat: string;
  namaPerusahaan: string;
  narahubung: string;
  hp: string;
  email: string;
  tanggalPermohonan: string;
  createdAt: string;
  archivedAt: string | null;
  archivedBy: string | null;
  status: "MENUNGGU_APPROVAL" | "SELESAI";
  jenisLayanan: string;
  kecepatanLayanan: "REGULER" | "PERCEPATAN";
  alatList: { namaAlat: string; jumlah: number }[];
};

const serviceLabels: Record<string, string> = {
  LAB: "In Our Lab",
  INSITU: "On Site",
  IN_OUR_LAB: "In Our Lab",
  ON_SITE: "On Site",
  HYBRID: "Hybrid",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function SearchIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export default function StaffDashboardClient({ submissions }: { submissions: DashboardSubmission[] }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"AKTIF" | "ARSIP">("AKTIF");
  const [status, setStatus] = useState("SEMUA");
  const [service, setService] = useState("SEMUA");
  const [speed, setSpeed] = useState("SEMUA");
  const [period, setPeriod] = useState("SEMUA");
  const [sort, setSort] = useState("TERBARU");

  const stats = useMemo(() => {
    const active = submissions.filter((item) => !item.archivedAt);
    return {
      total: active.length,
      pending: active.filter((item) => item.status === "MENUNGGU_APPROVAL").length,
      done: active.filter((item) => item.status === "SELESAI").length,
      archived: submissions.filter((item) => item.archivedAt).length,
    };
  }, [submissions]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    const now = new Date();
    const periodStart = new Date(now);
    if (period === "7_HARI") periodStart.setDate(now.getDate() - 7);
    if (period === "30_HARI") periodStart.setDate(now.getDate() - 30);
    if (period === "TAHUN_INI") periodStart.setTime(new Date(now.getFullYear(), 0, 1).getTime());

    return submissions
      .filter((item) => {
        const searchable = [
          item.nomorSurat,
          item.namaPerusahaan,
          item.narahubung,
          item.hp,
          item.email,
          ...item.alatList.map((alat) => alat.namaAlat),
        ].join(" ").toLocaleLowerCase("id-ID");

        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        const matchesView = view === "ARSIP" ? Boolean(item.archivedAt) : !item.archivedAt;
        const matchesStatus = status === "SEMUA" || item.status === status;
        const matchesService = service === "SEMUA" || item.jenisLayanan === service ||
          (service === "IN_OUR_LAB" && item.jenisLayanan === "LAB") ||
          (service === "ON_SITE" && item.jenisLayanan === "INSITU");
        const matchesSpeed = speed === "SEMUA" || item.kecepatanLayanan === speed;
        const matchesPeriod = period === "SEMUA" || new Date(item.createdAt) >= periodStart;

        return matchesView && matchesQuery && matchesStatus && matchesService && matchesSpeed && matchesPeriod;
      })
      .sort((a, b) => {
        if (sort === "TERLAMA") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sort === "PERUSAHAAN") return a.namaPerusahaan.localeCompare(b.namaPerusahaan, "id-ID");
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [period, query, service, sort, speed, status, submissions, view]);

  const hasFilters = query || status !== "SEMUA" || service !== "SEMUA" || speed !== "SEMUA" || period !== "SEMUA";
  const resetFilters = () => {
    setQuery("");
    setStatus("SEMUA");
    setService("SEMUA");
    setSpeed("SEMUA");
    setPeriod("SEMUA");
  };

  return (
    <>
      <section className="dashboard-stats" aria-label="Ringkasan permohonan">
        <div className="stat-card stat-card-primary">
          <span>Total permohonan</span>
          <strong>{stats.total}</strong>
          <small>Seluruh data masuk</small>
        </div>
        <div className="stat-card">
          <span>Perlu ditinjau</span>
          <strong>{stats.pending}</strong>
          <small className="stat-accent-warning">Menunggu approval</small>
        </div>
        <div className="stat-card">
          <span>Sudah selesai</span>
          <strong>{stats.done}</strong>
          <small className="stat-accent-success">Permohonan disetujui</small>
        </div>
        <div className="stat-card">
          <span>Diarsipkan</span>
          <strong>{stats.archived}</strong>
          <small>Data tetap tersimpan aman</small>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Daftar permohonan</h2>
            <p>Temukan dan tindak lanjuti permohonan kalibrasi.</p>
          </div>
          <span className="result-count">{filtered.length} data {view === "ARSIP" ? "arsip" : "aktif"}</span>
        </div>

        <div className="dashboard-tabs" role="tablist" aria-label="Tampilan permohonan">
          <button type="button" role="tab" aria-selected={view === "AKTIF"} className={view === "AKTIF" ? "active" : ""} onClick={() => setView("AKTIF")}>Permohonan aktif <span>{stats.total}</span></button>
          <button type="button" role="tab" aria-selected={view === "ARSIP"} className={view === "ARSIP" ? "active" : ""} onClick={() => setView("ARSIP")}>Arsip <span>{stats.archived}</span></button>
        </div>

        <div className="dashboard-tools">
          <label className="dashboard-search">
            <span className="sr-only">Cari permohonan</span>
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nomor surat, perusahaan, kontak, atau alat..."
            />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian">&times;</button>}
          </label>

          <div className="dashboard-filters">
            <label>
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="SEMUA">Semua status</option>
                <option value="MENUNGGU_APPROVAL">Menunggu approval</option>
                <option value="SELESAI">Selesai</option>
              </select>
            </label>
            <label>
              <span>Layanan</span>
              <select value={service} onChange={(event) => setService(event.target.value)}>
                <option value="SEMUA">Semua layanan</option>
                <option value="IN_OUR_LAB">In Our Lab</option>
                <option value="ON_SITE">On Site</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </label>
            <label>
              <span>Kecepatan</span>
              <select value={speed} onChange={(event) => setSpeed(event.target.value)}>
                <option value="SEMUA">Semua kecepatan</option>
                <option value="REGULER">Reguler</option>
                <option value="PERCEPATAN">Percepatan</option>
              </select>
            </label>
            <label>
              <span>Periode masuk</span>
              <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                <option value="SEMUA">Semua periode</option>
                <option value="7_HARI">7 hari terakhir</option>
                <option value="30_HARI">30 hari terakhir</option>
                <option value="TAHUN_INI">Tahun ini</option>
              </select>
            </label>
          </div>
        </div>

        <div className="table-toolbar">
          <div>
            {hasFilters && <button className="clear-filter" type="button" onClick={resetFilters}>Reset filter</button>}
          </div>
          <label className="sort-control">
            <span>Urutkan</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="TERBARU">Terbaru</option>
              <option value="TERLAMA">Terlama</option>
              <option value="PERUSAHAAN">Nama perusahaan</option>
            </select>
          </label>
        </div>

        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Permohonan</th>
                <th>Perusahaan & kontak</th>
                <th>Layanan</th>
                <th>Alat</th>
                <th>Status</th>
                <th><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const unitCount = item.alatList.reduce((sum, alat) => sum + alat.jumlah, 0);
                return (
                  <tr key={item.id}>
                    <td data-label="Permohonan">
                      <Link className="submission-number" href={`/staff/${item.id}`}>{item.nomorSurat}</Link>
                      <span className="table-secondary">{dateFormatter.format(new Date(item.tanggalPermohonan))}</span>
                    </td>
                    <td data-label="Perusahaan & kontak">
                      <strong className="company-name">{item.namaPerusahaan}</strong>
                      <span className="table-secondary">{item.narahubung} · {item.hp}</span>
                    </td>
                    <td data-label="Layanan">
                      <span>{serviceLabels[item.jenisLayanan] ?? item.jenisLayanan}</span>
                      <span className="table-secondary">{item.kecepatanLayanan === "PERCEPATAN" ? "Percepatan" : "Reguler"}</span>
                    </td>
                    <td data-label="Alat">
                      <strong>{unitCount} unit</strong>
                      <span className="table-secondary">{item.alatList.length} jenis alat</span>
                    </td>
                    <td data-label="Status">
                      <span className={`badge ${item.archivedAt ? "badge-archived" : item.status === "SELESAI" ? "badge-done" : "badge-pending"}`}>
                        <i aria-hidden="true" />
                        {item.archivedAt ? "Diarsipkan" : item.status === "SELESAI" ? "Selesai" : "Menunggu approval"}
                      </span>
                      {item.archivedAt && <span className="table-secondary">{dateFormatter.format(new Date(item.archivedAt))}</span>}
                    </td>
                    <td className="table-action">
                      <div className="row-actions">
                        <Link className="open-button" href={`/staff/${item.id}`} aria-label={`Buka permohonan ${item.nomorSurat}`}>
                          Buka <span aria-hidden="true">&rarr;</span>
                        </Link>
                        <SubmissionArchiveButton submissionId={item.id} nomorSurat={item.nomorSurat} archived={Boolean(item.archivedAt)} compact />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="dashboard-empty">
            <span><SearchIcon /></span>
            <h3>{submissions.length === 0 ? "Belum ada permohonan" : view === "ARSIP" && stats.archived === 0 ? "Arsip masih kosong" : "Data tidak ditemukan"}</h3>
            <p>{submissions.length === 0 ? "Permohonan baru akan muncul otomatis di sini." : view === "ARSIP" && stats.archived === 0 ? "Permohonan yang diarsipkan akan tetap tersimpan dan muncul di sini." : "Coba ubah kata kunci atau reset filter yang digunakan."}</p>
            {hasFilters && <button type="button" className="btn btn-secondary btn-small" onClick={resetFilters}>Reset filter</button>}
          </div>
        )}
      </section>
    </>
  );
}
