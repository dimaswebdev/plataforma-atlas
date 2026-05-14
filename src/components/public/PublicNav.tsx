"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Lock, ShieldCheck, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { PARTICIPANT_LOGIN_PATH } from "@/lib/participant-portal-config";

export function PublicNav() {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuLinks = [
    { href: "/", label: "Início" },
    { href: "/minha-participacao", label: "Minha Conta" },
    { href: "/programacao", label: "Programação" },
    { href: "/visitantes", label: "Visitantes" },
    { href: "/prestacao-contas", label: "Prestação de Contas" },
    { href: "/souvenirs", label: "Souvenirs" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-atlas-gold-main/55 bg-[#030812]/95 backdrop-blur supports-[backdrop-filter]:bg-[#030812]/85">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 text-atlas-gold-main transition-colors hover:text-atlas-gold-dark">
          <Image
            src="/logo-fab.svg"
            alt="Logo FAB"
            width={28}
            height={28}
            style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
          />
          <span className="max-w-[11rem] truncate text-[10px] font-bold uppercase tracking-[0.14em] sm:max-w-none sm:text-sm sm:tracking-wider">
            Turma ATLAS 30 Anos
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 text-sm font-medium xl:flex xl:gap-6">
          {menuLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-atlas-gold-main text-atlas-text-light/90">
              {link.label}
            </Link>
          ))}
          
          <div className="ml-1 flex items-center gap-3 border-l border-atlas-navy-aero/30 pl-4">
            {user && isAdmin ? (
              <Link href="/admin/dashboard" className="flex items-center text-xs uppercase tracking-wider text-atlas-gold-main hover:text-atlas-gold-dark font-bold transition-colors">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Painel
              </Link>
            ) : (
              <Link href="/admin/login" className="flex items-center text-xs uppercase tracking-wider text-atlas-text-muted hover:text-white transition-colors">
                <Lock className="w-3 h-3 mr-1" />
                Comissão
              </Link>
            )}
            <Link href={PARTICIPANT_LOGIN_PATH} className="px-4 py-2 rounded bg-atlas-gold-main text-atlas-navy-deep font-bold hover:bg-atlas-gold-dark transition-all uppercase text-xs tracking-wider shadow-lg shadow-atlas-gold-main/20">
              Entrar
            </Link>
          </div>
        </nav>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-atlas-text-light transition-colors hover:bg-white/5 hover:text-atlas-gold-main xl:hidden"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-controls="public-mobile-menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-atlas-gold-main/25" />

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div
          id="public-mobile-menu"
          className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-atlas-navy-aero/50 bg-atlas-navy-deep/95 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300 xl:hidden"
        >
          <nav className="mx-auto flex w-full max-w-7xl flex-col gap-3 p-4 sm:p-6">
            {menuLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3 text-base font-bold text-atlas-text-light transition-colors hover:border-atlas-gold-main/30 hover:text-atlas-gold-main sm:text-lg"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2">
              {user && isAdmin ? (
                <Link 
                  href="/admin/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-atlas-gold-main/30 p-3 text-xs font-black uppercase tracking-widest text-atlas-gold-main"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Painel Administrativo
                </Link>
              ) : (
                <Link 
                  href="/admin/login" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-white/10 p-3 text-xs font-bold uppercase tracking-widest text-atlas-text-muted"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Acesso da Comissão
                </Link>
              )}
              <Link 
                href={PARTICIPANT_LOGIN_PATH}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-lg bg-atlas-gold-main p-4 text-xs font-black uppercase tracking-widest text-atlas-navy-deep shadow-xl"
              >
                Entrar como Participante
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
