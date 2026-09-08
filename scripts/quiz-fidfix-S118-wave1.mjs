#!/usr/bin/env node
// Stage 6 / Quiz — S118 ⑤-2 波 1 (2015h27a 68 問 + 2016h28a 84 問、gp/cr 双 pass = 304 agent) の保真差分を是正する。
// 源: S118 log §34-§36 の 4 workflow。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_<exam>_<gp|cr>.json
//     機械 diff = scripts/quiz-fidelity-machdiff.mjs → AGENT_MISSED 去重 4 件 (実欠陥 2 / 偽陽性 2)。
//
// 層・方針は quiz-fidfix-S118-strat53.mjs と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions/bank/by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。片方にしか無い腐敗は
//     assert-once の n===0 で自動 skip される (例: q027 の中黒は clean 層のみ、q098 の T1 は raw 層のみ)
//   - explanations は .phase2 (expl_jp_/expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//
// 採用した差分 (13 問 18 フィールド。主 context が源ページ 11 枚を原解像度で独立実読して確認):
//   2015h27a-q027 stem   「分析・評価し」→「分析評価し」(page-11: 中黒なし。**clean 層のみ**の混入、raw は源どおり)
//   2015h27a-q042 イ     「システム開発の総合テスト」→「システム開発**中**の総合テスト」(page-18)
//   2015h27a-q044 stem   **answer_affecting**。「生産性を規模工数で表す」→「生産性を規模**÷**工数で表す」(page-18)。
//                        ÷ は本問唯一の定義式で、脱落すると表示テキストだけからは ウ=10 を導出できない (severity は §裁定参照)
//   2015h27a-q059 ア     「認証用の照合データの許容値…可能性が」→「認証用データとの照合誤差の許容値…可能性は」(page-24)
//   2015h27a-q059 イ     **正解肢**。「認証のIDや…鍵やカードを」→「認証用の ID や…鍵やカード**類**を」(page-24)
//   2015h27a-q059 ウ     「パスワードやトークン**と違い**，」→「パスワードやトークン**など**，」(page-24。論理が逆転する)
//   2015h27a-q062 エ     末尾の空白 25 + 「.」を除去 (page-25)
//   2015h27a-q081 イ     「設けられ**た.,** 不正侵入」→「設けられた, 不正侵入」(page-33。同題は ASCII 読点 ", " 系なので
//                        混入した「.」だけを落とす。U+FF0C を新たに持ち込まない = strat53 Rule D LOW-2)
//   2015h27a-q093 stem   「【手順】」→「〔手順〕」(page-43。corpus は 〔 288 / 【 11 で 〔 が規範)
//   2015h27a-q097 stem   「【Aさんが調べた結果】」→「〔Aさんが調べた結果〕」(page-46。同じ表示 stem 内の前文側は既に 〔 〕)
//   2015h27a-q097 ウ     **正解肢**。「X社PC 回収 料金」→「X社 PC 回収 料金」(page-46)。本問は「文字列と文字列の間に
//                        スペースを記述すると AND 検索される」と明記する検索式問で、**空白は構文** (S118 例外規則)。AND 語数 3→4
//   2015h27a-q097 エ     同上「X社PC 機種 料金」→「X社 PC 機種 料金」
//   2016h28a-q018 ア     「営業部門の組織力**の**強化」→「営業部門の組織力強化」(page-07)
//   2016h28a-q028 stem   「単位：万円」→「単位　万円」(page-11: 源は全角空白区切りでコロン無し。corpus 先例 2016h28h-q033「単位　分」)
//   2016h28a-q043 stem   結合ヘッダ「進捗（月末時点）」の脱落を**表の直上のキャプション行**として復元 (page-16、jp/zh/en)
//   2016h28a-q098 stem   「ICカードを用いた」→「IDカードを用いた」(page-37: 源は題幹・選択肢イ/ウ とも一貫して ID カード)
//   2016h28a-q098 stem   raw 層に残る「T1IDカードを用いた」の混入「T1」も同じ page-37 実読に基づき除去 (N5 級だが同一文)
//
// 別脚本で処理:
//   2016h28a-q050  選択肢 4 つが源では図のみ (特性要因図 / パレート図 / 散布図 / フローチャート) で、dataset のテキスト肢が
//                  図の名称そのもの = 正解肢イ「パレート図」が答えを書いていた → `scripts/quiz-choicefig-D144s2.mjs --only 2016h28a-q050`
//                  (D-144 段 2 ②-a。複合図下端の「問51」1 行を落とすため bottomCut を新設)
//
// 見送り (evidence に理由を明記):
//   2015h27a-q066 stem   源に無い図説明段落が clean 層に挿入されている (D-141 型の代替テキスト)。**図は添付されているが
//                        裁断が壊れており** (WebP は上段 PC1/ハブ/ADSLモデム/インターネット/Webサーバ を丸ごと欠き、
//                        代わりに後続の題幹段落と選択肢ア〜ウ が写り込む)、段落を消すと学習者は接続構成を知る手段を失う
//                        → 段落は維持し、**図裁断の欠陥を backlog N7 に登記**
//   2015h27a-q009 stem   machdiff 偽陽性。源は 3 行の段落 → 表 の順、表示層は段落を 2 分割して間に表を差し込む配置差。語句増減なし
//   2016h28a-q043 の zh/en 表本体、2015h27a-q097 en の「A-san」/「Mr. A」 混在は本 batch の射程外 (backlog)
//
// Run: node scripts/quiz-fidfix-S118-wave1.mjs [--dry-run]
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2015h27a && node scripts/quiz-phase2-merge.mjs 2016h28a

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
let applied = 0, skipped = 0; const log = [];

// assert-once: 対象文字列がちょうど 1 回だけ出ることを要求し、2 回以上なら中断 (誤爆防止)。
// 冪等: to ⊃ from で既に to が入っている、または from が 0 回なら skip。
function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  obj[key] = s.replace(from, to); applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 36)}」→「${to.slice(0, 36)}」`); return true;
}

const Q062_TAIL = "よい。" + " ".repeat(25) + "."; // 源に無い空白 25 + ピリオド
// q043: 源の表は 2 段ヘッダで、月ヘッダ行の上に 10 列を横断する結合セル「進捗（月末時点）」がある。
// markdown 表は colspan を持てないため、corpus の既存規約 (表直上のキャプション行 — 2016h28h-q033「単位　分」/
// 2010h22h-q011「単位 億円」/ 2016h28h-q095「表1」など) に倣って**表の直上に 1 行**として復元する。
const CAP43 = { jp: ["と同じとする。\n\n| 項目 |", "と同じとする。\n\n進捗（月末時点）\n\n| 項目 |"],
                zh: ["的生产率相同。\n\n| 项目 |", "的生产率相同。\n\n进度（月末时点）\n\n| 项目 |"],
                en: ["from April onward.\n\n| Item |", "from April onward.\n\nProgress (as of month end)\n\n| Item |"] };

const FIX = {
  // ── 2015h27a ────────────────────────────────────────────────────────────
  // 中黒は clean 層だけの混入 (raw stem_jp は源どおり「分析評価し」)。zh「分析、评价」/ en "analyzes and evaluates" は
  // 語義が変わらないため不変。
  "2015h27a-q027": { jp: [["stem", "側面から分析・評価し", "側面から分析評価し"]] },
  "2015h27a-q042": {
    jp: [["イ", "システム開発の総合テストで", "システム開発中の総合テストで"]],
    zh: [["イ", "排除在系统开发的综合测试中发现的缺陷", "排除在系统开发过程中进行的综合测试中发现的缺陷"]],
    en: [["イ", "Removing bugs discovered during the integration test of system development", "Removing bugs discovered in the integration test conducted during system development"]],
  },
  // answer_affecting: 生産性の定義式 ÷ の脱落。zh も「规模工时」と ÷ を落としているので追随。
  "2015h27a-q044": {
    jp: [["stem", "生産性を規模工数で表す", "生産性を規模÷工数で表す"]],
    zh: [["stem", "生产率以规模工时来表示", "生产率以规模÷工时来表示"]],
    en: [["stem", "productivity is expressed in terms of scale per effort", "productivity is expressed as scale ÷ effort"]],
  },
  "2015h27a-q059": {
    jp: [
      ["ア", "認証用の照合データの許容値を大きくすると，本人を拒否してしまう可能性と他人を受け入れてしまう可能性がともに小さくなる。", "認証用データとの照合誤差の許容値を大きくすると，本人を拒否してしまう可能性と他人を受け入れてしまう可能性はともに小さくなる。"],
      ["イ", "認証のIDやパスワードを記憶したり，鍵やカードを携帯したりする必要がない。", "認証用の ID やパスワードを記憶したり，鍵やカード類を携帯したりする必要がない。"],
      ["ウ", "パスワードやトークンと違い，他の認証方法と", "パスワードやトークンなど，他の認証方法と"],
    ],
    zh: [
      ["ア", "若将认证用比对数据的容许值调大", "若将与认证用数据比对时的误差容许值调大"],
      ["イ", "也无需随身携带钥匙或卡片。", "也无需随身携带钥匙或卡片之类的物品。"],
      ["ウ", "与口令或令牌不同，它无法与其他认证方法组合使用。", "它无法与口令、令牌等其他认证方法组合使用。"],
    ],
    en: [
      ["ア", "If the tolerance value of the matching data used for authentication is increased", "If the allowable margin of error when matching against the authentication data is increased"],
      ["イ", "nor to carry a key or card.", "nor to carry a key, card, or the like."],
      ["ウ", "Unlike passwords or tokens, it cannot be used in combination with other authentication methods.", "It cannot be used in combination with other authentication methods such as passwords or tokens."],
    ],
  },
  "2015h27a-q062": { jp: [["エ", Q062_TAIL, "よい。"]] },
  "2015h27a-q081": { jp: [["イ", "設けられた., 不正侵入", "設けられた, 不正侵入"]] },
  "2015h27a-q093": { jp: [["stem", "【手順】", "〔手順〕"]], zh: [["stem", "【步骤】", "〔步骤〕"]] },
  "2015h27a-q097": {
    jp: [
      ["stem", "【Aさんが調べた結果】", "〔Aさんが調べた結果〕"],
      ["ウ", "X社PC 回収 料金", "X社 PC 回収 料金"],
      ["エ", "X社PC 機種 料金", "X社 PC 機種 料金"],
    ],
    // en の「Company-X PC recycling fee」/「Company-X PC model fee」は既に 4 トークンで源の語数と一致 → 不変。
    zh: [["stem", "【A先生调查的结果】", "〔A先生调查的结果〕"], ["ウ", "X公司PC 回收 费用", "X公司 PC 回收 费用"], ["エ", "X公司PC 机型 费用", "X公司 PC 机型 费用"]],
  },
  // ── 2016h28a ────────────────────────────────────────────────────────────
  // zh「强化销售部门的组织能力」/ en "strengthening the organizational capability" は語義同一のため不変。
  "2016h28a-q018": { jp: [["ア", "営業部門の組織力の強化", "営業部門の組織力強化"]] },
  // 全角/半角スラッシュが層で異なる (sidecar「万円／個」/ .phase1「万円/個」) ため、共通部分だけを置換対象にする。
  // zh「单位：万日元/个」/ en "Unit: ten-thousand yen/unit" は各言語で自然な表記なので不変。
  "2016h28a-q028": { jp: [["stem", "単位：万円", "単位　万円"]] },
  "2016h28a-q043": { jp: [["stem", ...CAP43.jp]], zh: [["stem", ...CAP43.zh]], en: [["stem", ...CAP43.en]] },
  "2016h28a-q098": {
    jp: [["stem", "ICカードを用いた", "IDカードを用いた"], ["stem", "T1IDカードを用いた", "IDカードを用いた"]],
    zh: [["stem", "使用 IC 卡的出入室管理系统", "使用 ID 卡的出入室管理系统"]],
    en: [["stem", "an entry/exit management system using IC cards", "an entry/exit management system using ID cards"]],
  },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
// 2015h27a-q097 のみ。腐敗した「X社PC」(1 語) を前提に「4 択はいずれもスペース区切りで**3 語**」「対象を特定する
// 『X社PC』」という語数の議論を組み立てていたため、correct / 誤答肢ア・イ・エ / 要点 2 本を三語すべて書き換える。
// 源では ア・イ が 3 語 (PC 回収 料金 / PC 機種 料金)、ウ・エ が 4 語 (X社 PC 回収 料金 / X社 PC 機種 料金)。
const EXPL = {
  "2015h27a-q097": {
    correctSet: {
      jp: "AND検索では、スペースで区切った語をすべて含むページだけに結果が絞り込まれる。したがって、対象を的確に限定する語とテーマを表す語を組み合わせるほど、目的の情報に近づける。本問の〔Aさんが調べた結果〕の(1)(2)は「X社製の機器の回収にかかる料金」に関する内容なので、検索語には、メーカを限定する「X社」、機器を表す「PC」、テーマを表す「回収」、知りたい項目を表す「料金」の4語が最適となる。ウ「X社 PC 回収 料金」はこの4語をすべて満たす。特に「X社」を独立した語として加えることで対象をX社製に限定でき、「PC 回収 料金」だけでは混ざり込む他社製品の情報を排除できるため、最も効率よく目的の情報へ絞り込める。なお ア・イ は3語、ウ・エ は4語であり、(1)(2)の内容(X社／PC／回収／料金)と過不足なく一致するのはウのみである。",
      zh: "在 AND 检索中，结果会被缩小到同时包含所有以空格分隔的词的页面。因此，越是把准确限定对象的词与表示主题的词组合起来，就越接近目标信息。本题〔A先生调查的结果〕的(1)(2)是关于「X公司制设备的回收所需费用」的内容，所以检索词最好是限定厂商的「X公司」、表示设备的「PC」、表示主题的「回收」以及表示所关心项目的「费用」这4个词。ウ「X公司 PC 回收 费用」正好满足这4个词。特别是把「X公司」作为独立的一个词加入，可以把对象限定为X公司制造的产品，从而排除仅用「PC 回收 费用」时会混入的其他公司产品的信息，因此能够最高效地缩小到目标信息。此外，ア・イ 为3个词、ウ・エ 为4个词，而与(1)(2)的内容（X公司／PC／回收／费用）不多不少完全一致的只有ウ。",
      en: "In an AND search, the results are narrowed to only those pages that contain every space-separated term. The more precisely you combine a term that limits the target with terms that express the theme, the closer you get to the information you want. Items (1) and (2) of [The results Mr. A looked up] concern the fee for collecting equipment made by Company X, so the best search terms are the four words that limit the manufacturer (Company X), name the equipment (PC), express the theme (collection), and express the item of interest (fee). Choice ウ, \"Company-X PC recycling fee\", satisfies all four. Adding \"Company-X\" as a separate term in particular limits the target to Company X products and excludes the other manufacturers' pages that \"PC recycling fee\" alone would pull in, so it narrows down to the desired information most efficiently. Note that ア and イ have three terms while ウ and エ have four, and only ウ matches the content of (1) and (2) (Company X / PC / collection / fee) exactly, with nothing missing or extra.",
    },
    distSet: {
      "ア": {
        jp: "「回収」「料金」というテーマ・項目は合っているが、3語だけでメーカを限定する「X社」が無い。他社製PCの回収料金など、目的外のページも多数ヒットしてしまい、絞り込みが弱い。",
        zh: "「回收」「费用」这两个主题和项目是对的，但只有3个词，缺少限定厂商的「X公司」。其他公司制PC的回收费用等目的之外的页面也会大量命中，缩小范围的力度不足。",
        en: "The theme and item terms, collection and fee, are right, but it has only three terms and lacks \"Company X\" to limit the manufacturer. Many off-target pages, such as collection fees for other makers' PCs, will also match, so the narrowing is weak.",
      },
      "イ": {
        jp: "テーマ語が「機種」で、(1)(2)が問う「回収」と噛み合わない。加えて3語だけでメーカを限定する「X社」も無く、テーマ・対象の二重で外れているため、目的の情報に絞り込めない。",
        zh: "主题词是「机型」，与(1)(2)所问的「回收」对不上。而且同样只有3个词，缺少限定厂商的「X公司」，主题和对象双重偏离，因此无法缩小到目标信息。",
        en: "Its theme term is \"model\", which does not match the collection that (1) and (2) ask about. In addition it has only three terms and no \"Company X\" to limit the manufacturer, so it misses on both theme and target and cannot narrow down to the desired information.",
      },
      "エ": {
        jp: "「X社」「PC」で対象をX社製のPCに限定できている点は良いが、テーマ語が「機種」であり、(1)(2)が扱う「回収」ではない。テーマが噛み合わないため、回収料金という目的の情報には絞り込めない。",
        zh: "用「X公司」「PC」把对象限定为X公司制的PC这一点是好的，但主题词是「机型」，并非(1)(2)所涉及的「回收」。由于主题对不上，无法缩小到回收费用这一目标信息。",
        en: "Limiting the target to Company X's PCs with \"Company X\" and \"PC\" is good, but the theme term is \"model\", not the collection that (1) and (2) deal with. Because the theme does not match, it cannot narrow down to the desired information about collection fees.",
      },
    },
    pointSet: [
      { idx: 0,
        jp: "AND検索(スペース区切り)は、指定した全ての語を含むページだけに結果を絞り込む。効率よく絞り込む鍵は語の数そのものではなく、対象を限定する語とテーマを表す語をいかに的確に選ぶか(具体性・関連性)にある。",
        zh: "AND 检索（以空格分隔）会把结果缩小到同时包含所指定的全部词的页面。高效缩小范围的关键并不在于词的数量本身，而在于如何准确选出限定对象的词和表示主题的词（具体性、相关性）。",
        en: "An AND search (space-separated) narrows the results to only those pages that contain all of the specified terms. The key to narrowing efficiently is not the number of terms in itself, but how precisely you choose the term that limits the target and the terms that express the theme (specificity and relevance)." },
      { idx: 1,
        jp: "検索文字列の設計では、メーカ(X社)+機器(PC)+テーマ(回収)+項目(料金)のように、目的に直結する具体語を過不足なく組み合わせることで、目的の情報へ効率よく到達できる。語と語の間の空白は AND の構文なので、「X社PC」と続けて書くと1語になり意味が変わる点にも注意する。",
        zh: "在设计检索字符串时，像厂商（X公司）+设备（PC）+主题（回收）+项目（费用）这样，把与目的直接相关的具体词不多不少地组合起来，就能高效地到达目标信息。还要注意：词与词之间的空格是 AND 的语法，若把「X公司PC」连写就变成了1个词，含义随之改变。",
        en: "When designing a search string, combining concrete terms that bear directly on your goal, with nothing missing or extra, such as manufacturer (Company X) + equipment (PC) + theme (collection) + item (fee), lets you reach the desired information efficiently. Note too that the space between terms is the AND syntax, so writing \"Company-XPC\" as one run makes it a single term and changes the meaning." },
    ],
  },
};

const MARK = "fidfix-S118-wave1";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触 (merge が差分時に round1 block を併記する)。
// NOTE_FULL = 全文差し替え / NOTE_SUB = 腐敗テキストを述べた区間だけを差し替え。どちらも MARK 冪等。
// 対象は「腐敗テキストを引用している」「本 batch が是正する箇所について腐敗なし/一致と断じている」note のみ。
// q042 / q093 / q018 の note は是正箇所に一切言及しないため触らない。
const NOTE_FULL = {
  "2015h27a-q097": (p) => `has_figure=false の概念問(AND検索)。stem が参照する〔Aさんが調べた結果〕の(1)(2)の本文は表示層 (stem_jp_clean) に中問Dの共有前文として埋め込まれている。AND 検索の論理から独立導出できる: 源の選択肢は ア「PC 回収 料金」/ イ「PC 機種 料金」が3語、ウ「X社 PC 回収 料金」/ エ「X社 PC 機種 料金」が4語で、(1)(2)『X社製機器の回収料金』に対し メーカ限定(X社)+機器(PC)+テーマ(回収)+項目(料金) を過不足なく備えるのはウのみ。ア=X社限定なし、イ=X社限定なし+回収でなく機種、エ=回収でなく機種。よって derived_answer=ウ、stored key(ウ)と一致。ウ・エ の「X社」と「PC」の間の半角空白の脱落 (AND 語数 4→3) と、参照名の括弧【 】→〔 〕を S118 に ${p} 実読で是正済 (${MARK})`,
};
const NOTE_SUB = {
  "2015h27a-q027": (p) => ["stem の腐敗なし。", `stem_jp_clean に混入していた中黒「分析・評価し」は S118 に ${p} 実読で源の「分析評価し」に是正済 (${MARK})。raw stem_jp は元から源どおり。`],
  "2015h27a-q044": (p) => ["stored key ウ と一致。", `stored key ウ と一致。stem の「生産性を規模工数」は除算記号の脱落で、S118 に ${p} 実読で源の「規模÷工数」に是正済 (${MARK})。是正前は表示テキストだけからこの導出ができなかった。`],
  "2015h27a-q059": (p) => ["stem・選択肢・答えに矛盾なく腐敗なし。", `選択肢ア・イ・ウ に語句置換があった (源「認証用データとの照合誤差の許容値」/「鍵やカード類」/「トークンなど，」→ 腐敗「認証用の照合データの許容値」/「鍵やカード」/「トークンと違い，」)。S118 に ${p} 実読で是正済 (${MARK})。正解字母イは不変で、誤答肢ア・ウ の解説は元から源の読みに沿っていたため不変。`],
  "2015h27a-q062": (p) => ["(選択肢エ末尾に余分な空白と句点が残るが cosmetic で答えには影響しない)", `(選択肢エ末尾の余分な空白 25 と「.」は S118 に ${p} 実読で除去済 — ${MARK})`],
  "2015h27a-q081": (p) => ["選択肢イに OCR 由来の読点「設けられた.,」混入があるが誤答肢で答えに影響せず、", `選択肢イに混入していた「設けられた.,」の「.」は S118 に ${p} 実読で除去済 (${MARK})。誤答肢で答えに影響せず、`],
  "2016h28a-q028": (p) => ["stem_jp_clean の表も図と一致し腐敗なし。", `stem_jp_clean の表は図と一致。単位注記のコロン「単位：万円／個」は S118 に ${p} 実読で源の全角空白区切り「単位　万円／個」に是正済 (${MARK})。`],
  "2016h28a-q043": (p) => ["図・表はstem_jp_cleanと完全一致（figure_png/page-16両方で確認）。", `源の表は 2 段ヘッダで、月列を横断する結合セル「進捗（月末時点）」が markdown 平坦化で脱落していた。S118 に ${p} 実読で表直上のキャプション行として復元済 (${MARK}、jp/zh/en)。数値は図と完全一致。`],
  "2016h28a-q050": (p) => ["で、テキスト選択肢名と一致。", `である。源の選択肢は**図のみ**で、dataset のテキスト肢が図の名称そのものだったため正解肢イ「パレート図」が答えを書いていた。S118 に ${p} 実読のうえ D-144 段 2 ②-a として choice_figures 化し、テキストは中立な「図ア」〜「図エ」に置換済 (${MARK})。`],
  "2016h28a-q098": (p) => ["stem_jp_clean が存在し OCR 腐敗(T1IDカード→ICカード)は既に是正済のため clean を正とし、腐敗疑いなし。", `stem_jp_clean の「ICカード」は源と異なる (${p} 実読: 題幹・選択肢イ/ウ とも一貫して「IDカード」)。S118 に clean の「ICカード」と raw の「T1IDカード」の双方を「IDカード」へ是正済 (${MARK})。`],
};

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set([...Object.keys(NOTE_FULL), ...Object.keys(NOTE_SUB)].map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const q = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of [[q, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of [[q, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

// 解説: 全文差し替え (correctSet / distSet / pointSet)。MARK ではなく「新文が既に入っているか」で冪等判定する。
function setField(obj, key, val, where) {
  if (typeof obj?.[key] !== "string") { log.push(`  ⚠ ${where}: missing`); return; }
  if (obj[key] === val) { skipped++; return; }
  obj[key] = val; applied++; log.push(`  ✓ ${where}: 全文差し替え`);
}
for (const [id, ex] of Object.entries(EXPL)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); const j = rj(jf), tr = rj(tf);
  if (ex.correctSet) {
    setField(j, "correct_jp", ex.correctSet.jp, `${id} expl_jp.correct_jp`);
    setField(tr.correct, "zh", ex.correctSet.zh, `${id} expl_tr.correct.zh`);
    setField(tr.correct, "en", ex.correctSet.en, `${id} expl_tr.correct.en`);
  }
  for (const [L, d] of Object.entries(ex.distSet ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (!dj || !dt) throw new Error(`${id}: distractor ${L} missing`);
    setField(dj, "why_wrong_jp", d.jp, `${id} expl_jp.${L}`);
    setField(dt, "zh", d.zh, `${id} expl_tr.${L}.zh`);
    setField(dt, "en", d.en, `${id} expl_tr.${L}.en`);
  }
  for (const p of ex.pointSet ?? []) {
    if (typeof j.points_jp?.[p.idx] !== "string") throw new Error(`${id} points_jp[${p.idx}] missing`);
    const box = { v: j.points_jp[p.idx] }; setField(box, "v", p.jp, `${id} expl_jp.points[${p.idx}]`); j.points_jp[p.idx] = box.v;
    setField(tr.points[p.idx], "zh", p.zh, `${id} expl_tr.points[${p.idx}].zh`);
    setField(tr.points[p.idx], "en", p.en, `${id} expl_tr.points[${p.idx}].en`);
  }
  wj(jf, j); wj(tf, tr);
}

for (const [id, mk] of Object.entries(NOTE_FULL)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = mk(pg(id)) + "。"; applied++; log.push(`  ✓ ${id} final note: 全文差し替え (${pg(id)}, round1 untouched)`);
}
for (const [id, mk] of Object.entries(NOTE_SUB)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  const [from, to] = mk(pg(id));
  if (!sub(r.key_guard, "note_jp", from, to, `${id} final note`)) log.push(`  ⚠ ${id}: note segment not found`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S118-wave1: applied ${applied}, skipped ${skipped}`);
