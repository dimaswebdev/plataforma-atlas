#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const EVENT_ID = process.env.ATLAS_EVENT_ID || "reencontro-30-anos-atlas-2027";
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID;
const DATABASE_ID = "(default)";
const COMMAND = process.argv[2] || "help";

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").replace(/^['"]|['"]$/g, "");
    }
  }
}

loadLocalEnv();

const projectId = PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID;
const apiKey = API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const idToken = () => process.env.FIREBASE_ID_TOKEN;

function requireFirebaseEnv({ requireToken = true } = {}) {
  const missing = [];
  if (!projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (requireToken && !idToken()) missing.push("FIREBASE_ID_TOKEN");

  if (missing.length > 0) {
    throw new Error(`Missing environment variable(s): ${missing.join(", ")}`);
  }
}

function rootUrl() {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DATABASE_ID}/documents`;
}

function withApiKey(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}key=${encodeURIComponent(apiKey)}`;
}

function headers() {
  return {
    Authorization: `Bearer ${idToken()}`,
    "Content-Type": "application/json",
  };
}

function encodeValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === "object") return { mapValue: { fields: encodeFields(value) } };
  return { stringValue: String(value) };
}

function encodeFields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encodeValue(value)]));
}

function parseValue(value) {
  if (!value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(parseValue);
  if ("mapValue" in value) return parseFields(value.mapValue.fields || {});
  return null;
}

function parseFields(fields) {
  return Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, parseValue(value)]));
}

function updateMaskFor(data) {
  const params = new URLSearchParams();
  for (const key of Object.keys(data)) params.append("updateMask.fieldPaths", key);
  return params.toString();
}

async function writeDoc(path, data) {
  const mask = updateMaskFor(data);
  const res = await fetch(withApiKey(`${rootUrl()}/${path}?${mask}`), {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields: encodeFields(data) }),
  });

  if (!res.ok) {
    throw new Error(`Failed to write ${path}: ${res.status} ${await res.text()}`);
  }
}

async function deleteDoc(path) {
  const res = await fetch(withApiKey(`${rootUrl()}/${path}`), {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete ${path}: ${res.status} ${await res.text()}`);
  }
}

async function listCollection(path) {
  const docs = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({ pageSize: "300" });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(withApiKey(`${rootUrl()}/${path}?${params.toString()}`), {
      headers: headers(),
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) return docs;
      throw new Error(`Failed to list ${path}: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    docs.push(...(data.documents || []).map((doc) => ({
      id: doc.name.split("/").pop(),
      path: doc.name.split("/documents/").pop(),
      data: parseFields(doc.fields || {}),
    })));
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return docs;
}

function participant(id, overrides) {
  const now = new Date().toISOString();
  return {
    id,
    name: `Participante Teste ${id}`,
    nickname: `Teste ${id}`,
    email: `participante.teste.${id}@atlas.local`,
    phone: `(67) 9${String(90000000 + Number(id)).slice(1, 9)}-${String(1000 + Number(id)).slice(1, 5)}`,
    instagram: "",
    linkedin: "",
    birthDate: "1980-01-01",
    currentFunction: "Militar da reserva",
    zipCode: "79000-000",
    address: `Rua Ficticia ${id}, ${100 + Number(id)}, Bairro Teste`,
    city: "Campo Grande",
    state: "MS",
    country: "BRASIL",
    willAttend: "yes",
    isFromOutOfState: false,
    guestsCount: 0,
    needsHotelInfo: false,
    needsTransportInfo: false,
    wantsToHelpCommittee: false,
    notes: "",
    paymentStatus: "not_started",
    totalPaid: 0,
    officialKit: {
      interest: "yes",
      shirtSize: "M",
      jacketSize: "M",
      pantsSize: "M",
      needsSpecialSize: false,
      wantsNameCustomization: false,
    },
    termsAcceptance: {
      adhesionTermAccepted: true,
      privacyPolicyAccepted: true,
      platformTermsAccepted: true,
      financialTermsAccepted: true,
      imageUseAuthorized: true,
      souvenirsInfoAccepted: true,
      acceptedAt: now,
      userAgent: "mvp-test-data-script",
      adhesionTermVersion: "test",
      privacyPolicyVersion: "test",
      platformTermsVersion: "test",
      financialTermsVersion: "test",
      imageUseTermVersion: "test",
      souvenirsTermVersion: "test",
    },
    testData: true,
    createdFor: "mvp-stabilization-tests",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const participants = [
  participant("01", { guestsCount: 0, totalPaid: 500, paymentStatus: "paid", officialKit: { interest: "yes", shirtSize: "P", jacketSize: "P", pantsSize: "P" } }),
  participant("02", { guestsCount: 1, totalPaid: 250, paymentStatus: "partial", officialKit: { interest: "yes", shirtSize: "M", jacketSize: "M", pantsSize: "M" } }),
  participant("03", { guestsCount: 2, officialKit: { interest: "yes", shirtSize: "G", jacketSize: "G", pantsSize: "G" } }),
  participant("04", { guestsCount: 3, officialKit: { interest: "maybe", shirtSize: "GG", jacketSize: "GG", pantsSize: "GG" } }),
  participant("05", { guestsCount: 4, officialKit: { interest: "yes", shirtSize: "XG", jacketSize: "XG", pantsSize: "XG" } }),
  participant("06", { guestsCount: 5, needsHotelInfo: true, city: "Sao Paulo", state: "SP", isFromOutOfState: true }),
  participant("07", { guestsCount: 10, needsTransportInfo: true, notes: "Teste com dez convidados adicionais." }),
  participant("08", { willAttend: "maybe", guestsCount: 4, officialKit: { interest: "maybe", shirtSize: "M", jacketSize: "G", pantsSize: "G" } }),
  participant("09", { willAttend: "maybe", guestsCount: 0, officialKit: { interest: "no" } }),
  participant("10", { willAttend: "no", guestsCount: 6, officialKit: { interest: "no" } }),
  participant("11", { address: "Avenida Teste, 300, Apto 402, Centro", zipCode: "79010-000", notes: "Endereco com complemento." }),
  participant("12", { name: "Participante Teste Dados Minimos", nickname: "", email: "", instagram: "", linkedin: "", address: "", zipCode: "", currentFunction: "", officialKit: { interest: "no" } }),
  participant("13", { phone: "67988887777", notes: "Origem com telefone sem mascara para conferencia visual." }),
  participant("14", { name: "Participante Teste Espacos Extras", notes: "Origem simulada com espacos extras e caixa inconsistente." }),
  participant("15", { name: "Participante Teste Maiusculas Minusculas", city: "Dourados", state: "MS", officialKit: { interest: "yes", shirtSize: "PP", jacketSize: "P", pantsSize: "M" } }),
  participant("16", { officialKit: { interest: "yes", shirtSize: "XGG", jacketSize: "XGG", pantsSize: "XGG", needsSpecialSize: true, notes: "Tamanho especial." } }),
  participant("17", { officialKit: { interest: "yes", shirtSize: "SPECIAL", jacketSize: "SPECIAL", pantsSize: "SPECIAL", wantsNameCustomization: true, customizationName: "ATLAS17" } }),
  participant("18", { willAttend: "yes", guestsCount: 0, wantsToHelpCommittee: true, notes: "Voluntario para apoio operacional." }),
  participant("19", { willAttend: "no", guestsCount: 0, notes: "Nao confirmado, nao deve entrar no total geral." }),
  participant("20", { willAttend: "maybe", guestsCount: 10, notes: "Interessado com convidados, nao deve inflar total geral." }),
];

const souvenirs = [
  {
    id: "test-kit-oficial-atlas",
    name: "Kit Oficial ATLAS Teste",
    description: "Item ficticio para teste de consolidacao de kits.",
    price: 250,
    available: true,
    stock: 200,
    sizes: ["P", "M", "G", "GG", "XG"],
    category: "kit",
  },
  {
    id: "test-caneca-atlas",
    name: "Caneca ATLAS Teste",
    description: "Item ficticio para teste de souvenir avulso.",
    price: 45,
    available: true,
    stock: 80,
    category: "mug",
  },
  {
    id: "test-bone-atlas",
    name: "Bone ATLAS Teste",
    description: "Item ficticio para teste de quantidade.",
    price: 60,
    available: true,
    stock: 60,
    category: "cap",
  },
];

const souvenirInterests = [
  { id: "test-interest-01", participantId: "test-participant-01", participantName: "Participante Teste 01", warName: "Teste 01", souvenirId: "test-kit-oficial-atlas", souvenirName: "Kit Oficial ATLAS Teste", souvenirCategory: "kit", quantity: 1, shirtSize: "P", pantsSize: "P", jacketSize: "P", status: "pending" },
  { id: "test-interest-02", participantId: "test-participant-02", participantName: "Participante Teste 02", warName: "Teste 02", souvenirId: "test-caneca-atlas", souvenirName: "Caneca ATLAS Teste", souvenirCategory: "mug", quantity: 2, status: "confirmed" },
  { id: "test-interest-03", participantId: "test-participant-05", participantName: "Participante Teste 05", warName: "Teste 05", souvenirId: "test-bone-atlas", souvenirName: "Bone ATLAS Teste", souvenirCategory: "cap", quantity: 3, status: "pending" },
  { id: "test-interest-04", participantId: "test-participant-17", participantName: "Participante Teste 17", warName: "Teste 17", souvenirId: "test-kit-oficial-atlas", souvenirName: "Kit Oficial ATLAS Teste", souvenirCategory: "kit", quantity: 1, shirtSize: "SPECIAL", pantsSize: "SPECIAL", jacketSize: "SPECIAL", status: "fulfilled" },
];

const transactions = [
  { id: "test-transaction-01", type: "income", date: "2026-05-01", description: "Receita ficticia - adesao participante teste", amount: 500, category: "adesao", participantId: "test-participant-01", paymentMethod: "pix", isPublic: false },
  { id: "test-transaction-02", type: "income", date: "2026-05-02", description: "Receita ficticia - pagamento parcial", amount: 250, category: "mensalidade", participantId: "test-participant-02", paymentMethod: "transferencia", isPublic: false },
  { id: "test-transaction-03", type: "expense", date: "2026-05-03", description: "Despesa ficticia - reserva fornecedor", amount: 300, category: "fornecedor", supplierId: "test-supplier-01", paymentMethod: "pix", isPublic: false },
  { id: "test-transaction-04", type: "expense", date: "2026-05-04", description: "Despesa ficticia - material de kit", amount: 180, category: "souvenir", souvenirOrderId: "test-interest-01", paymentMethod: "cartao", isPublic: false },
];

function stamp(data) {
  const now = new Date().toISOString();
  return {
    ...data,
    testData: true,
    createdFor: "mvp-stabilization-tests",
    createdAt: data.createdAt || now,
    updatedAt: now,
  };
}

function calculatePublicStats() {
  const confirmed = participants.filter((item) => item.willAttend === "yes");
  const guestCount = confirmed.reduce((total, item) => total + Math.max(0, Number(item.guestsCount || 0)), 0);
  const kitCount = participants.filter((item) => item.officialKit?.interest === "yes").length;
  const publicTransactions = transactions.filter((item) => item.isPublic === true);
  const totalIncome = publicTransactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.amount || 0), 0);
  const totalExpense = publicTransactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  return {
    confirmedCount: confirmed.length,
    guestCount,
    totalPeople: confirmed.length + guestCount,
    interestedCount: participants.length,
    kitCount,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    eventId: EVENT_ID,
    testData: true,
    updatedAt: new Date().toISOString(),
  };
}

async function seed() {
  requireFirebaseEnv();
  for (const item of participants) {
    await writeDoc(`events/${EVENT_ID}/participants/test-participant-${item.id}`, stamp(item));
  }
  for (const item of souvenirs) {
    await writeDoc(`events/${EVENT_ID}/souvenirs/${item.id}`, stamp(item));
  }
  for (const item of souvenirInterests) {
    await writeDoc(`events/${EVENT_ID}/souvenirInterests/${item.id}`, stamp(item));
  }
  for (const item of transactions) {
    await writeDoc(`events/${EVENT_ID}/transactions/${item.id}`, stamp(item));
  }
  await writeDoc(`events/${EVENT_ID}/publicStats/main`, calculatePublicStats());
  console.log(`Seed concluido: ${participants.length} participantes, ${transactions.length} transacoes, ${souvenirs.length} souvenirs e ${souvenirInterests.length} interesses.`);
}

async function cleanup() {
  requireFirebaseEnv();
  const collections = ["participants", "transactions", "souvenirs", "souvenirInterests"];
  let deleted = 0;

  for (const collection of collections) {
    const docs = await listCollection(`events/${EVENT_ID}/${collection}`);
    for (const doc of docs) {
      if (doc.data.testData === true) {
        await deleteDoc(doc.path);
        deleted += 1;
      }
    }
  }

  const statsDocs = await listCollection(`events/${EVENT_ID}/publicStats`);
  for (const doc of statsDocs) {
    if (doc.data.testData === true) {
      await deleteDoc(doc.path);
      deleted += 1;
    }
  }

  console.log(`Limpeza concluida. Documentos testData removidos: ${deleted}.`);
}

async function syncPublicStats() {
  requireFirebaseEnv();
  const docs = await listCollection(`events/${EVENT_ID}/participants`);
  const realParticipants = docs.map((doc) => doc.data);
  const confirmed = realParticipants.filter((item) => item.willAttend === "yes");
  const guestCount = confirmed.reduce((total, item) => total + Math.max(0, Number(item.guestsCount || 0)), 0);
  const kitCount = realParticipants.filter((item) => item.officialKit?.interest === "yes").length;
  const transactionDocs = await listCollection(`events/${EVENT_ID}/transactions`);
  const publicTransactions = transactionDocs.map((doc) => doc.data).filter((item) => item.isPublic === true);
  const totalIncome = publicTransactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.amount || 0), 0);
  const totalExpense = publicTransactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.amount || 0), 0);
  const publicStats = {
    confirmedCount: confirmed.length,
    guestCount,
    totalPeople: confirmed.length + guestCount,
    interestedCount: realParticipants.length,
    kitCount,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    eventId: EVENT_ID,
    updatedAt: new Date().toISOString(),
  };

  await writeDoc(`events/${EVENT_ID}/publicStats/main`, publicStats);
  console.log("publicStats/main atualizado com base nos participantes atuais.");
}

async function linkAdmin() {
  requireFirebaseEnv();
  const uid = process.env.TEST_ADMIN_UID;
  const email = process.env.TEST_ADMIN_EMAIL || "admin.teste@atlas.local";

  if (!uid) {
    throw new Error("Missing TEST_ADMIN_UID. Create the Firebase Auth user first, then rerun with TEST_ADMIN_UID.");
  }

  await writeDoc(`events/${EVENT_ID}/admins/${uid}`, {
    email,
    role: "admin",
    active: true,
    testUser: true,
    createdFor: "mvp-stabilization-tests",
    createdAt: new Date().toISOString(),
  });
  console.log(`Admin de teste vinculado em events/${EVENT_ID}/admins/${uid}.`);
}

async function main() {
  if (COMMAND === "seed") return seed();
  if (COMMAND === "cleanup") return cleanup();
  if (COMMAND === "sync-public-stats") return syncPublicStats();
  if (COMMAND === "link-admin") return linkAdmin();

  console.log(`Uso:
  npm run mvp:test-data:seed
  npm run mvp:test-data:cleanup
  npm run mvp:test-data:sync-public-stats
  TEST_ADMIN_UID=<uid> TEST_ADMIN_EMAIL=admin.teste@atlas.local npm run mvp:test-data:link-admin

Requer FIREBASE_ID_TOKEN no ambiente. Nao salve tokens, senhas ou chaves no codigo.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
