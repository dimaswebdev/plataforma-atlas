import fs from "fs";
import path from "path";
import process from "process";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const ROOT = process.cwd();
const DEFAULT_EVENT_ID = "reencontro-30-anos-atlas-2027";
const DEFAULT_BASE_URL = "https://plataforma-atlas.vercel.app";
const KEEP_DATA = process.argv.includes("--keep") || process.env.ATLAS_TEST_KEEP_DATA === "true";
const RUN_ID =
  process.env.ATLAS_TEST_RUN_ID ||
  new Date().toISOString().replace(/\D/g, "").slice(0, 14);

const env = loadEnvFile(path.join(ROOT, ".env.local"));
const baseUrl = (process.env.ATLAS_TEST_BASE_URL || env.ATLAS_TEST_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
const eventId = process.env.ATLAS_TEST_EVENT_ID || env.ATLAS_TEST_EVENT_ID || DEFAULT_EVENT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ||
  env.FIREBASE_ADMIN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n");

if (!apiKey) failSetup("NEXT_PUBLIC_FIREBASE_API_KEY ausente.");
if (!projectId) failSetup("FIREBASE_ADMIN_PROJECT_ID ou NEXT_PUBLIC_FIREBASE_PROJECT_ID ausente.");
if (!clientEmail) failSetup("FIREBASE_ADMIN_CLIENT_EMAIL ausente.");
if (!privateKey) failSetup("FIREBASE_ADMIN_PRIVATE_KEY ausente.");

const adminApp =
  getApps().find((app) => app.name === "atlas-functional-tests") ||
  initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    },
    "atlas-functional-tests"
  );

const auth = getAuth(adminApp);
const db = getFirestore(adminApp);
const eventRef = db.collection("events").doc(eventId);
const participantsRef = eventRef.collection("participants");
const adminsRef = eventRef.collection("admins");
const souvenirsRef = eventRef.collection("souvenirs");
const souvenirInterestsRef = eventRef.collection("souvenirInterests");
const publicStatsRef = eventRef.collection("publicStats").doc("main");

const password = `Atlas-${RUN_ID}-Teste!`;
const testTag = `functional-flow-${RUN_ID}`;
const createdUsers = [];
const createdDocs = [];
const checks = [];
let publicStatsSnapshot = null;

main().catch(async (error) => {
  record("Execucao geral", false, error.message);
  await cleanup();
  printReport();
  process.exit(1);
});

async function main() {
  console.log(`\nATLAS functional flow test`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Event ID: ${eventId}`);
  console.log(`Run ID: ${RUN_ID}`);
  console.log(`Keep data: ${KEEP_DATA ? "yes" : "no"}\n`);

  await snapshotPublicStats();

  await pageSmokeTests();
  await authGuardTests();
  await participantLinkByEmailFlow();
  await participantRegistrationFlow();
  await participantConflictFlow();
  await adminFlow();
  await souvenirInterestFlow();

  await cleanup();
  printReport();
}

async function pageSmokeTests() {
  await step("Pagina inicial publica responde", async () => {
    const res = await httpGet("/");
    assertStatus(res, 200);
    assertText(await res.text(), "ATLAS");
  });

  await step("Login do participante responde e tem volta para home", async () => {
    const res = await httpGet("/participante/entrar");
    assertStatus(res, 200);
    const html = await res.text();
    assertText(html, "Acesso do Participante");
    assertText(html, "Voltar para o inicio");
  });

  await step("Login admin responde", async () => {
    const res = await httpGet("/admin/login");
    assertStatus(res, 200);
  });

  await step("Resumo publico responde", async () => {
    const res = await httpGet("/api/public/summary");
    assertStatus(res, 200);
    const body = await json(res);
    assert(typeof body === "object" && body !== null, "Resposta de resumo publica invalida.");
  });
}

async function authGuardTests() {
  await step("Participante sem token recebe 401", async () => {
    const res = await httpGet("/api/participant/me");
    assertStatus(res, 401);
    const body = await json(res);
    assert(body.code === "participant-auth-required", "Codigo esperado participant-auth-required.");
  });

  await step("Participante com token invalido recebe 401", async () => {
    const res = await api("/api/participant/me", {
      token: "invalid-token",
    });
    assertStatus(res, 401);
    const body = await json(res);
    assert(body.code === "participant-auth-invalid", "Codigo esperado participant-auth-invalid.");
  });

  await step("Cadastro publico direto sem login esta desativado", async () => {
    const res = await api("/api/data?collection=participants", {
      method: "POST",
      body: participantSubmissionBody({
        email: emailFor("anonymous"),
        name: "Teste Publico Bloqueado ATLAS",
        phone: phoneFor(10),
      }),
    });
    assertStatus(res, 401);
    const body = await json(res);
    assert(body.code === "participant-login-required", "Codigo esperado participant-login-required.");
  });
}

async function participantLinkByEmailFlow() {
  const email = emailFor("link");
  const user = await createTestUser(email, "Participante Vinculo Funcional");
  const docRef = participantsRef.doc(`${testTag}-link-by-email`);

  await docRef.set({
    name: "Participante Vinculo Funcional",
    nickname: "VINCULO",
    email,
    emailNormalized: email,
    phone: phoneFor(11),
    city: "Campo Grande",
    state: "MS",
    country: "BR",
    willAttend: "yes",
    guestsCount: 1,
    wantsToHelpCommittee: true,
    registrationStatus: "submitted",
    paymentStatus: "not_started",
    totalPaid: 0,
    officialKit: {
      interest: "yes",
      shirtSize: "M",
      jacketSize: "G",
      pantsSize: "M",
      heightCm: 178,
      approximateWeightKg: 82,
      wantsNameCustomization: true,
      customizationName: "VINCULO",
      needsSpecialSize: false,
    },
    testData: true,
    createdFor: "functional-flow-tests",
    runId: RUN_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  createdDocs.push(docRef);

  const token = await signIn(email);

  await step("Participante existente vincula por e-mail no primeiro acesso", async () => {
    const res = await api("/api/participant/me", { token });
    assertStatus(res, 200);
    const body = await json(res);
    assert(body.status === "linked", "Status esperado linked.");
    assert(body.participant?.email === email, "Participante vinculado nao retornou o e-mail esperado.");

    const updated = await docRef.get();
    assert(updated.get("authUid") === user.uid, "authUid nao foi gravado no cadastro existente.");
    assert(updated.get("registrationStatus") === "linked", "registrationStatus nao foi atualizado.");
  });
}

async function participantRegistrationFlow() {
  const email = emailFor("new");
  await createTestUser(email, "Participante Novo Funcional");
  const token = await signIn(email);

  await step("Participante autenticado sem cadastro recebe needs_registration", async () => {
    const res = await api("/api/participant/me", { token });
    assertStatus(res, 200);
    const body = await json(res);
    assert(body.status === "needs_registration", "Status esperado needs_registration.");
  });

  await step("Participante autenticado cria cadastro pelo fluxo passo a passo", async () => {
    const res = await api("/api/data?collection=participants", {
      method: "POST",
      token,
      body: participantSubmissionBody({
        email,
        name: "Participante Novo Funcional ATLAS",
        nickname: "NOVO",
        phone: phoneFor(12),
        guestsCount: 2,
      }),
    });
    assertStatus(res, 200);
    const body = await json(res);
    assert(body.success === true && body.id, "Cadastro autenticado nao retornou sucesso.");
    createdDocs.push(participantsRef.doc(body.id));
  });

  await step("Cadastro criado aparece consolidado na area do participante", async () => {
    const res = await api("/api/participant/me", { token });
    assertStatus(res, 200);
    const body = await json(res);
    assert(body.status === "linked", "Status esperado linked apos cadastro.");
    assert(body.participant?.email === email, "Cadastro consolidado retornou outro e-mail.");
    assert(body.participant?.guestsCount === 2, "Quantidade de convidados nao consolidou.");
    assert(body.participant?.officialKit?.interest === "yes", "Interesse no kit nao consolidou.");
  });
}

async function participantConflictFlow() {
  const email = emailFor("conflict");
  await createTestUser(email, "Participante Conflito Funcional");
  const token = await signIn(email);
  const now = new Date().toISOString();

  for (const suffix of ["a", "b"]) {
    const docRef = participantsRef.doc(`${testTag}-conflict-${suffix}`);
    await docRef.set({
      name: `Participante Conflito ${suffix.toUpperCase()}`,
      email,
      emailNormalized: email,
      phone: phoneFor(suffix === "a" ? 13 : 14),
      willAttend: "maybe",
      guestsCount: 0,
      registrationStatus: "submitted",
      paymentStatus: "not_started",
      totalPaid: 0,
      officialKit: { interest: "maybe", wantsNameCustomization: false, needsSpecialSize: false },
      testData: true,
      createdFor: "functional-flow-tests",
      runId: RUN_ID,
      createdAt: now,
      updatedAt: now,
    });
    createdDocs.push(docRef);
  }

  await step("E-mail duplicado bloqueia vinculo automatico", async () => {
    const res = await api("/api/participant/me", { token });
    assertStatus(res, 409);
    const body = await json(res);
    assert(body.code === "participant-email-conflict", "Codigo esperado participant-email-conflict.");
  });
}

async function adminFlow() {
  const email = emailFor("admin");
  const user = await createTestUser(email, "Administrador Funcional");
  const adminDoc = adminsRef.doc(user.uid);

  await adminDoc.set({
    email,
    role: "admin",
    active: true,
    testData: true,
    createdFor: "functional-flow-tests",
    runId: RUN_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  createdDocs.push(adminDoc);

  const token = await signIn(email);

  await step("Admin autenticado e reconhecido pela API", async () => {
    const res = await api("/api/admin/check", { token });
    assertStatus(res, 200);
    const body = await json(res);
    assert(body.isAdmin === true, "Admin nao foi reconhecido.");
    assert(body.uid === user.uid, "UID admin retornado nao confere.");
  });

  await step("Admin lista participantes e enxerga registros de teste", async () => {
    const res = await api("/api/data?collection=participants", { token });
    assertStatus(res, 200);
    const body = await json(res);
    assert(Array.isArray(body), "Lista de participantes nao veio como array.");
    assert(
      body.some((participant) => participant.runId === RUN_ID),
      "Admin nao encontrou participantes da rodada funcional."
    );
  });

  await step("Dashboard admin calcula metricas com permissao administrativa", async () => {
    const res = await api("/api/admin/stats", { token });
    assertStatus(res, 200);
    const body = await json(res);
    assert(typeof body.totalParticipants === "number", "Metricas admin sem totalParticipants numerico.");
    assert(typeof body.linkedAccounts === "number", "Metricas admin sem linkedAccounts numerico.");
  });

  await step("Admin cria e exclui participante pela API usada nos botoes de acao", async () => {
    const createRes = await api("/api/data?collection=participants", {
      method: "POST",
      token,
      body: {
        name: "Participante Excluir Funcional ATLAS",
        nickname: "EXCLUIR",
        email: emailFor("admin-delete"),
        phone: phoneFor(16),
        city: "Campo Grande",
        state: "MS",
        country: "BR",
        willAttend: "maybe",
        guestsCount: 0,
        wantsToHelpCommittee: false,
        totalPaid: 0,
        paymentStatus: "not_started",
        officialKit: { interest: "no", wantsNameCustomization: false, needsSpecialSize: false },
        testData: true,
        createdFor: "functional-flow-tests",
        runId: RUN_ID,
      },
    });
    assertStatus(createRes, 200);
    const created = await json(createRes);
    assert(created.success === true && created.id, "Criacao administrativa para exclusao nao retornou sucesso.");

    const createdRef = participantsRef.doc(created.id);
    createdDocs.push(createdRef);

    const deleteRes = await api(`/api/data?collection=participants&id=${created.id}`, {
      method: "DELETE",
      token,
    });
    assertStatus(deleteRes, 200);

    const deletedSnap = await createdRef.get();
    assert(!deletedSnap.exists, "Participante excluido pela API administrativa ainda existe no Firestore.");
  });
}

async function souvenirInterestFlow() {
  const souvenirDoc = souvenirsRef.doc(`${testTag}-souvenir`);
  await souvenirDoc.set({
    name: "Item Funcional ATLAS",
    category: "shirt",
    available: true,
    testData: true,
    createdFor: "functional-flow-tests",
    runId: RUN_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  createdDocs.push(souvenirDoc);

  await step("Interesse publico em souvenir disponivel e registrado", async () => {
    const res = await api("/api/data?collection=souvenirInterests", {
      method: "POST",
      body: {
        participantName: "Participante Souvenir Funcional",
        warName: "SOUVENIR",
        contactPhone: phoneFor(15),
        contactEmail: emailFor("souvenir"),
        souvenirId: souvenirDoc.id,
        souvenirName: "Item Funcional ATLAS",
        souvenirCategory: "shirt",
        quantity: 1,
        shirtSize: "M",
        notes: "Registro temporario de teste funcional.",
      },
    });
    assertStatus(res, 200);
    const body = await json(res);
    assert(body.success === true && body.id, "Interesse em souvenir nao retornou sucesso.");
    createdDocs.push(souvenirInterestsRef.doc(body.id));
  });
}

async function snapshotPublicStats() {
  const snap = await publicStatsRef.get();
  publicStatsSnapshot = {
    exists: snap.exists,
    data: snap.exists ? snap.data() : null,
  };
}

async function createTestUser(email, displayName) {
  const user = await auth.createUser({
    email,
    password,
    emailVerified: true,
    displayName,
  });
  createdUsers.push(user.uid);
  return user;
}

async function signIn(email) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Falha ao autenticar ${email}: HTTP ${res.status} ${detail}`);
  }

  const body = await res.json();
  assert(body.idToken, `Login de ${email} nao retornou idToken.`);
  return body.idToken;
}

function participantSubmissionBody({ email, name, nickname = "FUNCIONAL", phone, guestsCount = 1 }) {
  return {
    name,
    nickname,
    email,
    phone,
    instagram: "@atlas_funcional",
    linkedin: "https://linkedin.com/in/atlas-funcional",
    birthDate: "1997-05-14",
    currentFunction: "Teste Funcional",
    zipCode: "79000-000",
    address: "Endereco de teste funcional",
    city: "Campo Grande",
    state: "MS",
    country: "BR",
    willAttend: "yes",
    isFromOutOfState: false,
    guestsCount,
    needsHotelInfo: false,
    needsTransportInfo: false,
    wantsToHelpCommittee: true,
    notes: `Rodada funcional ${RUN_ID}`,
    officialKit: {
      interest: "yes",
      shirtSize: "M",
      jacketSize: "G",
      pantsSize: "M",
      heightCm: 178,
      approximateWeightKg: 82,
      wantsNameCustomization: true,
      customizationName: nickname,
      additionalKitsInterest: "maybe",
      needsSpecialSize: false,
      notes: "Medidas temporarias de teste.",
    },
    termsAcceptance: {
      adhesionTermAccepted: true,
      privacyPolicyAccepted: true,
      platformTermsAccepted: true,
      financialTermsAccepted: true,
      imageUseAuthorized: true,
      souvenirsInfoAccepted: true,
      adhesionTermVersion: "functional-test",
      privacyPolicyVersion: "functional-test",
      platformTermsVersion: "functional-test",
      financialTermsVersion: "functional-test",
      imageUseTermVersion: "functional-test",
      souvenirsTermVersion: "functional-test",
    },
  };
}

async function cleanup() {
  if (KEEP_DATA) {
    console.log("\nDados de teste preservados por --keep.");
    return;
  }

  for (const docRef of [...createdDocs].reverse()) {
    await docRef.delete().catch((error) => {
      record(`Limpeza ${docRef.path}`, false, error.message);
    });
  }

  for (const uid of [...createdUsers].reverse()) {
    await auth.deleteUser(uid).catch((error) => {
      record(`Limpeza usuario ${uid}`, false, error.message);
    });
  }

  if (publicStatsSnapshot) {
    if (publicStatsSnapshot.exists) {
      await publicStatsRef.set(publicStatsSnapshot.data || {});
    } else {
      await publicStatsRef.delete().catch(() => undefined);
    }
  }
}

async function step(name, fn) {
  try {
    await fn();
    record(name, true);
  } catch (error) {
    record(name, false, error.message);
    throw error;
  }
}

async function httpGet(pathname) {
  return fetch(`${baseUrl}${pathname}`, {
    method: "GET",
    redirect: "manual",
    headers: { "User-Agent": "atlas-functional-flow-test" },
  });
}

async function api(pathname, { method = "GET", token, body } = {}) {
  const headers = {
    "User-Agent": "atlas-functional-flow-test",
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  return fetch(`${baseUrl}${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
}

async function json(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Resposta nao e JSON: ${text.slice(0, 300)}`);
  }
}

function assertStatus(response, expected) {
  assert(response.status === expected, `HTTP esperado ${expected}, recebido ${response.status}.`);
}

function assertText(source, expected) {
  assert(normalizeAscii(source).includes(normalizeAscii(expected)), `Texto esperado nao encontrado: ${expected}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function record(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
}

function printReport() {
  const passed = checks.filter((check) => check.ok).length;
  const failed = checks.length - passed;
  console.log(`\nResultado: ${passed} passou, ${failed} falhou.`);

  if (failed > 0) {
    console.log("\nFalhas:");
    checks
      .filter((check) => !check.ok)
      .forEach((check) => console.log(`- ${check.name}: ${check.detail}`));
  }
}

function emailFor(kind) {
  return `atlas.functional.${RUN_ID}.${kind}@example.com`;
}

function phoneFor(seed) {
  return `(67) 9${String(RUN_ID).slice(-4)}-${String(1000 + seed).slice(-4)}`;
}

function normalizeAscii(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs.readFileSync(filePath, "utf8").split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return acc;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return acc;

    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    acc[key] = value;
    return acc;
  }, {});
}

function failSetup(message) {
  console.error(`Configuracao de teste incompleta: ${message}`);
  process.exit(1);
}
