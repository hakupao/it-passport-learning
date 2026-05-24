// Phase 2 Step 12 — /[locale]/chat page hosting the <Chat /> surface.
// Stage 10 update — delegates rendering to ThemedPage.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ThemedPage } from "@/components/shells/ThemedPage";

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
  return <ThemedPage page="chat" />;
}
