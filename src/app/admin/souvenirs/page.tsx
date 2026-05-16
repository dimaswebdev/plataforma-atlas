"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Gift,
  ListChecks,
  Loader2,
  PackageCheck,
  Ruler,
  Shirt,
} from "lucide-react";
import {
  AdminBadge,
  AdminCard,
  AdminDataTable,
  AdminMetricCard,
  AdminMetricGrid,
  AdminPage,
  AdminPageHeader,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin";
import { fetchWithAdminAuth } from "@/lib/client-auth";
import { Participant } from "@/types/participant";
import { Souvenir, SouvenirInterest } from "@/types/souvenir";

type SizeTotals = Record<string, number>;

const SIZES = ["PP", "P", "M", "G", "GG", "XG", "XGG", "SPECIAL"];

function increment(map: Record<string, number>, key: string | undefined, quantity = 1) {
  const safeKey = key || "Não informado";
  map[safeKey] = (map[safeKey] || 0) + quantity;
}

function sortEntries(map: Record<string, number>) {
  return Object.entries(map).sort(([a], [b]) => {
    const aIndex = SIZES.indexOf(a);
    const bIndex = SIZES.indexOf(b);
    if (aIndex >= 0 || bIndex >= 0) return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    return a.localeCompare(b);
  });
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

export default function AdminSouvenirs() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [interests, setInterests] = useState<SouvenirInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const [participantsRes, souvenirsRes, interestsRes] = await Promise.all([
          fetchWithAdminAuth("/api/data?collection=participants"),
          fetchWithAdminAuth("/api/data?collection=souvenirs"),
          fetchWithAdminAuth("/api/data?collection=souvenirInterests"),
        ]);

        if (!participantsRes.ok || !souvenirsRes.ok || !interestsRes.ok) {
          throw new Error("Não foi possível carregar os dados de kits e souvenirs.");
        }

        setParticipants((await participantsRes.json()) as Participant[]);
        setSouvenirs((await souvenirsRes.json()) as Souvenir[]);
        setInterests((await interestsRes.json()) as SouvenirInterest[]);
      } catch (err) {
        console.error("Error loading souvenir admin data", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados administrativos.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const summary = useMemo(() => {
    const kitParticipants = participants.filter((participant) => {
      const interest = participant.officialKit?.interest;
      return interest === "yes" || interest === "maybe";
    });
    const confirmedKitParticipants = kitParticipants.filter((participant) => participant.officialKit?.interest === "yes");
    const shirtTotals: SizeTotals = {};
    const pantsTotals: SizeTotals = {};
    const jacketTotals: SizeTotals = {};
    const itemTotals: Record<string, number> = {};
    const statusTotals: Record<string, number> = {};
    const participantById = new Map(
      participants.flatMap((participant) => participant.id ? [[participant.id, participant] as const] : []),
    );

    kitParticipants.forEach((participant) => {
      increment(shirtTotals, participant.officialKit?.shirtSize);
      increment(pantsTotals, participant.officialKit?.pantsSize);
      increment(jacketTotals, participant.officialKit?.jacketSize);
    });

    const interestRows = interests.map((interest) => {
      const participant = interest.participantId ? participantById.get(interest.participantId) : undefined;
      const quantity = Number(interest.quantity || 0) || 0;
      const itemName = interest.souvenirName.toLowerCase();
      const normalizedItemName = itemName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const category = interest.souvenirCategory || "";
      const shirtSize = interest.shirtSize || participant?.officialKit?.shirtSize;
      const pantsSize = interest.pantsSize || participant?.officialKit?.pantsSize;
      const jacketSize = interest.jacketSize || participant?.officialKit?.jacketSize;
      const isKit = category === "kit" || includesAny(normalizedItemName, ["kit"]);
      const isShirt = isKit || category === "shirt" || includesAny(normalizedItemName, ["camiseta"]);
      const isPants = isKit || category === "pants" || includesAny(normalizedItemName, ["calca"]);
      const isJacket = isKit || includesAny(normalizedItemName, ["jaqueta"]);

      increment(itemTotals, interest.souvenirName, quantity);
      increment(statusTotals, interest.status, quantity);

      if (isShirt) increment(shirtTotals, shirtSize, quantity);
      if (isPants) increment(pantsTotals, pantsSize, quantity);
      if (isJacket) increment(jacketTotals, jacketSize, quantity);

      return {
        interest,
        participant,
        shirtSize,
        pantsSize,
        jacketSize,
      };
    });

    return {
      kitParticipants,
      confirmedKitParticipants,
      interestRows,
      shirtTotals,
      pantsTotals,
      jacketTotals,
      itemTotals,
      statusTotals,
      requestedUnits: interests.reduce((acc, interest) => acc + Number(interest.quantity || 0), 0),
      availableCatalogItems: souvenirs.filter((souvenir) => souvenir.available).length,
    };
  }, [participants, souvenirs, interests]);

  return (
    <AdminPage>
      <AdminPageHeader
        title="Kits e souvenirs"
        icon={Gift}
        description="Consolidação administrativa dos interesses em Kit Oficial e das solicitações registradas por item."
      />

      {loading ? (
        <AdminCard className="flex min-h-[45vh] items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-brand-500" aria-hidden="true" />
            <span>Carregando controle de kits...</span>
          </div>
        </AdminCard>
      ) : error ? (
        <AdminCard className="border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-500">
          {error}
        </AdminCard>
      ) : (
        <>
          <AdminMetricGrid columns={4}>
            <AdminMetricCard
              icon={PackageCheck}
              label="Itens no catálogo"
              value={souvenirs.length}
              helper={`${summary.availableCatalogItems} disponíveis para solicitação`}
              tone="gold"
            />
            <AdminMetricCard
              icon={Shirt}
              label="Interessados no kit"
              value={summary.kitParticipants.length}
              helper={`${summary.confirmedKitParticipants.length} com interesse confirmado`}
              tone="blue"
            />
            <AdminMetricCard
              icon={ListChecks}
              label="Solicitações avulsas"
              value={interests.length}
              helper={`${summary.requestedUnits} unidade(s) solicitadas`}
              tone="green"
            />
            <AdminMetricCard
              icon={Clock}
              label="Pendências"
              value={summary.statusTotals.pending || 0}
              helper="Unidades aguardando análise da comissão"
              tone="red"
            />
          </AdminMetricGrid>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              { title: "Camisetas por tamanho", totals: summary.shirtTotals },
              { title: "Jaquetas por tamanho", totals: summary.jacketTotals },
              { title: "Calças por tamanho", totals: summary.pantsTotals },
            ].map((block) => (
              <AdminCard key={block.title} className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-brand-500" />
                  <h2 className="tailadmin-title text-base font-semibold text-gray-900 dark:text-white">
                    {block.title}
                  </h2>
                </div>
                {Object.keys(block.totals).length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sem dados registrados.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {sortEntries(block.totals).map(([size, total]) => (
                      <div key={size} className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03]">
                        <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">{size}</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{total}</p>
                      </div>
                    ))}
                  </div>
                )}
              </AdminCard>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AdminCard className="p-5">
              <h2 className="tailadmin-title mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Total por souvenir
              </h2>
              {Object.keys(summary.itemTotals).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma solicitação avulsa registrada.</p>
              ) : (
                <div className="space-y-3">
                  {sortEntries(summary.itemTotals).map(([name, total]) => (
                    <div key={name} className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03]">
                      <span className="min-w-0 break-words text-sm font-medium text-gray-900 dark:text-white">{name}</span>
                      <AdminBadge color="primary" size="sm">{total} un.</AdminBadge>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>

            <AdminCard className="p-5">
              <h2 className="tailadmin-title mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Total por status
              </h2>
              {Object.keys(summary.statusTotals).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sem solicitações para totalizar.</p>
              ) : (
                <div className="space-y-3">
                  {sortEntries(summary.statusTotals).map(([status, total]) => (
                    <div key={status} className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03]">
                      <span className="text-sm font-medium uppercase text-gray-900 dark:text-white">{status}</span>
                      <AdminBadge color="dark" size="sm">{total} un.</AdminBadge>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          </div>

          <AdminDataTable
            title="Participantes com interesse no Kit Oficial"
            description="Dados consolidados automaticamente a partir do cadastro de participantes."
            colSpan={8}
            empty={summary.kitParticipants.length === 0}
            emptyLabel="Nenhum interesse em kit registrado."
            footerConfig={{
              displayedCount: summary.kitParticipants.length,
              totalCount: summary.kitParticipants.length,
            }}
            minWidth={980}
            columns={
              <>
                <AdminTableHead>Nome</AdminTableHead>
                <AdminTableHead>Nome de guerra</AdminTableHead>
                <AdminTableHead>Contato</AdminTableHead>
                <AdminTableHead>Camiseta</AdminTableHead>
                <AdminTableHead>Jaqueta</AdminTableHead>
                <AdminTableHead>Calça</AdminTableHead>
                <AdminTableHead>Medidas</AdminTableHead>
                <AdminTableHead>Status</AdminTableHead>
              </>
            }
          >
            {summary.kitParticipants.map((participant) => (
              <AdminTableRow key={participant.id || participant.phone || participant.name}>
                <AdminTableCell className="font-medium text-gray-900 dark:text-white">{participant.name}</AdminTableCell>
                <AdminTableCell>{participant.nickname || "-"}</AdminTableCell>
                <AdminTableCell>{participant.phone || participant.email || "-"}</AdminTableCell>
                <AdminTableCell>{participant.officialKit?.shirtSize || "-"}</AdminTableCell>
                <AdminTableCell>{participant.officialKit?.jacketSize || "-"}</AdminTableCell>
                <AdminTableCell>{participant.officialKit?.pantsSize || "-"}</AdminTableCell>
                <AdminTableCell>
                  {participant.officialKit?.heightCm ? `${participant.officialKit.heightCm}cm` : "-"}
                  {participant.officialKit?.approximateWeightKg ? ` / ${participant.officialKit.approximateWeightKg}kg` : ""}
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge color={participant.officialKit?.interest === "yes" ? "success" : "warning"} size="sm">
                    {participant.officialKit?.interest === "yes" ? "Confirmado" : "Talvez"}
                  </AdminBadge>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminDataTable>

          <AdminDataTable
            title="Solicitações de souvenirs"
            description='Registros feitos pelo botão "Tenho interesse" na página pública.'
            colSpan={7}
            empty={interests.length === 0}
            emptyLabel="Nenhuma solicitação avulsa registrada."
            footerConfig={{
              displayedCount: summary.interestRows.length,
              totalCount: summary.interestRows.length,
            }}
            minWidth={980}
            columns={
              <>
                <AdminTableHead>Participante</AdminTableHead>
                <AdminTableHead>Nome de guerra</AdminTableHead>
                <AdminTableHead>Contato</AdminTableHead>
                <AdminTableHead>Item</AdminTableHead>
                <AdminTableHead className="text-center">Qtd.</AdminTableHead>
                <AdminTableHead>Tamanhos</AdminTableHead>
                <AdminTableHead>Status</AdminTableHead>
              </>
            }
          >
            {summary.interestRows.map(({ interest, participant, shirtSize, jacketSize, pantsSize }) => (
              <AdminTableRow key={interest.id || `${interest.participantId}-${interest.souvenirId}`}>
                <AdminTableCell className="font-medium text-gray-900 dark:text-white">
                  {participant?.name || interest.participantName}
                </AdminTableCell>
                <AdminTableCell>{participant?.nickname || interest.warName || "-"}</AdminTableCell>
                <AdminTableCell>{participant?.phone || participant?.email || interest.contactPhone || interest.contactEmail || "-"}</AdminTableCell>
                <AdminTableCell>{interest.souvenirName}</AdminTableCell>
                <AdminTableCell className="text-center font-semibold text-gray-900 dark:text-white">{interest.quantity}</AdminTableCell>
                <AdminTableCell>
                  C: {shirtSize || "-"} / J: {jacketSize || "-"} / Calça: {pantsSize || "-"}
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge color="dark" size="sm">{interest.status}</AdminBadge>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminDataTable>
        </>
      )}
    </AdminPage>
  );
}
