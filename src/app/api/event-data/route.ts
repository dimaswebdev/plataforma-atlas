import { NextResponse } from "next/server";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import {
  firebaseConfigErrorResponse,
  FirestoreDocument,
  firestoreFetch,
  firestoreRunQuery,
  hasFirebaseServerConfig,
  JsonObject,
  parseFirestoreDoc,
} from "@/lib/firebase-rest";

function asOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function getBestEffortConfirmedCount(event: JsonObject) {
  const publicStats = typeof event.publicStats === "object" && event.publicStats !== null
    ? (event.publicStats as JsonObject)
    : {};

  const storedCount = asOptionalNumber(publicStats.confirmedCount);
  if (storedCount !== null) return storedCount;

  const queryBody: JsonObject = {
    structuredQuery: {
      from: [{ collectionId: "participants" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "willAttend" },
          op: "EQUAL",
          value: { stringValue: "yes" },
        },
      },
      select: { fields: [{ fieldPath: "__name__" }] },
    },
  };

  try {
    const countRes = await firestoreRunQuery(`events/${DEFAULT_EVENT_ID}`, queryBody, {
      next: { revalidate: 60 },
    });

    if (!countRes.ok) return null;

    const rows = (await countRes.json()) as Array<{ document?: unknown }>;
    return rows.filter((row) => row.document).length;
  } catch {
    return null;
  }
}

export async function GET() {
  if (!hasFirebaseServerConfig()) {
    return firebaseConfigErrorResponse();
  }

  try {
    const eventRes = await firestoreFetch(`events/${DEFAULT_EVENT_ID}`, {
      next: { revalidate: 60 },
    });

    if (!eventRes.ok) {
      return NextResponse.json({
        event: null,
        confirmedCount: null,
        status: eventRes.status === 404 ? "event-not-found" : "event-unavailable",
      });
    }

    const event = parseFirestoreDoc((await eventRes.json()) as FirestoreDocument);
    const confirmedCount = await getBestEffortConfirmedCount(event);

    return NextResponse.json({
      event,
      confirmedCount,
      status: "ok",
    });
  } catch (error) {
    console.error("Event data API error:", error);
    return NextResponse.json({
      event: null,
      confirmedCount: null,
      status: "event-unavailable",
    });
  }
}
