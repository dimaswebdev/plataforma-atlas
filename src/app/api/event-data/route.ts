import { NextResponse } from "next/server";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import {
  FirestoreDocument,
  firestoreFetch,
  hasFirebaseServerConfig,
  JsonObject,
  parseFirestoreDoc,
} from "@/lib/firebase-rest";
import { PUBLIC_STATS_DOC_ID, recalculatePublicStats } from "@/lib/public-stats";

const fallbackEvent: JsonObject = {
  id: DEFAULT_EVENT_ID,
  title: "Reencontro 30 Anos - Turma ATLAS",
  subtitle: "Força Aérea Brasileira | 1997-2027",
  city: "Campo Grande/MS",
  location: "Campo Grande/MS",
  eventMonth: "Março",
  eventYear: 2027,
  mainDate: "2027-03-20T10:00:00",
  date: "2027-03-20T10:00:00",
  status: "planning",
  budgetGoal: 110000,
  heroDescription:
    "Três décadas de histórias, missões, amizades e memórias. O Portal ATLAS reúne as informações oficiais do reencontro de 30 anos da turma, com programação, prestação de contas, souvenirs, orientações para quem vem de fora e comunicados da comissão organizadora.",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function asOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeEvent(event: JsonObject | null): JsonObject {
  const merged: JsonObject = {
    ...fallbackEvent,
    ...(event || {}),
  };
  const mainDate = asString(merged.mainDate) || asString(merged.date) || asString(fallbackEvent.mainDate);
  const city = asString(merged.city) || asString(merged.location) || asString(fallbackEvent.city);

  return {
    ...merged,
    title: asString(merged.title) || fallbackEvent.title,
    subtitle: asString(merged.subtitle) || fallbackEvent.subtitle,
    city,
    location: city,
    mainDate,
    date: mainDate,
    eventMonth: asString(merged.eventMonth) || fallbackEvent.eventMonth,
    eventYear: asOptionalNumber(merged.eventYear) ?? fallbackEvent.eventYear,
    status: asString(merged.status) || fallbackEvent.status,
    budgetGoal: asOptionalNumber(merged.budgetGoal) ?? fallbackEvent.budgetGoal,
    heroDescription: asString(merged.heroDescription) || fallbackEvent.heroDescription,
  };
}

async function readJson<T>(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function eventDataResponse(event: JsonObject | null, confirmedCount: number | null, status: string) {
  return NextResponse.json({
    event: normalizeEvent(event),
    confirmedCount,
    status,
  });
}

async function getStoredPublicConfirmedCount(event: JsonObject) {
  const publicStats = typeof event.publicStats === "object" && event.publicStats !== null
    ? (event.publicStats as JsonObject)
    : {};

  const storedCount = asOptionalNumber(publicStats.confirmedCount);
  if (storedCount !== null) return storedCount;

  try {
    const statsRes = await firestoreFetch(`events/${DEFAULT_EVENT_ID}/publicStats/${PUBLIC_STATS_DOC_ID}`, {
      cache: "no-store",
    });

    if (!statsRes.ok) {
      console.warn(`Public stats document unavailable: ${statsRes.status}`);
      return null;
    }

    const statsDoc = await readJson<FirestoreDocument>(statsRes);
    if (!statsDoc) return null;

    const stats = parseFirestoreDoc(statsDoc);
    return asOptionalNumber(stats.confirmedCount);
  } catch (error) {
    console.warn("Public stats read failed:", error);
    return null;
  }
}

async function getBestEffortConfirmedCount(event: JsonObject) {
  const storedCount = await getStoredPublicConfirmedCount(event);
  if (storedCount !== null) return storedCount;

  try {
    const syncResult = await recalculatePublicStats(DEFAULT_EVENT_ID);
    if (syncResult.confirmedCount !== null) {
      return syncResult.confirmedCount;
    }

    console.warn(`Public stats sync unavailable: ${syncResult.reason || "unknown"}`);
  } catch (error) {
    console.warn("Public stats sync failed:", error);
  }

  return null;
}

export async function GET() {
  if (!hasFirebaseServerConfig()) {
    return eventDataResponse(null, null, "firebase-config-missing");
  }

  try {
    const eventRes = await firestoreFetch(`events/${DEFAULT_EVENT_ID}`, { cache: "no-store" });

    if (!eventRes.ok) {
      return eventDataResponse(null, null, eventRes.status === 404 ? "event-not-found" : "event-unavailable");
    }

    const eventDoc = await readJson<FirestoreDocument>(eventRes);
    if (!eventDoc) {
      return eventDataResponse(null, null, "event-invalid-response");
    }

    const event = normalizeEvent(parseFirestoreDoc(eventDoc));
    const confirmedCount = await getBestEffortConfirmedCount(event);

    return eventDataResponse(event, confirmedCount, "ok");
  } catch (error) {
    console.warn("Event data route fallback:", error);
    return eventDataResponse(null, null, "event-unavailable");
  }
}
