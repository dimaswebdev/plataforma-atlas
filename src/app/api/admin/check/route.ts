import { NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const EVENT_ID = "reencontro-30-anos-atlas-2027";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ isAdmin: false });
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/events/${EVENT_ID}/admins/${uid}?key=${API_KEY}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (res.ok) {
      return NextResponse.json({ isAdmin: true });
    }
    
    return NextResponse.json({ isAdmin: false });
  } catch (error) {
    return NextResponse.json({ isAdmin: false });
  }
}
