# Migracao TailAdmin - Fase 2 Piloto

## Objetivo

Aplicar a camada visual TailAdmin em uma primeira tela real do admin sem alterar regras de negocio, autenticacao, APIs, Firebase ou rotas publicas.

## Tela piloto

- `src/app/admin/participantes/page.tsx`

## Implementado

- Lista de membros migrada para composicao visual TailAdmin.
- Cards de metricas refeito com `TailAdminCard`.
- Tabela desktop reestruturada com componentes `TailAdminTable`.
- Cards mobile reestruturados com `TailAdminCard`.
- Badges de presenca, kit e financeiro reestruturados com `TailAdminBadge`.
- Botao de atualizar lista usando `TailAdminButton`.
- Acoes preservadas:
  - visualizar pagina individual;
  - editar participante;
  - excluir participante.
- Exclusao continua exigindo modal de confirmacao.
- Modal de confirmacao admin adaptado para `TailAdminModal` e `TailAdminButton`.
- Layout admin passa a aplicar a classe `dark` quando o modo escuro interno estiver ativo.
- Tabela de membros ajustada para usar melhor a area util.
- E-mail removido da linha principal da tabela desktop.
- Cabecalho `Apelido` renomeado para `Nome de guerra`.
- Colunas de presenca e kit passaram a usar icones com tooltip para reduzir largura.
- Divisorias entre linhas reforcadas.
- Sidebar administrativa ajustada para o padrao visual TailAdmin, com estados em azul institucional.
- Topbar administrativa ajustada para o padrao TailAdmin, com:
  - placeholder de pesquisa/atalho;
  - botao de tema;
  - espaco de notificacoes;
  - avatar placeholder;
  - menu dropdown de perfil e sessao.
- Cards de metricas receberam alinhamento padronizado de icones e hover sutil.
- Valores `A definir` passaram a usar label/badge visual, evitando leitura como valor final.
- Fundo interno do dashboard foi ajustado para cinza TailAdmin em modo claro e cinza escuro TailAdmin em modo escuro.
- Titulos da tabela e cabecalhos seguem a tipografia menor e mais limpa do TailAdmin.
- Fonte Outfit/TailAdmin carregada de forma escopada no layout administrativo.
- `AdminPageHeader` e `AdminStatCard` foram aproximados do padrao TailAdmin, estendendo a base visual para outras abas administrativas.
- Modal de confirmacao passou a ter prioridade visual acima da sidebar/topbar.
- Confirmacao destrutiva deixou de usar botao vermelho e passou a seguir o padrao TailAdmin azul/branco.
- Hover de linhas e cards foi reforcado para deixar a interface menos estatica.
- Valores financeiros pendentes foram centralizados em helper visual para reduzir repeticao na pagina de participantes.
- Modal TailAdmin passou a ser renderizado por portal no `document.body`, evitando conflito de camada com sidebar/topbar.
- Botao `Atualizar lista` na tela de participantes passou para o padrao primario azul com texto branco.
- Cards de metricas da tela de participantes usam `AdminStatCard`, reduzindo duplicidade com o componente compartilhado.
- Estado de carregamento das metricas agora usa spinner visual.
- Cabecalho da tabela ganhou fundo azul claro e hover de linha mais evidente.
- Cabecalho da secao `Tabela de membros` foi separado do container da tabela; a tabela desktop agora inicia diretamente pelos titulos das colunas.
- Barra de progresso com percentual foi restaurada na tabela de membros.
- Valores administrativos das colunas `Total` e `Restante` voltaram a exibir valor monetario numerico na tabela, mesmo enquanto o financeiro final segue sem deliberacao.
- Botao duplicado de recolher/expandir sidebar foi removido; a acao permanece concentrada no botao padrao da topbar.
- Criada a camada publica `src/components/ui/` com componentes `App*`, deixando `ui-tailadmin` como implementacao interna.
- Criados componentes de layout `AppShell`, `AppSidebar` e `AppHeader` para padronizar o shell administrativo.
- Paginas administrativas passaram a migrar para imports de `@/components/ui`, reduzindo dependencia direta de `ui-tailadmin`.

## Ajustes de direcao visual

- A tela piloto deixa de depender do dourado como cor predominante.
- O visual interno se aproxima de TailAdmin, com base em cinzas, branco, azul institucional e estados semanticos.
- Cards e resumos continuam comunicando que valores finais dependem da comissao.
- A tabela administrativa preserva os valores monetarios internos (`R$ 0,00`) para controle operacional.

## Preservado

- Home publica.
- Login.
- Cadastro.
- APIs.
- Firebase client.
- Firebase Admin SDK.
- Firestore Rules.
- Fluxo de autenticacao.
- Rotas existentes.

## Proxima etapa recomendada

Validar visualmente a tela de participantes nos modos claro e escuro e, depois, migrar o formulario de edicao de participante para `TailAdminModal`, `TailAdminInput` e `TailAdminButton`.
