import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import {
  buildUpdateMask,
  createStableParticipantDocumentId,
  firebaseConfigErrorResponse,
  FirestoreDocument,
  firestoreFetch,
  firestoreListAll,
  firestoreRunQuery,
  hasFirebaseServerConfig,
  JsonObject,
  parseFirestoreDoc,
  parseFirestoreQueryRows,
  requireAdminSession,
  serializeFirestoreFields,
} from "@/lib/firebase-rest";
import { syncPublicStatsSafely } from "@/lib/public-stats";

const PUBLIC_READ_COLLECTIONS = new Set(["schedule", "souvenirs", "transactions"]);
const ADMIN_COLLECTIONS = new Set([
  "admins",
  "comunicados",
  "communications",
  "guests",
  "participants",
  "schedule",
  "souvenirs",
  "souvenirInterests",
  "suppliers",
  "transactions",
  "updates",
]);

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 4;
const submissionBuckets = new Map<string, number[]>();

function collectionIsValid(collection: string) {
  return /^[a-zA-Z0-9_-]+$/.test(collection);
}

function jsonError(error: string, status: number, code?: string) {
  return NextResponse.json({ error, code }, { status });
}

function getCollection(request: Request) {
  const { searchParams } = new URL(request.url);
  return {
    collection: searchParams.get("collection") || "",
    id: searchParams.get("id") || "",
  };
}

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(request: Request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const recent = (submissionBuckets.get(ip) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_SUBMISSIONS) {
    submissionBuckets.set(ip, recent);
    return true;
  }

  submissionBuckets.set(ip, [...recent, now]);
  return false;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(record: Record<string, unknown>, key: string, maxLength = 240) {
  const value = record[key];
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readOptionalString(record: Record<string, unknown>, key: string, maxLength = 240) {
  const value = readString(record, key, maxLength);
  return value || undefined;
}

function readNumber(record: Record<string, unknown>, key: string, fallback = 0, min = 0, max = 999) {
  const value = record[key];
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;

  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

function readBoolean(record: Record<string, unknown>, key: string) {
  return record[key] === true;
}

function readEnum<T extends string>(value: unknown, allowed: readonly T[], fallback?: T) {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function createStableSouvenirInterestDocumentId(seed: string) {
  const hash = createHash("sha256").update(seed.trim().toLowerCase()).digest("hex").slice(0, 24);
  return `interest-${hash}`;
}

function sanitizeOfficialKit(raw: unknown): JsonObject | undefined {
  const record = asRecord(raw);
  const interest = readEnum(record.interest, ["yes", "maybe", "no"] as const);

  if (!interest) return undefined;

  const sizeValues = ["PP", "P", "M", "G", "GG", "XG", "XGG", "SPECIAL"] as const;
  const additionalKitsInterest = readEnum(record.additionalKitsInterest, ["yes", "maybe", "no"] as const);
  const kit: JsonObject = {
    interest,
    needsSpecialSize: readBoolean(record, "needsSpecialSize"),
    wantsNameCustomization: readBoolean(record, "wantsNameCustomization"),
  };

  const shirtSize = readEnum(record.shirtSize, sizeValues);
  const jacketSize = readEnum(record.jacketSize, sizeValues);
  const pantsSize = readEnum(record.pantsSize, sizeValues);
  const heightCm = readNumber(record, "heightCm", 0, 0, 260);
  const approximateWeightKg = readNumber(record, "approximateWeightKg", 0, 0, 300);
  const customizationName = readOptionalString(record, "customizationName", 24);
  const notes = readOptionalString(record, "notes", 1000);

  if (shirtSize) kit.shirtSize = shirtSize;
  if (jacketSize) kit.jacketSize = jacketSize;
  if (pantsSize) kit.pantsSize = pantsSize;
  if (heightCm > 0) kit.heightCm = heightCm;
  if (approximateWeightKg > 0) kit.approximateWeightKg = approximateWeightKg;
  if (customizationName) kit.customizationName = customizationName.toUpperCase();
  if (additionalKitsInterest) kit.additionalKitsInterest = additionalKitsInterest;
  if (notes) kit.notes = notes;

  return kit;
}

function sanitizeTerms(raw: unknown, request: Request, now: string) {
  const record = asRecord(raw);

  return {
    adhesionTermAccepted: readBoolean(record, "adhesionTermAccepted"),
    privacyPolicyAccepted: readBoolean(record, "privacyPolicyAccepted"),
    platformTermsAccepted: readBoolean(record, "platformTermsAccepted"),
    financialTermsAccepted: readBoolean(record, "financialTermsAccepted"),
    imageUseAuthorized: readBoolean(record, "imageUseAuthorized"),
    souvenirsInfoAccepted: readBoolean(record, "souvenirsInfoAccepted"),
    acceptedAt: now,
    userAgent: (request.headers.get("user-agent") || "").slice(0, 500),
    adhesionTermVersion: readString(record, "adhesionTermVersion", 40),
    privacyPolicyVersion: readString(record, "privacyPolicyVersion", 40),
    platformTermsVersion: readString(record, "platformTermsVersion", 40),
    financialTermsVersion: readString(record, "financialTermsVersion", 40),
    imageUseTermVersion: readString(record, "imageUseTermVersion", 40),
    souvenirsTermVersion: readString(record, "souvenirsTermVersion", 40),
  };
}

function sanitizeParticipantSubmission(rawBody: unknown, request: Request) {
  const body = asRecord(rawBody);
  const now = new Date().toISOString();
  const name = readString(body, "name", 120);
  const phone = readString(body, "phone", 40);
  const email = readString(body, "email", 160).toLowerCase();
  const willAttend = readEnum(body.willAttend, ["yes", "maybe", "no"] as const);
  const termsAcceptance = sanitizeTerms(body.termsAcceptance, request, now);
  const errors: string[] = [];

  if (name.length < 3) errors.push("Informe o nome completo.");
  if (normalizePhone(phone).length < 10) errors.push("Informe um telefone válido.");
  if (!willAttend) errors.push("Informe sua intenção de participação.");
  if (!termsAcceptance.adhesionTermAccepted) errors.push("Aceite o termo de adesão.");
  if (!termsAcceptance.privacyPolicyAccepted) errors.push("Aceite a política de privacidade.");
  if (!termsAcceptance.platformTermsAccepted) errors.push("Aceite os termos de uso.");
  if (!termsAcceptance.financialTermsAccepted) errors.push("Confirme ciência das regras financeiras.");

  const officialKit = sanitizeOfficialKit(body.officialKit);

  if (!officialKit) {
    errors.push("Informe o interesse no Kit Oficial ATLAS.");
  }

  if (errors.length > 0) {
    return { errors, data: null };
  }

  const participant: JsonObject = {
    name,
    nickname: readString(body, "nickname", 80),
    email,
    phone,
    instagram: readString(body, "instagram", 80),
    linkedin: readString(body, "linkedin", 160),
    birthDate: readString(body, "birthDate", 20),
    currentFunction: readString(body, "currentFunction", 120),
    zipCode: readString(body, "zipCode", 20),
    address: readString(body, "address", 240),
    city: readString(body, "city", 120),
    state: readString(body, "state", 12).toUpperCase(),
    country: readString(body, "country", 80).toUpperCase(),
    willAttend: willAttend ?? "maybe",
    isFromOutOfState: readBoolean(body, "isFromOutOfState"),
    guestsCount: readNumber(body, "guestsCount", 0, 0, 20),
    needsHotelInfo: readBoolean(body, "needsHotelInfo"),
    needsTransportInfo: readBoolean(body, "needsTransportInfo"),
    wantsToHelpCommittee: readBoolean(body, "wantsToHelpCommittee"),
    notes: readString(body, "notes", 1500),
    paymentStatus: "not_started",
    totalPaid: 0,
    officialKit: officialKit || null,
    termsAcceptance,
    createdAt: now,
    updatedAt: now,
  };

  const stableSeed = normalizePhone(phone) || email || `${name}-${participant.birthDate}`;

  return {
    errors: [],
    data: {
      participant,
      documentId: createStableParticipantDocumentId(stableSeed),
    },
  };
}

function sanitizeSouvenirInterestSubmission(rawBody: unknown) {
  const body = asRecord(rawBody);
  const now = new Date().toISOString();
  const participantName = readString(body, "participantName", 120);
  const warName = readOptionalString(body, "warName", 80);
  const contactPhone = readString(body, "contactPhone", 40);
  const contactEmail = readString(body, "contactEmail", 160).toLowerCase();
  const souvenirId = readString(body, "souvenirId", 120);
  const souvenirName = readString(body, "souvenirName", 160);
  const souvenirCategory = readEnum(body.souvenirCategory, ["kit", "shirt", "pants", "mug", "cap", "patch", "other"] as const);
  const quantity = readNumber(body, "quantity", 1, 1, 99);
  const sizeValues = ["PP", "P", "M", "G", "GG", "XG", "XGG", "SPECIAL"] as const;
  const shirtSize = readEnum(body.shirtSize, sizeValues);
  const pantsSize = readEnum(body.pantsSize, sizeValues);
  const jacketSize = readEnum(body.jacketSize, sizeValues);
  const notes = readOptionalString(body, "notes", 500);
  const errors: string[] = [];

  if (participantName.length < 3) errors.push("Informe seu nome completo.");
  if (normalizePhone(contactPhone).length < 10) errors.push("Informe um telefone válido para identificação.");
  if (!souvenirId) errors.push("Item não informado.");
  if (!souvenirName) errors.push("Nome do item não informado.");

  if (errors.length > 0) {
    return { errors, data: null };
  }

  const normalizedPhone = normalizePhone(contactPhone);
  const participantId = createStableParticipantDocumentId(normalizedPhone || contactEmail || participantName);
  const documentId = createStableSouvenirInterestDocumentId(`${participantId}:${souvenirId}`);
  const data: JsonObject = {
    participantId,
    participantName,
    souvenirId,
    souvenirName,
    quantity,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  if (warName) data.warName = warName;
  if (contactPhone) data.contactPhone = contactPhone;
  if (contactEmail) data.contactEmail = contactEmail;
  if (souvenirCategory) data.souvenirCategory = souvenirCategory;
  if (shirtSize) data.shirtSize = shirtSize;
  if (pantsSize) data.pantsSize = pantsSize;
  if (jacketSize) data.jacketSize = jacketSize;
  if (notes) data.notes = notes;

  return {
    errors: [],
    data: {
      documentId,
      interest: data,
    },
  };
}

async function listPublicCollection(collection: string) {
  const queryByCollection: Record<string, JsonObject> = {
    schedule: {
      structuredQuery: {
        from: [{ collectionId: "schedule" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "isPublic" },
            op: "EQUAL",
            value: { booleanValue: true },
          },
        },
      },
    },
    souvenirs: {
      structuredQuery: {
        from: [{ collectionId: "souvenirs" }],
      },
    },
    transactions: {
      structuredQuery: {
        from: [{ collectionId: "transactions" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "isPublic" },
            op: "EQUAL",
            value: { booleanValue: true },
          },
        },
      },
    },
  };

  const res = await firestoreRunQuery(`events/${DEFAULT_EVENT_ID}`, queryByCollection[collection], {
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json([]);

  const rows = (await res.json()) as Array<{ document?: FirestoreDocument }>;
  return NextResponse.json(parseFirestoreQueryRows(rows));
}

async function createPublicSouvenirInterest(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const sanitized = sanitizeSouvenirInterestSubmission(body);

  if (!sanitized.data) {
    return jsonError(sanitized.errors.join(" "), 400, "invalid-souvenir-interest");
  }

  const souvenirRes = await firestoreFetch(`events/${DEFAULT_EVENT_ID}/souvenirs/${sanitized.data.interest.souvenirId}`, {
    cache: "no-store",
  });

  if (!souvenirRes.ok) {
    return jsonError("Item não encontrado ou indisponível para solicitação.", 404, "souvenir-not-found");
  }

  const souvenir = parseFirestoreDoc((await souvenirRes.json()) as FirestoreDocument);

  if (souvenir.available !== true) {
    return jsonError("Este item ainda não está disponível para registro de interesse.", 400, "souvenir-unavailable");
  }

  const query = new URLSearchParams();
  query.set("documentId", sanitized.data.documentId);

  const res = await firestoreFetch(`events/${DEFAULT_EVENT_ID}/souvenirInterests`, {
    method: "POST",
    query,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: serializeFirestoreFields(sanitized.data.interest) }),
  });

  if (res.status === 409) {
    return jsonError(
      "Já existe uma solicitação registrada para este item com este telefone. Fale com a comissão para ajustar a quantidade.",
      409,
      "souvenir-interest-already-exists"
    );
  }

  if (!res.ok) {
    return jsonError("Não foi possível registrar o interesse agora.", 500, "souvenir-interest-save-failed");
  }

  const result = (await res.json()) as { name: string };
  return NextResponse.json({ id: result.name.split("/").pop(), success: true });
}

async function createPublicParticipant(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const record = asRecord(body);
  const honeypot = readString(record, "website", 120);

  if (honeypot) {
    return NextResponse.json({ success: true, received: true }, { status: 202 });
  }

  if (isRateLimited(request)) {
    return jsonError(
      "Muitas tentativas em sequência. Aguarde alguns minutos e tente novamente.",
      429,
      "rate-limited"
    );
  }

  const sanitized = sanitizeParticipantSubmission(body, request);

  if (!sanitized.data) {
    return jsonError(sanitized.errors.join(" "), 400, "invalid-participant");
  }

  const query = new URLSearchParams();
  query.set("documentId", sanitized.data.documentId);

  const res = await firestoreFetch(`events/${DEFAULT_EVENT_ID}/participants`, {
    method: "POST",
    query,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: serializeFirestoreFields(sanitized.data.participant) }),
  });

  if (res.status === 409) {
    return jsonError(
      "Já existe um cadastro com estes dados principais. Se precisar corrigir alguma informação, fale com a comissão organizadora.",
      409,
      "participant-already-exists"
    );
  }

  if (!res.ok) {
    return jsonError(
      "Não foi possível salvar seu cadastro agora. Tente novamente em instantes.",
      500,
      "participant-save-failed"
    );
  }

  const result = (await res.json()) as { name: string };
  await syncPublicStatsSafely(DEFAULT_EVENT_ID);

  return NextResponse.json({ id: result.name.split("/").pop(), success: true });
}

function sanitizeAdminMutation(rawBody: unknown): JsonObject {
  const body = asRecord(rawBody);
  const now = new Date().toISOString();
  const result = Object.entries(body).reduce<JsonObject>((acc, [key, value]) => {
    if (value === undefined || key === "id") return acc;
    acc[key] = value as JsonObject[string];
    return acc;
  }, {});

  result.updatedAt = now;
  return result;
}

export async function GET(request: Request) {
  if (!hasFirebaseServerConfig()) return firebaseConfigErrorResponse();

  const { collection, id } = getCollection(request);
  if (!collection) return jsonError("Coleção não informada.", 400, "missing-collection");
  if (!collectionIsValid(collection)) return jsonError("Coleção inválida.", 400, "invalid-collection");

  if (!id && PUBLIC_READ_COLLECTIONS.has(collection)) {
    return listPublicCollection(collection);
  }

  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;
  if (!ADMIN_COLLECTIONS.has(collection)) return jsonError("Coleção não permitida.", 403, "collection-forbidden");

  const path = id
    ? `events/${DEFAULT_EVENT_ID}/${collection}/${id}`
    : `events/${DEFAULT_EVENT_ID}/${collection}`;

  if (id) {
    const res = await firestoreFetch(path, { token: session.token, cache: "no-store" });
    if (!res.ok) return NextResponse.json(null);
    return NextResponse.json(parseFirestoreDoc((await res.json()) as FirestoreDocument));
  }

  const result = await firestoreListAll(path, { token: session.token, cache: "no-store" });
  if (!result.ok) return NextResponse.json([]);
  return NextResponse.json(result.documents);
}

export async function POST(request: Request) {
  if (!hasFirebaseServerConfig()) return firebaseConfigErrorResponse();

  const { collection } = getCollection(request);
  if (!collection) return jsonError("Coleção não informada.", 400, "missing-collection");
  if (!collectionIsValid(collection)) return jsonError("Coleção inválida.", 400, "invalid-collection");

  const session = await requireAdminSession(request);

  if (session instanceof Response) {
    if (collection === "participants") {
      return createPublicParticipant(request);
    }

    if (collection === "souvenirInterests") {
      return createPublicSouvenirInterest(request);
    }

    return session;
  }

  if (!ADMIN_COLLECTIONS.has(collection)) return jsonError("Coleção não permitida.", 403, "collection-forbidden");

  const body = (await request.json().catch(() => null)) as unknown;
  const data = sanitizeAdminMutation(body);
  data.createdAt = typeof data.createdAt === "string" ? data.createdAt : data.updatedAt;

  const res = await firestoreFetch(`events/${DEFAULT_EVENT_ID}/${collection}`, {
    method: "POST",
    token: session.token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: serializeFirestoreFields(data) }),
  });

  if (!res.ok) {
    return jsonError("Não foi possível salvar o documento.", 500, "admin-save-failed");
  }

  const result = (await res.json()) as { name: string };
  if (collection === "participants") {
    await syncPublicStatsSafely(DEFAULT_EVENT_ID, session.token);
  }

  return NextResponse.json({ id: result.name.split("/").pop(), success: true });
}

export async function PATCH(request: Request) {
  if (!hasFirebaseServerConfig()) return firebaseConfigErrorResponse();

  const { collection, id } = getCollection(request);
  if (!collection || !id) return jsonError("Coleção ou ID não informado.", 400, "missing-collection-or-id");
  if (!collectionIsValid(collection)) return jsonError("Coleção inválida.", 400, "invalid-collection");

  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;
  if (!ADMIN_COLLECTIONS.has(collection)) return jsonError("Coleção não permitida.", 403, "collection-forbidden");

  const body = (await request.json().catch(() => null)) as unknown;
  const data = sanitizeAdminMutation(body);
  const query = buildUpdateMask(data);

  const res = await firestoreFetch(`events/${DEFAULT_EVENT_ID}/${collection}/${id}`, {
    method: "PATCH",
    token: session.token,
    query,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: serializeFirestoreFields(data) }),
  });

  if (!res.ok) {
    return jsonError("Não foi possível atualizar o documento.", 500, "admin-update-failed");
  }

  if (collection === "participants") {
    await syncPublicStatsSafely(DEFAULT_EVENT_ID, session.token);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  if (!hasFirebaseServerConfig()) return firebaseConfigErrorResponse();

  const { collection, id } = getCollection(request);
  if (!collection || !id) return jsonError("Coleção ou ID não informado.", 400, "missing-collection-or-id");
  if (!collectionIsValid(collection)) return jsonError("Coleção inválida.", 400, "invalid-collection");

  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;
  if (!ADMIN_COLLECTIONS.has(collection)) return jsonError("Coleção não permitida.", 403, "collection-forbidden");

  const res = await firestoreFetch(`events/${DEFAULT_EVENT_ID}/${collection}/${id}`, {
    method: "DELETE",
    token: session.token,
  });

  if (!res.ok) {
    return jsonError("Não foi possível excluir o documento.", 500, "admin-delete-failed");
  }

  if (collection === "participants") {
    await syncPublicStatsSafely(DEFAULT_EVENT_ID, session.token);
  }

  return NextResponse.json({ success: true });
}
