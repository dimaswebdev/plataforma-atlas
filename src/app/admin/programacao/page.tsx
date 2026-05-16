"use client";

import { Calendar, Plus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton, AdminPage } from "@/components/admin";

export default function AdminProgramacao() {
  return (
    <AdminPage>
      <AdminPageHeader
        title="Programação"
        icon={Calendar}
        description="Área reservada para montar cronograma, horários e atividades oficiais do evento."
        actions={
          <AdminButton
            className="w-full text-white sm:w-auto"
            startIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
            disabled
          >
            Novo evento
          </AdminButton>
        }
      />

      <AdminEmptyState
        icon={Calendar}
        title="Módulo em construção"
        description="O gerenciamento do cronograma oficial estará disponível em breve."
      />
    </AdminPage>
  );
}



