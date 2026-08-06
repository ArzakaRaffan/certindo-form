"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmissionArchiveButton({
  submissionId,
  nomorSurat,
  archived,
  compact = false,
}: {
  submissionId: string;
  nomorSurat: string;
  archived: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction() {
    const message = archived
      ? `Pulihkan ${nomorSurat} ke daftar permohonan aktif?`
      : `Arsipkan ${nomorSurat}? Data tetap tersimpan dan dapat dipulihkan.`;
    if (!window.confirm(message)) return;

    setLoading(true);
    setError(null);
    const response = await fetch(`/api/submissions/${submissionId}/archive`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: archived ? "restore" : "archive" }),
    });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Gagal memperbarui arsip.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="archive-action">
      <button
        type="button"
        className={compact ? "row-archive-button" : archived ? "btn btn-secondary btn-small" : "archive-button"}
        disabled={loading}
        onClick={handleAction}
      >
        {loading ? "Memproses..." : compact ? (archived ? "Pulihkan" : "Arsipkan") : archived ? "Pulihkan permohonan" : "Arsipkan permohonan"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
