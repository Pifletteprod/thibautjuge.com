import type { Metadata } from "next";
import "./globals.css";
import FluidEffect from "@/components/FluidEffect";
import Nav from "@/components/Nav";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" })

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
    <html lang="fr" className={`h-full ${orbitron.variable}`}>
      <body className="min-h-full flex flex-col">
        <FluidEffect />
        <Nav />
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', position: 'relative' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
