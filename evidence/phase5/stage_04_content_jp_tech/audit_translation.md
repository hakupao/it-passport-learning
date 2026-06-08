# Rule A 翻訳忠実度抽检 — technology zh/en (119 unit)

> workflow: `stage4-phaseB-ruleA-translation.workflow.mjs` (wf_a767e40d-ddd)
> 監査者: critic/opus (translator=general-purpose・reviewer=code-reviewer と別 subagent_type、Rule D 三役分離)
> N=20 (本土术语検証[交付物/确认] + リスク対応/DDR3 修正term + 翻訳CONCERNS unit + redo unit + 安全集群専門詞 + 各域代表)
> 日付: 2026-06-05

## 結果サマリ

| 指標 | 値 |
|------|----|
| N | 20 |
| **faithful (忠実)** | **20/20 (100%)** |
| severity none | 14 |
| severity low | 6 |
| severity medium | **0** |
| severity high | **0** |
| flagged (medium/high) | **0 (空)** |
| 誤訳・意味逆転・欠落 | **0** |

**結論**: 全20サンプルで `faithful=true`、medium・high・誤訳 0。6 low はすべて zh 自然さ/ローカライズ口径 (意味影響なし)。

## 重点検証項目 (全 PASS)

- **リスク対応 (修正term 低減)**: faithful=**none**。「低減=降低(减轻)/reduction(mitigation)」が zh/en に正しく反映、「回避はリスク源を断つ/低減はリスクを残し影響を小さくする」対比も保持。日語修正が翻訳に完全伝播。
- **DDR3 SDRAM (修正term)**: faithful=none。「クロック信号に同期=与时钟信号同步/in sync with a clock signal」正確 (CPU動作 混同なし)。
- **本土术语 (交付物/确认)**: 全 unit で和製形残留0 (確定的検査済)。専門詞 (容错/可用性/服务器/操作系统 等) は中国本土標準・繁体混入なし。
- **安全集群専門詞** (スミッシング/アンチパスバック/情報資産/FAR): faithful、誤訳なし。
- **redo unit** (基数変換/サーバ/CPU 等、StructuredOutput hiccup 再翻訳): 全 faithful。

## low 6件 (zh 自然さ/ローカライズ、任意)

| unit/term | 指摘 | 区分 |
|-----------|------|------|
| 13-33-u01 基数変換 | analogy の通貨例を zh「人民币」/en「yuan,dollars」にローカライズ。zh/en で通貨ペア不一致 (日源「円⇔ドル」) | ローカライズ口径 (任意) |
| 18-49-u01 サーバ | definition_zh「业务用计算机」は直訳カルク、本土は「商用/企业级计算机」が自然 | 単一フィールド (任意) |
| 23-63-u10 FAR | analogy_en の「名前 vs ラベル」ニュアンス微差 | 任意 |
| (他3件) | 自然さ/文体 (OS en 長文・入出力 back 等) | 任意 |

## 判定

- **忠実度 = 100% (medium/high/誤訳 0)** → 三語ゲートに進める品質。
- low 6 = 意味正確、zh 自然さのみ。**ローカライズ口径** (通貨例を地域化するか日源統一するか) は全量方針として一度決めれば足りる (単独パッチ不要)。
- 本土术语ポリシー (交付物/确认) は今批から prompt 生効を実証。

> 本 audit は critic 独立判定。
