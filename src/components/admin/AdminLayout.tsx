"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Home, Users, DollarSign, Gift, Calendar, Settings, Megaphone, Briefcase, ChevronLeft, ChevronRight, Menu, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const MENU_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Home },
  { label: "Participantes", href: "/admin/participantes", icon: Users },
  { label: "Financeiro", href: "/admin/financeiro", icon: DollarSign },
  { label: "Kits/Souvenirs", href: "/admin/souvenirs", icon: Gift },
  { label: "Fornecedores", href: "/admin/fornecedores", icon: Briefcase },
  { label: "Programação", href: "/admin/programacao", icon: Calendar },
  { label: "Comunicados", href: "/admin/comunicados", icon: Megaphone },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, adminLoading, isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !adminLoading && (!user || !isAdmin) && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
    if (!loading && !adminLoading && user && isAdmin && pathname === "/admin/login") {
      router.push("/admin/dashboard");
    }
  }, [user, loading, adminLoading, isAdmin, router, pathname]);

  if (loading || adminLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#060e1c] text-atlas-gold-main font-bold animate-pulse">CARREGANDO SISTEMA...</div>;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!user || !isAdmin) {
    return null; // Will redirect
  }

  const renderSidebarContent = () => (
    <>
      <div className={`flex h-20 items-center ${isCollapsed ? 'justify-center' : 'px-5 sm:px-6'} border-b border-atlas-gold-main/20 bg-gradient-to-b from-white/5 to-transparent transition-all duration-300`}>
        <div className="flex items-center gap-3">
          <Image
            src="/logo-fab.svg"
            alt="Logo FAB"
            width={28}
            height={28}
            style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
          />
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-500">
              <span className="font-black text-atlas-gold-main uppercase tracking-widest text-sm leading-none">Comando</span>
              <span className="text-[9px] text-atlas-text-muted tracking-[0.2em] uppercase mt-1">ATLAS 30 Anos</span>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
        <ul className={`space-y-1.5 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center ${isCollapsed ? 'justify-center py-4' : 'px-4 py-3'} text-sm rounded-lg transition-all duration-300 group ${
                    isActive 
                      ? "bg-gradient-to-r from-atlas-gold-main/10 to-transparent text-atlas-gold-main border-l-2 border-atlas-gold-main" 
                      : "text-atlas-text-muted hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                  title={isCollapsed ? item.label : ""}
                >
                  <Icon className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'} transition-colors duration-300 ${isActive ? "text-atlas-gold-main" : "group-hover:text-atlas-gold-main/70"}`} />
                  {!isCollapsed && <span className="font-medium tracking-wide whitespace-nowrap">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`p-4 border-t border-atlas-gold-main/20 space-y-2 bg-black/20 transition-all duration-300`}>
        <Link 
          href="/"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 text-sm text-atlas-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 group`}
          title={isCollapsed ? "Site Público" : ""}
        >
          <Home className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'} group-hover:text-atlas-gold-main/70 transition-colors`} />
          {!isCollapsed && <span className="tracking-wide">Site Público</span>}
        </Link>
        <button 
          onClick={() => signOut(auth)}
          className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'px-4'} py-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300`}
          title={isCollapsed ? "Desconectar" : ""}
        >
          <LogOut className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && <span className="tracking-wide">Desconectar</span>}
        </button>
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-24 bg-atlas-gold-main text-atlas-navy-deep p-1 rounded-full border-2 border-atlas-navy-deep hover:scale-110 transition-transform z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </>
  );

  return (
    <div className="atlas-admin-shell relative flex h-dvh min-w-0 overflow-hidden font-sans text-white">
      <aside className={`hidden lg:flex flex-col bg-[#060e1c]/88 backdrop-blur-xl border-r border-atlas-gold-main/20 z-40 relative shadow-2xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {renderSidebarContent()}
      </aside>

      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 z-[70] h-full w-[min(18rem,85vw)] border-r border-atlas-gold-main/20 bg-[#060e1c] transition-transform duration-300 lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {renderSidebarContent()}
      </aside>

      <div className="relative z-10 flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="hidden h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#060e1c]/82 px-6 backdrop-blur-xl lg:flex">
          <div className="min-w-0">
            <p className="atlas-admin-breadcrumb">Área administrativa</p>
            <p className="mt-0.5 truncate text-sm text-atlas-text-muted">
              Gestão operacional do Reencontro 30 Anos da Turma ATLAS.
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-atlas-gold-main" aria-hidden="true" />
            <div className="min-w-0 text-right">
              <p className="text-[10px] font-bold uppercase text-atlas-text-muted">Sessão segura</p>
              <p className="max-w-56 truncate text-xs font-semibold text-white">{user.email}</p>
            </div>
          </div>
        </header>

        <header className="lg:hidden h-16 flex items-center justify-between px-4 bg-[#060e1c]/90 border-b border-atlas-gold-main/20 backdrop-blur-md">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="rounded-lg p-2 text-atlas-gold-main transition-colors hover:bg-white/5"
            aria-label="Abrir menu administrativo"
            aria-expanded={isMobileOpen}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <Image src="/logo-fab.svg" alt="Logo FAB" width={24} height={24} style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }} />
            <span className="font-black text-atlas-gold-main uppercase tracking-widest text-[10px]">Administração</span>
          </div>

          <button onClick={() => signOut(auth)} className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10" aria-label="Desconectar">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="custom-scrollbar min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px] min-w-0 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
