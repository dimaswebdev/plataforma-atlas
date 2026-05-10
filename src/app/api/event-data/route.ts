import { NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const EVENT_ID = "reencontro-30-anos-atlas-2027";

function parseFirestoreValue(value: any): any {
  if (value?.stringValue !== undefined) return value.stringValue;
  if (value?.integerValue !== undefined) return Number(value.integerValue);
  if (value?.doubleValue !== undefined) return value.doubleValue;
  if (value?.booleanValue !== undefined) return value.booleanValue;
  if (value?.timestampValue !== undefined) return value.timestampValue;
  if (value?.nullValue !== undefined) return null;
  if (value?.mapValue !== undefined) {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      result[k] = parseFirestoreValue(v);
    }
    return result;
  }
  if (value?.arrayValue !== undefined) {
    return (value.arrayValue.values || []).map(parseFirestoreValue);
  }
  return null;
}

function parseFirestoreDoc(doc: any): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(doc.fields || {})) {
    result[key] = parseFirestoreValue(value);
  }
  return result;
}

export async function GET() {
  if (!PROJECT_ID || !API_KEY) {
    return NextResponse.json({ error: "Firebase config missing" }, { status: 500 });
  }

  try {
    // Fetch event document via REST API (server-side, no SDK issues)
    const eventUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/events/${EVENT_ID}?key=${API_KEY}`;
    const eventRes = await fetch(eventUrl, { next: { revalidate: 60 } });

    if (!eventRes.ok) {
      return NextResponse.json({ event: null, confirmedCount: 0 });
    }

    const eventDoc = await eventRes.json();
    const event = { id: EVENT_ID, ...parseFirestoreDoc(eventDoc) };

    // Fetch confirmed participants count via structured query
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`;
    const queryBody = {
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

    let confirmedCount = 0;
    try {
      const countRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/events/${EVENT_ID}:runQuery?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(queryBody),
          next: { revalidate: 60 },
        }
      );
      if (countRes.ok) {
        const rows = await countRes.json();
        confirmedCount = Array.isArray(rows) ? rows.filter((r: any) => r.document).length : 0;
      }
    } catch {
      confirmedCount = 0;
    }

    return NextResponse.json({ event, confirmedCount });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ event: null, confirmedCount: 0 });
  }
}
