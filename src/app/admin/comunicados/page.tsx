"use client";

import { Megaphone, Plus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminComunicados() {
  return (
    <div className="atlas-admin-page">
      <AdminPageHeader
        title="Comunicados"
        icon={Megaphone}
        description="Área reservada para avisos oficiais, informes fixados e mensagens da comissão."
        actions={
          <button className="atlas-primary-button w-full sm:w-auto" disabled>
            <Plus className="h-4 w-4" />
            Novo aviso
          </button>
        }
      />

      <AdminEmptyState
        icon={Megaphone}
        title="Módulo em construção"
        description="A criação de comunicados oficiais e avisos fixados será liberada na próxima fase."
      />
    </div>
  );
}
