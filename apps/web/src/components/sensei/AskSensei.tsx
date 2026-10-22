// D-181 Task A4 — 「AI 先生に聞く」 entry points.
//
// SenseiHost mounts ONE SenseiPanel for the page (lazy-loaded on the first
// click, so the AI SDK is not in the page's first load). Each AskSensei button
// hands it an anchor; asking about another question switches the panel's
// thread instead of mounting a second chat. The anchor text is built only when
// the button is clicked (getAnchorText). On close, focus returns to the button
// that opened the panel.
// useSenseiHost() hands other entry points (the Phase B ReviewLauncher) the same
// open function; it is null outside a SenseiHost.

"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { ThreadKind } from "@/lib/sensei/threadStore";

import type { SenseiAnchor } from "./SenseiPanel";

const SenseiPanel = dynamic(() => import("./SenseiPanel").then((m) => m.SenseiPanel), { ssr: false });

type OpenFor = (anchor: SenseiAnchor, trigger: HTMLElement) => void;

const HostContext = createContext<OpenFor | null>(null);

export function SenseiHost({ children }: { children: React.ReactNode }): React.ReactElement {
  const [anchor, setAnchor] = useState<SenseiAnchor | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openFor = useCallback<OpenFor>((next, trigger) => {
    triggerRef.current = trigger;
    setAnchor(next);
    setOpen(true);
  }, []);

  return (
    <HostContext.Provider value={openFor}>
      {children}
      {anchor ? <SenseiPanel anchor={anchor} open={open} onOpenChange={setOpen} returnFocusTo={triggerRef} /> : null}
    </HostContext.Provider>
  );
}

/** The page's open-the-panel function, or null outside a SenseiHost. */
export function useSenseiHost(): OpenFor | null {
  return useContext(HostContext);
}

export function AskSensei({
  kind,
  anchorId,
  title,
  getAnchorText,
}: {
  kind: ThreadKind;
  anchorId: string;
  title: string;
  getAnchorText: () => string;
}): React.ReactElement | null {
  const t = useTranslations("Sensei");
  const openFor = useContext(HostContext);
  if (!openFor) return null;
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-haspopup="dialog"
      data-testid="ask-sensei"
      onClick={(e) => openFor({ kind, anchorId, title, anchorText: getAnchorText() }, e.currentTarget)}
    >
      {t("askButton")}
    </Button>
  );
}
