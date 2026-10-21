# S131 efix4b — 解説是正 (efull_4 のうち 2018h30h、D-176: 1 unit = 1 exam)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_4.json` の 2018h30h の medium 2 題 (q074 / q089)
- script: `scripts/quiz-fidfix-S131-efix4b.mjs` (efix4a と同じ形。subN、dry-run 既定、`--apply`。D-143 note は final に後置し、後置済みかは note の全文で判定)
- correct_answer 変更 0。stem / choices / translations sidecar は不変 (変更は `.phase2` の expl と generate_result の final note、merge で再生成した `explanations/2018h30h.json` だけ)
- translations sidecar の照合 (q051 の教訓): q074 の stem (a〜c) と choices、q089 の stem と choices の zh / en を読んだ。どちらにも、解説の誤り (32/64 ビット = アドレス幅という定義、Wi-Fi Direct をアドホックの例とする記述) は含まれていない。q089 選択肢アの訳「不经过接入点，由终端之间直接通信的无线局域网（LAN）通信方式」/ "A wireless LAN communication method in which terminals communicate directly …" は jp の選択肢どおり → 変更なし

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2018h30h-q074 正解・要点 1 | 32/64 ビットを「アドレスを一度に扱えるビット幅」と定義している | 32/64 ビットは一度に処理できるデータの幅 (レジスタ長・演算単位)。アドレス幅は一般にそれに対応するだけで、同じものではない (x86-64 の実装上の仮想アドレスは 48 ビット)。記述 a (64 ビット CPU の方がメモリ空間の理論上限が大きい) が正しく答えがアという結論は不変 | ACCEPT。「データの幅 (レジスタ長) を表し、アドレスのビット数も一般にこれに対応する」(jp / zh / en) |
| 2 | 2018h30h-q089 ア | Wi-Fi Direct をアドホックモードの例にしている | Wi-Fi Direct は片方の端末がグループオーナー (ソフトウェア AP) になる方式で、IEEE 802.11 のアドホックモード (IBSS) とは別の技術。AP を介さずに直接つなぐ点だけが共通。要点 2 には Wi-Fi Direct の記述が無い | ACCEPT。例示をやめ、類似の別技術として括弧で書き分けた (jp / zh / en)。LTE ではないという結論は不変 |

集計: medium 2 題 → **ACCEPT 2 / REJECT 0**。applied 11 = 置換 9 + note 後置 2。

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2018h30h-q074 correct

- **jp before**: 正しいのは記述 a だけなので、a のみを挙げた「ア」が正解です。CPU の「32ビット/64ビット」はアドレスを一度に扱えるビット幅を指し、これがメモリ空間の理論上限を決めます。32ビットでは 2 の 32 乗（約 4G バイト）が上限ですが、64ビットでは 2 の 64 乗と桁違いに大きくなります。よって「64ビット CPU の方が取り扱えるメモリ空間の理論上限は大きい」という記述 a は適切で、これだけを含む「ア」が答えです。
- **jp after**: 正しいのは記述 a だけなので、a のみを挙げた「ア」が正解です。CPU の「32ビット/64ビット」は一度に処理できるデータの幅 (レジスタ長) を表し、アドレスのビット数も一般にこれに対応するため、メモリ空間の理論上限が決まります。32ビットでは 2 の 32 乗（約 4G バイト）が上限ですが、64ビットでは 2 の 64 乗と桁違いに大きくなります。よって「64ビット CPU の方が取り扱えるメモリ空間の理論上限は大きい」という記述 a は適切で、これだけを含む「ア」が答えです。

- **zh before**: 只有描述 a 是正确的，因此仅列出 a 的「ア」为正确答案。CPU 的「32位/64位」指的是一次能够处理的地址位宽，它决定了内存空间的理论上限。32位时上限为 2 的 32 次方（约 4G 字节），而 64位则为 2 的 64 次方，要大出好几个数量级。因此「64位 CPU 能够处理的内存空间理论上限更大」这一描述 a 是恰当的，只包含它的「ア」就是答案。
- **zh after**: 只有描述 a 是正确的，因此仅列出 a 的「ア」为正确答案。CPU 的「32位/64位」表示一次能够处理的数据宽度（寄存器长度），地址的位数一般也与之对应，因此决定了内存空间的理论上限。32位时上限为 2 的 32 次方（约 4G 字节），而 64位则为 2 的 64 次方，要大出好几个数量级。因此「64位 CPU 能够处理的内存空间理论上限更大」这一描述 a 是恰当的，只包含它的「ア」就是答案。

- **en before**: Only statement a is correct, so the answer is choice ア, which lists only a. A CPU being 32-bit or 64-bit refers to the bit width of addresses it can handle at once, and this decides the theoretical upper limit of memory space. With 32 bits the limit is 2 to the 32nd power (about 4G bytes), while with 64 bits it becomes 2 to the 64th power, which is orders of magnitude larger. Therefore statement a, that a 64-bit CPU has a larger theoretical upper limit on the memory space it can handle, is appropriate, and choice ア, which contains only this, is the answer.
- **en after**: Only statement a is correct, so the answer is choice ア, which lists only a. A CPU being 32-bit or 64-bit refers to the width of data it can process at once (its register length); the number of address bits generally corresponds to it, which decides the theoretical upper limit of memory space. With 32 bits the limit is 2 to the 32nd power (about 4G bytes), while with 64 bits it becomes 2 to the 64th power, which is orders of magnitude larger. Therefore statement a, that a 64-bit CPU has a larger theoretical upper limit on the memory space it can handle, is appropriate, and choice ア, which contains only this, is the answer.


#### 2018h30h-q074 p:0

- **jp before**: CPU の 32ビット/64ビットは一度に扱えるアドレスのビット幅であり、扱えるメモリ空間の理論上限（32ビットは約 4G バイト、64ビットはそれより桁違いに大きい）を決める。
- **jp after**: CPU の 32ビット/64ビットは一度に処理できるデータの幅 (レジスタ長) で、アドレスのビット数も一般にこれに対応し、扱えるメモリ空間の理論上限（32ビットは約 4G バイト、64ビットはそれより桁違いに大きい）を決める。

- **zh before**: CPU 的 32位/64位是一次能够处理的地址位宽，它决定了可处理内存空间的理论上限（32位约为 4G 字节，64位则比它大出好几个数量级）。
- **zh after**: CPU 的 32位/64位是一次能够处理的数据宽度（寄存器长度），地址位数一般也与之对应，它决定了可处理内存空间的理论上限（32位约为 4G 字节，64位则比它大出好几个数量级）。

- **en before**: The 32-bit or 64-bit of a CPU is the bit width of addresses it can handle at once, and it decides the theoretical upper limit of the memory space that can be handled (about 4G bytes for 32-bit, and orders of magnitude larger for 64-bit).
- **en after**: The 32-bit or 64-bit of a CPU is the width of data it can process at once (its register length); the number of address bits generally corresponds to it, and this decides the theoretical upper limit of the memory space that can be handled (about 4G bytes for 32-bit, and orders of magnitude larger for 64-bit).


#### 2018h30h-q089 d:ア

- **jp before**: アクセスポイントを介さずに端末同士が直接通信する無線 LAN の方式は「アドホックモード」(Wi-Fi Direct など) の説明であり、携帯電話規格である LTE とは別物。
- **jp after**: アクセスポイントを介さずに端末同士が直接通信する無線 LAN の方式は「アドホックモード」の説明であり (Wi-Fi Direct も AP なしで端末同士をつなぐが、片方の端末がグループオーナーとして AP の役割を担う別の技術)、携帯電話規格である LTE とは別物。

- **zh before**: 不经过接入点、由终端之间直接通信的无线局域网（LAN）方式，是「自组网（ad hoc）模式」（如 Wi-Fi Direct）的说明，与作为移动电话规格的 LTE 是两回事。
- **zh after**: 不经过接入点、由终端之间直接通信的无线局域网（LAN）方式，是「自组网（ad hoc）模式」的说明（Wi-Fi Direct 也不经过接入点直接连接终端，但由一方终端作为组主承担接入点的角色，是另一种技术），与作为移动电话规格的 LTE 是两回事。

- **en before**: A wireless LAN method in which terminals communicate directly with each other without going through an access point describes “ad hoc mode” (such as Wi-Fi Direct), which is a different thing from LTE, a mobile phone standard.
- **en after**: A wireless LAN method in which terminals communicate directly with each other without going through an access point describes “ad hoc mode” (Wi-Fi Direct also connects terminals without an access point, but it is a different technology in which one terminal acts as the group owner and takes the access point's role), which is a different thing from LTE, a mobile phone standard.


## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2018h30h` | ✅ applied 11 |
| 変更範囲 | ✅ explanations は題 id 単位で 2 題だけ (q074 / q089)、トップレベル同一。translations は差分 0 |
| 冪等: efix4b dry-run 再実行 | ✅ applied 0 / skipped 11 (efix4a も 0 / 30) |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| tsc / eslint / vitest / build | ✅ exit 0 / 0 errors (既存 warning 1) / 563 passed・2 skipped / Compiled successfully |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |

Rule B: 失敗した attempt なし。

## 4. Rule D (verifier type、opus、編集なし)

判定 **PASS-with-notes** (low のみ、ブロッカー 0)。q074 / q089 とも VERIFIED。dry-run applied 0 / skipped 11、crosscheck `--require-raw` all invariants hold、差分範囲は q074 (3 hunk) と q089 (2 hunk) だけ、translations の差分 0、correct_answer の変更 0。

| severity | note | 処置 |
|---|---|---|
| low | q074 key_guard.note_jp 元文の「64ビット CPU はアドレスのビット幅が大きく」は、定義を述べた箇所ではなく誤りでもない。key_guard は不可触で、経緯は後置 note で説明済み | 変更なし |
| low | q089 zh の「无线通信规格」「4G 世代」は和語をそのまま使った訳語 (efull_4 では low)。意味は正しい | 今回は対象外。corpus 全体で用語を揃える際にまとめて扱う (案:「无线通信标准」「第四代（4G）技术」) |
| info | 監査文には「誤答ア の解説と points で」とあるが、HEAD の q089 points に Wi-Fi Direct の記述は無い。§1 の記載が正しい | — |
