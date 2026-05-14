import { NextResponse } from "next/server";
import type { DocumentData } from "firebase-admin/firestore";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import { getFirebaseAdminDb, hasFirebaseAdminConfig, verifyFirebaseAdminIdToken } from "@/lib/firebase-admin";
import {
  getBearerToken,
  JsonObject,
} from "@/lib/firebase-rest";
import { normalizeEmail } from "@/lib/input-sanitization";

export const dynamic = "force-dynamic";

const PARTICIPANT_DTO_FIELDS = [
  "id",
  "name",
  "nickname",
  "email",
  "phone",
  "birthDate",
  "currentFunction",
  "city",
  "state",
  "country",
  "willAttend",
  "guestsCount",
  "wantsToHelpCommittee",
  "officialKit",
  "registrationStatus",
  "linkedAt",
  "lastSelfUpdateAt",
] as const;

function participantDto(id: string, data: DocumentData): JsonObject {
  const source: Record<string, unknown> = { id, ...data };

  return PARTICIPANT_DTO_FIELDS.reduce<JsonObject>((acc, field) => {
    const value = source[field];
    if (value !== undefined) acc[field] = value as JsonObject[string];
    return acc;
  }, {});
}

function jsonError(error: string, status: number, code: string) {
  return NextResponse.json({ error, code }, { status });
}

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return jsonError("Entre com e-mail e senha para acessar a área do participante.", 401, "participant-auth-required");
  }

  if (!hasFirebaseAdminConfig()) {
    return jsonError(
      "Configuração administrativa do Firebase indisponível para localizar o cadastro do participante.",
      503,
      "firebase-admin-config-missing"
    );
  }

  const session = await verifyFirebaseAdminIdToken(token);
  if (!session) {
    return jsonError("Sessão do participante inválida ou expirada.", 401, "participant-auth-invalid");
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    return jsonError("Banco administrativo indisponível.", 503, "firebase-admin-db-unavailable");
  }

  const participantsRef = db.collection("events").doc(DEFAULT_EVENT_ID).collection("participants");
  const uidSnapshot = await participantsRef.where("authUid", "==", session.uid).limit(2).get();

  if (uidSnapshot.size > 1) {
    return NextResponse.json(
      {
        status: "conflict",
        code: "participant-uid-conflict",
        message: "Existe mais de um cadastro vinculado a esta conta. A comissão precisa validar o vínculo.",
      },
      { status: 409 }
    );
  }

  if (uidSnapshot.size === 1) {
    const doc = uidSnapshot.docs[0];
    return NextResponse.json({
      status: "linked",
      participant: participantDto(doc.id, doc.data()),
    });
  }

  const emailNormalized = normalizeEmail(session.email, 160);
  if (!emailNormalized) {
    return NextResponse.json({
      status: "needs_registration",
      message: "Não há e-mail confirmado na sessão. Complete o cadastro passo a passo.",
    });
  }

  const emailSnapshot = await participantsRef.where("emailNormalized", "==", emailNormalized).limit(3).get();

  if (emailSnapshot.empty) {
    return NextResponse.json({
      status: "needs_registration",
      message: "Nenhum cadastro foi encontrado para este e-mail. Complete o cadastro passo a passo.",
    });
  }

  if (emailSnapshot.size > 1) {
    return NextResponse.json(
      {
        status: "conflict",
        code: "participant-email-conflict",
        message: "Mais de um cadastro usa este e-mail. A comissão precisa validar o vínculo antes do acesso individual.",
      },
      { status: 409 }
    );
  }

  const doc = emailSnapshot.docs[0];
  const participant = doc.data();
  const existingAuthUid = typeof participant.authUid === "string" ? participant.authUid : "";

  if (existingAuthUid && existingAuthUid !== session.uid) {
    return NextResponse.json(
      {
        status: "conflict",
        code: "participant-already-linked",
        message: "Este cadastro já está vinculado a outra conta. Solicite apoio da comissão para corrigir o acesso.",
      },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  await doc.ref.set(
    {
      authUid: session.uid,
      emailNormalized,
      registrationStatus: "linked",
      linkedAt: participant.linkedAt || now,
      updatedAt: now,
    },
    { merge: true }
  );

  const updated = await doc.ref.get();

  return NextResponse.json({
    status: "linked",
    participant: participantDto(updated.id, updated.data() || {}),
  });
}
