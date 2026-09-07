#!/usr/bin/env node
// Stage 6 / Quiz — D-144 段 5 (S118): 中問グループの **常設レジストリ** を生成する (決定的・冪等)。
//
// 背景: 段 3 で共有前文 (前文) を表示層 (translations sidecar の stem_jp_clean / stem.zh / stem.en) へ前置したが、
// 「前置が全メンバー・全 3 言語に届いているか」を常設で見張る不変式が無かった。
// S117 §28h の教訓: linkage-gap scanner は偽陰性を出す (参照表記の揺れを拾えない)。真の不変式は
//   「登録済み中問組の全メンバーの表示 stem に、その組の前文 probe が 3 言語とも含まれる」= crosscheck A7。
// 本 script はその A7 が読むレジストリ data/ip/quiz/chumon_groups.json を出所から再生成する。
//
// 出所 1 (extracted): evidence/phase5/stage_06_quiz_fidelity/chumon_preamble_{S114,S115,S116,S117_batch1..3}.json
//        shape: (raw.result ?? raw).results[] に key / exam_id / member_ids[] / draft.preamble_{jp,zh,en} / verification.verdict
//        ※ S114 の member_ids は「前文の出所となった設問 (源設問)」を含まない (前置の対象外だったため)。
//          member_ids を鵜呑みにすると組が実際より小さくなり、A7 の射程に穴が空く (S118 reviewer HIGH-1)。
//          → 下の EXPAND で「同一 exam の中問レンジ q085〜q100 のうち、3 言語とも probe を **先頭 (idx 0)** に持つ設問」を
//            member に併合する。前文を先頭に持つ = その組の本文を共有している、という決定的な判定。
// 出所 2 (lightweight COPY): scripts/quiz-chumon-lightweight-D144s3.mjs の COPY 表。
//        真相源は当該 script。ここでは同じ cut / section / strip を再現して源設問の現 stem から前文を切り出す
//        (marker が消えていれば throw = COPY 表 drift の検出)。
//        ※ section 型の見出し (〔要望事項〕等) は設問文の中にも現れるため、**行頭の出現のうち最後のもの**に錨を打つ。
//          単純な indexOf だと設問文側に命中し、前文が「…適切なものはどれか。〔要望事項〕…」と汚染される (HIGH-2)。
//        member が抽出組と重複する場合は **抽出組を優先** し、COPY 組は登録せず notes に残す。
//
// probe = 前文を空白除去した先頭 40 字 (段 3 apply の冪等判定と同じ形)。前文全文一致にしないのは、
// メンバーによって前文末尾の 1 文が正当に欠けることがあるため (例 2014h26a-q086 は
// 「図1は，表1に基づいて作成したアローダイアグラムである。」を jp/zh/en とも持たない — 設問固有の正しい姿)。
// probe は evidence の draft 前文から取る (表示層から取ると「壊れた表示」を正として焼き付けてしまう)。
// 偽 RED リスク: 将来 normalize (句読点・全半角・空白) が前文の先頭 40 字に触れると、データは正しいのに A7 が落ちる。
// その時は normalize を先に走らせてから本 script を再生成すること (probe は再生成で追随する)。
//
// Run: node scripts/quiz-chumon-groups-build.mjs [--check]
//      --check … 書き込まず、既存ファイルとの差分の有無だけを報告 (差分ありなら exit 1)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const Q = path.join(ROOT, "data/ip/quiz");
const EV = path.join(ROOT, "evidence/phase5/stage_06_quiz_fidelity");
const OUT = path.join(Q, "chumon_groups.json");
const GROUPS_RAW = path.join(ROOT, "data/ip/exams/groups.json"); // D-120 共有図の組定義 (raw, gitignored)
const CHECK = process.argv.includes("--check");

const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const nsp = (s) => s.replace(/\s+/g, "");
const PROBE_LEN = 40;
const probeOf = (s) => nsp(s).slice(0, PROBE_LEN);
const QN_FROM = 85, QN_TO = 100; // 中問が置かれるレンジ (IP 過去問は問85〜100 が中問)

const EVIDENCE_FILES = [
  "chumon_preamble_S114.json",
  "chumon_preamble_S115.json",
  "chumon_preamble_S116.json",
  "chumon_preamble_S117_batch1.json",
  "chumon_preamble_S117_batch2.json",
  "chumon_preamble_S117_batch3.json",
];

// scripts/quiz-chumon-lightweight-D144s3.mjs の COPY 表の写し (source / cut / section / strip / targets)。
// 当該 script は import すると apply が走ってしまうため export ではなく写しにしている。marker がずれれば下で throw する。
const COPY = [
  { source: "2011h23a-q093", targets: ["2011h23a-q094", "2011h23a-q095", "2011h23a-q096"],
    cut: { jp: "〔A さんが書き出したメモ〕の(1)〜(5)を実施する順番", zh: "将〔A 先生记下的备忘录〕中的 (1)〜(5)", en: "When items (1) to (5) in [the memo Mr. A wrote out]" },
    strip: { jp: /^〔マネジメント〕\s*/, zh: /^〔管理〕\s*/, en: /^\[Management\]\s*/ } },
  { source: "2012h24a-q098", targets: ["2012h24a-q097", "2012h24a-q099"],
    cut: { jp: "次に示す〔個人情報の適正管理に関する規程〕", zh: "对于下面所示〔关于个人信息妥善管理的规程〕", en: "For each clause of the following [Regulations" },
    strip: {} },
  { source: "2011h23a-q089", targets: ["2011h23a-q090", "2011h23a-q091", "2011h23a-q092"],
    cut: { jp: "問 89 画素データを圧縮せずに出力した場合", zh: "问 89 在不压缩像素数据直接输出的情况下", en: "Q89 When the pixel data is output without compression" },
    strip: { jp: /^中問A[^\n]*\n\s*/, zh: /^中题A[^\n]*\n\s*/, en: /^Group Question A[^\n]*\n\s*/ } },
  { source: "2014h26h-q089", targets: ["2014h26h-q090", "2014h26h-q091", "2014h26h-q092"],
    cut: { jp: "案Aと案Bのどちらで製品Hの製造原価が低くなるのかは", zh: "对于产品 H，方案 A 与方案 B 中哪一个的制造成本更低", en: "Which of plan A or plan B yields a lower manufacturing cost" },
    strip: {} },
  { source: "2014h26a-q085", targets: ["2014h26a-q086"],
    cut: { jp: "Xソフトの開発が終了する日は", zh: "X 软件的开发结束日", en: "On which day, counting from the start" }, strip: {} },
  { source: "2013h25a-q097", targets: ["2013h25a-q099"], section: { jp: "〔要望事項〕", zh: "〔需求事项〕", en: "[Requirements]" }, strip: {} },
];

const trCache = new Map();
const tr = (exam) => {
  if (!trCache.has(exam)) {
    const f = path.join(Q, "translations", `${exam}.json`);
    trCache.set(exam, existsSync(f) ? rj(f) : null);
  }
  return trCache.get(exam);
};
const stems = (exam, id) => {
  const e = tr(exam)?.questions?.[id];
  return e ? { jp: e.stem_jp_clean, zh: e.stem?.zh, en: e.stem?.en } : null;
};
// 3 言語とも probe を持つか / 先頭に持つか
const probeIdx = (exam, id, probe) => {
  const s = stems(exam, id);
  if (!s) return null;
  return ["jp", "zh", "en"].map((l) => (typeof s[l] === "string" ? nsp(s[l]).indexOf(probe[l]) : -2));
};

// 行頭に現れる見出しのうち **最後の** 出現位置 (section 型の錨。設問文中の見出しに食いつくのを防ぐ)
const lastLineStart = (text, marker) => {
  let found = -1;
  for (let i = text.indexOf(marker); i >= 0; i = text.indexOf(marker, i + 1)) {
    if (i === 0 || text[i - 1] === "\n") found = i;
  }
  return found;
};

const groups = [];
const owner = new Map(); // member id → group key (重複登録の禁止)
const notes = [];

// ── 出所 1: 抽出組 ──
for (const f of EVIDENCE_FILES) {
  const raw = rj(path.join(EV, f));
  const results = (raw.result ?? raw).results;
  if (!Array.isArray(results)) throw new Error(`${f}: results[] not found`);
  for (const g of results) {
    if (g.verification?.verdict !== "PASS") throw new Error(`${f} ${g.key}: verdict=${g.verification?.verdict} (PASS 以外は登録しない)`);
    if (!Array.isArray(g.member_ids) || g.member_ids.length < 2) throw new Error(`${f} ${g.key}: member_ids がない/1 問しかない`);
    const probe = {};
    for (const lang of ["jp", "zh", "en"]) {
      const pre = g.draft?.[`preamble_${lang}`];
      if (typeof pre !== "string") throw new Error(`${f} ${g.key}: draft.preamble_${lang} がない`);
      if (nsp(pre).length < PROBE_LEN) throw new Error(`${f} ${g.key} ${lang}: preamble が ${PROBE_LEN} 字未満`);
      probe[lang] = probeOf(pre);
    }
    groups.push({ key: g.key, exam_id: g.exam_id, member_ids: [...g.member_ids], probe, origin: f, _extracted: true });
  }
}

// ── EXPAND: 抽出組の member_ids を「probe を 3 言語とも先頭に持つ同 exam の中問」で補完する (HIGH-1) ──
for (const g of groups) {
  for (const id of g.member_ids) {
    if (owner.has(id)) throw new Error(`${id}: ${owner.get(id)} と ${g.key} に二重所属`);
    owner.set(id, g.key);
  }
}
const added = [];
for (const g of groups) {
  if (!g._extracted) continue;
  for (let n = QN_FROM; n <= QN_TO; n++) {
    const id = `${g.exam_id}-q${String(n).padStart(3, "0")}`;
    if (owner.has(id)) continue;              // 既にどこかの組に所属
    if (!stems(g.exam_id, id)) continue;      // その設問が無い
    const idx = probeIdx(g.exam_id, id, g.probe);
    if (!idx || !idx.every((i) => i === 0)) continue; // 3 言語とも「前文が先頭」でなければ組の本文共有とは見なさない
    g.member_ids.push(id);
    owner.set(id, g.key);
    added.push(`${id} → ${g.key}`);
  }
  g.member_ids.sort();
}
for (const a of added) notes.push(`EXPAND: ${a} (evidence の member_ids に無いが 3 言語とも前文を先頭に持つ — 源設問)`);

// ── 出所 2: lightweight COPY 組 ──
for (const c of COPY) {
  const exam = c.source.split("-q")[0];
  const key = `${c.source}-copy`;
  const members = [c.source, ...c.targets];
  const dup = members.filter((id) => owner.has(id));
  if (dup.length === members.length) {
    notes.push(`${key}: 全メンバー (${members.join(", ")}) が抽出組 ${owner.get(c.source)} に含まれるため登録しない (抽出組を優先 — D-144 段 5)`);
    continue;
  }
  if (dup.length) throw new Error(`${key}: 抽出組と部分重複 (${dup.join(", ")}) — 手当てが必要`);
  const src = tr(exam)?.questions?.[c.source];
  if (!src?.stem_jp_clean || !src?.stem?.zh || !src?.stem?.en) throw new Error(`${c.source}: 源設問の 3 言語 stem が揃っていない`);
  const probe = {};
  for (const [lang, text] of [["jp", src.stem_jp_clean], ["zh", src.stem.zh], ["en", src.stem.en]]) {
    let p;
    if (c.section) {
      const i = lastLineStart(text, c.section[lang]); // 行頭の最後の出現 (設問文中の見出しを避ける)
      if (i < 0) throw new Error(`${c.source} ${lang}: section 見出し '${c.section[lang]}' が源 stem の行頭に無い (COPY 表 drift)`);
      p = text.slice(i).trim();
    } else {
      const i = text.indexOf(c.cut[lang]);
      if (i < 0) throw new Error(`${c.source} ${lang}: cut marker '${c.cut[lang]}' が源 stem に無い (COPY 表 drift)`);
      p = text.slice(0, i).trimEnd();
    }
    if (c.strip[lang]) p = p.replace(c.strip[lang], "").trimStart();
    if (nsp(p).length < PROBE_LEN) throw new Error(`${c.source} ${lang}: 前文が ${PROBE_LEN} 字未満`);
    probe[lang] = probeOf(p);
  }
  for (const id of members) owner.set(id, key);
  groups.push({ key, exam_id: exam, member_ids: [...members].sort(), probe, origin: "lightweight-copy D144s3", probe_source: c.source });
}

// ── D-120 groups.json との突き合わせ (raw / gitignored のため任意。差分は報告のみで fail しない) ──
const crosscheck = [];
if (existsSync(GROUPS_RAW)) {
  const raw = rj(GROUPS_RAW);
  const arr = Array.isArray(raw) ? raw : (raw.groups ?? Object.values(raw));
  const norm = (k) => k.replace(/-mq/, "-");
  const byNorm = new Map(arr.map((e) => [norm(e.group_id), e]));
  const matched = new Set();
  for (const g of groups) {
    const e = byNorm.get(norm(g.key));
    if (!e) continue;
    matched.add(norm(g.key));
    const a = [...g.member_ids].sort().join(","), b = [...(e.member_qids ?? [])].sort().join(",");
    crosscheck.push(a === b ? `= ${g.key} ↔ ${e.group_id}: member 一致 (${g.member_ids.length})` : `≠ ${g.key} ↔ ${e.group_id}: registry=[${a}] groups.json=[${b}]`);
  }
  for (const [k, e] of byNorm) if (!matched.has(k)) crosscheck.push(`? ${e.group_id}: registry に対応する組が無い (共有図のみの組 / key 命名差)`);
} else {
  crosscheck.push("skipped (data/ip/exams/groups.json absent — raw は gitignored)");
}

// ── 集計 + 書き出し ──
for (const g of groups) delete g._extracted;
const byOrigin = {};
for (const g of groups) {
  const o = (byOrigin[g.origin] ??= { groups: 0, members: 0 });
  o.groups++; o.members += g.member_ids.length;
}
const doc = {
  schema_version: 1,
  generated_by: "scripts/quiz-chumon-groups-build.mjs",
  purpose: "中問グループ登記簿。crosscheck A7 が「全メンバーの表示 stem (jp/zh/en) に組の前文 probe が含まれる」ことを検査する。",
  probe_rule: `前文を空白除去した先頭 ${PROBE_LEN} 字。検査側も stem を空白除去してから includes する。`,
  counts: { groups: groups.length, members: owner.size, by_origin: byOrigin },
  notes,
  groups,
};
const text = JSON.stringify(doc, null, 2) + "\n";

// 生成物の自己点検 (A7 と同じ判定を再現し、命中率を報告する)
let hit = 0; const miss = [];
for (const g of groups) {
  for (const id of g.member_ids) {
    const idx = probeIdx(g.exam_id, id, g.probe);
    ["jp", "zh", "en"].forEach((l, i) => { if (idx && idx[i] >= 0) hit++; else miss.push(`${id} ${l} (${g.key})`); });
  }
}
console.log(`chumon_groups: ${groups.length} 組 / ${owner.size} 問 — probe 命中 ${hit}/${hit + miss.length} (3 言語 × メンバー)`);
for (const n of notes) console.log(`  note: ${n}`);
for (const c of crosscheck) console.log(`  groups.json ${c}`);
for (const m of miss) console.log(`  ✗ miss: ${m}`);

const prev = existsSync(OUT) ? readFileSync(OUT, "utf-8") : null;
if (CHECK) {
  if (prev === text) { console.log(`= ${path.relative(ROOT, OUT)} は生成結果と一致`); process.exit(0); }
  console.error(`✗ ${path.relative(ROOT, OUT)} が生成結果と不一致 (${prev === null ? "ファイルなし" : "内容差"}) — 再生成してください`);
  process.exit(1);
}
if (prev === text) console.log(`= ${path.relative(ROOT, OUT)} 変更なし (冪等)`);
else { writeFileSync(OUT, text); console.log(`✓ ${path.relative(ROOT, OUT)} を${prev === null ? "作成" : "更新"}`); }
