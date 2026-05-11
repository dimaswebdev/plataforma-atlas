"use client";

import { useEffect, useState } from "react";
import { formatCurrencyBRL } from "@/lib/utils";
import { Users, DollarSign, Wallet, Activity, Shirt } from "lucide-react";
import { fetchWithAdminAuth } from "@/lib/client-auth";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    confirmedParticipants: 0,
    kitInterest: 0,
    income: 0,
    expense: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetchWithAdminAuth("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-atlas-gold-main text-xl font-bold animate-pulse tracking-widest uppercase">Carregando métricas...</div>
      </div>
    );
  }

  return (
    <div className="min-w-0 animate-in fade-in duration-700">
      <div className="mb-6 flex flex-col items-start gap-3 sm:mb-8 md:flex-row md:items-center md:gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 uppercase tracking-tight text-center md:text-left w-full md:w-auto">
          Visão Geral
        </h1>
        <div className="h-px w-full md:flex-1 bg-gradient-to-r from-atlas-gold-main/50 to-transparent" />
      </div>
      
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:gap-6">
        
        {/* Interessados Card */}
        <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:border-atlas-gold-main/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Users className="w-24 h-24 text-atlas-gold-main" />
          </div>
          <div className="relative z-10 flex min-w-0 items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-atlas-gold-main/20 to-atlas-gold-main/5 rounded-xl border border-atlas-gold-main/20 shadow-inner">
              <Users className="w-6 h-6 text-atlas-gold-main" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-atlas-gold-main uppercase tracking-[0.2em] font-bold mb-1">Interessados</p>
              <p className="text-3xl font-black text-white leading-none">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>

        {/* Confirmados Card */}
        <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Activity className="w-24 h-24 text-green-400" />
          </div>
          <div className="relative z-10 flex min-w-0 items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl border border-green-500/20 shadow-inner">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-green-400 uppercase tracking-[0.2em] font-bold mb-1">Confirmados</p>
              <p className="text-3xl font-black text-white leading-none">{stats.confirmedParticipants}</p>
            </div>
          </div>
        </div>

        {/* Kits Card */}
        <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:border-blue-400/50 hover:shadow-[0_0_30px_rgba(96,165,250,0.15)] sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Shirt className="w-24 h-24 text-blue-400" />
          </div>
          <div className="relative z-10 flex min-w-0 items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-blue-400/20 to-blue-400/5 rounded-xl border border-blue-400/20 shadow-inner">
              <Shirt className="w-6 h-6 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-bold mb-1">Kits Oficiais</p>
              <p className="text-3xl font-black text-white leading-none">{stats.kitInterest}</p>
            </div>
          </div>
        </div>

        {/* Arrecadado Card */}
        <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:border-blue-400/50 hover:shadow-[0_0_30px_rgba(96,165,250,0.15)] sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <DollarSign className="w-24 h-24 text-blue-400" />
          </div>
          <div className="relative z-10 flex min-w-0 items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-blue-400/20 to-blue-400/5 rounded-xl border border-blue-400/20 shadow-inner">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-bold mb-1">Arrecadado</p>
              <p className="break-words text-xl font-black leading-none tracking-tight text-white sm:text-2xl">{formatCurrencyBRL(stats.income)}</p>
            </div>
          </div>
        </div>

        {/* Despesas Card */}
        <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:border-red-400/50 hover:shadow-[0_0_30px_rgba(248,113,113,0.15)] sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Wallet className="w-24 h-24 text-red-400" />
          </div>
          <div className="relative z-10 flex min-w-0 items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-red-400/20 to-red-400/5 rounded-xl border border-red-400/20 shadow-inner">
              <Wallet className="w-6 h-6 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-red-400 uppercase tracking-[0.2em] font-bold mb-1">Despesas</p>
              <p className="break-words text-xl font-black leading-none tracking-tight text-white sm:text-2xl">{formatCurrencyBRL(stats.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saldo em Caixa */}
      <div className="relative min-w-0 overflow-hidden rounded-2xl border border-atlas-gold-main/30 bg-gradient-to-br from-atlas-gold-main/10 to-transparent p-5 shadow-[0_0_50px_rgba(212,175,55,0.05)] backdrop-blur-xl sm:p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-atlas-gold-main/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 text-center md:text-left">
          <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-atlas-gold-main sm:tracking-[0.3em] md:text-xs">Resumo Financeiro Atual</h2>
          <div className="break-words bg-gradient-to-r from-atlas-gold-main to-white bg-clip-text text-3xl font-black tracking-tighter text-transparent sm:text-5xl md:text-6xl">
            {formatCurrencyBRL(stats.income - stats.expense)}
          </div>
          <p className="text-xs md:text-sm text-atlas-text-light/80 mt-3 font-medium tracking-wide">Saldo em caixa consolidado disponível para o evento.</p>
        </div>
      </div>
    </div>
  );
}
