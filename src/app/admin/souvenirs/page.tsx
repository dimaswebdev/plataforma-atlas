"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, PackageCheck, Shirt, Ruler, ListChecks, Clock } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
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
      participants.flatMap((participant) => participant.id ? [[participant.id, participant] as const] : [])
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
    <div className="atlas-admin-page">
      <AdminPageHeader
        title="Kits e souvenirs"
        icon={Gift}
        description="Consolidação administrativa dos interesses em Kit Oficial e das solicitações registradas por item."
      />

      {loading ? (
        <div className="flex h-[45vh] items-center justify-center">
          <div className="atlas-loading-label animate-pulse">Carregando controle de kits...</div>
        </div>
      ) : error ? (
        <div className="atlas-error-box">{error}</div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              icon={PackageCheck}
              label="Itens no catálogo"
              value={souvenirs.length}
              helper={`${summary.availableCatalogItems} disponíveis para solicitação`}
              tone="gold"
            />
            <AdminStatCard
              icon={Shirt}
              label="Interessados no kit"
              value={summary.kitParticipants.length}
              helper={`${summary.confirmedKitParticipants.length} com interesse confirmado`}
              tone="blue"
            />
            <AdminStatCard
              icon={ListChecks}
              label="Solicitações avulsas"
              value={interests.length}
              helper={`${summary.requestedUnits} unidade(s) solicitadas`}
              tone="green"
            />
            <AdminStatCard
              icon={Clock}
              label="Pendências"
              value={summary.statusTotals.pending || 0}
              helper="Unidades aguardando análise da comissão"
              tone="red"
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              { title: "Camisetas por tamanho", totals: summary.shirtTotals },
              { title: "Jaquetas por tamanho", totals: summary.jacketTotals },
              { title: "Calças por tamanho", totals: summary.pantsTotals },
            ].map((block) => (
              <section key={block.title} className="atlas-admin-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-atlas-gold-main" />
                  <h2 className="atlas-card-title text-white">{block.title}</h2>
                </div>
                {Object.keys(block.totals).length === 0 ? (
                  <p className="text-sm text-atlas-text-muted">Sem dados registrados.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {sortEntries(block.totals).map(([size, total]) => (
                      <div key={size} className="rounded border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-[10px] font-bold uppercase text-atlas-text-muted">{size}</p>
                        <p className="mt-1 text-lg font-black text-white">{total}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="atlas-admin-card p-5">
              <h2 className="atlas-card-title mb-4 text-white">Total por souvenir</h2>
              {Object.keys(summary.itemTotals).length === 0 ? (
                <p className="text-sm text-atlas-text-muted">Nenhuma solicitação avulsa registrada.</p>
              ) : (
                <div className="space-y-3">
                  {sortEntries(summary.itemTotals).map(([name, total]) => (
                    <div key={name} className="flex items-center justify-between gap-4 rounded border border-white/10 bg-white/[0.03] p-3">
                      <span className="min-w-0 break-words text-sm font-semibold text-white">{name}</span>
                      <span className="shrink-0 text-sm font-black text-atlas-gold-main">{total} un.</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="atlas-admin-card p-5">
              <h2 className="atlas-card-title mb-4 text-white">Total por status</h2>
              {Object.keys(summary.statusTotals).length === 0 ? (
                <p className="text-sm text-atlas-text-muted">Sem solicitações para totalizar.</p>
              ) : (
                <div className="space-y-3">
                  {sortEntries(summary.statusTotals).map(([status, total]) => (
                    <div key={status} className="flex items-center justify-between gap-4 rounded border border-white/10 bg-white/[0.03] p-3">
                      <span className="text-sm font-semibold uppercase text-white">{status}</span>
                      <span className="text-sm font-black text-atlas-gold-main">{total} un.</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="atlas-table-card mb-6">
            <div className="border-b border-white/10 p-4">
              <h2 className="atlas-card-title text-white">Participantes com interesse no Kit Oficial</h2>
              <p className="mt-1 text-sm text-atlas-text-muted">Dados consolidados automaticamente a partir do cadastro de participantes.</p>
            </div>
            <div className="atlas-table-scroll custom-scrollbar">
              <table className="atlas-admin-table min-w-[980px]">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Nome de guerra</th>
                    <th>Contato</th>
                    <th>Camiseta</th>
                    <th>Jaqueta</th>
                    <th>Calça</th>
                    <th>Medidas</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.kitParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-atlas-text-muted">Nenhum interesse em kit registrado.</td>
                    </tr>
                  ) : (
                    summary.kitParticipants.map((participant) => (
                      <tr key={participant.id || participant.phone || participant.name}>
                        <td className="font-semibold text-white">{participant.name}</td>
                        <td className="text-atlas-gold-main">{participant.nickname || "-"}</td>
                        <td className="text-atlas-text-muted">{participant.phone || participant.email || "-"}</td>
                        <td>{participant.officialKit?.shirtSize || "-"}</td>
                        <td>{participant.officialKit?.jacketSize || "-"}</td>
                        <td>{participant.officialKit?.pantsSize || "-"}</td>
                        <td className="text-atlas-text-muted">
                          {participant.officialKit?.heightCm ? `${participant.officialKit.heightCm}cm` : "-"}
                          {participant.officialKit?.approximateWeightKg ? ` / ${participant.officialKit.approximateWeightKg}kg` : ""}
                        </td>
                        <td>
                          <span className="rounded border border-atlas-gold-main/30 bg-atlas-gold-main/10 px-2 py-1 text-[10px] font-bold uppercase text-atlas-gold-main">
                            {participant.officialKit?.interest === "yes" ? "Confirmado" : "Talvez"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="atlas-table-card">
            <div className="border-b border-white/10 p-4">
              <h2 className="atlas-card-title text-white">Solicitações de souvenirs</h2>
              <p className="mt-1 text-sm text-atlas-text-muted">Registros feitos pelo botão “Tenho interesse” na página pública.</p>
            </div>
            <div className="atlas-table-scroll custom-scrollbar">
              <table className="atlas-admin-table min-w-[980px]">
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Nome de guerra</th>
                    <th>Contato</th>
                    <th>Item</th>
                    <th className="text-center">Qtd.</th>
                    <th>Tamanhos</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {interests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-atlas-text-muted">Nenhuma solicitação avulsa registrada.</td>
                    </tr>
                  ) : (
                    summary.interestRows.map(({ interest, participant, shirtSize, jacketSize, pantsSize }) => (
                      <tr key={interest.id || `${interest.participantId}-${interest.souvenirId}`}>
                        <td className="font-semibold text-white">{participant?.name || interest.participantName}</td>
                        <td className="text-atlas-gold-main">{participant?.nickname || interest.warName || "-"}</td>
                        <td className="text-atlas-text-muted">{participant?.phone || participant?.email || interest.contactPhone || interest.contactEmail || "-"}</td>
                        <td>{interest.souvenirName}</td>
                        <td className="text-center font-black text-white">{interest.quantity}</td>
                        <td className="text-atlas-text-muted">
                          C: {shirtSize || "-"} / J: {jacketSize || "-"} / Calça: {pantsSize || "-"}
                        </td>
                        <td>
                          <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold uppercase text-atlas-text-muted">
                            {interest.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
