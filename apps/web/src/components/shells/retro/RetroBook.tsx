"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RetroWindow } from "./RetroWindow";

const NAV_CARDS = [
  { href: "/quiz", icon: "📝", titleKey: "cardQuizTitle", descKey: "cardQuizDesc" },
  { href: "/glossary", icon: "📖", titleKey: "cardGlossaryTitle", descKey: "cardGlossaryDesc" },
  { href: "/chat", icon: "💬", titleKey: "cardChatTitle", descKey: "cardChatDesc" },
  { href: "/tutor", icon: "🎓", titleKey: "cardTutorTitle", descKey: "cardTutorDesc" },
] as const;

export function RetroBook(): React.ReactElement {
  const t = useTranslations("Book");
  return (
    <div className="p-4">
      <RetroWindow title={t("welcomeHeading")}>
        <div className="bg-[#c0c0c0] p-4 text-black">
          <p className="text-xs mb-4">{t("welcomeDescription")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NAV_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="flex items-start gap-2 bg-white border-2 border-inset-retro p-3 hover:bg-[#ffffcc] transition-colors"
              >
                <span className="text-xl shrink-0">{card.icon}</span>
                <div>
                  <div className="text-xs font-bold">{t(card.titleKey)}</div>
                  <div className="text-[10px] text-[#808080] mt-0.5">{t(card.descKey)}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center text-[10px] text-[#808080] mt-3">{t("subtitle")}</div>
        </div>
      </RetroWindow>
    </div>
  );
}
