#!/usr/bin/env node
// Track L step L5 (docs/phase5/PLAN_hosting_migration.md §3) — builds scripts/fixtures/lang-allow.json, the allow-list
// of the permanent leak gate (`node --no-warnings scripts/lang-leak-scan.ts --gate`).
//
// The fixture is not "whatever fires today": every gate hit of the current corpus is matched against CLASSES below
// (each = one reviewed judgment of L2 / L3 / L4 / D-189 / D-222, with its reason). A hit that no class claims is left
// out, so the gate keeps failing on it — that is how a real leak stays visible. Each written entry is keyed by
// rule + file + path + exact matched text (+ occurrence count), so the same text anywhere else still fails.
// Regeneration cannot absorb a new hit silently (L5 review M-2): the classes are narrow (enumerated locations, the
// matched text must be a bracketed original / data found in the question's Japanese, exact UI values), and any claim
// that is not already in the fixture (new key or higher count) makes the run exit 1 unless --accept-new is given.
// Run: node --no-warnings scripts/l5-build-allowlist.ts [--write] [--accept-new]
//   dry run (no --write): prints unclaimed hits, new claims (+) and dropped entries (-)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ALLOW_FILE, collect, ROOT } from "./lang-leak-scan.ts";
import { allowKey, detect, exclusionOf, WARN_RULES, type AllowEntry, type AllowFile, type Group, type Hit, type RuleId, type ScopeExclusion } from "./lib/lang-leak.ts";

const CATEGORIES: Record<string, string> = {
  "d189-label": "D-189 design: book labels identical in ja / zh / en on purpose — the Practice keys of 70978b70 (問 / 解説 / 解答 / ここがポイント / 出典 / 用語 / 正解 / 頻出度 / 共通前文), Practice.cat_* (the JP 分野 tag in every locale: apps/web/src/lib/practice/practiceLabels.ts:7, L3 A10; 7c993eac), the 頻出度 column / sort keys (Today.colStars, Record.sortStars / colStars; 7e7f4b27) and the three category names inside Mock.randomLead. Matched by key and exact value; 分野, 正答率 and Mock.colKey are not D-189 (L3 A30, L4, L5).",
  "site-name": "Brand: the site name ITパスポート 過去問ノート is the same in all three locales (L3 A16).",
  "locale-name": "Language names written in their own language (日本語 / 中文) in the locale switcher and search placeholder.",
  "ui-same-chinese": "R-same without the 12-char floor (L5): a short zh label identical to ja that is ordinary Chinese with the same meaning.",
  "keep-decision": "Kept by a recorded decision (D-222 / its amendment / L4 round 2): the word is understood in Chinese or is a legal / proper name.",
  "question-label": "Labels defined by the question itself (2009h21a q093–q096 商品あ〜こ, L3 A01/A02/A23/A24).",
  "question-data": "Question data that must stay Japanese for the question to work: LIKE / search patterns and the strings they match, pseudo-language notation, kinsoku characters, a file-name rule from a Japanese figure (L3 A03).",
  "proper-name": "Japanese place names and the official Japanese names of systems (本駒込, 栃木県, みちびき).",
  "bracket-original": "Quiz sidecar convention (L2 / L3 A04/A17/A21): the Japanese original next to its translation, in brackets / quotes or introduced by 日语称 / in Japanese. The quiz sidecars have no [[jp:]] markup.",
  "jp-explained": "The text explains a Japanese word itself (its reading, its characters, a Japanese search word); the Japanese is the subject of the sentence.",
  "tb-data": "Textbook: example data (a sample character, a LIKE example) — not exam wording, so not [[jp:]]-marked (S156 C22).",
  "d222-6": "D-222.6: the bold **帰無** in the 帰無仮説 hook stays unmarked (removing the bold loses the emphasis; one case).",
  "same-formula": "R-same: a formula or label whose Japanese spelling is also the correct Chinese (exam spreadsheet notation 平均 / 整数部, 特性 (JIS …), if (条件) …) — L3 A14/A15.",
};

const SCOPE_EXCLUSIONS: ScopeExclusion[] = [
  {
    id: "derived",
    source: "textbook-units",
    tag: "derived",
    reason: "v1 compat fields (terms[].definition / explanation / memory_hook, overview.intro, summary.key_points / memory_hooks) are derived by the merge from the gated content fields (validateV2 `compat` checks equality; compatText turns [[jp:X]] into （X）). Guarded, not blind: --gate fails if a derived run has a character that its unit's content runs and [[jp:]] do not have.",
  },
  {
    id: "key-guard-note",
    source: "quiz-explanations",
    path_re: "\\.key_guard\\.",
    reason: "key_guard.note_jp is an internal audit note that quotes the zh text it checked (R-ja-simp by design). Not rendered and not shipped: quizModel reads only key_guard.suspect, and H1-4 (073cd900) removed key_guard from the client.",
  },
];

/** keep-decision: the reviewed occurrences, enumerated (file, path) per word — a new occurrence needs a new reviewed line. */
const KEEP_AT: Record<string, [string, string][]> = {
  "过去问": [
    ["apps/web/messages/zh.json","Sensei.reviewEmptyHint"],
    ["apps/web/messages/zh.json","Textbook.confirmCount"],
    ["apps/web/messages/zh.json","Textbook.pastCount"],
    ["apps/web/messages/zh.json","Textbook.termPast"],
    ["apps/web/messages/zh.json","Textbook.topicPast"],
    ["apps/web/messages/zh.json","Today.answered"],
  ],
  "多重化": [
    ["data/ip/quiz/explanations/2009h21a.json","questions.2009h21a-q067.distractors.イ.zh"],
    ["data/ip/quiz/explanations/2009h21a.json","questions.2009h21a-q067.points[1].zh"],
    ["data/ip/quiz/explanations/2013h25a.json","questions.2013h25a-q047.correct.zh"],
    ["data/ip/quiz/explanations/2013h25a.json","questions.2013h25a-q047.points[0].zh"],
    ["data/ip/quiz/explanations/2013h25a.json","questions.2013h25a-q047.points[1].zh"],
    ["data/ip/quiz/explanations/2013h25a.json","questions.2013h25a-q066.distractors.ア.zh"],
    ["data/ip/quiz/explanations/2013h25a.json","questions.2013h25a-q066.points[1].zh"],
    ["data/ip/quiz/explanations/2013h25a.json","questions.2013h25a-q073.distractors.ア.zh"],
    ["data/ip/quiz/explanations/2015h27a.json","questions.2015h27a-q058.points[1].zh"],
    ["data/ip/quiz/explanations/2015h27h.json","questions.2015h27h-q064.correct.zh"],
    ["data/ip/quiz/explanations/2015h27h.json","questions.2015h27h-q079.distractors.ウ.zh"],
    ["data/ip/quiz/explanations/2016h28a.json","questions.2016h28a-q067.correct.zh"],
    ["data/ip/quiz/explanations/2016h28a.json","questions.2016h28a-q067.points[0].zh"],
    ["data/ip/quiz/explanations/2019r01a.json","questions.2019r01a-q074.distractors.エ.zh"],
    ["data/ip/quiz/translations/2009h21a.json","questions.2009h21a-q067.choices.イ.zh"],
    ["data/ip/quiz/translations/2013h25a.json","questions.2013h25a-q047.choices.エ.zh"],
    ["data/ip/quiz/translations/2016h28a.json","questions.2016h28a-q067.stem.zh"],
  ],
  "误答": [
    ["data/ip/quiz/explanations/2009h21h.json","questions.2009h21h-q014.distractors.エ.zh"],
    ["data/ip/quiz/explanations/2010h22a.json","questions.2010h22a-q086.distractors.ア.zh"],
    ["data/ip/quiz/explanations/2010h22a.json","questions.2010h22a-q086.distractors.イ.zh"],
    ["data/ip/quiz/explanations/2012h24a.json","questions.2012h24a-q025.distractors.ア.zh"],
    ["data/ip/quiz/explanations/2015h27a.json","questions.2015h27a-q087.distractors.ウ.zh"],
    ["data/ip/quiz/explanations/2016h28a.json","questions.2016h28a-q028.distractors.イ.zh"],
    ["data/ip/quiz/explanations/2026r08.json","questions.2026r08-q067.distractors.エ.zh"],
  ],
  "利害关系者": [
    ["data/ip/quiz/explanations/2011h23a.json","questions.2011h23a-q022.distractors.ア.zh"],
    ["data/ip/quiz/explanations/2022r04.json","questions.2022r04-q052.correct.zh"],
    ["data/ip/quiz/explanations/2022r04.json","questions.2022r04-q052.points[0].zh"],
    ["data/ip/quiz/explanations/2026r08.json","questions.2026r08-q040.correct.zh"],
    ["data/ip/textbook/units/management-10-27-u01.json","terms[3].one_zh"],
    ["data/ip/textbook/units/strategy-01-01-u02.json","terms[2].one_zh"],
    ["data/ip/textbook/units/strategy-01-01-u03.json","terms[3].one_zh"],
    ["data/ip/textbook/units/strategy-07-23-u01.json","overview_rows[3].one_line_zh"],
    ["data/ip/textbook/units/strategy-07-23-u01.json","terms[0].detail_zh"],
    ["data/ip/textbook/units/strategy-07-23-u01.json","terms[3].one_zh"],
  ],
  "事业者": [
    ["data/ip/quiz/explanations/2013h25h.json","questions.2013h25h-q025.distractors.イ.zh"],
    ["data/ip/quiz/explanations/2013h25h.json","questions.2013h25h-q025.points[1].zh"],
    ["data/ip/quiz/explanations/2015h27h.json","questions.2015h27h-q015.distractors.ウ.zh"],
    ["data/ip/textbook/units/strategy-02-08-u01.json","terms[4].fig.data.rows[0].cells[0].zh"],
  ],
  "满足度": [
    ["data/ip/quiz/explanations/2014h26a.json","questions.2014h26a-q024.correct.zh"],
  ],
  "利用者": [
    ["data/ip/quiz/explanations/2014h26h.json","questions.2014h26h-q010.correct.zh"],
  ],
};
/** bracket-original words (R-zh-jpword): enumerated (file, path, text). */
const BRACKET_WORD_AT: [string, string, string][] = [
  ["data/ip/quiz/explanations/2009h21h.json","questions.2009h21h-q049.distractors.ア.zh","结合测试"],
  ["data/ip/quiz/explanations/2010h22h.json","questions.2010h22h-q034.correct.zh","结合测试"],
  ["data/ip/quiz/explanations/2010h22h.json","questions.2010h22h-q040.correct.zh","结合测试"],
  ["data/ip/quiz/explanations/2011h23a.json","questions.2011h23a-q037.points[1].zh","结合测试"],
  ["data/ip/quiz/explanations/2011h23a.json","questions.2011h23a-q044.distractors.ア.zh","结合测试"],
  ["data/ip/quiz/explanations/2011h23tokubetsu.json","questions.2011h23tokubetsu-q013.correct.zh","提携"],
  ["data/ip/quiz/explanations/2016h28h.json","questions.2016h28h-q043.distractors.ア.zh","单体测试"],
  ["data/ip/quiz/explanations/2017h29h.json","questions.2017h29h-q013.correct.zh","责任者"],
  ["data/ip/quiz/explanations/2017h29h.json","questions.2017h29h-q013.points[1].zh","责任者"],
  ["data/ip/quiz/explanations/2018h30a.json","questions.2018h30a-q082.distractors.ア.zh","二重化"],
  ["data/ip/quiz/explanations/2020r02o.json","questions.2020r02o-q036.distractors.イ.zh","结合测试"],
  ["data/ip/quiz/translations/2017h29h.json","questions.2017h29h-q013.stem.zh","责任者"],
  ["data/ip/textbook/units/management-08-25-u03.json","terms[1].detail_zh","结合测试"],
];

/** A class: every given condition must hold. at = exact (file, path[, text]) locations; value = the whole field value. */
type Cls = { cat: string; rules?: RuleId[]; file?: RegExp; path?: RegExp; text?: RegExp; value?: RegExp; at?: (readonly string[])[]; when?: (h: Hit, c: Ctx) => boolean; reason?: string };
/** The field value of a hit and the Japanese text of its question (questions.json stem / choices, stem_jp_clean, explanation jp). */
export type Ctx = { value: string; ja: string };
const KANA_CJK_FORM: RuleId[] = ["R-zh-kana", "R-en-cjk", "R-zh-jpform"];
const UI = /^apps\/web\/messages\//;
const q = (...ids: string[]) => new RegExp(`^questions\\.(?:${ids.join("|")})\\.`);

const OPEN = "（(「『“《【";
const CLOSE = "）)」』”》】";
/** The run [i, i+len) lies inside a bracket / quote pair of the value. */
function enclosed(v: string, i: number, len: number): boolean {
  const stack: number[] = [];
  const sym: Record<string, number> = {}; // ASCII ' and " pair with the next one
  for (let k = 0; k < v.length; k++) {
    if (v[k] === "'" || v[k] === '"') {
      const s = sym[v[k]];
      if (s === undefined) sym[v[k]] = k;
      else {
        delete sym[v[k]];
        if (s < i && k >= i + len) return true;
      }
    } else if (OPEN.includes(v[k])) stack.push(k);
    else if (CLOSE.includes(v[k]) && stack.length) {
      const s = stack.pop() as number;
      if (s < i && k >= i + len) return true;
    }
  }
  return false;
}
/** A bracketed / introduced Japanese original: inside brackets or quotes, introduced by 日语 / in Japanese / 也叫 …, or glossed by a following bracket. */
export const bracketed = (h: Hit, c: Ctx): boolean =>
  enclosed(c.value, h.index, h.text.length) ||
  /(日语|日文|日本语|日本|Japanese|写法为|称为|称作|也叫|叫作)[^。.]{0,24}$/u.test(c.value.slice(Math.max(0, h.index - 32), h.index)) ||
  /^\s*in Japanese\b/u.test(c.value.slice(h.index + h.text.length)) ||
  /^\s*[（(]/u.test(c.value.slice(h.index + h.text.length));
/** Question data: the matched text occurs in the question's own Japanese (stem / choices / explanation). */
export const inJa = (h: Hit, c: Ctx): boolean => c.ja.includes(h.text);
const atMatch = (h: Hit, at: (readonly string[])[]): boolean => at.some(([f, p, t]) => h.file === f && h.path === p && (t === undefined || h.text === t));

export const CLASSES: Cls[] = [
  // ---- ui-messages (exact values)
  { cat: "site-name", file: UI, path: /^App\.siteName$/, value: /^ITパスポート 過去問ノート$/ },
  { cat: "locale-name", file: UI, path: /^(Locale\.(ja|zh)|Glossary\.searchPlaceholder)$/, text: /^(日本語|中文|日本語・中文・|語)$/, value: /^(日本語|中文|Search terms \(日本語・中文・English\)|搜索术语（日本語・中文・English）)$/ },
  { cat: "d189-label", file: UI, path: /^Practice\.(qLabel|starsLabel|preamble|sourcePrefix|explanationTab|correct|pointsTitle|terms|answerTag|cat_(strategy|management|technology))$/, value: /^(問|頻出度|共通前文 ▸|出典|解説|正解|ここがポイント|用語|解答|ストラテジ系|マネジメント系|テクノロジ系)$/ },
  { cat: "d189-label", file: UI, path: /^(Today\.colStars|Record\.(sortStars|colStars))$/, value: /^頻出度$/, reason: "頻出度 (D-189 label) as a column / sort label outside Practice (7e7f4b27)" },
  { cat: "d189-label", file: UI, path: /^Mock\.randomLead$/, text: /^・?(ストラテジ|マネジメント|テクノロジ)系?$/, reason: "the three D-189 category names quoted in a sentence" },
  { cat: "ui-same-chinese", rules: ["R-same"], file: /zh\.json$/, path: /^(App\.nav\.(today|glossary)|Today\.(colActions|aiReview)|Textbook\.keyPoints|Sensei\.(keySave|stop)|Practice\.(scope_exam|countAll|browseExams)|Settings\.save|Mock\.unanswered)$/, text: /^(今日|辞典|操作|AI 分析|要点|保存|停止|年度|全部|未回答)$/ },
  { cat: "keep-decision", rules: ["R-zh-jpword"], text: /^过去问$/, at: KEEP_AT["过去问"], reason: "D-222.2: zh 「过去问」 kept — the product word (過去問ノート) and what Chinese candidates call it" },
  // ---- quiz: question labels and data (the text must be in the question's own Japanese)
  { cat: "question-label", rules: KANA_CJK_FORM, path: q("2009h21a-q09[3-6]"), text: /^[あいうえおかきくけこ]$/, when: inJa },
  { cat: "question-data", rules: KANA_CJK_FORM, path: q("2011h23a-q073"), when: inJa, reason: "LIKE pattern %イ%ン_ and the four katakana words it is matched against (the choices)" },
  { cat: "question-data", rules: KANA_CJK_FORM, path: q("2016h28h-q096"), text: /^子$/, when: inJa, reason: "LIKE patterns %子 / 子% / %子%" },
  { cat: "question-data", rules: KANA_CJK_FORM, path: q("2024r06-q093"), when: inJa, reason: "LIKE pattern %葉_ and the employee names it is matched against" },
  { cat: "question-data", rules: KANA_CJK_FORM, path: q("2019r01a-q099"), text: /^データ$/, when: inJa, reason: "the search string データ of the question" },
  { cat: "question-data", rules: KANA_CJK_FORM, path: q("2022r04-q071"), text: /^ゃゅょっ$/, when: bracketed, reason: "the small kana that kinsoku processing moves (the subject of the question)" },
  { cat: "question-data", rules: ["R-en-cjk"], path: q("2024r06-q062"), text: /^〇$/, when: inJa, reason: "pseudo-language declaration mark 〇 of the exam program notation" },
  { cat: "question-data", rules: ["R-en-cjk"], path: q("2013h25a-q094"), text: /^報告$/, when: inJa, reason: "the file-name rule 「報告_」+yymm… quoted from the Japanese figure of the question" },
  { cat: "proper-name", rules: KANA_CJK_FORM, path: q("2009h21a-q09[7-9]", "2009h21a-q100"), text: /^込$/, reason: "address 本駒込 on the question's invoice" },
  { cat: "proper-name", rules: KANA_CJK_FORM, path: q("2009h21h-q067"), text: /^栃$/, reason: "place name 栃木県 (Chinese also writes 栃木县)" },
  { cat: "proper-name", rules: KANA_CJK_FORM, path: q("2024r06-q099"), text: /^みちびき$/, when: bracketed, reason: "the official Japanese name of the QZSS satellite system" },
  // ---- quiz: bracketed / introduced Japanese originals (each qid read in L2 / L3 / L5; the run itself must be bracketed / introduced)
  {
    cat: "bracket-original",
    rules: KANA_CJK_FORM,
    when: bracketed,
    path: q(
      "2009h21a-q019", "2010h22a-q007", "2010h22h-q017", "2010h22h-q037", "2012h24h-q018", "2014h26a-q008", "2014h26h-q026", "2015h27a-q09[7-9]", "2015h27a-q100",
      "2015h27h-q010", "2016h28a-q012", "2016h28h-q003", "2018h30h-q007", "2019r01a-q039", "2022r04-q029", "2022r04-q040", "2022r04-q074", "2025r07-q015", "2026r08-q031",
      "2009h21h-q008", "2011h23tokubetsu-q013", "2012h24h-q041", "2013h25a-q003", "2013h25a-q008", "2013h25h-q002", "2013h25h-q035", "2014h26a-q093", "2014h26h-q005",
      "2014h26h-q008", "2015h27h-q005", "2015h27h-q007", "2016h28h-q019", "2019h31h-q040", "2026r08-q029", "2014h26h-q09[3-6]",
    ),
  },
  { cat: "jp-explained", rules: KANA_CJK_FORM, path: q("2013h25a-q054", "2017h29a-q022", "2019r01a-q008", "2016h28a-q074"), when: (h, c) => bracketed(h, c) && inJa(h, c), reason: "explains Japanese words (〜のうち / と, クラウド homophones, 〜シティ, 以上 / 以下)" },
  // ---- quiz: R-same formulas (the whole choice is the formula)
  { cat: "same-formula", rules: ["R-same"], path: /^questions\.(2016h28h-q080|2018h30h-q060|2021r03-q095)\.choices\.[アイウエ]\.zh$/, reason: "exam spreadsheet notation (整数部 / 平均) or 商品A… — identical and correct in Chinese" },
  // ---- words kept by decision / bracketed originals (R-zh-jpword): enumerated locations
  { cat: "keep-decision", rules: ["R-zh-jpword"], text: /^多重化$/, at: KEEP_AT["多重化"], reason: "D-222 amendment: 多重化 kept — unlike S131's 二重化→冗余化, 多重化 is also a Chinese IT term" },
  { cat: "keep-decision", rules: ["R-zh-jpword"], text: /^误答$/, at: KEEP_AT["误答"], reason: "D-222.3: 误答 kept — understood in Chinese (答错)" },
  { cat: "keep-decision", rules: ["R-zh-jpword"], text: /^事业者$/, at: KEEP_AT["事业者"], reason: "D-222 amendment: 事业者 kept in legal / proper names (电气通信事业者 of the Telecommunications Business Act, GS1 事业者代码)" },
  { cat: "keep-decision", rules: ["R-zh-jpword"], text: /^满足度$/, at: KEEP_AT["满足度"], reason: "D-222 amendment: 满足度 kept (功能满足度 = degree of meeting the requirements, valid Chinese; L4b)" },
  { cat: "keep-decision", rules: ["R-zh-jpword"], text: /^利害关系者$/, at: KEEP_AT["利害关系者"], reason: "L4 round 2: 利害关系者 kept (UNSURE → kept; close to Chinese 利害关系人, often given as the alias of 利益相关者)" },
  { cat: "keep-decision", rules: ["R-zh-jpword"], text: /^利用者$/, at: KEEP_AT["利用者"], reason: "D-222 amendment: 共同利用者 (B0490) kept — the term of the Act on the Protection of Personal Information" },
  { cat: "bracket-original", rules: ["R-zh-jpword"], at: BRACKET_WORD_AT, when: bracketed, reason: "the Japanese name in brackets / quotes / 「日语中也叫」 (结合测试 / 单体测试 / 二重化 / 派遣先责任者 / 企業提携)" },
  // ---- textbook
  { cat: "jp-explained", rules: ["R-zh-jpword"], at: [["data/ip/textbook/units/strategy-05-14-u09.json", "terms[4].detail_zh", "正解"]], reason: "「没有唯一正解」 = Chinese 正解 (the one right answer), not the exam's answer (L4b)" },
  { cat: "d222-6", at: [["data/ip/textbook/units/technology-13-34-u03.json", "terms[4].hook_zh", "帰無"], ["data/ip/textbook/units/technology-13-34-u03.json", "terms[4].hook_en", "帰無"]] },
  { cat: "same-formula", rules: ["R-same"], file: /(management-08-25-u01|technology-14-37-u01)\.json$/, path: /\.fig\.data\./, value: /^(特性 \(JIS X 25010:2013\)|if \(条件\) … else … endif|while \(条件\) … endwhile)$/ },
  { cat: "tb-data", file: /(technology-13-35-u02|technology-14-37-u04)\.json$/, text: /^あ$/, when: bracketed, reason: "sample character あ in a character-code example" },
  { cat: "tb-data", at: [["data/ip/textbook/units/technology-21-56-u01.json", "terms[2].points[1].text_en", "山"]], reason: "LIKE example %山 / 山%" },
  // technology-14-37-u03 terms[2].detail_en 整数型 (exam pseudo-language type name) is marked [[jp:]] since S156 C22.
  { cat: "jp-explained", at: [["data/ip/textbook/units/technology-21-55-u01.json", "terms[4].term_en", "表"]], reason: "S155: the en headword 'Table (Japanese term 表)' names the Japanese word the term explains; term_en is a plain-string headword (manifest.v1_terms → reader h3 gloss, glossary termEn / search; B3 refuses term keys), so [[jp:]] is not parsed there and the word stays unmarked" },
];

export const claim = (h: Hit, c: Ctx): Cls | undefined =>
  CLASSES.find(
    (k) =>
      (!k.rules || k.rules.includes(h.rule)) &&
      (!k.file || k.file.test(h.file)) &&
      (!k.path || k.path.test(h.path)) &&
      (!k.text || k.text.test(h.text)) &&
      (!k.value || k.value.test(c.value)) &&
      (!k.at || atMatch(h, k.at)) &&
      (!k.when || k.when(h, c)),
  );

const QID = /\d{4}[a-z0-9]+-q\d+/;
/** Field values by file|path and the Japanese text of each question, from the collected groups. */
export function contexts(groups: Group[]): (h: Hit) => Ctx {
  const values = new Map<string, string>();
  const ja = new Map<string, string>();
  for (const g of groups)
    for (const [l, m] of Object.entries(g.members)) {
      if (typeof m?.value !== "string") continue;
      values.set(`${m.file ?? g.file}|${m.path}`, m.value);
      const id = l === "ja" ? QID.exec(m.path)?.[0] : undefined;
      if (id) ja.set(id, `${ja.get(id) ?? ""}\n${m.value}`);
    }
  return (h) => ({ value: values.get(`${h.file}|${h.path}`) ?? "", ja: ja.get(QID.exec(h.path)?.[0] ?? "") ?? "" });
}

export type Build = { out: AllowFile; gated: Hit[]; unclaimed: Hit[]; added: AllowEntry[]; dropped: AllowEntry[] };
/** Classify the gate hits; `added` = claims not in `old` (new key or higher count), `dropped` = old entries no longer claimed. */
export function build(hits: Hit[], ctx: (h: Hit) => Ctx, old: AllowFile | null): Build {
  const gated = hits.filter((h) => !WARN_RULES.has(h.rule) && h.subtag !== "punct-only" && !(h.rule !== "R-same" && exclusionOf(h, SCOPE_EXCLUSIONS)) && h.rule !== "R-empty");
  const entries = new Map<string, AllowEntry>();
  const unclaimed: Hit[] = [];
  for (const h of gated) {
    const c = claim(h, ctx(h));
    if (!c) {
      unclaimed.push(h);
      continue;
    }
    const k = allowKey(h);
    const e = entries.get(k);
    if (e) e.count++;
    else entries.set(k, { rule: h.rule, source: h.source, file: h.file, path: h.path, text: h.text, count: 1, category: c.cat, reason: c.reason ?? CATEGORIES[c.cat] });
  }
  const out: AllowFile = {
    schema: "lang-allow-1",
    categories: CATEGORIES,
    scope_exclusions: SCOPE_EXCLUSIONS,
    entries: [...entries.values()].sort((a, b) => a.category.localeCompare(b.category) || a.file.localeCompare(b.file) || a.path.localeCompare(b.path) || a.rule.localeCompare(b.rule)),
  };
  const before = new Map((old?.entries ?? []).map((e) => [allowKey(e), e]));
  const added = out.entries.filter((e) => (before.get(allowKey(e))?.count ?? 0) < e.count);
  const now = new Set(out.entries.map(allowKey));
  const dropped = (old?.entries ?? []).filter((e) => !now.has(allowKey(e)));
  return { out, gated, unclaimed, added, dropped };
}

if (import.meta.filename === path.resolve(process.argv[1] ?? "")) {
  const { groups } = collect();
  const { hits } = detect(groups);
  const file = path.join(ROOT, ALLOW_FILE);
  const old = existsSync(file) ? (JSON.parse(readFileSync(file, "utf-8")) as AllowFile) : null;
  const { out, gated, unclaimed, added, dropped } = build(hits, contexts(groups), old);
  const byCat: Record<string, number> = {};
  for (const e of out.entries) byCat[e.category] = (byCat[e.category] ?? 0) + 1;
  console.log(`gate hits ${gated.length}: claimed ${gated.length - unclaimed.length} → ${out.entries.length} entries, unclaimed ${unclaimed.length}, new claims ${added.length}, dropped ${dropped.length}`);
  console.log(JSON.stringify(byCat));
  for (const h of unclaimed) console.log(`UNCLAIMED ${h.rule}  ${h.file}  ${h.path}  [${h.lang}]  «${h.text.replace(/\n/g, "⏎").slice(0, 60)}»  ${h.excerpt}`);
  for (const e of added) console.log(`+ NEW ${e.category}  ${e.rule}  ${e.file}  ${e.path}  «${e.text}» ×${e.count}`);
  for (const e of dropped) console.log(`- ${e.category}  ${e.rule}  ${e.file}  ${e.path}  «${e.text}» ×${e.count}`);
  const accept = process.argv.includes("--accept-new");
  if (added.length && !accept) {
    console.log(`refusing: ${added.length} new claim(s) not in ${ALLOW_FILE}. Read each "+ NEW" line; rerun with --accept-new only if every one is a reviewed judgment.`);
    process.exit(1);
  }
  if (process.argv.includes("--write")) {
    // one entry per line: reviewable diffs when the corpus changes
    const head = JSON.stringify({ ...out, entries: [] }, null, 1).replace(/"entries": \[\]\n}$/, '"entries": [\n');
    writeFileSync(file, `${head}${out.entries.map((e) => `  ${JSON.stringify(e)}`).join(",\n")}\n ]\n}\n`);
    console.log(`wrote ${ALLOW_FILE}`);
  }
}
