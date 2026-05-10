import { NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const EVENT_ID = "reencontro-30-anos-atlas-2027";

export async function GET() {
  if (!PROJECT_ID || !API_KEY) {
    return NextResponse.json({ error: "Config missing" }, { status: 500 });
  }

  try {
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/events/${EVENT_ID}`;
    
    // 1. Total Participants Count (Fetch collection items list, simpler than structured query for smaller sets)
    // For large collections, we'd use runQuery, but for now this is robust.
    const pRes = await fetch(`${baseUrl}/participants?mask.fieldPaths=willAttend&key=${API_KEY}`, { cache: 'no-store' });
    const pData = await pRes.json();
    const participants = pData.documents || [];
    
    const totalParticipants = participants.length;
    const confirmedParticipants = participants.filter((p: any) => p.fields?.willAttend?.stringValue === "yes").length;
    const kitInterest = participants.filter((p: any) => p.fields?.officialKit?.mapValue?.fields?.interest?.stringValue === "yes").length;

    // 2. Transactions (Income/Expense)
    const tRes = await fetch(`${baseUrl}/transactions?key=${API_KEY}`, { cache: 'no-store' });
    const tData = await tRes.json();
    const transactions = tData.documents || [];

    let income = 0;
    let expense = 0;

    transactions.forEach((t: any) => {
      const amount = Number(t.fields?.amount?.doubleValue || t.fields?.amount?.integerValue || 0);
      const type = t.fields?.type?.stringValue;
      if (type === "income") income += amount;
      if (type === "expense") expense += amount;
    });

    return NextResponse.json({
      totalParticipants,
      confirmedParticipants,
      kitInterest,
      income,
      expense
    });
  } catch (error) {
    console.error("Dashboard Stats API error:", error);
    return NextResponse.json({
      totalParticipants: 0,
      confirmedParticipants: 0,
      kitInterest: 0,
      income: 0,
      expense: 0
    });
  }
}
