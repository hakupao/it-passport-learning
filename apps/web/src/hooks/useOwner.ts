// H1-1 (D-217) — the owner flag, read in the browser so pages need no server cookie read (static
// prerender). The middleware sets the readable hint cookie (OWNER_HINT_COOKIE) next to the httpOnly
// itp_owner on `?owner_key=` and clears both on logout. The hint only gates UI (the learning-record
// sync attempt, the feedback button); /api/learning and /api/quiz/feedback still check itp_owner
// (isOwnerRequest), so a forged hint only earns 403s.
//
// null = not settled: during SSR and the first client render (the server HTML has no owner UI, so
// hydration matches), then true / false after mount.

"use client";

import { useEffect, useState } from "react";

import { OWNER_HINT_COOKIE, OWNER_HINT_VALUE } from "@/lib/owner";

/** True iff the cookie string (document.cookie form) has OWNER_HINT_COOKIE=OWNER_HINT_VALUE. */
export function hasOwnerHint(cookie: string): boolean {
  return cookie.split(";").some((part) => {
    const eq = part.indexOf("=");
    return eq !== -1 && part.slice(0, eq).trim() === OWNER_HINT_COOKIE && part.slice(eq + 1).trim() === OWNER_HINT_VALUE;
  });
}

export function useOwner(): boolean | null {
  const [owner, setOwner] = useState<boolean | null>(null);
  useEffect(() => {
    let cookie = "";
    try {
      cookie = document.cookie;
    } catch {
      // opaque origin (sandboxed frame): document.cookie throws → not the owner
    }
    setOwner(hasOwnerHint(cookie));
  }, []);
  return owner;
}
