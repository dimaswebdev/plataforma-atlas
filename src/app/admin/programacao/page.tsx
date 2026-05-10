"use client";

import { Calendar, Plus } from "lucide-react";

export default function AdminProgramacao() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-atlas-gold-main" />
          Programação
        </h1>
        <button 
          className="bg-atlas-gold-main text-atlas-navy-deep px-4 py-2 rounded font-bold uppercase tracking-wider text-sm flex items-center hover:bg-atlas-gold-dark transition-colors opacity-50 cursor-not-allowed"
          disabled
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </button>
      </div>

      <div className="bg-atlas-navy-deep rounded-lg border border-atlas-navy-aero/30 shadow-lg p-12 text-center">
        <Calendar className="w-16 h-16 text-atlas-navy-aero mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">Módulo em Construção</h2>
        <p className="text-atlas-text-muted max-w-md mx-auto">
          O gerenciamento do cronograma oficial estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
