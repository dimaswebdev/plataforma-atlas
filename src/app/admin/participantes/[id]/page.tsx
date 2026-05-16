"use client";

import { useCallback, useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  AtSign,
  Briefcase,
  CheckCircle,
  CreditCard,
  DollarSign,
  Edit,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Ruler,
  ShieldCheck,
  Shirt,
  Trash2,
  UserRound,
} from "lucide-react";
import { Participant } from "@/types/participant";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppCardContent,
  AppCardHeader,
  AppCardTitle,
  AppPage,
  AppPageHeader,
  AppSection,
} from "@/components/ui";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { ParticipantEditForm } from "@/components/admin/ParticipantEditForm";
import { fetchWithAdminAuth } from "@/lib/client-auth";
import { getConfirmedGuestCount, getParticipantPeopleCount } from "@/lib/participant-metrics";
import { calculateAge, formatCurrencyBRL, formatDateBR } from "@/lib/utils";

type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light";

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "Não informado";
  return value;
}

function formatDateValue(value?: string) {
  return value ? formatDateBR(value) : "Não informado";
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | number | null;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-white/90">
            {formatValue(value)}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <AppCard elevated>
      <AppCardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <AppCardTitle>{title}</AppCardTitle>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              {description}
            </p>
          ) : null}
        </div>
      </AppCardHeader>
      <AppCardContent>{children}</AppCardContent>
    </AppCard>
  );
}

function statusBadge(label: string, color: BadgeColor, icon?: React.ReactNode) {
  return (
    <AppBadge color={color} size="sm" startIcon={icon}>
      {label}
    </AppBadge>
  );
}

export default function ParticipantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const participantId = Array.isArray(params.id) ? params.id[0] : params.id;

  const loadParticipant = useCallback(async () => {
    if (!participantId) return;
    try {
      const res = await fetchWithAdminAuth(`/api/data?collection=participants&id=${participantId}`);
      const data = await res.json();
      if (data) {
        setParticipant(data as Participant);
      } else {
        router.push("/admin/participantes");
      }
    } catch (error) {
      console.error("Failed to load participant", error);
    } finally {
      setLoading(false);
    }
  }, [participantId, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadParticipant();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadParticipant]);

  const confirmDelete = async () => {
    if (!participant?.id) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetchWithAdminAuth(`/api/data?collection=participants&id=${participant.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/admin/participantes");
    } catch {
      setDeleteError("Não foi possível excluir este participante agora. Verifique sua sessão administrativa e tente novamente.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AppPage className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Carregando perfil do participante...</p>
        </div>
      </AppPage>
    );
  }

  if (!participant) return null;

  const age = calculateAge(participant.birthDate || "");
  const confirmedGuestCount = getConfirmedGuestCount(participant);
  const participantPeopleCount = getParticipantPeopleCount(participant);
  const fullAddress = [
    participant.address,
    participant.city,
    participant.state,
    participant.zipCode ? `CEP ${participant.zipCode}` : "",
    participant.country,
  ].filter(Boolean).join(" - ");
  const ADESAO_TITULAR = 0;
  const ADESAO_CONVIDADO = 0;
  const totalPrevisto = ADESAO_TITULAR + (participant.guestsCount || 0) * ADESAO_CONVIDADO;
  const totalPago = participant.totalPaid || 0;
  const restante = Math.max(totalPrevisto - totalPago, 0);
  const progressPct = totalPrevisto > 0 ? Math.min(100, Math.round((totalPago / totalPrevisto) * 100)) : 100;

  const getPaymentBadge = () => {
    if (progressPct >= 100) return statusBadge("Adesão paga", "success");
    if (progressPct > 0) return statusBadge("Adesão parcial", "warning");
    return statusBadge("Pendente", "error");
  };

  const getPresenceBadge = () => {
    switch(participant.willAttend) {
      case "yes": return statusBadge("Presença confirmada", "success", <CheckCircle className="h-3 w-3" />);
      case "no": return statusBadge("Ausente", "light");
      default: return statusBadge("A confirmar", "warning");
    }
  };

  const kit = participant.officialKit;
  const hasKitInterest = kit?.interest === "yes" || kit?.interest === "maybe";

  return (
    <AppPage className="space-y-6">
      <AppPageHeader
        title="Perfil do participante"
        description="Ficha administrativa individual com dados cadastrais, participação, kit e situação financeira inicial."
        icon={UserRound}
        eyebrow={
          <>
            <span>Painel</span>
            <span className="text-gray-300 dark:text-gray-700">/</span>
            <span>Participantes</span>
            <span className="text-gray-300 dark:text-gray-700">/</span>
            <span>Perfil</span>
          </>
        }
        actions={
          <>
            <AppButton
              type="button"
              variant="outline"
              startIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.push("/admin/participantes")}
            >
              Voltar para lista
            </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              startIcon={<Edit className="h-4 w-4" />}
              onClick={() => setEditingParticipant(participant)}
            >
              Editar participante
            </AppButton>
            <AppButton
              type="button"
              variant="primary"
              startIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => {
                setDeleteError("");
                setDeleteOpen(true);
              }}
            >
              Excluir
            </AppButton>
          </>
        }
      />

      <AppCard elevated className="overflow-hidden">
        <div className="border-b border-gray-100 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500">
                <Image
                  src="/logo-fab.svg"
                  alt="Logo FAB"
                  width={30}
                  height={30}
                  className="brightness-0 invert"
                />
              </span>
              <div className="min-w-0">
                <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Registro Oficial - Turma ATLAS 30 Anos
                </p>
                <h2 className="mt-1 break-words text-xl font-semibold text-gray-900 dark:text-white/90">
                  {participant.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Força Aérea Brasileira | 1997-2027
                </p>
              </div>
            </div>
            <div className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900 lg:text-right">
              <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">ID do registro</p>
              <p className="mt-1 break-all font-mono text-sm text-gray-700 dark:text-gray-300">{participant.id}</p>
            </div>
          </div>
        </div>

        <AppCardContent className="space-y-6 border-t-0">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex flex-col items-center lg:w-56">
              <div className="flex h-36 w-36 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                <span className="text-4xl font-semibold text-brand-600 dark:text-brand-400">
                  {getInitials(participant.name)}
                </span>
              </div>
              <p className="mt-3 text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">ATLAS</p>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h3 className="break-words text-3xl font-semibold tracking-tight text-gray-900 dark:text-white/90">
                    {participant.name}
                  </h3>
                  {participant.nickname ? (
                    <p className="mt-2 text-lg font-medium text-brand-600 dark:text-brand-400">
                      &quot;{participant.nickname}&quot;
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {getPresenceBadge()}
                  {getPaymentBadge()}
                  {participant.wantsToHelpCommittee ? statusBadge("Voluntário", "info", <CheckCircle className="h-3 w-3" />) : null}
                  {kit?.interest === "yes" ? statusBadge("Kit solicitado", "primary", <Shirt className="h-3 w-3" />) : null}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoItem label="Localidade" value={`${participant.state || "-"} / ${participant.city || "-"}`} icon={MapPin} />
                <InfoItem label="Convidados" value={`${confirmedGuestCount} adicionais`} icon={UserRound} />
                <InfoItem label="Total de pessoas" value={participantPeopleCount} icon={CheckCircle} />
                <InfoItem label="Idade" value={age !== null ? `${age} anos` : "Não informado"} icon={FileText} />
              </div>
            </div>
          </div>
        </AppCardContent>
      </AppCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <SectionCard
            title="Informações pessoais"
            description="Identificação, atuação atual e dados cadastrais."
            icon={Briefcase}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem label="Profissão atual / patente" value={participant.currentFunction} />
              <InfoItem label="Data de nascimento" value={formatDateValue(participant.birthDate)} />
              <InfoItem label="Status do cadastro" value={participant.registrationStatus || "Não informado"} />
              <InfoItem label="Vínculo de login" value={participant.authUid ? "Vinculado" : "Aguardando vínculo"} />
            </div>
          </SectionCard>

          <SectionCard
            title="Contato"
            description="Canais privados para comunicação com o participante."
            icon={Phone}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem label="WhatsApp / telefone" value={participant.phone} icon={Phone} />
              <InfoItem label="E-mail" value={participant.email} icon={Mail} />
              <InfoItem label="Instagram" value={participant.instagram} icon={AtSign} />
              <InfoItem label="LinkedIn" value={participant.linkedin} icon={Globe} />
            </div>
          </SectionCard>

          <SectionCard
            title="Endereço e localização"
            description="Informações de cidade, UF e endereço atual."
            icon={MapPin}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InfoItem label="Endereço completo" value={fullAddress || "Não informado"} />
              </div>
              <InfoItem label="Cidade / UF" value={`${participant.city || "-"} - ${participant.state || "-"}`} />
              <InfoItem label="CEP" value={participant.zipCode} />
              <InfoItem label="País" value={participant.country} />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Participação no evento"
            description="Presença inicial, convidados e interesse em contribuir com a comissão."
            icon={CheckCircle}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem label="Presença" value={participant.willAttend === "yes" ? "Confirmada" : participant.willAttend === "no" ? "Não irá" : "A confirmar"} />
              <InfoItem label="Convidados cadastrados" value={participant.guestsCount || 0} />
              <InfoItem label="Convidados confirmados" value={confirmedGuestCount} />
              <InfoItem label="Comissão" value={participant.wantsToHelpCommittee ? "Tem interesse" : "Sem interesse informado"} />
              <InfoItem label="Hotel" value={participant.needsHotelInfo ? "Solicitou informações" : "Sem solicitação"} />
              <InfoItem label="Transporte" value={participant.needsTransportInfo ? "Solicitou informações" : "Sem solicitação"} />
            </div>
          </SectionCard>

          <SectionCard
            title="Kit / souvenir"
            description="Interesse, medidas e personalização do kit oficial."
            icon={Shirt}
          >
            {hasKitInterest ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <InfoItem label="Camiseta" value={kit?.shirtSize || "-"} />
                  <InfoItem label="Jaqueta" value={kit?.jacketSize || "-"} />
                  <InfoItem label="Calça" value={kit?.pantsSize || "-"} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem label="Altura" value={kit?.heightCm ? `${kit.heightCm} cm` : "Não informado"} icon={Ruler} />
                  <InfoItem label="Peso aprox." value={kit?.approximateWeightKg ? `${kit.approximateWeightKg} kg` : "Não informado"} />
                  <InfoItem label="Tamanho especial" value={kit?.needsSpecialSize ? "Sim" : "Não"} />
                  <InfoItem label="Personalização" value={kit?.wantsNameCustomization ? "Sim" : "Não"} />
                </div>
                {kit?.customizationName ? (
                  <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-500/20 dark:bg-brand-500/15">
                    <p className="text-theme-xs font-medium uppercase text-brand-700 dark:text-brand-300">Nome para personalização</p>
                    <p className="mt-1 break-words text-lg font-semibold text-brand-800 dark:text-brand-200">
                      {kit.customizationName}
                    </p>
                  </div>
                ) : null}
                {kit?.notes ? <InfoItem label="Observações do kit" value={kit.notes} /> : null}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                Sem interesse no kit oficial ({kit?.interest === "no" ? "recusado" : "não preenchido"}).
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Situação financeira"
            description="Resumo individual preservado para controle administrativo."
            icon={DollarSign}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InfoItem label="Total previsto" value={formatCurrencyBRL(totalPrevisto)} icon={CreditCard} />
                <InfoItem label="Total pago" value={formatCurrencyBRL(totalPago)} icon={DollarSign} />
                <InfoItem label="Pendente" value={formatCurrencyBRL(restante)} />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progresso financeiro</span>
                  <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{progressPct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Termos e autorizações"
          description="Registro de aceite dos termos usados pelo fluxo de cadastro."
          icon={ShieldCheck}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { label: "Adesão", status: participant.termsAcceptance?.adhesionTermAccepted, version: participant.termsAcceptance?.adhesionTermVersion },
              { label: "Privacidade", status: participant.termsAcceptance?.privacyPolicyAccepted, version: participant.termsAcceptance?.privacyPolicyVersion },
              { label: "Uso da plataforma", status: participant.termsAcceptance?.platformTermsAccepted, version: participant.termsAcceptance?.platformTermsVersion },
              { label: "Financeiro", status: participant.termsAcceptance?.financialTermsAccepted, version: participant.termsAcceptance?.financialTermsVersion },
              { label: "Uso de imagem", status: participant.termsAcceptance?.imageUseAuthorized, version: participant.termsAcceptance?.imageUseTermVersion },
              { label: "Souvenirs", status: participant.termsAcceptance?.souvenirsInfoAccepted, version: participant.termsAcceptance?.souvenirsTermVersion },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">{item.label}</p>
                  <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">v{item.version || "000"}</p>
                </div>
                <AppBadge color={item.status ? "success" : "error"} size="sm">
                  {item.status ? "OK" : "N/A"}
                </AppBadge>
              </div>
            ))}
            <div className="sm:col-span-2">
              <InfoItem
                label="Aceite registrado em"
                value={participant.termsAcceptance?.acceptedAt ? new Date(participant.termsAcceptance.acceptedAt as string | number | Date).toLocaleString("pt-BR") : "Sem registro"}
              />
            </div>
          </div>
        </SectionCard>

        <AppSection>
          {participant.notes ? (
            <SectionCard
              title="Observações da comissão"
              description="Anotações administrativas internas vinculadas ao participante."
              icon={FileText}
            >
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {participant.notes}
                </p>
              </div>
            </SectionCard>
          ) : (
            <SectionCard
              title="Observações da comissão"
              description="Anotações administrativas internas vinculadas ao participante."
              icon={FileText}
            >
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                Nenhuma observação registrada.
              </div>
            </SectionCard>
          )}
        </AppSection>
      </div>

      {editingParticipant && (
        <ParticipantEditForm
          participant={editingParticipant}
          onClose={() => setEditingParticipant(null)}
          onSuccess={() => void loadParticipant()}
        />
      )}

      <AdminConfirmDialog
        open={deleteOpen}
        title="Excluir participante?"
        description={`Deseja realmente excluir ${participant.name}? Esta ação remove o cadastro da lista administrativa e não deve ser usada para correções simples.`}
        confirmLabel="Excluir participante"
        cancelLabel="Cancelar"
        destructive
        loading={deleting}
        error={deleteError}
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false);
            setDeleteError("");
          }
        }}
        onConfirm={confirmDelete}
      />
    </AppPage>
  );
}
