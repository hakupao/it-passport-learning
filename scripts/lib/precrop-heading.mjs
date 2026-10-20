// S128 L1b (summary §7.1 #4): quiz-fidelity-prep-any.mjs --precrop の純粋ロジック (sharp / tesseract 非依存、node --test で検証)。
//   - pageParity     … 頁パリティ別の較正 (U7: 2022r04 の skip 15 頁中 14 が偶数頁。偶数頁は綴じ代で見出しが ~15〜20px 右)
//   - pickHeadMode   … 「行の最左インク x」分布から head/body モードを選ぶ (S123 のページ投票。従来 buildCrops 内にあった処理をそのまま移設)
//   - parseHeadingQnum / checkQnums … 見出し帯の題番号を OCR で読み、期待 qnum と照合 (U6 page-24: 個数一致で誤帯を切った)

/** `…/page-NN.png` → "odd" | "even" (頁番号が読めなければ null)。 */
export function pageParity(rel) {
  const m = /page-(\d+)\.png$/.exec(rel ?? "");
  return m ? (Number(m[1]) % 2 ? "odd" : "even") : null;
}

/** 10px bucket の度数 [[bucket, n], …] を度数降順で返す。 */
export function bucketModes(vals) {
  const h = {};
  for (const v of vals) { const b = Math.floor(v / 10) * 10; h[b] = (h[b] || 0) + 1; }
  return Object.entries(h).map(([k, v]) => [+k, v]).sort((a, b) => b[1] - a[1]);
}

/**
 * body = 行数最多の bucket、head = body より 20px 以上左の bucket のうち「見出し行数帯を持つページ数」(pageVotes) 最多 (同票は行数)。
 * 失敗時は { error } を返す (呼び側で全問 crop 省略)。
 */
export function pickHeadMode(pool, pageVotes, minPool = 50) {
  if (pool.length < minPool) return { error: "ページのインクが少なすぎて較正できない" };
  const modes = bucketModes(pool);
  const bodyMode = modes[0][0];
  const headCand = modes.filter(([k]) => k <= bodyMode - 20)
    .sort((a, b) => (pageVotes[b[0]] || 0) - (pageVotes[a[0]] || 0) || b[1] - a[1]);
  if (!headCand.length) return { error: "見出しモードを分離できない" };
  return { headMode: headCand[0][0], bodyMode, votes: headCand.slice(0, 3).map(([k, n]) => `${k}=${pageVotes[k] || 0}p/${n}r`).join(" ") };
}

/**
 * 頁パリティ側の較正を採るかどうか。パリティ側の head bucket が全体と違っても、その側の頁で全体の head bucket も
 * ほぼ同数の得票 (>= PARITY_KEEP_GLOBAL × 勝者) なら全体を使う。見出し x が bucket 境界 (例 x≈148) に跨ると
 * 140 / 150 がほぼ同票になり、パリティ側だけ 10px ずれて許容窓が動く (S128 実測 2018h30h: 偶数 150=17p / 140=16p で
 * page-38 が detected 5 / expected 3 に悪化)。綴じ代によるずれ (2022r04: 偶数頁で 150 の得票 0) は従来どおりパリティ側を採る。
 */
export const PARITY_KEEP_GLOBAL = 0.8;
export function chooseParityCalib(global, parity, parityVotes) {
  if (parity.error) return { ...global, fallback: parity.error };
  if (parity.headMode === global.headMode) return parity;
  const win = parityVotes[parity.headMode] || 0, glob = parityVotes[global.headMode] || 0;
  if (win > 0 && glob >= PARITY_KEEP_GLOBAL * win) return { ...global, fallback: `global head ${global.headMode} has ${glob}p vs ${parity.headMode}=${win}p on this parity` };
  return parity;
}

/**
 * tesseract (jpn, psm 7) の見出し帯 OCR 文字列から題番号を取る。
 * 見出しは「問NN」で始まるので、**先頭 3 字以内に始まる数字群**だけを採る (「問9 2…」は 9)。「問」字自体は「間」「同」「向」「闘」
 * 「則」「癌」などに誤読されるので字は問わない (S128 実測)。先頭に数字が無い読み (「〔ストラ…」= 節見出しの誤検出、空文字) は null。
 */
export function parseHeadingQnum(text) {
  const m = /^\D{0,3}?(\d{1,3})/.exec(String(text ?? "").trim());
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 ? n : null;
}

/**
 * 源の書体で tesseract が系統的に取り違える数字の組 (S128 実測: 2022r04 で「0」→「9」×5「6」×1、「3」→「8」×1)。
 * 桁数が同じで、各桁が一致するかこの組に入るなら「同じ番号の誤読」とみなす。
 * 誤帯 (U6 page-24 = 全見出しが 1 ずれ) は 51↔52 のように組外の桁差になるので検出は保たれる。
 */
const CONFUSABLE = new Set(["0:9", "0:6", "3:8"].flatMap((p) => [p, p.split(":").reverse().join(":")]));
export function sameQnum(found, expected) {
  const a = String(found), b = String(expected);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && !CONFUSABLE.has(`${a[i]}:${b[i]}`)) return false;
  return true;
}

/**
 * found[i] と expected[i] を照合。
 * verified = 一致 (誤読組も含む)、exact = 完全一致、mismatches = 期待と違う番号 (誤帯の疑い。番号差の大小は問わない:
 * bank の page_image が 2 頁以上ずれていても個数は一致しうる)、unconfirmed = 先頭に数字が読めない (null) = 見出しであること自体が未確認。
 * ok は mismatches も unconfirmed も 0 のとき (S128 実測: 個数一致のまま 〔ストラテジ系〕 節見出し 2 本を見出しと誤検出した頁 = 2009h21a page-39)。
 * 桁落ち (「問1」= 問11) も不一致 = 安全側 skip になるが、OCR の 3 段 cascade 後の全 29 exam 実測では 0 件。
 */
export function checkQnums(found, expected) {
  if (found.length !== expected.length) return { ok: false, mismatches: [], verified: 0, exact: 0, unconfirmed: 0, reason: "length" };
  const mismatches = [];
  let verified = 0, exact = 0, unconfirmed = 0;
  found.forEach((f, i) => {
    if (f === null) { unconfirmed++; return; }
    const e = expected[i];
    if (f === e) { verified++; exact++; } else if (sameQnum(f, e)) verified++;
    else mismatches.push({ i, found: f, expected: e });
  });
  return { ok: mismatches.length === 0 && unconfirmed === 0, mismatches, verified, exact, unconfirmed };
}
