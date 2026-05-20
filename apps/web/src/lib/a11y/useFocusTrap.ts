// Phase 2 Step 14 — focus trap + restore hook (Session 46 LD-5).
//
// WCAG 2.1 AA scope:
//   - 2.4.3 Focus Order: on modal open, focus moves into the modal; on close,
//     focus restores to the element that opened it. Tab/Shift+Tab cycles within
//     the modal so keyboard users can't accidentally tab out behind the dialog.
//   - 2.4.11 Focus Not Obscured (AA in WCAG 2.2): initial focus targets a real
//     visible focusable inside the modal, never a hidden element.
//
// Contract:
//   - `active`: when true, trap is engaged. Setting to false (e.g. modal closes)
//     triggers focus restoration to the element that was focused at the moment
//     `active` first flipped true (captured on the rising edge).
//   - `rootRef`: ref to the container whose focusable descendants make up the
//     trap. Must be set BEFORE `active` flips true; we read `rootRef.current`
//     in the same effect that consumes the `active=true` edge.
//   - The hook intentionally does NOT manage Escape: each modal component
//     already wires its own ESC handler so the dismiss intent stays close to
//     each surface's state.
//
// Tab-cycle implementation notes:
//   - Standard a11y focusable selector matches: button, [href], input, select,
//     textarea, [tabindex]:not([tabindex="-1"]). We exclude disabled elements
//     and hidden (`aria-hidden="true"`) subtrees.
//   - On Tab from the last focusable, focus wraps to the first. On Shift+Tab
//     from the first, focus wraps to the last. Both branches `preventDefault`
//     so the browser does not advance focus out of the trap.
//   - When the trap is engaged and focus somehow lands outside (e.g. a script
//     stole focus), the next Tab inside the trap pulls it back to the first
//     focusable. We do NOT proactively re-focus on `focusin` events — that
//     can fight with intentional clicks on the focusable elements.
//
// Server-side guard: `typeof document === "undefined"` short-circuits to a
// no-op so the hook is safe inside RSC-mounted client components rendering
// during streaming SSR.

"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(nodes).filter(
    (el) =>
      !el.hasAttribute("aria-hidden") &&
      el.offsetParent !== null,
  );
}

export function useFocusTrap(
  active: boolean,
  rootRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active) return;
    if (typeof document === "undefined") return;
    const root = rootRef.current;
    if (!root) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusables = getFocusableElements(root);
    const firstFocusable = focusables[0];
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      // No focusable children yet: focus the root itself so screen-reader users
      // hear the dialog label. The container must carry tabIndex=-1 for this
      // to be programmatically focusable.
      root.focus();
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Tab") return;
      const current = getFocusableElements(root);
      const first = current[0];
      const last = current[current.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      const activeEl = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (activeEl === first || !root.contains(activeEl)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (activeEl === last || !root.contains(activeEl)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [active, rootRef]);
}
