import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thibaut Juge — Développeur web freelance",
  description: "Développeur web freelance spécialisé en sites rapides et performants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
