"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, CheckCircle, Home, Lock, ShieldCheck, UserRoundCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  PARTICIPANT_HOME_PATH,
  PARTICIPANT_REGISTRATION_PATH,
} from "@/lib/participant-portal-config";

type AccessMode = "login" | "register";

type ParticipantMeResponse = {
  status?: "linked" | "needs_registration" | "conflict";
  message?: string;
  error?: string;
};

const logoFilter =
  "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)";

function getFirebaseMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) return "Não foi possível autenticar agora. Tente novamente.";

  if (error.code === "auth/invalid-credential") return "E-mail ou senha incorretos.";
  if (error.code === "auth/email-already-in-use") return "Este e-mail já possui conta. Use a opção Entrar.";
  if (error.code === "auth/weak-password") return "Use uma senha com pelo menos 6 caracteres.";
  if (error.code === "auth/invalid-email") return "Informe um e-mail válido.";

  return "Erro ao autenticar. Verifique os dados e tente novamente.";
}

export default function ParticipanteEntrarPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<AccessMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function resolveParticipantAccess(currentUser = auth.currentUser) {
    if (!currentUser) return;

    setInfo("Verificando seu cadastro na Turma ATLAS...");
    const token = await currentUser.getIdToken();
    const response = await fetch("/api/participant/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = (await response.json().catch(() => null)) as ParticipantMeResponse | null;

    if (response.ok && data?.status === "linked") {
      router.replace(PARTICIPANT_HOME_PATH);
      return;
    }

    if (response.ok && data?.status === "needs_registration") {
      router.replace(PARTICIPANT_REGISTRATION_PATH);
      return;
    }

    if (response.status === 409 || data?.status === "conflict") {
      setError(data?.message || "Existe conflito no vínculo do cadastro. A comissão precisa validar seu acesso.");
      setInfo("");
      return;
    }

    setError(data?.error || "Não foi possível verificar seu cadastro agora.");
    setInfo("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setInfo("");

    try {
      const credential = mode === "login"
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      await resolveParticipantAccess(credential.user);
    } catch (err) {
      setError(getFirebaseMessage(err));
      setInfo("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="atlas-admin-shell flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-atlas-navy-aero/35 bg-[#020617]/76 shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden border-r border-white/10 bg-[#071A2F]/70 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-atlas-gold-main/35 bg-atlas-gold-main/10">
                <Image src="/logo-fab.svg" alt="Logo FAB" width={30} height={30} style={{ filter: logoFilter }} />
              </div>
              <div>
                <p className="atlas-kicker text-atlas-gold-main">Registro Oficial</p>
                <p className="mt-1 text-sm text-atlas-text-muted">Turma ATLAS 30 Anos</p>
              </div>
            </div>

            <h1 className="atlas-admin-title max-w-md text-white">Acesso do Participante</h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-atlas-text-muted">
              Entre com e-mail e senha para acessar sua conta, confirmar dados, acompanhar convidados, kits, financeiro e etapas futuras da comissão.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-atlas-gold-main" />
              <p className="text-sm leading-relaxed text-atlas-text-muted">
                O cadastro público direto foi preservado como estrutura, mas agora o fluxo oficial começa pelo login do participante.
              </p>
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-atlas-gold-main/35 bg-atlas-gold-main/10">
              <Image src="/logo-fab.svg" alt="Logo FAB" width={28} height={28} style={{ filter: logoFilter }} />
            </div>
            <div>
              <p className="atlas-kicker text-atlas-gold-main">Registro Oficial</p>
              <p className="text-sm text-atlas-text-muted">Turma ATLAS 30 Anos</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-lg border border-white/10 bg-white/[0.035] p-1">
            {[
              ["login", "Entrar"],
              ["register", "Criar conta"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value as AccessMode);
                  setError("");
                  setInfo("");
                }}
                className={`rounded-md px-3 py-2 text-sm font-black uppercase transition-colors ${
                  mode === value ? "bg-atlas-gold-main text-atlas-navy-deep" : "text-atlas-text-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mb-7">
            <h2 className="atlas-section-title text-white">{mode === "login" ? "Entrar na minha conta" : "Criar conta do participante"}</h2>
            <p className="mt-2 text-sm leading-relaxed text-atlas-text-muted">
              {mode === "login"
                ? "Após o login, o sistema procura seu cadastro e envia você para Minha Conta ou para o cadastro passo a passo."
                : "Use um e-mail próprio. Ele será a chave de vínculo com seu cadastro individual."}
            </p>
          </div>

          {error && (
            <div className="atlas-error-box mb-6 text-center" aria-live="polite">
              {error}
            </div>
          )}

          {info && (
            <div className="mb-6 rounded-lg border border-blue-500/25 bg-blue-500/10 p-4 text-sm text-blue-100" aria-live="polite">
              {info}
            </div>
          )}

          {!loading && user && (
            <div className="mb-6 rounded-lg border border-atlas-gold-main/25 bg-atlas-gold-main/10 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-white">Sessão de participante ativa</p>
                  <p className="mt-1 text-xs text-atlas-text-muted">{user.email || "Conta autenticada"}</p>
                </div>
                <button type="button" onClick={() => void resolveParticipantAccess(user)} className="atlas-secondary-button">
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="participant-email" className="atlas-form-label">E-mail</label>
              <input
                id="participant-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="participant-password" className="atlas-form-label">Senha</label>
              <input
                id="participant-password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button type="submit" disabled={submitting || loading} className="atlas-primary-button w-full">
              {submitting || loading ? "Verificando..." : mode === "login" ? "Entrar" : "Criar conta e continuar"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 grid gap-3">
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 p-3 text-xs font-black uppercase tracking-widest text-atlas-text-muted transition-colors hover:border-atlas-gold-main/30 hover:text-white">
              <Home className="h-4 w-4" />
              Voltar para o início
            </Link>

            <div className="atlas-admin-card-muted p-4">
              <div className="flex items-start gap-3">
                <UserRoundCheck className="mt-0.5 h-5 w-5 shrink-0 text-atlas-gold-main" />
                <div>
                  <p className="text-sm font-bold text-white">Primeiro acesso</p>
                  <p className="mt-1 text-xs leading-relaxed text-atlas-text-muted">
                    Se o sistema não encontrar cadastro vinculado ao seu e-mail, você será enviado ao formulário passo a passo.
                  </p>
                </div>
              </div>
            </div>

            <Link href="/admin/login" className="inline-flex items-center justify-center gap-2 text-xs font-black uppercase text-atlas-text-muted transition-colors hover:text-white">
              <Lock className="h-3.5 w-3.5" />
              Acesso da comissão
            </Link>

            <div className="flex items-center justify-center gap-2 text-xs text-atlas-text-muted">
              <CheckCircle className="h-3.5 w-3.5 text-atlas-gold-main" />
              Cadastro público direto desativado nesta fase.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
