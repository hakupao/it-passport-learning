# Step 14 a11y audit — pre-deploy desk audit (Session 46)

> This is a **desk audit**: source-level inspection of each component against
> WCAG 2.1 AA success criteria. The empirical audit (MCP lighthouse_audit +
> axe-core) runs in Session 47 on prod canonical. This document records what
> Step 14's polish accomplished per-component.

---

## Component matrix

| Component | 1.4.3 contrast | 1.4.11 focus contrast | 2.3.3 reduced motion | 2.4.1 skip | 2.4.3 focus trap | 2.4.7 focus visible | 4.1.3 status |
|---|---|---|---|---|---|---|---|
| `<SkipLink />` | n/a (sr-only base, high-contrast on focus) | ring ✓ | static once focused | **provides** | n/a | ring ✓ | n/a |
| `<NavTabs />` | `/65 → /70` inactive tab text | ring ✓ on Link | static (no anim) | (consumes target) | n/a | ring ✓ | `aria-label` + `aria-current="page"` |
| `<LocaleSwitcher />` | `/70 → /75` label / `/12 → /18` border | ring ✓ on select | static | (consumes target) | n/a | ring ✓ | n/a (instant action) |
| `<Chat />` (`<main>`) | `/50 → /60` emptyHint / `/50 → /65` streaming | ring on newChat/input/submit | static | id="main-content" tabIndex=-1 | n/a (not modal) | ring ✓ | aria-busy={isStreaming} + aria-live polite |
| `<QuizList />` (`<main>`) | `/40 → /55` badge / `/50 → /60` choices | ring on explain btn | static | id="main-content" tabIndex=-1 | n/a | ring ✓ | (delegated to QuizExplain) |
| `<QuizExplain />` (modal) | `/40 → /55` usage / `/50 → /60` streaming | ring on 3 buttons | motion-safe + reduce media query | n/a | **useFocusTrap engaged** | ring ✓ | aria-busy={isBusy} + aria-live polite + role=alert on error |
| `<GlossaryList />` (`<main>`) | `/40 → /55` badge / `/50 → /60` body | ring on explain btn | static | id="main-content" tabIndex=-1 | n/a | ring ✓ | (delegated to TermPopover) |
| `<TermPopover />` (modal) | `/40 → /55` page-occurrence / `/50 → /60` body | ring on 3 buttons | motion-safe + reduce media query | n/a | **useFocusTrap engaged** | ring ✓ | aria-busy + aria-live polite + role=alert |

✓ = the SC is now structurally satisfied per source-level inspection. Empirical
verification (axe-core + Lighthouse) lands in Session 47 evidence.

---

## Contrast ratio table (Tailwind `text-black/N` on white background)

WCAG AA Normal text = ≥ 4.5:1. Large text (≥18pt or ≥14pt bold) = ≥ 3:1.
WCAG 1.4.11 non-text (focus rings, UI components) = ≥ 3:1.

| Tailwind class | Composited color | Contrast vs #fff | WCAG verdict |
|---|---|---|---|
| `text-black/40` | #999999 | 2.85:1 | ❌ FAIL even Large |
| `text-black/45` | ~#8C8C8C | 3.31:1 | ✓ Large only |
| `text-black/50` | #808080 | 3.95:1 | ✓ Large; ❌ Normal |
| **`text-black/55`** | #737373 | **4.83:1** | ✓ AA Normal (after Step 14 bump) |
| `text-black/60` | #666666 | 5.74:1 | ✓ AA Normal |
| `text-black/65` | #595959 | 7.00:1 | ✓ AAA |
| `text-black/70` | #4D4D4D | 8.59:1 | ✓ AAA |

Dark-mode mirror: `text-white/N` on `#000` follows the same arithmetic (255 →
255*N/100). `/40` on black = #666666 vs #000 = 5.74:1 ✓ (so dark-mode `/40`
was always OK; the FAIL only existed in light mode). Step 14 still bumps the
class symmetrically for cleanliness — the light-mode fix necessarily bumps
both modes when sharing a class.

---

## Skip link behavior (LD-2 / LD-8)

```
[Page load]
  ↓
[Tab key pressed → focus enters page]
  ↓
[SkipLink becomes visible (focus:not-sr-only) in top-left]
  ↓
[Enter pressed → href="#main-content" navigation]
  ↓
[Browser scrolls to <main id="main-content">]
  ↓
[Main has tabIndex=-1 so it receives focus programmatically]
  ↓
[Next Tab moves to first focusable inside main (e.g. Explain button
 on /quiz, or input on /chat)]
```

Verified at source level. Empirical verification = Session 47 axe-core
+ manual keyboard nav.

---

## Focus trap behavior (LD-5)

```
[User clicks Explain button on /quiz → router.push('?qid=...')]
  ↓
[QuizList re-renders with activeSummary = matched quiz]
  ↓
[<QuizExplain summary={activeSummary} /> renders]
  ↓
[useFocusTrap(true, dialogRef) effect fires]
  ↓
[Captures document.activeElement (the Explain button) for restore]
  ↓
[Focuses first focusable inside dialogRef (the ✕ close button)]
  ↓
[document.keydown listener attached]
  ↓
[Tab from ✕ → loops to last (Close in footer); from last Tab loops back to ✕]
  ↓
[Shift+Tab from ✕ → goes to footer Close; from there to ✕]
  ↓
[User presses ESC → onClose() → router.replace('?')]
  ↓
[QuizList re-renders with activeSummary=null]
  ↓
[<QuizExplain /> returns null]
  ↓
[useFocusTrap effect cleanup fires]
  ↓
[document.keydown listener removed]
  ↓
[previouslyFocused.focus() restores focus to the original Explain button]
```

Identical flow for TermPopover via `<GlossaryList />`'s explain button. The
ref attached to the outermost role="dialog" `<div>` (with `backdrop-blur`
overlay) is the focus-trap root; tabbing happens within all focusables in
that subtree (buttons + the close ✕).

---

## Reduced-motion behavior (LD-6, AAA-grade above Q2=a AA)

```
[OS / browser: prefers-reduced-motion: reduce]
  ↓
[Tailwind motion-safe:animate-pulse → drops animate-pulse class
 → 4 skeleton bars render static]
  ↓
[@media (prefers-reduced-motion: reduce) in BusySkeleton <style>
 sets .quiz-explain-progress { margin-left: 30%; width: 40%; }
 → progress bar renders as static 40%-wide bar centered]
  ↓
[Progressbar still has role="progressbar" + aria-label so SR users
 still get the busy hint via aria-busy + aria-live announcements]
```

This is AAA scope (above the Q2=a "Full WCAG 2.1 AA" target). Included per
quality-over-cost feedback memory because cost is ~6 CSS lines per skeleton.

---

## Known limits (deferred to Session 47 axe-core + manual)

  - Streamed `<article>` body in QuizExplain + TermPopover is mixed JP+中文+English
    in one prose block. We don't apply per-paragraph `lang` because the stream
    is not pre-segmented. Document language fallback applies. May surface as
    an axe-core "language-of-parts" warning; would be addressed via JS parsing
    of the output if axe-core flags it.
  - Cards (`<li>` with hover state) on `<QuizList />` + `<GlossaryList />` are
    visually clickable on hover (border darken) but only the inner button is
    focusable. Keyboard users get the same affordance via the button; mouse
    users may try clicking the card body and find it inert. Could expand
    click target by making the whole `<li>` a `<button>` but that flattens
    semantic structure. Deferred.
  - Color contrast on `border-black/[.08]` decorative dividers (`#ebebeb`
    on white) = 1.10:1 — does NOT trigger 1.4.11 because the borders are
    decorative dividers (not focusable UI component boundaries). axe-core
    should not flag.

---

## What this document is NOT

  - Not a Rule A audit. Rule A triggers at >50% compression/rewrite, which
    Step 14 is NOT (additive polish, source diffs ~50 net lines).
  - Not empirical evidence. The empirical Lighthouse + axe-core pass lands
    in Session 47.
  - Not exhaustive WCAG 2.1 AA coverage. The 13 SCs above are the ones
    touched or verified during Step 14; the un-listed SCs (e.g. 1.4.4
    Resize Text, 2.4.5 Multiple Ways) are already structurally met by
    Tailwind responsive design + the multi-page nav.
