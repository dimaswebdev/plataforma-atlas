"use client";

import { useEffect, useState } from "react";
import { FinancialSummary } from "@/components/public/FinancialSummary";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PageHeader } from "@/components/public/PageHeader";
import { Event } from "@/types/event";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrestacaoContasPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [financial, setFinancial] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [eventRes, statsRes] = await Promise.all([
          fetch("/api/event-data"),
          fetch("/api/public/summary"),
        ]);

        const eventData = await eventRes.json();
        const stats = await statsRes.json();

        setEvent(eventData.event);
        setFinancial({
          totalIncome: stats.totalIncome,
          totalExpense: stats.totalExpense,
          balance: stats.balance,
        });
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-atlas-navy-base">
        <div className="atlas-loading-label animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="flex min-h-screen flex-col bg-atlas-navy-base">
      <PublicNav />
      <PageHeader
        bgImage="/images/bg-financeiro.png"
        accent="Comissão Organizadora"
        title="Prestação de Contas"
        subtitle="Acompanhe a evolução financeira do nosso reencontro. A transparência é um compromisso da comissão organizadora."
      />
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 md:px-8 md:py-12">
        <div className="mb-8 flex flex-col gap-4 rounded-lg border border-atlas-gold-main/20 bg-atlas-gold-main/5 p-4 sm:flex-row sm:items-center">
          <div className="shrink-0 rounded-full bg-atlas-gold-main/10 p-2">
            <ShieldCheck className="h-5 w-5 text-atlas-gold-main" />
          </div>
          <p className="text-xs leading-relaxed text-atlas-text-light">
            <span className="mb-1 block font-bold uppercase tracking-widest text-atlas-gold-main">Aviso de privacidade</span>
            A prestação de contas pública apresenta dados consolidados e não expõe informações individuais de participantes, pagadores, inadimplentes ou comprovantes, em conformidade com nossa{" "}
            <Link href="/politica-privacidade" className="text-atlas-gold-main underline hover:text-atlas-gold-dark">
              Política de Privacidade
            </Link>.
          </p>
        </div>

        <div className="mb-12">
          <FinancialSummary
            goal={event.budgetGoal}
            income={financial.totalIncome}
            expense={financial.totalExpense}
            balance={financial.balance}
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep shadow-lg">
          <div className="border-b border-atlas-navy-aero/30 bg-atlas-navy-base/50 px-6 py-4">
            <h2 className="atlas-section-title text-white">Resumo público consolidado</h2>
          </div>
          <div className="p-6 text-sm leading-relaxed text-atlas-text-muted">
            As movimentações detalhadas ficam restritas à comissão organizadora. A página pública exibe apenas valores consolidados para preservar dados financeiros internos, comprovantes e vínculos administrativos.
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
