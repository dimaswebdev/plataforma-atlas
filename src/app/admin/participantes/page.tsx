"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Eye,
  HelpCircle,
  Loader2,
  Shirt,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";
import {
  AdminActionIcon,
  AdminActionMenu,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminConfirmDialog,
  AdminDataTable,
  AdminMetricCard,
  AdminMetricGrid,
  AdminPage,
  AdminPageHeader,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin";
import { ParticipantEditForm } from "@/components/admin/ParticipantEditForm";
import type { Participant } from "@/types/participant";
import { calculateAge, formatCurrencyBRL } from "@/lib/utils";
import { fetchWithAdminAuth } from "@/lib/client-auth";
import { calculateParticipantMetrics, getConfirmedGuestCount } from "@/lib/participant-metrics";

const ADESAO_TITULAR = 0;
const ADESAO_CONVIDADO = 0;
const FINANCEIRO_DEFINIDO = ADESAO_TITULAR > 0 || ADESAO_CONVIDADO > 0;

function getPresenceMeta(status: Participant["willAttend"]) {
  switch (status) {
    case "yes":
      return {
        label: "Confirmado",
        icon: <CheckCircle className="h-4 w-4" aria-hidden="true" />,
        color: "success" as const,
      };
    case "no":
      return {
        label: "Não irá",
        icon: <XCircle className="h-4 w-4" aria-hidden="true" />,
        color: "error" as const,
      };
    default:
      return {
        label: "Talvez",
        icon: <HelpCircle className="h-4 w-4" aria-hidden="true" />,
        color: "warning" as const,
      };
  }
}

function getKitMeta(participant: Participant) {
  switch (participant.officialKit?.interest) {
    case "yes":
      return { label: "Solicitado", color: "primary" as const };
    case "maybe":
      return { label: "Talvez", color: "warning" as const };
    case "no":
      return { label: "Sem interesse", color: "light" as const };
    default:
      return { label: "Pendente", color: "dark" as const };
  }
}

type StatusIconColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

interface IconStatusBadgeProps {
  label: string;
  color: StatusIconColor;
  icon: React.ReactNode;
}

function IconStatusBadge({ label, color, icon }: IconStatusBadgeProps) {
  return (
    <AdminBadge
      color={color}
      size="sm"
      title={label}
      aria-label={label}
      className="h-8 w-8 rounded-lg p-0"
    >
      {icon}
    </AdminBadge>
  );
}

function DefinitionLabel({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <AdminBadge
      color="warning"
      size={size}
      title="Aguardando definição da comissão"
      className="whitespace-nowrap"
    >
      A definir
    </AdminBadge>
  );
}

function FinancialAmount({ value, pendingSize = "sm" }: { value: number; pendingSize?: "sm" | "md" }) {
  return FINANCEIRO_DEFINIDO ? formatCurrencyBRL(value) : <DefinitionLabel size={pendingSize} />;
}

function LoadingMetricValue({ label = "Carregando métricas" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
      <Loader2 className="h-4 w-4 animate-spin text-brand-500" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function getFinancialSummary(participant: Participant) {
  const totalDue = ADESAO_TITULAR + (participant.guestsCount || 0) * ADESAO_CONVIDADO;
  const totalPaid = participant.totalPaid || 0;
  const remaining = Math.max(0, totalDue - totalPaid);
  const progressPct = FINANCEIRO_DEFINIDO && totalDue > 0
    ? Math.min(100, Math.round((totalPaid / totalDue) * 100))
    : 0;

  if (!FINANCEIRO_DEFINIDO) {
    return {
      totalDue,
      totalPaid,
      remaining,
      progressPct,
      label: "Aguardando",
      color: "warning" as const,
      progressLabel: "A definir",
    };
  }

  if (progressPct >= 100) {
    return {
      totalDue,
      totalPaid,
      remaining,
      progressPct,
      label: "Pago",
      color: "success" as const,
      progressLabel: `${progressPct}%`,
    };
  }

  if (progressPct > 0) {
    return {
      totalDue,
      totalPaid,
      remaining,
      progressPct,
      label: "Parcial",
      color: "warning" as const,
      progressLabel: `${progressPct}%`,
    };
  }

  return {
    totalDue,
    totalPaid,
    remaining,
    progressPct,
    label: "Pendente",
    color: "error" as const,
    progressLabel: `${progressPct}%`,
  };
}

interface ParticipantActionsProps {
  participant: Participant;
  onEdit: (participant: Participant) => void;
  onDelete: (participant: Participant) => void;
}

function ParticipantActions({ participant, onEdit, onDelete }: ParticipantActionsProps) {
  const disabled = !participant.id;

  return (
    <AdminActionMenu>
      {disabled ? (
        <AdminActionIcon label="Visualizar página individual" disabled>
          <Eye className="h-4 w-4" aria-hidden="true" />
        </AdminActionIcon>
      ) : (
        <AdminActionIcon
          href={`/admin/participantes/${participant.id}`}
          label={`Visualizar página individual de ${participant.name}`}
          tone="brand"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </AdminActionIcon>
      )}
      <AdminActionIcon
        onClick={() => onEdit(participant)}
        label={`Editar dados de ${participant.name}`}
        tone="brand"
      >
        <Edit className="h-4 w-4" aria-hidden="true" />
      </AdminActionIcon>
      <AdminActionIcon
        onClick={() => onDelete(participant)}
        label={`Excluir participante ${participant.name}`}
        tone="danger"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </AdminActionIcon>
    </AdminActionMenu>
  );
}

export default function AdminParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Participant | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function load() {
    setLoading(true);
    setLoadError("");

    try {
      const res = await fetchWithAdminAuth("/api/data?collection=participants");
      if (!res.ok) throw new Error("Failed to fetch participants");
      const data = await res.json();
      setParticipants(data);
    } catch (err) {
      console.error("Error loading participants", err);
      setParticipants([]);
      setLoadError("Não foi possível carregar a lista de membros agora.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const participantMetrics = calculateParticipantMetrics(participants);

  const financialTotals = useMemo(() => {
    return participants.reduce(
      (acc, participant) => {
        const summary = getFinancialSummary(participant);
        return {
          paid: acc.paid + summary.totalPaid,
          remaining: acc.remaining + summary.remaining,
        };
      },
      { paid: 0, remaining: 0 },
    );
  }, [participants]);

  const requestDelete = (participant: Participant) => {
    setDeleteError("");
    setDeleteTarget(participant);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetchWithAdminAuth(`/api/data?collection=participants&id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setParticipants((current) => current.filter((participant) => participant.id !== deleteTarget.id));
      setDeleteTarget(null);
      await load();
    } catch {
      setDeleteError("Não foi possível excluir este participante agora. Verifique sua sessão administrativa e tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Lista de membros"
        description="Consulta operacional dos cadastros, confirmação de presença, convidados, kit oficial e situação financeira inicial."
        actions={
          <AdminButton
            variant="primary"
            onClick={() => void load()}
            disabled={loading}
            loading={loading}
            className="text-white"
          >
            Atualizar lista
          </AdminButton>
        }
      />

      <AdminMetricGrid columns={6}>
        <AdminMetricCard
          icon={Users}
          label="Total de membros"
          value={loading ? <LoadingMetricValue /> : participantMetrics.totalParticipants}
          tone="blue"
        />
        <AdminMetricCard
          icon={UserCheck}
          label="Confirmados"
          value={loading ? <LoadingMetricValue /> : participantMetrics.confirmedParticipants}
          helper="Presença confirmada"
          tone="green"
        />
        <AdminMetricCard
          icon={Users}
          label="Convidados"
          value={loading ? <LoadingMetricValue /> : participantMetrics.totalGuests}
          helper="Dos confirmados"
          tone="gold"
        />
        <AdminMetricCard
          icon={TrendingUp}
          label="Total pessoas"
          value={loading ? <LoadingMetricValue /> : participantMetrics.totalPeople}
          helper="Membros + convidados"
          tone="blue"
        />
        <AdminMetricCard
          icon={WalletCards}
          label="Arrecadado"
          value={loading ? <LoadingMetricValue /> : formatCurrencyBRL(financialTotals.paid)}
          tone="green"
        />
        <AdminMetricCard
          icon={AlertCircle}
          label="Falta"
          value={loading ? <LoadingMetricValue /> : <FinancialAmount value={financialTotals.remaining} pendingSize="md" />}
          helper={FINANCEIRO_DEFINIDO ? undefined : "Aguardando comissão"}
          tone={FINANCEIRO_DEFINIDO ? "red" : "gold"}
        />
      </AdminMetricGrid>

      {loadError ? (
        <AdminCard className="mb-6 border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-500">
          {loadError}
        </AdminCard>
      ) : null}

      <div className="space-y-4 lg:hidden">
        {loading ? (
          <AdminCard className="flex min-h-40 items-center justify-center p-6 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span>Carregando membros...</span>
            </div>
          </AdminCard>
        ) : participants.length === 0 ? (
          <AdminCard className="p-6 text-center text-gray-500 dark:text-gray-400">
            Nenhum militar registrado.
          </AdminCard>
        ) : (
          participants.map((participant) => {
            const age = calculateAge(participant.birthDate || "");
            const confirmedGuests = getConfirmedGuestCount(participant);
            const financial = getFinancialSummary(participant);
            const presence = getPresenceMeta(participant.willAttend);
            const kit = getKitMeta(participant);

            return (
              <AdminCard key={participant.id || participant.name} className="p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-theme-md dark:hover:border-brand-500/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-gray-900 dark:text-white">{participant.name}</h2>
                    <p className="mt-1 truncate text-sm font-medium text-gray-500 dark:text-gray-400">{participant.nickname || "Sem nome de guerra"}</p>
                  </div>
                  <AdminBadge color={presence.color} startIcon={presence.icon}>
                    {presence.label}
                  </AdminBadge>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03]">
                    <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Contato</p>
                    <p className="mt-1 truncate font-medium text-gray-800 dark:text-white/90">{participant.phone || "-"}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03]">
                    <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Cidade/UF</p>
                    <p className="mt-1 truncate font-medium text-gray-800 dark:text-white/90">
                      {participant.city || "-"} / {participant.state || "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03]">
                    <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Idade</p>
                    <p className="mt-1 font-medium text-gray-800 dark:text-white/90">{age !== null ? `${age} anos` : "-"}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03]">
                    <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Convidados</p>
                    <p className="mt-1 font-medium text-gray-800 dark:text-white/90">{confirmedGuests}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <AdminBadge color={financial.color}>{financial.label}</AdminBadge>
                    <AdminBadge color={kit.color} startIcon={<Shirt className="h-3.5 w-3.5" aria-hidden="true" />}>
                      {kit.label}
                    </AdminBadge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Total</p>
                      <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                        <FinancialAmount value={financial.totalDue} />
                      </p>
                    </div>
                    <div>
                      <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Pago</p>
                      <p className="mt-1 font-semibold text-success-600 dark:text-success-500">{formatCurrencyBRL(financial.totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Resta</p>
                      <p className="mt-1 font-semibold text-error-600 dark:text-error-500">
                        <FinancialAmount value={financial.remaining} />
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      <span>Progresso</span>
                      <span>{financial.progressLabel}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${financial.progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <ParticipantActions
                    participant={participant}
                    onEdit={setEditingParticipant}
                    onDelete={requestDelete}
                  />
                </div>
              </AdminCard>
            );
          })
        )}
      </div>

      <AdminDataTable
        sectionClassName="hidden lg:block"
        title="Tabela de membros"
        description="Visão consolidada para acompanhamento administrativo."
        colSpan={14}
        loading={loading}
        loadingLabel="Carregando membros..."
        empty={participants.length === 0}
        emptyLabel="Nenhum militar registrado."
        footerConfig={{
          displayedCount: participants.length,
          totalCount: participants.length,
        }}
        minWidth={1180}
        tableClassName="table-fixed"
        colgroup={
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[10.5%]" />
            <col className="w-[4%]" />
            <col className="w-[9.5%]" />
            <col className="w-[9%]" />
            <col className="w-[3.5%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[6.5%]" />
            <col className="w-[6.5%]" />
            <col className="w-[6.5%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
          </colgroup>
        }
        columns={
          <>
            <AdminTableHead className="px-3 py-3">Nome completo</AdminTableHead>
            <AdminTableHead className="px-3 py-3">Nome de guerra</AdminTableHead>
            <AdminTableHead className="px-2 py-3 text-center">Idade</AdminTableHead>
            <AdminTableHead className="px-3 py-3">Contato</AdminTableHead>
            <AdminTableHead className="px-3 py-3">Cidade</AdminTableHead>
            <AdminTableHead className="px-2 py-3 text-center">UF</AdminTableHead>
            <AdminTableHead className="px-2 py-3 text-center" title="Presença">Pres.</AdminTableHead>
            <AdminTableHead className="px-2 py-3 text-center">Kit</AdminTableHead>
            <AdminTableHead className="px-2 py-3 text-center" title="Convidados">Conv.</AdminTableHead>
            <AdminTableHead className="px-3 py-3 text-right">Total</AdminTableHead>
            <AdminTableHead className="px-3 py-3 text-right">Pago</AdminTableHead>
            <AdminTableHead className="px-3 py-3 text-right">Restante</AdminTableHead>
            <AdminTableHead className="px-3 py-3 text-right">Progresso</AdminTableHead>
            <AdminTableHead className="px-3 py-3 text-right">Ações</AdminTableHead>
          </>
        }
      >
        {participants.map((participant) => {
          const age = calculateAge(participant.birthDate || "");
          const confirmedGuests = getConfirmedGuestCount(participant);
          const financial = getFinancialSummary(participant);
          const presence = getPresenceMeta(participant.willAttend);
          const kit = getKitMeta(participant);
          const tableProgressPct = FINANCEIRO_DEFINIDO ? financial.progressPct : 100;
          const tableProgressLabel = `${tableProgressPct}%`;

          return (
            <AdminTableRow
              key={participant.id || participant.name}
              className="border-b border-gray-200 hover:!bg-brand-25 last:border-b-0 dark:border-gray-800 dark:hover:!bg-white/[0.04]"
            >
              <AdminTableCell className="px-3 py-3">
                <div className="truncate font-medium text-gray-900 dark:text-white" title={participant.name}>
                  {participant.name}
                </div>
              </AdminTableCell>
              <AdminTableCell className="px-3 py-3">
                <span className="block truncate font-medium text-gray-700 dark:text-gray-300" title={participant.nickname || "Sem nome de guerra"}>
                  {participant.nickname || "-"}
                </span>
              </AdminTableCell>
              <AdminTableCell className="px-2 py-3 text-center" title={age !== null ? `${age} anos` : undefined}>
                {age !== null ? age : "-"}
              </AdminTableCell>
              <AdminTableCell className="whitespace-nowrap px-3 py-3">{participant.phone || "-"}</AdminTableCell>
              <AdminTableCell className="truncate px-3 py-3" title={participant.city || undefined}>{participant.city || "-"}</AdminTableCell>
              <AdminTableCell className="px-2 py-3 text-center font-medium uppercase">{participant.state || "-"}</AdminTableCell>
              <AdminTableCell className="px-2 py-3 text-center">
                <IconStatusBadge color={presence.color} label={presence.label} icon={presence.icon} />
              </AdminTableCell>
              <AdminTableCell className="px-2 py-3 text-center">
                <IconStatusBadge
                  color={kit.color}
                  label={kit.label}
                  icon={<Shirt className="h-3.5 w-3.5" aria-hidden="true" />}
                />
              </AdminTableCell>
              <AdminTableCell className="px-2 py-3 text-center font-semibold text-gray-900 dark:text-white">{confirmedGuests}</AdminTableCell>
              <AdminTableCell className="px-3 py-3 text-right font-medium text-gray-900 dark:text-white">
                {formatCurrencyBRL(financial.totalDue)}
              </AdminTableCell>
              <AdminTableCell className="px-3 py-3 text-right font-medium text-success-600 dark:text-success-500">
                {formatCurrencyBRL(financial.totalPaid)}
              </AdminTableCell>
              <AdminTableCell
                className="px-3 py-3 text-right font-medium text-error-600 dark:text-error-500"
                title={`Financeiro: ${financial.label}. Progresso: ${tableProgressLabel}`}
              >
                {formatCurrencyBRL(financial.remaining)}
              </AdminTableCell>
              <AdminTableCell className="px-3 py-3 text-right">
                <div className="ml-auto min-w-[76px] max-w-[110px]">
                  <div className="mb-1 text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    {tableProgressLabel}
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                    aria-label={`Progresso ${tableProgressLabel}`}
                  >
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-500"
                      style={{ width: `${tableProgressPct}%` }}
                    />
                  </div>
                </div>
              </AdminTableCell>
              <AdminTableCell className="px-3 py-3 text-right">
                <ParticipantActions
                  participant={participant}
                  onEdit={setEditingParticipant}
                  onDelete={requestDelete}
                />
              </AdminTableCell>
            </AdminTableRow>
          );
        })}
      </AdminDataTable>

      {editingParticipant ? (
        <ParticipantEditForm
          participant={editingParticipant}
          onClose={() => setEditingParticipant(null)}
          onSuccess={load}
        />
      ) : null}

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir participante?"
        description={`Deseja realmente excluir ${deleteTarget?.name || "este participante"}? Esta ação remove o cadastro da lista administrativa e não deve ser usada para correções simples.`}
        confirmLabel="Excluir participante"
        cancelLabel="Cancelar"
        destructive
        loading={deleting}
        error={deleteError}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
        onConfirm={confirmDelete}
      />
    </AdminPage>
  );
}


