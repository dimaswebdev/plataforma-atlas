"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, UserRoundCheck } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-atlas-navy-base p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-atlas-gold-main/5 rounded-full blur-[100px] -z-10"></div>
      
      <div className="relative w-full max-w-md rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-6 shadow-2xl sm:p-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-atlas-gold-main to-transparent"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-atlas-navy-base rounded-full flex items-center justify-center border border-atlas-gold-main/50 mb-4 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <ShieldCheck className="w-8 h-8 text-atlas-gold-main" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-white sm:text-2xl">Acesso Restrito</h1>
          <p className="text-atlas-text-muted text-sm mt-2">Comissão Organizadora ATLAS</p>
          <p className="mt-3 max-w-xs text-center text-xs leading-relaxed text-atlas-text-muted/80">
            Esta entrada é exclusiva para administradores. Participantes devem usar o cadastro público.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-atlas-text-light mb-1">E-mail Oficial</label>
            <input
              type="email"
              required
              className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-3 text-white focus:outline-none focus:border-atlas-gold-main focus:ring-1 focus:ring-atlas-gold-main transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-atlas-text-light mb-1">Senha</label>
            <input
              type="password"
              required
              className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-3 text-white focus:outline-none focus:border-atlas-gold-main focus:ring-1 focus:ring-atlas-gold-main transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-atlas-gold-main text-atlas-navy-deep font-bold rounded hover:bg-atlas-gold-dark transition-colors uppercase tracking-widest disabled:opacity-70 mt-2"
          >
            {loading ? "Autenticando..." : "Entrar no Painel"}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start gap-3">
            <UserRoundCheck className="mt-0.5 h-5 w-5 shrink-0 text-atlas-gold-main" />
            <div>
              <p className="text-sm font-bold text-white">Sou participante</p>
              <p className="mt-1 text-xs leading-relaxed text-atlas-text-muted">
                Para cadastro inicial, confirmação de presença e informações públicas, use o portal de participantes.
              </p>
              <Link
                href="/confirmar-interesse"
                className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-atlas-gold-main transition-colors hover:text-atlas-gold-dark"
              >
                Ir para cadastro
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
