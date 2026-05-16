# Design System Administrativo TailAdmin

## Objetivo

Centralizar a camada visual administrativa do ATLAS em componentes reutilizáveis inspirados no TailAdmin. As páginas internas não devem montar botões, cards, tabelas, modais, badges ou formulários com classes soltas quando houver um componente administrativo correspondente.

## Referência Auditada

Template local: `free-nextjs-admin-dashboard-main`

Padrões aproveitados:

- Layout interno com sidebar fixa, header superior, conteúdo em cinza muito claro e containers brancos.
- Cards com `rounded-2xl`, borda suave, sombra discreta, hover leve e suporte a dark mode.
- Tabelas com container branco destacado, cabeçalho em azul claro suave, linhas separadas, hover e estado vazio/loading.
- Botões primários azuis, outline neutro, ghost para ações iconográficas e estado loading.
- Badges semânticos para status: primary, success, warning, error, info, light e dark.
- Inputs/selects com altura consistente, borda cinza, foco azul e suporte a erro.
- Modais com overlay acima da sidebar/header, footer separado e botões no padrão TailAdmin.
- Tipografia administrativa baseada em Outfit e classes `text-theme-*` / `text-title-*`.

## Camadas

Base adaptada do TailAdmin:

- `src/components/ui-tailadmin/`

Wrappers genéricos do app:

- `src/components/ui/AppButton.tsx`
- `src/components/ui/AppBadge.tsx`
- `src/components/ui/AppCard.tsx`
- `src/components/ui/AppInput.tsx`
- `src/components/ui/AppSelect.tsx`
- `src/components/ui/AppModal.tsx`
- `src/components/ui/AppTable.tsx`
- `src/components/ui/AppPageHeader.tsx`
- `src/components/ui/AppSection.tsx`

Camada administrativa criada sobre os wrappers:

- `src/components/admin/AdminPage.tsx`
- `src/components/admin/AdminPageHeader.tsx`
- `src/components/admin/AdminSection.tsx`
- `src/components/admin/AdminMetricGrid.tsx`
- `src/components/admin/AdminMetricCard.tsx`
- `src/components/admin/AdminDataTable.tsx`
- `src/components/admin/AdminTableToolbar.tsx`
- `src/components/admin/AdminButton.tsx`
- `src/components/admin/AdminCard.tsx`
- `src/components/admin/AdminModal.tsx`
- `src/components/admin/AdminInput.tsx`
- `src/components/admin/AdminSelect.tsx`
- `src/components/admin/AdminBadge.tsx`
- `src/components/admin/AdminActionMenu.tsx`
- `src/components/admin/AdminEmptyState.tsx`

## Regra De Uso

Páginas em `src/app/admin/**` devem preferir a camada `@/components/admin`.

Uso esperado:

- Página: `AdminPage`
- Cabeçalho: `AdminPageHeader`
- Seção: `AdminSection`
- Métricas: `AdminMetricGrid` + `AdminMetricCard`
- Tabela: `AdminDataTable` + `AdminTableHead` + `AdminTableRow` + `AdminTableCell`
- Botões: `AdminButton`
- Status: `AdminBadge`
- Cards genéricos: `AdminCard`
- Ações de linha: `AdminActionMenu` + `AdminActionIcon`

`src/components/ui-tailadmin/` permanece implementação interna. Páginas não devem importar diretamente dessa pasta.

## Padrão De Tabelas Administrativas

Todas as tabelas internas devem usar `AdminDataTable`.

Recursos disponíveis:

- Cabeçalho de seção fora do container da tabela: `title`, `description` e `actions`.
- Container TailAdmin branco, com borda suave, sombra discreta e raio consistente.
- Toolbar opcional via `toolbar` ou `toolbarConfig`, com busca, seletor de registros, filtros, exportação e ação principal.
- Cabeçalho de colunas com fundo azul claro suave e texto escuro.
- `AdminTableHead` com suporte opcional a ordenação visual por `sortable`, `sortDirection` e `onSort`.
- Corpo com linhas consistentes, divisórias suaves, hover e suporte a overflow horizontal.
- Estados padronizados de loading e vazio.
- Rodapé via `footerConfig`, com contagem exibida e controles anterior/próximo.
- Paginação customizada ainda pode ser passada por `pagination` quando a página precisar de controle próprio.

## Aplicado Nesta Etapa

- `src/app/admin/participantes/page.tsx`
  - Migrada como página piloto.
  - Usa `AdminPage`, `AdminPageHeader`, `AdminMetricGrid`, `AdminMetricCard`, `AdminDataTable`, `AdminBadge`, `AdminButton` e `AdminActionMenu`.
  - Mantidos dados, cálculos, ações de visualizar/editar/excluir e modal de confirmação.

- `src/app/admin/financeiro/page.tsx`
  - Tabela migrada para `AdminDataTable`.
  - Cards, badges e botão usam camada administrativa.
  - Mantidos cálculos de saldo, listagem e criação de transações.

- `src/app/admin/dashboard/page.tsx`
  - Reorganizado visualmente com hierarquia operacional:
    resumo geral, alertas/pendências, financeiro, kits/souvenirs e portal do participante.
  - Mantida a mesma consulta `/api/admin/stats`.

- `src/app/admin/souvenirs/page.tsx`
  - Cards, totais e tabelas migrados para componentes administrativos.
  - Mantida a mesma coleta de participantes, souvenirs e interesses.

- `src/app/admin/fornecedores/page.tsx`
- `src/app/admin/programacao/page.tsx`
- `src/app/admin/comunicados/page.tsx`
- `src/app/admin/configuracoes/page.tsx`
  - Migradas para `AdminPage`, `AdminPageHeader`, `AdminButton` e `AdminEmptyState`.

- `src/components/admin/TransactionForm.tsx`
  - Formulário administrativo migrado para `AdminModal`, `AdminInput`, `AdminSelect`, `AdminButton` e `AdminField`.

- `src/components/admin/AdminConfirmDialog.tsx`
  - Modal de confirmação alinhado à camada administrativa.

## Garantias

- Nenhuma regra de negócio foi alterada.
- Nenhuma rota foi alterada.
- Nenhuma API foi alterada.
- Firebase, Firebase Admin SDK e Firestore Rules não foram alterados.
- Cálculos financeiros e métricas existentes foram preservados.
- Home pública, login público, cadastro público e fluxo de autenticação não foram migrados nesta etapa.

## Validação

- `npx tsc --noEmit`: aprovado.
- `npm run lint`: aprovado, mantendo apenas avisos antigos já existentes.
- `npm run build`: aprovado após liberar acesso de rede para o `next/font` baixar Google Fonts.

## Pendências

- Migrar `src/app/admin/participantes/[id]/page.tsx` para a mesma camada visual sem perder o caráter de registro oficial.
- Migrar `src/components/admin/ParticipantEditForm.tsx` para `AdminModal`, `AdminInput`, `AdminSelect` e `AdminButton`.
- Avaliar paginação e filtros reais no `AdminDataTable` quando houver volume de dados maior.
- Migrar login/cadastro para estética TailAdmin em fase própria, preservando autenticação.
