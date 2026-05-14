# Portal do participante - fluxo e estado da implementacao

Data da ultima atualizacao: 2026-05-14

## Objetivo

Preparar o MVP ATLAS 30 anos para evoluir do formulario publico de interesse para uma area individual do participante, sem liberar pagamentos, Asaas, financeiro final, votacoes completas ou multi-evento nesta etapa.

O fluxo-alvo e:

1. O membro acessa ou cria uma conta por e-mail e senha.
2. Se ainda nao houver participante vinculado ao `authUid`, ele e direcionado ao formulario passo a passo em `/confirmar-interesse`.
3. Ao confirmar o formulario, o documento e gravado em `events/{eventId}/participants`.
4. O cadastro passa a aparecer no dashboard/listas administrativas.
5. A pagina `/minha-participacao` passa a consumir os dados consolidados desse participante.
6. Areas futuras ficam visiveis como estrutura, mas bloqueadas enquanto a comissao nao definir regras e custos.

## Implementado nesta etapa

### Pagina individual

Arquivo principal:

- `src/app/minha-participacao/page.tsx`

Foi criada uma area individual com linguagem visual proxima do painel administrativo/TailAdmin:

- sidebar operacional propria;
- topbar de sessao individual;
- titulo e bloco principal `Registro Oficial -- Turma ATLAS 30 Anos`;
- monograma/avatar do participante;
- status de situacao geral, proxima acao e status por secao;
- metricas de localidade, convidados, total de pessoas e idade;
- secoes para identificacao, contato, fluxo inicial, kit oficial e resumo financeiro;
- secoes internas para cadastro, participacao, convidados, kits e pagamentos, realocadas dentro das categorias principais corretas.

As areas de financeiro, pagamentos, Asaas, cobrancas, reembolso, credito interno e votacoes completas permanecem bloqueadas ou aguardando definicao.

### Arquitetura da informacao ajustada

Atualizacao de interface realizada em 2026-05-14:

- a area principal do participante passou a se chamar `Minha Conta`;
- a sidebar foi enxugada para `Minha Conta`, `Financeiro`, `Prestacao de Contas`, `Votacoes`, `Solicitacoes`, `Historico`, `Site Publico` e `Desconectar`;
- `Registro`, `Cadastro`, `Participacao`, `Convidados` e `Kits/Souvenirs` deixaram de ser itens principais da sidebar e foram realocados dentro de `Minha Conta`;
- `Pagamentos` deixou de ser item isolado da sidebar e passou a ser secao interna de `Financeiro`;
- nenhuma informacao foi removida: os blocos foram reorganizados por categoria;
- a sidebar expandida mostra apenas o nome principal de cada area;
- a sidebar recolhida mostra apenas icones;
- todos os itens da sidebar possuem tooltip;
- recursos futuros permanecem visiveis como `aguardando`, `em breve` ou `bloqueado`.

A pagina `Minha Conta` agora concentra:

- cabecalho oficial do participante;
- situacao geral;
- proxima acao;
- dados pessoais;
- identificacao e atuacao;
- contato;
- presenca/participacao;
- convidados;
- kit oficial;
- medidas;
- nome para personalizacao;
- fluxo recomendado de primeiro acesso.

A pagina `Financeiro` agora concentra:

- situacao financeira atual;
- valores;
- cobrancas;
- pagamentos;
- PIX;
- boleto;
- cartao;
- comprovantes;
- reembolso;
- credito interno;
- compras extras;
- historico financeiro;
- pendencias financeiras.

Texto padrao adotado para recursos ainda nao liberados:

`Recurso aguardando deliberacao da comissao. Esta funcionalidade ja esta prevista no sistema, mas sera liberada somente quando a fase correspondente for oficialmente aberta.`

Tambem foi preparado o fluxo visual de edicao em modo leitura:

1. usuario clica em `Editar`;
2. sistema abre modal de confirmacao;
3. apos confirmar, abre formulario resumido;
4. ao salvar, retorna para visualizacao limpa.

Observacao: o salvamento real dessas edicoes ainda depende do login individual, da API autenticada do participante e das regras Firestore de ownership.

### Menu publico

Arquivo:

- `src/components/public/PublicNav.tsx`

Foi adicionado o link `Minha Participacao` apontando para `/minha-participacao`.

### Modelo de dados preparado

Arquivos:

- `src/types/participant.ts`
- `src/types/event.ts`

Campos preparados em `Participant`:

- `authUid`
- `emailNormalized`
- `registrationStatus`
- `linkedAt`
- `lastSelfUpdateAt`

Campos preparados em `Event`:

- `eventPhase`
- `featureFlags`
- `deadlines`
- `financeConfig`

Esses campos ainda sao preparatorios. O login real do participante e a leitura individual autenticada ainda nao foram implementados.

### Cadastro publico marcado como fluxo recebido

Arquivo:

- `src/app/api/data/route.ts`

Ao criar um participante pelo fluxo de cadastro passo a passo, o sistema agora grava:

- `registrationStatus: "submitted"`
- `emailNormalized`
- `lastSelfUpdateAt`

Isso permite que o dashboard administrativo diferencie cadastro recebido de conta individual vinculada.

Atualizacao de 2026-05-14:

- o cadastro publico direto foi desativado;
- `/confirmar-interesse` foi preservado como formulario passo a passo, mas agora exige login do participante;
- a criacao de participante via `/api/data?collection=participants` exige token Firebase valido;
- as regras Firestore tambem exigem usuario autenticado para criar participante;
- os links publicos passaram a apontar para `/participante/entrar`.
- quando o participante conclui o formulario autenticado, o documento ja nasce com `authUid`, `registrationStatus: "linked"` e `linkedAt`.

Essa decisao preserva a implementacao atual para uma futura visao de previas/interesse publico, mas tira o formulario direto da jornada oficial atual.

### Login do participante

Arquivos:

- `src/app/participante/entrar/page.tsx`
- `src/app/api/participant/me/route.ts`
- `src/lib/participant-portal-config.ts`

Foi criada a primeira versao do acesso do participante com:

- login por e-mail e senha;
- criacao de conta por e-mail e senha;
- verificacao do cadastro vinculado por `authUid`;
- busca por `emailNormalized` quando ainda nao houver `authUid`;
- vinculo automatico quando houver exatamente um cadastro para o e-mail autenticado;
- estado de conflito quando houver duplicidade ou cadastro ja vinculado a outra conta;
- redirecionamento para `/minha-participacao` quando houver cadastro vinculado;
- redirecionamento para `/confirmar-interesse` quando ainda nao houver cadastro.

Observacao: a API usa Firebase Admin para validar o ID token, localizar e vincular o participante. O ambiente precisa manter uma das configuracoes:

- `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL` e `FIREBASE_ADMIN_PRIVATE_KEY`; ou
- `GOOGLE_APPLICATION_CREDENTIALS` apontando para um JSON de service account; ou
- `FIREBASE_USE_APPLICATION_DEFAULT=true` com Application Default Credentials configurado.

Sem uma dessas configuracoes, a tela de login abre, mas a API `/api/participant/me` nao consegue localizar cadastro por e-mail/authUid.

Verificacao local realizada:

- Firebase CLI disponivel via `npx firebase`, versao `15.17.0`;
- CLI autenticado localmente;
- projeto ativo do workspace: `plataforma-atlas`;
- `.firebaserc` e `firebase.json` encontrados;
- `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL` e `FIREBASE_ADMIN_PRIVATE_KEY` presentes em `.env.local`;
- private key em formato escapado com `\n`, normalizada no codigo com `.replace(/\\n/g, "\n")`;
- Admin SDK validado em leitura read-only no Auth e Firestore;
- evento padrao `reencontro-30-anos-atlas-2027` encontrado no Firestore;
- subcolecao `participants` acessivel via Admin SDK.

Deploy recomendado das regras, quando a comissao autorizar publicar a politica atual:

```bash
npx firebase use plataforma-atlas
npx firebase deploy --only firestore:rules
```

Variaveis que tambem precisam existir na Vercel em Production, Preview e Development:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

Essas variaveis nao devem usar prefixo `NEXT_PUBLIC_`.

### Massa ficticia e validacao

Arquivo:

- `scripts/mvp-test-data.mjs`

O seed de teste foi ajustado para simular tambem o fluxo do portal:

- participantes de teste com `registrationStatus: "linked"`;
- participantes de teste com `authUid` ficticio;
- participantes ainda aguardando vinculo;
- relatorio `portal-report` para comparar metricas com o dashboard admin.

Comandos disponiveis:

- `npm run mvp:test-data:seed`
- `npm run mvp:test-data:cleanup`
- `npm run mvp:test-data:sync-public-stats`
- `npm run mvp:test-data:portal-report`

Esses comandos exigem `FIREBASE_ID_TOKEN` de um usuario autorizado no ambiente. Nao salvar tokens, senhas ou chaves no codigo.

### Regras Firestore atualizadas

Arquivo:

- `firestore.rules`

A criacao de participante pelo fluxo publico foi fechada para usuarios sem login. O documento criado pelo formulario autenticado deve nascer com:

- `authUid` igual ao `request.auth.uid`
- `emailNormalized`
- `registrationStatus: "linked"`
- `linkedAt`
- `lastSelfUpdateAt`

Participante autenticado pode ler o proprio documento quando `resource.data.authUid == request.auth.uid`. Edicao direta pelo participante ainda nao foi liberada nas regras; por enquanto, a gravacao do cadastro passa pela API validada e o painel da comissao continua com gestao completa.

### Dashboard administrativo integrado ao fluxo

Arquivos:

- `src/lib/participant-metrics.ts`
- `src/app/api/admin/stats/route.ts`
- `src/app/admin/dashboard/page.tsx`

Foram adicionadas metricas para acompanhar a esteira do portal:

- `submittedRegistrations`
- `linkedAccounts`
- `pendingAccountLink`
- `participantsWithEmail`
- `participantsWithoutEmail`
- `committeeVolunteers`
- `kitResponses`

O dashboard ganhou uma secao `Portal do participante` com:

- formularios recebidos;
- contas vinculadas;
- cadastros aguardando login;
- financeiro bloqueado;
- contagem de participantes com e sem e-mail;
- voluntarios para comissao;
- respostas de kit mapeadas;
- link para a pagina individual.

## Decisoes tomadas

### Sem multi-evento agora

Todo o fluxo continua usando `DEFAULT_EVENT_ID`.

### Sem pagamentos agora

O dashboard e a pagina individual deixam claro que financeiro final, Asaas, cobrancas e pagamentos estao bloqueados.

### Sem valor financeiro falso

Enquanto `financeConfig.costsDefined` nao existir ou nao for `true`, a interface deve mostrar `Aguardando definicao da comissao`, nunca `R$ 0,00` como total final.

### Login primeiro, formulario depois

O cadastro publico direto esta desativado nesta fase. O caminho oficial agora e:

1. participante entra ou cria conta em `/participante/entrar`;
2. o sistema procura um cadastro vinculado por `authUid`;
3. se nao houver cadastro, o usuario autenticado e enviado para `/confirmar-interesse`;
4. ao concluir o formulario, o documento ja nasce vinculado ao login.

## Proximas etapas recomendadas

### 1. Login do participante

Status: primeira versao implementada.

Implementado:

- `/participante/entrar`
- `src/app/api/participant/me/route.ts`
- `src/lib/participant-portal-config.ts`

Ainda falta evoluir:

- tela administrativa para resolver conflitos de vinculo
- tela de recuperacao/alteracao de senha do participante
- mensagens transacionais de boas-vindas e confirmacao

Fluxo:

1. Firebase Auth autentica e-mail/senha.
2. API verifica ID token.
3. API procura `participant.authUid == uid`.
4. Se nao encontrar, procura por `emailNormalized`.
5. Se encontrar exatamente um cadastro, vincula `authUid`, `registrationStatus: "linked"` e `linkedAt`.
6. Se nao encontrar cadastro, redireciona para `/confirmar-interesse`.
7. Se houver conflito, mostrar estado `aguardando validacao da comissao`.

### 2. Minha Participacao com dados reais

Status: primeira versao integrada.

Implementado:

- leitura autenticada em `/api/participant/me`;
- redirecionamento para login quando nao ha sessao;
- redirecionamento para `/confirmar-interesse` quando nao ha cadastro;
- consolidacao dos dados do participante em `/minha-participacao`.

Ainda falta evoluir:

- edicao controlada por secao com campos permitidos;
- historico real de alteracoes;
- bloqueio granular de campos sensiveis por fase.

### 3. Regras Firestore de ownership

Status: leitura propria e criacao autenticada implementadas.

Implementado:

- participante ler apenas `participants/{participantId}` quando `resource.data.authUid == request.auth.uid`;
- participante criar cadastro inicial somente autenticado e vinculado ao proprio `uid`;
- admin/comissao manter acesso completo.

Ainda falta evoluir:

- participante editar apenas campos permitidos;
- bloquear campos financeiros, roles, `authUid`, status administrativo e historico em updates feitos pelo proprio participante;
- criar rotina administrativa para resolver conflitos de email/vinculo.

### 4. Dashboard administrativo mais detalhado

Adicionar filtros/listas por:

- aguardando vinculo de login;
- sem e-mail;
- voluntarios da comissao;
- cadastros com conflito de identidade;
- cadastro completo/incompleto.

### 5. Historico de atividades

Criar colecao futura:

`events/{eventId}/participantActivities/{activityId}`

Campos sugeridos:

- `participantId`
- `actorUid`
- `actorRole`
- `type`
- `title`
- `description`
- `createdAt`
- `metadata`

Eventos iniciais:

- cadastro criado;
- conta vinculada;
- cadastro atualizado;
- interesse/presenca alterados;
- convidados alterados;
- kit atualizado;
- fase do evento alterada.

### 6. Financeiro futuro

Criar colecao futura:

`events/{eventId}/participantFinancials/{participantId}`

Campos sugeridos:

- `costsDefined`
- `baseQuota`
- `extraGuestsAmount`
- `optionalItemsAmount`
- `discountsAmount`
- `totalDue`
- `totalPaid`
- `pendingBalance`
- `status`

So liberar calculo e UI com valores quando a comissao definir custos finais.

## Validacoes executadas

- `npm run lint`
- `npm run build`
- verificacao no navegador em `/minha-participacao`
- verificacao de navegacao entre `Minha Conta` e `Financeiro`
- verificacao do fluxo visual de edicao com confirmacao antes do formulario resumido
- verificacao no navegador em `/participante/entrar`
- verificacao de `/confirmar-interesse` bloqueado sem login
- verificacao de `/minha-participacao` redirecionando para login sem sessao

Observacao: o build pode precisar de rede para baixar fonte do `next/font/google`. Em ambiente com rede restrita, a primeira tentativa pode falhar ao buscar Inter no Google Fonts.
