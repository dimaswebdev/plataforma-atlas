"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PARTICIPANT_LOGIN_PATH } from "@/lib/participant-portal-config";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
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

  const logoFilter = "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)";

  return (
    <main className="atlas-admin-shell flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-atlas-navy-aero/35 bg-[#020617]/76 shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden border-r border-white/10 bg-[#071A2F]/70 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-atlas-gold-main/35 bg-atlas-gold-main/10">
                <Image
                  src="/logo-fab.svg"
                  alt="Logo FAB"
                  width={30}
                  height={30}
                  style={{ filter: logoFilter }}
                />
              </div>
              <div>
                <p className="atlas-kicker text-atlas-gold-main">Comando ATLAS</p>
                <p className="mt-1 text-sm text-atlas-text-muted">Área administrativa</p>
              </div>
            </div>

            <h1 className="atlas-admin-title max-w-md text-white">Acesso da Comissão Organizadora</h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-atlas-text-muted">
              Painel restrito para acompanhar participantes, finanças, comunicados e dados operacionais do reencontro.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-atlas-gold-main" />
              <p className="text-sm leading-relaxed text-atlas-text-muted">
                Use somente credenciais autorizadas pela administração do evento.
              </p>
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-atlas-gold-main/35 bg-atlas-gold-main/10">
              <Image
                src="/logo-fab.svg"
                alt="Logo FAB"
                width={28}
                height={28}
                style={{ filter: logoFilter }}
              />
            </div>
            <div>
              <p className="atlas-kicker text-atlas-gold-main">Comando ATLAS</p>
              <p className="text-sm text-atlas-text-muted">Área administrativa</p>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="atlas-section-title text-white">Entrar no painel</h2>
            <p className="mt-2 text-sm leading-relaxed text-atlas-text-muted">
              Informe seu e-mail e senha administrativos.
            </p>
          </div>

          {error && (
            <div className="atlas-error-box mb-6 text-center" aria-live="polite">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="atlas-form-label">E-mail oficial</label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="atlas-form-label">Senha</label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="atlas-primary-button w-full"
            >
              {loading ? "Autenticando..." : "Entrar no painel"}
            </button>
          </form>

          <div className="atlas-admin-card-muted mt-6 p-4">
            <div className="flex items-start gap-3">
              <UserRoundCheck className="mt-0.5 h-5 w-5 shrink-0 text-atlas-gold-main" />
              <div>
                <p className="text-sm font-bold text-white">Sou participante</p>
                <p className="mt-1 text-xs leading-relaxed text-atlas-text-muted">
                  Cadastro, confirmação de presença e informações públicas ficam no portal de participantes.
                </p>
                <Link
                  href={PARTICIPANT_LOGIN_PATH}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase text-atlas-gold-main transition-colors hover:text-atlas-gold-dark"
                >
                  Entrar como participante
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
