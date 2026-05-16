"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  Calendar,
  ChevronDown,
  DollarSign,
  Gift,
  Home,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UserCircle,
  Users,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { AppHeader, AppShell, AppSidebar } from "@/components/layout";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";

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

type AdminTheme = "light" | "dark";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, adminLoading, isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminTheme, setAdminTheme] = useState<AdminTheme>(() => {
    if (typeof window === "undefined") return "light";
    const savedTheme = window.localStorage.getItem("atlas-admin-theme");
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.dataset.adminTheme = adminTheme;
    window.localStorage.setItem("atlas-admin-theme", adminTheme);

    return () => {
      delete document.documentElement.dataset.adminTheme;
    };
  }, [adminTheme]);

  useEffect(() => {
    if (!loading && !adminLoading && (!user || !isAdmin) && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
    if (!loading && !adminLoading && user && isAdmin && pathname === "/admin/login") {
      router.push("/admin/dashboard");
    }
  }, [user, loading, adminLoading, isAdmin, router, pathname]);

  if (loading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 font-semibold text-brand-400">
        CARREGANDO SISTEMA...
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  const nextTheme = adminTheme === "light" ? "dark" : "light";
  const ThemeIcon = adminTheme === "light" ? Moon : Sun;
  const themeLabel = adminTheme === "light" ? "Usar modo escuro" : "Usar modo claro";
  const userEmail = user.email || "admin@atlas.com";
  const userInitial = userEmail.trim().charAt(0).toUpperCase() || "A";

  const handleSignOut = () => {
    void signOut(auth);
  };

  const closeTransientMenus = () => {
    setIsMobileOpen(false);
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  };

  const renderSidebarContent = () => (
    <>
      <div className={`flex h-20 items-center border-b border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${isCollapsed ? "justify-center" : "px-5 sm:px-6"}`}>
        <div className="flex items-center gap-3">
          <div className="tailadmin-brand-mark h-10 w-10 shrink-0 shadow-theme-sm">
            <Image
              src="/logo-fab.svg"
              alt="Logo FAB"
              width={24}
              height={24}
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          {!isCollapsed && (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold leading-none text-gray-900 dark:text-white">Comando</span>
              <span className="mt-1 text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">ATLAS 30 Anos</span>
            </div>
          )}
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto py-6">
        <ul className={`space-y-1.5 ${isCollapsed ? "px-2" : "px-4"}`}>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeTransientMenus}
                  className={`group flex h-11 items-center rounded-lg text-sm font-medium transition duration-200 ${
                    isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                  } ${
                    isActive
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/[0.12] dark:text-brand-400"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      isActive
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                    }`}
                    aria-hidden="true"
                  />
                  {!isCollapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-gray-200 bg-white p-4 transition-all duration-300 dark:border-gray-800 dark:bg-gray-900">
        <Link
          href="/"
          onClick={closeTransientMenus}
          className={`group flex h-10 items-center rounded-lg text-sm font-medium text-gray-700 transition duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white ${
            isCollapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
          title="Site Público"
        >
          <Home className="h-5 w-5 shrink-0 text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" aria-hidden="true" />
          {!isCollapsed && <span className="truncate">Site Público</span>}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className={`flex h-10 w-full items-center rounded-lg text-sm font-medium text-error-600 transition duration-200 hover:bg-error-50 hover:text-error-700 dark:text-error-500 dark:hover:bg-error-500/10 ${
            isCollapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
          title="Desconectar"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span className="truncate">Desconectar</span>}
        </button>
      </div>
    </>
  );

  const desktopHeader = (
    <AppHeader>
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-theme-xs transition hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="relative hidden w-[min(430px,34vw)] xl:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            readOnly
            placeholder="Pesquisar ou digitar comando..."
            className="h-11 w-full rounded-lg border border-gray-200 bg-white py-2 pl-12 pr-16 text-sm text-gray-700 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:placeholder:text-gray-500"
            aria-label="Pesquisa administrativa"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-gray-200 px-2 py-1 text-theme-xs font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Ctrl K
          </span>
        </div>

        <div className="min-w-0 xl:hidden">
          <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Área administrativa</p>
          <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
            Gestão operacional do Reencontro 30 Anos da Turma ATLAS.
          </p>
        </div>
      </div>

      <div className="relative flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setAdminTheme(nextTheme)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-theme-xs transition hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          aria-label={themeLabel}
          aria-pressed={adminTheme === "light"}
          title={themeLabel}
        >
          <ThemeIcon className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen((current) => !current);
              setIsProfileOpen(false);
            }}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-theme-xs transition hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Abrir notificações"
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-warning-500 ring-2 ring-white dark:ring-gray-900" />
          </button>

          {isNotificationsOpen ? (
            <div className="absolute right-0 top-14 z-[90] w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">Notificações</p>
                <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">Espaço reservado para alertas do sistema.</p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">Fluxo de participantes</p>
                  <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">Cadastro e vínculo prontos para acompanhamento.</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">Financeiro</p>
                  <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">Valores finais aguardam deliberação da comissão.</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((current) => !current);
              setIsNotificationsOpen(false);
            }}
            className="flex h-11 items-center gap-3 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
            aria-label="Abrir menu do perfil"
            aria-expanded={isProfileOpen}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-sm font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              {userInitial}
            </span>
            <span className="hidden min-w-0 text-left xl:block">
              <span className="block max-w-40 truncate text-sm font-medium text-gray-800 dark:text-white/90">
                Administração
              </span>
              <span className="block max-w-40 truncate text-theme-xs text-gray-500 dark:text-gray-400">
                {userEmail}
              </span>
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition-transform dark:text-gray-400 ${isProfileOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {isProfileOpen ? (
            <div className="absolute right-0 top-14 z-[90] w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-gray-100 px-4 py-4 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">Comando ATLAS</p>
                <p className="mt-1 truncate text-theme-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
              </div>
              <div className="space-y-1 p-2">
                <Link
                  href="/admin/configuracoes"
                  onClick={closeTransientMenus}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                  Configurações de conta
                </Link>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <ShieldCheck className="h-4 w-4 text-brand-500" aria-hidden="true" />
                  Sessão segura
                </div>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <UserCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                  Perfil administrativo
                </div>
              </div>
              <div className="border-t border-gray-100 p-2 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-error-600 transition hover:bg-error-50 dark:text-error-500 dark:hover:bg-error-500/10"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sair
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AppHeader>
  );

  const mobileHeader = (
    <AppHeader mobile>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-brand-400"
        aria-label="Abrir menu administrativo"
        aria-expanded={isMobileOpen}
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2">
        <div className="tailadmin-brand-mark h-8 w-8">
          <Image src="/logo-fab.svg" alt="Logo FAB" width={20} height={20} style={{ filter: "brightness(0) invert(1)" }} />
        </div>
        <span className="text-theme-xs font-semibold uppercase text-gray-800 dark:text-white">Administração</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsNotificationsOpen((current) => !current)}
          className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-brand-400"
          aria-label="Abrir notificações"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-warning-500" />
        </button>
        <button
          type="button"
          onClick={() => setAdminTheme(nextTheme)}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-brand-400"
          aria-label={themeLabel}
          aria-pressed={adminTheme === "light"}
        >
          <ThemeIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg p-2 text-error-600 transition-colors hover:bg-error-50 dark:text-error-500 dark:hover:bg-error-500/10"
          aria-label="Desconectar"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </AppHeader>
  );

  return (
    <AppShell
      theme={adminTheme}
      sidebar={<AppSidebar collapsed={isCollapsed}>{renderSidebarContent()}</AppSidebar>}
      mobileOverlay={
        isMobileOpen ? (
          <div
            className="fixed inset-0 z-[60] bg-gray-950/70 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        ) : null
      }
      mobileSidebar={<AppSidebar mobile open={isMobileOpen}>{renderSidebarContent()}</AppSidebar>}
      header={desktopHeader}
      mobileHeader={mobileHeader}
      floatingLayer={
        isNotificationsOpen ? (
          <div className="absolute right-4 top-[72px] z-[80] w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 lg:hidden">
            <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">Notificações</p>
              <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">Alertas administrativos aparecerão aqui.</p>
            </div>
            <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              Nenhuma notificação crítica no momento.
            </div>
          </div>
        ) : null
      }
    >
      {children}
    </AppShell>
  );
}
