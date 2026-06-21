export const meta = {
  name: 'quiz-choicestr',
  description: 'Quiz Phase 1.6 choices-fidelity track: jp 修正済 choices の zh/en 翻訳を再同期。各問の変更字母について、figure-faithful な corrected_jp から zh/en を生成 (現訳が既に正しければ保持、腐敗 jp を訳していた場合は是正)。term 一貫性のため同問の他訳文に整合。',
  phases: [{ title: 'Retranslate', detail: 'general-purpose(opus): 変更字母の zh/en を corrected_jp から再生成' }],
}

const TR_SCHEMA = {
  type: 'object',
  required: ['id', 'per_letter', 'notes_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    per_letter: {
      type: 'array', description: '変更字母ごとの zh/en', items: {
        type: 'object', required: ['letter', 'zh', 'en', 'changed_from_current'], additionalProperties: false,
        properties: {
          letter: { type: 'string', enum: ['ア', 'イ', 'ウ', 'エ'] },
          zh: { type: 'string', description: 'corrected_jp に忠実な簡体中文訳' },
          en: { type: 'string', description: 'corrected_jp に忠実な英訳' },
          changed_from_current: { type: 'boolean', description: '現訳から変えたか (現訳が既に正しければ false で現訳を踏襲)' },
        },
      },
    },
    notes_jp: { type: 'string' },
  },
}

function trPrompt(inputPath, id) {
  return `あなたは IT パスポート過去問の三語化翻訳者です。ある問の選択肢 jp が figure-faithful に修正されたので、その**変更字母**の zh (簡体中文) / en 訳を再同期してください。

## 入力 (Read して id="${id}")
\`${inputPath}\` の questions[] 中 id==="${id}": changed_letters (再訳対象) / corrected_jp (修正後の正しい jp choices、字母→テキスト) / current_tr (現在の zh/en 訳、字母→{zh,en}) / figure_png / figure_page_png (権威、表/図選択肢の文脈確認用)。

## 手順
1. changed_letters の各字母について corrected_jp[字母] を読む。表/図/式を含む場合は figure_page_png を Read して文脈を正しく把握。
2. corrected_jp に**忠実**な zh (簡体中文) と en を生成。
   - **現訳 (current_tr) が既に corrected_jp の意味を正しく反映している場合はそれを踏襲** (changed_from_current=false)。数値・式・セル参照 (例 1,000 / B6−10) は locale 不変でそのまま。
   - 現訳が腐敗 jp を訳していた (意味が corrected_jp とズレる) 場合は是正 (changed_from_current=true)。
   - 表/選択肢記法 (\`[表]\` プレフィックスや \`|\` 区切り、a/b/c/d ラベル) は同問の current_tr の様式に合わせる。用語は IT パスポート標準 (例 共通鍵→共享密钥/symmetric-key、公開鍵→公开密钥/public-key)。
3. en は自然な技術英語、zh は本土簡体。

## 出力
TR_SCHEMA に従い StructuredOutput で返す (id="${id}"、per_letter は changed_letters 全字母)。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const items = parsed?.items ?? []
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id}]}')
const results = await parallel(
  items.map((it) => () => agent(trPrompt(inputPath, it.id), { label: `ctr:${it.id}`, phase: 'Retranslate', schema: TR_SCHEMA, model: 'opus', agentType: 'general-purpose' })),
)
const clean = results.filter(Boolean)
const changedCount = clean.reduce((n, r) => n + (r.per_letter || []).filter((p) => p.changed_from_current).length, 0)
log(`再訳完了 ${clean.length}/${items.length}: 現訳から変更した字母 ${changedCount}`)
return { total: items.length, done: clean.length, changed_letters: changedCount, results: clean }
