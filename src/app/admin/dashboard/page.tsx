"use client";

import { useEffect, useState } from "react";
import { formatCurrencyBRL } from "@/lib/utils";
import { Users, DollarSign, Wallet, Activity, Shirt } from "lucide-react";
import { fetchWithAdminAuth } from "@/lib/client-auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";

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
      <div className="flex h-[50vh] items-center justify-center">
        <div className="atlas-loading-label animate-pulse">Carregando métricas...</div>
      </div>
    );
  }

  return (
    <div className="atlas-admin-page">
      <AdminPageHeader
        title="Visão geral"
        icon={Activity}
        description="Resumo rápido dos indicadores mais importantes para acompanhar participação, interesse em kits e situação financeira do evento."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard
          icon={Users}
          label="Interessados"
          value={stats.totalParticipants}
          tone="gold"
        />
        <AdminStatCard
          icon={Activity}
          label="Confirmados"
          value={stats.confirmedParticipants}
          tone="green"
        />
        <AdminStatCard
          icon={Shirt}
          label="Kits oficiais"
          value={stats.kitInterest}
          tone="blue"
        />
        <AdminStatCard
          icon={DollarSign}
          label="Arrecadado"
          value={formatCurrencyBRL(stats.income)}
          tone="blue"
        />
        <AdminStatCard
          icon={Wallet}
          label="Despesas"
          value={formatCurrencyBRL(stats.expense)}
          tone="red"
        />
      </div>

      <section className="atlas-admin-card border-atlas-gold-main/25 bg-gradient-to-br from-atlas-gold-main/10 to-white/[0.03] p-5 sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="atlas-stat-card-label text-atlas-gold-main">Resumo financeiro atual</p>
            <div className="atlas-feature-value mt-2 break-words bg-gradient-to-r from-atlas-gold-main to-white bg-clip-text text-transparent">
              {formatCurrencyBRL(stats.income - stats.expense)}
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-atlas-text-muted">
              Saldo em caixa consolidado disponível para decisões da comissão organizadora.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-atlas-text-muted">
            Receitas menos despesas registradas
          </div>
        </div>
      </section>
    </div>
  );
}
