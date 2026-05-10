"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

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
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError("Credenciais inválidas ou sem permissão de acesso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-atlas-navy-base p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-atlas-gold-main/5 rounded-full blur-[100px] -z-10"></div>
      
      <div className="bg-atlas-navy-deep p-8 rounded-lg shadow-2xl w-full max-w-md border border-atlas-navy-aero/30 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-atlas-gold-main to-transparent"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-atlas-navy-base rounded-full flex items-center justify-center border border-atlas-gold-main/50 mb-4 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <ShieldCheck className="w-8 h-8 text-atlas-gold-main" />
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Acesso Restrito</h1>
          <p className="text-atlas-text-muted text-sm mt-2">Comissão Organizadora ATLAS</p>
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
      </div>
    </div>
  );
}
