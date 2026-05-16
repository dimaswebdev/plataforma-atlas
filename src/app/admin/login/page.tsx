"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Home, ShieldCheck, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AppBadge, AppButton, AppInput } from "@/components/ui";
import { PARTICIPANT_LOGIN_PATH } from "@/lib/participant-portal-config";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();
      const res = await fetch("/api/admin/check", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok || !data.isAdmin) {
        await signOut(auth);
        setError("Este e-mail não está autorizado para a área administrativa.");
        return;
      }

      router.replace("/admin/dashboard");
    } catch (err: unknown) {
      console.error("Login Error:", err);
      const msg = err instanceof FirebaseError && err.code === "auth/invalid-credential"
        ? "E-mail ou senha incorretos."
        : "Erro ao autenticar. Verifique seus dados e tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site público
          </Link>
          <Link
            href={PARTICIPANT_LOGIN_PATH}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
          >
            Entrar como participante
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden border-r border-gray-200 bg-gray-50 p-10 dark:border-gray-800 dark:bg-white/[0.03] lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 shadow-theme-xs">
                  <Image
                    src="/logo-fab.svg"
                    alt="Logo FAB"
                    width={30}
                    height={30}
                    className="brightness-0 invert"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Comando ATLAS</p>
                  <p className="mt-1 text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Área administrativa
                  </p>
                </div>
              </div>

              <h1 className="max-w-md text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Acesso da Comissão Organizadora
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                Painel restrito para acompanhar participantes, finanças, comunicados e dados operacionais do reencontro.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">Sessão segura</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Use somente credenciais autorizadas pela administração do evento.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-12">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 shadow-theme-xs">
                <Image
                  src="/logo-fab.svg"
                  alt="Logo FAB"
                  width={28}
                  height={28}
                  className="brightness-0 invert"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Comando ATLAS</p>
                <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Área administrativa</p>
              </div>
            </div>

            <div className="mb-8">
              <AppBadge color="primary" size="sm" startIcon={<Home className="h-3 w-3" />}>
                Área administrativa
              </AppBadge>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Entrar no painel
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Informe seu e-mail e senha administrativos.
              </p>
            </div>

            {error ? (
              <div className="mb-6 rounded-lg border border-error-200 bg-error-50 p-3 text-center text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-500" aria-live="polite">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  E-mail oficial
                </label>
                <AppInput
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@atlas.com"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Senha
                </label>
                <AppInput
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                />
              </div>

              <AppButton type="submit" fullWidth loading={loading}>
                {loading ? "Autenticando..." : "Entrar no painel"}
              </AppButton>
            </form>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  <UserRoundCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">Sou participante</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Cadastro, confirmação de presença e informações públicas ficam no portal de participantes.
                  </p>
                  <Link
                    href={PARTICIPANT_LOGIN_PATH}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    Entrar como participante
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
