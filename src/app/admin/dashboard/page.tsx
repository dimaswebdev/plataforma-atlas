"use client";

import { useEffect, useState } from "react";
import { Activity, DollarSign, Shirt, UserPlus, Users, UsersRound, Wallet } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { fetchWithAdminAuth } from "@/lib/client-auth";
import { formatCurrencyBRL } from "@/lib/utils";

function DashboardSectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex min-w-0 flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="atlas-stat-card-label text-atlas-gold-main">{eyebrow}</p>
        <h2 className="atlas-section-title">{title}</h2>
      </div>
      <p className="max-w-xl text-sm leading-relaxed text-atlas-text-muted sm:text-right">
        {description}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    confirmedParticipants: 0,
    totalGuests: 0,
    totalPeople: 0,
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

  const balance = stats.income - stats.expense;

  return (
    <div className="atlas-admin-page">
      <AdminPageHeader
        title="Visão geral"
        icon={Activity}
        description="Resumo rápido dos indicadores mais importantes para acompanhar participação, interesse em kits e situação financeira do evento."
      />

      <div className="space-y-8">
        <section className="min-w-0">
          <DashboardSectionHeader
            eyebrow="Participação no evento"
            title="Demanda principal do reencontro"
            description="Indicadores usados para decisões de logística, alimentação, espaço e organização geral."
          />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.82fr)]">
            <article className="relative min-h-full overflow-hidden rounded-lg border border-atlas-gold-main/35 bg-gradient-to-br from-atlas-gold-main/20 via-white/[0.06] to-white/[0.03] p-5 shadow-[0_24px_70px_rgb(0_0_0/0.28)] sm:p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atlas-gold-main/80 to-transparent" />
              <div className="flex min-w-0 items-start justify-between gap-5">
                <div className="min-w-0">
                  <p className="atlas-stat-card-label text-atlas-gold-main">
                    Total geral de pessoas
                  </p>
                  <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
                    <span className="text-5xl font-black leading-none text-white sm:text-6xl">
                      {stats.totalPeople}
                    </span>
                    <span className="mb-1 text-sm font-bold uppercase text-atlas-text-muted">
                      pessoas
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-atlas-gold-main/35 bg-atlas-gold-main/10 text-atlas-gold-main">
                  <UsersRound className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-atlas-text-muted">
                Soma dos militares com presença confirmada mais os convidados informados por eles.
              </p>
            </article>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <AdminStatCard
                icon={Activity}
                label="Militares confirmados"
                value={stats.confirmedParticipants}
                tone="green"
                helper="Cadastros com presença confirmada"
              />
              <AdminStatCard
                icon={UserPlus}
                label="Total de convidados"
                value={stats.totalGuests}
                tone="blue"
                helper="Somente convidados de militares confirmados"
              />
              <AdminStatCard
                icon={Users}
                label="Interessados"
                value={stats.totalParticipants}
                tone="gold"
                helper="Todos os cadastros registrados"
              />
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
          <section className="min-w-0">
            <DashboardSectionHeader
              eyebrow="Financeiro"
              title="Resumo de caixa"
              description="Saldo, arrecadação e despesas permanecem conectados para leitura rápida da situação financeira."
            />

            <div className="grid gap-4 md:grid-cols-3">
              <article className="relative overflow-hidden rounded-lg border border-atlas-gold-main/30 bg-gradient-to-br from-atlas-gold-main/10 via-white/[0.055] to-white/[0.025] p-5">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-atlas-gold-main/30 bg-atlas-gold-main/10 text-atlas-gold-main">
                    <Wallet className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="atlas-stat-card-label text-atlas-gold-main">Saldo atual</p>
                    <div
                      className={`atlas-metric-value break-words ${
                        balance >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatCurrencyBRL(balance)}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-atlas-text-muted">
                      Receitas menos despesas registradas
                    </p>
                  </div>
                </div>
              </article>

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
          </section>

          <section className="min-w-0">
            <DashboardSectionHeader
              eyebrow="Kits/Souvenirs"
              title="Demanda operacional"
              description="Indicadores de itens ficam separados dos números de presença."
            />

            <AdminStatCard
              icon={Shirt}
              label="Kits oficiais"
              value={stats.kitInterest}
              tone="blue"
              helper="Interesses registrados para kits e souvenirs"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
