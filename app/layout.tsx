import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Permohonan Kalibrasi | CERTINDO",
  description: "Portal pengajuan layanan kalibrasi PT Certindonesia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
