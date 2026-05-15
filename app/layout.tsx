import type { Metadata } from "next";
import "./globals.css";
import "./responsive.css";
import FluidEffectLazy from "@/components/FluidEffectLazy";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BackgroundCapitole from "@/components/BackgroundCapitole";
import { Orbitron } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" })

const futura = localFont({
  src: [
    { path: '../public/fonts/FuturaMediumBT.ttf',       weight: '400', style: 'normal' },
    { path: '../public/fonts/FuturaMediumItalicBT.ttf', weight: '400', style: 'italic' },
    { path: '../public/fonts/FuturaBoldBT.ttf',         weight: '700', style: 'normal' },
    { path: '../public/fonts/FuturaBoldItalicBT.ttf',   weight: '700', style: 'italic' },
  ],
  variable: '--font-futura',
  display: 'swap',
})

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
    <html lang="fr" className={`h-full ${orbitron.variable} ${futura.variable}`}>
      <body className="min-h-full flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18165730479"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18165730479');
          `}
        </Script>
        <BackgroundCapitole />
        <FluidEffectLazy />
        <Nav />
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', position: 'relative' }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
