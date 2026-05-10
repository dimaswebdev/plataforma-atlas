"use client";

import { useState } from "react";
import { createTransaction } from "@/data/transactions";
import { X } from "lucide-react";

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
      await createTransaction({
        type: formData.get("type") as "income" | "expense",
        date: formData.get("date") as string,
        description: formData.get("description") as string,
        amount: parseFloat(formData.get("amount") as string),
        category: formData.get("category") as any,
        paymentMethod: formData.get("paymentMethod") as any,
        isPublic: formData.get("isPublic") === "true"
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError("Erro ao salvar transação: " + err.message);
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-atlas-navy-deep w-full max-w-md rounded-lg border border-atlas-navy-aero/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-atlas-navy-aero/30 bg-atlas-navy-base">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Nova Transação</h2>
          <button onClick={onClose} className="text-atlas-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="isPublic" value="true" defaultChecked className="rounded text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base border-atlas-navy-aero/50" />
                <span className="text-white text-sm">Transação Pública (Aparece em Prestação de Contas)</span>
              </label>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm text-atlas-text-muted hover:text-white transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 bg-atlas-gold-main text-atlas-navy-deep font-bold rounded hover:bg-atlas-gold-dark transition-colors text-sm uppercase tracking-wider disabled:opacity-70"
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
