"use client";

import { useState } from "react";
import { AdminButton } from "./AdminButton";
import { AdminField, AdminInput, AdminLabel } from "./AdminInput";
import { AdminModal } from "./AdminModal";
import { AdminSelect } from "./AdminSelect";
import { fetchWithAdminAuth } from "@/lib/client-auth";
import type { Transaction } from "@/types/transaction";

interface TransactionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const transactionTypeOptions = [
  { value: "income", label: "Entrada (+)" },
  { value: "expense", label: "Saída (-)" },
];

const paymentMethodOptions = [
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
  { value: "cartao", label: "Cartão" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "outro", label: "Outro" },
];

const categoryOptions = [
  { value: "adesao", label: "Adesão/Cota" },
  { value: "souvenir", label: "Venda Souvenir" },
  { value: "buffet", label: "Buffet/Comida" },
  { value: "salao", label: "Salão/Local" },
  { value: "decoracao", label: "Decoração" },
  { value: "som", label: "Som/Iluminação" },
  { value: "foto_video", label: "Foto/Vídeo" },
  { value: "transporte", label: "Transporte" },
  { value: "fornecedor", label: "Fornecedor Diverso" },
  { value: "outros", label: "Outros" },
];

export function TransactionForm({ onClose, onSuccess }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const payload = {
        type: formData.get("type") as "income" | "expense",
        date: formData.get("date") as string,
        description: formData.get("description") as string,
        amount: parseFloat(formData.get("amount") as string),
        category: formData.get("category") as Transaction["category"],
        paymentMethod: formData.get("paymentMethod") as Transaction["paymentMethod"],
        isPublic: formData.get("isPublic") === "true",
      };

      const res = await fetchWithAdminAuth("/api/data?collection=transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save transaction");

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(`Erro ao salvar transação: ${message}`);
      setLoading(false);
    }
  }

  return (
    <AdminModal
      open
      onClose={onClose}
      title="Nova transação"
      description="Registre uma entrada ou saída para o controle administrativo."
      size="md"
      closeOnEscape={!loading}
      closeOnOverlayClick={!loading}
      showCloseButton={!loading}
    >
      {error ? (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 p-3 text-center text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-500">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminField label="Tipo">
            <AdminSelect name="type" options={transactionTypeOptions} defaultValue="income" required />
          </AdminField>
          <AdminField label="Data">
            <AdminInput type="date" name="date" required />
          </AdminField>
        </div>

        <AdminField label="Descrição">
          <AdminInput
            type="text"
            name="description"
            placeholder="Ex: Pagamento fornecedor X"
            required
          />
        </AdminField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminField label="Valor (R$)">
            <AdminInput type="number" step="0.01" min="0.01" name="amount" placeholder="0.00" required />
          </AdminField>
          <AdminField label="Método">
            <AdminSelect name="paymentMethod" options={paymentMethodOptions} defaultValue="pix" required />
          </AdminField>
        </div>

        <AdminField label="Categoria">
          <AdminSelect name="category" options={categoryOptions} defaultValue="adesao" required />
        </AdminField>

        <div className="pt-2">
          <AdminLabel className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03]">
            <input
              type="checkbox"
              name="isPublic"
              value="true"
              defaultChecked
              className="mt-0.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Transação pública, visível em Prestação de Contas
            </span>
          </AdminLabel>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
          <AdminButton type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" loading={loading} className="text-white">
            Salvar
          </AdminButton>
        </div>
      </form>
    </AdminModal>
  );
}


