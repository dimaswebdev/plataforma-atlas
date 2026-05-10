"use client";

import { useEffect, useState } from "react";
import { getPublicTransactions } from "@/data/transactions"; 
import { Transaction } from "@/types/transaction";
import { DollarSign, Plus } from "lucide-react";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import { TransactionForm } from "@/components/admin/TransactionForm";

export default function AdminFinanceiro() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    // Fetching all transactions for admin
    const q = query(collection(db, "events", DEFAULT_EVENT_ID, "transactions"));
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let total = 0;
    data.forEach(t => {
      if(t.type === 'income') total += t.amount;
      if(t.type === 'expense') total -= t.amount;
    });

    setTransactions(data);
    setBalance(total);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center">
          <DollarSign className="w-6 h-6 mr-3 text-atlas-gold-main" />
          Controle Financeiro
        </h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-atlas-gold-main text-atlas-navy-deep px-4 py-2 rounded font-bold uppercase tracking-wider text-sm flex items-center hover:bg-atlas-gold-dark transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </button>
      </div>

      <div className="bg-atlas-navy-deep p-6 rounded-lg border border-atlas-navy-aero/30 mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm text-atlas-text-muted uppercase tracking-wider">Saldo Atual</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrencyBRL(balance)}
          </p>
        </div>
      </div>

      <div className="bg-atlas-navy-deep rounded-lg border border-atlas-navy-aero/30 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-atlas-text-light">
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
