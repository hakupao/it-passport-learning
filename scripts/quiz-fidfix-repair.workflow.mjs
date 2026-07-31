export const meta = {
  name: 'quiz-fidfix-repair',
  description: '保真是正の連带修復: 源文言に戻した JP に対し、腐敗版から訳された zh/en と、腐敗版を引用/前提にした解説を整合させる',
  phases: [
    { title: 'Repair', detail: 'general-purpose(opus): 是正後 JP を権威として zh/en + 解説の stale 箇所のみ更新' },
  ],
}

const SCHEMA = {
  type: 'object',
  required: ['id', 'translation_updates', 'explanation_updates', 'summary_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    translation_updates: {
      type: 'array',
      description: '訳文の更新。是正で意味が変わった箇所だけ。変更不要なら空配列。',
      items: {
        type: 'object', required: ['field', 'new_text', 'reason_jp'], additionalProperties: false,
        properties: {
          field: { type: 'string', description: '"stem.zh" | "stem.en" | "choices.ア.zh" | "choices.エ.en" など' },
          new_text: { type: 'string', description: '是正後 JP に忠実な訳文の全文 (部分ではなくフィールド全体)' },
          reason_jp: { type: 'string' },
        },
      },
    },
    explanation_updates: {
      type: 'array',
      description: '解説の更新。是正で誤り/陳腐になった箇所だけ。変更不要なら空配列。',
      items: {
        type: 'object', required: ['field', 'new_text', 'reason_jp'], additionalProperties: false,
        properties: {
          field: { type: 'string', description: '"correct.jp" | "correct.zh" | "correct.en" | "distractors.ウ.jp" | "distractors.ウ.zh" | "points.0.jp" など' },
          new_text: { type: 'string', description: 'そのフィールドの全文 (置換用)' },
          reason_jp: { type: 'string' },
        },
      },
    },
    summary_jp: { type: 'string' },
  },
}

function prompt(inputPath, id) {
  return `あなたは**保真是正の連帯修復**担当です。設問の日本語表示テキストが IPA 原典どおりに是正されました。その結果として辻褄が合わなくなった **訳文 (zh/en)** と **解説** だけを直します。

## 入力
\`${inputPath}\` を Read し、samples[] の id==="${id}" を取得。
- \`corrected_stem_jp\` / \`corrected_choices_jp\`: **是正後の JP = 権威**
- \`edits_applied\`: 実際に適用した差分 (was → now)
- \`current_stem_tr\` / \`current_choices_tr\`: 現在の訳文 (**腐敗版 JP から訳された可能性あり**)
- \`current_explanation\`: 現在の解説 (**腐敗版 JP を引用・前提にしている可能性あり**)
- \`correct_answer\`: 正解字母 (**不変。絶対に動かさない**)

## やること
1. \`edits_applied\` を 1 件ずつ見て、その変更が **訳文** に波及しているか判定。腐敗版の意味が訳文に残っていれば、是正後 JP に忠実な訳へ直す (フィールド全文を返す)。既に正しければ何も返さない。
2. 同じく **解説** を点検:
   - 解説が腐敗版の文言を**引用**している → 是正後の文言に差し替える。
   - 解説の**論理が腐敗版に依存**している → 是正後の文言に対して正しい論証に書き直す。
   - **特に注意**: 腐敗によって誤答肢が「真の記述」になっていた場合、生成時の解説は「真の記述をなぜ誤りか」と無理な理屈をこねている可能性が高い。是正後は素直な理由に直すこと。
   - 解説末尾等に残る「これは OCR 誤読で正しくは…」といった注記は、是正後は陳腐なので削除する。
3. **触らないもの**: 是正と無関係な箇所、正解字母、日本語として問題ない表現の好み。**最小限の変更**に留める。

## 制約
- zh は中国本土の標準 IT 用語 (日式借词を避ける)。en は自然な英語。三言語で意味を一致させる。
- **JSON 安全**: 文字列値の中で生の半角二重引用符 " を使わない (引用は「」/“” で囲む)。
- new_text は必ず**そのフィールドの全文**を返す (部分置換ではない)。
- 変更が一切不要なら両方の配列を空にして summary_jp にその旨を書く。

StructuredOutput で SCHEMA に従って返してください。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const ids = parsed?.ids
if (!inputPath || !Array.isArray(ids) || !ids.length) throw new Error('need {input_path, ids:[...]}')

const results = await parallel(
  ids.map((id) => () => agent(prompt(inputPath, id), {
    label: `repair:${id}`, phase: 'Repair', schema: SCHEMA, model: 'opus', agentType: 'general-purpose',
  })),
)

const clean = results.filter(Boolean)
const trCount = clean.reduce((n, r) => n + (r.translation_updates?.length || 0), 0)
const exCount = clean.reduce((n, r) => n + (r.explanation_updates?.length || 0), 0)
log(`連帯修復: ${clean.length} 問 → 訳文 ${trCount} フィールド / 解説 ${exCount} フィールド`)

return { n: clean.length, translationFieldCount: trCount, explanationFieldCount: exCount, results: clean }
