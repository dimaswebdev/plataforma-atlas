"use client";

import { Briefcase, Plus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminFornecedores() {
  return (
    <div className="atlas-admin-page">
      <AdminPageHeader
        title="Fornecedores"
        icon={Briefcase}
        description="Área reservada para fornecedores, orçamentos e contatos de apoio ao evento."
        actions={
          <button className="atlas-primary-button w-full sm:w-auto" disabled>
            <Plus className="h-4 w-4" />
            Novo fornecedor
          </button>
        }
      />

      <AdminEmptyState
        icon={Briefcase}
        title="Módulo em construção"
        description="O cadastro de buffets, locais, bandas e fotógrafos será implementado em breve."
      />
    </div>
  );
}
