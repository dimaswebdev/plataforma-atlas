import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Reencontro 30 Anos — Turma ATLAS",
  description: "Portal oficial do reencontro de 30 anos da Turma ATLAS da Força Aérea Brasileira (1997–2027).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("scroll-smooth overflow-x-hidden", inter.variable)}>
      <body className={cn(
        "min-h-screen overflow-x-hidden bg-[var(--color-atlas-navy-base)] font-sans antialiased text-[var(--color-atlas-text-light)] selection:bg-[var(--color-atlas-gold-main)] selection:text-[var(--color-atlas-navy-deep)]"
      )}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
