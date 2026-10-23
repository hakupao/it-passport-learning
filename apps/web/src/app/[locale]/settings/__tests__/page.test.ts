// Stage 7 Phase 1 Task 12 — /[locale]/settings on the server side: force-dynamic (owner cookie) with
// the record provider around SettingsForm; no corpus payload. Only Next's runtime pieces are stubbed.
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("next-intl/server", () => ({
  setRequestLocale: () => {},
  getTranslations: async ({ namespace }: { namespace: string }) => (k: string) => `${namespace}.${k}`,
}));
vi.mock("@/i18n/navigation", () => ({ Link: () => null, usePathname: () => "/settings" }));

import { SettingsForm } from "@/components/settings/SettingsForm";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";

import SettingsPage, { dynamic, generateMetadata } from "../page";

type El = { type: unknown; props: { children?: El } & Record<string, unknown> };

describe("/settings", () => {
  it("SettingsForm under the record provider, force-dynamic", async () => {
    expect(dynamic).toBe("force-dynamic");
    const el = (await SettingsPage({ params: Promise.resolve({ locale: "en" }) })) as El;
    expect(el.type).toBe(LearningRecordProvider);
    expect(el.props.isOwner).toBe(false);
    expect(el.props.children!.type).toBe(SettingsForm);
  });
  it("title from the Settings namespace", async () => {
    expect(await generateMetadata({ params: Promise.resolve({ locale: "ja" }) })).toEqual({ title: "Settings.title" });
  });
});
