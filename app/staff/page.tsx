import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/SignOutButton";
import CertindoBrand from "@/components/CertindoBrand";
import StaffDashboardClient from "@/components/StaffDashboardClient";

export default async function StaffDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/staff/login");

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: { alatList: true },
  });

  const dashboardData = submissions.map((submission) => ({
    ...submission,
    tanggalPermohonan: submission.tanggalPermohonan.toISOString(),
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
  }));

  return (
    <main className="staff-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div>
            <div className="staff-brand staff-brand-left"><CertindoBrand /></div>
            <p className="dashboard-welcome">Ruang kerja staf</p>
            <h1>Dashboard Permohonan</h1>
            <p>Pantau dan proses permohonan kalibrasi dalam satu tempat.</p>
          </div>
          <div className="dashboard-account">
            <div className="account-copy">
              <span className="account-avatar" aria-hidden="true">{session.user?.name?.charAt(0).toUpperCase() || "S"}</span>
              <span><small>Masuk sebagai</small><strong>{session.user?.name}</strong></span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="dashboard-content">
        <StaffDashboardClient submissions={dashboardData} />
      </div>
    </main>
  );
}
