"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function PublicNav() {
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-atlas-navy-aero/30 bg-atlas-navy-base/95 backdrop-blur supports-[backdrop-filter]:bg-atlas-navy-base/80">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <Link href="/" className="flex items-center space-x-2 text-atlas-gold-main hover:text-atlas-gold-dark transition-colors">
          <Image
            src="/logo-fab.svg"
            alt="Logo FAB"
            width={28}
            height={28}
            style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
          />
          <span className="hidden font-bold sm:inline-block uppercase tracking-wider">
            Turma ATLAS 30 Anos
          </span>
        </Link>
        <nav className="flex items-center space-x-4 md:space-x-6 text-sm font-medium">
          <Link href="/" className="hidden lg:block transition-colors hover:text-atlas-gold-main text-atlas-text-light/90">
            Início
          </Link>
          <Link href="/programacao" className="hidden lg:block transition-colors hover:text-atlas-gold-main text-atlas-text-light/90">
            Programação
          </Link>
          <Link href="/visitantes" className="hidden md:block transition-colors hover:text-atlas-gold-main text-atlas-text-light/90">
            Visitantes
          </Link>
          <Link href="/prestacao-contas" className="hidden md:block transition-colors hover:text-atlas-gold-main text-atlas-text-light/90">
            Prestação de Contas
          </Link>
          <Link href="/souvenirs" className="hidden lg:block transition-colors hover:text-atlas-gold-main text-atlas-text-light/90">
            Souvenirs
          </Link>
          
          <div className="flex items-center space-x-2 border-l border-atlas-navy-aero/30 pl-4 ml-2">
            {user && isAdmin ? (
              <Link href="/admin/dashboard" className="flex items-center text-xs uppercase tracking-wider text-atlas-gold-main hover:text-atlas-gold-dark font-bold transition-colors" title="Voltar ao Painel">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Painel
              </Link>
            ) : (
              <Link href="/admin/login" className="flex items-center text-xs uppercase tracking-wider text-atlas-text-muted hover:text-white transition-colors" title="Acesso da Comissão">
                <Lock className="w-3 h-3 mr-1" />
                Entrar
              </Link>
            )}
            <Link href="/confirmar-interesse" className="px-3 py-1.5 rounded bg-atlas-gold-main text-atlas-navy-deep font-semibold hover:bg-atlas-gold-dark transition-colors uppercase text-xs tracking-wider">
              Confirmar Presença
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
