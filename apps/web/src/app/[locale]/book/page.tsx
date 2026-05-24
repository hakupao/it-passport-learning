// Phase 3 Step 1 — /[locale]/book route (D-101 §2.1 canonical trunk).
// Stage 10 update — book index is now a ThemedPage placeholder; chapter
// reader (/book/chapter/[nn]) is unchanged (out of scope until Stage 11).

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ThemedPage } from "@/components/shells/ThemedPage";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Book" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function BookIndexPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ThemedPage page="book" />;
}
