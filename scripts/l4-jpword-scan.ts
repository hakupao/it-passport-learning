#!/usr/bin/env node
// Track L step L4-b (docs/phase5/PLAN_hosting_migration.md §3) — READ-ONLY: Japanese-only / Japanese-sense kanji words
// and Japanese glyph forms inside zh fields (the kana scanner of L2 cannot see them). Proposal only: writes nothing
// but evidence/phase5/hosting/L4b_hits.json (--write) or prints a KWIC listing (--kwic [word…]).
//
// Nets (evidence/phase5/hosting/L4b_wordlist.md has the keep / drop reasons):
//   word  — WORDS below (simplified spelling; compound regexes where the stem is an ordinary Chinese substring)
//   glyph — Han characters outside GB2312 (decoded from GBK B0A1–F7FE) = Japanese / traditional forms
// Scope: zh members of content groups (scripts/l4-lib.ts = the L2 field classes; derived compat fields skipped),
// text inside [[jp:…]] masked. Sources: textbook-units, textbook-index, quiz-translations, quiz-explanations, ui-messages.
// Each hit is judged by JUDGE (first matching rule, per occurrence): LEAK (with the replacement), OK, UNSURE.
// Run: node scripts/l4-jpword-scan.ts [--write | --kwic [word…]]

import { writeFileSync } from "node:fs";
import path from "node:path";

import { collect, maskJp, ROOT, type Group } from "./l4-lib.ts";

/** Kept words: id = what the word list calls it, re = the occurrence regex (on the [[jp:]]-masked zh text). */
export const WORDS: { w: string; re: RegExp; jaSibling?: RegExp }[] = [
  { w: "正解", re: /正解/gu },
  { w: "立案", re: /立案/gu },
  { w: "分野", re: /分野/gu },
  { w: "正答", re: /正答/gu },
  { w: "过去问", re: /过去问/gu },
  { w: "要件", re: /要件/gu },
  { w: "担当", re: /担当(?:者|人员)?/gu },
  { w: "案件", re: /(?<!提)案件/gu },
  { w: "作成者", re: /作成者/gu },
  { w: "部署(日本語の意味)", re: /部署/gu, jaSibling: /部署/u },
  { w: "社员", re: /社员/gu },
  { w: "检讨", re: /检讨/gu },
  { w: "提携", re: /提携/gu },
  { w: "实装", re: /实装/gu },
  { w: "结合测试", re: /结合测试/gu },
  { w: "单体测试", re: /单体测试/gu },
  { w: "试作", re: /试作(?!业)/gu },
  { w: "多重化", re: /多重化/gu },
  { w: "二重化", re: /二重化/gu },
  { w: "指摘", re: /指摘/gu },
  { w: "误答", re: /(?<!错)误答/gu },
  { w: "利用者", re: /利用者/gu },
  { w: "责任者", re: /责任者/gu },
  { w: "事业者", re: /事业者/gu },
  { w: "满足度", re: /满足度/gu },
  { w: "不正(竞争防止法)", re: /不正(?![当常确规对])/gu },
  { w: "个人番号", re: /个人番号|番号法/gu },
  { w: "利害关系者", re: /利害关系者/gu },
  { w: "景品", re: /景品/gu },
  { w: "株式", re: /株式/gu },
  { w: "会社", re: /会社/gu },
  { w: "役员", re: /役员/gu },
  { w: "下请", re: /下请/gu },
  { w: "独占禁止", re: /独占禁止/gu },
  { w: "内制", re: /内制(?![造定作冷])/gu },
  { w: "生体认证", re: /生体认证/gu },
  { w: "记忆装置", re: /记忆装置/gu },
  { w: "受注", re: /(?<!接)受注/gu },
  { w: "引当", re: /(?<!指)引当(?!场)/gu },
  { w: "受入", re: /(?<!免)受入(?!侵)/gu },
  { w: "工数", re: /(?<![加员人])工数/gu },
  // kept, simplified spelling, 0 hits at S154 (the gate keeps watching them)
  ...["见积", "纳期", "纳品", "发注", "缔切", "仕组", "组入", "届出", "配列", "构造体", "文字列", "二分木", "木构造", "分岐",
    "曜日", "选择肢", "受验", "配点", "满点", "大切", "配虑", "卖上", "卸卖", "贩路", "棚卸", "出荷", "入荷", "部品", "工场", "残业", "出张", "课长", "割赋",
    "贷借对照", "偿却", "初期化", "信赖性", "真正性", "否认防止", "电话番号", "携带电话", "情报处理", "个人情报", "暗号化", "论理回路", "制御", "回线", "稼动"].map((w) => ({ w, re: new RegExp(w, "gu") })),
];

const gbk = new TextDecoder("gbk");
export const GB2312 = new Set<string>();
for (let a = 0xb0; a <= 0xf7; a++)
  for (let b = 0xa1; b <= 0xfe; b++) {
    const s = gbk.decode(new Uint8Array([a, b]));
    if (s.length === 1) GB2312.add(s);
  }
const HAN = /\p{Script=Han}/u;

export type Cls = "LEAK" | "OK" | "UNSURE";
export type Hit = {
  id: string;
  source: string;
  file: string;
  path: string;
  net: "word" | "glyph";
  word: string;
  match: string;
  index: number;
  classification: Cls;
  reason: string;
  family?: string;
  needs_jp_marker?: boolean;
  l4c?: boolean;
  proposed?: { before: string; after: string; occurrences_of_before_in_field: number } | null;
  zh_context: string;
  ja_sibling: string | null;
};
type Ctx = { word: string; net: "word" | "glyph"; m: string; pre: string; post: string; path: string; source: string; file: string; ja: string };
type Verdict = { cls: Cls; reason: string; to?: string; back?: number; len?: number; family?: string; marker?: boolean; l4c?: boolean };

const isHook = (c: Ctx) => /hook_zh$/.test(c.path);
const quoted = (c: Ctx) => /[（(「“『"《]\s*$/.test(c.pre) || /^\s*[)）」”』"》]/.test(c.post) || /(日语|日文|日本语)[^。，]{0,12}$/.test(c.pre);

/** Per-occurrence judgments (first rule whose test passes). */
const JUDGE: { word: string; test?: (c: Ctx) => boolean; v: Verdict | ((c: Ctx) => Verdict) }[] = [
  // ---- glyph net ----
  { word: "glyph", test: isHook, v: { cls: "OK", reason: "記憶 hook の日本語の語・字の分解 (D-195 §6 の意図どおり)。L4-c で [[jp:]] を付ける", l4c: true } },
  { word: "glyph", test: (c) => c.source === "ui-messages", v: { cls: "OK", reason: "D-189 の三言語共通の日本語ラベル (siteName / 問 / 解説 / 用語 / 頻出度) と Locale 名" } },
  { word: "glyph", test: (c) => /pairs\[0\]\.rows\[3\]/.test(c.path), v: { cls: "OK", reason: "行見出し「日语中的别称」= 意図した日本語の別称。[[jp:]] の印が無いだけ (L3 Task A 付記)", marker: true } },
  { word: "glyph", test: (c) => /^瞭/.test(c.m) || /瞭望/.test(c.pre.slice(-1) + c.m + c.post.slice(0, 1)), v: { cls: "OK", reason: "瞭望 の 瞭 は《通用规范汉字表》(2013) の規範字 (GB2312 外というだけ)" } },
  { word: "glyph", test: (c) => /detail_zh$/.test(c.path), v: { cls: "OK", reason: "本文が日本語の語そのものを説明している (日语的“手続” / 日语名称中的“拡張”)。D-202 の約定では [[jp:]] が望ましい", marker: true } },
  { word: "glyph", test: (c) => /驹込/.test(c.m), v: { cls: "OK", reason: "題目の住所 (本駒込、地名)" } },
  { word: "glyph", test: (c) => c.m.includes("栃"), v: { cls: "OK", reason: "地名 栃木县 (中国語でも 栃 を使う)" } },
  { word: "glyph", test: (c) => c.m.includes("〇"), v: { cls: "OK", reason: "〇 (U+3007) は中国語でも使う伏せ字・記号。2024r06 は擬似言語の型宣言の記号 (題目のまま)" } },
  { word: "glyph", test: (c) => c.m.includes("葉") || c.m.includes("鈴"), v: { cls: "OK", reason: "題目のデータ (LIKE パターン「%葉_」と照合対象の氏名)。日本字形のままでなければ問題が成り立たない" } },
  { word: "glyph", test: (c) => c.m === "報告", v: { cls: "LEAK", reason: "同じ題の訳 (stem / 選択肢) と他の解説欄は「报告_」。この欄だけ日本字形", to: "报告", family: "2013h25a-q094 file-name rule" } },
  { word: "glyph", test: (c) => /稟议/.test(c.m), v: { cls: "UNSURE", reason: "日本語原語「稟議」を半分だけ簡体字にした混成字形 (稟议)。引用なら「稟議」、訳なら「审批」に寄せる", family: "2014h26h 稟議" } },
  { word: "glyph", test: (c) => quoted(c) || /日语|日文/.test(c.pre.slice(-16) + c.m), v: { cls: "OK", reason: "括弧・引用・「日语称…」で示した日本語原語 (quiz sidecar の約定 = 括弧原語)" } },
  { word: "glyph", test: (c) => /稟議/.test(c.m) || /制組織/.test(c.m), v: { cls: "OK", reason: "括弧・引用の日本語原語 (stem の内部審批（稟議）系统 / 「カンパニ制組織」)" } },
  // ---- word net ----
  { word: "正解", test: (c) => c.source === "ui-messages", v: { cls: "OK", reason: "D-189 の三言語共通の日本語ラベル (70978b70 の一覧に 正解 がある)" } },
  { word: "正解", test: (c) => c.source === "textbook-units", v: { cls: "OK", reason: "「没有唯一正解」= 中国語として自然な言い方 (标准答案 の意味の 正解)。試験の答の意味ではない" } },
  { word: "正解", v: { cls: "LEAK", reason: "日本語の 正解 (中国語は 正确答案)。S86 で UI を直した前例、L3 B39。同じ sidecar は「正确答案是 / 为」を 1,974 欄で使う", to: "正确答案", family: "quiz 解説 正解" } },
  { word: "立案", v: (c) => ({
    cls: "LEAK",
    reason: "日本語の 立案 (計画を作る)。中国語の 立案 は「事件として受理する」の意味 (L3)",
    ...(/企划$/.test(c.pre) ? { to: "策划", back: 2 } : { to: /企划、$|进行$/.test(c.pre) ? "规划" : "制定" }),
    family: "立案",
  }) },
  { word: "正答", test: (c) => c.source === "ui-messages", v: { cls: "LEAK", reason: "日本語の 正答率。D-189 のラベル一覧に無い。中国語は 正确率 (zh.json の他の文言も「答对」「答错」)", to: "正确", family: "zh.json 正答率" } },
  { word: "过去问", v: { cls: "UNSURE", reason: "日本語の 過去問 の簡体字化 (中国語は 真题 / 历年真题)。サイト名「過去問ノート」(D-189) と同じ語なので、製品用語として残すかは方針判断", family: "zh.json 过去问" } },
  { word: "要件", test: (c) => /系统$/.test(c.pre), v: { cls: "LEAK", reason: "日本語の システム要件 (= 需求)。中国語の 要件 は法律の構成要件の意味", to: "需求", family: "要件 (非法律)" } },
  { word: "要件", test: (c) => /选定$/.test(c.pre), v: { cls: "UNSURE", reason: "題目の見出し〔選定条件〕相当の訳。中国語なら 选定条件。題目の他の欄と揃えて直すか判断", family: "要件 (非法律)" } },
  { word: "要件", v: { cls: "OK", reason: "法律用語の 要件 (构成要件 / 成立要件 / 商业秘密三要件) は中国語でも同じ。OSS・RPA 等の「条件」の意味も中国語の 要件 (重要条件) として通じる" } },
  { word: "担当", test: (c) => c.m === "担当者", v: (c) => ({ cls: "LEAK", reason: "日本語の 担当者 (中国語は 负责人 / 经办人)", to: "负责人", family: /事务$|财务$/.test(c.pre) ? "2014h26a 事務・財務担当者 (stem・選択肢・解説で一括)" : "担当者" }) },
  { word: "担当", test: (c) => c.m === "担当人员", v: (c) => ({ cls: "LEAK", reason: "日本語の 担当 (中国語は 工作人员 / 经办人员)", to: "工作人员", family: "担当者" }) },
  { word: "担当", test: (c) => /运维$/.test(c.pre.trim()), v: { cls: "LEAK", reason: "日本語の 〜担当 (中国語は 〜负责人)", to: "负责人", family: "担当者" } },
  { word: "担当", v: { cls: "OK", reason: "中国語の動詞 担当 (担任・承担: 由…来担当 / 所担当的角色)" } },
  { word: "案件", test: (c) => /非法访问|相关的$/.test(c.pre), v: { cls: "OK", reason: "中国語の 案件 (法律上の事件)" } },
  { word: "案件", test: (c) => /未结|搁置的$|全部$/.test(c.pre), v: { cls: "UNSURE", reason: "事件管理・窓口の「受け付けた件」の意味の 案件。中国語でも 案件 = 処理中の事件 として通じるが、工单 / 事项 の方が自然" } },
  { word: "案件", test: (c) => /理解$/.test(c.pre), v: { cls: "LEAK", reason: "日本語の 案件 (審議に掛かった事柄)。中国語は 事项", to: "事项", family: "案件 (日本語の意味)" } },
  { word: "案件", test: (c) => /本次$/.test(c.pre), v: { cls: "LEAK", reason: "日本語の 案件 (今回の仕事)。中国語は 项目", to: "项目", family: "案件 (日本語の意味)" } },
  { word: "案件", v: { cls: "LEAK", reason: "日本語の 案件 (営業の商談・引合い)。中国語の 案件 は法律上の事件。SFA の文脈は 商机", to: "商机", family: "案件 (日本語の意味)" } },
  { word: "作成者", v: { cls: "LEAK", reason: "日本語の 作成者氏名。同じ題の解説 q094 は「编写者姓名」", to: "编写者", family: "2013h25a 作成者" } },
  { word: "部署(日本語の意味)", v: { cls: "LEAK", reason: "日本語の 部署 (= 部门)。中国語の 部署 は「配置する・デプロイ」。題目の表名・列名ごと 社员 と一括で 部门 に (stem・選択肢・解説)", to: "部门", family: "2010h22a-q087 表名 (社員・部署)" } },
  { word: "社员", v: { cls: "LEAK", reason: "日本語の 社員 (= 员工)。中国語の 社员 は人民公社・合作社の成員。題目の表名・列名ごと一括で 员工 に", to: "员工", family: "2010h22a-q087 表名 (社員・部署)" } },
  { word: "检讨", test: (c) => c.source === "textbook-units", v: { cls: "UNSURE", reason: "振り返りの文脈。中国語の 检讨 は「反省・自己批判」に寄るので 审视 の方が誤読が無い", to: "审视" } },
  { word: "检讨", v: { cls: "LEAK", reason: "日本語の 検討 (考える・比べる)。中国語の 检讨 は「自己批判」", to: "研究", family: "检讨" } },
  { word: "提携", test: (c) => /企业间$/.test(c.pre), v: { cls: "LEAK", reason: "日本語の 提携 (業務提携)。中国語の 提携 は「後進を引き立てる」", to: "合作", family: "提携" } },
  { word: "提携", test: quoted, v: { cls: "OK", reason: "括弧・引用の日本語原語 (「企業提携」)" } },
  { word: "提携", v: { cls: "LEAK", reason: "日本語の 提携 (業務提携)。中国語の 提携 は「後進を引き立てる」", to: "合作", family: "提携" } },
  { word: "实装", test: (c) => /内存模块/.test(c.post), v: { cls: "UNSURE", reason: "日本語の 実装 (基板に載せる)。DIMM の文脈では 内存模块 で足りる。unit_summary_zh = unit-level 補丁", to: "安装的" } },
  { word: "实装", test: (c) => /^主存/.test(c.post), v: { cls: "LEAK", reason: "日本語の 実装 (実際に積んでいる)。中国語は 实际安装的", to: "实际安装的", family: "实装" } },
  { word: "实装", v: { cls: "LEAK", reason: "日本語の 実装 (CPU に載せる)。中国語は 集成", to: "集成", family: "实装" } },
  { word: "结合测试", test: (c) => quoted(c) || /也叫\*\*$/.test(c.pre), v: { cls: "OK", reason: "括弧・「日语中也叫」で示した日本語の名称 (集成测试 の別名)" } },
  { word: "结合测试", test: (c) => /^（集成测试）/.test(c.post), v: { cls: "LEAK", reason: "見出しで日本語名が先、中国語名が括弧の中 (逆)。他の欄は「集成测试（结合测试）」", to: "集成测试（结合测试）", len: "结合测试（集成测试）".length, family: "结合测试" } },
  { word: "结合测试", v: { cls: "LEAK", reason: "日本語の 結合テスト を地の文の訳語に使っている。中国語は 集成测试 (同じ sidecar の他欄も 集成测试)", to: "集成测试", family: "结合测试" } },
  { word: "单体测试", v: { cls: "OK", reason: "「单元测试（单体测试）」= 括弧の日本語の名称" } },
  { word: "试作", v: { cls: "UNSURE", reason: "日本語の 試作品 の直訳。中国語でも 试制品 / 试作品 は通じるが、ソフトウェアの文脈では 原型 が普通。多くは「试作品（原型）」と併記", family: "试作" } },
  { word: "多重化", v: { cls: "UNSURE", reason: "日本語の 多重化 (= 冗余化)。中国語の 多重化 は通じるが、標準は 冗余。多くは「冗余化（多重化）」と併記", family: "多重化" } },
  { word: "二重化", v: { cls: "OK", reason: "「双工系统（二重化）」= 括弧の日本語の名称" } },
  { word: "指摘", v: { cls: "UNSURE", reason: "監査の 指摘事項。中国語の 指摘 は「批判する」寄りだが「审计指摘」は通じる。中国語の監査用語は 审计发现 / 指出的问题。題目の見出し〔A收到的指摘〕と一括で決める", family: "指摘" } },
  { word: "误答", test: (c) => /^成/.test(c.post), v: { cls: "UNSURE", reason: "日本語の 誤答 (動詞)。中国語は 答错", to: "答错", family: "误答" } },
  { word: "误答", test: (c) => /^项/.test(c.post), v: { cls: "UNSURE", reason: "日本語の 誤答 (選択肢)。中国語は 错误选项", to: "错误选", family: "误答" } },
  { word: "误答", v: { cls: "UNSURE", reason: "日本語の 誤答。中国語でも意味は通じる (答错)。同じ sidecar の多数は「错误答案」", to: "错误答案", family: "误答" } },
  { word: "利用者", v: { cls: "LEAK", reason: "日本語の 利用者。中国語は 使用者 / 用户", to: "使用者", family: "利用者" } },
  { word: "责任者", test: quoted, v: { cls: "OK", reason: "「用工单位负责人（派遣先责任者）」= 括弧の日本語の法令用語" } },
  { word: "责任者", test: (c) => /管理$/.test(c.pre), v: { cls: "LEAK", reason: "日本語の 管理責任者。中国語は 管理负责人", to: "负责人", family: "责任者" } },
  { word: "责任者", v: { cls: "LEAK", reason: "日本語の 責任者 (活動図のスイムレーン)。中国語は 负责人", to: "负责人", family: "责任者" } },
  { word: "事业者", test: (c) => /GS1/.test(c.pre), v: { cls: "OK", reason: "GS1 Japan の正式名「GS1 事業者コード」" } },
  { word: "事业者", test: (c) => /通信$/.test(c.pre), v: { cls: "OK", reason: "日本の法令用語 电气通信事业者 (電気通信事業法の名宛人)。中国語の 电信运营商 に当たるが法令名の訳として許容" } },
  { word: "事业者", v: { cls: "UNSURE", reason: "日本語の 事業者 (特定電子メール法の名宛人)。中国語は 经营者 / 企业", to: "经营者" } },
  { word: "满足度", test: (c) => /功能$/.test(c.pre), v: { cls: "OK", reason: "功能满足度 = 要件の充足度。中国語として成り立つ" } },
  { word: "满足度", v: { cls: "UNSURE", reason: "限界効用の文脈。日本語の 満足度。中国語は 满足感 / 满意度", to: "满足感", family: "满足度" } },
  { word: "不正(竞争防止法)", test: (c) => /^竞争防止/.test(c.post), v: { cls: "LEAK", reason: "日本の法律名を日本語のまま簡体字にしている。同じ sidecar の他欄は《反不正当竞争法》", family: "不正竞争防止法" } },
  { word: "不正(竞争防止法)", v: { cls: "OK", reason: "中国語の 不正 (彼此不正对 = 正面を向いていない)" } },
  { word: "个人番号", v: { cls: "UNSURE", reason: "マイナンバー制度の 個人番号 / 番号法 を字面のまま使っている (中国語の一般的な訳は 个人编号 / 我的编号法)。単元 strategy-02-05 / 05-14 と quiz で一貫しているので、用語として残すかは方針判断 (zh_terms と合わせて)", family: "个人番号" } },
  { word: "利害关系者", test: (c) => /也称/.test(c.pre.slice(-6)) || quoted(c), v: { cls: "OK", reason: "「也称利害关系者」・括弧 = 別称としての提示" } },
  { word: "利害关系者", v: { cls: "UNSURE", reason: "日本語の 利害関係者。中国語でも 利害关系人 / 利益相关者 に近く通じる。単元の見出し語 (keyword) の訳として zh_terms で決めた語かを確認してから", family: "利害关系者" } },
  { word: "景品", v: { cls: "OK", reason: "日本の法律名 景品表示法 の略称 (正式訳「不当赠品与不当表示防止法」と併記、または名称の説明)" } },
  { word: "株式", test: quoted, v: { cls: "OK", reason: "「株式公開買付け」= 引用の日本語原語" } },
  { word: "株式", v: { cls: "UNSURE", reason: "題目の伝票の宛先「株式会社 I」(会社名)。図の文字を写したもの。I 股份公司 にするか題目のまま残すか", family: "2009h21a 株式会社 I" } },
  { word: "会社", test: (c) => /株式$/.test(c.pre), v: { cls: "UNSURE", reason: "題目の伝票の宛先「株式会社 I」(会社名)", family: "2009h21a 株式会社 I" } },
  { word: "会社", v: { cls: "OK", reason: "括弧の日本語原語 (合弁会社)" } },
  { word: "役员", v: { cls: "OK", reason: "引用・括弧の日本語の法令用語 (《公司法》上的「役员」、执行官（执行役员）)" } },
  { word: "下请", v: { cls: "OK", reason: "分包法（下请法）= 括弧の日本の法律の通称" } },
  { word: "独占禁止", v: { cls: "OK", reason: "反垄断法（独占禁止法）= 括弧の日本の法律名" } },
  { word: "内制", v: { cls: "OK", reason: "自制还是外购（内制／外购）= 括弧の日本語の用語" } },
  { word: "生体认证", v: { cls: "OK", reason: "生物特征认证（生体认证）= 括弧の日本語の用語" } },
  { word: "记忆装置", v: { cls: "UNSURE", reason: "日本語の 記憶装置。中国語は 存储装置 / 存储器", to: "存储装置" } },
  { word: "受注", v: { cls: "OK", reason: "接到的订单（受注）= 括弧の日本語原語" } },
  { word: "引当", v: { cls: "OK", reason: "分配数量（引当数）= 括弧の日本語原語" } },
  { word: "受入", test: isHook, v: { cls: "OK", reason: "hook の日本語分解 (他人受入率)。L4-c", l4c: true } },
  { word: "受入", v: { cls: "OK", reason: "认假率（他人受入率）= 括弧の日本語原語" } },
];

const cut = (s: unknown, n = 300): string | null => (typeof s === "string" ? (s.length > n ? `${s.slice(0, n)}…` : s) : null);

function judge(c: Ctx): Verdict {
  for (const r of JUDGE) if (r.word === (c.net === "glyph" ? "glyph" : c.word) && (!r.test || r.test(c))) return typeof r.v === "function" ? r.v(c) : r.v;
  return { cls: "UNSURE", reason: "規則なし (要判定)" };
}

/** Smallest window around [i, i+len) of `s` that occurs once in `s` (grown by 1 char per side). */
function uniqueWindow(s: string, i: number, len: number): { before: string; start: number } {
  for (let r = 0; r < 40; r++) {
    const a = Math.max(0, i - r);
    const w = s.slice(a, i + len + r);
    if (s.split(w).length - 1 === 1) return { before: w, start: a };
  }
  return { before: s.slice(Math.max(0, i - 40), i + len + 40), start: Math.max(0, i - 40) };
}

export function scan(groups: Group[] = collect()): Hit[] {
  const hits: Hit[] = [];
  for (const g of groups) {
    if (g.tag !== "content") continue;
    const z = g.members.zh;
    if (!z || typeof z.value !== "string") continue;
    const raw = z.value;
    const t = maskJp(raw);
    const ja = typeof g.members.ja?.value === "string" ? (g.members.ja.value as string) : "";
    const file = z.file ?? g.file;
    const found: { net: "word" | "glyph"; word: string; m: string; i: number }[] = [];
    for (const { w, re, jaSibling } of WORDS) {
      if (jaSibling && !jaSibling.test(ja)) continue;
      for (const m of t.matchAll(re)) found.push({ net: "word", word: w, m: m[0], i: m.index ?? 0 });
    }
    for (const m of t.matchAll(/\p{Script=Han}+/gu))
      if ([...m[0]].some((c) => !GB2312.has(c))) found.push({ net: "glyph", word: [...new Set([...m[0]].filter((c) => HAN.test(c) && !GB2312.has(c)))].join(""), m: m[0], i: m.index ?? 0 });
    for (const f of found) {
      const c: Ctx = { word: f.word, net: f.net, m: f.m, pre: t.slice(Math.max(0, f.i - 20), f.i), post: t.slice(f.i + f.m.length, f.i + f.m.length + 20), path: z.path, source: g.source, file, ja };
      const v = judge(c);
      let proposed: Hit["proposed"] = null;
      if (v.to !== undefined && v.cls !== "OK") {
        // glyph LEAK: replace only the flagged glyph run; word: replace the matched word
        const core = f.net === "glyph" ? f.m : f.m.replace(/^不正$/, "不正竞争防止法");
        const to = f.net === "word" && f.word === "不正(竞争防止法)" ? "反不正当竞争法" : v.to;
        const back = v.back ?? 0;
        const len = (f.net === "word" && f.word === "不正(竞争防止法)" ? "不正竞争防止法".length : v.len ?? core.length) + back;
        const at0 = f.i - back;
        const { before, start } = uniqueWindow(raw, at0, len);
        const after = before.slice(0, at0 - start) + to + before.slice(at0 - start + len);
        proposed = { before, after, occurrences_of_before_in_field: raw.split(before).length - 1 };
      } else if (f.word === "不正(竞争防止法)" && v.cls === "LEAK") {
        const len = "不正竞争防止法".length;
        const { before, start } = uniqueWindow(raw, f.i, len);
        proposed = { before, after: before.slice(0, f.i - start) + "反不正当竞争法" + before.slice(f.i - start + len), occurrences_of_before_in_field: raw.split(before).length - 1 };
      }
      hits.push({
        id: "",
        source: g.source,
        file,
        path: z.path,
        net: f.net,
        word: f.word,
        match: f.m,
        index: f.i,
        classification: v.cls,
        reason: v.reason,
        ...(v.family ? { family: v.family } : {}),
        ...(v.marker ? { needs_jp_marker: true } : {}),
        ...(v.l4c ? { l4c: true } : {}),
        proposed,
        zh_context: t.slice(Math.max(0, f.i - 40), f.i + f.m.length + 40),
        ja_sibling: cut(ja || null),
      });
    }
  }
  hits.forEach((h, i) => (h.id = `B${String(i + 1).padStart(4, "0")}`));
  return hits;
}

if (import.meta.filename === path.resolve(process.argv[1] ?? "")) {
  const hits = scan();
  const ki = process.argv.indexOf("--kwic");
  if (ki > 0) {
    const only = process.argv.slice(ki + 1);
    for (const h of hits) if (!only.length || only.includes(h.word) || only.includes(h.net) || only.includes(h.classification)) console.log(`${h.classification}\t${h.word}\t${h.source}\t${h.file.split("/").pop()}\t${h.path}\t${h.zh_context.replace(/\s+/g, " ")}`);
  } else {
    const count: Record<string, Record<string, number>> = {};
    for (const h of hits) {
      count[h.source] ??= { LEAK: 0, OK: 0, UNSURE: 0 };
      count[h.source][h.classification]++;
    }
    const byWord: Record<string, Record<string, number>> = {};
    for (const h of hits) {
      const k = h.net === "glyph" ? "(glyph)" : h.word;
      byWord[k] ??= { LEAK: 0, OK: 0, UNSURE: 0 };
      byWord[k][h.classification]++;
    }
    const out = {
      schema: "l4b-jpword-1",
      generated_at: new Date().toISOString(),
      command: "node scripts/l4-jpword-scan.ts --write",
      read_only: true,
      scope: "zh members of content groups (L2 field classes; derived compat fields skipped); [[jp:…]] masked",
      counts_by_source: count,
      counts_by_word: byWord,
      hit_count: hits.length,
      hits,
    };
    console.log(JSON.stringify({ counts_by_source: count, hit_count: hits.length }));
    if (process.argv.includes("--write")) writeFileSync(path.join(ROOT, "evidence/phase5/hosting/L4b_hits.json"), `${JSON.stringify(out, null, 1)}\n`);
  }
}
