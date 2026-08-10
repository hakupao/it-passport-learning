export const meta = {
  name: 'quiz-phase2-gapfix-S110',
  description: 'S110 / 2013h25a: session-limit で落ちた 2 agent の穴だけを埋める (q088 の訳文リトライ + q089 の訳文レビュー round2)',
  phases: [
    { title: 'Retranslate', detail: 'general-purpose(opus): q088 points[1] の zh/en を JP に忠実へ再訳' },
    { title: 'Review', detail: 'feature-dev:code-reviewer(opus): 再訳の検証 + q089 の未完レビュー' },
  ],
}

const TR_SCHEMA = {
  type: 'object',
  required: ['id', 'field', 'zh', 'en', 'note_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    field: { type: 'string' },
    zh: { type: 'string' },
    en: { type: 'string' },
    note_jp: { type: 'string' },
  },
}

const REVIEW_SCHEMA = {
  type: 'object',
  required: ['id', 'verdict', 'checks', 'issues'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'CONCERNS', 'FAIL'] },
    checks: {
      type: 'object', required: ['completeness', 'meaning_faithful', 'terminology_correct', 'no_drift'],
      additionalProperties: false,
      properties: {
        completeness: { type: 'boolean' }, meaning_faithful: { type: 'boolean' },
        terminology_correct: { type: 'boolean' }, no_drift: { type: 'boolean' },
      },
    },
    issues: {
      type: 'array',
      items: {
        type: 'object', required: ['severity', 'lang', 'detail_jp'], additionalProperties: false,
        properties: {
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          lang: { type: 'string' },
          detail_jp: { type: 'string' },
        },
      },
    },
    recommendation_jp: { type: 'string' },
  },
}

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'
const P2 = `${ROOT}/data/ip/quiz/.phase2`

const retranslatePrompt = `あなたは IT パスポート過去問**解説**の翻訳者です。

## 背景
\`${P2}/expl_tr_2013h25a-q088.json\` の \`points[1]\` の zh / en は、JP 源から**逸脱**しています。
具体的には、JP に無い「クラッシング (crashing)」という手法名を持ち込み、文の骨格も
「2 つの手法がある」という別の構成に組み替えてしまっています。

## やること
1. \`${P2}/expl_jp_2013h25a-q088.json\` を Read し、\`points_jp[1]\` を**唯一の正**として取得。
2. 同ファイルの他の points / correct_jp、および \`${P2}/expl_tr_2013h25a-q088.json\` の
   既存訳 (points[0] や correct) を読み、**用語と文体を既存訳に合わせる**。
3. \`points_jp[1]\` に忠実な zh (簡体字・大陸中国語) と en を書く。
   - **JP に無い概念・用語を足さない** (crashing / 赶工 を勝手に導入しない)。
   - JP の論理の順序を保つ: ①全体の終了日を決めるのは「最も遅く終わる作業」である
     → ②ある作業を短縮しても後続/並行して最後まで続く作業を前倒ししなければ全体は縮まない
     → ③逆に、先行作業の完了を待たずに一部を重ねて始める並行作業 (ファストトラッキング) は
       全体短縮の有効な手段になる。
   - JP が括弧で示す原語 (ファストトラッキング) は、zh では「快速跟进（fast tracking）」の
     ように訳語＋原語併記、en では fast tracking と表記する。

\`field\` には "points.1" を入れてください。StructuredOutput で TR_SCHEMA に従って返してください。`

const reviewPrompt = (id, target) => `あなたは独立した翻訳検証者 (Rule D: 翻訳者と別役割) です。解説 JP→zh/en 翻訳の忠実度を核験します。甘く通さない。

## 入力
- JP 源 (**正**): \`${P2}/expl_jp_${id}.json\` を Read (correct_jp / distractors_jp / points_jp)
- 訳文 (検証対象): \`${P2}/expl_tr_${id}.json\` を Read (correct{zh,en} / distractors / points)
- 設問データ: \`${P2}/input_2013h25a.json\` の questions[] 中 id==="${id}" (stem/choices/correct_answer/glossary)

${target}

## 判定
- completeness: JP の全フィールド (correct / 各誤答 / 各 point) が漏れなく訳されているか。
  **文が途中で切れていないか**を特に確認すること。
- meaning_faithful: 意味が保たれているか。**JP に無い概念・用語を足していないか**。
- terminology_correct: zh は大陸中国語の標準用語か。既存コーパスの訳語と整合するか。
- no_drift: 論理の順序・強調・限定が JP から動いていないか。

StructuredOutput で REVIEW_SCHEMA に従って返してください。`

phase('Retranslate')
const retr = await agent(retranslatePrompt, {
  label: 'retr:2013h25a-q088#points1', phase: 'Retranslate', schema: TR_SCHEMA,
  model: 'opus', agentType: 'general-purpose',
})

phase('Review')
const reviews = await parallel([
  () => agent(
    reviewPrompt('2013h25a-q088',
      `## 特記\n本問の points[1] の zh/en は直前に**再訳**されました。再訳文はまだ disk に書かれていないので、` +
      `以下の再訳案を points[1] の zh/en とみなして検証してください。\n\n\`\`\`json\n${JSON.stringify({ zh: retr?.zh ?? '', en: retr?.en ?? '' }, null, 2)}\n\`\`\`\n` +
      `他のフィールド (correct / distractors / points[0]) は disk 上の現行訳をそのまま検証対象とします。`),
    { label: 'trrev:2013h25a-q088#retry', phase: 'Review', schema: REVIEW_SCHEMA, model: 'opus', agentType: 'feature-dev:code-reviewer' },
  ),
  () => agent(
    reviewPrompt('2013h25a-q089',
      `## 特記\n本問は round-1 レビューで CONCERNS となり、その指摘を受けて訳文が改訂されました。` +
      `disk 上の \`expl_tr_2013h25a-q089.json\` が**改訂後**の訳文です。round-2 の検証が session limit で` +
      `未完のまま残っているため、ここで改めて完全な検証を行ってください。`),
    { label: 'trrev:2013h25a-q089#2retry', phase: 'Review', schema: REVIEW_SCHEMA, model: 'opus', agentType: 'feature-dev:code-reviewer' },
  ),
])

return {
  retranslation: retr,
  reviews: reviews.filter(Boolean),
}
