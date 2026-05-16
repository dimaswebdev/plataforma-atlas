"use client";

import { Megaphone, Plus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton, AdminPage } from "@/components/admin";

export default function AdminComunicados() {
  return (
    <AdminPage>
      <AdminPageHeader
        title="Comunicados"
        icon={Megaphone}
        description="Área reservada para avisos oficiais, informes fixados e mensagens da comissão."
        actions={
          <AdminButton
            className="w-full text-white sm:w-auto"
            startIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
            disabled
          >
            Novo aviso
          </AdminButton>
        }
      />

      <AdminEmptyState
        icon={Megaphone}
        title="Módulo em construção"
        description="A criação de comunicados oficiais e avisos fixados será liberada na próxima fase."
      />
    </AdminPage>
  );
}




