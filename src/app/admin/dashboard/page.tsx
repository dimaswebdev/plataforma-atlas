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
    return <div className="text-atlas-text-muted">Carregando painel...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-atlas-navy-deep p-6 rounded-lg border border-atlas-navy-aero/30 flex items-center space-x-4">
          <div className="p-3 bg-atlas-gold-main/10 rounded-full">
            <Users className="w-6 h-6 text-atlas-gold-main" />
          </div>
          <div>
            <p className="text-sm text-atlas-text-muted uppercase tracking-wider">Interessados</p>
            <p className="text-2xl font-bold text-white">{stats.totalParticipants}</p>
          </div>
        </div>

        <div className="bg-atlas-navy-deep p-6 rounded-lg border border-atlas-navy-aero/30 flex items-center space-x-4">
          <div className="p-3 bg-green-900/30 rounded-full">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-atlas-text-muted uppercase tracking-wider">Confirmados</p>
            <p className="text-2xl font-bold text-white">{stats.confirmedParticipants}</p>
          </div>
        </div>

        <div className="bg-atlas-navy-deep p-6 rounded-lg border border-atlas-navy-aero/30 flex items-center space-x-4">
          <div className="p-3 bg-blue-900/30 rounded-full">
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-atlas-text-muted uppercase tracking-wider">Arrecadado</p>
            <p className="text-2xl font-bold text-white">{formatCurrencyBRL(stats.income)}</p>
          </div>
        </div>

        <div className="bg-atlas-navy-deep p-6 rounded-lg border border-atlas-navy-aero/30 flex items-center space-x-4">
          <div className="p-3 bg-red-900/30 rounded-full">
            <Wallet className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-sm text-atlas-text-muted uppercase tracking-wider">Despesas</p>
            <p className="text-2xl font-bold text-white">{formatCurrencyBRL(stats.expense)}</p>
          </div>
        </div>
      </div>

      <div className="bg-atlas-navy-deep p-6 rounded-lg border border-atlas-navy-aero/30">
        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Resumo Financeiro Atual</h2>
        <div className="text-4xl font-bold text-atlas-gold-main">
          {formatCurrencyBRL(stats.income - stats.expense)}
        </div>
        <p className="text-sm text-atlas-text-muted mt-2">Saldo em caixa</p>
      </div>
    </div>
  );
}
