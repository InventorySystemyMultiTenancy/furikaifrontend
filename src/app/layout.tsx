import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FavoritesSync } from "@/components/account/favorites-sync";

const display = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Furikai — Clube Automotivo",
    template: "%s · Furikai",
  },
  description:
    "Furikai. Cultura automotiva japonesa, streetwear e velocidade. Não é apenas um clube — é cultura em movimento.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${sans.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-furikai-black text-furikai-white">
        <Providers>
          <div className="grain-overlay" aria-hidden />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <FavoritesSync />
        </Providers>
      </body>
    </html>
  );
}
