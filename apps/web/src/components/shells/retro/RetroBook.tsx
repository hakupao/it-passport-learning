"use client";

import { useTranslations } from "next-intl";
import { RetroWindow } from "./RetroWindow";

export function RetroBook(): React.ReactElement {
  const t = useTranslations("Book");
  return (
    <div className="p-4">
      <RetroWindow title={t("retroWindowTitle")}>
        <div className="bg-[#c0c0c0] p-6 flex flex-col items-center gap-4 text-black">
          <div className="flex items-start gap-4">
            <div className="text-4xl leading-none">🚫</div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold">{t("retroErrorHeading")}</p>
              <p className="text-xs">
                {t("retroErrorMessage")}
              </p>
              <p className="text-[10px] text-[#808080]">
                {t("retroErrorCode")}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="bg-[#c0c0c0] border-2 border-outset-retro px-6 py-0.5 text-xs active:border-inset-retro min-w-[5rem]"
          >
            OK
          </button>
        </div>
      </RetroWindow>
    </div>
  );
}
