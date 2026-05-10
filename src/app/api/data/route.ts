import { NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const EVENT_ID = "reencontro-30-anos-atlas-2027";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const id = searchParams.get("id");

  if (!collection) return NextResponse.json({ error: "Missing collection" }, { status: 400 });

  try {
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/events/${EVENT_ID}/${collection}`;
    const url = id ? `${baseUrl}/${id}?key=${API_KEY}` : `${baseUrl}?key=${API_KEY}`;
    
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    
    if (id) {
      if (!res.ok) return NextResponse.json(null);
      return NextResponse.json({ id: data.name.split('/').pop(), ...parseFields(data.fields) });
    }

    // Parse Firestore REST format to clean JSON for list
    const items = (data.documents || []).map((doc: any) => ({
      id: doc.name.split('/').pop(),
      ...parseFields(doc.fields)
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error(`API Error fetching ${collection}:`, error);
    return NextResponse.json(id ? null : []);
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");

  if (!collection) return NextResponse.json({ error: "Missing collection" }, { status: 400 });

  try {
    const body = await request.json();
    
    // Convert clean JSON to Firestore REST format
    const fields: any = {};
    for (const [key, value] of Object.entries(body)) {
      if (value === null || value === undefined) continue;
      if (typeof value === 'string') fields[key] = { stringValue: value };
      else if (typeof value === 'number') {
        if (Number.isInteger(value)) fields[key] = { integerValue: value.toString() };
        else fields[key] = { doubleValue: value };
      }
      else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
      else if (value instanceof Date) fields[key] = { timestampValue: value.toISOString() };
      else if (typeof value === 'object') {
         // Recursive map or simplified
         fields[key] = { stringValue: JSON.stringify(value) }; // Simplified for now, can be improved
      }
    }

    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/events/${EVENT_ID}/${collection}?key=${API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Failed to save document");
    }

    const result = await res.json();
    return NextResponse.json({ id: result.name.split('/').pop(), success: true });
  } catch (error: any) {
    console.error(`API Error saving to ${collection}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function parseFields(fields: any): any {
  const result: any = {};
  for (const [key, value] of Object.entries(fields || {})) {
    const val: any = value;
    if (val.stringValue !== undefined) result[key] = val.stringValue;
    else if (val.integerValue !== undefined) result[key] = Number(val.integerValue);
    else if (val.doubleValue !== undefined) result[key] = val.doubleValue;
    else if (val.booleanValue !== undefined) result[key] = val.booleanValue;
    else if (val.mapValue !== undefined) result[key] = parseFields(val.mapValue.fields);
    else if (val.arrayValue !== undefined) result[key] = (val.arrayValue.values || []).map((v: any) => parseValue(v));
    else result[key] = val;
  }
  return result;
}

function parseValue(val: any): any {
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return Number(val.integerValue);
  if (val.doubleValue !== undefined) return val.doubleValue;
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.mapValue !== undefined) return parseFields(val.mapValue.fields);
  return val;
}
