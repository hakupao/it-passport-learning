// Phase 3 Step 2 — book/translatePrompt: pure helpers backing the inline
// translate + chapter-scope chat triggers (LD-2).
//
// D-101 §2.3 段落级 zh/en mechanism = on-demand inline triggers via /api/chat.
// The prompt body is the only surface that varies per request; SYSTEM
// (corpus + SYSTEM_INSTRUCTION) stays byte-identical so the D-088 §2.3 /
// D-095 §2.3 stable-prefix invariant + DeepSeek prefix cache survive.
//
// composeTranslatePrompt() — single user message asking the model to
// produce ONLY a translation of the selected ja passage into zh or en.
// composeChapterScopePreface() — a short scope-marker prepended inside
// the first user message of a chapter-scoped chat; instructs the model to
// focus on the active chapter without touching SYSTEM.

export type TranslateTarget = "zh" | "en";

export interface ComposeTranslatePromptArgs {
  source: string;
  target: TranslateTarget;
}

const TARGET_LABEL: Record<TranslateTarget, string> = {
  zh: "Simplified Chinese (zh)",
  en: "English (en)",
};

/** Hard cap on the selected text we ship to /api/chat. Larger payloads */
/** balloon token usage + risk hitting per-turn limits + diverge from the */
/** "段落-level" mental model. Source truncation is reported to the user via */
/** clampTranslateSource. */
export const TRANSLATE_SOURCE_MAX_CHARS = 1000;

/**
 * Compose the user-message body that triggers a translate-only response.
 * The model is told to emit ONLY the translation (no preamble / no romaji /
 * no explanation). Throws on empty source so callers don't silently submit
 * a no-op chat turn.
 */
export function composeTranslatePrompt(
  args: ComposeTranslatePromptArgs,
): string {
  const trimmed = args.source.trim();
  if (!trimmed) {
    throw new Error("composeTranslatePrompt: source must be non-empty");
  }
  const label = TARGET_LABEL[args.target];
  return [
    `Translate the following Japanese passage from the IT Passport textbook into ${label}.`,
    `Output ONLY the translation — no preamble, no commentary, no romaji.`,
    `Preserve technical terms with their canonical translation when one exists in the textbook glossary.`,
    "",
    "---",
    trimmed,
    "---",
  ].join("\n");
}

/**
 * Trim + clamp the selected text to TRANSLATE_SOURCE_MAX_CHARS. Returns
 * the (possibly truncated) text and a `truncated` flag so the UI can
 * surface a "passage too long, showing first N chars" hint.
 */
export function clampTranslateSource(s: string): {
  text: string;
  truncated: boolean;
} {
  const trimmed = s.trim();
  if (trimmed.length <= TRANSLATE_SOURCE_MAX_CHARS) {
    return { text: trimmed, truncated: false };
  }
  return {
    text: trimmed.slice(0, TRANSLATE_SOURCE_MAX_CHARS),
    truncated: true,
  };
}

export interface ChapterScopeArgs {
  nn: string;
  titleJp: string;
  firstPage: number;
  lastPage: number;
}

/**
 * Compose a one-line scope-marker for a chapter-scoped chat turn. The
 * marker is prepended to the first user message body inside the chat
 * modal so the model focuses its answer on the active chapter; SYSTEM
 * messages stay byte-identical (corpus + SYSTEM_INSTRUCTION are reused as
 * the stable-prefix per D-095 §2.3). The marker is plain text — the user
 * sees it in their own bubble so the scope is transparent (not a hidden
 * instruction).
 */
export function composeChapterScopePreface(args: ChapterScopeArgs): string {
  return `[Scope: 第${args.nn}章「${args.titleJp}」 p.${args.firstPage}-${args.lastPage}] `;
}

/**
 * Attach the scope marker to a user-typed message if it isn't already
 * present (idempotent — repeated calls don't double-stamp the prefix).
 */
export function applyChapterScope(
  userText: string,
  scope: ChapterScopeArgs,
): string {
  const preface = composeChapterScopePreface(scope);
  if (userText.startsWith(preface)) return userText;
  return `${preface}${userText}`;
}
