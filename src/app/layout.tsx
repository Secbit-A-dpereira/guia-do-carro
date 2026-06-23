import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guia do Carro — Escolhe o carro certo para o teu budget",
  description:
    "Encontra o carro ideal, novo ou usado, com dados de fiabilidade reais. Compara, descobre e escolhe com confiança.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">
                Guia do Carro
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-muted">
              <Link href="/" className="hover:text-foreground transition-colors">
                Início
              </Link>
              <Link href="/catalogo" className="hover:text-foreground transition-colors">
                Catálogo
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-8">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted">
            <p>Guia do Carro — Ajudamos-te a escolher o carro certo.</p>
            <p className="mt-1">Os dados de fiabilidade são baseados em reports de utilizadores.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
