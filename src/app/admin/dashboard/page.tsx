"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Shirt,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import {
  AdminCard,
  AdminMetricCard,
  AdminMetricGrid,
  AdminPage,
  AdminPageHeader,
  AdminSection,
} from "@/components/admin";
import { fetchWithAdminAuth } from "@/lib/client-auth";
import { formatCurrencyBRL } from "@/lib/utils";

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

function ActionCard({ title, description, href, icon: Icon }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="group block h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/30"
    >
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-500/10 transition-transform duration-200 group-hover:scale-105 dark:bg-brand-500/15 dark:text-brand-400">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="tailadmin-title text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {description}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400">
            Acessar
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
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

  const balance = stats.income - stats.expense;

  return (
    <AdminPage>
      <AdminPageHeader
        title="Dashboard administrativo"
        icon={Activity}
        description="Painel executivo para acompanhar presença, pendências, financeiro, kits e próximas ações operacionais do Reencontro ATLAS 30 Anos."
      />

      {loading ? (
        <AdminCard className="flex min-h-[45vh] items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-brand-500" aria-hidden="true" />
            <span>Carregando métricas...</span>
          </div>
        </AdminCard>
      ) : (
        <>
          <AdminSection
            title="Resumo geral do evento"
            description="Indicadores prioritários para leitura rápida da situação atual."
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
              <AdminCard className="relative overflow-hidden p-6">
                <div className="flex min-w-0 items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Total geral de pessoas
                    </p>
                    <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
                      <span className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                        {stats.totalPeople}
                      </span>
                      <span className="mb-2 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">
                        pessoas
                      </span>
                    </div>
                    <p className="mt-5 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                      Soma dos militares com presença confirmada mais os convidados informados.
                    </p>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-500/10 dark:bg-brand-500/15 dark:text-brand-400">
                    <UsersRound className="h-7 w-7" aria-hidden="true" />
                  </div>
                </div>
              </AdminCard>

              <AdminMetricGrid columns={2}>
                <AdminMetricCard
                  icon={CheckCircle}
                  label="Confirmados"
                  value={stats.confirmedParticipants}
                  tone="green"
                  helper="Presença confirmada"
                  priority="primary"
                />
                <AdminMetricCard
                  icon={Wallet}
                  label="Saldo atual"
                  value={formatCurrencyBRL(balance)}
                  tone={balance >= 0 ? "green" : "red"}
                  helper="Entradas menos saídas"
                  priority="primary"
                />
              </AdminMetricGrid>
            </div>
          </AdminSection>

          <AdminSection
            title="Alertas e pendências"
            description="Itens que pedem acompanhamento antes da abertura das próximas fases."
          >
            <AdminMetricGrid columns={4}>
              <AdminMetricCard
                icon={Clock}
                label="Aguardam login"
                value={stats.pendingAccountLink}
                tone="gold"
                helper="Cadastros pendentes de vínculo por e-mail e senha"
                priority="operational"
              />
              <AdminMetricCard
                icon={AlertCircle}
                label="Sem e-mail"
                value={stats.participantsWithoutEmail}
                tone="red"
                helper="Registros que exigem conferência antes do login individual"
                priority="operational"
              />
              <AdminMetricCard
                icon={Lock}
                label="Financeiro final"
                value="A definir"
                tone="gray"
                helper="Pagamentos e cobranças dependem de deliberação da comissão"
                priority="operational"
              />
              <AdminMetricCard
                icon={Shirt}
                label="Kits"
                value="Aguardando"
                tone="gold"
                helper="Custos e regras finais ainda não foram definidos"
                priority="operational"
              />
            </AdminMetricGrid>
          </AdminSection>

          <AdminSection
            title="Financeiro"
            description="Valores internos já registrados pela administração. Custos finais do evento continuam aguardando definição."
          >
            <AdminMetricGrid columns={4}>
              <AdminMetricCard
                icon={Wallet}
                label="Saldo atual"
                value={formatCurrencyBRL(balance)}
                tone={balance >= 0 ? "green" : "red"}
                helper="Receitas menos despesas registradas"
                priority="primary"
              />
              <AdminMetricCard
                icon={DollarSign}
                label="Arrecadado"
                value={formatCurrencyBRL(stats.income)}
                tone="blue"
                helper="Entradas lançadas no financeiro"
              />
              <AdminMetricCard
                icon={Wallet}
                label="Despesas"
                value={formatCurrencyBRL(stats.expense)}
                tone="red"
                helper="Saídas lançadas no financeiro"
              />
              <AdminMetricCard
                icon={AlertCircle}
                label="Pendência final"
                value="A definir"
                tone="gold"
                helper="Cota, convidados extras e itens opcionais serão calculados em fase futura"
              />
            </AdminMetricGrid>
          </AdminSection>

          <AdminSection
            title="Participantes"
            description="Consolidação de presença, adesão inicial e volume estimado de pessoas."
          >
            <AdminMetricGrid columns={5}>
              <AdminMetricCard
                icon={Users}
                label="Total de membros"
                value={stats.totalParticipants}
                tone="blue"
              />
              <AdminMetricCard
                icon={CheckCircle}
                label="Confirmados"
                value={stats.confirmedParticipants}
                tone="green"
                helper="Presença confirmada"
              />
              <AdminMetricCard
                icon={UserPlus}
                label="Convidados"
                value={stats.totalGuests}
                tone="gold"
                helper="Dos confirmados"
              />
              <AdminMetricCard
                icon={UsersRound}
                label="Total pessoas"
                value={stats.totalPeople}
                tone="blue"
                helper="Membros + convidados"
              />
              <AdminMetricCard
                icon={ShieldCheck}
                label="Adesões recebidas"
                value={stats.submittedRegistrations}
                tone="gray"
                helper="Formulários/cadastros registrados"
              />
            </AdminMetricGrid>
          </AdminSection>

          <AdminSection
            title="Kits/Souvenirs"
            description="Demanda operacional para planejamento do kit oficial e itens de souvenir."
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)]">
              <AdminMetricGrid columns={3}>
                <AdminMetricCard
                  icon={Shirt}
                  label="Kits oficiais"
                  value={stats.kitInterest}
                  tone="blue"
                  helper="Interesses registrados para kits e souvenirs"
                />
                <AdminMetricCard
                  icon={ShieldCheck}
                  label="Demandas mapeadas"
                  value={stats.kitResponses}
                  tone="green"
                  helper="Participantes com medidas ou resposta de kit"
                />
                <AdminMetricCard
                  icon={Clock}
                  label="Definições"
                  value="Em aberto"
                  tone="gold"
                  helper="Custos, itens e regras aguardam deliberação"
                />
              </AdminMetricGrid>

              <ActionCard
                title="Gestão de kits"
                description="Abrir a visão detalhada de tamanhos, solicitações e interesses registrados."
                href="/admin/souvenirs"
                icon={Shirt}
              />
            </div>
          </AdminSection>

          <AdminSection
            title="Próximas ações operacionais"
            description="Atalhos para as rotinas administrativas mais importantes nesta fase."
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ActionCard
                title="Revisar participantes"
                description="Conferir cadastros, presença, convidados, progresso e ações individuais."
                href="/admin/participantes"
                icon={Users}
              />
              <ActionCard
                title="Acompanhar financeiro"
                description="Ver lançamentos, saldo atual, entradas, saídas e visibilidade pública."
                href="/admin/financeiro"
                icon={DollarSign}
              />
              <ActionCard
                title="Preparar portal"
                description="Acompanhar contas vinculadas, cadastros com e-mail e pendências de acesso."
                href="/minha-participacao"
                icon={KeyRound}
              />
            </div>
          </AdminSection>
        </>
      )}
    </AdminPage>
  );
}
