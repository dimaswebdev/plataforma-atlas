"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@/types/transaction";
import { DollarSign, Plus } from "lucide-react";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { TransactionForm } from "@/components/admin/TransactionForm";
import { fetchWithAdminAuth } from "@/lib/client-auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
        if(t.type === "income") total += t.amount;
        if(t.type === "expense") total -= t.amount;
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
    <div className="atlas-admin-page">
      <AdminPageHeader
        title="Controle financeiro"
        icon={DollarSign}
        description="Registre entradas e saídas, acompanhe visibilidade pública e mantenha o saldo operacional atualizado."
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="atlas-primary-button w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nova transação
          </button>
        }
      />

      <section className="atlas-admin-card mb-6 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="atlas-stat-card-label">Saldo atual</p>
            <p className={`atlas-feature-value mt-2 break-words ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatCurrencyBRL(balance)}
            </p>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-atlas-text-muted">
            Valor calculado a partir das transações registradas nesta área administrativa.
          </p>
        </div>
      </section>

      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="atlas-admin-card p-6 text-center text-atlas-text-muted">Carregando...</div>
        ) : transactions.length === 0 ? (
          <div className="atlas-admin-card p-6 text-center text-atlas-text-muted">Nenhuma transação registrada.</div>
        ) : (
          transactions.map((t) => (
            <article key={t.id} className="atlas-admin-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="atlas-stat-card-label">{formatDateBR(t.date)}</p>
                  <h2 className="mt-1 break-words text-sm font-bold text-white">{t.description}</h2>
                  <p className="mt-1 text-xs capitalize text-atlas-text-muted">{t.category.replace("_", " ")}</p>
                </div>
                <span className={`shrink-0 text-right text-sm font-black ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                  {t.type === "income" ? "+" : "-"} {formatCurrencyBRL(t.amount)}
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <span className={`rounded border px-2 py-1 text-[10px] uppercase ${t.isPublic ? "border-green-500/30 bg-green-900/30 text-green-400" : "border-atlas-navy-aero/50 bg-atlas-navy-base text-atlas-text-muted"}`}>
                  {t.isPublic ? "Pública" : "Oculta"}
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="atlas-table-card hidden md:block">
        <div className="atlas-table-scroll custom-scrollbar">
          <table className="atlas-admin-table min-w-[720px]">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th className="text-center">Visibilidade</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-atlas-text-muted">Carregando...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-atlas-text-muted">Nenhuma transação registrada.</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="whitespace-nowrap">{formatDateBR(t.date)}</td>
                    <td className="font-medium text-white">{t.description}</td>
                    <td className="capitalize text-atlas-text-muted">{t.category.replace("_", " ")}</td>
                    <td className="text-center">
                      <span className={`rounded px-2 py-1 text-[10px] uppercase ${t.isPublic ? "border border-green-500/30 bg-green-900/30 text-green-400" : "border border-atlas-navy-aero/50 bg-atlas-navy-base text-atlas-text-muted"}`}>
                        {t.isPublic ? "Pública" : "Oculta"}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap text-right font-bold ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                      {t.type === "income" ? "+" : "-"} {formatCurrencyBRL(t.amount)}
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
