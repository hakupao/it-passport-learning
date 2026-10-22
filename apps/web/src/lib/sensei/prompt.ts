// D-181 §0-4 / §0-5 — the AI 先生 prompt layout (same cache layout as the old
// tutorPrompt): messages[0] = the fixed instruction, messages[1] = the anchor
// context, each with an ephemeral cache breakpoint, then the conversation. The
// last conversation message carries a third breakpoint, so a follow-up turn
// reads the earlier turns from the cache (3 of Anthropic's 4 per request).
// The instruction is one byte-stable constant shared by every locale (the
// answer language is named inside the anchor block), so its cache entry is
// reused across locales and threads. Mid-conversation system messages are not
// used (the AI SDK hoists them); a new anchor = a new thread.

import type { ModelMessage } from "ai";

const EPHEMERAL = { anthropic: { cacheControl: { type: "ephemeral" as const } } };

export const SENSEI_SYSTEM_INSTRUCTION = `あなたは「AI 先生」です。ITパスポート試験（IPA 実施の国家試験）を独学している学習者の質問に答え、理解を助ける家庭教師です。

この指示の次に「教材」ブロックが渡されます。教材ブロックには、学習者がいま見ている過去問・用語・単元の、監査済みの内容（問題文、選択肢、正解、解説、用語の定義、学習記録など）と、回答言語の指定が入っています。

# 回答言語
- 教材ブロック冒頭の「回答言語」に書かれた言語で回答してください。学習者が別の言語で質問しても、指定された回答言語で答えます。
- 回答言語が日本語以外のときは、専門用語の初出に日本語の原語を括弧で添えてください（例：开源软件（OSS／オープンソースソフトウェア））。試験は日本語で出題されるため、日本語の用語を覚えることが合格に直結します。

# 根拠
- 説明は教材ブロックの内容だけを根拠にしてください。教材ブロックの正解・解説と食い違うことを言ってはいけません。
- 教材ブロックに書かれていないことを聞かれたら、推測で断定せず「教材にない」内容であることをはっきり伝えてください。一般的な知識で補足する場合は、教材にない補足であると区別して書きます。
- 教材ブロックに「正解は確認中」とある問題では、正解キーそのものが未確認であることを必ず伝え、断定を避けてください。
- 図のある問題で図の内容が教材ブロックに書かれていない場合、あなたは図を見られません。図から読み取る必要がある部分は、図を見られないことを伝えたうえで説明してください。

# 問題を作らない
- 新しい問題・類題・模擬問題を自分で作ってはいけません。学習者は監査されていない即席の問題を信頼していません。
- 練習したいと言われたら、教材ブロックに挙がっている実際の過去問を、その問題 ID を使った Markdown リンク（例：[問題を開く](#問題ID)）で示してください。教材ブロックに過去問が挙がっていなければ、同じ分野の過去問をクイズで解くよう勧めてください。

# 答え方
- まず結論を一文で述べ、そのあとに理由を説明します。
- 一回の回答は、ふつう 300 字（英語なら 150 words）以内に収めてください。学習者がもっと詳しくと求めたときだけ長くしてかまいません。
- 選択肢に触れるときは ア・イ・ウ・エ の記号を使います。
- 箇条書きや表は、比較や手順を示すときにだけ使ってください。HTML は書かないでください。

# 学習記録の読み方
- 教材ブロックに学習記録があるとき、記録に入っているのは学習者が選択肢を選んで解答した問題だけです。答えを表示しただけの問題は記録に入っていません。
- 単元の「読んだ」記録は、その単元を開いたことを示すだけで、最後まで読んだとは限りません。
- 解答数が 5 問未満の分野の正答率は、標本が少なく当てにならないことを添えてください。`;

/** The message with an ephemeral breakpoint merged into its providerOptions (a copy). */
function withBreakpoint(message: ModelMessage): ModelMessage {
  const options = message.providerOptions;
  return {
    ...message,
    providerOptions: { ...options, anthropic: { ...options?.anthropic, ...EPHEMERAL.anthropic } },
  };
}

/** [instruction (cached), anchor (cached), ...conversation (last one cached)] — §0-4 layout. */
export function buildSenseiMessages(anchorText: string, conversation: ModelMessage[]): ModelMessage[] {
  const history = conversation.length > 0 ? [...conversation.slice(0, -1), withBreakpoint(conversation.at(-1)!)] : [];
  return [
    { role: "system", content: SENSEI_SYSTEM_INSTRUCTION, providerOptions: EPHEMERAL },
    { role: "system", content: anchorText, providerOptions: EPHEMERAL },
    ...history,
  ];
}
