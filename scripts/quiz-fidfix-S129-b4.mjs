#!/usr/bin/env node
// Stage 6 / Quiz — S129 B track **B4** (2013h25h、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S129 の workflow `wf_a94c9c60-9c5`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b4_2013h25h_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b4_fidelity_input_2013h25h.json (precrop 83/100、skip 17 = page_mismatch 4 (q093〜q096) + chumon 12 (q085〜q092 / q097〜q100) + merged_preamble 1 (q082))
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 485 / AGENT_MISSED 6 (q004 ア = 実残差「オフショアウトソーシング」、q083 = 分数の一行化、
//                 q096 / q098 / q100 = 中問前文、q099 = 図2 の言語化) / QUOTE_ASCII 0 / VERDICT_CONFLICT 0 / UNREADABLE 0
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S128-b3 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2013h25h の sidecar のキーは `stem` / `choices` / `stem_jp_clean` (100 題中 56 題) で、`choices_jp_clean` は存在しない (実測)。
// 選択肢は raw 3 層がそのまま出荷層。
// 中問 4 組 (mqA〜mqD) は前文埋め込み済み。前文領域は触らず、from は設問文側の部分一致。
//
// 適用ループ (sub / FIX / expl 単一読み / NOTE_APPEND) は B3 から無変更で流用。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q004 ア     (p03) 「オフショアウトソーシング」→ 源「オフショアアウトソーシング」(アは**正解肢**、machdiff)
//   q036 ウ     (p14) 「y＝x」→ 源「y＝x!」(zh / en・解説ウ追随)
//   q037 ウ     (p15) 「399 kg」「599 g」→ 源「300 kg」「500 g」(zh / en 追随)
//   q055 stem・ア〜エ (p23) 「」→ 源 “” (イは**正解肢**、字種のみ)
//   q061 / q067 / q068 stem (p26 / p28 / p29) 「」→ 源 “”
//   q068 ア・ウ  (p29) 暫定処置 (D-163): ア の答え漏洩の括弧書き削除 (**正解肢**)、ウ を図のとおりに最小修正 (zh / en 追随)
//   q069 stem   (p30) 「直接 埋め込む」の改行由来空白 (fixer 走査)
//   q074 stem   (p31) clean「次の図の構成で」→ 源「図の構成で」
//   q084 stem   (p34) 「管理する。 未読」「プロトコル はどれか」の改行由来空白 (fixer 走査)
//   q087 ア〜ウ  (p37) 「メールの返信」の「」→ 源 “” (ウは**正解肢**、字種のみ)
//   q088 ア〜エ  (p38) 「。 」の改行由来空白 ×8 (fixer 走査)
//   q093 stem   (p43) 式「B14+C2-B2」→ 源 “…” (zh / en 追随、D-155 / D-162: 区切りのみ、演算子 ASCII)
//   q096 stem   (p44) 式「…」×4 → 源 “…” (zh / en 追随、同上)
//   q099 stem   (p48) 図2 キャプションの源に無い括弧書き注記を削除し「図2　…」形に (D-158、zh / en 追随)
//   q100 ア・イ  (p49) 「送信情報を暗号化」→ 源「通信を暗号化」(アは**正解肢**、zh / en 追随)、「OSの名前」→ 源「OSの名称」
//
// Run: node scripts/quiz-fidfix-S129-b4.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S129-b4.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2013h25h
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const LOADED = new Map();
const rj = (f) => { const d = JSON.parse(readFileSync(f, "utf-8")); LOADED.set(f, JSON.stringify(d, null, 2)); return d; };
const written = [];
const wj = (f, d) => {
  const next = JSON.stringify(d, null, 2);
  if (LOADED.get(f) === next) return;
  written.push(path.relative(ROOT, f));
  if (!DRY) writeFileSync(f, next + "\n");
};
let applied = 0, skipped = 0; const log = [];

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
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  "2013h25h-q055": {
    jp: [
      ["stem", "関係データベースを使い「社員」表と「部署」表を作成して社員情報を管理する。「社員」表と「部署」表に、必要に応じて設定する主キーと外部キーの適切な組合せはどれか。ここで、社員は必ず「部署」表に存在する部署に所属するものとし、",
        "関係データベースを使い“社員”表と“部署”表を作成して社員情報を管理する。“社員”表と“部署”表に、必要に応じて設定する主キーと外部キーの適切な組合せはどれか。ここで、社員は必ず“部署”表に存在する部署に所属するものとし、"],
      ["ア", "主キー：「社員」表の社員コード，「部署」表の部署コード，外部キー：なし", "主キー：“社員”表の社員コード，“部署”表の部署コード，外部キー：なし"],
      ["イ", "主キー：「社員」表の社員コード，「部署」表の部署コード，外部キー：「社員」表の部署コード", "主キー：“社員”表の社員コード，“部署”表の部署コード，外部キー：“社員”表の部署コード"],
      ["ウ", "主キー：「部署」表の部署コード，外部キー：「社員」表の社員コード，「社員」表の部署コード", "主キー：“部署”表の部署コード，外部キー：“社員”表の社員コード，“社員”表の部署コード"],
      ["エ", "主キー：「社員」表の部署コード，外部キー：「社員」表の社員コード，「部署」表の部署コード", "主キー：“社員”表の部署コード，外部キー：“社員”表の社員コード，“部署”表の部署コード"],
    ],
  },
  "2013h25h-q061": { jp: [["stem", "関係データベースの「売上」表と「顧客」表を", "関係データベースの“売上”表と“顧客”表を"]] },
  "2013h25h-q067": { jp: [["stem", "関係データベースの「商品」表から", "関係データベースの“商品”表から"]] },
  // q068: 選択肢は源では 4 枚の配線図 (choice_figures 未整備、図 lane で選択肢図化予定)。暫定処置 (D-163):
  //   ア = 源に無い括弧書き (答えの漏洩) を削除 / ウ = 図 (p29) のとおり「ルータ WAN 側にハブ、ハブに PC・TV・インターネット」に最小修正。
  //   イ / エ の記述の省略 (インターネット回線がルータ LAN 側に入る点) は誤りではないので触らない。
  "2013h25h-q068": {
    jp: [
      ["stem", "図中の「FW」は", "図中の“FW”は"],
      ["ア", "直接接続する構成（全機器がFW内側のLAN側）", "直接接続する構成"],
      ["ウ", "PCをルータのLAN側に接続し，ハブのWAN側にPCとTVを接続する構成", "PCをルータのLAN側に接続し，ルータのWAN側にハブを接続して，ハブにPCとTVとインターネットを接続する構成"],
    ],
    zh: [
      ["ア", "直接接到路由器的LAN侧的配置（所有设备都在FW内侧的LAN侧）", "直接接到路由器的LAN侧的配置"],
      ["ウ", "把PC接到路由器的LAN侧，把PC和TV接到集线器的WAN侧的配置", "把PC接到路由器的LAN侧，在路由器的WAN侧连接集线器，并把PC、TV和互联网接到集线器上的配置"],
    ],
    en: [
      ["ア", " without going through the hub (all devices are on the LAN side, inside the FW)", " without going through the hub"],
      ["ウ", "A configuration where the PCs are connected to the LAN side of the router, and a PC and the TV are connected to the WAN side of the hub",
        "A configuration where the PCs are connected to the LAN side of the router, a hub is connected to the WAN side of the router, and a PC, the TV, and the Internet are connected to the hub"],
    ],
  },
  "2013h25h-q069": { jp: [["stem", "記述を直接 埋め込む", "記述を直接埋め込む"]] },
  // q074: 図の言語化行 ([ブラウザ] ― …) は描画補助として不変。冒頭の源に無い「次の」だけを除く。zh「下图」/ en "figure below" は訳として許容 → 不追随。
  "2013h25h-q074": { jp: [["stem", "次の図の構成で、", "図の構成で、"]] },
  "2013h25h-q084": {
    jp: [
      ["stem", "保管し管理する。 未読管理", "保管し管理する。未読管理"],
      ["stem", "メールプロトコル はどれか", "メールプロトコルはどれか"],
    ],
  },
  // q093 / q096: 源 p43 / p44 の式は “…” で囲む (D-155)。演算子は源では全角 (＋ － ／ ＊) だが ASCII のまま (D-162)。
  //   zh / en も同じ区切りに揃える (B3 q094 と同じ)。範囲記号 〜 (U+301C) は据え置き (evidence §4c)。
  "2013h25h-q093": {
    jp: [["stem", "計算式「B14+C2-B2」が", "計算式“B14+C2-B2”が"]],
    zh: [["stem", "计算公式「B14+C2-B2」，", "计算公式“B14+C2-B2”，"]],
    en: [["stem", "the formula \"B14+C2-B2\", and", "the formula “B14+C2-B2”, and"]],
  },
  "2013h25h-q096": {
    jp: [
      ["stem", "計算式「(B2+C2)/2」を", "計算式“(B2+C2)/2”を"],
      ["stem", "計算式「合計(D2〜D13)」を", "計算式“合計(D2〜D13)”を"],
      ["stem", "計算式「D2/D$14」を", "計算式“D2/D$14”を"],
      ["stem", "計算式「F$14*E2」を", "計算式“F$14*E2”を"],
    ],
    zh: [
      ["stem", "计算式「(B2+C2)/2」，", "计算式“(B2+C2)/2”，"],
      ["stem", "计算式「合计(D2〜D13)」。", "计算式“合计(D2〜D13)”。"],
      ["stem", "计算式「D2/D$14」，", "计算式“D2/D$14”，"],
      ["stem", "计算式「F$14*E2」，", "计算式“F$14*E2”，"],
    ],
    en: [
      ["stem", "formula 「(B2+C2)/2」 in", "formula “(B2+C2)/2” in"],
      ["stem", "formula 「SUM(D2:D13)」 in", "formula “SUM(D2:D13)” in"],
      ["stem", "formula 「D2/D$14」 in", "formula “D2/D$14” in"],
      ["stem", "formula 「F$14*E2」 in", "formula “F$14*E2” in"],
    ],
  },
  // q099: 源 p48 のキャプションは「図2　C社サイトからのアクセスの追跡」のみ。括弧書き注記は AI 付加 (D-158) → 削除し A3 の「図1　…」形に揃える。
  //   前文 (mqD、p45) と図2 の言語化 12 行 (p48 の矢印と一致) は不変。
  "2013h25h-q099": {
    jp: [["stem", "図2 C社サイトからのアクセスの追跡（各矢印は「元のページ→次のページ」へリンクされた件数）", "図2　C社サイトからのアクセスの追跡"]],
    zh: [["stem", "图2 对来自C公司网站的访问的追踪（各箭头表示从「原页面→下一页面」被链接跳转的次数）", "图2　对来自C公司网站的访问的追踪"]],
    en: [["stem", "Figure 2: Tracking of accesses from Company C's site (each arrow is the number of links followed from the original page to the next page)", "Figure 2 Tracking of accesses from Company C's site"]],
  },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  "2013h25h-q004": { jp: [["ア", "オフショアウトソーシング", "オフショアアウトソーシング"]] },
  "2013h25h-q036": {
    jp: [["ウ", "関係はy＝xで表される。", "関係はy＝x!で表される。"]],
    zh: [["ウ", "可用 y＝x 表示。", "可用 y＝x! 表示。"]],
    en: [["ウ", "is expressed as y＝x.", "is expressed as y＝x!."]],
  },
  "2013h25h-q037": {
    jp: [["ウ", "上限値を399 kg, 下限値を599 g", "上限値を300 kg, 下限値を500 g"]],
    zh: [["ウ", "上限值设为 399 kg、下限值设为 599 g", "上限值设为 300 kg、下限值设为 500 g"]],
    en: [["ウ", "upper limit to 399 kg and the lower limit to 599 g", "upper limit to 300 kg and the lower limit to 500 g"]],
  },
  "2013h25h-q087": {
    jp: [
      ["ア", "PCに保存する。「メールの返信」を選択して", "PCに保存する。“メールの返信”を選択して"],
      ["イ", "PCに保存する。「メールの返信」を選択して", "PCに保存する。“メールの返信”を選択して"],
      ["ウ", "PCに保存する。「メールの返信」を選択して", "PCに保存する。“メールの返信”を選択して"],
    ],
  },
  "2013h25h-q088": {
    jp: [
      ["ア", "保管する。 添付ファイルは", "保管する。添付ファイルは"], ["ア", "保存する。 保存したファイル", "保存する。保存したファイル"],
      ["イ", "保管する。 添付ファイルは", "保管する。添付ファイルは"], ["イ", "保存する。 保存したファイル", "保存する。保存したファイル"],
      ["ウ", "保管する。 添付ファイルは", "保管する。添付ファイルは"], ["ウ", "保存する。 保存したファイル", "保存する。保存したファイル"],
      ["エ", "保管する。 添付ファイルは", "保管する。添付ファイルは"], ["エ", "保存する。 保存したファイル", "保存する。保存したファイル"],
    ],
  },
  "2013h25h-q100": {
    jp: [
      ["ア", "電子証明書を用いて送信情報を暗号化する。", "電子証明書を用いて通信を暗号化する。"],
      ["イ", "OSの名前、", "OSの名称、"],
    ],
    zh: [["ア", "使用由第三方机构颁发的数字证书来加密发送的信息。", "使用由第三方机构颁发的数字证书来加密通信。"]],
    en: [["ア", "encrypt the transmitted information using a digital certificate", "encrypt the communication using a digital certificate"]],
  },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q036 ウ: 選択肢が y＝x → y＝x! (源) に変わるため、ウの why_wrong を y＝x! について書き直す。
const EXPL = {
  "2013h25h-q036": {
    dist: {
      ウ: {
        jp: ["y＝x は経路の数が人数と同じだけという意味だが、正しくは y＝x(x−1)/2 である。x＝3 のときだけ y＝3 で偶然一致するものの、x＝4 では実際は 6 本、x＝5 では 10 本となり、y＝x は成り立たない。",
          "y＝x! は x の階乗 (1×2×…×x) で、正しい y＝x(x−1)/2 より大きくなりすぎる。x＝3 では 6 (実際は 3 本)、x＝4 では 24 (実際は 6 本)、x＝5 では 120 (実際は 10 本) となり、y＝x! は成り立たない。"],
        zh: ["y＝x 的意思是路径数与人数一样多，但正确的关系是 y＝x(x−1)/2。只有在 x＝3 时 y＝3 才碰巧一致，而 x＝4 时实际为 6 条，x＝5 时为 10 条，y＝x 并不成立。",
          "y＝x! 是 x 的阶乘（1×2×…×x），比正确的关系 y＝x(x−1)/2 大得多。x＝3 时为 6（实际为 3 条），x＝4 时为 24（实际为 6 条），x＝5 时为 120（实际为 10 条），y＝x! 并不成立。"],
        en: ["y＝x means the number of paths is the same as the number of members, but the correct relationship is y＝x(x−1)/2. Only when x＝3 does y＝3 happen to match; when x＝4 the actual number is 6 paths and when x＝5 it is 10, so y＝x does not hold.",
          "y＝x! is the factorial of x (1×2×…×x), which grows far larger than the correct relationship y＝x(x−1)/2. When x＝3 it gives 6 (actually 3 paths), when x＝4 it gives 24 (actually 6), and when x＝5 it gives 120 (actually 10), so y＝x! does not hold."],
      },
    },
  },
};

const MARK = "fidfix-S129-b4";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が腐敗 / 原典一致を述べている題。
//   語義: q004 q036 q037 q068 (選択肢の暫定処置) q074 q099 q100 / 正解肢命中: q004 (ア) q055 (イ、引用符のみ) q087 (ウ、引用符のみ) q100 (ア)
//   note 言及: q004 (「オフショアウトソーシング」) q055 (「文言が入力と完全一致」) q069 (「直接 埋め込む」の空白) q074 (「次の図の構成で」) q084 (「プロトコル はどれか」の空白)
//   追記しない (引用符・空白のみ、note に言及なし): q061 q067 q088 q093 q096
const NOTE_APPEND = {
  "2013h25h-q004": (p) => `（S129 B4: ${p} 実読で 選択肢アの「オフショアウトソーシング」を源の「オフショアアウトソーシング」に是正済み（上記の「オフショアウトソーシング」は是正前の選択肢の字形）。アは**正解肢**だが変更は脱字の是正のみで、海外への委託 = オフショアアウトソーシング = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2013h25h-q036": (p) => `（S129 B4: ${p} 実読で 選択肢ウの「y＝x」を源の「y＝x!」(階乗) に是正（zh / en と解説のウの理由も追随）。誤答肢のため、経路数 y＝x(x−1)/2 の増分は元の人数が多いほど大きい = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2013h25h-q037": (p) => `（S129 B4: ${p} 実読で 選択肢ウの「上限値を399 kg, 下限値を599 g」を源の「上限値を300 kg, 下限値を500 g」に是正（0↔9 の誤読、zh / en 追随）。誤答肢 (限界値分析 = ブラックボックステスト) のため、全分岐経路を網羅 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2013h25h-q055": (p) => `（S129 B4: ${p} 実読で 題幹と選択肢ア〜エの引用符「」を源の “” に是正（字種のみ。上記の「文言が入力と完全一致」は引用符の字種を除く）。イは**正解肢**だが変更は引用符の字種のみで、主キー = 社員コード・部署コード / 外部キー = “社員”表の部署コード = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2013h25h-q068": (p) => `（S129 B4: ${p} 実読で 題幹の「FW」の引用符を源の “” に是正。源の選択肢ア〜エは配線図 4 枚で文字が無く、表示の選択肢文は図の言語化（choice_figures 未整備、図 lane で選択肢図化予定）。暫定処置 (D-163): 正解肢アの源に無い括弧書き「（全機器がFW内側のLAN側）」(答えの漏洩) を削除、ウの「ハブのWAN側にPCとTVを接続」を図のとおり「ルータのWAN側にハブを接続して，ハブにPCとTVとインターネットを接続」に修正（上記の「ハブのWAN側」の記述は是正前の状態。zh / en 追随）。全機器がルータ LAN 側 (FW の内側) に接続される = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2013h25h-q069": (p) => `（S129 B4: ${p} 実読で 題幹の「直接 埋め込む」の改行由来の空白を除去（上記の空白の記述は是正前の状態）。HTML = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2013h25h-q074": (p) => `（S129 B4: ${p} 実読で 題幹冒頭の「次の図の構成で」を源の「図の構成で」に是正（上記の「次の図の構成で」は是正前の状態についての記述。図の言語化行は描画補助として不変）。HTTPS の暗号化は通信の両端 = ブラウザと Web サーバ間 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2013h25h-q084": (p) => `（S129 B4: ${p} 実読で 題幹の「管理する。 未読」「メールプロトコル はどれか」の改行由来の空白を除去（上記の空白の記述は是正前の状態）。サーバ上で保管・管理 = IMAP4 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2013h25h-q087": (p) => `（S129 B4: ${p} 実読で 選択肢ア〜ウの「メールの返信」の引用符を源の “” に是正（字種のみ）。ウは**正解肢**だが変更は引用符の字種のみで、記入した文書を返信メールに添付 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2013h25h-q099": (p) => `（S129 B4: ${p} 実読で 図2 のキャプションに付いていた源に無い括弧書き注記（各矢印は…件数）を削除し、源の「図2　C社サイトからのアクセスの追跡」に揃える（D-158、zh / en 追随）。図2 の言語化 12 行は ${p} の矢印と一致。購入手続 400 件中 220 件が未完了 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2013h25h-q100": (p) => `（S129 B4: ${p} 実読で 選択肢アの「送信情報を暗号化する」を源の「通信を暗号化する」に、イの「OSの名前」を源の「OSの名称」に是正（アは zh / en 追随）。アは**正解肢**だが、第三者機関が発行した電子証明書を用いた通信の暗号化 = 適切 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of [[qq, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of [[qq, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

// expl は id ごとに 1 回だけ読み、全ループで共有する。
const EXPLDOC = new Map();
const expl = (id) => {
  if (!EXPLDOC.has(id)) {
    const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
    EXPLDOC.set(id, { jf, tf, j: rj(jf), tr: rj(tf) });
  }
  return EXPLDOC.get(id);
};
for (const [id, ex] of Object.entries(EXPL)) {
  const { j, tr } = expl(id);
  for (const [L, d] of Object.entries(ex.dist ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (!dj || !dt) throw new Error(`${id} distractor ${L} missing`);
    if (d.jp) sub(dj, "why_wrong_jp", d.jp[0], d.jp[1], `${id} expl_jp.${L}`);
    if (d.zh) sub(dt, "zh", d.zh[0], d.zh[1], `${id} expl_tr.${L}.zh`);
    if (d.en) sub(dt, "en", d.en[0], d.en[1], `${id} expl_tr.${L}.en`);
  }
}
for (const { jf, tf, j, tr } of EXPLDOC.values()) { wj(jf, j); wj(tf, tr); }

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S129-b4: applied ${applied}, skipped ${skipped}`);
