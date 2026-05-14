"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  History,
  Home,
  ListChecks,
  Lock,
  LogOut,
  Menu,
  Phone,
  Scissors,
  ShieldCheck,
  Shirt,
  UserRoundCheck,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { Participant } from "@/types/participant";
import {
  PARTICIPANT_LOGIN_PATH,
  PARTICIPANT_REGISTRATION_PATH,
} from "@/lib/participant-portal-config";

type PortalSection = "conta" | "financeiro" | "prestacao" | "votacoes" | "solicitacoes" | "historico";

type SectionState = "available" | "waiting" | "locked";

type EditFlow = {
  section: string;
  step: "confirm" | "form";
} | null;

type MenuItem = {
  id: PortalSection;
  label: string;
  tooltip: string;
  icon: LucideIcon;
  state: SectionState;
};

type ParticipantMeResponse = {
  status?: "linked" | "needs_registration" | "conflict";
  message?: string;
  participant?: Partial<Participant> & { id?: string };
};

const goldLogoFilter =
  "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)";

const blockedFeatureText =
  "Recurso aguardando deliberação da comissão. Esta funcionalidade já está prevista no sistema, mas será liberada somente quando a fase correspondente for oficialmente aberta.";

const menuItems = [
  {
    id: "conta",
    label: "Minha Conta",
    tooltip: "Dados pessoais, presença, convidados, kit oficial e situação geral da sua participação.",
    icon: UserRoundCheck,
    state: "available",
  },
  {
    id: "financeiro",
    label: "Financeiro",
    tooltip: "Valores, pagamentos, cobranças e pendências individuais do participante.",
    icon: Wallet,
    state: "waiting",
  },
  {
    id: "prestacao",
    label: "Prestação de Contas",
    tooltip: "Transparência da comissão: arrecadação, despesas, saldo e documentos.",
    icon: DollarSign,
    state: "available",
  },
  {
    id: "votacoes",
    label: "Votações",
    tooltip: "Decisões coletivas da turma disponíveis para votação.",
    icon: ListChecks,
    state: "waiting",
  },
  {
    id: "solicitacoes",
    label: "Solicitações",
    tooltip: "Pedidos, dúvidas, alterações e atendimentos enviados à comissão.",
    icon: Briefcase,
    state: "waiting",
  },
  {
    id: "historico",
    label: "Histórico",
    tooltip: "Linha do tempo com registros e atualizações da sua participação.",
    icon: History,
    state: "available",
  },
] as const satisfies ReadonlyArray<MenuItem>;

const futureFinanceRows = [
  ["Cota base", "Aguardando orçamento aprovado"],
  ["Convidados extras", "Aguardando regras de convidados"],
  ["Itens opcionais", "Aguardando catálogo final"],
  ["Descontos", "Aguardando critérios da comissão"],
  ["Total devido", "Aguardando definição da comissão"],
  ["Total pago", "Disponível somente quando pagamentos forem liberados"],
  ["Saldo pendente", "Aguardando cálculo financeiro final"],
] as const;

const paymentFeatures = [
  ["Asaas", "Integração futura para cobrança e conciliação."],
  ["Cobranças", "Emissão e controle de cobranças individuais."],
  ["Pagamentos", "Central interna para acompanhar pagamentos do participante."],
  ["PIX", "Canal previsto para pagamento instantâneo."],
  ["Boleto", "Canal previsto para pagamento bancário."],
  ["Cartão", "Canal previsto para pagamento por cartão."],
  ["Comprovantes", "Envio e conferência de comprovantes."],
  ["Reembolso", "Fluxo futuro para devoluções aprovadas."],
  ["Crédito interno", "Controle de créditos aprovados pela comissão."],
  ["Compras extras", "Itens opcionais e souvenirs adicionais."],
  ["Histórico financeiro", "Linha do tempo financeira individual."],
  ["Pendências financeiras", "Sinalização de débitos ou ajustes em aberto."],
] as const;

const votingTopics = [
  "Local do evento",
  "Buffet",
  "Banda/DJ",
  "Fotografia",
  "Filmagem",
  "Valor aceitável",
  "Kits",
  "Regras de convidados",
] as const;

const requestTopics = [
  "Alteração de convidados após prazo",
  "Ajuste de tamanho de kit",
  "Desistência",
  "Reembolso",
  "Crédito interno",
  "Compra extra de souvenir",
] as const;

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "AT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function StateBadge({ state, label }: { state: SectionState; label?: string }) {
  const data = {
    available: {
      label: "Liberado",
      className: "border-green-500/35 bg-green-500/10 text-green-300",
      icon: CheckCircle,
    },
    waiting: {
      label: "Aguardando",
      className: "border-yellow-500/35 bg-yellow-500/10 text-yellow-200",
      icon: Clock,
    },
    locked: {
      label: "Bloqueado",
      className: "border-red-500/35 bg-red-500/10 text-red-200",
      icon: Lock,
    },
  }[state];
  const Icon = data.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-2.5 py-1 text-[10px] font-black uppercase", data.className)}>
      <Icon className="h-3 w-3" />
      {label || data.label}
    </span>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  state,
  action,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  state?: SectionState;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex min-w-0 flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Icon className="mt-1 h-5 w-5 shrink-0 text-atlas-gold-main" />
        <div className="min-w-0">
          <p className="atlas-kicker text-atlas-gold-main">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-white">{title}</h2>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-atlas-text-muted">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {state && <StateBadge state={state} />}
        {action}
      </div>
    </div>
  );
}

function MetricTile({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[10px] font-black uppercase text-atlas-text-muted">{label}</p>
      <p className="mt-2 break-words text-base font-black text-white">{value}</p>
      {helper && <p className="mt-1 text-xs leading-relaxed text-atlas-text-muted">{helper}</p>}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[10px] font-black uppercase text-atlas-text-muted">{label}</p>
      <p className="mt-1 min-h-5 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Notice({
  icon: Icon,
  title,
  children,
  tone = "gold",
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  tone?: "gold" | "blue" | "red";
}) {
  const toneClass = {
    gold: "border-atlas-gold-main/25 bg-atlas-gold-main/10 text-atlas-gold-main",
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-200",
    red: "border-red-500/25 bg-red-500/10 text-red-200",
  }[tone];

  return (
    <div className={cn("rounded-lg border p-4", toneClass)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-black text-white">{title}</p>
          <div className="mt-1 text-sm leading-relaxed text-atlas-text-muted">{children}</div>
        </div>
      </div>
    </div>
  );
}

function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="atlas-secondary-button">
      <FileText className="h-4 w-4" />
      {label}
    </button>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  state = "waiting",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  state?: SectionState;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Icon className="h-5 w-5 text-atlas-gold-main" />
        <StateBadge state={state} />
      </div>
      <p className="text-sm font-black text-white">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-atlas-text-muted">{description}</p>
    </div>
  );
}

export default function MinhaParticipacaoPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<PortalSection>("conta");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editFlow, setEditFlow] = useState<EditFlow>(null);
  const [participantRecord, setParticipantRecord] = useState<(Partial<Participant> & { id?: string }) | null>(null);
  const [participantStatus, setParticipantStatus] = useState<"loading" | "linked" | "needs_registration" | "conflict" | "error">("loading");
  const [participantMessage, setParticipantMessage] = useState("");

  const participant = useMemo(() => {
    const displayName = user?.displayName?.trim() || "Participante ATLAS";
    const email = user?.email || "Aguardando login";

    const kit = participantRecord?.officialKit;

    return {
      id: participantRecord?.id || (user?.uid ? `participant-${user.uid.slice(0, 24)}` : "participant-vinculo-pendente"),
      name: participantRecord?.name || displayName,
      nickname: participantRecord?.nickname || "A definir",
      initials: getInitials(participantRecord?.name || displayName),
      email: participantRecord?.email || email,
      phone: participantRecord?.phone || "Aguardando cadastro",
      birthDate: participantRecord?.birthDate || "Aguardando cadastro",
      currentFunction: participantRecord?.currentFunction || "Aguardando cadastro",
      location: [participantRecord?.state, participantRecord?.city].filter(Boolean).join(" / ") || "MS / Campo Grande",
      city: participantRecord?.city || "Campo Grande",
      state: participantRecord?.state || "MS",
      country: participantRecord?.country || "Brasil",
      guestsCount: typeof participantRecord?.guestsCount === "number" ? String(participantRecord.guestsCount) : "Aguardando resposta",
      peopleCount: typeof participantRecord?.guestsCount === "number" ? String(1 + participantRecord.guestsCount) : "Aguardando confirmação",
      age: "Aguardando cadastro",
      willAttend: participantRecord?.willAttend === "yes" ? "Confirmado" : participantRecord?.willAttend === "no" ? "Não participará" : "A confirmar",
      committeeInterest: participantRecord?.wantsToHelpCommittee ? "Voluntário" : "Aguardando resposta",
      kitInterest: kit?.interest === "yes" ? "Solicitado" : kit?.interest === "maybe" ? "Talvez" : kit?.interest === "no" ? "Não solicitado" : "Aguardando resposta",
      shirtSize: kit?.shirtSize || "-",
      jacketSize: kit?.jacketSize || "-",
      pantsSize: kit?.pantsSize || "-",
      height: kit?.heightCm ? `${kit.heightCm} cm` : "Aguardando cadastro",
      weight: kit?.approximateWeightKg ? `${kit.approximateWeightKg} kg` : "Aguardando cadastro",
      personalizationName: kit?.customizationName || "Aguardando resposta do participante",
      registrationStatus: participantRecord?.registrationStatus === "linked" ? "Conta vinculada ao cadastro" : user ? "Conta autenticada, cadastro pendente" : "Login do participante em preparação",
      linkStatus: participantRecord?.authUid ? "Vinculado por authUid" : user ? "Preparado para authUid" : "Aguardando login",
    };
  }, [participantRecord, user]);

  const activeItem = menuItems.find((item) => item.id === activeSection) || menuItems[0];

  useEffect(() => {
    if (!loading && !user) {
      router.replace(PARTICIPANT_LOGIN_PATH);
    }
  }, [loading, router, user]);

  useEffect(() => {
    let ignore = false;

    async function loadParticipant() {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/participant/me", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = (await response.json().catch(() => null)) as ParticipantMeResponse | null;

        if (ignore) return;

        if (response.ok && data?.status === "linked" && data.participant) {
          setParticipantRecord(data.participant);
          setParticipantStatus("linked");
          setParticipantMessage("");
          return;
        }

        if (response.ok && data?.status === "needs_registration") {
          router.replace(PARTICIPANT_REGISTRATION_PATH);
          return;
        }

        setParticipantStatus(data?.status === "conflict" ? "conflict" : "error");
        setParticipantMessage(data?.message || "Não foi possível carregar os dados do participante.");
      } catch {
        if (!ignore) {
          setParticipantStatus("error");
          setParticipantMessage("Não foi possível carregar os dados do participante.");
        }
      }
    }

    if (user) {
      void loadParticipant();
    }

    return () => {
      ignore = true;
    };
  }, [router, user]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function openEdit(section: string) {
    setEditFlow({ section, step: "confirm" });
  }

  function closeEdit() {
    setEditFlow(null);
  }

  function renderSidebarContent() {
    return (
      <>
        <div className={cn("flex h-20 items-center border-b border-atlas-gold-main/20 bg-gradient-to-b from-white/5 to-transparent", sidebarCollapsed ? "justify-center" : "px-5")}>
          <Link href="/" className="flex min-w-0 items-center gap-3 text-atlas-gold-main" title="Área do participante ATLAS 30 Anos">
            <Image src="/logo-fab.svg" alt="Logo FAB" width={28} height={28} style={{ filter: goldLogoFilter }} />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-black uppercase text-atlas-gold-main">Participante</p>
                <p className="mt-1 truncate text-[10px] font-bold uppercase text-atlas-text-muted">ATLAS 30 Anos</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="custom-scrollbar flex-1 overflow-y-auto py-5">
          <ul className={cn("space-y-1.5", sidebarCollapsed ? "px-2" : "px-4")}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeSection;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      closeMobileMenu();
                    }}
                    className={cn(
                      "group relative flex w-full items-center rounded-lg border-l-2 text-left text-sm transition-all",
                      sidebarCollapsed ? "justify-center px-0 py-4" : "gap-3 px-4 py-3",
                      isActive
                        ? "border-atlas-gold-main bg-atlas-gold-main/10 text-atlas-gold-main"
                        : "border-transparent text-atlas-text-muted hover:bg-white/5 hover:text-white"
                    )}
                    title={item.tooltip}
                    aria-label={item.label}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span className="min-w-0 flex-1 truncate font-bold">{item.label}</span>}
                    {!sidebarCollapsed && item.state !== "available" && <Lock className="h-3.5 w-3.5 shrink-0 text-yellow-200" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-atlas-gold-main/20 bg-black/20 p-4">
          <Link
            href="/"
            className={cn("flex items-center rounded-lg py-2 text-sm text-atlas-text-muted transition-colors hover:bg-white/5 hover:text-white", sidebarCollapsed ? "justify-center px-0" : "gap-3 px-4")}
            title="Acessar a página pública do Reencontro ATLAS 30 Anos."
            aria-label="Site Público"
          >
            <Home className="h-4 w-4" />
            {!sidebarCollapsed && <span>Site Público</span>}
          </Link>

          <button
            type="button"
            onClick={() => {
              if (user) void signOut(auth);
            }}
            className={cn("flex w-full items-center rounded-lg py-2 text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200", sidebarCollapsed ? "justify-center px-0" : "gap-3 px-4")}
            title="Sair com segurança da área do participante."
            aria-label="Desconectar"
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span>Desconectar</span>}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSidebarCollapsed((current) => !current)}
          className="absolute -right-3 top-24 z-50 hidden rounded-full border-2 border-atlas-navy-deep bg-atlas-gold-main p-1 text-atlas-navy-deep transition-transform hover:scale-110 lg:flex"
          aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </>
    );
  }

  function renderAccountPage() {
    return (
      <div className="animate-in fade-in duration-300">
        <article className="overflow-hidden rounded-lg border border-atlas-navy-aero/35 bg-atlas-navy-deep shadow-2xl">
          <header className="border-b border-atlas-gold-main/30 bg-[#020617] px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <Image src="/logo-fab.svg" alt="Logo FAB" width={44} height={44} style={{ filter: goldLogoFilter }} />
                <div className="min-w-0">
                  <p className="atlas-kicker text-atlas-gold-main">Registro Oficial</p>
                  <h1 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">Turma ATLAS 30 Anos</h1>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-atlas-gold-main">Força Aérea Brasileira | 1997-2027</p>
                </div>
              </div>
              <div className="grid gap-3 text-left sm:grid-cols-2 lg:w-[32rem]">
                <MetricTile label="Situação geral" value={participant.registrationStatus} />
                <MetricTile label="Próxima ação" value="Confirmar dados no cadastro" helper="A etapa será liberada com o login do participante." />
              </div>
            </div>
          </header>

          <div className="bg-gradient-to-b from-atlas-navy-base to-atlas-navy-deep p-5 sm:p-8">
            <section className="grid gap-6 border-b border-white/10 pb-8 lg:grid-cols-[10rem_minmax(0,1fr)]">
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-atlas-gold-main/45 bg-[#071225] shadow-[0_0_35px_rgb(212_175_55/0.08)]">
                  <span className="text-5xl font-black text-atlas-gold-main">{participant.initials}</span>
                </div>
                <span className="atlas-kicker mt-4 text-atlas-gold-main">ATLAS</span>
              </div>

              <div className="min-w-0 text-center lg:text-left">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-4xl font-black leading-tight text-white sm:text-5xl">{participant.name}</h2>
                    <p className="mt-4 text-lg font-black uppercase text-atlas-gold-main">&quot;{participant.nickname}&quot;</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left xl:w-80">
                    <p className="text-[10px] font-black uppercase text-atlas-text-muted">ID do registro</p>
                    <p className="mt-2 break-all font-mono text-xs text-white/70">{participant.id}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricTile label="Localidade" value={participant.location} />
                  <MetricTile label="Convidados" value={participant.guestsCount} />
                  <MetricTile label="Total pessoas" value={participant.peopleCount} />
                  <MetricTile label="Idade" value={participant.age} />
                </div>
              </div>
            </section>

            <section className="grid gap-4 border-b border-white/10 py-8 lg:grid-cols-4">
              <MetricTile label="Status da presença" value={participant.willAttend} helper="Resposta inicial do participante." />
              <MetricTile label="Comissão" value={participant.committeeInterest} helper="Interesse em ajudar na organização." />
              <MetricTile label="Kit oficial" value={participant.kitInterest} helper="Interesse e medidas para planejamento." />
              <MetricTile label="Financeiro" value="Aguardando comissão" helper="Sem valor final definido nesta fase." />
            </section>

            <div className="grid gap-8 pt-8 xl:grid-cols-2">
              <section>
                <SectionHeader
                  icon={FileText}
                  eyebrow="Minha Conta"
                  title="Dados pessoais"
                  description="Informações usadas para identificar o participante, consolidar o cadastro e preparar o vínculo futuro por e-mail e senha."
                  state="available"
                  action={<EditButton label="Editar" onClick={() => openEdit("Dados pessoais")} />}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailRow label="Nome completo" value={participant.name} />
                  <DetailRow label="Nome de guerra" value={participant.nickname} />
                  <DetailRow label="E-mail de acesso" value={participant.email} />
                  <DetailRow label="Telefone" value={participant.phone} />
                  <DetailRow label="Cidade" value={participant.city} />
                  <DetailRow label="UF" value={participant.state} />
                  <DetailRow label="País" value={participant.country} />
                  <DetailRow label="Vínculo" value={participant.linkStatus} />
                </div>
              </section>

              <section>
                <SectionHeader
                  icon={Briefcase}
                  eyebrow="Perfil"
                  title="Identificação e atuação"
                  description="Dados pessoais e profissionais recebidos no formulário passo a passo e visíveis ao participante e à comissão."
                  state="available"
                  action={<EditButton label="Editar" onClick={() => openEdit("Identificação e atuação")} />}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailRow label="Profissão atual / patente" value={participant.currentFunction} />
                  <DetailRow label="Data de nascimento" value={participant.birthDate} />
                  <DetailRow label="Idade" value={participant.age} />
                  <DetailRow label="Localidade" value={participant.location} />
                </div>
              </section>

              <section>
                <SectionHeader
                  icon={Phone}
                  eyebrow="Contato"
                  title="Canais de contato"
                  description="Informações privadas do participante, visíveis apenas ao próprio membro e à comissão."
                  state="available"
                  action={<EditButton label="Editar" onClick={() => openEdit("Contato")} />}
                />
                <div className="space-y-3">
                  <DetailRow label="WhatsApp / telefone" value={participant.phone} />
                  <DetailRow label="E-mail" value={participant.email} />
                </div>
              </section>

              <section>
                <SectionHeader
                  icon={CheckCircle}
                  eyebrow="Presença"
                  title="Presença e participação"
                  description="Respostas iniciais usadas para medir demanda, confirmar interesse no evento e identificar voluntários para a comissão."
                  state="available"
                  action={<EditButton label="Editar" onClick={() => openEdit("Presença e participação")} />}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricTile label="Interesse no evento" value={participant.willAttend} />
                  <MetricTile label="Presença inicial" value={participant.willAttend} />
                  <MetricTile label="Comissão" value={participant.committeeInterest} />
                </div>
              </section>

              <section>
                <SectionHeader
                  icon={Users}
                  eyebrow="Convidados"
                  title="Quantidade inicial de convidados"
                  description="A estimativa ajuda a comissão a dimensionar local, buffet, mesas e regras de convidados."
                  state="available"
                  action={<EditButton label="Editar" onClick={() => openEdit("Convidados")} />}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricTile label="Convidados previstos" value={participant.guestsCount} />
                  <MetricTile label="Total de pessoas" value={participant.peopleCount} />
                  <MetricTile label="Alterações livres" value="Prazo futuro" />
                  <MetricTile label="Alterações com aprovação" value="Previsto" />
                  <MetricTile label="Bloqueio final" value="Previsto" />
                </div>
              </section>

              <section>
                <SectionHeader
                  icon={Shirt}
                  eyebrow="Kit oficial"
                  title="Kit oficial e souvenirs"
                  description="Interesse, medidas e personalização para planejamento da comissão, sem compra ou cobrança nesta etapa."
                  state="available"
                  action={<EditButton label="Editar" onClick={() => openEdit("Kit oficial")} />}
                />
                <div className="relative overflow-hidden rounded-lg border border-atlas-navy-aero/35 bg-[#071225] p-5">
                  <Scissors className="pointer-events-none absolute -right-5 top-0 h-32 w-32 text-white/5" />
                  <div className="relative z-10 grid gap-3 sm:grid-cols-3">
                    <MetricTile label="Camiseta" value={participant.shirtSize} />
                    <MetricTile label="Jaqueta" value={participant.jacketSize} />
                    <MetricTile label="Calça" value={participant.pantsSize} />
                  </div>
                  <div className="relative z-10 mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
                    <DetailRow label="Altura" value={participant.height} />
                    <DetailRow label="Peso aprox." value={participant.weight} />
                  </div>
                  <div className="relative z-10 mt-5 rounded-lg border border-atlas-gold-main/25 bg-atlas-gold-main/10 p-4">
                    <p className="text-[10px] font-black uppercase text-atlas-gold-main">Nome para personalização</p>
                    <p className="mt-2 text-sm font-semibold text-white">{participant.personalizationName}</p>
                  </div>
                  <div className="relative z-10 mt-5">
                    <Link href="/souvenirs" className="atlas-secondary-button">
                      Ver catálogo público
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </section>
            </div>

            <section className="mt-8">
              <SectionHeader
                icon={Activity}
                eyebrow="Próxima ação"
                title="Primeiro acesso recomendado"
                description="A jornada prevista para quando o login inicial do participante for liberado."
              />
              <div className="grid gap-3 lg:grid-cols-3">
                {[
                  ["1", "Login inicial", "O membro cria ou acessa a conta por e-mail e senha."],
                  ["2", "Cadastro passo a passo", "Se ainda não houver vínculo, ele é enviado diretamente ao formulário de cadastro."],
                  ["3", "Confirmação e consolidação", "Ao concluir, o participante aparece no dashboard administrativo e nesta página individual."],
                ].map(([step, title, text]) => (
                  <div key={step} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-atlas-gold-main text-sm font-black text-atlas-navy-deep">{step}</span>
                    <div>
                      <p className="text-sm font-black text-white">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-atlas-text-muted">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Link href={PARTICIPANT_REGISTRATION_PATH} className="atlas-primary-button">
                  Ir para cadastro
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </div>
            </section>
          </div>
        </article>
      </div>
    );
  }

  function renderFinancePage() {
    return (
      <section className="animate-in fade-in duration-300">
        <SectionHeader
          icon={Wallet}
          eyebrow="Financeiro individual"
          title="Situação financeira do participante"
          description="Esta área concentra valores, cobranças, pagamentos e pendências individuais. Nada aqui representa valor final enquanto a comissão não abrir a fase financeira."
          state="waiting"
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <Notice icon={Clock} title="Situação financeira atual">
            Aguardando definição da comissão. O sistema não deve exibir R$ 0,00 como se fosse total final.
          </Notice>
          <Notice icon={Wallet} title="Valores">
            Cota base, convidados extras, itens opcionais, descontos e saldo serão calculados somente na fase financeira.
          </Notice>
          <Notice icon={Lock} title="Pagamentos bloqueados" tone="red">
            Asaas, PIX, boleto, cartão, cobranças, reembolso, compras extras e crédito interno ficam fora do MVP atual.
          </Notice>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
          {futureFinanceRows.map(([label, value]) => (
            <div key={label} className="grid gap-2 border-b border-white/5 px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[14rem_minmax(0,1fr)]">
              <span className="font-black text-white">{label}</span>
              <span className="text-atlas-text-muted">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <SectionHeader
            icon={CreditCard}
            eyebrow="Pagamentos"
            title="Cobranças e meios de pagamento"
            description="Pagamentos deixam de ser uma aba isolada e passam a fazer parte do financeiro individual."
            state="locked"
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {paymentFeatures.map(([title, description]) => (
              <FeatureCard key={title} icon={Lock} title={title} description={`${description} ${blockedFeatureText}`} state="locked" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderPrestacaoPage() {
    return (
      <section className="animate-in fade-in duration-300">
        <SectionHeader
          icon={DollarSign}
          eyebrow="Transparência coletiva"
          title="Prestação de Contas"
          description="Área separada do financeiro individual. Aqui ficam arrecadação geral, despesas, saldo, documentos e relatórios da comissão."
          state="available"
        />
        <div className="grid gap-3 md:grid-cols-3">
          <MetricTile label="Resumo público" value="Consolidado" helper="Informações coletivas da comissão." />
          <MetricTile label="Dados individuais" value="Protegidos" helper="Não são expostos publicamente." />
          <MetricTile label="Comprovantes" value="Restritos à comissão" helper="Documentos serão liberados conforme regra definida." />
        </div>
        <div className="mt-5">
          <Link href="/prestacao-contas" className="atlas-primary-button">
            Abrir prestação
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  function renderVotingPage() {
    return (
      <section className="animate-in fade-in duration-300">
        <SectionHeader
          icon={ListChecks}
          eyebrow="Assembleias"
          title="Votações"
          description="Área reservada para decisões coletivas sobre fornecedores, regras e orçamento. A votação completa ainda não está ativa."
          state="waiting"
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {votingTopics.map((topic) => (
            <FeatureCard key={topic} icon={ListChecks} title={topic} description="Pauta prevista para assembleia ou consulta futura." state="waiting" />
          ))}
        </div>
      </section>
    );
  }

  function renderRequestsPage() {
    return (
      <section className="animate-in fade-in duration-300">
        <SectionHeader
          icon={Briefcase}
          eyebrow="Atendimento"
          title="Solicitações"
          description="Canal futuro para pedidos, dúvidas, mudanças depois dos prazos e exceções que dependam de aprovação da comissão."
          state="waiting"
        />
        <div className="grid gap-3 md:grid-cols-2">
          {requestTopics.map((topic) => (
            <Notice key={topic} icon={Briefcase} title={topic} tone="blue">
              Aguardando regras, prazos e fluxo de aprovação.
            </Notice>
          ))}
        </div>
      </section>
    );
  }

  function renderHistoryPage() {
    return (
      <section className="animate-in fade-in duration-300">
        <SectionHeader
          icon={History}
          eyebrow="Histórico"
          title="Linha do tempo"
          description="Registro cronológico do vínculo, cadastro, alterações, respostas e etapas financeiras futuras."
          state="available"
        />
        <div className="space-y-3">
          {[
            ["Login inicial", "Conta do participante criada ou autenticada por e-mail e senha.", "Previsto"],
            ["Cadastro passo a passo", "Membro enviado para confirmar dados, presença, convidados e kits.", "Próximo"],
            ["Consolidação administrativa", "Cadastro aparece no dashboard dos administradores.", "Próximo"],
            ["Página individual", "Dados confirmados passam a alimentar esta página.", "Próximo"],
          ].map(([title, description, status]) => (
            <div key={title} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <span className="rounded border border-atlas-gold-main/30 bg-atlas-gold-main/10 px-3 py-2 text-center text-xs font-black uppercase text-atlas-gold-main">{status}</span>
              <div>
                <p className="text-sm font-black text-white">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-atlas-text-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function renderActiveSection() {
    if (activeSection === "conta") return renderAccountPage();
    if (activeSection === "financeiro") return renderFinancePage();
    if (activeSection === "prestacao") return renderPrestacaoPage();
    if (activeSection === "votacoes") return renderVotingPage();
    if (activeSection === "solicitacoes") return renderRequestsPage();
    return renderHistoryPage();
  }

  if (loading || !user) {
    return (
      <div className="atlas-admin-shell flex min-h-screen items-center justify-center px-4 text-white">
        <div className="rounded-lg border border-white/10 bg-[#071225] p-6 text-center text-atlas-text-muted">
          Verificando acesso do participante...
        </div>
      </div>
    );
  }

  return (
    <div className="atlas-admin-shell relative flex h-dvh min-w-0 overflow-hidden font-sans text-white">
      <aside className={cn("relative z-40 hidden flex-col border-r border-atlas-gold-main/20 bg-[#060e1c]/88 shadow-2xl backdrop-blur-xl transition-all duration-300 lg:flex", sidebarCollapsed ? "w-20" : "w-64")}>
        {renderSidebarContent()}
      </aside>

      {mobileMenuOpen && <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm lg:hidden" onClick={closeMobileMenu} />}

      <aside className={cn("fixed left-0 top-0 z-[70] flex h-full w-[min(18rem,85vw)] flex-col border-r border-atlas-gold-main/20 bg-[#060e1c] transition-transform duration-300 lg:hidden", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={closeMobileMenu}
            className="rounded-lg p-2 text-atlas-text-muted transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {renderSidebarContent()}
      </aside>

      <div className="relative z-10 flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="hidden h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#060e1c]/82 px-6 backdrop-blur-xl lg:flex">
          <div className="min-w-0">
            <p className="atlas-admin-breadcrumb">Registro Oficial | Turma ATLAS 30 Anos</p>
            <p className="mt-0.5 truncate text-sm text-atlas-text-muted">Central pessoal para acompanhar dados, presença, convidados, kit, financeiro e decisões da comissão.</p>
          </div>
          <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-atlas-gold-main" />
            <div className="min-w-0 text-right">
              <p className="text-[10px] font-bold uppercase text-atlas-text-muted">Sessão individual</p>
              <p className="max-w-56 truncate text-xs font-semibold text-white">{user?.email || "participante@atlas.com"}</p>
            </div>
          </div>
        </header>

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-atlas-gold-main/20 bg-[#060e1c]/90 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-atlas-gold-main transition-colors hover:bg-white/5"
            aria-label="Abrir menu do participante"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/logo-fab.svg" alt="Logo FAB" width={24} height={24} style={{ filter: goldLogoFilter }} />
            <span className="text-[10px] font-black uppercase text-atlas-gold-main">Minha Conta</span>
          </div>
          <Link href="/" className="rounded-lg p-2 text-atlas-text-muted transition-colors hover:bg-white/5 hover:text-white" aria-label="Site Público">
            <Home className="h-5 w-5" />
          </Link>
        </header>

        <main className="custom-scrollbar min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1500px] min-w-0 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="atlas-kicker text-atlas-gold-main">Central do participante</p>
                <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">{activeItem.label}</h1>
              </div>
              <StateBadge state={activeItem.state} />
            </div>

            {participantStatus === "loading" && (
              <div className="mb-5">
                <Notice icon={Clock} title="Carregando cadastro" tone="blue">
                  Estamos buscando seu vínculo de participante e os dados consolidados do formulário.
                </Notice>
              </div>
            )}

            {(participantStatus === "conflict" || participantStatus === "error") && (
              <div className="mb-5">
                <Notice icon={Lock} title="Atenção ao vínculo" tone="red">
                  {participantMessage}
                </Notice>
              </div>
            )}

            {isAdmin && (
              <div className="mb-5">
                <Notice icon={ShieldCheck} title="Sessão administrativa detectada" tone="blue">
                  Administradores continuam usando o painel da comissão para ver todos os participantes. Esta tela simula a visão individual que cada membro terá após login.
                </Notice>
              </div>
            )}

            {renderActiveSection()}
          </div>
        </main>
      </div>

      {editFlow && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-white/10 bg-[#071225] p-5 shadow-2xl">
            {editFlow.step === "confirm" ? (
              <>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-atlas-gold-main" />
                  <div>
                    <p className="text-lg font-black text-white">Deseja realmente editar estas informações?</p>
                    <p className="mt-2 text-sm leading-relaxed text-atlas-text-muted">
                      Você está prestes a editar a seção {editFlow.section}. Após confirmar, um formulário resumido será aberto mantendo a visualização principal limpa.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={closeEdit} className="atlas-secondary-button">
                    Cancelar
                  </button>
                  <button type="button" onClick={() => setEditFlow((current) => current && { ...current, step: "form" })} className="atlas-primary-button">
                    Sim, editar
                  </button>
                </div>
              </>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  closeEdit();
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-black text-white">Editar {editFlow.section}</p>
                    <p className="mt-2 text-sm leading-relaxed text-atlas-text-muted">
                      Formulário resumido preparado para a próxima etapa. Nesta fase, o salvamento real ainda depende do login individual e das regras de edição.
                    </p>
                  </div>
                  <button type="button" onClick={closeEdit} className="rounded-lg p-2 text-atlas-text-muted transition-colors hover:bg-white/5 hover:text-white" aria-label="Fechar edição">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-5 grid gap-3">
                  <label className="text-sm font-semibold text-white">
                    Campo principal
                    <input className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-atlas-gold-main" defaultValue="Aguardando cadastro" />
                  </label>
                  <label className="text-sm font-semibold text-white">
                    Observação para a comissão
                    <textarea className="mt-2 min-h-24 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-atlas-gold-main" defaultValue="" />
                  </label>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={closeEdit} className="atlas-secondary-button">
                    Cancelar
                  </button>
                  <button type="submit" className="atlas-primary-button">
                    Salvar e voltar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
