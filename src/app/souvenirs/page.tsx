"use client";

import { FormEvent, useEffect, useState } from "react";
import { SouvenirCard } from "@/components/public/SouvenirCard";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Souvenir } from "@/types/souvenir";
import { PageHeader } from "@/components/public/PageHeader";
import { formatCurrencyBRL } from "@/lib/utils";
import { CheckCircle, Package, X } from "lucide-react";

export default function SouvenirsPage() {
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSouvenir, setSelectedSouvenir] = useState<Souvenir | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setError("");
      try {
        const res = await fetch("/api/data?collection=souvenirs");
        if (!res.ok) throw new Error("Não foi possível carregar os souvenirs.");
        const data = (await res.json()) as Souvenir[];
        setSouvenirs(data);
      } catch (err) {
        console.error("Error loading souvenirs", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar souvenirs.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleInterestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSouvenir?.id) return;

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      participantName: String(formData.get("participantName") || ""),
      warName: String(formData.get("warName") || ""),
      contactPhone: String(formData.get("contactPhone") || ""),
      contactEmail: String(formData.get("contactEmail") || ""),
      souvenirId: selectedSouvenir.id,
      souvenirName: selectedSouvenir.name,
      souvenirCategory: selectedSouvenir.category || "other",
      quantity: Number(formData.get("quantity") || 1),
      shirtSize: String(formData.get("shirtSize") || ""),
      pantsSize: String(formData.get("pantsSize") || ""),
      jacketSize: String(formData.get("jacketSize") || ""),
      notes: String(formData.get("notes") || ""),
    };

    try {
      const res = await fetch("/api/data?collection=souvenirInterests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Não foi possível registrar seu interesse.");
      }

      setSubmitSuccess("Interesse registrado com sucesso. A comissão poderá usar estes dados para consolidar a demanda.");
      setSelectedSouvenir(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao registrar interesse.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-atlas-navy-base">
      <PublicNav />
      <PageHeader
        bgImage="/images/bg-souvenirs.png"
        accent="Loja Oficial"
        title="Souvenirs Oficiais"
        subtitle="Itens comemorativos dos 30 anos da Turma ATLAS. Registre seu interesse para ajudar a comissão a consolidar quantidades e tamanhos."
      />
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 md:px-8 md:py-12">
        <div className="mb-8 flex flex-col gap-4 rounded-lg border border-atlas-navy-aero/25 bg-atlas-navy-deep/70 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="atlas-kicker text-atlas-gold-main">Catálogo e demanda</p>
            <h2 className="atlas-section-title mt-2 text-white">Itens cadastrados pela comissão</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-atlas-text-muted">
              Itens em definição aparecem no catálogo para planejamento, mas só itens disponíveis aceitam solicitação.
            </p>
          </div>
          <div className="rounded border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-atlas-text-muted">
            {souvenirs.length} item(ns) no catálogo
          </div>
        </div>

        {submitSuccess && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-900/20 p-4 text-sm text-green-100">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
            {submitSuccess}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep px-4 py-14 text-center text-atlas-text-muted sm:py-20">
            <div className="atlas-loading-label animate-pulse">Carregando souvenirs...</div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/35 bg-red-950/30 px-4 py-12 text-center text-red-100">
            <p className="font-bold">{error}</p>
            <p className="mt-2 text-sm text-red-100/75">Tente novamente em instantes ou avise a comissão.</p>
          </div>
        ) : souvenirs.length === 0 ? (
          <div className="mx-auto max-w-3xl rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep px-5 py-14 text-center text-atlas-text-muted sm:py-16">
            <Package className="mx-auto mb-4 h-10 w-10 text-atlas-gold-main/70" />
            <p className="font-semibold text-white">Nenhum souvenir cadastrado ainda.</p>
            <p className="mt-2 text-sm">Assim que a comissão cadastrar itens, eles aparecerão nesta página.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
            {souvenirs.map((souvenir) => (
              <SouvenirCard
                key={souvenir.id}
                souvenir={souvenir}
                onInterest={setSelectedSouvenir}
              />
            ))}
          </div>
        )}
      </main>
      <PublicFooter />

      {selectedSouvenir && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#020617]/85 p-3 backdrop-blur-md sm:items-center sm:p-6">
          <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-atlas-navy-aero/40 bg-atlas-navy-deep shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-atlas-navy-aero/30 bg-atlas-navy-base p-4 sm:p-5">
              <div className="min-w-0">
                <p className="atlas-kicker text-atlas-gold-main">Tenho interesse</p>
                <h2 className="atlas-card-title mt-1 break-words text-white">{selectedSouvenir.name}</h2>
                <p className="mt-1 text-sm text-atlas-text-muted">{formatCurrencyBRL(Number(selectedSouvenir.price || 0))}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSouvenir(null)}
                className="rounded-lg p-2 text-atlas-text-muted transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInterestSubmit} className="atlas-public-form overflow-y-auto p-4 sm:p-6">
              {submitError && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-100">
                  {submitError}
                </div>
              )}

              <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm leading-relaxed text-atlas-text-muted">
                  {selectedSouvenir.description || "Item comemorativo cadastrado pela comissão."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="atlas-form-label">Nome completo *</label>
                  <input name="participantName" required />
                </div>
                <div>
                  <label className="atlas-form-label">Nome de guerra</label>
                  <input name="warName" />
                </div>
                <div>
                  <label className="atlas-form-label">Telefone/WhatsApp *</label>
                  <input name="contactPhone" type="tel" required placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="atlas-form-label">E-mail</label>
                  <input name="contactEmail" type="email" />
                </div>
                <div>
                  <label className="atlas-form-label">Quantidade *</label>
                  <input name="quantity" type="number" min="1" max="99" defaultValue="1" required />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="atlas-form-label">Camiseta</label>
                  <select name="shirtSize" defaultValue="">
                    <option value="">-</option>
                    {["PP", "P", "M", "G", "GG", "XG", "XGG", "SPECIAL"].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="atlas-form-label">Jaqueta</label>
                  <select name="jacketSize" defaultValue="">
                    <option value="">-</option>
                    {["PP", "P", "M", "G", "GG", "XG", "XGG", "SPECIAL"].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="atlas-form-label">Calça</label>
                  <select name="pantsSize" defaultValue="">
                    <option value="">-</option>
                    {["PP", "P", "M", "G", "GG", "XG", "XGG", "SPECIAL"].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="atlas-form-label">Observações</label>
                <textarea name="notes" rows={3} placeholder="Ex: preferência de cor, personalização, observações de medida..." />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-atlas-navy-aero/30 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSouvenir(null)}
                  className="atlas-muted-button"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="atlas-primary-button"
                  disabled={submitting}
                >
                  {submitting ? "Registrando..." : "Registrar interesse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
