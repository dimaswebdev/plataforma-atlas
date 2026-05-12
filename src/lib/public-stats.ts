import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  buildUpdateMask,
  firestoreFetch,
  firestoreListAll,
  JsonObject,
  serializeFirestoreFields,
} from "@/lib/firebase-rest";
import { calculateParticipantMetrics } from "@/lib/participant-metrics";

export const PUBLIC_STATS_DOC_ID = "main";

export type PublicStatsSyncResult = {
  confirmedCount: number | null;
  reason?: string;
  updated: boolean;
};

async function recalculatePublicStatsWithAdminToken(eventId: string, token: string): Promise<PublicStatsSyncResult> {
  const participantsResult = await firestoreListAll(`events/${eventId}/participants`, {
    token,
    cache: "no-store",
  });

  if (!participantsResult.ok) {
    return {
      confirmedCount: null,
      reason: `participants-read-failed-${participantsResult.status}`,
      updated: false,
    };
  }

  const { confirmedParticipants: confirmedCount } = calculateParticipantMetrics(participantsResult.documents);
  const publicStats: JsonObject = {
    confirmedCount,
    eventId,
    updatedAt: new Date().toISOString(),
  };

  const statsRes = await firestoreFetch(`events/${eventId}/publicStats/${PUBLIC_STATS_DOC_ID}`, {
    method: "PATCH",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: serializeFirestoreFields(publicStats) }),
  });

  if (!statsRes.ok) {
    return {
      confirmedCount: null,
      reason: `public-stats-write-failed-${statsRes.status}`,
      updated: false,
    };
  }

  const eventPatch: JsonObject = { publicStats };
  const eventRes = await firestoreFetch(`events/${eventId}`, {
    method: "PATCH",
    token,
    query: buildUpdateMask(eventPatch),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: serializeFirestoreFields(eventPatch) }),
  });

  if (!eventRes.ok) {
    console.warn(`Public stats legacy event field update failed: ${eventRes.status}`);
  }

  return {
    confirmedCount,
    updated: true,
  };
}

export async function recalculatePublicStats(
  eventId = DEFAULT_EVENT_ID,
  adminToken?: string
): Promise<PublicStatsSyncResult> {
  const adminDb = getFirebaseAdminDb();

  if (!adminDb) {
    if (adminToken) {
      return recalculatePublicStatsWithAdminToken(eventId, adminToken);
    }

    console.warn(
      "Public stats sync skipped: FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY are not configured."
    );
    return {
      confirmedCount: null,
      reason: "firebase-admin-config-missing",
      updated: false,
    };
  }

  const eventRef = adminDb.collection("events").doc(eventId);
  const statsRef = eventRef.collection("publicStats").doc(PUBLIC_STATS_DOC_ID);
  const confirmedSnapshot = await eventRef
    .collection("participants")
    .where("willAttend", "==", "yes")
    .count()
    .get();

  const confirmedCount = confirmedSnapshot.data().count;
  const publicStats = {
    confirmedCount,
    eventId,
    updatedAt: FieldValue.serverTimestamp(),
  };

  await adminDb.batch()
    .set(statsRef, publicStats, { merge: true })
    .set(eventRef, { publicStats }, { merge: true })
    .commit();

  return {
    confirmedCount,
    updated: true,
  };
}

export async function syncPublicStatsSafely(
  eventId = DEFAULT_EVENT_ID,
  adminToken?: string
): Promise<PublicStatsSyncResult> {
  try {
    return await recalculatePublicStats(eventId, adminToken);
  } catch (error) {
    console.warn("Public stats sync failed:", error);
    return {
      confirmedCount: null,
      reason: "public-stats-sync-failed",
      updated: false,
    };
  }
}
