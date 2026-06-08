# Translation Audit — technology-23-62-u03 (情報セキュリティの7要素)

- **Reviewer role**: Independent Reviewer (Rule D — separate pass from Writer).
- **Source (JP authority)**: `data/ip/textbook/units/technology-23-62-u03.json`
- **Translation (zh/en)**: `data/ip/textbook/.planning/translation_technology-23-62-u03.json`
- **Date**: 2026-06-05
- **Method**: Programmatic checks (JSON validity, term_jp integrity, coverage, schema) + manual semantic spot-check of ≥3 terms + terminology review.

---

## Per-item PASS/FAIL table

| # | Item | Verdict | Specifics |
|---|------|---------|-----------|
| 1 | **Coverage** | PASS | All JP fields translated. Programmatic scan for empty/whitespace zh or en across every `{zh,en}` leaf returned **NONE**. title, unit_summary, overview_intro, 7 terms × (definition/explanation/analogy/memory_hook), summary.key_points (5), summary.memory_hooks (7) all present in both zh and en. |
| 2 | **term_jp integrity** | PASS | `terms[].term_jp` == source `terms[].term` exactly. Count 7=7, order identical, strings byte-identical: 機密性 / 完全性 / 可用性 / 真正性 / 責任追跡性 / 否認防止 / 信頼性. No mismatch. |
| 3 | **Semantic fidelity (spot-check)** | PASS | 4 terms deep-checked (真正性, 否認防止, 信頼性, 責任追跡性). No addition/omission/distortion found. Details below. |
| 4 | **Terminology (zh 本土 IT)** | PASS | 真正性→真实性, 責任追跡性→可追溯性, 否認防止→抗抵赖性, 完全性→完整性, 可用性→可用性 all correct mainland-standard. No 日式借词 (no 稼動/解約/定義要件-type leakage). Additional good choices: 冗長化→冗余化, 無停電電源装置→不间断电源(UPS), 負荷分散→负载均衡, なりすまし→冒充, 改ざん→篡改, ハッシュ値→哈希值. |
| 5 | **Memory-hook mnemonic** | PASS | All 7 zh hooks reproduce 「○○といえば××」as 「说到○○，就是××」. All 7 en hooks use 「○○ → ××」arrow form. Standalone term hooks and summary.memory_hooks are consistent with each other. |
| 6 | **JSON validity / schema shape** | PASS | Valid JSON. Top keys = {unit_id, title, unit_summary, overview_intro, terms, summary}. Each term has all 7 required keys {term_jp, term_zh, term_en, definition, explanation, analogy, memory_hook}. title/unit_summary/overview_intro and every leaf are `{zh,en}` objects. summary has key_points[] and memory_hooks[]. Matches TRANSLATION_SCHEMA. |

---

## Semantic deep-dive (≥3 terms)

### 真正性 → 真实性 / Authenticity
- JP: 「本物であり、主張するとおりの本人(本物)である」ことを確実にする。
- zh: 「确保某个用户、数据、通信对方『是真实的、确实是其所声称的本人（真品）』」 — faithful, 真品 preserves 本物 nuance.
- en: "ensures … 'is genuine and truly the person (the real thing) they claim to be'" — faithful.
- 本人認証 → 身份认证 / identity authentication; 生体認証 → 生物认证 / biometric authentication; なりすまし → 冒充 / impersonation. All correct. **No distortion.**

### 否認防止 → 抗抵赖性 / Non-repudiation
- JP core: 「『否定させない=証拠を残す』ことに重点」.
- zh: 「『不让否认＝留下证据』」; en: "'not letting them deny it = leaving evidence.'" — faithful, the `=` framing preserved.
- Analogy 宅配便の受領印やサイン → 快递的签收章或签名 / delivery receipt stamp or signature — faithful. **No distortion.**

### 信頼性 → 可靠性 / Reliability
- JP: 「意図したとおりに矛盾なく一貫して正しく動作し続ける」.
- zh: 「按照预期、无矛盾、一致且正确地持续运行」; en: "keeps operating correctly as intended, without contradictions, in a consistent manner." — faithful.
- 品質・正確さ → 质量、准确性 / quality, accuracy; distinction-vs-availability point preserved. **No distortion.**

### 責任追跡性 → 可追溯性 / Accountability
- JP: 「利用者ごとに固有のIDを割り当てる」「『追跡できる』こと自体を指す」.
- zh: 「为每个用户分配唯一的ID」「指的是『能够追溯』这件事本身」; en mirrors. — faithful. **No distortion.**

---

## Minor observations (non-blocking, no change required)

- **CIA→『C』/『I』/『A』 letter mapping**: JP「CIA3要素の最初の『C』」rendered zh「CIA三要素中开头的『C』」/ en「the first 'C' of the CIA triad」. Faithful; for 完全性/可用性 the Writer used「CIA三要素中的『I』/『A』」which drops the explicit ordinal that 機密性 carried, but the JP source itself only marks 機密性 as 「最初の」 and the others plainly as 「『I』」「『A』」 — so this is faithful to source, not an error.
- **真正性 explanation**: en omits no JP content; zh「通信对方」for 「通信相手」is the correct mainland term (vs 日式「通信对象」). Good.
- **Term-hook vs summary-hook consistency**: per-term `memory_hook.zh/en` strings are reused verbatim inside `summary.memory_hooks` (with the term label prefix). Consistent — no drift between the two locations.

---

## Verdict

**APPROVE**

All six checklist items PASS. term_jp integrity is exact (7/7, same order, byte-identical). Coverage is complete with no empty zh/en leaves. Semantic fidelity confirmed on a 4-term deep-check with no addition/omission/distortion. zh terminology is mainland-standard with no 日式借词 leakage. Mnemonic structure is reproduced naturally in both languages. JSON is valid and matches the schema shape. No changes required.
