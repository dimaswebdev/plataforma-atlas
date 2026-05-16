"use client";

import { Briefcase, Plus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton, AdminPage } from "@/components/admin";

export default function AdminFornecedores() {
  return (
    <AdminPage>
      <AdminPageHeader
        title="Fornecedores"
        icon={Briefcase}
        description="Área reservada para fornecedores, orçamentos e contatos de apoio ao evento."
        actions={
          <AdminButton
            className="w-full text-white sm:w-auto"
            startIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
            disabled
          >
            Novo fornecedor
          </AdminButton>
        }
      />

      <AdminEmptyState
        icon={Briefcase}
        title="Módulo em construção"
        description="O cadastro de buffets, locais, bandas e fotógrafos será implementado em breve."
      />
    </AdminPage>
  );
}


