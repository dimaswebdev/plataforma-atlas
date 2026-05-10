"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
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
    return <div className="min-h-screen flex items-center justify-center bg-atlas-navy-base text-atlas-gold-main font-bold">CARREGANDO PAINEL...</div>;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!user || !isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="flex h-screen bg-atlas-navy-base text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-atlas-navy-deep border-r border-atlas-navy-aero/30 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-atlas-navy-aero/30">
          <ShieldCheck className="w-6 h-6 text-atlas-gold-main mr-2" />
          <span className="font-bold text-atlas-gold-main uppercase tracking-wider text-sm">Painel Comando</span>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm text-atlas-text-muted hover:text-white hover:bg-atlas-navy-base rounded transition-colors"
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-atlas-navy-aero/30 space-y-2">
          <Link 
            href="/"
            className="flex items-center w-full px-3 py-2 text-sm text-atlas-text-light hover:text-white hover:bg-atlas-navy-base rounded transition-colors"
          >
            <Home className="w-4 h-4 mr-3" />
            Ver Site Público
          </Link>
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-atlas-navy-base p-8">
        {children}
      </main>
    </div>
  );
}
