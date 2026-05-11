"use client";

import { Settings, Save } from "lucide-react";

export default function AdminConfiguracoes() {
  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center text-xl font-bold uppercase tracking-wider text-white sm:text-2xl">
          <Settings className="w-6 h-6 mr-3 text-atlas-gold-main" />
          Configurações do Evento
        </h1>
        <button 
          className="flex w-full cursor-not-allowed items-center justify-center rounded bg-atlas-gold-main px-4 py-2 text-sm font-bold uppercase tracking-wider text-atlas-navy-deep opacity-50 transition-colors hover:bg-atlas-gold-dark sm:w-auto"
          disabled
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </button>
      </div>

      <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-6 text-center shadow-lg sm:p-12">
        <Settings className="w-16 h-16 text-atlas-navy-aero mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">Módulo em Construção</h2>
        <p className="text-atlas-text-muted max-w-md mx-auto">
          A configuração de links externos (WhatsApp, etc) e edição do texto principal estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
