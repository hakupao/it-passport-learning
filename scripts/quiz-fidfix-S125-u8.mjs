#!/usr/bin/env node
// Stage 6 / Quiz — S125 ⑤-2 全量保真掃引 **U8** (2023r05、91 問 / Sonnet 5 単 pass) の差分を是正する。
// 源: S125 の workflow `wf_b22ad070-03c`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u8_2023r05_sn.json
//     マニフェスト = data/ip/quiz/.phase2/u8_fidelity_input_2023r05.json (precrop 85/91、6 問は crop 無し → 源ページ直読)
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 452 / AGENT_MISSED 3 / VERDICT_CONFLICT 0 / coverage 91/91
//                 (**MISSED 3 = 実残差 0 + 偽陽性 3**。q041 stem = clean の図の文本化 (描画補助、下記 q033 と同クラス) /
//                  q042 stem = 組合せ表を選択肢へ構造化した体裁差 (ア abc / イ acb / ウ bac / エ cba は源と一致) /
//                  q092 ウ = agent 計上済の差分に patch を当てた後の引用符正規化の人工物)
//
// 層・方針は quiz-fidfix-S122-u3a / S123-u3b / S124-u4 / S125-u5 / S125-u6 / S125-u7 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//     (tr_2023r05-q033 は .phase1 に stem_jp_clean キーが無い [sidecar のみ] ので sidecar だけに当たる — 実測)
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される (q004 / q034 / q033 / q060 の一部は clean のみ、
//     q011 は raw / clean で腐敗が違う — 下記)
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2023r05 の sidecar / .phase1 のキーは `stem` / `choices` / `stem_jp_clean` (63 題) で、**`choices_jp_clean` は存在しない** (実測)。
// したがって選択肢は raw 3 層がそのまま出荷層であり、下記の選択肢是正はすべて**学習者に見えていた**腐敗にあたる。
// 適用ループ本体は S122〜S125-u7 で Rule D PASS 済のものを**逐字そのまま**流用している。
// 本 unit では stem 分岐・choices 分岐・zh / en 分岐 (stem のみ)・EXPL 分岐 (distSub / correctSub / pointSub) が実行される。
//
// 採用した差分 (16 題 / 20 論理差分 = agent の 20 件。うち q033 は注記見出しの括弧のみ部分採用、machdiff 実残差 0。源 crop / 源ページを原寸〜3 倍で独立実読して確認):
//   2023r05-q004 stem        (page-03) clean「（以下"自社方式"という）」→ 源 “自社方式” (引用符字種、U7 q027 precedent)。raw「"自社方式”」は n=0 skip (N5)
//   2023r05-q011 stem        (page-05) clean「ビジネスモデルの変革や」/ raw「ビジネスモデルの新や」→ 源「ビジネスモデルの刷新や」(3 倍で確認)。
//                            clean は raw の脱字「新」を「変革」と**推測補完**していた。zh「变革」/ en "transform" も推測語を訳しており、
//                            en は正解肢 (Digital transformation) の語を題幹に漏らしていた → zh「革新」/ en "revamp" に追随、解説 correct の設問引用も追随
//   2023r05-q016 choice.ア   (page-08) 「質疑応答事例」→ 源「質疑応答の事例」。解説ア の言い換えも追随 (jp のみ。zh / en は既に「问答案例 / cases」)
//   2023r05-q024 choice.イ   (page-11) 「多容」→ 源「多寡」(3 倍で確認)。解説イ の OCR 注記を jp / zh / en から除去
//   2023r05-q025 stem        (page-11) raw・clean「現金19万円」→ 源「現金10万円」(slashed zero、3 倍で確認)。zh「19 万日元」/ en "190,000 yen" 追随、
//                            解説 correct / イ の金額追随、points[0]「19万円という金額に惑わされず」は是正後に論拠が崩れる
//                            (10万円 = 一般懸賞の上限と同額) → 「金額ではなく応募条件で見分ける」に**書換** (Rule D 確認点)
//   2023r05-q031 choice.ウ   (page-13) 「ジェアリング」→ 源「シェアリング」(3 倍で確認)。解説ウ の OCR 注記を jp / zh / en から除去
//   2023r05-q032 choice.ア   (page-14) 「行い システム」→ 源「行い，システム」(読点脱落、house rule「, 」)
//   2023r05-q032 choice.イ   (page-14) 「定義むする」→ 源「定義する」(U7 2022r04-q036 と同じ「む」挿入)
//   2023r05-q033 stem        (page-14、crop 無し) clean 注記「（注記）」→ 源「注記　」(括弧は源に無い。sidecar の注記見出しは「注記　」12 /「注記 」16 /「（注記）」2)。
//                            **「（空欄のセル）」は非採用 (保持)** — 表を markdown に文本化したため網掛けを表現できないことへの描画補助
//                            (2012h24h q092「（網掛け＝休日：…）」/ 2011h23a q089「（■＝黒、□＝白）」precedent)。zh「（注）」/ en "(Note)" は各言語の体裁で不変
//   2023r05-q034 stem        (page-15) clean「「人間中心のAI社会原則」」→ 源 “人間中心のAI社会原則” (引用符字種)。raw「“…"」は n=0 skip (N5)
//   2023r05-q035 choice.ア   (page-15) 「領域で。 インターネット」→ 源「領域で，インターネット」(読点→句点の置換)。**ア は正解肢**
//   2023r05-q035 choice.ウ   (page-15) 「エ業製品」(カタカナ U+30A8) → 源「工業製品」
//   2023r05-q060 stem        (page-28) clean「[プログラム]」→ 源「〔プログラム〕」(括弧字種。sidecar は〔プログラム〕7 /［プログラム］0 / [プログラム] 2 [本題と 2024r06])。
//                            2012h24h q094 は［…］を表記揺れとして据え置いたが、本 unit は源と sidecar の多数形に揃える (evidence §4)。raw にも当たる
//   2023r05-q060 stem        (page-28) clean「全ての要素を先頭から」→ 源「全ての要素 を先頭から」(IPA 擬似言語の字句区切り空白、S118 R8c 保護対象
//                            `2026r08-q067` と同一の構文)。raw は既に空白ありで n=0 skip
//   2023r05-q072 choice.ア   (page-33) 「取り扱わなかい」→ 源「取り扱わない」
//   2023r05-q092 choice.ウ   (page-42) 「“@"”」→ 源「“@”」(源に無い ASCII " の挿入)
//   2023r05-q093 choice.エ   (page-42) 「“肖除してよいか"」→ 源「“削除してよいか”」(誤字 + 閉じ引用符字種、1 置換)。**エ は正解肢**
//   2023r05-q094 choice.ウ   (page-43) 「について,両社問で」→ 源「について，両社間で」(誤字。同じ置換で読点を house rule「, 」に)
//   2023r05-q099 choice.ウ   (page-44) 「署名する除の」→ 源「署名する際の」。**ウ は正解肢**
//
// jp 読点の字種は house rule の ASCII「, 」(D-147 §1)。
//
// 見送り (evidence §10 に理由を明記):
//   q033「（空欄のセル）」(描画補助) / q041 clean の図の文本化 (描画補助) / q042 の組合せ表→選択肢 (体裁差)
//   expl_jp_*.json 内の key_guard.note_jp (q011「変革」/ q024「多容」/ q025「19万円」/ q093「肖除」等に言及) — merge が読まず**非出荷** (⑨ 継続)
//   raw stem の N5 残存 (clean が出荷層): q004 raw「6円」「306万円」「9円」ほか / q025 raw「a て c」「販売 し法」ほか
//   q016 zh / en、q060 zh「[程序]」/ en "[Program]"、q004 / q034 zh / en の引用符 — 各言語の体裁 (⑨-c と同じ扱い)
//   解説者自身の文の「変革 / transform」(q011 の DX の定義・誤答肢の説明・points) — 設問の引用ではない
//
// Run: node scripts/quiz-fidfix-S125-u8.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S125-u8.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2023r05
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// 既定 = dry-run (読取専用)。`--apply` で書き込む (S125 指示)。
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
let applied = 0, skipped = 0; const log = [];

// assert-once: 対象文字列がちょうど 1 回だけ出ることを要求し、2 回以上なら中断 (誤爆防止)。
// 冪等: to ⊃ from で既に to が入っている、または from が 0 回なら skip。
// S121 reviewer 指摘: 置換が「本当に to を書けた」ことを肯定確認する (to が空でない場合のみ)。
function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  const next = s.replace(from, to);
  if (to && !next.includes(to)) throw new Error(`${where}: 置換後に to 「${to.slice(0, 36)}」 が見つからない — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 40)}」→「${to.slice(0, 40)}」`); return true;
}


const FIX = {
  // ── 引用符・括弧・見出し・空白 (stem、clean が出荷層) ──────────────────────────
  // q004: clean のみ。raw「(以下"自社方式” という)」(開きが ASCII) は n=0 skip (N5、U7 q027 と同型)。zh / en の引用符は ⑨-c 保留。
  "2023r05-q004": { jp: [["stem", "（以下\"自社方式\"という）", "（以下“自社方式”という）"]] },
  // q034: clean のみ。raw「“人間中心の AI 社会原則"」は n=0 skip (N5)。
  "2023r05-q034": { jp: [["stem", "「人間中心のAI社会原則」", "“人間中心のAI社会原則”"]] },
  // q033: clean のみ (raw には表・注記が無い)。「（空欄のセル）」は描画補助として保持 (冒頭コメント)。
  "2023r05-q033": { jp: [["stem", "（注記）網掛けの部分", "注記　網掛けの部分"]] },
  // q060: 「[プログラム]」は raw・clean の両方に当たる。「要素 を」は clean のみ (raw は既に空白あり → n=0 skip)。
  //       clean には「要素を」が 2 回 (「の要素を並べ替えて」) あるので from は「全ての要素を先頭から」で一意にする。
  "2023r05-q060": {
    jp: [
      ["stem", "[プログラム]", "〔プログラム〕"],
      ["stem", "全ての要素を先頭から", "全ての要素 を先頭から"],
    ],
  },
  // ── 語義是正 (stem) ─────────────────────────────────────────────────────────
  // q011: raw「ビジネスモデルの新や」(脱字) / clean「ビジネスモデルの変革や」(推測補完) → 2 行 (各層で片方だけが当たる、U7 q066 と同型)。
  //       zh / en は clean の推測語を訳していた。en "transform" は正解肢 (Digital transformation) の語を題幹に置く形にもなっていた。
  "2023r05-q011": {
    jp: [
      ["stem", "ビジネスモデルの新や", "ビジネスモデルの刷新や"],
      ["stem", "ビジネスモデルの変革や", "ビジネスモデルの刷新や"],
    ],
    zh: [["stem", "从战略层面变革商业模式", "从战略层面革新商业模式"]],
    en: [["stem", "to strategically transform business models", "to strategically revamp business models"]],
  },
  // q025: slashed zero の 0→9 誤読。raw・clean とも「現金19万円」。
  "2023r05-q025": {
    jp: [["stem", "抽選で現金19万円が当たる", "抽選で現金10万円が当たる"]],
    zh: [["stem", "中奖者可获得现金 19 万日元", "中奖者可获得现金 10 万日元"]],
    en: [["stem", "a lottery to win 190,000 yen in cash", "a lottery to win 100,000 yen in cash"]],
  },
  // ── 語義是正・誤字 (選択肢) ──────────────────────────────────────────────────
  "2023r05-q016": { jp: [["ア", "既存のFAQを用いた質疑応答事例を", "既存のFAQを用いた質疑応答の事例を"]] },
  "2023r05-q024": { jp: [["イ", "発注回数の多容で比較", "発注回数の多寡で比較"]] },
  "2023r05-q031": { jp: [["ウ", "ジェアリングエコノミー", "シェアリングエコノミー"]] },
  "2023r05-q032": {
    jp: [
      ["ア", "情報収集を行い システムの", "情報収集を行い, システムの"],
      ["イ", "性能要件などを定義むするもの", "性能要件などを定義するもの"],
    ],
  },
  // q035: ア は **正解肢** (correct_answer=ア は不変)。ウ の「エ」はカタカナ U+30A8 (源は漢字「工」)。
  "2023r05-q035": {
    jp: [
      ["ア", "様々な領域で。 インターネットや", "様々な領域で, インターネットや"],
      ["ウ", "によって, エ業製品の", "によって, 工業製品の"],
    ],
  },
  "2023r05-q072": { jp: [["ア", "個人情報を取り扱わなかいなど", "個人情報を取り扱わないなど"]] },
  "2023r05-q092": { jp: [["ウ", "メールアドレスの “@\"” の左側", "メールアドレスの “@” の左側"]] },
  // q093: エ は **正解肢** (correct_answer=エ は不変)。誤字と閉じ引用符の字種を 1 置換で。
  "2023r05-q093": { jp: [["エ", "“肖除してよいか\"", "“削除してよいか”"]] },
  "2023r05-q094": { jp: [["ウ", "保護方法について,両社問で合意", "保護方法について, 両社間で合意"]] },
  // q099: ウ は **正解肢** (correct_answer=ウ は不変)。
  "2023r05-q099": { jp: [["ウ", "署名する除の筆跡", "署名する際の筆跡"]] },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  - q025: correct / distractor イ の「19万円 / 19 万日元 / 190,000 yen」→ 源の 10万円 に追随。
//          points[0] の「19万円という金額に惑わされず」は 19万円 > 一般懸賞の上限 10万円 を罠とする論拠で、
//          是正後 (10万円 = 上限と同額) には成り立たない → 「金額ではなく応募条件 (購入条件の有無) で見分ける」に**書換** (Rule D 確認点)
//  - q011: correct は設問を「…ビジネスモデルの変革や…」と**引用**している → 引用部だけ源の「刷新」に追随 (zh「革新」/ en "revamp" も同じ)。
//          DX の定義・誤答肢の説明・points の「変革 / transform」は解説者自身の文で設問の引用ではない → 不変
//  - q024 / q031: 誤答肢の解説末尾・冒頭の OCR 注記は是正後に偽 → jp・zh・en から除去 (U7 `2022r04-q014` precedent)
//  - q016: 誤答肢アの言い換え「質疑応答事例」を選択肢の是正に揃える (jp のみ。zh「问答案例」/ en "question-and-answer cases" は既に源の語義)
const EXPL = {
  "2023r05-q025": {
    correctSub: {
      jp: [["現金19万円が当たっても問題はない", "現金10万円が当たっても問題はない"]],
      zh: [["即使中得现金 19 万日元也不构成问题", "即使中得现金 10 万日元也不构成问题"]],
      en: [["so winning 190,000 yen in cash poses no problem", "so winning 100,000 yen in cash poses no problem"]],
    },
    distSub: {
      イ: {
        jp: [["現金19万円でも景品表示法上の問題はない", "現金10万円でも景品表示法上の問題はない"]],
        zh: [["即使是现金 19 万日元", "即使是现金 10 万日元"]],
        en: [["so even 190,000 yen in cash poses no problem", "so even 100,000 yen in cash poses no problem"]],
      },
    },
    pointSub: [{
      idx: 0,
      jp: ["19万円という金額に惑わされず、応募条件で見分ける。", "賞金の金額ではなく、応募条件（商品購入を条件とするか否か）で見分ける。"],
      zh: ["不要被 19 万日元这个金额迷惑，要从应征条件来判别。", "不要看赠品金额，而要从应征条件（是否以购买商品为条件）来判别。"],
      en: ["Do not be misled by the 190,000 yen figure; tell them apart by the entry conditions.", "Tell them apart not by the prize amount but by the entry conditions (whether entry is conditional on purchasing a product)."],
    }],
  },
  "2023r05-q011": {
    correctSub: {
      jp: [["設問の「IT を活用し，戦略的にビジネスモデルの変革や新たな付加価値", "設問の「IT を活用し，戦略的にビジネスモデルの刷新や新たな付加価値"]],
      zh: [["题目中「运用 IT，从战略层面变革商业模式、创造新的附加价值」", "题目中「运用 IT，从战略层面革新商业模式、创造新的附加价值」"]],
      en: [["in the question of leveraging IT to strategically transform business models", "in the question of leveraging IT to strategically revamp business models"]],
    },
  },
  "2023r05-q024": {
    distSub: {
      イ: {
        jp: [["という記述は誤りです(なお「多容」は「多寡」の表記化けです)。", "という記述は誤りです。"]],
        zh: [["的描述是错误的(另外，原文日语中的「多容」是「多寡」的讹字)。", "的描述是错误的。"]],
        en: [["is wrong. (Also, in the original Japanese, 「多容」 is a misprint of 「多寡」, meaning amount.)", "is wrong."]],
      },
    },
  },
  "2023r05-q031": {
    distSub: {
      ウ: {
        jp: [["シェアリングエコノミー(選択肢の表記「ジェアリングエコノミー」はOCRの誤りで本来「シェアリングエコノミー」)は、", "シェアリングエコノミーは、"]],
        zh: [["共享经济(选项原文写作「ジェアリングエコノミー」是OCR误识, 本应为「シェアリングエコノミー」/共享经济)是指", "共享经济是指"]],
        en: [["Sharing economy (the choice as printed, 「ジェアリングエコノミー」, is an OCR misreading of the correct 「シェアリングエコノミー」) is a mechanism", "Sharing economy is a mechanism"]],
      },
    },
  },
  "2023r05-q016": {
    distSub: {
      ア: { jp: [["既存のFAQを使った質疑応答事例をWeb画面で学習する", "既存のFAQを使った質疑応答の事例をWeb画面で学習する"]] },
    },
  },
};

const MARK = "fidfix-S125-u8";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触。
// 方針 (波 2 / 波 3 / U3a〜U7 と同一): 語義是正 / 正解肢命中 に限り追記する。
//   - 語義: q011 q016 q024 q025 q031 q032 q035 q072 q094 / 正解肢命中: q035 q093 q099
//   - 追記しない (stem の引用符・括弧・注記見出し・空白のみ、または誤答肢の引用符のみ): q004 / q033 / q034 / q060 / q092
// 2023r05 の generate_result は本 unit の追記対象 11 問 (Rule D NIT-4 で 12→11 訂正)すべてで final note が空文字 (q004 のみ非空だが追記対象外)。
// 空への追記も純粋後置 (`final.startsWith(旧 final)` は旧 final="" で真) で、merge は final≠round1 のため round1 ブロックを併記する (D-143 の設計どおり)。
const NOTE_APPEND = {
  "2023r05-q011": (p) => `（S125 ⑤-2 U8: ${p} 実読で 題幹の「ビジネスモデルの変革や」（raw は脱字「新や」）を源の「ビジネスモデルの刷新や」に是正。zh / en の題幹と解説（正解理由）の設問引用も追随（zh「革新」/ en "revamp"）。IT を活用し戦略的にビジネスモデルを刷新して付加価値を生む = DX という導出・答え（ウ）は不変 — ${MARK}）`,
  "2023r05-q016": (p) => `（S125 ⑤-2 U8: ${p} 実読で 選択肢アの「質疑応答事例」を源の「質疑応答の事例」に是正（助詞「の」の脱落）。誤答肢で、AI で FAQ から回答候補を選び出す確度を高めるという導出・答え（エ）は不変 — ${MARK}）`,
  "2023r05-q024": (p) => `（S125 ⑤-2 U8: ${p} 実読で 選択肢イの「多容」を源の「多寡」に是正し、解説イの OCR 注記を jp / zh / en から除去。誤答肢で、発注費用と在庫維持費用の総額最小が最適発注量という導出・答え（ア）は不変 — ${MARK}）`,
  "2023r05-q025": (p) => `（S125 ⑤-2 U8: ${p} 実読で 題幹 a の「現金19万円」を源の「現金10万円」に是正（源の 0 は斜線入りゼロ）。zh / en の題幹と解説（正解理由・選択肢イ）の金額も追随し、要点の「19万円という金額に惑わされず」は是正後に成り立たないため「賞金の金額ではなく応募条件で見分ける」に改めた。a はオープン懸賞で景品額の上限規制が無いという導出・答え（エ）は不変 — ${MARK}）`,
  "2023r05-q031": (p) => `（S125 ⑤-2 U8: ${p} 実読で 選択肢ウの「ジェアリングエコノミー」を源の「シェアリングエコノミー」に是正し、解説ウの OCR 注記を jp / zh / en から除去。誤答肢のため、公開 API による企業間連携 = API エコノミーという導出・答え（ア）は不変 — ${MARK}）`,
  "2023r05-q032": (p) => `（S125 ⑤-2 U8: ${p} 実読で 選択肢イの「定義むする」を源の「定義する」に是正（源に無い「む」の挿入）し、選択肢アの脱落した読点を復元。いずれも誤答肢で、RFP = ベンダーに導入目的や機能概要を示して提案書の提出を求めるものという導出・答え（エ）は不変 — ${MARK}）`,
  "2023r05-q035": (p) => `（S125 ⑤-2 U8: ${p} 実読で 選択肢アの「領域で。 」を源の「領域で，」に（読点が句点に化けて 1 文が 2 文に割れていた）、選択肢ウの「エ業製品」（カタカナ「エ」）を源の「工業製品」に是正。ア は**正解肢**だが変更は区切り記号のみで、IoT・AI を生活の様々な領域に活用するのが第4次産業革命という導出・correct_answer=ア は不変 — ${MARK}）`,
  "2023r05-q072": (p) => `（S125 ⑤-2 U8: ${p} 実読で 選択肢アの「取り扱わなかい」を源の「取り扱わない」に是正。誤答肢（リスク回避の説明）のため、保険加入などリスクの移転・分散 = リスク共有という導出・答え（ウ）は不変 — ${MARK}）`,
  "2023r05-q093": (p) => `（S125 ⑤-2 U8: ${p} 実読で 選択肢エの「“肖除してよいか"」を源の「“削除してよいか”」に是正（誤字と閉じ引用符の字種）。**正解肢**だが語の誤字の是正のみで、誤操作を未然に防ぐ確認メッセージ = フールプルーフという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2023r05-q094": (p) => `（S125 ⑤-2 U8: ${p} 実読で 選択肢ウの「両社問」を源の「両社間」に是正。誤答肢のため、組織の意図を示し方向付けしたもの = 情報セキュリティ方針という導出・答え（エ）は不変 — ${MARK}）`,
  "2023r05-q099": (p) => `（S125 ⑤-2 U8: ${p} 実読で 選択肢ウの「署名する除の」を源の「署名する際の」に是正。**正解肢**だが語の誤字の是正のみで、署名の筆跡・筆圧 = 行動的特徴による生体認証という導出・correct_answer=ウ は不変 — ${MARK}）`,
};
const NOTE_SUB = {};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set([...Object.keys(NOTE_APPEND), ...Object.keys(NOTE_SUB)].map((id) => id.split("-q")[0]))];
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

for (const [id, ex] of Object.entries(EXPL)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); const j = rj(jf), tr = rj(tf);
  for (const [L, d] of Object.entries(ex.distSub ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    for (const [f, t] of d.jp ?? []) sub(dj, "why_wrong_jp", f, t, `${id} expl_jp.${L}`);
    for (const [f, t] of d.zh ?? []) sub(dt, "zh", f, t, `${id} expl_tr.${L}.zh`);
    for (const [f, t] of d.en ?? []) sub(dt, "en", f, t, `${id} expl_tr.${L}.en`);
  }
  if (ex.correctSub) {
    for (const [f, t] of ex.correctSub.jp ?? []) sub(j, "correct_jp", f, t, `${id} expl_jp.correct_jp`);
    for (const [f, t] of ex.correctSub.zh ?? []) sub(tr.correct, "zh", f, t, `${id} expl_tr.correct.zh`);
    for (const [f, t] of ex.correctSub.en ?? []) sub(tr.correct, "en", f, t, `${id} expl_tr.correct.en`);
  }
  for (const p of ex.pointSub ?? []) {
    if (p.jp) { const [f, t] = p.jp; const arr = j.points_jp; if (typeof arr?.[p.idx] !== "string") throw new Error(`${id} points_jp[${p.idx}] missing`);
      const box = { v: arr[p.idx] }; if (sub(box, "v", f, t, `${id} expl_jp.points[${p.idx}]`)) arr[p.idx] = box.v; }
    if (p.zh) { const [f, t] = p.zh; sub(tr.points[p.idx], "zh", f, t, `${id} expl_tr.points[${p.idx}].zh`); }
    if (p.en) { const [f, t] = p.en; sub(tr.points[p.idx], "en", f, t, `${id} expl_tr.points[${p.idx}].en`); }
  }
  wj(jf, j); wj(tf, tr);
}

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const [id, mk] of Object.entries(NOTE_SUB)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  const [from, to] = mk(pg(id));
  if (!sub(r.key_guard, "note_jp", from, to, `${id} final note`)) throw new Error(`${id}: note segment not found`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S125-u8: applied ${applied}, skipped ${skipped}`);
