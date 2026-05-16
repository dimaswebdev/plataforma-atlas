"use client";

import { Save, Settings } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton, AdminPage } from "@/components/admin";

export default function AdminConfiguracoes() {
  return (
    <AdminPage>
      <AdminPageHeader
        title="Configurações do evento"
        icon={Settings}
        description="Área reservada para preferências gerais, links externos e textos operacionais da plataforma."
        actions={
          <AdminButton
            className="w-full text-white sm:w-auto"
            startIcon={<Save className="h-4 w-4" aria-hidden="true" />}
            disabled
          >
            Salvar alterações
          </AdminButton>
        }
      />

      <AdminEmptyState
        icon={Settings}
        title="Módulo em construção"
        description="A configuração de links externos e edição do texto principal estará disponível em breve."
      />
    </AdminPage>
  );
}




