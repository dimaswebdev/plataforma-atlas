"use client";

import { Settings, Save } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminConfiguracoes() {
  return (
    <div className="atlas-admin-page">
      <AdminPageHeader
        title="Configurações do evento"
        icon={Settings}
        description="Área reservada para preferências gerais, links externos e textos operacionais da plataforma."
        actions={
          <button className="atlas-primary-button w-full sm:w-auto" disabled>
            <Save className="h-4 w-4" />
            Salvar alterações
          </button>
        }
      />

      <AdminEmptyState
        icon={Settings}
        title="Módulo em construção"
        description="A configuração de links externos e edição do texto principal estará disponível em breve."
      />
    </div>
  );
}
