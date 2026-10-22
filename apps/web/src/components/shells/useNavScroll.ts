// The scrolling nav-items row of the three shell headers. On a phone the items
// overflow and scroll inside the row (the theme / locale switchers stay pinned):
// - the current page's item (aria-current="page") is scrolled into view on mount,
//   on every navigation / locale switch and when an item's size changes (web fonts
//   arriving after hydration widen the labels); a keyboard-focused item is
//   scrolled into view too. Only scrollLeft is set, so the page never scrolls
//   vertically;
// - `data-fade` marks the side(s) with more items, so CSS (.nav-fade in
//   globals.css) fades that edge and the row visibly scrolls.

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function markFade(box: HTMLElement): void {
  const left = box.scrollLeft > 1;
  const right = box.scrollLeft + box.clientWidth < box.scrollWidth - 1;
  const fade = left && right ? "both" : left ? "left" : right ? "right" : null;
  if (fade) box.dataset.fade = fade;
  else delete box.dataset.fade;
}

/** Scroll `item` horizontally into the row's view (the nearest edge). */
function reveal(box: HTMLElement, item: Element | null): void {
  if (!item) return;
  const b = box.getBoundingClientRect();
  const a = item.getBoundingClientRect();
  if (a.left < b.left) box.scrollLeft -= b.left - a.left;
  else if (a.right > b.right) box.scrollLeft += a.right - b.right;
}

function revealCurrent(box: HTMLElement): void {
  reveal(box, box.querySelector('[aria-current="page"]'));
  markFade(box);
}

export function useNavScroll<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T>(null);
  // next/navigation's pathname keeps the locale prefix, so a locale switch (new
  // label widths) re-runs the effect too.
  const pathname = usePathname();

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const onScroll = () => markFade(box);
    const onFocus = (e: FocusEvent) => reveal(box, e.target as Element);
    box.addEventListener("scroll", onScroll, { passive: true });
    box.addEventListener("focusin", onFocus);
    const observer = new ResizeObserver(() => revealCurrent(box));
    observer.observe(box);
    for (const item of box.children) observer.observe(item);
    return () => {
      box.removeEventListener("scroll", onScroll);
      box.removeEventListener("focusin", onFocus);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (ref.current) revealCurrent(ref.current);
  }, [pathname]);

  return ref;
}
