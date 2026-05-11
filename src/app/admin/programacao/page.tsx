"use client";

import { Calendar, Plus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminProgramacao() {
  return (
    <div className="atlas-admin-page">
      <AdminPageHeader
        title="Programação"
        icon={Calendar}
        description="Área reservada para montar cronograma, horários e atividades oficiais do evento."
        actions={
          <button className="atlas-primary-button w-full sm:w-auto" disabled>
            <Plus className="h-4 w-4" />
            Novo evento
          </button>
        }
      />

      <AdminEmptyState
        icon={Calendar}
        title="Módulo em construção"
        description="O gerenciamento do cronograma oficial estará disponível em breve."
      />
    </div>
  );
}
