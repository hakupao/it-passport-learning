// S128 L1a: quiz-fidelity-machdiff.mjs の回帰テスト (⑨ #6 / #25 / 0b)。CLI を spawn して出力行と exit を検査する。
// fixture (quiz-fidelity-machdiff.fixtures.json) は各 unit の manifest (pre) と現行出荷層 (post) と agent audit から機械抽出した実データ。
// Run (apps/web の vitest を借りる。config は apps/web/src 限定なので --root で scripts を指す、--globals で import 不要):
//   node apps/web/node_modules/vitest/vitest.mjs run --root scripts --globals quiz-fidelity-machdiff
// 旧版との比較: MACHDIFF_SCRIPT=<旧 machdiff.mjs の絶対パス> を付けて同じコマンド。
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = process.env.MACHDIFF_SCRIPT || path.join(here, "quiz-fidelity-machdiff.mjs");
const FX = JSON.parse(readFileSync(path.join(here, "quiz-fidelity-machdiff.fixtures.json"), "utf-8"));
const dir = mkdtempSync(path.join(tmpdir(), "machdiff-test-"));
let n = 0;

/** cases: [[id, "pre"|"post", mutate?]] → { out, code, missed[], counts{} } */
const run = (cases) => {
  const samples = [], audits = [];
  for (const [id, state, mutate] of cases) {
    // state === "raw": id は { sample, audit } の直接指定 (fixture に無い合成ケース)
    const fx = state === "raw" ? { raw: { ...id.sample }, audit: id.audit } : structuredClone(FX[id]); const s = fx[state]; const a = structuredClone(fx.audit);
    if (mutate) mutate(s, a);
    samples.push(s); audits.push(a);
  }
  const k = n++; const inp = path.join(dir, `in${k}.json`), res = path.join(dir, `res${k}.json`);
  writeFileSync(inp, JSON.stringify({ samples })); writeFileSync(res, JSON.stringify({ audits }));
  const p = spawnSync("node", [SCRIPT, inp, res], { encoding: "utf-8" });
  const out = p.stdout;
  const missed = [...out.matchAll(/✗ AGENT_MISSED (\S+) (\S+)/g)].map((m) => `${m[1]} ${m[2]}`);
  const summary = (out.match(/^machdiff: .*$/m) ?? [""])[0];
  const counts = Object.fromEntries([...summary.matchAll(/([A-Za-z_∩]+)=(\d+)/g)].map((m) => [m[1], Number(m[2])]));
  return { out, code: p.status, missed, counts };
};

describe("出力契約 (既存の grep を壊さない)", () => {
  it("summary 行の先頭トークン順は旧版のまま", () => {
    const r = run([["2021r03-q011", "post"]]);
    expect(r.out).toMatch(/^machdiff: fields same=\d+ \| AGENT_MISSED=\d+ \| VERDICT_CONFLICT=\d+ \| audits w\/o transcript=\d+ \| UNREADABLE skipped=\d+ \| coverage \d+\/\d+/m);
  });
});

describe("⑨ #6 (b) replay artifact: 是正後の再 machdiff で patch を当て直さない", () => {
  it("2021r03-q011 ア (current_text が是正後テキストの接頭辞) は MISSED にならない", () => {
    const r = run([["2021r03-q011", "post"]]);
    expect(r.missed).toEqual([]); expect(r.code).toBe(0);
  });
  it("2022r04-q100 ア〜エ (句点付加の是正後) は MISSED にならない", () => {
    const r = run([["2022r04-q100", "post"]]);
    expect(r.missed).toEqual([]);
  });
  it("2023r05-q092 ウ 是正後 (“@”) は MISSED にならない", () => {
    expect(run([["2023r05-q092", "post"]]).missed).toEqual([]);
  });
});

describe("⑨ #6 (a) 空虚な一致: agent 計上 field を same から分離", () => {
  it("2019r01a-q016 イ 事前: patch で一致した field は REPORTED (whole-field) に入り same に入らない", () => {
    const r = run([["2019r01a-q016", "pre"]]);
    expect(r.missed).toEqual([]);
    expect(r.counts.REPORTED).toBe(1);
    expect(r.out).toMatch(/REPORTED=1 \(whole-field 1\)/);
    expect(r.counts.same).toBe(4); // stem + ア/ウ/エ
  });
  it("2019r01a-q016 イ 事後: 素で一致するので same", () => {
    const r = run([["2019r01a-q016", "post"]]);
    expect(r.counts.same).toBe(5); expect(r.counts.REPORTED).toBe(0);
  });
  it("2023r05-q092 ウ 事前: current_text と表示の空白差でも正規化空間で patch が当たる (REPORTED)", () => {
    const r = run([["2023r05-q092", "pre"]]);
    expect(r.missed).toEqual([]); expect(r.counts.REPORTED).toBe(1);
    expect(r.counts.QUOTE_ASCII).toBe(0); // agent が計上して直す ASCII は 0b に重ねて立てない
  });
  it("2019h31h-q034 事前: field 全文 patch は REPORTED (whole-field)", () => {
    const r = run([["2019h31h-q034", "pre"]]);
    expect(r.missed).toEqual([]); expect(r.out).toMatch(/whole-field 1/);
  });
  it("2019h31h-q034 事後: markdown 表ヘッダ行の差は既知残差として MISSED に残る (U3b §8a、許容しない)", () => {
    expect(run([["2019h31h-q034", "post"]]).missed).toEqual(["2019h31h-q034 stem"]);
  });
});

describe("⑨ #6 (d) 表ブロック除外の散文連結比較", () => {
  it("2015h27a-q009: 段落の分割位置が表の前後で違うだけ → LAYOUT", () => {
    const r = run([["2015h27a-q009", "pre"]]);
    expect(r.missed).toEqual([]); expect(r.counts.LAYOUT).toBe(1);
  });
  it("2026r08-q074: 問文が表の後ろ (源は前) → LAYOUT", () => {
    const r = run([["2026r08-q074", "pre"]]);
    expect(r.missed).toEqual([]); expect(r.counts.LAYOUT).toBe(1);
  });
  it("表のセルが 1 つ違えば LAYOUT にならず MISSED", () => {
    const r = run([["2015h27a-q009", "pre", (s) => { s.displayed_stem_jp = s.displayed_stem_jp.replace("| 価格面 | 5 | 4 |", "| 価格面 | 5 | 9 |"); }]]);
    expect(r.missed).toEqual(["2015h27a-q009 stem"]);
  });
  it("散文の語が 1 つ違えば LAYOUT にならず MISSED", () => {
    const r = run([["2026r08-q074", "pre", (s) => { s.displayed_stem_jp = s.displayed_stem_jp.replace("セルB5に入力する式", "セルC5に入力する式"); }]]);
    expect(r.missed).toEqual(["2026r08-q074 stem"]);
  });
});

describe("⑨ #6 (c) 既知偽陽性型の許容リスト", () => {
  it("2026r08-q072: 表見出しの（主キー）（外部キー）注記 = 描画補助 → KNOWN_FP", () => {
    const r = run([["2026r08-q072", "pre"]]);
    expect(r.missed).toEqual([]); expect(r.out).toMatch(/~ KNOWN_FP 2026r08-q072 stem \[描画補助:キー注記\]/);
  });
  it("2026r08-q072 事後: 正規化空間で no-op になる patch (「」→“”) が表構造を壊さず KNOWN_FP のまま", () => {
    const r = run([["2026r08-q072", "post"]]);
    expect(r.missed).toEqual([]); expect(r.counts.KNOWN_FP).toBe(1);
  });
  it("2026r08-q072: 注記以外の差 (列名違い) は KNOWN_FP で隠れない", () => {
    const r = run([["2026r08-q072", "post", (s) => { s.displayed_stem_jp = s.displayed_stem_jp.replace("| 残高 |", "| 預金残高 |"); }]]);
    expect(r.missed).toEqual(["2026r08-q072 stem"]);
  });
  it("2019h31h-q053: 肢の組合せ表を agent が題幹に [表] で転記 → KNOWN_FP", () => {
    const r = run([["2019h31h-q053", "post"]]);
    expect(r.missed).toEqual([]); expect(r.counts.KNOWN_FP).toBe(1);
  });
  it("Rule D NIT-1 A6c: [表] 行に散文が同居していれば 肢の表 規則で消さない → MISSED", () => {
    const r = run([[{ sample: { id: "x1", displayed_stem_jp: "次の組合せはどれか。", displayed_choices_jp: {} },
      audit: { id: "x1", verdict: "CLEAN", discrepancies: [], source_transcript: { stem: "次の組合せはどれか。\n[表] ア: 甲 イ: 乙 正しいのは", choices: {} } } }, "raw"]]);
    expect(r.missed).toEqual(["x1 stem"]);
  });
  it("adv A11: 「| - | - |」は区切り行ではなくデータ行として比較する", () => {
    const r = run([[{ sample: { id: "x1", displayed_stem_jp: "| a | b |\n|---|---|\n| - | - |\n| 1 | 2 |", displayed_choices_jp: {} },
      audit: { id: "x1", verdict: "CLEAN", discrepancies: [], source_transcript: { stem: "| a | b |\n|---|---|\n| 1 | 2 |", choices: {} } } }, "raw"]]);
    expect(r.missed).toEqual(["x1 stem"]);
  });
  it("2019h31h-q052: 表示層の一行化「a：X　b：Y」と transcript の [表] a: X, b: Y は同一", () => {
    const r = run([["2019h31h-q052", "pre"]]);
    expect(r.missed).toEqual([]);
  });
  it("Rule D MAJOR-1: 2017h29a-q092 ア (R/W/X が 3 組) で所有者 W:○→W:ー の 1 箇所違いは MISSED (重複キーで上書きしない)", () => {
    const disp = "[表] 所有者 R:○ W:○ X:○ ／ 所有者と同じグループの利用者 R:○ W:○ X:○ ／ その他の利用者 R:ー W:ー X:○"; // 2017h29a-q092 ア (s7x manifest)
    const r = run([[{ sample: { id: "2017h29a-q092", displayed_stem_jp: "x", displayed_choices_jp: { ア: disp } },
      audit: { id: "2017h29a-q092", verdict: "CLEAN", discrepancies: [], source_transcript: { stem: "x", choices: { ア: disp.replace("所有者 R:○ W:○", "所有者 R:○ W:ー") } } } }, "raw"]]);
    expect(r.missed).toEqual(["2017h29a-q092 choice.ア"]); expect(r.code).toBe(1);
  });
  it("Rule D MAJOR-1: 同じ 1 字キーの再出現 (a: … a: …) も番号付きで両方比較", () => {
    const r = run([[{ sample: { id: "x1", displayed_stem_jp: "x", displayed_choices_jp: { ア: "[表] a: 甲, b: 乙, a: 丙" } },
      audit: { id: "x1", verdict: "CLEAN", discrepancies: [], source_transcript: { stem: "x", choices: { ア: "[表] a: 丁, b: 乙, a: 丙" } } } }, "raw"]]);
    expect(r.missed).toEqual(["x1 choice.ア"]);
  });
  it("2019h31h-q052: 一行化でも a/b の値の入替は MISSED (MAJOR-1 の束縛比較を保つ)", () => {
    const r = run([["2019h31h-q052", "pre", (s) => { s.displayed_choices_jp.ア = "a：信頼性　b：サービスデスク　c：データ管理"; }]]);
    expect(r.missed).toEqual(["2019h31h-q052 choice.ア"]);
  });
});

describe("⑨ #25 截断引用 / transcript 截断 (PREFIX 許容)", () => {
  it("2022r04-q006: transcript が題幹 1 文目で切れている → 裁定済 TRANSCRIPT_PREFIX (U7 §3)、exit 0", () => {
    const r = run([["2022r04-q006", "pre"]]);
    expect(r.missed).toEqual([]); expect(r.counts.TRANSCRIPT_PREFIX).toBe(0); expect(r.out).toMatch(/adjudicated 1/); expect(r.code).toBe(0);
  });
  it("2023r05-q041: 図の文本化が transcript の後ろに続く → 裁定済 TRANSCRIPT_PREFIX (U8 §3)", () => {
    const r = run([["2023r05-q041", "pre"]]);
    expect(r.missed).toEqual([]); expect(r.out).toMatch(/~ TRANSCRIPT_PREFIX 2023r05-q041 stem: adjudicated/); expect(r.code).toBe(0);
  });
  it("Rule D MINOR-2: 裁定外の TRANSCRIPT_PREFIX は exit 1 (q006 の超過字数が変われば裁定も外れる)", () => {
    const r = run([["2022r04-q006", "pre", (s) => { s.displayed_stem_jp += "\n問7 次の記述"; }]]);
    expect(r.out).toMatch(/✗ TRANSCRIPT_PREFIX 2022r04-q006 stem/); expect(r.counts.TRANSCRIPT_PREFIX).toBe(1); expect(r.code).toBe(1);
  });
  it("round 2 NIT-A: 超過字数が同じでも超過部分の中身が違えば裁定から外れ exit 1 (先頭 24 字 + sha1 照合)", () => {
    const r = run([["2022r04-q006", "pre", (s) => { s.displayed_stem_jp = s.displayed_stem_jp.replace("回収できる。", "回避できる。"); }]]);
    expect(r.out).toMatch(/✗ TRANSCRIPT_PREFIX 2022r04-q006 stem/); expect(r.out).toMatch(/\(\+96\)/); expect(r.code).toBe(1);
  });
  it("Rule D MAJOR-2 A4b: 截断引用 source が transcript の一部でも、引用外に残差があれば MISSED", () => {
    const r = run([[{ sample: { id: "x1", displayed_stem_jp: "ABCDEFGHIJ", displayed_choices_jp: {} },
      audit: { id: "x1", verdict: "DISCREPANT", source_transcript: { stem: "ABCDEFGHIX", choices: {} }, discrepancies: [{ field: "stem", current_text: "ABCDEFGHIJ", source_text: "ABC" }] } }, "raw"]]);
    expect(r.missed).toEqual(["x1 stem"]); expect(r.code).toBe(1);
  });
  it("Rule D MAJOR-2 A4: 引用 (可用姓→可用性) の外で未計上の 1 語入替 (正しい→適切な) は MISSED", () => {
    const r = run([[{ sample: { id: "x1", displayed_stem_jp: "情報セキュリティの三要素は機密性、完全性、可用姓である。正しいものはどれか。", displayed_choices_jp: {} },
      audit: { id: "x1", verdict: "DISCREPANT", source_transcript: { stem: "情報セキュリティの三要素は機密性、完全性、可用性である。適切なものはどれか。", choices: {} },
        discrepancies: [{ field: "stem", current_text: "情報セキュリティの三要素は機密性、完全性、可用姓である。正しいものはどれか。", source_text: "可用性" }] } }, "raw"]]);
    expect(r.missed).toEqual(["x1 stem"]); expect(r.code).toBe(1);
  });
  it("Rule D MINOR-1 A5: transcript が表示と同一なのに agent が差分を計上 → ✗ REPORTED_BUT_TRANSCRIPT_EQUALS_DISPLAYED、exit 1", () => {
    const r = run([[{ sample: { id: "x1", displayed_stem_jp: "可用姓である。", displayed_choices_jp: {} },
      audit: { id: "x1", verdict: "DISCREPANT", source_transcript: { stem: "可用姓である。", choices: {} }, discrepancies: [{ field: "stem", current_text: "可用姓", source_text: "可用性" }] } }, "raw"]]);
    expect(r.out).toMatch(/✗ REPORTED_BUT_TRANSCRIPT_EQUALS_DISPLAYED x1 stem/); expect(r.code).toBe(1);
  });
  it("A5 の判定は是正後 replay (source が表示に入っている) では立たない (2021r03-q011 事後)", () => {
    const r = run([["2021r03-q011", "post"]]);
    expect(r.counts.REPORTED_BUT_TRANSCRIPT_EQUALS_DISPLAYED).toBe(0); expect(r.code).toBe(0);
  });
  it("2022r04-q012 事前: source_text が題幹 1 文目だけ → patch で REPORTED / 事後 → same", () => {
    expect(run([["2022r04-q012", "pre"]]).counts.REPORTED).toBe(1);
    const post = run([["2022r04-q012", "post"]]);
    expect(post.missed).toEqual([]); expect(post.counts.REPORTED).toBe(0);
  });
  it("2018h30h-q096 変形: current_text が field 全文で source_text が 1 文目だけ → REPORTED_TRUNCATED_QUOTE", () => {
    const r = run([["2018h30h-q096", "pre", (s, a) => { a.discrepancies[0].current_text = s.displayed_stem_jp; }]]);
    expect(r.missed).toEqual([]); expect(r.counts.REPORTED_TRUNCATED_QUOTE).toBe(1);
  });
  it("2025r07-q005: 截断引用でも差が正規化で消える型 (「」→“”) は same∩reported", () => {
    const r = run([["2025r07-q005", "pre"]]);
    expect(r.missed).toEqual([]); expect(r.counts["same∩reported"]).toBe(1);
  });
  it("見出し混入 (2022r04-q001「問1 」= displayed の頭に余計な語) は接頭辞許容の対象外 → MISSED", () => {
    expect(run([["2022r04-q001", "pre"]]).missed).toEqual(["2022r04-q001 stem"]);
  });
  it("displayed が短い (末尾欠落、未計上) は MISSED (2021r03-q011 ア 事前で agent 計上を外す)", () => {
    const r = run([["2021r03-q011", "pre", (s, a) => { a.discrepancies = []; a.verdict = "DISCREPANT"; }]]);
    expect(r.missed).toEqual(["2021r03-q011 choice.ア"]);
  });
  it("transcript が文の途中で切れている場合は TRANSCRIPT_PREFIX にしない", () => {
    const r = run([["2022r04-q006", "pre", (s, a) => { a.source_transcript.stem = a.source_transcript.stem.slice(0, 30); }]]);
    expect(r.missed).toEqual(["2022r04-q006 stem"]);
  });
});

describe("実残差は従来どおり MISSED (回帰の盾)", () => {
  it("2022r04-q017 イ「業務に→業務で」/ 2026r08-q078 ウ「キャリアグリゲ」→ MISSED、exit 1", () => {
    const r = run([["2022r04-q017", "pre"], ["2026r08-q078", "pre"]]);
    expect(r.missed).toEqual(["2022r04-q017 choice.イ", "2026r08-q078 choice.ウ"]); expect(r.code).toBe(1);
  });
});

describe("0b: 表示 ASCII \" vs transcript “” の別判定 (D-151 を退行させない)", () => {
  it("2026r08-q025 事前: 表示 \"ビッグデータ\" → QUOTE_ASCII (exit には影響しない)", () => {
    const r = run([["2026r08-q025", "pre"]]);
    expect(r.out).toMatch(/! QUOTE_ASCII 2026r08-q025 stem/); expect(r.counts.QUOTE_ASCII).toBe(1);
    expect(r.missed).toEqual([]); expect(r.code).toBe(0);
  });
  it("agent が ASCII \" を含む差分を計上済の field は (段 1 の same 経路でも) 立てない", () => {
    const r = run([["2026r08-q025", "pre", (s, a) => {
      a.verdict = "DISCREPANT";
      a.discrepancies = [{ field: "stem", current_text: "\"ビッグデータ\"", source_text: "“ビッグデータ”" }];
    }]]);
    expect(r.counts.QUOTE_ASCII).toBe(0); expect(r.counts["same∩reported"]).toBe(5 - 4); // stem のみ計上 (choices 4 は未計上の same)
  });
  it("2026r08-q025 事後 (“” に是正済) → QUOTE_ASCII 0", () => {
    expect(run([["2026r08-q025", "post"]]).counts.QUOTE_ASCII).toBe(0);
  });
  it("表示 “” / transcript が ASCII \" (agent 側の表記) → 立てない", () => {
    const r = run([["2026r08-q025", "post", (s, a) => { a.source_transcript.stem = a.source_transcript.stem.replace(/[“”]/g, "\""); }]]);
    expect(r.counts.QUOTE_ASCII).toBe(0); expect(r.missed).toEqual([]);
  });
});
