"use client";

import { Briefcase, Plus } from "lucide-react";

export default function AdminFornecedores() {
  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="atlas-admin-title flex items-center text-white">
          <Briefcase className="w-6 h-6 mr-3 text-atlas-gold-main" />
          Fornecedores
        </h1>
        <button 
          className="flex w-full cursor-not-allowed items-center justify-center rounded bg-atlas-gold-main px-4 py-2 text-sm font-bold uppercase tracking-wider text-atlas-navy-deep opacity-50 transition-colors hover:bg-atlas-gold-dark sm:w-auto"
          disabled
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Fornecedor
        </button>
      </div>

      <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-6 text-center shadow-lg sm:p-12">
        <Briefcase className="w-16 h-16 text-atlas-navy-aero mx-auto mb-4 opacity-50" />
        <h2 className="atlas-section-title mb-2 text-white">Módulo em Construção</h2>
        <p className="text-atlas-text-muted max-w-md mx-auto">
          O cadastro de buffets, locais, bandas e fotógrafos será implementado em breve.
        </p>
      </div>
    </div>
  );
}
