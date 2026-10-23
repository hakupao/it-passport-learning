// Stage 7 Phase 1 Task 10 — a link that starts a practice group. The rendered href is static (SSR-
// safe, also what a new tab / no-JS opens: order=rand without a seed is redirected to a fresh seed by
// the page); a plain click navigates to withNonce(href) instead, so the same list started again in
// this tab is a new group rather than the finished summary stored for it (Task 9 §0-13), and an
// order=rand link (`seed`) draws a new seed.

"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { withNonce } from "@/lib/practice/practiceSetup";

export function FreshLink({
  href,
  seed = false,
  className,
  children,
  ...rest
}: {
  href: string;
  /** add a fresh `&seed=` on click (order=rand links) */
  seed?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">): React.ReactElement {
  const router = useRouter();
  return (
    <Link
      href={href}
      className={className}
      {...rest}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        router.push(withNonce(href, Date.now(), seed ? Math.floor(Math.random() * 2 ** 32) : undefined));
      }}
    >
      {children}
    </Link>
  );
}
