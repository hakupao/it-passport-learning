#!/usr/bin/env node
// Stage 6 / Quiz — caveat / key_guard.note 起点の保真核験 由来の是正 (S115c, 2 exam)。
//
// ══ 経緯 (常設順序 ③④ の実行) ══
// generate の `key_guard.note_jp` を全 100 問走査し、**未是正**の表示層欠陥を名指ししている
// 問を抽出 (2010h22a 12 問 / 2009h21h 13 問)。caveat 自体を信じず、その問を
// **s7x 保真核験 workflow に掛け直した** (双 pass・別 subagent_type、Rule D)。
//
//   2010h22a: `wf_595730f8-b08` (gp) / `wf_c36c7f75-c8e` (cr)
//     → 両 pass とも CLEAN 4 / DISCREPANT 8、**差分 9 件で完全一致**、UNREADABLE 0
//   2009h21h: `wf_4068bcba-bde` (gp) / `wf_d2db1a73-73b` (cr)
//     → 両 pass とも CLEAN 6 / DISCREPANT 7、差分 7〜8 件 (pass2 が q076 stem を追加検出)
//
// ══ 掛け直しの価値 (S114 の教訓が再現) ══
// (1) **caveat が指していなかった欠陥を捕捉**:
//     `2010h22a-q022 ウ` は源「経営者を**牽**制する制度」の「牽」が脱落し「経営者を制する制度」
//     になっていた。**ルビ付き漢字 (牽 に「けん」) の親字がルビごと落ちた抽出事故**で、
//     「牽制する」(ガバナンス文脈の抑制機能) と「制する」(制圧・支配) では語義が変わる。
//     key_guard の note はこの問に何も書いていない。
// (2) **caveat が指した欠陥の severity を答えレベルまで引き上げ**:
//     `2009h21h-q057 ア` について note は「選択肢アの文字列が原典と食い違う」としか書いて
//     いなかったが、保真核験は **answer_affecting (二重正解)** と判定した (下記)。
//
// ══ 本 session 2 件目の answer_affecting — 2009h21h-q057 ア ══
// 相対パス指定の設問。源の選択肢アは `..¥..¥D2¥D4¥a` (`..` が 2 回 = 2 階層上) だが、
// dataset は `..¥.¥D2¥D4¥a` (2 つ目が `.` = カレント) にドットが 1 個脱落していた。
//   源のア      : D3 → D1 → **さらに 1 階層上** = 到達不能 ⇒ 誤答肢として正しく機能する
//   dataset のア: D3 → D1 → そのまま → D2 → D4 → a ⇒ **目的のファイル a に到達してしまう**
// 結果として正解肢イ `..¥D2¥D4¥a` と等価になり、**正解が一意に定まらなくなっていた**。
// 双 pass が独立に answer_affecting と判定。**zh / en も同じ壊れた文字列**を持っていた。
//
// ══ 訳文への波及 ══
// q057 (3 言語で同一の壊れたパス) と q076 ウ (習得/習熟の語義差) 以外は、**訳文が既に正しい**
// (翻訳者が腐敗を暗黙に補正していた)。S114 §7 と同じ傾向。
//
// Run: node scripts/quiz-fidfix-S115c-caveat.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const qid = (e, n) => `${e}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  // ═══════════ 2010h22a ═══════════
  {
    id: qid("2010h22a", 22), kind: "choice_jp", key: "ウ",
    from: "経営者を制する制度", to: "経営者を牽制する制度",
    why: "semantic (双 pass 一致・**caveat は無言だった新規発見**): 源「牽制する」の「牽」がルビ「けん」ごと脱落。「制する」では語義が変わる",
  },
  {
    id: qid("2010h22a", 25), kind: "choice_jp", key: "エ",
    from: "データベース上に革積された知識や情報を", to: "データベース上に蓄積された知識や情報を",
    why: "semantic (双 pass 一致): 源「蓄積」→「革積」(非語)。同問の選択肢イに正当な「革新」があり取り違えたとみられる",
  },
  {
    id: qid("2010h22a", 54), kind: "stem", layer: "raw",
    from: "java 言語に関する記述として", to: "Java 言語に関する記述として",
    why: "cosmetic (双 pass 一致): 源は固有名詞として大文字始まりの「Java」。表示層 = raw",
  },
  {
    id: qid("2010h22a", 60), kind: "choice_jp", key: "イ",
    from: "IP アドレスの枯渦が回避できる", to: "IP アドレスの枯渇が回避できる",
    why: "semantic (双 pass 一致・**正解肢**): 源「枯渇」→「枯渦」(非語)。IPv4 アドレス枯渇問題という語義が壊れていた",
  },
  {
    id: qid("2010h22a", 63), kind: "choice_jp", key: "ウ",
    from: "ほかのデータベースてと連携しやすくする", to: "ほかのデータベースと連携しやすくする",
    why: "cosmetic (双 pass 一致): 源に無い仮名「て」の混入 (非文法)",
  },
  {
    id: qid("2010h22a", 67), kind: "choice_jp", key: "ウ",
    from: "ファイル名や入出カデータの文字コード", to: "ファイル名や入出力データの文字コード",
    why: "cosmetic (双 pass 一致): 漢字「力」(U+529B) がカタカナ「カ」(U+30AB) に置換されたホモグリフ混入。「入出カ」は非語で検索・TTS・翻訳が破綻する",
  },
  {
    id: qid("2010h22a", 70), kind: "stem", layer: "raw",
    from: "接続できるイン タフェースである", to: "接続できるインタフェースである",
    why: "cosmetic (主 context 判断 / key_guard note が指摘): 行折り返し由来の空白が語「インタフェース」を割っていた。S115b で 2010h22a q028/q032/q047 に適用したのと同じ方針 (語を割る空白は是正)。表示層 = raw",
  },
  {
    id: qid("2010h22a", 70), kind: "choice_jp", key: "イ",
    from: "PC と周辺機器の問のデータ転送速度", to: "PC と周辺機器の間のデータ転送速度",
    why: "semantic (双 pass 一致): 源「間」→「問」(門構えの中が 日 → 口)。日本語として意味を成さなくなっていた",
  },
  {
    id: qid("2010h22a", 76), kind: "choice_jp", key: "イ",
    from: "情報セキュリティボリシの構成要素", to: "情報セキュリティポリシの構成要素",
    why: "cosmetic (双 pass 一致): 半濁点「ポ」が濁点「ボ」に。「ボリシ」は非語",
  },
  {
    id: qid("2010h22a", 76), kind: "choice_jp", key: "エ",
    from: "情報セキュリティボリシを初めて作成する", to: "情報セキュリティポリシを初めて作成する",
    why: "cosmetic (双 pass 一致): 同上。同一肢の後半「同業他社のポリシ」は正しく、内部不整合になっていた",
  },

  // ═══════════ 2009h21h ═══════════
  {
    id: qid("2009h21h", 9), kind: "choice_jp", key: "エ",
    from: "秘容保持契約を締結した下請業者", to: "秘密保持契約を締結した下請業者",
    why: "semantic (双 pass 一致・**正解肢**): 源「秘密保持契約」→「秘容保持契約」(非語)。本肢を正解たらしめる秘密管理性の根拠語 (NDA) が壊れていた",
  },
  {
    id: qid("2009h21h", 22), kind: "choice_jp", key: "ウ",
    from: "企業の将来の方向を示したピジョンを", to: "企業の将来の方向を示したビジョンを",
    why: "cosmetic (双 pass 一致): 濁点「ビ」が半濁点「ピ」に。「ピジョン」では語として成立しない",
  },
  {
    id: qid("2009h21h", 54), kind: "choice_jp", key: "イ",
    from: "経営トップは情報セキュリティボリシに対する", to: "経営トップは情報セキュリティポリシに対する",
    why: "cosmetic (双 pass 一致・**正解肢**): 半濁点「ポ」→ 濁点「ボ」。設問文と選択肢ウは正しく「ポリシ」で、イだけ破損していた。**2010h22a-q076 と同じ字形ペアが別年度で再現**",
  },
  {
    id: qid("2009h21h", 57), kind: "choice_jp", key: "ア",
    from: "..¥.¥D2¥D4¥a", to: "..¥..¥D2¥D4¥a",
    why: "**answer_affecting (双 pass 一致)**: ドット 1 個の脱落で到達不能な誤答肢が正解肢イと等価な有効パスになり、二重正解になっていた",
  },
  {
    id: qid("2009h21h", 57), kind: "tr_choice", key: "ア", lang: "zh",
    from: "..¥.¥D2¥D4¥a", to: "..¥..¥D2¥D4¥a",
    why: "zh も同じ壊れたパス文字列を持っていた",
  },
  {
    id: qid("2009h21h", 57), kind: "tr_choice", key: "ア", lang: "en",
    from: "..¥.¥D2¥D4¥a", to: "..¥..¥D2¥D4¥a",
    why: "en も同じ壊れたパス文字列を持っていた",
  },
  {
    id: qid("2009h21h", 76), kind: "choice_jp", key: "ウ",
    from: "開発手法の習得", to: "開発手法の習熟",
    why: "semantic (双 pass 一致): 源は「習熟」(反復による熟達)。「習得」(技能の獲得) とは語義が異なる",
  },
  {
    id: qid("2009h21h", 76), kind: "tr_choice", key: "ウ", lang: "zh",
    from: "掌握开发方法", to: "熟练掌握开发方法",
    why: "習得 → 習熟 の語義差を zh に反映",
  },
  {
    id: qid("2009h21h", 76), kind: "tr_choice", key: "ウ", lang: "en",
    from: "Mastering development methods", to: "Gaining proficiency in development methods",
    why: "習得 → 習熟 の語義差を en に反映",
  },
  {
    id: qid("2009h21h", 76), kind: "stem", layer: "raw",
    from: "独自に開発せずに，ソフトウェアパッケージを", to: "独自に開発せず，ソフトウェアパッケージを",
    why: "cosmetic (pass2 のみ報告): 源は連用中止形「開発せず，」。助詞「に」1 字の追加。表示層 = raw",
  },
  {
    id: qid("2009h21h", 83), kind: "choice_jp", key: "ウ",
    from: "WebページをU記述するための言語", to: "Webページを記述するための言語",
    why: "semantic (双 pass 一致・**正解肢**): 源に無いラテン文字「U」が「を」と「記述」の間に混入していた",
  },
  {
    id: qid("2009h21h", 84), kind: "choice_jp", key: "ウ",
    from: "再インストールして現象を確かめる。                                                        「",
    to: "再インストールして現象を確かめる。",
    why: "cosmetic (双 pass 一致): 源に無い末尾の空白列 + 開き鉤括弧。右余白のスキャン汚れを OCR が鉤括弧と誤認した幻字 (S114 §8b と同型)",
  },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDocs = new Map();
const loadTr = (examId) => {
  if (!trDocs.has(examId)) {
    const p = path.join(TR_DIR, `${examId}.json`);
    trDocs.set(examId, { p, doc: JSON.parse(readFileSync(p, "utf-8")) });
  }
  return trDocs.get(examId).doc;
};

const replaceOnce = (s, f, where) => {
  const n = s.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${where}: expected exactly 1 occurrence of «${f.from.slice(0, 50)}», found ${n}`);
  return s.replace(f.from, f.to);
};

const counts = { raw: 0, clean: 0, choice: 0, tr: 0 };
for (const f of FIXES) {
  const examId = f.id.split("-")[0];
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  const t = loadTr(examId).questions[f.id];

  if (f.kind === "stem") {
    if (f.layer === "raw" || f.layer === "both") {
      rec.stem_jp = replaceOnce(rec.stem_jp, f, "raw"); counts.raw++;
      console.log(`  ✓ ${f.id} [raw]      ${f.why}`);
    }
    if (f.layer === "clean" || f.layer === "both") {
      if (!t?.stem_jp_clean) throw new Error(`${f.id}: no stem_jp_clean`);
      t.stem_jp_clean = replaceOnce(t.stem_jp_clean, f, "clean"); counts.clean++;
      console.log(`  ✓ ${f.id} [clean]    ${f.why}`);
    }
  } else if (f.kind === "choice_jp") {
    rec.choices_jp[f.key] = replaceOnce(rec.choices_jp[f.key], f, `choice.${f.key}`); counts.choice++;
    console.log(`  ✓ ${f.id} [choice ${f.key}] ${f.why}`);
  } else if (f.kind === "tr_choice") {
    if (!t?.choices?.[f.key]?.[f.lang]) throw new Error(`${f.id}: no tr choice ${f.key}.${f.lang}`);
    t.choices[f.key][f.lang] = replaceOnce(t.choices[f.key][f.lang], f, `tr.${f.key}.${f.lang}`); counts.tr++;
    console.log(`  ✓ ${f.id} [tr ${f.key}.${f.lang}] ${f.why}`);
  } else if (f.kind === "tr_stem") {
    if (!t?.stem?.[f.lang]) throw new Error(`${f.id}: no tr stem ${f.lang}`);
    t.stem[f.lang] = replaceOnce(t.stem[f.lang], f, `tr_stem.${f.lang}`); counts.tr++;
    console.log(`  ✓ ${f.id} [tr ${f.lang}]    ${f.why}`);
  }
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
for (const { p, doc } of trDocs.values()) writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S115c-caveat: raw ${counts.raw} / clean ${counts.clean} / choice ${counts.choice} / tr ${counts.tr}`);
console.log(`  next: node scripts/build-quiz-corpus.mjs`);
