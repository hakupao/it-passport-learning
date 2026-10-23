// D-181 §0-6 / D-179 §4 — AI 先生 API key settings: input, where the key is
// stored ("this browser only"), delete button. A saved key is shown only as
// "…" + its last 4 characters ("…" alone for a key shorter than 8) and is never
// rendered back into the input. A refused save keeps the typed key in the input
// and shows a notice.
//
// First render (server and client) shows no key, so there is no hydration
// mismatch; the stored key is read after mount. `onChange(hasKey)` fires after
// that read and after every save / delete.

"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearSenseiKey, loadSenseiKey, maskSenseiKey, saveSenseiKey } from "@/lib/sensei/keyStore";
import type { StorageLike } from "@/lib/storage";

/** window.localStorage, or null where reading the property itself throws (blocked storage). */
function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function KeySettings({ onChange }: { onChange?: (hasKey: boolean) => void }): React.ReactElement {
  const t = useTranslations("Sensei");
  const inputId = useId();
  const [masked, setMasked] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);

  function refresh(): void {
    const storage = browserStorage();
    const key = storage ? loadSenseiKey(storage) : null;
    setMasked(key === null ? null : maskSenseiKey(key));
    onChange?.(key !== null);
  }

  // Read once after mount; onChange is the parent's callback, not a trigger.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refresh, []);

  function save(e: React.SyntheticEvent<HTMLFormElement>): void {
    e.preventDefault();
    const storage = browserStorage();
    const saved = storage !== null && saveSenseiKey(storage, draft);
    setSaveFailed(!saved);
    if (saved) setDraft("");
    refresh();
  }

  function remove(): void {
    const storage = browserStorage();
    if (storage) clearSenseiKey(storage);
    setSaveFailed(false);
    refresh();
  }

  return (
    <section className="space-y-2" data-testid="sensei-key-settings">
      <h2 className="text-base font-bold">{t("keyTitle")}</h2>
      <form onSubmit={save} className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          {t("keyLabel")}
        </label>
        <Input
          id={inputId}
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder={t("keyPlaceholder")}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" disabled={draft.trim() === ""}>
          {t("keySave")}
        </Button>
      </form>
      {saveFailed && (
        <p role="alert" className="border border-spot bg-tint p-2 text-sm text-ink" data-testid="sensei-key-save-failed">
          {t("keySaveFailed")}
        </p>
      )}
      <p className="text-sm text-ink-muted">{t("keyStorageNote")}</p>
      <div className="flex items-center gap-2 text-sm">
        <span data-testid="sensei-key-status">
          {masked === null ? t("keyNone") : t("keySaved", { masked })}
        </span>
        {masked !== null && (
          <Button type="button" variant="outline" size="sm" onClick={remove}>
            {t("keyDelete")}
          </Button>
        )}
      </div>
    </section>
  );
}
