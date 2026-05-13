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
  guestCount: number | null;
  totalPeople: number | null;
  interestedCount: number | null;
  kitCount: number | null;
  totalIncome: number | null;
  totalExpense: number | null;
  balance: number | null;
  reason?: string;
  updated: boolean;
};

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function buildPublicStats(
  participants: JsonObject[],
  transactions: JsonObject[],
  eventId: string,
  updatedAt: JsonObject[string]
) {
  const metrics = calculateParticipantMetrics(participants);
  const kitCount = participants.filter((participant) => {
    const officialKit = participant.officialKit;
    return typeof officialKit === "object"
      && officialKit !== null
      && !Array.isArray(officialKit)
      && officialKit.interest === "yes";
  }).length;
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((transaction) => {
    if (transaction.isPublic !== true) return;
    const amount = asNumber(transaction.amount);
    if (transaction.type === "income") totalIncome += amount;
    if (transaction.type === "expense") totalExpense += amount;
  });

  return {
    confirmedCount: metrics.confirmedParticipants,
    guestCount: metrics.totalGuests,
    totalPeople: metrics.totalPeople,
    interestedCount: metrics.totalParticipants,
    kitCount,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    eventId,
    updatedAt,
  };
}

async function recalculatePublicStatsWithAdminToken(eventId: string, token: string): Promise<PublicStatsSyncResult> {
  const participantsResult = await firestoreListAll(`events/${eventId}/participants`, {
    token,
    cache: "no-store",
  });

  if (!participantsResult.ok) {
    return {
      confirmedCount: null,
      guestCount: null,
      totalPeople: null,
      interestedCount: null,
      kitCount: null,
      totalIncome: null,
      totalExpense: null,
      balance: null,
      reason: `participants-read-failed-${participantsResult.status}`,
      updated: false,
    };
  }

  const transactionsResult = await firestoreListAll(`events/${eventId}/transactions`, {
    token,
    cache: "no-store",
  });
  const transactions = transactionsResult.ok ? transactionsResult.documents : [];
  const publicStats = buildPublicStats(participantsResult.documents, transactions, eventId, new Date().toISOString());

  const statsRes = await firestoreFetch(`events/${eventId}/publicStats/${PUBLIC_STATS_DOC_ID}`, {
    method: "PATCH",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: serializeFirestoreFields(publicStats) }),
  });

  if (!statsRes.ok) {
    return {
      confirmedCount: null,
      guestCount: null,
      totalPeople: null,
      interestedCount: null,
      kitCount: null,
      totalIncome: null,
      totalExpense: null,
      balance: null,
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
    confirmedCount: Number(publicStats.confirmedCount),
    guestCount: Number(publicStats.guestCount),
    totalPeople: Number(publicStats.totalPeople),
    interestedCount: Number(publicStats.interestedCount),
    kitCount: Number(publicStats.kitCount),
    totalIncome: Number(publicStats.totalIncome),
    totalExpense: Number(publicStats.totalExpense),
    balance: Number(publicStats.balance),
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
      guestCount: null,
      totalPeople: null,
      interestedCount: null,
      kitCount: null,
      totalIncome: null,
      totalExpense: null,
      balance: null,
      reason: "firebase-admin-config-missing",
      updated: false,
    };
  }

  const eventRef = adminDb.collection("events").doc(eventId);
  const statsRef = eventRef.collection("publicStats").doc(PUBLIC_STATS_DOC_ID);
  const participantsSnapshot = await eventRef.collection("participants").get();
  const participants = participantsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JsonObject));
  const transactionsSnapshot = await eventRef.collection("transactions").get();
  const transactions = transactionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JsonObject));
  const publicStats = buildPublicStats(
    participants,
    transactions,
    eventId,
    FieldValue.serverTimestamp() as unknown as JsonObject[string]
  );

  await adminDb.batch()
    .set(statsRef, publicStats, { merge: true })
    .set(eventRef, { publicStats }, { merge: true })
    .commit();

  return {
    confirmedCount: Number(publicStats.confirmedCount),
    guestCount: Number(publicStats.guestCount),
    totalPeople: Number(publicStats.totalPeople),
    interestedCount: Number(publicStats.interestedCount),
    kitCount: Number(publicStats.kitCount),
    totalIncome: Number(publicStats.totalIncome),
    totalExpense: Number(publicStats.totalExpense),
    balance: Number(publicStats.balance),
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
      guestCount: null,
      totalPeople: null,
      interestedCount: null,
      kitCount: null,
      totalIncome: null,
      totalExpense: null,
      balance: null,
      reason: "public-stats-sync-failed",
      updated: false,
    };
  }
}
