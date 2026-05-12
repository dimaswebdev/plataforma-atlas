import { NextResponse } from "next/server";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import { calculateParticipantMetrics } from "@/lib/participant-metrics";
import {
  firestoreListAll,
  requireAdminSession,
} from "@/lib/firebase-rest";
import { syncPublicStatsSafely } from "@/lib/public-stats";

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  try {
    const basePath = `events/${DEFAULT_EVENT_ID}`;

    const [participantsResult, transactionsResult] = await Promise.all([
      firestoreListAll(`${basePath}/participants`, {
        token: session.token,
        cache: "no-store",
      }),
      firestoreListAll(`${basePath}/transactions`, {
        token: session.token,
        cache: "no-store",
      }),
    ]);

    const participants = participantsResult.ok ? participantsResult.documents : [];
    const transactions = transactionsResult.ok ? transactionsResult.documents : [];

    const participantMetrics = calculateParticipantMetrics(participants);
    await syncPublicStatsSafely(DEFAULT_EVENT_ID, session.token);

    const kitInterest = participants.filter((participant) => {
      const officialKit = participant.officialKit;
      return typeof officialKit === "object"
        && officialKit !== null
        && !Array.isArray(officialKit)
        && officialKit.interest === "yes";
    }).length;

    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
      const amount = asNumber(transaction.amount);
      if (transaction.type === "income") income += amount;
      if (transaction.type === "expense") expense += amount;
    });

    return NextResponse.json({
      ...participantMetrics,
      kitInterest,
      income,
      expense,
    });
  } catch (error) {
    console.error("Dashboard Stats API error:", error);
    return NextResponse.json(
      {
        error: "Não foi possível carregar as métricas administrativas.",
        totalParticipants: 0,
        confirmedParticipants: 0,
        totalGuests: 0,
        totalPeople: 0,
        kitInterest: 0,
        income: 0,
        expense: 0,
      },
      { status: 500 }
    );
  }
}
