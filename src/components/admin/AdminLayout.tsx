"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Home, Users, DollarSign, Gift, Calendar, Settings, ShieldCheck, Megaphone, Briefcase } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const MENU_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Home },
  { label: "Participantes", href: "/admin/participantes", icon: Users },
  { label: "Financeiro", href: "/admin/financeiro", icon: DollarSign },
  { label: "Souvenirs", href: "/admin/souvenirs", icon: Gift },
  { label: "Fornecedores", href: "/admin/fornecedores", icon: Briefcase },
  { label: "Programação", href: "/admin/programacao", icon: Calendar },
  { label: "Comunicados", href: "/admin/comunicados", icon: Megaphone },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin) && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
    if (!loading && user && isAdmin && pathname === "/admin/login") {
      router.push("/admin/dashboard");
    }
  }, [user, loading, isAdmin, router, pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#060e1c] text-atlas-gold-main font-bold animate-pulse">CARREGANDO SISTEMA...</div>;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!user || !isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="flex h-screen bg-[#060e1c] text-white overflow-hidden relative">
      {/* Background elements for cinematic feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-atlas-gold-main/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-atlas-navy-aero/10 blur-[150px] rounded-full" />
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-[#060e1c]/80 backdrop-blur-xl border-r border-atlas-gold-main/20 flex flex-col z-10 relative shadow-2xl shadow-black/50">
        <div className="h-20 flex items-center justify-center px-6 border-b border-atlas-gold-main/20 bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-fab.svg"
              alt="Logo FAB"
              width={28}
              height={28}
              style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
            />
            <div className="flex flex-col">
              <span className="font-black text-atlas-gold-main uppercase tracking-widest text-sm leading-none">Comando</span>
              <span className="text-[9px] text-atlas-text-muted tracking-[0.2em] uppercase mt-1">ATLAS 30 Anos</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1.5 px-4">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-300 group ${
                      isActive 
                        ? "bg-gradient-to-r from-atlas-gold-main/10 to-transparent text-atlas-gold-main border-l-2 border-atlas-gold-main" 
                        : "text-atlas-text-muted hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-3 transition-colors duration-300 ${isActive ? "text-atlas-gold-main" : "group-hover:text-atlas-gold-main/70"}`} />
                    <span className="font-medium tracking-wide">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-atlas-gold-main/20 space-y-2 bg-black/20">
          <Link 
            href="/"
            className="flex items-center w-full px-4 py-2 text-sm text-atlas-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 group"
          >
            <Home className="w-4 h-4 mr-3 group-hover:text-atlas-gold-main/70 transition-colors" />
            <span className="tracking-wide">Site Público</span>
          </Link>
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center w-full px-4 py-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span className="tracking-wide">Desconectar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
        <div className="p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
