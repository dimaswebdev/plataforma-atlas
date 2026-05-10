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
    const fields = serializeFields(body);

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

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const id = searchParams.get("id");

  if (!collection || !id) return NextResponse.json({ error: "Missing collection or id" }, { status: 400 });

  try {
    const body = await request.json();
    const fields = serializeFields(body);
    const updateMask = Object.keys(body).map(f => `updateMask.fieldPaths=${f}`).join('&');

    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/events/${EVENT_ID}/${collection}/${id}?${updateMask}&key=${API_KEY}`;
    
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields })
    });

    if (!res.ok) {
       const err = await res.json();
       throw new Error(err.error?.message || "Failed to update document");
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`API Error updating ${collection}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function serializeFields(obj: any): any {
  const fields: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    
    if (typeof value === 'string') fields[key] = { stringValue: value };
    else if (typeof value === 'number') {
      if (Number.isInteger(value)) fields[key] = { integerValue: value.toString() };
      else fields[key] = { doubleValue: value };
    }
    else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
    else if (Array.isArray(value)) {
      fields[key] = { arrayValue: { values: value.map(v => serializeValue(v)) } };
    }
    else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: serializeFields(value) } };
    }
  }
  return fields;
}

function serializeValue(value: any): any {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: value.toString() };
    return { doubleValue: value };
  }
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'object') return { mapValue: { fields: serializeFields(value) } };
  return { stringValue: String(value) };
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const id = searchParams.get("id");

  if (!collection || !id) return NextResponse.json({ error: "Missing collection or id" }, { status: 400 });

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/events/${EVENT_ID}/${collection}/${id}?key=${API_KEY}`;
    const res = await fetch(url, { method: "DELETE" });

    if (!res.ok) throw new Error("Failed to delete document");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`API Error deleting ${collection}:`, error);
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
