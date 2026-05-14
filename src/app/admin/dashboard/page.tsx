"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, CheckCircle, Clock, DollarSign, KeyRound, Lock, ShieldCheck, Shirt, UserPlus, Users, UsersRound, Wallet } from "lucide-react";
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

function FlowStep({
  icon: Icon,
  title,
  value,
  description,
  tone = "gold",
}: {
  icon: typeof Activity;
  title: string;
  value: React.ReactNode;
  description: string;
  tone?: "gold" | "green" | "blue" | "red";
}) {
  const toneClass = {
    gold: "border-atlas-gold-main/30 bg-atlas-gold-main/10 text-atlas-gold-main",
    green: "border-green-400/30 bg-green-400/10 text-green-400",
    blue: "border-blue-400/30 bg-blue-400/10 text-blue-400",
    red: "border-red-400/30 bg-red-400/10 text-red-400",
  }[tone];

  return (
    <article className="relative min-w-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneClass}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase text-atlas-text-muted">{title}</p>
          <div className="mt-1 text-2xl font-black leading-none text-white">{value}</div>
          <p className="mt-2 text-xs leading-relaxed text-atlas-text-muted">{description}</p>
        </div>
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    confirmedParticipants: 0,
    totalGuests: 0,
    totalPeople: 0,
    submittedRegistrations: 0,
    linkedAccounts: 0,
    pendingAccountLink: 0,
    participantsWithEmail: 0,
    participantsWithoutEmail: 0,
    committeeVolunteers: 0,
    kitResponses: 0,
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

        <section className="min-w-0">
          <DashboardSectionHeader
            eyebrow="Portal do participante"
            title="Fluxo de entrada e consolidação"
            description="Acompanhamento da esteira: cadastro recebido, vínculo futuro de login, dados consolidados na página individual e bloqueios financeiros preservados."
          />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.5fr)]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FlowStep
                icon={CheckCircle}
                title="Formulários recebidos"
                value={stats.submittedRegistrations}
                description="Participantes que já passaram pelo cadastro passo a passo ou legado."
                tone="green"
              />
              <FlowStep
                icon={KeyRound}
                title="Contas vinculadas"
                value={stats.linkedAccounts}
                description="Participantes já ligados a uma conta de login individual."
                tone="blue"
              />
              <FlowStep
                icon={Clock}
                title="Aguardam login"
                value={stats.pendingAccountLink}
                description="Cadastros prontos para receber vínculo por e-mail e senha."
                tone="gold"
              />
              <FlowStep
                icon={Lock}
                title="Financeiro"
                value="Bloqueado"
                description="Pagamentos, Asaas e cobranças permanecem fora da fase atual."
                tone="red"
              />
            </div>

            <article className="rounded-lg border border-atlas-gold-main/25 bg-atlas-gold-main/10 p-5">
              <div className="mb-4 flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-atlas-gold-main" aria-hidden="true" />
                <div>
                  <h3 className="atlas-card-title text-white">Próximo passo operacional</h3>
                  <p className="mt-2 text-sm leading-relaxed text-atlas-text-muted">
                    Com o login do participante ativo, membros sem cadastro entram pelo acesso individual e seguem para o formulário autenticado. Ao confirmar, o registro já nasce vinculado e aparece aqui, na lista de participantes e na página individual.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] font-black uppercase text-atlas-text-muted">Com e-mail</p>
                  <p className="mt-1 text-xl font-black text-white">{stats.participantsWithEmail}</p>
                </div>
                <div className="rounded border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] font-black uppercase text-atlas-text-muted">Sem e-mail</p>
                  <p className="mt-1 text-xl font-black text-white">{stats.participantsWithoutEmail}</p>
                </div>
                <div className="rounded border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] font-black uppercase text-atlas-text-muted">Voluntários</p>
                  <p className="mt-1 text-xl font-black text-white">{stats.committeeVolunteers}</p>
                </div>
                <div className="rounded border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] font-black uppercase text-atlas-text-muted">Kits mapeados</p>
                  <p className="mt-1 text-xl font-black text-white">{stats.kitResponses}</p>
                </div>
              </div>

              <Link
                href="/minha-participacao"
                className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase text-atlas-gold-main transition-colors hover:text-atlas-gold-dark"
              >
                Ver página individual
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
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
