import { NextResponse } from "next/server";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import {
  firebaseConfigErrorResponse,
  FirestoreDocument,
  firestoreFetch,
  hasFirebaseServerConfig,
  JsonObject,
  parseFirestoreDoc,
} from "@/lib/firebase-rest";
import { PUBLIC_STATS_DOC_ID } from "@/lib/public-stats";

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function GET() {
  if (!hasFirebaseServerConfig()) return firebaseConfigErrorResponse();

  const eventRes = await firestoreFetch(`events/${DEFAULT_EVENT_ID}`, {
    next: { revalidate: 60 },
  });

  if (!eventRes.ok) {
    return NextResponse.json({
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      confirmedCount: 0,
      guestCount: 0,
      totalPeople: 0,
      interestedCount: 0,
      kitCount: 0,
    });
  }

  const event = parseFirestoreDoc((await eventRes.json()) as FirestoreDocument);
  const eventPublicStats = typeof event.publicStats === "object" && event.publicStats !== null
    ? (event.publicStats as JsonObject)
    : {};
  let publicStats = eventPublicStats;

  const statsRes = await firestoreFetch(`events/${DEFAULT_EVENT_ID}/publicStats/${PUBLIC_STATS_DOC_ID}`, {
    cache: "no-store",
  });

  if (statsRes.ok) {
    publicStats = parseFirestoreDoc((await statsRes.json()) as FirestoreDocument);
  }

  const totalIncome = asNumber(publicStats.totalIncome);
  const totalExpense = asNumber(publicStats.totalExpense);

  return NextResponse.json({
    totalIncome,
    totalExpense,
    balance: asNumber(publicStats.balance),
    confirmedCount: asNumber(publicStats.confirmedCount),
    guestCount: asNumber(publicStats.guestCount),
    totalPeople: asNumber(publicStats.totalPeople),
    interestedCount: asNumber(publicStats.interestedCount),
    kitCount: asNumber(publicStats.kitCount),
  });
}
