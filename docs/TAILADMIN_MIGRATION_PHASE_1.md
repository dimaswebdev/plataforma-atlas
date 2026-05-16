# Migracao TailAdmin - Fase 1

## Objetivo

Criar uma camada interna de componentes reutilizaveis inspirados no TailAdmin, sem trocar telas principais nem alterar fluxos existentes.

## Escopo implementado

- Criada a pasta `src/components/ui-tailadmin/`.
- Criada a pasta `src/components/layout/tailadmin/`.
- Criada a pasta `src/design-system/tailadmin/`.
- Criados tokens TailAdmin controlados em `src/design-system/tailadmin/tokens.css`.
- Registrado o import controlado dos tokens em `src/app/globals.css`.
- Criados componentes base:
  - Button
  - Badge
  - Card / ComponentCard
  - Input / Label
  - Modal
  - Table

## O que foi adaptado do TailAdmin

- Paleta interna brand/gray/success/error/warning/info.
- Escala `text-theme-*`.
- Sombras `shadow-theme-*`.
- Variante class-based `dark:`.
- Estrutura visual de botao, badge, card, modal, input e tabela.

## Ajustes para o ATLAS

- A Home publica continua com a identidade ATLAS atual.
- A camada interna passa a poder usar azul TailAdmin/institucional como base.
- O dourado deixa de ser premissa nos componentes internos e passa a ser apenas acento futuro.
- Nenhuma dependencia extra foi adicionada.
- Nenhum componente importa diretamente de `free-nextjs-admin-dashboard-main`.

## Fora de escopo nesta fase

- Home publica.
- Login e cadastro.
- APIs.
- Firebase client.
- Firebase Admin SDK.
- Firestore Rules.
- Rotas de autenticacao.
- Troca de layout admin ou participante.
- Graficos, calendario, dropzone, flatpickr, swiper e SVGR.

## Proxima fase recomendada

Aplicar estes componentes em uma tela piloto do admin, preferencialmente a lista de membros/participantes, com foco em:

- botoes de acoes;
- modal de exclusao;
- tabela;
- badges de status;
- cards de resumo;
- compatibilidade dark/light.
