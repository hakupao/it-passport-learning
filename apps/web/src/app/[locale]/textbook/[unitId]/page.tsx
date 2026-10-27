// Stage 6 (Session 85) — /[locale]/textbook/[unitId] : production unit reader.
//
// loadUnit() allowlists the unitId slug (path-traversal guard retained from the
// harness loader). The index is read once for in-topic prev/next + breadcrumb.
// D-180 Task 12: wrapped in LearningRecordProvider (owner flag from the D-148
// cookie gates the server sync); Stage 7 Phase 3 (D-196 §0-4) the unit is marked
// read by its 読了 button. The reader renders the normalized unit (normalizeUnit,
// chumon group members dropped via the chumon_groups.json-only loader) with its
// breadcrumb place and confirmation questions (pickConfirm).
// D-181 Phase C: also builds the AI 先生 unit anchor (title, summary, each term's
// definition / explanation / memory hook) for the 「AI 先生に聞く」 button.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { UnitReader } from "@/components/textbook/UnitReader";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { routing } from "@/i18n/routing";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";
import { loadChumonMembers } from "@/lib/practice/chumonMembers";
import { unitAnchor } from "@/lib/sensei/textbookAnchors";
import { pickConfirm } from "@/lib/textbook/confirm";
import {
  loadReaderIndex,
  loadUnit,
  neighbors,
  normalizeUnit,
  pick,
  unitPlace,
  type TextbookUnit,
} from "@/lib/textbook/reader";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; unitId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, unitId } = await params;
  try {
    const unit = await loadUnit(unitId);
    return { title: pick(unit as unknown as Record<string, unknown>, "title", locale) };
  } catch {
    return {};
  }
}

export default async function UnitPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale, unitId } = await params;
  setRequestLocale(locale);

  let unit: TextbookUnit;
  try {
    unit = await loadUnit(unitId);
  } catch {
    notFound();
  }

  const [index, members] = await Promise.all([loadReaderIndex(), loadChumonMembers()]);
  const reader = normalizeUnit(unit, members);
  const owner = await isOwner((await cookies()).get(OWNER_COOKIE)?.value);
  const appLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;

  return (
    <LearningRecordProvider isOwner={owner}>
      <UnitReader
        unit={reader}
        place={unitPlace(index, unitId, locale)}
        neighbors={neighbors(index, unitId)}
        locale={locale}
        senseiAnchorText={unitAnchor(unit, appLocale)}
        confirm={pickConfirm(reader, members)}
      />
    </LearningRecordProvider>
  );
}
