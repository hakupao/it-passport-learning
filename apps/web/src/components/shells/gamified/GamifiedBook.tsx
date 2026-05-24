"use client";

import { useTranslations } from "next-intl";

export function GamifiedBook(): React.ReactElement {
  const t = useTranslations("Book");

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 sm:p-6 gap-4">
      <header className="border-b border-white/[.08] pb-3">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          {t("subtitle")}
        </p>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <div className="border border-white/[.08] rounded-2xl p-8 bg-white/[.03] max-w-md w-full text-center space-y-4">
          <div className="text-4xl">📚</div>
          <h2 className="text-lg font-semibold text-white/90">
            {t("title")}
          </h2>
          <p className="text-sm text-white/50">
            {t("subtitle")}
          </p>
          <div className="h-2 rounded-full bg-white/[.06] overflow-hidden">
            <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-[#e94560] to-[#4ade80] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
