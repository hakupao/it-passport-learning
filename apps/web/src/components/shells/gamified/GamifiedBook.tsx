"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const NAV_CARDS = [
  { href: "/quiz", icon: "📝", titleKey: "cardQuizTitle", descKey: "cardQuizDesc" },
  { href: "/glossary", icon: "📖", titleKey: "cardGlossaryTitle", descKey: "cardGlossaryDesc" },
  { href: "/chat", icon: "💬", titleKey: "cardChatTitle", descKey: "cardChatDesc" },
  { href: "/tutor", icon: "🎓", titleKey: "cardTutorTitle", descKey: "cardTutorDesc" },
] as const;

export function GamifiedBook(): React.ReactElement {
  const t = useTranslations("Book");

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 sm:p-6 gap-6">
      <header className="border-b border-white/[.08] pb-4 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {t("welcomeHeading")}
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-2 max-w-2xl">
          {t("welcomeDescription")}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-start">
        {NAV_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group border border-white/[.08] rounded-2xl p-6 bg-white/[.03] flex flex-col gap-3 hover:border-[#e94560]/50 hover:bg-white/[.05] transition-all"
          >
            <div className="text-3xl">{card.icon}</div>
            <h2 className="text-lg font-semibold text-white/90 group-hover:text-[#e94560] transition-colors">
              {t(card.titleKey)}
            </h2>
            <p className="text-sm text-white/50 leading-relaxed">
              {t(card.descKey)}
            </p>
          </Link>
        ))}
      </div>

      <footer className="text-center text-[10px] text-white/25 pb-2">
        {t("subtitle")}
      </footer>
    </div>
  );
}
