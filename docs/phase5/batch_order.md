# 教科书 v2 批量重写 — 批次顺序 (D-201 §0-1)

> 由 `node scripts/textbook-v2-batch-order.mjs` 生成（`--check` 校验）。除 status 列外不要手改；status 列重生成时按批 id 保留。
> 试点 topic `management-10-27` 已为 v2（冻结基线），不在表内。questions = 该 topic 的过去问题数（排序键，同数按 topic_id）；拆批 = 单元数 > 5 的 topic 按单元顺序每 5 个一批。

合计：62 topic / 241 单元 / 1402 用语 / 78 批（拆批 topic 12 个）。

| batch | topic | names | units | questions | terms | status |
|---|---|---|---|---|---|---|
| b01 | technology-23-63 | 情報セキュリティ対策・情報セキュリティ実装技術 (1/3) | u01 u02 u03 u04 u05 | 217 | 36 | done (S135, attempts 2/2/1/1/3, Rule A PASS after 65 patches) |
| b02 | technology-23-63 | 情報セキュリティ対策・情報セキュリティ実装技術 (2/3) | u06 u07 u08 u09 u10 | 217 | 35 | done (S137, attempts 2/3/3/1/1, Rule A PASS after 28 patches) |
| b03 | technology-23-63 | 情報セキュリティ対策・情報セキュリティ実装技術 (3/3) | u11 u12 u13 | 217 | 17 | todo |
| b04 | technology-23-62 | 情報セキュリティ管理 (1/2) | u01 u02 u03 u04 u05 | 135 | 29 | todo |
| b05 | technology-23-62 | 情報セキュリティ管理 (2/2) | u06 u07 | 135 | 14 | todo |
| b06 | management-08-25 | システム開発技術 | u01 u02 u03 u04 u05 | 125 | 23 | todo |
| b07 | strategy-01-02 | 業務分析・データ利活用 (1/3) | u01 u02 u03 u04 u05 | 98 | 26 | todo |
| b08 | strategy-01-02 | 業務分析・データ利活用 (2/3) | u06 u07 u08 u09 u10 | 98 | 36 | todo |
| b09 | strategy-01-02 | 業務分析・データ利活用 (3/3) | u11 u12 u13 u14 u15 | 98 | 29 | todo |
| b10 | technology-22-60 | ネットワーク応用 (1/2) | u01 u02 u03 u04 u05 | 97 | 30 | todo |
| b11 | technology-22-60 | ネットワーク応用 (2/2) | u06 | 97 | 7 | todo |
| b12 | strategy-01-03 | 会計・財務 (1/2) | u01 u02 u03 u04 u05 | 90 | 26 | todo |
| b13 | strategy-01-03 | 会計・財務 (2/2) | u06 | 90 | 4 | todo |
| b14 | technology-23-61 | 情報セキュリティ (1/3) | u01 u02 u03 u04 u05 | 89 | 31 | todo |
| b15 | technology-23-61 | 情報セキュリティ (2/3) | u06 u07 u08 u09 u10 | 89 | 30 | todo |
| b16 | technology-23-61 | 情報セキュリティ (3/3) | u11 u12 u13 | 89 | 16 | todo |
| b17 | technology-22-58 | ネットワーク方式 | u01 u02 u03 u04 u05 | 87 | 31 | todo |
| b18 | management-11-29 | サービスマネジメントシステム | u01 u02 u03 u04 u05 | 77 | 25 | todo |
| b19 | strategy-06-19 | 業務プロセス | u01 u02 u03 | 71 | 21 | todo |
| b20 | strategy-02-04 | 知的財産権 | u01 u02 u03 | 69 | 18 | todo |
| b21 | strategy-01-01 | 経営・組織論 (1/3) | u01 u02 u03 u04 u05 | 62 | 33 | todo |
| b22 | strategy-01-01 | 経営・組織論 (2/3) | u06 u07 u08 u09 u10 | 62 | 32 | todo |
| b23 | strategy-01-01 | 経営・組織論 (3/3) | u11 | 62 | 5 | todo |
| b24 | strategy-03-09 | 経営戦略手法 | u01 u02 u03 u04 u05 | 60 | 29 | todo |
| b25 | management-12-31 | システム監査 | u01 u02 | 58 | 14 | todo |
| b26 | technology-21-55 | データベース設計 | u01 u02 u03 | 55 | 14 | todo |
| b27 | strategy-02-05 | セキュリティ関連法規 | u01 u02 u03 u04 | 54 | 19 | todo |
| b28 | management-12-32 | 内部統制 | u01 | 53 | 5 | todo |
| b29 | technology-16-44 | システムの評価指標 | u01 u02 u03 u04 | 46 | 17 | todo |
| b30 | strategy-03-10 | マーケティング (1/2) | u01 u02 u03 u04 u05 | 43 | 29 | todo |
| b31 | strategy-03-10 | マーケティング (2/2) | u06 u07 | 43 | 7 | todo |
| b32 | management-09-26 | 開発プロセス・手法 | u01 u02 u03 u04 u05 | 41 | 30 | todo |
| b33 | strategy-05-14 | ビジネスシステム (1/2) | u01 u02 u03 u04 u05 | 39 | 35 | todo |
| b34 | strategy-05-14 | ビジネスシステム (2/2) | u06 u07 u08 u09 | 39 | 22 | todo |
| b35 | strategy-04-13 | 技術開発戦略の立案・技術開発計画 | u01 u02 u03 u04 | 38 | 25 | todo |
| b36 | strategy-07-24 | 調達計画・実施 | u01 | 38 | 4 | todo |
| b37 | technology-16-43 | システムの構成 | u01 u02 u03 u04 | 38 | 25 | todo |
| b38 | strategy-07-23 | 要件定義 | u01 | 37 | 4 | todo |
| b39 | strategy-02-06 | 労働関連・取引関連法規 | u01 u02 u03 | 36 | 18 | todo |
| b40 | technology-17-47 | オフィスツール | u01 | 36 | 5 | todo |
| b41 | technology-13-35 | 情報に関する理論 (1/2) | u01 u02 u03 u04 u05 | 35 | 25 | todo |
| b42 | technology-13-35 | 情報に関する理論 (2/2) | u06 u07 | 35 | 12 | todo |
| b43 | technology-15-41 | メモリ | u01 u02 u03 u04 | 35 | 25 | todo |
| b44 | management-11-28 | サービスマネジメント | u01 | 34 | 5 | todo |
| b45 | strategy-03-12 | 経営管理システム | u01 u02 | 34 | 10 | todo |
| b46 | strategy-05-15 | エンジニアリングシステム | u01 u02 | 34 | 9 | todo |
| b47 | technology-22-59 | 通信プロトコル | u01 u02 u03 | 34 | 19 | todo |
| b48 | strategy-02-07 | その他の法律・ガイドライン・情報倫理 | u01 u02 u03 u04 | 32 | 23 | todo |
| b49 | technology-13-34 | 応用数学 (1/2) | u01 u02 u03 u04 u05 | 32 | 31 | todo |
| b50 | technology-13-34 | 応用数学 (2/2) | u06 u07 | 32 | 8 | todo |
| b51 | technology-14-37 | アルゴリズムとプログラミング | u01 u02 u03 u04 u05 | 32 | 26 | todo |
| b52 | technology-21-56 | データ操作 | u01 | 31 | 5 | todo |
| b53 | strategy-02-08 | 標準化関連 | u01 u02 u03 | 29 | 18 | todo |
| b54 | strategy-03-11 | ビジネス戦略と目標・評価 | u01 | 29 | 6 | todo |
| b55 | strategy-05-16 | e-ビジネス | u01 u02 u03 u04 | 29 | 27 | todo |
| b56 | technology-13-33 | 離散数学 | u01 u02 | 28 | 12 | todo |
| b57 | management-11-30 | ファシリティマネジメント | u01 | 27 | 5 | todo |
| b58 | technology-15-40 | プロセッサ | u01 u02 | 26 | 10 | todo |
| b59 | technology-17-46 | ファイルシステム | u01 | 26 | 6 | todo |
| b60 | strategy-06-18 | 情報システム戦略 | u01 | 25 | 4 | todo |
| b61 | strategy-07-22 | システム化計画 | u01 | 25 | 6 | todo |
| b62 | technology-15-42 | 入出力デバイス | u01 u02 u03 u04 u05 | 25 | 27 | todo |
| b63 | technology-17-48 | オープンソースソフトウェア | u01 | 25 | 3 | todo |
| b64 | technology-18-49 | ハードウェア（コンピュータ・入出力装置） | u01 u02 u03 u04 | 24 | 22 | todo |
| b65 | technology-21-57 | トランザクション処理 | u01 u02 | 24 | 9 | todo |
| b66 | strategy-05-17 | IoTシステム・組込みシステム | u01 u02 u03 u04 | 22 | 26 | todo |
| b67 | strategy-06-20 | ソリューションビジネス | u01 u02 u03 | 21 | 16 | todo |
| b68 | technology-20-52 | マルチメディア技術 (1/2) | u01 u02 u03 u04 u05 | 20 | 30 | todo |
| b69 | technology-20-52 | マルチメディア技術 (2/2) | u06 | 20 | 6 | todo |
| b70 | technology-17-45 | オペレーティングシステム | u01 u02 | 18 | 12 | todo |
| b71 | technology-19-51 | インタフェース設計 | u01 u02 u03 u04 | 17 | 28 | todo |
| b72 | strategy-06-21 | システム活用促進・評価 | u01 | 14 | 8 | todo |
| b73 | technology-14-38 | プログラム言語 | u01 u02 u03 | 13 | 19 | todo |
| b74 | technology-20-53 | マルチメディア応用 | u01 u02 u03 | 10 | 18 | todo |
| b75 | technology-19-50 | 情報デザイン | u01 u02 | 8 | 12 | todo |
| b76 | technology-14-36 | データ構造 | u01 | 7 | 5 | todo |
| b77 | technology-14-39 | その他の言語 | u01 | 7 | 5 | todo |
| b78 | technology-21-54 | データベース方式 | u01 | 7 | 8 | todo |
