"use client";

import { useState } from "react";
import { Transaction } from "@/types/transaction";
import { X } from "lucide-react";
import { fetchWithAdminAuth } from "@/lib/client-auth";

interface TransactionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

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
        isPublic: formData.get("isPublic") === "true"
      };

      const res = await fetchWithAdminAuth("/api/data?collection=transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save transaction");

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError("Erro ao salvar transação: " + message);
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep shadow-2xl">
        <div className="flex items-center justify-between border-b border-atlas-navy-aero/30 bg-atlas-navy-base p-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Nova Transação</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-atlas-text-muted transition-colors hover:bg-white/5 hover:text-white" aria-label="Fechar modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Tipo</label>
                <select name="type" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-atlas-gold-main" required>
                  <option value="income">Entrada (+)</option>
                  <option value="expense">Saída (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Data</label>
                <input type="date" name="date" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-atlas-gold-main" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Descrição</label>
              <input type="text" name="description" placeholder="Ex: Pagamento Fornecedor X" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-atlas-gold-main" required />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Valor (R$)</label>
                <input type="number" step="0.01" min="0.01" name="amount" placeholder="0.00" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-atlas-gold-main" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Método</label>
                <select name="paymentMethod" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-atlas-gold-main" required>
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                  <option value="transferencia">Transferência</option>
                  <option value="cartao">Cartão</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Categoria</label>
              <select name="category" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-atlas-gold-main" required>
                <option value="adesao">Adesão/Cota</option>
                <option value="souvenir">Venda Souvenir</option>
                <option value="buffet">Buffet/Comida</option>
                <option value="salao">Salão/Local</option>
                <option value="decoracao">Decoração</option>
                <option value="som">Som/Iluminação</option>
                <option value="foto_video">Foto/Vídeo</option>
                <option value="transporte">Transporte</option>
                <option value="fornecedor">Fornecedor Diverso</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2">
                <input type="checkbox" name="isPublic" value="true" defaultChecked className="rounded text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base border-atlas-navy-aero/50" />
                <span className="text-white text-sm">Transação Pública (Aparece em Prestação de Contas)</span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
              <button 
                type="button" 
                onClick={onClose}
                className="rounded px-4 py-2 text-sm text-atlas-text-muted transition-colors hover:bg-white/5 hover:text-white"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="rounded bg-atlas-gold-main px-6 py-2 text-sm font-bold uppercase tracking-wider text-atlas-navy-deep transition-colors hover:bg-atlas-gold-dark disabled:opacity-70"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
