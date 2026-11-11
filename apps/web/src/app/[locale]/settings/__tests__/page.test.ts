// Stage 7 Phase 1 Task 12 — /[locale]/settings on the server side: prerendered (no cookie read: H1-1) with
// the record provider around SettingsForm; no corpus payload. Only Next's runtime pieces are stubbed.
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl/server", () => ({
  setRequestLocale: () => {},
  getTranslations: async ({ namespace }: { namespace: string }) => (k: string) => `${namespace}.${k}`,
}));
vi.mock("@/i18n/navigation", () => ({ Link: () => null, usePathname: () => "/settings" }));

import { SettingsForm } from "@/components/settings/SettingsForm";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";

import SettingsPage, { generateMetadata } from "../page";

type El = { type: unknown; props: { children?: El } & Record<string, unknown> };

describe("/settings", () => {
  it("SettingsForm under the record provider (prerendered: staticRendering.test)", async () => {
    const el = (await SettingsPage({ params: Promise.resolve({ locale: "en" }) })) as El;
    expect(el.type).toBe(LearningRecordProvider);
    expect(el.props).not.toHaveProperty("isOwner"); // owner flag: browser-side (useOwner, H1-1)
    expect(el.props.children!.type).toBe(SettingsForm);
  });
  it("title from the Settings namespace", async () => {
    expect(await generateMetadata({ params: Promise.resolve({ locale: "ja" }) })).toEqual({
      title: "Settings.title",
      alternates: {
        canonical: "/ja/settings",
        languages: { ja: "/ja/settings", zh: "/zh/settings", en: "/en/settings", "x-default": "/ja/settings" },
      },
    });
  });
});
