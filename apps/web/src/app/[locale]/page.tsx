// Phase 2 Step 12 — landing redirect for /[locale]/ (root locale path).
//
// /, /ja, /zh, /en land here; for α the landing is just the chat surface.
// Using next-intl's redirect() (not next/navigation's) keeps the [locale]
// prefix intact: redirect("/chat") from /ja becomes /ja/chat, not /chat.
//
// redirect() throws a NEXT_REDIRECT error to short-circuit rendering; the
// function never returns to the caller. The return type stays open (void)
// so TypeScript doesn't require an unreachable-end proof — next-intl's
// redirect() is not typed `never` in v4.12 (verified via Context7).

import { redirect } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootPage({
  params,
}: Props): Promise<void> {
  const { locale } = await params;
  redirect({ href: "/chat", locale });
}
