import { NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const EVENT_ID = "reencontro-30-anos-atlas-2027";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");

  if (!collection) return NextResponse.json({ error: "Missing collection" }, { status: 400 });

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/events/${EVENT_ID}/${collection}?key=${API_KEY}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    
    // Parse Firestore REST format to clean JSON
    const items = (data.documents || []).map((doc: any) => {
      const fields: any = {};
      for (const [key, value] of Object.entries(doc.fields || {})) {
        // Simple parser for common types
        const val: any = value;
        if (val.stringValue !== undefined) fields[key] = val.stringValue;
        else if (val.integerValue !== undefined) fields[key] = Number(val.integerValue);
        else if (val.doubleValue !== undefined) fields[key] = val.doubleValue;
        else if (val.booleanValue !== undefined) fields[key] = val.booleanValue;
        else if (val.mapValue !== undefined) fields[key] = val.mapValue.fields; // simplified
        else fields[key] = val;
      }
      return { id: doc.name.split('/').pop(), ...fields };
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error(`API Error fetching ${collection}:`, error);
    return NextResponse.json([]);
  }
}
