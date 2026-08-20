import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schiitische Bücher in deutscher Sprache",
  description:
    "Verzeichnis schiitischer Bücher in deutscher Sprache — ein katalogisierter Archivkatalog.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}