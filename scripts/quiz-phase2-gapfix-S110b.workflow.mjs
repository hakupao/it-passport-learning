export const meta = {
  name: 'quiz-phase2-gapfix-S110b',
  description: 'S110 / 2013h25a-q088: 訳文全体を JP 源から再訳し、別 subagent_type が独立核験する (Rule D)',
  phases: [
    { title: 'Retranslate', detail: 'general-purpose(opus): correct / 誤答3件 / points[0] を JP から全面再訳' },
    { title: 'Verify', detail: 'pr-review-toolkit:code-reviewer(opus): 再訳を JP 源と逐条照合' },
  ],
}

const FULL_TR_SCHEMA = {
  type: 'object',
  required: ['id', 'correct', 'distractors', 'points', 'note_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    correct: {
      type: 'object', required: ['zh', 'en'], additionalProperties: false,
      properties: { zh: { type: 'string' }, en: { type: 'string' } },
    },
    distractors: {
      type: 'array',
      items: {
        type: 'object', required: ['letter', 'zh', 'en'], additionalProperties: false,
        properties: { letter: { type: 'string' }, zh: { type: 'string' }, en: { type: 'string' } },
      },
    },
    points: {
      type: 'array',
      items: {
        type: 'object', required: ['index', 'zh', 'en'], additionalProperties: false,
        properties: { index: { type: 'number' }, zh: { type: 'string' }, en: { type: 'string' } },
      },
    },
    note_jp: { type: 'string' },
  },
}

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['id', 'verdict', 'checks', 'issues'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'CONCERNS', 'FAIL'] },
    checks: {
      type: 'object',
      required: ['completeness', 'meaning_faithful', 'terminology_correct', 'no_drift', 'dates_consistent'],
      additionalProperties: false,
      properties: {
        completeness: { type: 'boolean' }, meaning_faithful: { type: 'boolean' },
        terminology_correct: { type: 'boolean' }, no_drift: { type: 'boolean' },
        dates_consistent: { type: 'boolean' },
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
const ID = '2013h25a-q088'

// points[1] は前段 (gapfix-S110) で再訳・採用済みなので触らない。
const KEPT_POINT1 = {
  zh: '决定项目整体结束日期的，是「最后结束的那项作业」。即使缩短了某一项作业，只要不把排在它后面的作业、以及并行推进并一直持续到最后的作业提前，整体工期就不会缩短。反过来说，不等先行作业完成就让一部分重叠着开始的并行作业（快速跟进，fast tracking），是缩短整体工期的有效手段。',
  en: "What determines a project's overall finish date is the activity that ends last. Even if some activity is shortened, the overall duration does not shrink unless the activities remaining behind it, and the activities that run in parallel and continue to the very end, are also moved up. Conversely, parallel work in which part of an activity is started so that it overlaps, without waiting for the preceding activity to be completed (fast tracking), is an effective means of shortening the overall schedule.",
}

const retranslatePrompt = `あなたは IT パスポート過去問**解説**の翻訳者です。

## 背景 (重要)
\`${P2}/expl_tr_${ID}.json\` の現行訳は、独立検証で **FAIL** 判定を受けました。
検証者の所見は「現行 JP の翻訳ではなく、別系統で独立生成された解説と判断される」というものです。
したがって**部分パッチでは回収できません**。JP 源から全面的に訳し直してください。

## 入力
1. **JP 源 (唯一の正)**: \`${P2}/expl_jp_${ID}.json\` を Read
   (correct_jp / distractors_jp[{letter, why_wrong_jp}] / points_jp[])
2. 用語参照: \`${P2}/input_2013h25a.json\` の questions[] 中 id==="${ID}"
   の stem / choices / tr (既存の設問訳) / glossary
3. 参考 (**訳語と文体の統一のためだけに読む。内容は真似しない**):
   \`${ROOT}/data/ip/quiz/explanations/2014h26h.json\` などの既存 sidecar

## 訳出対象
- \`correct\` の zh / en
- \`distractors\` の ア・ウ・エ (JP にあるものすべて) の zh / en
- \`points[0]\` の zh / en

**points[1] は既に再訳・採用済みなので対象外**です (\`points\` 配列には index 0 のみ返してください)。

## 現行訳が落ちた具体的な理由 — 同じ轍を踏まないこと
1. **日付の系統的ドリフト**: JP は変更計画の外部調達管理 (B社のソフトウェア開発) の終了を
   一貫して「**9月初**」と書いているのに、訳文は 6 箇所すべてで「8月末 / end of August」に
   していた。**JP が書いている時点表現をそのまま訳す**こと。勝手に月末/月初を言い換えない。
2. **論証構造の置換**: JP correct_jp の対比節は「逆に流通計画・プロモーションだけを前倒し
   しても、受入試験・検収が 10月中旬まで残ります。両方をそろえて初めて 9月末に収まります。」
   である。訳文はこれを「並行余地が 0.5か月しかない」という **JP に無い別の主張**に置換していた。
3. **JP に無い加算論の追加**: 「0.5 + 0.5 = 1か月」という算術的組立ては JP に存在しない。
4. **欠落**: JP correct_jp 冒頭の「図1 は横軸が 4月〜10月の月目盛で、各作業について
   当初計画 / 変更計画 / 実績 の3段が並んだガントチャートです」、当初計画の**開始日**、
   「いちばん遅く終わるのは流通計画・プロモーションなので全体の終了は 10月末」という核心、
   「流通計画・プロモーションは 1か月前倒し」という数値 — いずれも訳出漏れしていた。
5. **捏造概念**: 誤答ウの「本公司一侧的市场营销工序 / marketing activity as the bottleneck」、
   誤答アの「软件的取得一侧 / the software acquisition side」「并不是能缩短 0.5 个月」、
   誤答エの「该选项完全没有提到开发缩短 0.5 个月」— すべて JP に無い。
6. **points[0] への混入**: 訳文 points[0] 末尾に points_jp[1] の内容 (最も遅く終わる作業が
   全体工期を決める) が紛れ込んでいた。points_jp[0] は「ガントチャートとは何か / 3段を並べて
   目盛で読み比べられる」で完結する。

## 原則
- **JP の一文一文に対応させる**。足さない、削らない、順序を変えない。
- 数値・時点表現 (6月中旬 / 9月初 / 9月中旬 / 10月中旬 / 10月末 / 0.5か月 / 1か月) は
  JP どおりに訳す。
- zh は簡体字・大陸中国語。用語は input の tr.choices
  (软件开发工作 / 验收测试·验收 / 流通计划·促销业务) と glossary (甘特图) に揃える。
  「工序」の多用による設問訳との揺れを起こさない。
- en も同様に JP に忠実に。

StructuredOutput で FULL_TR_SCHEMA に従って返してください。`

const verifyPrompt = (proposal) => `あなたは独立した翻訳検証者です (Rule D: 翻訳者とも、前段の検証者とも別の役割)。甘く通さない。

## 入力
- **JP 源 (唯一の正)**: \`${P2}/expl_jp_${ID}.json\` を Read
- 設問データ: \`${P2}/input_2013h25a.json\` の questions[] 中 id==="${ID}"
- 検証対象 = 以下の**再訳案** (disk 上の現行訳ではなく、これを見てください):

\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`

なお \`points[1]\` は本再訳の対象外で、既に採用済みの以下が入ります (参考):
\`\`\`json
${JSON.stringify(KEPT_POINT1, null, 2)}
\`\`\`

## 検証項目
- **completeness**: JP の correct_jp / distractors_jp 全件 / points_jp[0] が漏れなく訳されているか。
  文が途中で切れていないか。
- **meaning_faithful**: 意味が保たれているか。**JP に無い概念・用語・論点を足していないか**。
- **terminology_correct**: zh は大陸中国語の標準用語か。input の設問訳・glossary と整合するか。
- **no_drift**: 論理の順序・強調・限定・因果が JP から動いていないか。
- **dates_consistent**: **時点表現が JP と一字一句対応しているか**。とくに変更計画の外部調達管理の
  終了は JP では「9月初」である。「8月末」等への言い換えがあれば直ちに high で報告すること。
  当初計画の各開始・終了 (6月中旬 / 9月中旬 / 10月中旬 / 10月末)、短縮量 (0.5か月 / 1か月) も
  一つずつ JP と突き合わせること。

前回の FAIL は上記 5 点すべてで発生している。**同じ欠陥が残っていないかを最優先で確認**すること。
StructuredOutput で VERIFY_SCHEMA に従って返してください。`

phase('Retranslate')
const tr = await agent(retranslatePrompt, {
  label: `retr-full:${ID}`, phase: 'Retranslate', schema: FULL_TR_SCHEMA,
  model: 'opus', agentType: 'general-purpose',
})

phase('Verify')
const verdict = await agent(verifyPrompt(tr), {
  label: `verify:${ID}`, phase: 'Verify', schema: VERIFY_SCHEMA,
  model: 'opus', agentType: 'pr-review-toolkit:code-reviewer',
})

log(`q088 全面再訳 → 検証 verdict=${verdict?.verdict}`)

return { retranslation: tr, verification: verdict, kept_point1: KEPT_POINT1 }
