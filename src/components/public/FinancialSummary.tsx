import { formatCurrencyBRL } from "@/lib/utils";
import { Wallet, TrendingUp, DollarSign } from "lucide-react";

interface FinancialSummaryProps {
  goal: number;
  income: number;
  expense: number;
  balance: number;
}

export function FinancialSummary({ goal, income, expense, balance }: FinancialSummaryProps) {
  const percentage = goal > 0 ? Math.min(Math.round((income / goal) * 100), 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex min-w-0 items-center gap-4 rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-5 shadow-sm sm:p-6">
        <div className="p-3 bg-atlas-gold-main/10 rounded-full border border-atlas-gold-main/30">
          <Wallet className="w-6 h-6 text-atlas-gold-main" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-atlas-text-muted uppercase tracking-wider">Meta</p>
          <p className="break-words text-lg font-bold text-white sm:text-xl">{formatCurrencyBRL(goal)}</p>
        </div>
      </div>
      
      <div className="flex min-w-0 items-center gap-4 rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-5 shadow-sm sm:p-6">
        <div className="p-3 bg-green-900/30 rounded-full border border-green-500/30">
          <TrendingUp className="w-6 h-6 text-green-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-atlas-text-muted uppercase tracking-wider">Arrecadado</p>
          <p className="break-words text-lg font-bold text-white sm:text-xl">{formatCurrencyBRL(income)}</p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-4 rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-5 shadow-sm sm:p-6">
        <div className="p-3 bg-red-900/30 rounded-full border border-red-500/30">
          <DollarSign className="w-6 h-6 text-red-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-atlas-text-muted uppercase tracking-wider">Despesas</p>
          <p className="break-words text-lg font-bold text-white sm:text-xl">{formatCurrencyBRL(expense)}</p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-4 rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-5 shadow-sm sm:p-6">
        <div className="p-3 bg-blue-900/30 rounded-full border border-blue-500/30">
          <Wallet className="w-6 h-6 text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-atlas-text-muted uppercase tracking-wider">Saldo</p>
          <p className="break-words text-lg font-bold text-white sm:text-xl">{formatCurrencyBRL(balance)}</p>
        </div>
      </div>

      <div className="col-span-1 mt-2 sm:col-span-2 lg:col-span-4 lg:mt-4">
        <div className="flex justify-between text-sm text-atlas-text-muted mb-2">
          <span>Progresso da Arrecadação</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-atlas-navy-deep rounded-full h-2.5 border border-atlas-navy-aero/30 overflow-hidden">
          <div className="bg-atlas-gold-main h-2.5 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}
