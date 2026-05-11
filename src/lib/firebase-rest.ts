import "server-only";

import { createHash } from "crypto";
import { DEFAULT_EVENT_ID } from "@/lib/constants";

type FirestoreEncodedValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  nullValue?: null;
  mapValue?: { fields?: FirestoreEncodedFields };
  arrayValue?: { values?: FirestoreEncodedValue[] };
};

type FirestoreEncodedFields = Record<string, FirestoreEncodedValue>;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export type FirestoreDocument = {
  name: string;
  fields?: FirestoreEncodedFields;
};

type FirebaseLookupResponse = {
  users?: Array<{
    localId: string;
    email?: string;
    emailVerified?: boolean;
  }>;
};

export type FirebaseUserSession = {
  uid: string;
  email?: string;
  emailVerified: boolean;
  token: string;
};

export type AdminSession = FirebaseUserSession & {
  role?: string;
};

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const DATABASE_ID = "(default)";

export function hasFirebaseServerConfig() {
  return Boolean(PROJECT_ID && API_KEY);
}

export function firebaseConfigErrorResponse() {
  return Response.json(
    {
      error: "Configuração do Firebase indisponível.",
      code: "firebase-config-missing",
    },
    { status: 500 }
  );
}

function firestoreRootUrl() {
  if (!PROJECT_ID) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID não configurado.");
  }

  return `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;
}

function withApiKey(url: string) {
  if (!API_KEY) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY não configurada.");
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}key=${encodeURIComponent(API_KEY)}`;
}

export function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function verifyFirebaseIdToken(token: string): Promise<FirebaseUserSession | null> {
  if (!API_KEY) return null;

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store",
    }
  );

  if (!res.ok) return null;

  const data = (await res.json()) as FirebaseLookupResponse;
  const user = data.users?.[0];

  if (!user?.localId) return null;

  return {
    uid: user.localId,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    token,
  };
}

export async function getAdminSession(request: Request): Promise<AdminSession | null> {
  const token = getBearerToken(request);
  if (!token) return null;

  const user = await verifyFirebaseIdToken(token);
  if (!user) return null;

  const adminDoc = await firestoreFetch(`events/${DEFAULT_EVENT_ID}/admins/${user.uid}`, {
    token,
    cache: "no-store",
  });

  if (!adminDoc.ok) return null;

  const doc = (await adminDoc.json()) as FirestoreDocument;
  const data = parseFirestoreDoc(doc);

  return {
    ...user,
    role: typeof data.role === "string" ? data.role : undefined,
  };
}

export async function requireAdminSession(request: Request): Promise<AdminSession | Response> {
  if (!hasFirebaseServerConfig()) return firebaseConfigErrorResponse();

  const session = await getAdminSession(request);
  if (!session) {
    return Response.json(
      {
        error: "Sessão administrativa inválida ou sem permissão.",
        code: "admin-auth-required",
      },
      { status: 401 }
    );
  }

  return session;
}

export async function firestoreFetch(
  path: string,
  init: RequestInit & { token?: string; query?: URLSearchParams } = {}
) {
  const { token, query, headers, ...rest } = init;
  const suffix = query?.toString();
  const url = withApiKey(`${firestoreRootUrl()}/${path}${suffix ? `?${suffix}` : ""}`);
  const requestHeaders = new Headers(headers);

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...rest,
    headers: requestHeaders,
  });
}

export async function firestoreRunQuery(
  path: string,
  body: JsonObject,
  init: RequestInit & { token?: string } = {}
) {
  return firestoreFetch(`${path}:runQuery`, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : init.headers),
    },
    body: JSON.stringify(body),
  });
}

export function parseFirestoreValue(value: FirestoreEncodedValue): JsonValue {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.nullValue !== undefined) return null;
  if (value.mapValue !== undefined) {
    return parseFirestoreFields(value.mapValue.fields || {});
  }
  if (value.arrayValue !== undefined) {
    return (value.arrayValue.values || []).map(parseFirestoreValue);
  }
  return null;
}

export function parseFirestoreFields(fields: FirestoreEncodedFields): JsonObject {
  return Object.entries(fields).reduce<JsonObject>((acc, [key, value]) => {
    acc[key] = parseFirestoreValue(value);
    return acc;
  }, {});
}

export function parseFirestoreDoc(doc: FirestoreDocument): JsonObject {
  return {
    id: doc.name.split("/").pop() || "",
    ...parseFirestoreFields(doc.fields || {}),
  };
}

export function parseFirestoreList(data: { documents?: FirestoreDocument[] }): JsonObject[] {
  return (data.documents || []).map(parseFirestoreDoc);
}

export function parseFirestoreQueryRows(rows: Array<{ document?: FirestoreDocument }>): JsonObject[] {
  return rows.flatMap((row) => (row.document ? [parseFirestoreDoc(row.document)] : []));
}

export function serializeFirestoreValue(value: JsonValue | Date): FirestoreEncodedValue {
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (value === null) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: value.toString() } : { doubleValue: value };
  }
  if (typeof value === "boolean") return { booleanValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map((item) => serializeFirestoreValue(item)) } };
  }

  return { mapValue: { fields: serializeFirestoreFields(value) } };
}

export function serializeFirestoreFields(obj: JsonObject): FirestoreEncodedFields {
  return Object.entries(obj).reduce<FirestoreEncodedFields>((acc, [key, value]) => {
    if (value === undefined) return acc;
    acc[key] = serializeFirestoreValue(value);
    return acc;
  }, {});
}

export function buildUpdateMask(data: JsonObject) {
  const params = new URLSearchParams();
  Object.keys(data).forEach((field) => {
    params.append("updateMask.fieldPaths", field);
  });
  return params;
}

export function createStableParticipantDocumentId(seed: string) {
  const hash = createHash("sha256").update(seed.trim().toLowerCase()).digest("hex").slice(0, 24);
  return `participant-${hash}`;
}
