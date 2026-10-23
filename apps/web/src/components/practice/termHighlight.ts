// Stage 7 Phase 1 Task 8 (D-190 §0-25) — key-term highlight in the explanation (pure).
//
// Splits a text into runs; a run whose text is one of the needles is marked `term`. The runs
// concatenate back to the input exactly (style only, never a text change). Matching scans left to
// right and tries the longest needle first, so overlapping terms never nest. A needle that starts
// (ends) with an ASCII letter / digit only matches where the neighbouring character is not one
// ("IP" does not light up inside "SHIP"); CJK needles match anywhere.

export interface TermRun {
  text: string;
  term: boolean;
}

const WORD = /[A-Za-z0-9]/;

export function splitTerms(text: string, needles: readonly string[]): TermRun[] {
  if (text === "") return [];
  const ns = [...new Set(needles.filter((n) => n.trim() !== ""))].sort((a, b) => b.length - a.length);
  if (ns.length === 0) return [{ text, term: false }];
  const runs: TermRun[] = [];
  let plain = "";
  let i = 0;
  while (i < text.length) {
    const hit = ns.find(
      (n) =>
        text.startsWith(n, i) &&
        !(WORD.test(n[0]!) && i > 0 && WORD.test(text[i - 1]!)) &&
        !(WORD.test(n[n.length - 1]!) && WORD.test(text[i + n.length] ?? "")),
    );
    if (hit) {
      if (plain) runs.push({ text: plain, term: false });
      plain = "";
      runs.push({ text: hit, term: true });
      i += hit.length;
    } else {
      plain += text[i];
      i++;
    }
  }
  if (plain) runs.push({ text: plain, term: false });
  return runs;
}
