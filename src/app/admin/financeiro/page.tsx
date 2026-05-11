"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@/types/transaction";
import { DollarSign, Plus } from "lucide-react";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { TransactionForm } from "@/components/admin/TransactionForm";
import { fetchWithAdminAuth } from "@/lib/client-auth";

export default function AdminFinanceiro() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchWithAdminAuth("/api/data?collection=transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = (await res.json()) as Transaction[];
      
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let total = 0;
      data.forEach((t) => {
        if(t.type === 'income') total += t.amount;
        if(t.type === 'expense') total -= t.amount;
      });

      setTransactions(data);
      setBalance(total);
    } catch (err) {
      console.error("Error loading transactions", err);
      setTransactions([]);
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

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center text-xl font-bold uppercase tracking-wider text-white sm:text-2xl">
          <DollarSign className="w-6 h-6 mr-3 text-atlas-gold-main" />
          Controle Financeiro
        </h1>
        <button 
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center rounded bg-atlas-gold-main px-4 py-2 text-sm font-bold uppercase tracking-wider text-atlas-navy-deep transition-colors hover:bg-atlas-gold-dark sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </button>
      </div>

      <div className="mb-8 flex items-center justify-between rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-5 sm:p-6">
        <div>
          <p className="text-sm text-atlas-text-muted uppercase tracking-wider">Saldo Atual</p>
          <p className={`break-words text-2xl font-bold sm:text-3xl ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrencyBRL(balance)}
          </p>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-6 text-center text-atlas-text-muted">Carregando...</div>
        ) : transactions.length === 0 ? (
          <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-6 text-center text-atlas-text-muted">Nenhuma transaÃ§Ã£o registrada.</div>
        ) : (
          transactions.map((t) => (
            <article key={t.id} className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-4 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-atlas-text-muted">{formatDateBR(t.date)}</p>
                  <h2 className="mt-1 text-sm font-bold text-white">{t.description}</h2>
                  <p className="mt-1 text-xs capitalize text-atlas-text-muted">{t.category.replace('_', ' ')}</p>
                </div>
                <span className={`shrink-0 text-right text-sm font-black ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {t.type === 'income' ? '+' : '-'} {formatCurrencyBRL(t.amount)}
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <span className={`rounded border px-2 py-1 text-[10px] uppercase tracking-wider ${t.isPublic ? 'border-green-500/30 bg-green-900/30 text-green-400' : 'border-atlas-navy-aero/50 bg-atlas-navy-base text-atlas-text-muted'}`}>
                  {t.isPublic ? 'PÃºblica' : 'Oculta'}
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep shadow-lg md:block">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[720px] text-left text-sm text-atlas-text-light">
            <thead className="bg-atlas-navy-base text-atlas-text-muted uppercase tracking-wider text-xs border-b border-atlas-navy-aero/30">
              <tr>
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Descrição</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold text-center">Visibilidade</th>
                <th className="px-6 py-4 font-semibold text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-atlas-navy-aero/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-atlas-text-muted">Carregando...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-atlas-text-muted">Nenhuma transação registrada.</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-atlas-navy-base/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{formatDateBR(t.date)}</td>
                    <td className="px-6 py-4 font-medium text-white">{t.description}</td>
                    <td className="px-6 py-4 capitalize text-atlas-text-muted">{t.category.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider ${t.isPublic ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-atlas-navy-base text-atlas-text-muted border border-atlas-navy-aero/50'}`}>
                        {t.isPublic ? 'Pública' : 'Oculta'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrencyBRL(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TransactionForm 
          onClose={() => setShowForm(false)} 
          onSuccess={() => { load(); }} 
        />
      )}
    </div>
  );
}
