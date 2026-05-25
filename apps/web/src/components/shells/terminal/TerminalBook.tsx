"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const NAV_LINKS = [
  { href: "/quiz", cmd: "quiz", titleKey: "cardQuizTitle", descKey: "cardQuizDesc" },
  { href: "/glossary", cmd: "glossary", titleKey: "cardGlossaryTitle", descKey: "cardGlossaryDesc" },
  { href: "/chat", cmd: "chat", titleKey: "cardChatTitle", descKey: "cardChatDesc" },
  { href: "/tutor", cmd: "tutor", titleKey: "cardTutorTitle", descKey: "cardTutorDesc" },
] as const;

export function TerminalBook(): React.ReactElement {
  const t = useTranslations("Book");
  return (
    <div className="flex flex-col min-h-[calc(100dvh-3rem)] max-w-5xl mx-auto p-4 gap-3 font-mono text-sm">
      <div className="border-b border-[#444] pb-2">
        <div className="text-[#4ec9b0] font-semibold"># {t("welcomeHeading")}</div>
        <div className="text-[#555] text-xs mt-1">{t("welcomeDescription")}</div>
      </div>

      <div className="flex-1 space-y-1 py-2">
        <div className="flex items-center gap-0">
          <span className="text-[#6a9955]">you@itp</span>
          <span className="text-[#808080]">:</span>
          <span className="text-[#569cd6]">~</span>
          <span className="text-[#808080]">$ </span>
          <span className="text-[#d4d4d4]">ls -la ./modules/</span>
        </div>

        <div className="pl-2 space-y-2 pt-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block hover:bg-white/[.03] px-1 py-1 transition-colors group"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[#555] text-xs shrink-0">drwxr-xr-x</span>
                <span className="text-[#569cd6] text-xs shrink-0">itp</span>
                <span className="text-[#4ec9b0] group-hover:text-[#9cdcfe] transition-colors">./{link.cmd}/</span>
              </div>
              <div className="pl-4 text-[#6a9955] text-xs"># {t(link.titleKey)}: {t(link.descKey)}</div>
            </Link>
          ))}
        </div>

        <div className="pt-3 flex items-center gap-0">
          <span className="text-[#6a9955]">you@itp</span>
          <span className="text-[#808080]">:</span>
          <span className="text-[#569cd6]">~</span>
          <span className="text-[#808080]">$ </span>
          <span className="text-[#d4d4d4] animate-pulse">▌</span>
        </div>
      </div>

      <div className="text-[10px] text-[#444] text-center">{t("subtitle")}</div>
    </div>
  );
}
