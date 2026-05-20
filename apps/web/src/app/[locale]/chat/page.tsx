// Phase 2 Step 12 — /[locale]/chat page hosting the <Chat /> surface.
//
// Moved from /chat (Step 9 standalone) into the [locale] segment so the
// surface inherits NextIntlClientProvider + the top NavTabs + LocaleSwitcher.
// Component body itself is unchanged at this layer — strings are translated
// inside <Chat /> via useTranslations.

import type { Metadata } from "next";

import { Chat } from "@/components/Chat";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Chat" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function ChatPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Chat />;
}
