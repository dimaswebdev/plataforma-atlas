"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ArrowLeft, ArrowRight, CheckCircle, Home, Lock, ShieldCheck, UserRoundCheck } from "lucide-react";
import { AppBadge, AppButton, AppInput } from "@/components/ui";
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
            href="/admin/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
          >
            Acesso da comissão
            <Lock className="h-4 w-4" />
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
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Registro Oficial</p>
                  <p className="mt-1 text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Turma ATLAS 30 Anos
                  </p>
                </div>
              </div>

              <h1 className="max-w-md text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Acesso do Participante
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                Entre com e-mail e senha para acessar sua conta, confirmar dados, acompanhar convidados, kits, financeiro e etapas futuras da comissão.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">Fluxo oficial</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    O cadastro público direto foi preservado como estrutura, mas agora o fluxo oficial começa pelo login do participante.
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
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Registro Oficial</p>
                <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Turma ATLAS 30 Anos</p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-white/[0.03]">
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
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    mode === value
                      ? "bg-white text-brand-600 shadow-theme-xs dark:bg-gray-900 dark:text-brand-400"
                      : "text-gray-600 hover:bg-white/70 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <AppBadge color="primary" size="sm" startIcon={<Home className="h-3 w-3" />}>
                Portal do participante
              </AppBadge>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {mode === "login" ? "Entrar na minha conta" : "Criar conta do participante"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {mode === "login"
                  ? "Após o login, o sistema procura seu cadastro e envia você para Minha Conta ou para o cadastro passo a passo."
                  : "Use um e-mail próprio. Ele será a chave de vínculo com seu cadastro individual."}
              </p>
            </div>

            {error ? (
              <div className="mb-6 rounded-lg border border-error-200 bg-error-50 p-3 text-center text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-500" aria-live="polite">
                {error}
              </div>
            ) : null}

            {info ? (
              <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-3 text-center text-sm text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300" aria-live="polite">
                {info}
              </div>
            ) : null}

            {!loading && user ? (
              <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-500/20 dark:bg-brand-500/15">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white/90">Sessão de participante ativa</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user.email || "Conta autenticada"}</p>
                  </div>
                  <AppButton type="button" onClick={() => void resolveParticipantAccess(user)} endIcon={<ArrowRight className="h-4 w-4" />}>
                    Continuar
                  </AppButton>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="participant-email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  E-mail
                </label>
                <AppInput
                  id="participant-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@exemplo.com"
                />
              </div>

              <div>
                <label htmlFor="participant-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Senha
                </label>
                <AppInput
                  id="participant-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                />
              </div>

              <AppButton type="submit" fullWidth loading={submitting || loading} endIcon={!submitting && !loading ? <ArrowRight className="h-4 w-4" /> : undefined}>
                {submitting || loading ? "Verificando..." : mode === "login" ? "Entrar" : "Criar conta e continuar"}
              </AppButton>
            </form>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    <UserRoundCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white/90">Primeiro acesso</p>
                    <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                      Se o sistema não encontrar cadastro vinculado ao seu e-mail, você será enviado ao formulário passo a passo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 text-success-500" />
                Cadastro público direto desativado nesta fase.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
