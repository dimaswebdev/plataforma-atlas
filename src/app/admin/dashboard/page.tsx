"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import { formatCurrencyBRL } from "@/lib/utils";
import { Users, DollarSign, Wallet, Activity } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    confirmedParticipants: 0,
    income: 0,
    expense: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const pRef = collection(db, "events", DEFAULT_EVENT_ID, "participants");
        const totalP = await getCountFromServer(pRef);
        
        const qConfirmed = query(pRef, where("willAttend", "==", "yes"));
        const confirmedP = await getCountFromServer(qConfirmed);

        const tRef = collection(db, "events", DEFAULT_EVENT_ID, "transactions");
        const tSnap = await getDocs(tRef);
        let income = 0;
        let expense = 0;
        tSnap.forEach(doc => {
          const data = doc.data();
          if (data.type === "income") income += data.amount;
          if (data.type === "expense") expense += data.amount;
        });

        setStats({
          totalParticipants: totalP.data().count,
          confirmedParticipants: confirmedP.data().count,
          income,
          expense,
        });
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
    <div className="animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 uppercase tracking-tight">
          Visão Geral
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-atlas-gold-main/50 to-transparent" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Interessados Card */}
        <div className="relative group overflow-hidden bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-atlas-gold-main/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Users className="w-24 h-24 text-atlas-gold-main" />
          </div>
          <div className="relative z-10 flex items-center space-x-5">
            <div className="p-3.5 bg-gradient-to-br from-atlas-gold-main/20 to-atlas-gold-main/5 rounded-xl border border-atlas-gold-main/20 shadow-inner">
              <Users className="w-6 h-6 text-atlas-gold-main" />
            </div>
            <div>
              <p className="text-[10px] text-atlas-gold-main uppercase tracking-[0.2em] font-bold mb-1">Interessados</p>
              <p className="text-3xl font-black text-white leading-none">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>

        {/* Confirmados Card */}
        <div className="relative group overflow-hidden bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Activity className="w-24 h-24 text-green-400" />
          </div>
          <div className="relative z-10 flex items-center space-x-5">
            <div className="p-3.5 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl border border-green-500/20 shadow-inner">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-green-400 uppercase tracking-[0.2em] font-bold mb-1">Confirmados</p>
              <p className="text-3xl font-black text-white leading-none">{stats.confirmedParticipants}</p>
            </div>
          </div>
        </div>

        {/* Arrecadado Card */}
        <div className="relative group overflow-hidden bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-blue-400/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(96,165,250,0.15)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <DollarSign className="w-24 h-24 text-blue-400" />
          </div>
          <div className="relative z-10 flex items-center space-x-5">
            <div className="p-3.5 bg-gradient-to-br from-blue-400/20 to-blue-400/5 rounded-xl border border-blue-400/20 shadow-inner">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-bold mb-1">Arrecadado</p>
              <p className="text-2xl font-black text-white leading-none tracking-tight">{formatCurrencyBRL(stats.income)}</p>
            </div>
          </div>
        </div>

        {/* Despesas Card */}
        <div className="relative group overflow-hidden bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-red-400/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(248,113,113,0.15)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Wallet className="w-24 h-24 text-red-400" />
          </div>
          <div className="relative z-10 flex items-center space-x-5">
            <div className="p-3.5 bg-gradient-to-br from-red-400/20 to-red-400/5 rounded-xl border border-red-400/20 shadow-inner">
              <Wallet className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-[10px] text-red-400 uppercase tracking-[0.2em] font-bold mb-1">Despesas</p>
              <p className="text-2xl font-black text-white leading-none tracking-tight">{formatCurrencyBRL(stats.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saldo em Caixa */}
      <div className="relative overflow-hidden bg-gradient-to-br from-atlas-gold-main/10 to-transparent backdrop-blur-xl p-8 rounded-2xl border border-atlas-gold-main/30 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-atlas-gold-main/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-xs font-bold text-atlas-gold-main mb-2 uppercase tracking-[0.3em]">Resumo Financeiro Atual</h2>
          <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-atlas-gold-main to-white tracking-tighter">
            {formatCurrencyBRL(stats.income - stats.expense)}
          </div>
          <p className="text-sm text-atlas-text-light/80 mt-3 font-medium tracking-wide">Saldo em caixa consolidado disponível para o evento.</p>
        </div>
      </div>
    </div>
  );
}
