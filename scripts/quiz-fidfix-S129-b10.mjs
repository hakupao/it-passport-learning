#!/usr/bin/env node
// Stage 6 / Quiz — S129 B track **B10** (2010h22h、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S129 の workflow `wf_a6b52681-c67`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b10_2010h22h_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b10_fidelity_input_2010h22h.json (precrop 81/100、skip 19 = page_mismatch (OI-1、小問 7 + 中問 12))
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 468 / AGENT_MISSED 10 / QUOTE_ASCII 4 / TRANSCRIPT_PREFIX 3 (未裁定) / VERDICT_CONFLICT 0 / UNREADABLE 1 (q095)
//                 実残差 = q040 ア〜エ (ASCII ")・q067 (… → ⋮)。q026 / q050 / q057 / q061 / q077 / q089 / q090 (図の言語化)・
//                 q091 / q094 (中問前文) は不変。
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S129-b8 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2010h22h の sidecar のキーは `stem` / `choices` / `stem_jp_clean`。`choices_jp_clean` は無い → 選択肢は raw 3 層が出荷層。
// 中問 3 組 (A〜C) は前文埋め込み済み。前文領域は触らず、from は設問文側の部分一致。
//   A 組前文の全角「Ｓさん」は registry probe の源 (committed evidence chumon_preamble_S114) と結合しているため不変 (D-167、⑨)。
// 読点: この exam の出荷層は ASCII「, 」の題が多い (⑨、不変)。「、」は源の「，」に、脱落した読点は field / 同題の既存字種に揃える (B8 規則)。
// q002 は S96 Rule B (イ↔ウ swap → REVERT) の題。触らない。
//
// 適用ループは B8 から流用 (変更なし)。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q003 エ (p05) 自由寿放 → 自由奔放 (**正解肢**)      q015 ウ (p09) ソリフトウェア → ソフトウェア
//   q025 ア (p12) コピーレし → コピーし (**正解肢**)    q042 エ (p19) 実地棚外し → 実地棚卸し
//   q064 ア / エ (p27) 「読み込み。 」→「, 」/ データダ → データ   q080 エ (p33) アクセスボポイント → アクセスポイント
//   q008 stem (p07) / q040 ア〜エ (p18、ウ = **正解肢**) / q063 ア (p27) ASCII " (S118 R3 scope-out 3 題)
//   q053 / q088 stem 「」→ “”     q026 stem 単独行「図」除去 (zh / en)     q067 表 … → ⋮ (zh / en)
//   q088 例示図の言語化を源図どおりに・推論付記を削除 (zh / en、解説 correct)、選択肢ア〜エの言語化 → 「図ア」〜「図エ」(主 context 裁定)
//   q022 イ / q038 / q043 / q087 / q089 設問文 / q099 / q100 「、」→「，」     q023 ウ 読点を補う     q054 / q096 改行由来の空白
//   q089 設問文「Ｓさん」→ 源「S さん」・WBS 注記の ＷＢＳ / 「、」(前文の「Ｓさん」は D-167 で不変)
//
// Run: node scripts/quiz-fidfix-S129-b10.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S129-b10.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2010h22h
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
  // q008: clean 無し (raw = 出荷層)。源 p07 は “営業部門の組織力強化”。閉じ引用符の ASCII " (S118 R3 scope-out 3 題の 1)。zh / en は可。
  "2010h22h-q008": { jp: [["stem", "“営業部門の組織力強化\"が", "“営業部門の組織力強化”が"]] },
  // q026: 源 p13 の図に図題「図」は無い (corpus で唯一の単独行「図」)。表への起こしは描画補助として不変 (B7 q080)。
  "2010h22h-q026": {
    jp: [["stem", "どれか。\n\n図\n\n| 注文者", "どれか。\n\n| 注文者"]],
    zh: [["stem", "哪一个？\n\n图\n\n| 订购者", "哪一个？\n\n| 订购者"]],
    en: [["stem", "established?\n\nFigure\n\n| Orderer", "established?\n\n| Orderer"]],
  },
  "2010h22h-q038": { jp: [["stem", "ある企業では、業務を遂行する上で違法行為や不正、ミスやエラーなどを防止し、組織が健全かつ有効・効率的に運営されるように基準や業務手続を定め、管理・監視", "ある企業では，業務を遂行する上で違法行為や不正，ミスやエラーなどを防止し，組織が健全かつ有効・効率的に運営されるように基準や業務手続を定め，管理・監視"]] },
  "2010h22h-q043": { jp: [["stem", "自家発電設備は、停電", "自家発電設備は，停電"]] },
  // q053: 源 p23 は “x←y”。zh「」は ⑨-c、en の ASCII " は訳層の既存の地の文。
  "2010h22h-q053": { jp: [["stem", "ここで「x←y」は", "ここで“x←y”は"]] },
  // q054: clean 無し (raw = 出荷層)。改行由来の空白 (R8b)。
  "2010h22h-q054": { jp: [
    ["stem", "送ろうとしている。 電子 メールの内容", "送ろうとしている。電子メールの内容"],
    ["stem", "送信したい。 電子メールの内容", "送信したい。電子メールの内容"],
  ] },
  // q067: 源 p28 の表の省略は縦の ⋮ (B6 q086 / q087 と同じ)。zh / en の表も同形。
  "2010h22h-q067": {
    jp: [["stem", "| … | … |", "| ⋮ | ⋮ |"]],
    zh: [["stem", "| … | … |", "| ⋮ | ⋮ |"]],
    en: [["stem", "| … | … |", "| ⋮ | ⋮ |"]],
  },
  "2010h22h-q087": { jp: [["stem", "攻撃者が、システムの利用者になりすましてシステム管理者に電話をかけ、パスワードを忘れたと言ってパスワードを初期化してもらい、システム", "攻撃者が，システムの利用者になりすましてシステム管理者に電話をかけ，パスワードを忘れたと言ってパスワードを初期化してもらい，システム"]] },
  // q088: 源 p36 は “11 01 00 10 11” “01 00 10 11 01”。en は既に “”、zh「」は ⑨-c。
  //   例示図の言語化 (D-163 暫定): 「時刻 1 付近で 11 の山」は図と食い違う (山は時刻 1 の手前、谷は時刻 3 の手前、次の山は時刻 5 の手前) →
  //   源図どおりに最小修正。「（標本化結果 … に対応）」は図に無い推論の付記 → 削除 (D-158)。
  //   選択肢: 源は図 4 枚のみ。言語化は時刻 1〜5 の量子化値を述べて標本化の技能を迂回させ (イは 01 00 10 11 01 を逐一書く)、
  //   ア / ウには図との食い違いもある → 主 context 裁定 (S129) で corpus 規約の「図ア」〜「図エ」に置換 (zh「图ア」/ en "Figure ア"、
  //   2012h24a-q002 と同形)。添付図 (quiz-figures/2010h22h-q088.webp) に 4 肢がア〜エのラベル付きで載っていることを確認済み。
  //   解説は元から「図アの標本点を…」と図を参照しており、選択肢の言語化を引用していない → 不変。choice_figures 化は図 lane (優先)。
  "2010h22h-q088": {
    jp: [
      ["stem", "結果は「11 01 00 10 11」であった。同じ手法でディジタル化を行うと「01 00 10 11 01」となる", "結果は“11 01 00 10 11”であった。同じ手法でディジタル化を行うと“01 00 10 11 01”となる"],
      ["stem", "波形は時刻 1 付近で振幅 11 の山となり，時刻 3 付近で振幅 00 の谷まで下がり，時刻 5 付近で再び振幅 11 へ上昇する曲線（標本化結果 11 01 00 10 11 に対応）。", "波形は時刻 0 の振幅 10 から上昇して時刻 1 の手前で振幅 11 の山となり，時刻 3 の手前で振幅 00 の谷まで下がり，時刻 5 の手前で再び振幅 11 の山となる曲線。"],
      ["ア", "「図ア」01 付近から始まり，時刻 1 と時刻 2 はいずれも 01（時刻 1.5 に 01 をやや超える小さな山），時刻 3 で 00 の谷。その後急上昇して時刻 4 で 10，時刻 4.6 に 11 の山となり時刻 5 も 11 付近を保つ曲線。", "図ア"],
      ["イ", "「図イ」01 のやや下から始まり，時刻 1 で 01（小さな山），時刻 2 で 00 の谷。その後急上昇して時刻 3 で 10，時刻 3.7 に 11 の山となり時刻 4 も 11。以降下降して時刻 5 でちょうど 01 に戻る曲線。", "図イ"],
      ["ウ", "「図ウ」時刻 0 の 10 から単調に下降し，時刻 1 は 00 に近い低い値，時刻 2 で 00 の谷。その後上昇して時刻 3 で 10，時刻 3.8 に 11 の山となり時刻 4 も 11。以降ゆるやかに下降して時刻 5 で 10 に戻る曲線。", "図ウ"],
      ["エ", "「図エ」4 肢の中で唯一，直線分をつないだ折れ線の波形。時刻 1 で 01，時刻 1.4 に小さな頂点，時刻 2.2 で 00，時刻 3.2 に 10 をやや超える頂点。以降ほぼ直線的に下降して時刻 4 で 10，時刻 5 で 01。", "図エ"],
    ],
    zh: [
      ["stem", "波形在时刻 1 附近形成振幅 11 的波峰，在时刻 3 附近下降至振幅 00 的波谷，在时刻 5 附近再次上升至振幅 11（对应采样结果 11 01 00 10 11）。", "波形从时刻 0 的振幅 10 开始上升，在时刻 1 之前形成振幅 11 的波峰，在时刻 3 之前下降至振幅 00 的波谷，在时刻 5 之前再次形成振幅 11 的波峰。"],
      ["ア", "「图ア」从 01 附近开始，时刻 1 与时刻 2 均为 01（在时刻 1.5 处有一个略高于 01 的小波峰），时刻 3 处为 00 的波谷。随后急剧上升，时刻 4 为 10，在时刻 4.6 处形成 11 的波峰，时刻 5 也保持在 11 附近的曲线。", "图ア"],
      ["イ", "「图イ」从略低于 01 的位置开始，时刻 1 为 01（小波峰），时刻 2 为 00 的波谷。随后急剧上升，时刻 3 为 10，在时刻 3.7 处形成 11 的波峰，时刻 4 也为 11。此后下降，时刻 5 恰好回到 01 的曲线。", "图イ"],
      ["ウ", "「图ウ」从时刻 0 的 10 开始单调下降，时刻 1 为接近 00 的较低值，时刻 2 为 00 的波谷。随后上升，时刻 3 为 10，在时刻 3.8 处形成 11 的波峰，时刻 4 也为 11。此后缓慢下降，时刻 5 回到 10 的曲线。", "图ウ"],
      ["エ", "「图エ」四个选项中唯一由直线段连接而成的折线波形。时刻 1 为 01，时刻 1.4 处有一个小顶点，时刻 2.2 为 00，时刻 3.2 处有一个略高于 10 的顶点。此后近似直线地下降，时刻 4 为 10，时刻 5 为 01。", "图エ"],
    ],
    en: [
      ["stem", "The waveform forms a peak at amplitude 11 around time 1, drops to a trough at amplitude 00 around time 3, and rises back to amplitude 11 around time 5 (corresponding to the sampling result 11 01 00 10 11).", "The waveform rises from amplitude 10 at time 0, forms a peak at amplitude 11 just before time 1, drops to a trough at amplitude 00 just before time 3, and forms another peak at amplitude 11 just before time 5."],
      ["ア", "“Figure ア” A curve that starts near 01, sits at 01 at both time 1 and time 2 (with a small peak slightly above 01 at time 1.5), and reaches a trough of 00 at time 3. It then rises sharply to 10 at time 4, peaks at 11 around time 4.6, and stays near 11 at time 5.", "Figure ア"],
      ["イ", "“Figure イ” A curve that starts slightly below 01, is at 01 at time 1 (a small peak), and reaches a trough of 00 at time 2. It then rises sharply to 10 at time 3, peaks at 11 around time 3.7, and is still at 11 at time 4, after which it falls and returns exactly to 01 at time 5.", "Figure イ"],
      ["ウ", "“Figure ウ” A curve that decreases monotonically from 10 at time 0, is at a low value close to 00 at time 1, and reaches a trough of 00 at time 2. It then rises to 10 at time 3, peaks at 11 around time 3.8, and is still at 11 at time 4, after which it falls gently and returns to 10 at time 5.", "Figure ウ"],
      ["エ", "“Figure エ” The only waveform among the four options drawn as a polyline of straight segments. It is at 01 at time 1, has a small apex at time 1.4, is at 00 at time 2.2, and has an apex slightly above 10 at time 3.2. It then falls almost linearly to 10 at time 4 and to 01 at time 5.", "Figure エ"],
    ],
  },
  // q089: 設問文 (前文の外) は源 p38「S さんは，…ようにと，先輩から…として，」。WBS 言語化の注記は源の「注 網掛けの部分は，表示していない。」
  //   と図題「図 WBS による…」に対応するので字形だけ揃える。言語化そのもの (階層の列挙) は描画補助として不変。
  "2010h22h-q089": { jp: [
    ["stem", "ＷＢＳによるシステムの作業分割（図）の階層構造は次のとおり（網掛けの部分は、表示していない）。", "WBSによるシステムの作業分割（図）の階層構造は次のとおり（網掛けの部分は，表示していない）。"],
    ["stem", "Ｓさんは、作業分割の図において、システム要件定義などのシステム開発作業全体にかかわるものをサブシステム1, 2, …と同じ階層に記載するようにと、先輩から指示を受けた。図のシステム要件定義と同じ階層に記載すべき作業として、適切なもの", "S さんは，作業分割の図において，システム要件定義などのシステム開発作業全体にかかわるものをサブシステム1, 2, …と同じ階層に記載するようにと，先輩から指示を受けた。図のシステム要件定義と同じ階層に記載すべき作業として，適切なもの"],
  ] },
  // q096: 源 p45 は「連絡するために」で改行 → 空白は改行由来 (R8b)。
  "2010h22h-q096": { jp: [["stem", "連絡するために 調査を行った", "連絡するために調査を行った"]] },
  // q099 / q100: 源 p48 は「，」(前文 probe の外、設問文・表・選択肢)。
  "2010h22h-q099": { jp: [
    ["stem", "方策に関する記述として、適切な", "方策に関する記述として，適切な"],
    ["イ", "分析して、会員にきめの細かいサービスを提供するために、CRM", "分析して，会員にきめの細かいサービスを提供するために，CRM"],
    ["ウ", "徹底するために、生産管理", "徹底するために，生産管理"],
    ["エ", "企画に際して、各地域の人口分布に関する統計データを分析することを目的として、POS", "企画に際して，各地域の人口分布に関する統計データを分析することを目的として，POS"],
  ] },
  "2010h22h-q100": { jp: [
    ["stem", "方針案2を進めた場合、〔S社の状況〕の(1)と(5)に対処することができ、T社が", "方針案2を進めた場合，〔S社の状況〕の(1)と(5)に対処することができ，T社が"],
    ["stem", "戦略を採った場合、買収後のS社の戦略に関する記述として、適切な", "戦略を採った場合，買収後のS社の戦略に関する記述として，適切な"],
    ["stem", "市場シェアが3位以下だが、特定商品", "市場シェアが3位以下だが，特定商品"],
    ["ア", "商品化し、Q社", "商品化し，Q社"],
    ["イ", "特化して、高価格、高収益", "特化して，高価格，高収益"],
    ["ウ", "健康志向を高め、健康菓子", "健康志向を高め，健康菓子"],
    ["エ", "資金を投入して、競争力の高い優れた商品を企画し、販売", "資金を投入して，競争力の高い優れた商品を企画し，販売"],
  ] },
  // ── 選択肢 (raw = 出荷層) ───────────────────────────────────────────────────
  // q003: **正解肢**。源 p05「自由奔放」。zh / en は正 → 不追随。
  "2010h22h-q003": { jp: [["エ", "自由寿放な発言", "自由奔放な発言"]] },
  "2010h22h-q015": { jp: [["ウ", "PC で行うソリフトウェア", "PC で行うソフトウェア"]] },
  // q022: field は「、」だけ → 源の「，」。改行由来の空白も除く。
  "2010h22h-q022": { jp: [["イ", "運営負荷、 ネットワーク", "運営負荷，ネットワーク"]] },
  // q023: field に読点が無い → 同題の字種「, 」で補う (B8 q032)。
  "2010h22h-q023": { jp: [["ウ", "検査を行い サンプル", "検査を行い, サンプル"]] },
  // q025: **正解肢**。源 p12「コピーし」。衍字「レ」。
  "2010h22h-q025": { jp: [["ア", "PC にコピーレし,", "PC にコピーし,"]] },
  // q040: **ウ = 正解肢**。源 p18 は ア〜エとも “…”。閉じ引用符の ASCII " (エは開きも) と、アの閉じ引用符前後の空白付き「 , 」。
  //   “ の前の空白は exam の体裁で不変。zh は既に “”、en の ASCII " は訳層の地の文。
  "2010h22h-q040": { jp: [
    ["ア", "ワークシート “上半期\" , ワークシート “下半期\" のいずれ", "ワークシート “上半期”, ワークシート “下半期” のいずれ"],
    ["イ", "ワークシート “上半期\" に 4〜9 月の各月の売上を, ワークシート “下半期\" に", "ワークシート “上半期” に 4〜9 月の各月の売上を, ワークシート “下半期” に"],
    ["ウ", "ワークシート “上半期\" の売上合計とワークシート “下半期\" の売上合計が, ワークシート “年間\"に", "ワークシート “上半期” の売上合計とワークシート “下半期” の売上合計が, ワークシート “年間”に"],
    ["エ", "ワークシート “上半期\" の売上合計とワークシート \"下半期\" の売上合計を", "ワークシート “上半期” の売上合計とワークシート “下半期” の売上合計を"],
  ] },
  "2010h22h-q042": { jp: [["エ", "実地棚外しによって", "実地棚卸しによって"]] },
  // q063: 源 p27 は「“”で囲む」(原寸 6 倍で確認、“ と ” の間に字は無い)。jp / zh の中の ASCII " を除く。en の (") は訳の注で可。
  "2010h22h-q063": {
    jp: [["ア", "文章や節などを“\"”で囲む。", "文章や節などを“”で囲む。"]],
    zh: [["ア", "用“\"”将", "用“”将"]],
  },
  // q064: ア は「読み込み。 」→ field の字種「, 」(源「，」)、エ は衍字「ダ」。
  "2010h22h-q064": { jp: [
    ["ア", "光学的に読み込み。 ディジタル", "光学的に読み込み, ディジタル"],
    ["エ", "データダ蓄積", "データ蓄積"],
  ] },
  "2010h22h-q080": { jp: [["エ", "アクセスボポイント", "アクセスポイント"]] },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q088 correct: 例示図の「時刻 1 で 11 付近の山」は題幹の言語化と同じ食い違い (山は時刻 1 の手前) → 題幹と揃える (jp / zh / en)。
//  他の題の解説は是正対象の字句を引用していない (腐敗語の言及は key_guard note のみ → NOTE_APPEND)。
const EXPL = {
  "2010h22h-q088": {
    correct: {
      jp: ["例示図の波形は時刻 1 で 11 付近の山、", "例示図の波形は時刻 1 で 11 付近 (山は時刻 1 の少し手前)、"],
      zh: ["示例图的波形在时刻 1 处是 11 附近的波峰，", "示例图的波形在时刻 1 处位于 11 附近（波峰在时刻 1 之前不远处），"],
      en: ["the waveform has a peak near 11 at time 1,", "the waveform is near 11 at time 1 (the peak is just before time 1),"],
    },
  },
};

const MARK = "fidfix-S129-b10";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が腐敗 / 是正対象の字句を述べている題。
//   語義: q003 q015 q025 q042 q064 q080 q088 / 正解肢命中: q003 (エ) q025 (ア) q040 (ウ、引用符)
//   note 言及: q008 (閉じ括弧の是正を提言) q023 (読点の欠落) q040 (引用符の脱落) q053 (「x←y」) q063 (“"” の字形) q088 (ウを是正済みと記述)
//   追記しない (字種・空白のみで note に言及なし): q022 q026 q038 q043 q054 q067 q087 q089 q090 q091 q092 q096 q099 q100
const NOTE_APPEND = {
  "2010h22h-q003": (p) => `（S129 B10: ${p} 実読で 上記の選択肢エの「自由寿放」を源の「自由奔放」に是正済み。エは**正解肢**だが字形のみの変更で、批判厳禁・自由奔放・質より量 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2010h22h-q008": (p) => `（S129 B10: ${p} 実読で 上記の提言どおり題幹の閉じ引用符を源の ” に是正済み。営業部門の組織力強化 = SFA = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2010h22h-q015": (p) => `（S129 B10: ${p} 実読で 上記の選択肢ウの「ソリフトウェア」を源の「ソフトウェア」に是正済み。機器に組み込まれた制御ソフト = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2010h22h-q023": (p) => `（S129 B10: ${p} 実読で 上記の選択肢ウの欠落した読点を補った（同題の字種「, 」）。累積構成比によるランク付け = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2010h22h-q025": (p) => `（S129 B10: ${p} 実読で 上記の選択肢アの「コピーレし」を源の「コピーし」に是正済み。アは**正解肢**だが衍字の除去のみで、私的使用のための複製 = 適法 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2010h22h-q040": (p) => `（S129 B10: ${p} 実読で 選択肢ア〜エの引用符を源の “…” に是正（閉じの ASCII "、エは開きも。上記の「閉じ引用符と読点の脱落」の指摘を含む）。ウは**正解肢**だが字種のみの変更で、モジュール間の受渡しの検証 = 結合テスト = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2010h22h-q042": (p) => `（S129 B10: ${p} 実読で 上記の選択肢エの「実地棚外し」を源の「実地棚卸し」に是正済み。被監査部門から独立した者による点検 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2010h22h-q053": (p) => `（S129 B10: ${p} 実読で 題幹の「x←y」の引用符を源の “” に是正（上記の引用は是正前の字種）。TMP←A → A←B → B←TMP = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2010h22h-q063": (p) => `（S129 B10: ${p} 原寸実読で 選択肢アの源は「“”で囲む」（“ と ” の間に字は無い）→ 間の半角 " を除去済み（zh も）。XML は文書構造をタグで囲む = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2010h22h-q064": (p) => `（S129 B10: ${p} 実読で 上記の選択肢エの「データダ蓄積」を源の「データ蓄積」に、アの「読み込み。 」を読点に是正済み。経路制御・ネットワーク間の中継 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2010h22h-q080": (p) => `（S129 B10: ${p} 実読で 上記の選択肢エの「アクセスボポイント」を源の「アクセスポイント」に是正済み。ポート番号 = 通信相手のアプリケーション = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2010h22h-q088": (p) => `（S129 B10: ${p} 実読で 題幹の例示図の言語化を源図どおりに是正（山は時刻 1 の手前・谷は時刻 3 の手前・次の山は時刻 5 の手前、図に無い「標本化結果に対応」の付記を削除）、選択肢ア〜エの図の言語化（量子化値を述べて標本化の技能を迂回させ、ア・ウは図とも食い違う。上記ウ「是正済み」は表示層に未反映だった）を「図ア」〜「図エ」に置換（zh / en も、添付図に 4 肢あり）。choice_figures は図 lane で優先。標本化 01 00 10 11 01 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
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
  if (ex.correct?.jp) sub(j, "correct_jp", ex.correct.jp[0], ex.correct.jp[1], `${id} expl_jp.correct`);
  if (ex.correct?.zh) sub(tr.correct, "zh", ex.correct.zh[0], ex.correct.zh[1], `${id} expl_tr.correct.zh`);
  if (ex.correct?.en) sub(tr.correct, "en", ex.correct.en[0], ex.correct.en[1], `${id} expl_tr.correct.en`);
  for (const [L, d] of Object.entries(ex.dist ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (!dj || !dt) throw new Error(`${id} distractor ${L} missing`);
    if (d.jp) for (const [f, t] of Array.isArray(d.jp[0]) ? d.jp : [d.jp]) sub(dj, "why_wrong_jp", f, t, `${id} expl_jp.${L}`);
    if (d.zh) sub(dt, "zh", d.zh[0], d.zh[1], `${id} expl_tr.${L}.zh`);
    if (d.en) sub(dt, "en", d.en[0], d.en[1], `${id} expl_tr.${L}.en`);
  }
  for (const [i, d] of Object.entries(ex.points ?? {})) {
    if (d.jp) sub(j.points_jp, i, d.jp[0], d.jp[1], `${id} expl_jp.points.${i}`);
    if (d.zh) sub(tr.points[i], "zh", d.zh[0], d.zh[1], `${id} expl_tr.points.${i}.zh`);
    if (d.en) sub(tr.points[i], "en", d.en[0], d.en[1], `${id} expl_tr.points.${i}.en`);
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S129-b10: applied ${applied}, skipped ${skipped}`);
