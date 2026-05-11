"use client";

import { useEffect, useState } from "react";
import { FinancialSummary } from "@/components/public/FinancialSummary";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PageHeader } from "@/components/public/PageHeader";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { Event } from "@/types/event";
import { Transaction } from "@/types/transaction";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrestacaoContasPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [financial, setFinancial] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [eventRes, statsRes, transRes] = await Promise.all([
          fetch("/api/event-data"),
          fetch("/api/public/summary"),
          fetch("/api/data?collection=transactions")
        ]);
        
        const eventData = await eventRes.json();
        const stats = await statsRes.json();
        const trans = await transRes.json();
        
        // Sort descending by date
        const sortedTransactions = (trans as Transaction[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setEvent(eventData.event);
        setFinancial({
          totalIncome: stats.totalIncome,
          totalExpense: stats.totalExpense,
          balance: stats.balance
        });
        setTransactions(sortedTransactions.filter((t) => t.isPublic !== false));
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
      <div className="flex flex-col min-h-screen items-center justify-center bg-atlas-navy-base">
        <h1 className="text-xl text-atlas-gold-main uppercase tracking-wider animate-pulse">Carregando...</h1>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="flex flex-col min-h-screen bg-atlas-navy-base">
      <PublicNav />
      <PageHeader
        bgImage="/images/bg-financeiro.png"
        accent="Comissão Organizadora"
        title="Prestação de Contas"
        subtitle="Acompanhe a evolução financeira do nosso reencontro. A transparência é um compromisso da comissão organizadora."
      />
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 md:px-8 md:py-12">
        {/* AVISO DE TRANSPARÊNCIA */}
        <div className="mb-8 flex flex-col gap-4 rounded-lg border border-atlas-gold-main/20 bg-atlas-gold-main/5 p-4 sm:flex-row sm:items-center">
          <div className="p-2 bg-atlas-gold-main/10 rounded-full shrink-0">
            <ShieldCheck className="w-5 h-5 text-atlas-gold-main" />
          </div>
          <p className="text-xs text-atlas-text-light leading-relaxed">
            <span className="font-bold text-atlas-gold-main uppercase tracking-widest block mb-1">Aviso de Privacidade</span>
            A prestação de contas pública apresenta dados consolidados e não expõe informações individuais de participantes, pagadores ou inadimplentes, em conformidade com nossa <Link href="/politica-privacidade" className="text-atlas-gold-main underline hover:text-atlas-gold-dark">Política de Privacidade</Link>.
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
          <div className="px-6 py-4 border-b border-atlas-navy-aero/30 bg-atlas-navy-base/50">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Movimentações Públicas</h2>
          </div>
          <div className="space-y-3 p-4 md:hidden">
            {transactions.length === 0 ? (
              <div className="rounded border border-white/5 bg-white/[0.03] p-4 text-center text-sm text-atlas-text-muted">
                Nenhuma movimentaÃ§Ã£o pÃºblica registrada ainda.
              </div>
            ) : (
              transactions.map((t) => (
                <article key={t.id} className="rounded border border-white/5 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-atlas-text-muted">{formatDateBR(t.date)}</p>
                      <h3 className="mt-1 text-sm font-bold text-white">{t.description}</h3>
                      <p className="mt-1 text-xs capitalize text-atlas-text-muted">{t.category.replace('_', ' ')}</p>
                    </div>
                    <span className={`shrink-0 text-right text-sm font-black ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrencyBRL(t.amount)}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
          <div className="hidden overflow-x-auto custom-scrollbar md:block">
            <table className="w-full text-left text-sm text-atlas-text-light min-w-[600px]">
              <thead className="bg-atlas-navy-base text-atlas-text-muted uppercase tracking-wider text-xs border-b border-atlas-navy-aero/30">
                <tr>
                  <th className="px-6 py-4 font-semibold">Data</th>
                  <th className="px-6 py-4 font-semibold">Descrição</th>
                  <th className="px-6 py-4 font-semibold">Categoria</th>
                  <th className="px-6 py-4 font-semibold text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-atlas-navy-aero/20">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-atlas-text-muted">
                      Nenhuma movimentação pública registrada ainda.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-atlas-navy-base/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{formatDateBR(t.date)}</td>
                      <td className="px-6 py-4">{t.description}</td>
                      <td className="px-6 py-4 capitalize">{t.category.replace('_', ' ')}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'} {formatCurrencyBRL(t.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
