"use client";

import { auth } from "@/lib/firebase";

export async function fetchWithAdminAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("Sessão administrativa expirada. Entre novamente.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, {
    ...init,
    headers,
  });
}
