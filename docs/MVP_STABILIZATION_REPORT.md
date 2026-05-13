# Relatório de estabilização do MVP ATLAS 30 anos

Data da auditoria: 2026-05-13
Atualização de validação real: 2026-05-13

## Escopo

Esta etapa estabiliza o núcleo atual do MVP do evento ATLAS 30 anos. Não foram implementados módulos novos, multi-evento ou refatorações amplas. As mudanças ficaram concentradas em cadastro público, sanitização, estatísticas públicas, leitura segura de dados financeiros públicos, regras Firestore e rotinas de seed/limpeza de dados fictícios.

## Arquivos analisados

- `AGENTS.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `src/app/confirmar-interesse/page.tsx`
- `src/app/page.tsx`
- `src/app/prestacao-contas/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/participantes/page.tsx`
- `src/app/admin/participantes/[id]/page.tsx`
- `src/app/api/data/route.ts`
- `src/app/api/event-data/route.ts`
- `src/app/api/public/summary/route.ts`
- `src/lib/firebase.ts`
- `src/lib/firebase-config.ts`
- `src/lib/firestore-rest.ts`
- `src/lib/participant-metrics.ts`
- `src/lib/public-stats.ts`
- `src/types/participant.ts`
- `src/types/finance.ts`
- `firestore.rules`
- `firebase.json`
- `package.json`
- `.gitignore`

## Diagnóstico

### Já estava OK ou estável

- O cadastro público já estava estruturado como formulário multi-step e o avanço entre etapas estava funcional.
- A validação visual do cadastro já exibia erros quando campos obrigatórios faltavam.
- O modal administrativo de participante já usava portal e z-index alto, reduzindo o risco de corte por containers internos.
- A regra de presença e convidados já estava centralizada em `src/lib/participant-metrics.ts`:
  - militar confirmado conta como 1;
  - convidados contam apenas como adicionais;
  - convidados de não confirmados não entram nos totais.
- A lista pública completa de participantes não estava liberada nas regras Firestore.
- O projeto Firebase selecionado pelo CLI local é `plataforma-atlas`.

### Problemas encontrados

- A sanitização antes da gravação no cadastro público era básica e aceitava textos com limpeza limitada.
- Mutations administrativas de participantes não normalizavam todos os campos antes de salvar.
- O agregado público `publicStats/main` estava limitado principalmente a `confirmedCount`, sem cobrir `guestCount`, `totalPeople`, `interestedCount`, `kitCount` e totais financeiros agregados.
- A rota pública `/api/public/summary` ainda dependia de leitura pública de transações, o que é desnecessário e arriscado para o MVP público.
- As regras Firestore permitiam leitura pública de transações marcadas como públicas; o prompt atual pede que transações financeiras não sejam públicas.
- A página pública de prestação de contas podia consumir detalhes de transações públicas. Isso foi substituído por resumo agregado.
- O card público de confirmados podia cair no texto "contagem indisponível", mesmo quando a experiência esperada é manter o layout limpo e ler o agregado público.
- Não havia rotina documentada e segura para criar/remover dados fictícios marcados com `testData: true`.
- Não foi possível criar admin temporário real sem UID de Firebase Auth e sem expor ou solicitar senha/token sensível.

## Correções feitas

### Sanitização, normalização e padronização

- Criado `src/lib/input-sanitization.ts` com funções centralizadas para:
  - remover HTML e tags;
  - remover espaços extras;
  - normalizar nomes próprios;
  - normalizar e-mail;
  - normalizar telefone/WhatsApp;
  - normalizar CEP;
  - limitar caracteres;
  - converter números com limites mínimo e máximo;
  - bloquear valores negativos em campos numéricos.
- `src/app/api/data/route.ts` passou a usar essa camada antes de persistir participantes e interesses em souvenirs.
- O cadastro público agora grava telefone formatado e também usa dígitos normalizados para validação e geração estável de ID.
- Campos como nome, nome de guerra, endereço, cidade, estado, país, observações e tamanhos de kit são limpos antes da gravação.
- `guestsCount` é limitado de forma segura entre 0 e 20.
- Mutations administrativas de participantes também passam por sanitização específica.

### Estatísticas públicas

- `src/lib/public-stats.ts` foi expandido para calcular e salvar:
  - `confirmedCount`;
  - `guestCount`;
  - `totalPeople`;
  - `interestedCount`;
  - `kitCount`;
  - `totalIncome`;
  - `totalExpense`;
  - `balance`;
  - `updatedAt`.
- O caminho usado para estatística pública é:
  - `events/reencontro-30-anos-atlas-2027/publicStats/main`
- A função também mantém compatibilidade com o campo legado:
  - `events/reencontro-30-anos-atlas-2027.publicStats`
- A lógica segue a regra:
  - `confirmedCount = militares com willAttend === "yes"`;
  - `guestCount = soma dos convidados apenas dos confirmados`;
  - `totalPeople = confirmedCount + guestCount`;
  - `interestedCount = participantes interessados ou confirmados`;
  - `kitCount = participantes com interesse "yes" no kit oficial`.

### Segurança Firebase

- `firestore.rules` foi ajustado para permitir leitura pública apenas do agregado `publicStats/main` com formato validado.
- A leitura pública direta de transações foi removida.
- Escritas públicas continuam restritas ao cadastro e interesses, com shape e limites de dados.
- Dados pessoais, participantes completos, financeiro, admins e configurações internas permanecem protegidos por regra administrativa.
- `.gitignore` foi reforçado para ignorar `firebase-debug.log*`, `firestore-debug.log*` e `ui-debug.log*`.

### Prestação de contas pública

- `src/app/prestacao-contas/page.tsx` passou a consumir apenas resumo agregado via `/api/public/summary`.
- Detalhes de movimentações financeiras não são mais exibidos ao público.
- A página informa que os detalhes ficam restritos à comissão, preservando a área pública sem expor transações.

### Landing page

- `src/app/page.tsx` foi ajustado para não exibir "contagem indisponível" como texto público principal.
- O card mantém o layout e mostra `--` quando a contagem ainda não estiver disponível, sem expor dados pessoais.

### API pública de resumo

- `src/app/api/public/summary/route.ts` agora retorna dados do agregado público em vez de listar transações.
- Em fallback, retorna zeros seguros sem quebrar a página pública.

### Rotina de dados fictícios e limpeza

- Criado `scripts/mvp-test-data.mjs`.
- Adicionados scripts em `package.json`:
  - `npm run mvp:test-data`
  - `npm run mvp:test-data:seed`
  - `npm run mvp:test-data:cleanup`
  - `npm run mvp:test-data:sync-public-stats`
  - `npm run mvp:test-data:link-admin`
- A rotina de seed prepara 20 participantes fictícios, souvenirs, interesses e transações de teste.
- Todos os registros criados pela rotina recebem:
  - `testData: true`;
  - `createdFor: "mvp-stabilization-tests"`.
- A rotina de limpeza remove apenas documentos com `testData: true`.

## Admin temporário de teste

O admin temporário não foi criado automaticamente porque criar usuário no Firebase Auth exige senha/credencial segura ou UID existente. Na validação real, as variáveis `FIREBASE_ID_TOKEN`, `TEST_ADMIN_UID` e `TEST_ADMIN_EMAIL` não estavam presentes no ambiente. Nenhuma senha, token ou credencial foi salva em código, Git ou logs.

Procedimento seguro recomendado:

1. Criar manualmente um usuário no Firebase Auth, por exemplo:
   - Nome: Admin Teste ATLAS
   - E-mail: `admin.teste@atlas.local` ou e-mail de teste controlado
2. Obter o UID criado no Firebase Auth.
3. Executar com token administrativo válido apenas no terminal local:

```bash
set FIREBASE_ID_TOKEN=token_admin_temporario
set TEST_ADMIN_UID=uid_do_usuario
set TEST_ADMIN_EMAIL=admin.teste@atlas.local
npm run mvp:test-data:link-admin
```

Caminho usado:

```txt
events/reencontro-30-anos-atlas-2027/admins/{uid}
```

Documento previsto:

```json
{
  "email": "admin.teste@atlas.local",
  "role": "admin",
  "active": true,
  "testUser": true,
  "createdFor": "mvp-stabilization-tests"
}
```

## Seed de dados fictícios

A rotina foi criada, mas não foi executada contra o Firestore real porque requer `FIREBASE_ID_TOKEN`. O comando real `npm run mvp:test-data:seed` foi executado e parou com segurança antes de gravar dados, informando ausência de `FIREBASE_ID_TOKEN`.

Assim, nenhum dado fictício foi gravado por esta execução.

Quando executada, a rotina cria:

- 20 participantes fictícios;
- participantes confirmados com 0, 1, 2 a 5 e 10 convidados;
- participantes interessados ainda não confirmados;
- participantes não confirmados;
- dados mínimos e completos;
- endereço completo e complemento;
- diferentes tamanhos de camiseta, jaqueta e calça;
- participantes com e sem interesse em kit;
- observações e telefones com formatos variados;
- 3 souvenirs fictícios;
- 4 interesses em souvenirs;
- 4 transações financeiras fictícias marcadas como `testData: true`.

Comando para seed:

```bash
set FIREBASE_ID_TOKEN=token_admin_temporario
npm run mvp:test-data:seed
```

## PublicStats

A rotina `sync-public-stats` foi criada para recalcular o agregado público real sem criar dados fictícios.

Na validação real, o comando `npm run mvp:test-data:sync-public-stats` foi executado e parou com segurança antes de gravar dados, informando ausência de `FIREBASE_ID_TOKEN`.

Apesar disso, o documento público foi confirmado por consulta REST pública ao Firestore:

```txt
events/reencontro-30-anos-atlas-2027/publicStats/main
```

Valores encontrados:

```json
{
  "confirmedCount": 4,
  "guestCount": 31,
  "totalPeople": 35,
  "interestedCount": 4,
  "kitCount": 4,
  "totalIncome": 0,
  "totalExpense": 0,
  "balance": 0,
  "updatedAt": "2026-05-13T04:59:50.246Z"
}
```

Comando:

```bash
set FIREBASE_ID_TOKEN=token_admin_temporario
npm run mvp:test-data:sync-public-stats
```

Documento esperado:

```txt
events/reencontro-30-anos-atlas-2027/publicStats/main
```

Campos esperados:

```json
{
  "confirmedCount": 0,
  "guestCount": 0,
  "totalPeople": 0,
  "interestedCount": 0,
  "kitCount": 0,
  "totalIncome": 0,
  "totalExpense": 0,
  "balance": 0
}
```

## Limpeza dos dados de teste

Para remover dados fictícios:

```bash
set FIREBASE_ID_TOKEN=token_admin_temporario
npm run mvp:test-data:cleanup
```

A limpeza remove somente documentos com:

```json
{
  "testData": true
}
```

Coleções cobertas pela limpeza:

- `participants`
- `transactions`
- `souvenirs`
- `souvenirInterests`
- `publicStats`

Revogação do admin temporário:

1. Remover o usuário de teste no Firebase Auth.
2. Remover o documento:

```txt
events/reencontro-30-anos-atlas-2027/admins/{uid}
```

## Testes executados

- `npm run lint`
  - Resultado: passou sem erros.
  - Observações: 7 warnings já existentes sobre `<img>` e imports/variáveis não usados.
- `npm run build`
  - Primeira tentativa: falhou por bloqueio de rede ao baixar fonte Google `Inter`.
  - Segunda tentativa com rede liberada: passou.
- `npm run mvp:test-data`
  - Resultado: passou e exibiu instruções de uso.
- `git diff --check`
  - Resultado: sem erro de whitespace; apenas avisos de conversão LF/CRLF no Windows.
- `node_modules/.bin/firebase.cmd use`
  - Resultado: projeto selecionado `plataforma-atlas`.
- `node_modules/.bin/firebase.cmd deploy --only firestore:rules --project plataforma-atlas --non-interactive`
  - Resultado: deploy concluído.
  - As regras compilaram com sucesso e foram publicadas no Cloud Firestore do projeto `plataforma-atlas`.
- `npm run mvp:test-data:seed`
  - Resultado: bloqueado com segurança por falta de `FIREBASE_ID_TOKEN`.
  - Dados criados: 0 nesta execução.
- `npm run mvp:test-data:sync-public-stats`
  - Resultado: bloqueado com segurança por falta de `FIREBASE_ID_TOKEN`.
- `npm run mvp:test-data:link-admin`
  - Resultado: bloqueado com segurança por falta de `FIREBASE_ID_TOKEN`.
- Consulta local `GET /api/event-data`
  - Resultado: retornou JSON válido com `confirmedCount = 4`.
- Consulta local `GET /api/public/summary`
  - Resultado: retornou JSON válido com `confirmedCount = 4`, `guestCount = 31`, `totalPeople = 35`, `interestedCount = 4`, `kitCount = 4`, `totalIncome = 0`, `totalExpense = 0`, `balance = 0`.
- Consulta REST pública ao Firestore para `publicStats/main`
  - Resultado: documento existe e contém todos os campos esperados.
- Navegador local em `http://127.0.0.1:3000/`
  - Resultado: landing page carregou.
  - Card público exibiu `4 militares`.
  - Não apareceu o texto "contagem indisponível".
  - Não houve erro de console na validação da landing.
- Navegador local em `http://127.0.0.1:3000/admin/login`
  - Resultado: tela de login admin carregou com campos de e-mail, senha e botão de entrada.
- Navegador local em `http://127.0.0.1:3000/admin/dashboard`
  - Resultado: sem login, o dashboard ficou protegido e exibiu a tela de login.

## Pendências

- Criar o usuário temporário no Firebase Auth e vincular o UID usando `npm run mvp:test-data:link-admin`.
- Executar seed real somente quando houver token administrativo seguro no ambiente local.
- Executar `npm run mvp:test-data:sync-public-stats` em produção após validar permissões.
- Fazer teste manual autenticado no painel com o admin temporário:
  - login admin;
  - dashboard;
  - lista de participantes;
  - visualização/edição/exclusão;
  - ficha cadastral;
  - responsividade dos modais.
- Confirmar no Firebase Console se `publicStats/main` existe e se os campos foram atualizados após cadastros reais.
- Contar quantos registros `testData: true` existem no banco após o seed real. Nesta execução, não foi possível contar participantes porque a coleção é protegida e não havia token/admin temporário.
- Opcional: remover warnings antigos de lint em uma tarefa separada.

## Riscos restantes para lançamento

- `publicStats/main` existe e está público com os campos esperados, mas o sync manual não foi executado nesta rodada por falta de token.
- Se participantes forem editados diretamente no Firebase Console, o agregado público pode ficar divergente até rodar o sync.
- As regras Firestore foram deployadas no projeto `plataforma-atlas`.
- Testes com dados fictícios não foram gravados no banco real por falta de token seguro no ambiente.
- A experiência autenticada completa depende da criação do admin temporário de teste.
- No navegador local apareceu aviso antigo/intermitente de transporte do listener Firestore WebChannel; o card público carregou pelo fallback/API e exibiu o número. Recomenda-se validar o listener em um navegador normal após criar o admin/seed.

## Revisão item a item do prompt

- Executar em etapas: concluído.
- Planejar antes de editar: concluído.
- Listar arquivos analisados: concluído.
- Verificar o que já estava implementado: concluído.
- Não implementar novos módulos: concluído.
- Não fazer multi-evento: concluído.
- Não refatorar amplamente: concluído.
- Não alterar layout/identidade fora do escopo: concluído.
- Não remover funcionalidades existentes: concluído.
- Não criar dados reais: concluído.
- Não salvar credenciais/tokens/chaves: concluído.
- Marcar dados fictícios com `testData: true`: concluído na rotina criada.
- Verificar regra de presença/convidados em formulários, dashboard, landing, APIs, Firestore, ficha e estatísticas: concluído.
- Cadastro público salva campos esperados: já estava OK com reforço de sanitização.
- Sanitização/normalização antes de persistir: concluído.
- Dashboard com regra militar + convidados: já estava OK pela métrica centralizada.
- Card público de confirmados por agregado seguro: concluído e documento real validado no Firestore.
- Modal e ficha cadastral: já estavam OK/estáveis na auditoria; teste manual autenticado ainda pendente.
- Segurança Firebase: concluído no arquivo de regras; deploy concluído em `plataforma-atlas`.
- Admin temporário: orientação e script concluídos; criação real pendente por exigir UID/token seguro.
- Seed de 20 participantes: rotina concluída; comando real testado e bloqueado por ausência de token.
- Dados financeiros fictícios: rotina concluída; execução real pendente por exigir token.
- Dados kits/souvenirs fictícios: rotina concluída; execução real pendente por exigir token.
- Atualização/validação de `publicStats/main`: lógica e script concluídos; documento real confirmado; sync manual pendente por exigir token.
- Testes lint/build: concluídos.
- Verificação de console/browser público: concluída.
- Verificação de console/browser autenticado: pendente por exigir admin temporário.
- Limpeza de dados fictícios: rotina e instruções concluídas.
