"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Lock, ShieldCheck, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function PublicNav() {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuLinks = [
    { href: "/", label: "Início" },
    { href: "/programacao", label: "Programação" },
    { href: "/visitantes", label: "Visitantes" },
    { href: "/prestacao-contas", label: "Prestação de Contas" },
    { href: "/souvenirs", label: "Souvenirs" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-atlas-navy-aero/30 bg-atlas-navy-base/95 backdrop-blur supports-[backdrop-filter]:bg-atlas-navy-base/80">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <Link href="/" className="flex items-center space-x-2 text-atlas-gold-main hover:text-atlas-gold-dark transition-colors shrink-0">
          <Image
            src="/logo-fab.svg"
            alt="Logo FAB"
            width={28}
            height={28}
            style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
          />
          <span className="font-bold uppercase tracking-wider text-[11px] sm:text-sm">
            Turma ATLAS 30 Anos
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
          {menuLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-atlas-gold-main text-atlas-text-light/90">
              {link.label}
            </Link>
          ))}
          
          <div className="flex items-center space-x-4 border-l border-atlas-navy-aero/30 pl-4 ml-2">
            {user && isAdmin ? (
              <Link href="/admin/dashboard" className="flex items-center text-xs uppercase tracking-wider text-atlas-gold-main hover:text-atlas-gold-dark font-bold transition-colors">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Painel
              </Link>
            ) : (
              <Link href="/admin/login" className="flex items-center text-xs uppercase tracking-wider text-atlas-text-muted hover:text-white transition-colors">
                <Lock className="w-3 h-3 mr-1" />
                Entrar
              </Link>
            )}
            <Link href="/confirmar-interesse" className="px-4 py-2 rounded bg-atlas-gold-main text-atlas-navy-deep font-bold hover:bg-atlas-gold-dark transition-all uppercase text-xs tracking-wider shadow-lg shadow-atlas-gold-main/20">
              Confirmar Presença
            </Link>
          </div>
        </nav>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-atlas-text-light hover:text-atlas-gold-main transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-atlas-navy-deep/95 backdrop-blur-xl border-b border-atlas-navy-aero/50 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col p-6 space-y-4">
            {menuLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-atlas-text-light hover:text-atlas-gold-main transition-colors border-b border-white/5 pb-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col space-y-4">
              {user && isAdmin ? (
                <Link 
                  href="/admin/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center p-3 rounded-lg border border-atlas-gold-main/30 text-atlas-gold-main font-black uppercase tracking-widest text-xs"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Painel Administrativo
                </Link>
              ) : (
                <Link 
                  href="/admin/login" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center p-3 rounded-lg border border-white/10 text-atlas-text-muted font-bold uppercase tracking-widest text-xs"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Acesso Comissão
                </Link>
              )}
              <Link 
                href="/confirmar-interesse" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center p-4 rounded-lg bg-atlas-gold-main text-atlas-navy-deep font-black uppercase tracking-widest text-xs shadow-xl"
              >
                Confirmar Presença
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
