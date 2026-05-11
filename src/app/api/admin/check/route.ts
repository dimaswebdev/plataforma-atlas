import { NextResponse } from "next/server";
import { firebaseConfigErrorResponse, getAdminSession, hasFirebaseServerConfig } from "@/lib/firebase-rest";

export async function GET(request: Request) {
  if (!hasFirebaseServerConfig()) {
    return firebaseConfigErrorResponse();
  }

  const session = await getAdminSession(request);

  return NextResponse.json({
    isAdmin: Boolean(session),
    uid: session?.uid ?? null,
    email: session?.email ?? null,
    role: session?.role ?? null,
  });
}
