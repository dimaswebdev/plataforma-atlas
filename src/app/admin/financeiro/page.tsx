"use client";

import { useEffect, useState } from "react";
import { DollarSign, Plus } from "lucide-react";
import { TransactionForm } from "@/components/admin/TransactionForm";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminDataTable,
  AdminPage,
  AdminPageHeader,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin";
import { fetchWithAdminAuth } from "@/lib/client-auth";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";

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
      data.forEach((transaction) => {
        if (transaction.type === "income") total += transaction.amount;
        if (transaction.type === "expense") total -= transaction.amount;
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
    <AdminPage>
      <AdminPageHeader
        title="Controle financeiro"
        icon={DollarSign}
        description="Registre entradas e saídas, acompanhe visibilidade pública e mantenha o saldo operacional atualizado."
        actions={
          <AdminButton
            onClick={() => setShowForm(true)}
            className="w-full text-white sm:w-auto"
            startIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
          >
            Nova transação
          </AdminButton>
        }
      />

      <AdminCard className="mb-6 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Saldo atual
            </p>
            <p
              className={`mt-2 break-words text-title-sm font-semibold tracking-tight ${
                balance >= 0
                  ? "text-success-600 dark:text-success-500"
                  : "text-error-600 dark:text-error-500"
              }`}
            >
              {formatCurrencyBRL(balance)}
            </p>
          </div>
          <p className="max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
            Valor calculado a partir das transações registradas nesta área administrativa.
          </p>
        </div>
      </AdminCard>

      <div className="space-y-3 md:hidden">
        {loading ? (
          <AdminCard className="p-6 text-center text-gray-500 dark:text-gray-400">
            Carregando...
          </AdminCard>
        ) : transactions.length === 0 ? (
          <AdminCard className="p-6 text-center text-gray-500 dark:text-gray-400">
            Nenhuma transação registrada.
          </AdminCard>
        ) : (
          transactions.map((transaction) => (
            <AdminCard key={transaction.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    {formatDateBR(transaction.date)}
                  </p>
                  <h2 className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">
                    {transaction.description}
                  </h2>
                  <p className="mt-1 text-xs capitalize text-gray-500 dark:text-gray-400">
                    {transaction.category.replace("_", " ")}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-right text-sm font-semibold ${
                    transaction.type === "income"
                      ? "text-success-600 dark:text-success-500"
                      : "text-error-600 dark:text-error-500"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"} {formatCurrencyBRL(transaction.amount)}
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <AdminBadge color={transaction.isPublic ? "success" : "dark"} size="sm">
                  {transaction.isPublic ? "Pública" : "Oculta"}
                </AdminBadge>
              </div>
            </AdminCard>
          ))
        )}
      </div>

      <AdminDataTable
        sectionClassName="hidden md:block"
        title="Lançamentos financeiros"
        description="Entradas e saídas registradas pela administração."
        colSpan={5}
        loading={loading}
        loadingLabel="Carregando lançamentos..."
        empty={transactions.length === 0}
        emptyLabel="Nenhuma transação registrada."
        footerConfig={{
          displayedCount: transactions.length,
          totalCount: transactions.length,
        }}
        minWidth={720}
        columns={
          <>
            <AdminTableHead>Data</AdminTableHead>
            <AdminTableHead>Descrição</AdminTableHead>
            <AdminTableHead>Categoria</AdminTableHead>
            <AdminTableHead className="text-center">Visibilidade</AdminTableHead>
            <AdminTableHead className="text-right">Valor</AdminTableHead>
          </>
        }
      >
        {transactions.map((transaction) => (
          <AdminTableRow key={transaction.id}>
            <AdminTableCell className="whitespace-nowrap">
              {formatDateBR(transaction.date)}
            </AdminTableCell>
            <AdminTableCell className="font-medium text-gray-900 dark:text-white">
              {transaction.description}
            </AdminTableCell>
            <AdminTableCell className="capitalize text-gray-500 dark:text-gray-400">
              {transaction.category.replace("_", " ")}
            </AdminTableCell>
            <AdminTableCell className="text-center">
              <AdminBadge color={transaction.isPublic ? "success" : "dark"} size="sm">
                {transaction.isPublic ? "Pública" : "Oculta"}
              </AdminBadge>
            </AdminTableCell>
            <AdminTableCell
              className={`whitespace-nowrap text-right font-semibold ${
                transaction.type === "income"
                  ? "text-success-600 dark:text-success-500"
                  : "text-error-600 dark:text-error-500"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"} {formatCurrencyBRL(transaction.amount)}
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminDataTable>

      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            void load();
          }}
        />
      )}
    </AdminPage>
  );
}

