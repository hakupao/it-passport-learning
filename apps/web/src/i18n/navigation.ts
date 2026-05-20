// Phase 2 Step 12 — next-intl navigation wrappers (D-099 §2.3 client APIs).
//
// Re-exports locale-aware <Link>, redirect(), usePathname(), useRouter(),
// getPathname() from next-intl/navigation, bound to our routing config.
//
// All client components MUST import navigation APIs from this module rather
// than from "next/navigation" or "next/link" — only these are locale-aware.
// Existing useSearchParams() from "next/navigation" stays untouched because
// next-intl does not re-export it (search params are locale-independent).

import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
