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
  parseFirestoreQueryRows,
} from "@/lib/firebase-rest";

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
    });
  }

  const event = parseFirestoreDoc((await eventRes.json()) as FirestoreDocument);
  const publicStats = typeof event.publicStats === "object" && event.publicStats !== null
    ? (event.publicStats as JsonObject)
    : {};

  const queryBody: JsonObject = {
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
  };

  let totalIncome = 0;
  let totalExpense = 0;

  const transactionsRes = await firestoreRunQuery(`events/${DEFAULT_EVENT_ID}`, queryBody, {
    next: { revalidate: 60 },
  });

  if (transactionsRes.ok) {
    const rows = (await transactionsRes.json()) as Array<{ document?: FirestoreDocument }>;
    parseFirestoreQueryRows(rows).forEach((transaction) => {
      const amount = asNumber(transaction.amount);
      if (transaction.type === "income") totalIncome += amount;
      if (transaction.type === "expense") totalExpense += amount;
    });
  }

  return NextResponse.json({
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    confirmedCount: asNumber(publicStats.confirmedCount),
  });
}
