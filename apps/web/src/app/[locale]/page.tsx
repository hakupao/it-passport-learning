// Phase 3 Step 1 — /[locale] landing redirect updated to /book per D-101 §2.1.
//
// Phase 2 (Sessions 27-48) redirected to /chat so the chat surface acted as
// the home landing. D-101 makes /[locale]/book the canonical trunk; the
// chat/quiz/glossary surfaces remain accessible via the NavTabs secondary
// row (LD-1) + direct URL.
//
// Using next-intl's redirect() (not next/navigation's) keeps the [locale]
// prefix intact: redirect("/book") from /ja becomes /ja/book.
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
  redirect({ href: "/book", locale });
}
