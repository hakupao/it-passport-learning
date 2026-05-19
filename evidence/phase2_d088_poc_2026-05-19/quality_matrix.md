# Quality Matrix — Phase 2 D-088 γ PoC

Side-by-side reviewer assessment of 12 model outputs (4 queries × Sonnet 4.6 / Opus 4.7 / Haiku 4.5).

**Reviewer**: main session Opus 4.7 (Rule D-compliant — different agent context from the 12 writer subagents).
**Method**: line-by-line comparison of each `raw_logs/*.md` against the reference answer keys (the v1.0.3 corpus JSON files themselves).

**Rating scale (external, not self-rated)**:
- ★★★★★ = pedagogically excellent + technically accurate + project-specific value
- ★★★★ = solid + accurate + reasonable depth
- ★★★ = correct verdict but shallow / minor JP accuracy issues
- ★★ = significant errors or missing core requirements
- ★ = broken / wrong verdict

---

## Q1 — 不正アクセス禁止法 legal question explain

| Aspect | Sonnet 4.6 | Opus 4.7 | Haiku 4.5 |
|---|---|---|---|
| Correct verdict (B) | ✅ | ✅ | ✅ |
| Both access types (auth misuse + security hole) | ✅ both | ✅ both, names them as 1類 / 2類 | ❌ only first |
| Technical JP terms (識別符号 / なりすまし) | ✅ 識別符号 | ✅ both | ❌ neither |
| Wrong-choice law attribution | ✅ all 3 | ✅ all 3 + civil/criminal split | ⚠️ inaccurate for D (児童ポルノ ≠ wat's tested) |
| Sister-law overview for exam prep | ❌ none | ✅ 8-row sister table | ❌ none |
| Output length (tokens est) | 520 | 1400 | 450 |
| Self-rating | 4/5 | 5/5 | 4/5 |
| **External rating** | **★★★★** | **★★★★★** | **★★★** |

**Verdict**: Opus best for exam prep (sister-law cross-reference is valuable); Sonnet sufficient for explain; Haiku misses the second access type which is a frequent ITパスポート exam point.

---

## Q2 — 3Dプリンター term hover

| Aspect | Sonnet 4.6 | Opus 4.7 | Haiku 4.5 |
|---|---|---|---|
| Romaji (3D purintā) | ✅ | ✅ | ✅ |
| Chinese concept (3D 打印机) | ✅ | ✅ | ✅ |
| Why testable on ITパスポート | ✅ テクノロジ系 category | ✅ + コンピュータ構成要素→入出力装置 sub-path | ⚠️ generic ("先进制造话题") |
| Tooltip length compliance (2-4 sentences) | ✅ 2 sentences | ⚠️ 3+ sentences but dense | ✅ 2-3 sentences |
| Pedagogical value-add | ⚠️ basic | ✅ Additive Manufacturing + 拗音長音 phonetic rule tip | ⚠️ none |
| Output length (tokens est) | 110 | 180 | 95 |
| Self-rating | 4/5 | 4/5 | 4/5 |
| **External rating** | **★★★★** | **★★★★★** | **★★★** |

**Verdict**: Haiku acceptable for tooltip — output fits the constraint cleanly; Opus adds value but exceeds tooltip length norm; Sonnet is sweet spot.

---

## Q3 — Chapter strategy summary (p175-184)

| Aspect | Sonnet 4.6 | Opus 4.7 | Haiku 4.5 |
|---|---|---|---|
| 3-5 bullets per spec | ✅ 5 | ✅ 5 | ✅ 5 |
| Each bullet has JP term + reading + concept | ✅ all 5 | ✅ all 5 + 真题年份 (令和2/3年度) | ✅ all 5 |
| Selected concepts grounded in source | ✅ IoT, 組込み, インダストリー4.0, レコメンデーション, Society 5.0 | ✅ IoT 3要素, センサー/アクチュエーター, 組込み, IoT scenarios, e-Business | ⚠️ JIT/ジャストインタイム 5th bullet not clearly in p175-184 sample |
| JP romaji accuracy | ✅ all correct | ✅ all correct | ❌ `kumikomikomareta shisutemu` typo (should be `kumikomi shisutemu`) |
| Exam pedagogy hooks | ⚠️ light | ✅ "题干关键词「特定の機能」基本一锤定音" / 真题年份 references | ❌ none |
| Output length (tokens est) | 320 | 650 | 280 |
| Self-rating | 4/5 | 4/5 | 4/5 |
| **External rating** | **★★★★** | **★★★★★** | **★★★** |

**Verdict**: Opus best for chapter-scope synthesis with exam-prep framing. Haiku has minor JP accuracy issues + possibly weak grounding on JIT inclusion (need confirmation against source, but flagged).

---

## Q5 — Kana edge case (signature project use case)

| Aspect | Sonnet 4.6 | Opus 4.7 | Haiku 4.5 |
|---|---|---|---|
| Correct verdict (エ レコメンデーション) | ✅ | ✅ | ✅ |
| Romaji per choice | ✅ all 4 + 长音 handled | ✅ all 4 + syllable-level breakdown | ⚠️ `furasshu makettingu` (missing 長音 in māketingu) |
| Chinese concept per choice | ✅ | ✅ + cross-sell terminology | ✅ |
| Why is/isn't correct (per choice) | ✅ | ✅ + signal-word matching ("履歴/関心/別商品") | ✅ |
| Kana memory hooks for non-native learners | ✅ memory table | ✅ memory table + 一句话锚点 mnemonic + 拗音/促音/長音 rules | ❌ none |
| Project's signature kana_helper alignment | ✅✅ strong | ✅✅✅ strongest | ⚠️ surface only |
| Output length (tokens est) | 680 | 1700 | 650 |
| Self-rating | 4/5 | 5/5 | 4/5 |
| **External rating** | **★★★★★** | **★★★★★+** | **★★★** |

**Verdict**: This is the project's core use case (per `feedback_no_book_identity.md` motivation: kana_helper exists to help non-native learners with katakana). Opus delivers most pedagogically; Sonnet fully capable; Haiku misses syllable-level breakdown which IS the kana_helper feature, and has a JP 長音 accuracy slip.

---

## Aggregate ranking

| Model | Avg external rating | Token output range | Wall (subagent) | Notes |
|---|---|---|---|---|
| **Opus 4.7** | ★★★★★ (avg 5.0) | 180-1700 tokens | 20-65s | Best pedagogical depth, exam tips, JP accuracy. ~5× Sonnet cost. |
| **Sonnet 4.6** | ★★★★ (avg 4.25) | 110-680 tokens | 26-41s | Solid default — accurate + pedagogically present + good length compliance. |
| **Haiku 4.5** | ★★★ (avg 3.0) | 95-650 tokens | 15-19s | Fast + cheap + correct verdicts BUT minor JP romaji errors + missing project-signature kana depth + occasional misattribution (Q1 D, Q3 JIT). |

---

## Routing recommendation (drives D-088 §2.5)

**Tier 1 (default, all scopes)**: **Sonnet 4.6** — quality 80-90% of Opus at 20% of cost.

**Tier 2 (premium opt-in)**: **Opus 4.7** for:
- Whole-book Chat (D-085 §2.4 独立 Chat tab) — already requires 1M ctx, Opus quality premium worth it
- "Deep explain" mode (user explicit toggle) — exam-prep depth + JP technical terms + syllable-level kana
- Suggested label: 「学習サポート Pro」 / "深度模式" toggle

**Tier 3 (cheap allowlist)**: **Haiku 4.5** for:
- Term hover tooltip (D-085 §2.5 Study mode hover popover, ≤ 200 tokens) — Q2 confirmed fit
- NOT for question explain (Q1-style) — H2 weak
- NOT for kana edge (Q5-style, signature use case) — H2 weak
- NOT for chapter summary (Q3-style) — JP accuracy concerns

---

## Rule A audit checklist

Independent audit per Rule A (>50% compression of raw outputs into this matrix):

- [ ] User samples 3 raw_logs/*.md files, reads them, and confirms my external ratings match their independent read
- [ ] User confirms Haiku's `kumikomikomareta shisutemu` typo in `Q3_chapter_strategy_p175_184_haiku.md`
- [ ] User confirms Opus's sister-law table in `Q1_question_p087_opus.md` (verify the 8 rows make sense)
- [ ] User does spot-check on at least 1 Sonnet output to validate Tier 1 default claim

If user sample audit shows >1 of my ratings differ by ≥1 star from theirs, this matrix needs revision before D-088 lock.
