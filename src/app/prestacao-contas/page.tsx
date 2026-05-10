"use client";

import { useEffect, useState } from "react";
import { getEventData } from "@/data/events";
import { getFinancialSummary, getPublicTransactions } from "@/data/transactions";
import { FinancialSummary } from "@/components/public/FinancialSummary";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PageHeader } from "@/components/public/PageHeader";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { Event } from "@/types/event";
import { Transaction } from "@/types/transaction";

export default function PrestacaoContasPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [financial, setFinancial] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [eventData, fin, trans] = await Promise.all([
          getEventData(),
          getFinancialSummary(),
          getPublicTransactions()
        ]);
        
        // Sort descending by date
        trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setEvent(eventData);
        setFinancial(fin);
        setTransactions(trans);
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
      <main className="flex-grow py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">

        <div className="mb-12">
          <FinancialSummary 
            goal={event.budgetGoal} 
            income={financial.totalIncome}
            expense={financial.totalExpense}
            balance={financial.balance}
          />
        </div>

        <div className="bg-atlas-navy-deep rounded-lg border border-atlas-navy-aero/30 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-atlas-navy-aero/30 bg-atlas-navy-base/50">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Movimentações Públicas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-atlas-text-light">
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
