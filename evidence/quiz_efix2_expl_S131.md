# S131 efix2 — 解説是正 (efull_2 の medium 25 + 2010h22a-q033 両論併記 + D-175 zh 訳語統一)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_2.json` (opus v2 + input_only、389 題、medium 25 / high 0)、主 context の判断 (D-161: 2010h22a-q033 ウ は両論併記)、D-175 (zh: デュアルシステム = 双重系统 / デュプレックスシステム = 双工系统 を corpus 全体で統一)
- script: `scripts/quiz-fidfix-S131-efix2.mjs` (efix1 と同じ形: assert-before-replace の subN、dry-run 既定、`--apply`。D-143: final note に後置だけ、round1・既存 note・flag は不可触)。D-175 の translations sidecar は quiz-fidfix-S130-t1 と同じく sidecar と `.phase1 tr_` の両方に当てる (sidecar は再 merge 禁止)
- correct_answer 変更 0。jp の stem / choices は不変 (questions.json は md5 不変)。translations sidecar の変更は D-175 の zh だけ (3 exam、3 題)
- 照合の方法: 各指摘を題幹・選択肢・現行の解説 3 言語と照らして独立に判定した。外部の解説サイトは使っていない (HTTP 403)。法令・規格の条文 (会社法 329 条、実用新案法 2 条など) は条文の内容による

## 0. 判断の分かれる点 (Rule D reviewer はここから)

| 題 | 内容 | 判定 / 理由 |
|---|---|---|
| 2010h22a-q033 ウ | efix1 で REJECT (DEBATABLE) とした分類 | 主 context の判断 (D-161) に従い**両論併記**。「インシデント管理 (および復旧に伴う実作業) として説明できる」に改めた。そのうえで「交換部品を本番環境に適用して確認する作業は、ITIL v2 や JIS Q 20000 ではリリース管理 (変更管理で承認された変更を本番環境へ展開する活動) としても整理される。どちらの読み方でも問題管理ではない」と足した。jp / zh / en |
| 2011h23tokubetsu-q092 | 正解解説の根拠の書き直し (改写が最も大きい) | 題幹の保守契約は「導入したシステムに関する問合せ，障害の切分けの対応」だけで、修正は含まない。契約条件は「瑕疵担保期間は，検収後 6 か月」、障害は「検収の翌月」。だから無償修正の根拠は瑕疵担保責任で、保守料ではない。正解解説の 2 か所、誤答肢エの 2 文、要点 1/2 を題幹の条件に合わせて書き直した。結論 (X社に切分けを依頼する、バグなら無償 = ウ) は不変。key_guard note の同じ推論には訂正を後置した |
| 2012h24a-q017 | EC 形態名の覚え方 | 「(前) 売り手 to (後) 買い手」と定義すると、同じ解説の CtoB の例 (逆オークションでは企業が売り手) と矛盾する。CtoB の定義を「個人が起点となって企業と取引する」に、覚え方を「提供する側 (取引の起点) to 受け取る側」に改めた。CtoB の例 (逆オークション・素材販売・買取) は残した。BtoC の結論は不変 |
| 2013h25h-q005 ア | 画面・帳票の要件確定の工程 | 題幹は企画 → 要件定義 → 開発の順で、共通フレームでは画面・帳票の要件はシステム要件定義 (開発プロセス) で決める。誤答肢ア・要点 2 を改めた。要点 2 の「RFP 作成とベンダ選定は調達」はそのまま (指摘外) |
| 2012h24a-q057 / 2014h26h-q056 | zh の dual / duplex 訳語 (efull_2 の medium) | D-175 で是正した (§3)。解説だけでなく題幹 (translations) も入れ替えた |

## 1. efull_2 medium 25 の判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2011h23tokubetsu-q077 正解 | UDP は「到達を優先」ではない | UDP は再送・到達確認をしない。欠損を許容する代わりに低遅延を取るプロトコルで、到達を優先するのは TCP。zh「优先保证送达」はさらに明確な誤り | ACCEPT。「再送をしない代わりに多少の欠損を許容して即時性 (低遅延) を優先する UDP」 |
| 2 | 2011h23tokubetsu-q081 正解 | Java もコンパイラで機械語になるように読める | javac の出力は JVM 用のバイトコードで、機械語への変換は実行時に JVM が行う | ACCEPT。例を C だけにした |
| 3 | 2011h23tokubetsu-q088 ウ | パリティチェックを誤り訂正符号の例にしている | 単一のパリティチェックは誤り検出で、訂正はできない | ACCEPT。検出はパリティチェック、訂正はハミング符号など |
| 4 | 2011h23tokubetsu-q092 (指摘 2 件) | 保守契約の一般化 / 瑕疵担保期間の見落とし | §0 | ACCEPT (2 件とも) |
| 5 | 2012h24a-q009 要点 1 | 「仕組み・アイディアを守るのは特許法だけ」 | 実用新案法の考案も「自然法則を利用した技術的思想の創作」(2 条 1 項)。ビジネスモデルのような方法まで守れるのは特許法だけ (実用新案は物品の形状・構造・組合せに限る) | ACCEPT |
| 6 | 2012h24a-q017 (指摘 2 件) | CtoB の定義と例の矛盾 / 「売り手 to 買い手」の覚え方 | §0 | ACCEPT (2 件とも) |
| 7 | 2012h24a-q018 要点 2 | アライアンス「資本移動を伴わず」 | アライアンスには資本提携 (出資・株式の持ち合い) もある。誤答肢アは「原則として経営権の移転を伴いません」で正しい | ACCEPT。「経営権の移転を原則伴わず」 |
| 8 | 2012h24a-q055 要点 2 | 「RAID10 (RAID0+1)」 | RAID10 は RAID1+0 (ミラーした組をストライピング)。RAID0+1 は構成も耐障害性も違う | ACCEPT。「RAID10 (RAID1+0)」 |
| 9 | 2012h24a-q057 zh | dual / duplex の訳語が逆 | D-175 | ACCEPT (D-175 で是正) |
| 10 | 2012h24h-q063 ア | HDD を「主記憶と補助記憶の橋渡し役」 | HDD は補助記憶そのもの。橋渡しはキャッシュなど。同じ解説の イ・要点とも矛盾 | ACCEPT。「OS やファイルを置く常用の補助記憶」 |
| 11 | 2012h24h-q060 要点 2 | 「FTPS / SFTP = FTP に暗号化」 | SFTP は SSH 上の別プロトコルで、FTP の拡張ではない。誤答肢アの説明は区別している | ACCEPT。FTPS = FTP + SSL/TLS、SFTP = SSH 上の別プロトコル |
| 12 | 2013h25a-q003 (指摘 2 件) | PER の分母を株価 / 要点 2 の「分母で区別」に PER・EVA が収まらない | PER = 株価 ÷ EPS で分母は EPS (誤答肢ウの説明とも食い違う)。EVA は NOPAT − 資本コストの金額で分母が無い | ACCEPT (2 件とも)。正解解説から「株価か」を外し、要点 2 は収益性指標 (ROE / ROA) を分母で区別、PER・EVA は定義を別に書いた |
| 13 | 2013h25a-q013 ア | 「純資産 (株主資本、資本剰余金、利益剰余金など)」 | 資本剰余金・利益剰余金は株主資本の内訳で、株主資本と並べるのは区分の誤り | ACCEPT。「資本金・資本剰余金・利益剰余金などからなる株主資本ほか」 |
| 14 | 2013h25a-q042 (指摘 2 件) | マネジメント予備をスコープ外用としている | PMBOK ではマネジメント予備はスコープ内の未知の事象 (unknown-unknowns) 用。スコープ外の新要求は変更管理でスコープとベースラインを改訂して扱う。題幹の定義 (当初の範囲に含まれる予測できる事象 = コンティンジェンシー予備) とも整合する | ACCEPT (2 件とも)。要点 2 と誤答肢ウ |
| 15 | 2013h25a-q097 (+ 要点 1) | 「接触不要」をバーコードとの違いとしている | バーコードも光学式の非接触読取で、表1 の読取距離は両方とも「数cm～数十cm」。表1 で違うのは読取枚数 (一度に複数枚)・情報量・読取方式 (光学 / 電波) | ACCEPT。違いを、電波なので向き・見通しを合わせなくてよいこと、一度に複数枚読めること、に改めた。要点 1 の「1 件ずつ・かざす必要あり」も「一度に 1 枚」に |
| 16 | 2013h25a-q091 正解 | 写真の取り違えの理由を作っている | 題幹のメモは「商品ごとに数枚の写真」「ワインは商品名が非常に複雑なので，掲載する写真を間違えやすい」。「多数の写真」は題幹に無い | ACCEPT。題幹のとおり書き、写真を絞れば誤りの機会が減る、という簡素化の筋は残した |
| 17 | 2013h25h-q005 | §0 | §0 | ACCEPT |
| 18 | 2013h25h-q026 (+ 要点 1) | 会計監査人を役員に含めている | 会社法 329 条 1 項「役員（取締役、会計参与及び監査役）及び会計監査人は、株主総会の決議によって選任する」 | ACCEPT。「役員 (取締役・会計参与・監査役) および会計監査人」 |
| 19 | 2014h26a-q069 エ | ワンタイムパスワードを「本質は知識」 | トークン・スマートフォンなど所持する機器が生成・受信する値で認証するので、一般に所持の要素 | ACCEPT。key_guard note の「エ (知識ベースの使い捨て情報)」には訂正を後置 (旧 note は不変) |
| 20 | 2014h26a-q074 正解 | 射影・選択・結合を「集合演算」 | 標準の区分では 選択・射影・結合 = 関係演算、和・差・積・直積 = 集合演算 | ACCEPT。「関係演算」/ 关系运算 / relational operations |
| 21 | 2014h26h-q025 要点 2 | e ラーニングを集合教育に含めている | e ラーニングは Off-JT だが、個別に学ぶ形態で集合教育ではない | ACCEPT。「研修・勉強会・説明会などの集合教育や e ラーニング」 |
| 22 | 2014h26h-q049 イ | 机上デバッグを設計工程の作業としている | 机上デバッグはソースコードを机上で追う作業で、プログラミング工程。設計書レビューは設計工程 | ACCEPT。2 つを工程ごとに分けた。テスト工程の内容ではないという結論は不変 |
| 23 | 2014h26h-q056 zh | dual / duplex の訳語 (dual = 双工系统、duplex = 双机系统) | D-175 | ACCEPT (D-175 で是正。duplex の「双机系统」も 双工系统 に) |
| 24 | 2014h26h-q076 ア | 「② は正しいので組合せ自体が成立しない」 | ② が正しいことは不成立の理由にならない。正解はウ (②, ④) なので、アが誤りなのは ① を含むことと ④ が抜けていること | ACCEPT。末文を「正しい ④ が抜けているため、効果があるものを全て挙げたことにもならない」に |
| 25 | 2015h27a-q003 ウ | 「完成責任を負う発注者」 | 請負で仕事の完成責任を負うのは受注者。同じ解説の正解理由・要点は「受注者が自らの責任で完成させる」 | ACCEPT。「成果物を受け取る発注者」 |

集計: efull_2 medium 25 件 (題 25、指摘の行は 29) → **ACCEPT 25 / REJECT 0** (q057 / q056 は D-175 で是正)。

範囲外 (low、編集した文の外なので触れていない): 各題の low 指摘。2018h30a-q082 要点 2 の「双工化」は jp が「二重化」で系の名前ではないため、D-175 の対象外。

## 2. 改写前後 — efull_2 + q033 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

D-175 で入れ替えた 5 題の zh は §3 に出す (q057 / q056 の zh もそこ)。

#### 2011h23tokubetsu-q077 correct

- **jp before**: 正解はイ。VoIP (Voice over Internet Protocol、ボイスオーバーアイピー) は、音声を IP ネットワーク上でやり取りするための技術である。仕組みは大きく三段階で、まずマイクから入ったアナログの音声波形を符号化してデジタルデータに変換し、次にそのデータを一定の長さで区切って IP パケットに詰め、最後に IP ネットワーク経由で相手に送り、受信側で元の順序に並べ直して音声に復元する。ここで重要なのは、従来の固定電話が通話中ずっと 1 本の回線を占有し続ける回線交換方式であったのに対し、VoIP は必要なときだけパケットを流すパケット交換方式である点で、回線を他の通信と共用できるため通信コストを大幅に下げられる。もう一つの要点はリアルタイム性で、音声は途切れや遅延が即座に品質低下として耳に届くため、多少の欠損を許容してでも到達を優先する UDP と、RTP (Real-time Transport Protocol) のようなリアルタイム転送用のプロトコルを用いて遅延を抑える設計がとられる。この VoIP を土台に電話サービスとして提供されているのが IP 電話であり、企業の内線統合やインターネット電話、Web 会議の音声部分などに広く使われている。イの記述「音声データをパケット化し, リアルタイムに送受信する技術」は、この符号化・パケット化・リアルタイム伝送という VoIP の本質を過不足なく言い表しており、適切である。
- **jp after**: 正解はイ。VoIP (Voice over Internet Protocol、ボイスオーバーアイピー) は、音声を IP ネットワーク上でやり取りするための技術である。仕組みは大きく三段階で、まずマイクから入ったアナログの音声波形を符号化してデジタルデータに変換し、次にそのデータを一定の長さで区切って IP パケットに詰め、最後に IP ネットワーク経由で相手に送り、受信側で元の順序に並べ直して音声に復元する。ここで重要なのは、従来の固定電話が通話中ずっと 1 本の回線を占有し続ける回線交換方式であったのに対し、VoIP は必要なときだけパケットを流すパケット交換方式である点で、回線を他の通信と共用できるため通信コストを大幅に下げられる。もう一つの要点はリアルタイム性で、音声は途切れや遅延が即座に品質低下として耳に届くため、再送をしない代わりに多少の欠損を許容して即時性 (低遅延) を優先する UDP と、RTP (Real-time Transport Protocol) のようなリアルタイム転送用のプロトコルを用いて遅延を抑える設計がとられる。この VoIP を土台に電話サービスとして提供されているのが IP 電話であり、企業の内線統合やインターネット電話、Web 会議の音声部分などに広く使われている。イの記述「音声データをパケット化し, リアルタイムに送受信する技術」は、この符号化・パケット化・リアルタイム伝送という VoIP の本質を過不足なく言い表しており、適切である。

- **zh before**: 正确答案是イ。VoIP（Voice over Internet Protocol，IP 语音）是在 IP 网络上传送语音的技术。其机制大致分为三个阶段：首先把麦克风采集到的模拟语音波形编码转换成数字数据；接着把这些数据按一定长度切分并装入 IP 分组；最后经由 IP 网络发送给对方，接收端再按原来的顺序重新排列并还原成语音。这里的关键在于，传统固定电话在通话期间始终独占一条线路，属于电路交换方式；而 VoIP 只在需要时才发送分组，属于分组交换方式，线路可以与其他通信共用，因而能大幅降低通信成本。另一个要点是实时性：语音一旦出现中断或延迟，马上就会作为质量下降被耳朵察觉，因此设计上采用即使容忍少量丢失也优先保证送达的 UDP，以及 RTP（Real-time Transport Protocol，实时传输协议）这类实时传输用的协议来抑制延迟。以 VoIP 为基础作为电话服务提供出来的就是 IP 电话，广泛用于企业内部分机电话的整合、互联网电话以及 Web 会议的语音部分。イ 所述「将语音数据分组化并实时收发的技术」不多不少地表达了编码、分组化与实时传输这一 VoIP 的本质，因此是恰当的。
- **zh after**: 正确答案是イ。VoIP（Voice over Internet Protocol，IP 语音）是在 IP 网络上传送语音的技术。其机制大致分为三个阶段：首先把麦克风采集到的模拟语音波形编码转换成数字数据；接着把这些数据按一定长度切分并装入 IP 分组；最后经由 IP 网络发送给对方，接收端再按原来的顺序重新排列并还原成语音。这里的关键在于，传统固定电话在通话期间始终独占一条线路，属于电路交换方式；而 VoIP 只在需要时才发送分组，属于分组交换方式，线路可以与其他通信共用，因而能大幅降低通信成本。另一个要点是实时性：语音一旦出现中断或延迟，马上就会作为质量下降被耳朵察觉，因此设计上采用不做重传、容忍少量丢失而优先保证实时性（低延迟）的 UDP，以及 RTP（Real-time Transport Protocol，实时传输协议）这类实时传输用的协议来抑制延迟。以 VoIP 为基础作为电话服务提供出来的就是 IP 电话，广泛用于企业内部分机电话的整合、互联网电话以及 Web 会议的语音部分。イ 所述「将语音数据分组化并实时收发的技术」不多不少地表达了编码、分组化与实时传输这一 VoIP 的本质，因此是恰当的。

- **en before**: The correct answer is イ. VoIP (Voice over Internet Protocol) is a technology for carrying voice over an IP network. It works in roughly three stages: first, the analog voice waveform picked up by the microphone is encoded and converted into digital data; next, that data is divided into pieces of a fixed length and packed into IP packets; finally, the packets are sent to the other party over the IP network, and the receiving side rearranges them into their original order and restores the voice. The key point here is that a traditional fixed-line telephone occupies one circuit for the whole duration of a call, which is circuit switching, whereas VoIP sends packets only when they are needed, which is packet switching; the line can therefore be shared with other communication, and communication costs can be greatly reduced. Another key point is real-time behavior: with voice, any break or delay is immediately heard as a drop in quality, so the design uses UDP, which tolerates some loss in order to give priority to delivery, together with protocols for real-time transfer such as RTP (Real-time Transport Protocol), in order to keep delay low. The telephone service provided on top of VoIP is IP telephony, which is widely used for integrating company telephone extensions, for Internet telephone calls, and for the audio part of Web conferences. The statement in イ, “A technology that packetizes voice data and transmits and receives it in real time”, expresses exactly the essence of VoIP — encoding, packetization, and real-time transmission — with nothing missing and nothing extra, so it is appropriate.
- **en after**: The correct answer is イ. VoIP (Voice over Internet Protocol) is a technology for carrying voice over an IP network. It works in roughly three stages: first, the analog voice waveform picked up by the microphone is encoded and converted into digital data; next, that data is divided into pieces of a fixed length and packed into IP packets; finally, the packets are sent to the other party over the IP network, and the receiving side rearranges them into their original order and restores the voice. The key point here is that a traditional fixed-line telephone occupies one circuit for the whole duration of a call, which is circuit switching, whereas VoIP sends packets only when they are needed, which is packet switching; the line can therefore be shared with other communication, and communication costs can be greatly reduced. Another key point is real-time behavior: with voice, any break or delay is immediately heard as a drop in quality, so the design uses UDP, which does not retransmit and tolerates some loss in order to give priority to timeliness (low delay), together with protocols for real-time transfer such as RTP (Real-time Transport Protocol), in order to keep delay low. The telephone service provided on top of VoIP is IP telephony, which is widely used for integrating company telephone extensions, for Internet telephone calls, and for the audio part of Web conferences. The statement in イ, “A technology that packetizes voice data and transmits and receives it in real time”, expresses exactly the essence of VoIP — encoding, packetization, and real-time transmission — with nothing missing and nothing extra, so it is appropriate.


#### 2011h23tokubetsu-q081 correct

- **jp before**: 正解はウ「b」。適切な記述は b だけである。b の「コンパイラで変換されるプログラムは, 最終的には機械語に変換されてから実行される」が正しい理由は、CPU が直接解釈・実行できる命令は機械語 (0 と 1 の並びで表された命令コード) だけだからである。C や Java のような人間が読み書きする言語で書かれた原始プログラム (ソースプログラム) は、そのままでは CPU に理解できない。そこでコンパイラが原始プログラム全体を一括して翻訳し、CPU が実行できる形式である目的プログラム (機械語) を生成する。実行時に動いているのはこの機械語であり、ソースコードそのものではない。インタプリタ方式のように 1 行ずつ解釈しながら実行する方式でも、最終的に CPU に渡って処理されるのは機械語の命令であるという点は変わらない。一方、a は機械語・アセンブリ言語が CPU 依存であるという基本を否定しており誤り、c は高水準言語が機械語の能力を超えた演算を可能にすると述べており誤りである。よって適切なものは b のみであり、b だけを挙げている ウ が正解となる。
- **jp after**: 正解はウ「b」。適切な記述は b だけである。b の「コンパイラで変換されるプログラムは, 最終的には機械語に変換されてから実行される」が正しい理由は、CPU が直接解釈・実行できる命令は機械語 (0 と 1 の並びで表された命令コード) だけだからである。C のような人間が読み書きする言語で書かれた原始プログラム (ソースプログラム) は、そのままでは CPU に理解できない。そこでコンパイラが原始プログラム全体を一括して翻訳し、CPU が実行できる形式である目的プログラム (機械語) を生成する。実行時に動いているのはこの機械語であり、ソースコードそのものではない。インタプリタ方式のように 1 行ずつ解釈しながら実行する方式でも、最終的に CPU に渡って処理されるのは機械語の命令であるという点は変わらない。一方、a は機械語・アセンブリ言語が CPU 依存であるという基本を否定しており誤り、c は高水準言語が機械語の能力を超えた演算を可能にすると述べており誤りである。よって適切なものは b のみであり、b だけを挙げている ウ が正解となる。

- **zh before**: 正确答案是 ウ“b”。恰当的记述只有 b。b 的“由编译器转换的程序，最终会被转换成机器语言后再执行”之所以正确，是因为 CPU 能够直接解释并执行的指令只有机器语言（用 0 和 1 的排列表示的指令代码）。用 C 或 Java 这类供人阅读和书写的语言编写的源程序（source program），CPU 本身无法理解。于是编译器把整个源程序一次性翻译，生成 CPU 能够执行的形式，即目标程序（机器语言）。执行时真正在运行的是这段机器语言，而不是源代码本身。即使是像解释器方式那样逐行解释并执行的方式，最终交给 CPU 处理的仍然是机器语言指令，这一点没有变化。另一方面，a 否定了机器语言和汇编语言依赖于 CPU 这一基本事实，因而是错误的；c 声称高级语言能够实现超出机器语言能力的运算，因而也是错误的。所以恰当的只有 b，只列举了 b 的 ウ 就是正确答案。
- **zh after**: 正确答案是 ウ“b”。恰当的记述只有 b。b 的“由编译器转换的程序，最终会被转换成机器语言后再执行”之所以正确，是因为 CPU 能够直接解释并执行的指令只有机器语言（用 0 和 1 的排列表示的指令代码）。用 C 这类供人阅读和书写的语言编写的源程序（source program），CPU 本身无法理解。于是编译器把整个源程序一次性翻译，生成 CPU 能够执行的形式，即目标程序（机器语言）。执行时真正在运行的是这段机器语言，而不是源代码本身。即使是像解释器方式那样逐行解释并执行的方式，最终交给 CPU 处理的仍然是机器语言指令，这一点没有变化。另一方面，a 否定了机器语言和汇编语言依赖于 CPU 这一基本事实，因而是错误的；c 声称高级语言能够实现超出机器语言能力的运算，因而也是错误的。所以恰当的只有 b，只列举了 b 的 ウ 就是正确答案。

- **en before**: The correct answer is ウ, b. The only appropriate statement is b. Statement b — a program converted by a compiler is ultimately converted into machine language before it is executed — is correct because the only instructions a CPU can interpret and execute directly are machine language instructions (instruction codes expressed as sequences of 0s and 1s). A source program written in a language that people read and write, such as C or Java, cannot be understood by the CPU as it is. The compiler therefore translates the whole source program at once and generates an object program (machine language), which is a form the CPU can execute. What actually runs at execution time is this machine language, not the source code itself. Even with a method such as an interpreter, which interprets and executes the program one line at a time, it is still machine language instructions that are finally passed to the CPU for processing. On the other hand, a is wrong because it denies the basic fact that machine language and assembly language depend on the CPU, and c is wrong because it claims that a high-level language makes possible operations that go beyond the capability of machine language. Therefore the only appropriate statement is b, and ウ, which lists b alone, is the correct answer.
- **en after**: The correct answer is ウ, b. The only appropriate statement is b. Statement b — a program converted by a compiler is ultimately converted into machine language before it is executed — is correct because the only instructions a CPU can interpret and execute directly are machine language instructions (instruction codes expressed as sequences of 0s and 1s). A source program written in a language that people read and write, such as C, cannot be understood by the CPU as it is. The compiler therefore translates the whole source program at once and generates an object program (machine language), which is a form the CPU can execute. What actually runs at execution time is this machine language, not the source code itself. Even with a method such as an interpreter, which interprets and executes the program one line at a time, it is still machine language instructions that are finally passed to the CPU for processing. On the other hand, a is wrong because it denies the basic fact that machine language and assembly language depend on the CPU, and c is wrong because it claims that a high-level language makes possible operations that go beyond the capability of machine language. Therefore the only appropriate statement is b, and ウ, which lists b alone, is the correct answer.


#### 2011h23tokubetsu-q088 d:ウ

- **jp before**: 暗号化が守るのは機密性 (第三者に内容を読まれないこと) であって、通信路上の誤りや改ざんを直して元データを復元する機能はもたない。誤りを訂正するのはパリティチェックやハミング符号などの誤り訂正符号の役割であり、また改ざんについては訂正ではなく検知が基本で、ハッシュ値の照合、メッセージ認証コード (MAC)、ディジタル署名によって完全性を確認する。共通鍵暗号方式で改ざんされた暗号文を復号すると、意味をなさないデータになるだけで元には戻らないため、記述は誤りである。
- **jp after**: 暗号化が守るのは機密性 (第三者に内容を読まれないこと) であって、通信路上の誤りや改ざんを直して元データを復元する機能はもたない。誤りの検出はパリティチェック、訂正はハミング符号などの誤り訂正符号の役割であり、また改ざんについては訂正ではなく検知が基本で、ハッシュ値の照合、メッセージ認証コード (MAC)、ディジタル署名によって完全性を確認する。共通鍵暗号方式で改ざんされた暗号文を復号すると、意味をなさないデータになるだけで元には戻らないため、記述は誤りである。

- **zh before**: 加密所保护的是机密性（内容不被第三方读取），它并不具备把通信路径上的错误或篡改改正过来、还原原始数据的功能。纠正错误是奇偶校验、汉明码等纠错码的职责；而对于篡改，基本做法是检测而不是纠正，要通过比对哈希值、消息认证码（MAC）、数字签名来确认完整性。用共享密钥加密方式去解密被篡改过的密文，只会得到毫无意义的数据，并不能恢复原状，所以这一描述是错误的。
- **zh after**: 加密所保护的是机密性（内容不被第三方读取），它并不具备把通信路径上的错误或篡改改正过来、还原原始数据的功能。检测错误是奇偶校验的职责，纠正错误是汉明码等纠错码的职责；而对于篡改，基本做法是检测而不是纠正，要通过比对哈希值、消息认证码（MAC）、数字签名来确认完整性。用共享密钥加密方式去解密被篡改过的密文，只会得到毫无意义的数据，并不能恢复原状，所以这一描述是错误的。

- **en before**: What encryption protects is confidentiality (keeping the content from being read by a third party); it has no function for correcting errors or tampering that occur on the communication path and restoring the original data. Correcting errors is the role of error-correcting codes such as parity checks and Hamming codes, and for tampering the basic approach is detection rather than correction — integrity is confirmed by comparing hash values, by a message authentication code (MAC), or by a digital signature. Decrypting a tampered ciphertext with symmetric-key cryptography only yields meaningless data and does not restore the original, so this statement is wrong.
- **en after**: What encryption protects is confidentiality (keeping the content from being read by a third party); it has no function for correcting errors or tampering that occur on the communication path and restoring the original data. Detecting errors is the role of parity checks, and correcting them is the role of error-correcting codes such as Hamming codes, and for tampering the basic approach is detection rather than correction — integrity is confirmed by comparing hash values, by a message authentication code (MAC), or by a digital signature. Decrypting a tampered ciphertext with symmetric-key cryptography only yields meaningless data and does not restore the original, so this statement is wrong.


#### 2011h23tokubetsu-q092 correct

- **jp before**: 正解はウ。この問題は「原因調査を誰が行うか」と「バグだった場合の修正費用を誰が負担するか」の二点を、保守契約という取決めに照らして判断させるものである。まず調査について。W社は検収と同時にX社と保守契約を結んでいる。保守契約とは、納品後に稼働しているシステムについて、障害発生時の原因調査・復旧・修正、問合せ対応、稼働状況の点検などをベンダが継続的に提供する契約であり、利用者はその対価として保守料を支払う。障害が起きたときにベンダへ調査を依頼できることこそが保守契約を結ぶ目的であるから、W社が自力で原因を追う必要はなく、開発元であり内部構造を最もよく知るX社へ調査を依頼するのが正しい行動である。次に費用について。調査の結果、原因がX社の開発したシステムのバグだったのであれば、それは「あらかじめ合意した仕様どおりに動作していない」という納入物そのものの欠陥であり、納入者であるX社の責任である。この場合X社は契約不適合責任 (旧・瑕疵担保責任) を負い、無償で修正しなければならない。検収を終えていても、検収時には発見できなかった不具合についてはこの責任が及ぶ点が重要である。さらに本件では保守契約も締結されており、契約範囲内の障害対応の対価は保守料として既に支払われているから、この面からも追加費用は発生しない。よって「X社に原因調査を依頼し、X社のバグであれば無償で修正してもらう」とするウが、W社として行うべきことである。
- **jp after**: 正解はウ。この問題は「原因調査を誰が行うか」と「バグだった場合の修正費用を誰が負担するか」の二点を、保守契約という取決めに照らして判断させるものである。まず調査について。W社は検収と同時にX社と保守契約を結んでいる。X社の提案では、この保守契約の内容は「導入したシステムに関する問合せ，障害の切分けの対応」である。障害の切分け (原因がどこにあるかの特定) をX社に依頼できるのだから、W社が自力で原因を追う必要はなく、開発元であり内部構造を最もよく知るX社へ調査を依頼するのが正しい行動である。次に費用について。調査の結果、原因がX社の開発したシステムのバグだったのであれば、それは「あらかじめ合意した仕様どおりに動作していない」という納入物そのものの欠陥であり、納入者であるX社の責任である。契約条件では X社の開発物の瑕疵担保期間は「検収後 6 か月」で、障害は検収の翌月に発生しているので期間内である。したがって X社は瑕疵担保責任 (現在の民法では契約不適合責任) を負い、無償で修正しなければならない。無償になる根拠はこの瑕疵担保責任であり、保守契約ではない (本問の保守契約の範囲は問合せと障害の切分けで、修正は含まれない)。期間を過ぎてから見つかったバグは、別の取決めがなければ有償になり得る。よって「X社に原因調査を依頼し、X社のバグであれば無償で修正してもらう」とするウが、W社として行うべきことである。

- **zh before**: 正确答案是ウ。本题要求依据维护合同这一约定，判断两点：一是由谁来调查原因，二是如果原因是缺陷，修复费用由谁承担。先看调查。W公司在验收的同时与X公司签订了维护合同。所谓维护合同，是指供应商就交付后正在运行的系统，持续提供故障发生时的原因调查、恢复、修复、咨询应答、运行状况检查等服务，用户方为此支付维护费的合同。发生故障时能够委托供应商进行调查，正是签订维护合同的目的所在，因此W公司无需自己去追查原因，委托作为开发方、最了解系统内部结构的X公司进行调查才是正确的做法。再看费用。如果调查结果表明原因是X公司开发的系统的缺陷，那就属于「未按事先约定的规格运行」这一交付物本身的瑕疵，责任在交付方X公司。此时X公司要承担合同不符责任（原瑕疵担保责任），必须免费修复。重要的是，即使已经完成验收，对于验收时未能发现的缺陷，这一责任依然适用。而且本案中还签订了维护合同，合同范围内的故障处理对价已经以维护费的形式支付过了，因此从这一点看也不会产生额外费用。所以，「委托X公司调查故障原因，如果原因是X公司的缺陷则由其免费修复」的ウ，才是W公司应当采取的做法。
- **zh after**: 正确答案是ウ。本题要求依据维护合同这一约定，判断两点：一是由谁来调查原因，二是如果原因是缺陷，修复费用由谁承担。先看调查。W公司在验收的同时与X公司签订了维护合同。按X公司的提案，这份维护合同的内容是「对所导入系统的咨询以及故障的隔离（判定原因所在）」。既然可以委托X公司进行故障隔离，W公司无需自己去追查原因，委托作为开发方、最了解系统内部结构的X公司进行调查才是正确的做法。再看费用。如果调查结果表明原因是X公司开发的系统的缺陷，那就属于「未按事先约定的规格运行」这一交付物本身的瑕疵，责任在交付方X公司。合同条件规定X公司开发物的瑕疵担保期间为「验收后 6 个月」，而故障发生在验收的次月，处于期间之内。因此X公司要承担瑕疵担保责任（现行民法称合同不符责任），必须免费修复。免费的依据是这一瑕疵担保责任，而不是维护合同（本题维护合同的范围是咨询和故障隔离，不包括修复）。超过期间后才发现的缺陷，如果没有另行约定，可能变成有偿。所以，「委托X公司调查故障原因，如果原因是X公司的缺陷则由其免费修复」的ウ，才是W公司应当采取的做法。

- **en before**: The correct answer is ウ. This question asks you to judge two things against the arrangement called a maintenance contract: who investigates the cause, and who bears the repair cost if the cause is a bug. First, the investigation. Company W signed a maintenance contract with Company X at the same time as the acceptance. A maintenance contract is a contract in which the vendor continuously provides services for a system that is running after delivery — investigating the cause of failures, restoring and repairing the system, answering inquiries, checking the operating status, and so on — while the user pays a maintenance fee in return. Being able to ask the vendor to investigate when a failure occurs is exactly the purpose of signing a maintenance contract, so Company W does not need to track down the cause by itself; the correct action is to ask Company X, which developed the system and knows its internal structure best, to investigate. Next, the cost. If the investigation shows that the cause is a bug in the system developed by Company X, that is a defect in the delivered item itself — it does not work according to the specifications agreed in advance — and the responsibility lies with Company X, the supplier. In that case Company X bears liability for non-conformity with the contract (formerly called warranty liability for defects) and must repair it free of charge. What matters here is that this liability still applies to defects that could not be found at the time of acceptance, even though acceptance has been completed. Furthermore, a maintenance contract has also been signed in this case, and the consideration for handling failures within the scope of the contract has already been paid as the maintenance fee, so from this angle too no extra cost arises. Therefore ウ — ask Company X to investigate the cause of the trouble and, if the cause is a bug of Company X, have it repaired free of charge — is what Company W should do.
- **en after**: The correct answer is ウ. This question asks you to judge two things against the arrangement called a maintenance contract: who investigates the cause, and who bears the repair cost if the cause is a bug. First, the investigation. Company W signed a maintenance contract with Company X at the same time as the acceptance. In Company X's proposal, this maintenance contract covers “inquiries about the installed system and isolating failures” (identifying where the cause lies). Since Company W can ask Company X to isolate the failure, Company W does not need to track down the cause by itself; the correct action is to ask Company X, which developed the system and knows its internal structure best, to investigate. Next, the cost. If the investigation shows that the cause is a bug in the system developed by Company X, that is a defect in the delivered item itself — it does not work according to the specifications agreed in advance — and the responsibility lies with Company X, the supplier. Under the contract terms, the warranty period for defects in Company X's deliverables is six months after acceptance, and the failure occurred in the month after acceptance, so it falls within that period. Company X therefore bears warranty liability for defects (called liability for non-conformity with the contract under the current Civil Code) and must repair it free of charge. The basis for the free repair is this warranty liability, not the maintenance contract (the maintenance contract in this question covers inquiries and failure isolation, not repairs). A bug found after the period has ended may be charged for unless there is a separate agreement. Therefore ウ — ask Company X to investigate the cause of the trouble and, if the cause is a bug of Company X, have it repaired free of charge — is what Company W should do.


#### 2011h23tokubetsu-q092 d:エ

- **jp before**: X社に原因調査を依頼するという前半は保守契約に沿っており正しいが、バグだった場合に有償で修正してもらうとする後半が誤りである。原因がX社の開発したシステムのバグであれば、それは納品物が合意した仕様を満たしていないということであり、X社は契約不適合責任に基づき無償で修正する義務を負う。加えて保守契約の対価は保守料として既に支払われているため、契約範囲内の障害対応に別途の費用は生じない。なお、W社側の操作ミスやW社が用意した機器の故障が原因だった場合、あるいは新たな機能追加など仕様変更に当たる依頼をする場合は、保守契約の範囲外として有償になり得る。有償か無償かは「原因が納入物の欠陥にあるかどうか」「保守契約の範囲内かどうか」で切り分ける。
- **jp after**: X社に原因調査を依頼するという前半は保守契約に沿っており正しいが、バグだった場合に有償で修正してもらうとする後半が誤りである。原因がX社の開発したシステムのバグであれば、それは納品物が合意した仕様を満たしていないということであり、X社は契約不適合責任に基づき無償で修正する義務を負う。本問の障害は検収の翌月で、瑕疵担保期間 (検収後 6 か月) の内にある。なお、W社側の操作ミスやW社が用意した機器の故障が原因だった場合、あるいは新たな機能追加など仕様変更に当たる依頼をする場合は、保守契約の範囲外として有償になり得る。有償か無償かは「原因が納入物の欠陥にあるかどうか」「瑕疵担保期間内かどうか」で切り分ける。

- **zh before**: 前半句「委托X公司调查故障原因」符合维护合同，是正确的；但后半句说如果是缺陷就有偿请其修复，则是错误的。如果原因是X公司开发的系统的缺陷，就意味着交付物没有满足约定的规格，X公司依据合同不符责任负有免费修复的义务。加之维护合同的对价已经以维护费的形式支付，合同范围内的故障处理不会另外产生费用。顺带一提，如果原因在于W公司一方的操作失误或W公司自备设备的故障，或者提出的是新增功能等属于规格变更的要求，则属于维护合同范围之外，可能变成有偿。有偿还是免费，要按「原因是否在于交付物的瑕疵」「是否在维护合同的范围之内」来区分。
- **zh after**: 前半句「委托X公司调查故障原因」符合维护合同，是正确的；但后半句说如果是缺陷就有偿请其修复，则是错误的。如果原因是X公司开发的系统的缺陷，就意味着交付物没有满足约定的规格，X公司依据合同不符责任负有免费修复的义务。本题的故障发生在验收的次月，处于瑕疵担保期间（验收后 6 个月）之内。顺带一提，如果原因在于W公司一方的操作失误或W公司自备设备的故障，或者提出的是新增功能等属于规格变更的要求，则属于维护合同范围之外，可能变成有偿。有偿还是免费，要按「原因是否在于交付物的瑕疵」「是否在瑕疵担保期间之内」来区分。

- **en before**: The first half — asking Company X to investigate the cause of the trouble — follows the maintenance contract and is correct, but the second half, having the repair done for a fee if the cause is a bug, is wrong. If the cause is a bug in the system developed by Company X, it means the delivered item does not meet the agreed specifications, and Company X has an obligation to repair it free of charge under its liability for non-conformity with the contract. In addition, the consideration for the maintenance contract has already been paid as the maintenance fee, so handling a failure within the scope of the contract incurs no separate cost. Note that if the cause lies on Company W’s side — an operating mistake, or a breakdown of equipment Company W provided — or if the request amounts to a specification change such as adding a new function, it falls outside the scope of the maintenance contract and may become chargeable. Whether work is charged for or free is decided by asking whether the cause is a defect in the delivered item, and whether the work is within the scope of the maintenance contract.
- **en after**: The first half — asking Company X to investigate the cause of the trouble — follows the maintenance contract and is correct, but the second half, having the repair done for a fee if the cause is a bug, is wrong. If the cause is a bug in the system developed by Company X, it means the delivered item does not meet the agreed specifications, and Company X has an obligation to repair it free of charge under its liability for non-conformity with the contract. The failure in this question occurred in the month after acceptance, within the warranty period for defects (six months after acceptance). Note that if the cause lies on Company W’s side — an operating mistake, or a breakdown of equipment Company W provided — or if the request amounts to a specification change such as adding a new function, it falls outside the scope of the maintenance contract and may become chargeable. Whether work is charged for or free is decided by asking whether the cause is a defect in the delivered item, and whether it is within the warranty period for defects.


#### 2011h23tokubetsu-q092 p:0

- **jp before**: 保守契約の目的と使い方 — 保守契約は、納品後に稼働しているシステムについて障害時の原因調査・復旧・修正や問合せ対応をベンダが継続的に提供し、利用者が保守料を支払う契約である。障害が発生したらまず保守契約を結んだベンダに調査を依頼するのが原則であり、利用者が自力で調査したり納品物を勝手に改変したりすると、保守料が無駄になるうえ責任の所在が不明確になる。
- **jp after**: 保守契約の目的と使い方 — 保守契約は、納品後に稼働しているシステムについて契約で定めた範囲のサービス (本問では問合せ対応と障害の切分け) をベンダが継続的に提供し、利用者が保守料を支払う契約である。障害が発生したらまず保守契約を結んだベンダに調査を依頼するのが原則であり、利用者が自力で調査したり納品物を勝手に改変したりすると、保守料が無駄になるうえ責任の所在が不明確になる。

- **zh before**: 维护合同的目的与用法 —— 维护合同是指供应商就交付后正在运行的系统，持续提供故障时的原因调查、恢复、修复以及咨询应答等服务，由用户方支付维护费的合同。发生故障时首先委托签有维护合同的供应商进行调查是原则；用户方自行调查或擅自改动交付物，不仅白白浪费维护费，还会使责任归属变得不清。
- **zh after**: 维护合同的目的与用法 —— 维护合同是指供应商就交付后正在运行的系统，持续提供合同所定范围的服务（本题为咨询应答和故障隔离），由用户方支付维护费的合同。发生故障时首先委托签有维护合同的供应商进行调查是原则；用户方自行调查或擅自改动交付物，不仅白白浪费维护费，还会使责任归属变得不清。

- **en before**: Purpose and use of a maintenance contract — A maintenance contract is one in which the vendor continuously provides services for a system that is running after delivery, such as investigating the cause of failures, restoring and repairing it, and answering inquiries, while the user pays a maintenance fee. The principle is that when a failure occurs you first ask the vendor you signed the maintenance contract with to investigate; if the user investigates alone or alters the delivered item without permission, the maintenance fee is wasted and where the responsibility lies becomes unclear.
- **en after**: Purpose and use of a maintenance contract — A maintenance contract is one in which the vendor continuously provides services for a system that is running after delivery, within the scope set by the contract (in this question, answering inquiries and isolating failures), while the user pays a maintenance fee. The principle is that when a failure occurs you first ask the vendor you signed the maintenance contract with to investigate; if the user investigates alone or alters the delivered item without permission, the maintenance fee is wasted and where the responsibility lies becomes unclear.


#### 2011h23tokubetsu-q092 p:1

- **jp before**: 納入物のバグは契約不適合責任で無償修正 — 納品されたシステムがあらかじめ合意した仕様どおりに動作しない場合、それは納入者側の責任 (契約不適合責任、旧・瑕疵担保責任) であり、検収後に発覚したものであってもベンダが無償で修正する義務を負う。一方、利用者側の操作ミスやハードウェア故障が原因の場合、および新機能追加などの仕様変更に当たる依頼は、保守契約の範囲外として有償となり得る点と区別して押さえる。
- **jp after**: 納入物のバグは契約不適合責任で無償修正 — 納品されたシステムがあらかじめ合意した仕様どおりに動作しない場合、それは納入者側の責任 (契約不適合責任、旧・瑕疵担保責任) であり、検収後に発覚したものでも、瑕疵担保期間 (本問では検収後 6 か月) 内であればベンダが無償で修正する義務を負う。一方、利用者側の操作ミスやハードウェア故障が原因の場合、および新機能追加などの仕様変更に当たる依頼は、保守契約の範囲外として有償となり得る点と区別して押さえる。

- **zh before**: 交付物的缺陷按合同不符责任免费修复 —— 交付的系统未按事先约定的规格运行时，责任在交付方（合同不符责任，原瑕疵担保责任），即使是在验收之后才发现的，供应商也有义务免费修复。另一方面，如果原因在于用户方的操作失误或硬件故障，以及新增功能等属于规格变更的要求，则属于维护合同范围之外，可能变成有偿——要与前者区分开来记牢。
- **zh after**: 交付物的缺陷按合同不符责任免费修复 —— 交付的系统未按事先约定的规格运行时，责任在交付方（合同不符责任，原瑕疵担保责任），即使是在验收之后才发现的，只要在瑕疵担保期间（本题为验收后 6 个月）之内，供应商就有义务免费修复。另一方面，如果原因在于用户方的操作失误或硬件故障，以及新增功能等属于规格变更的要求，则属于维护合同范围之外，可能变成有偿——要与前者区分开来记牢。

- **en before**: A bug in the delivered item is repaired free of charge under liability for non-conformity — When a delivered system does not work according to the specifications agreed in advance, the responsibility lies with the supplier (liability for non-conformity with the contract, formerly warranty liability for defects), and the vendor is obliged to repair it free of charge even if the problem comes to light after acceptance. On the other hand, keep this apart from the opposite case: when the cause is an operating mistake on the user’s side or a hardware breakdown, and when the request amounts to a specification change such as adding a new function, the work falls outside the scope of the maintenance contract and may be charged for.
- **en after**: A bug in the delivered item is repaired free of charge under liability for non-conformity — When a delivered system does not work according to the specifications agreed in advance, the responsibility lies with the supplier (liability for non-conformity with the contract, formerly warranty liability for defects), and the vendor is obliged to repair it free of charge even if the problem comes to light after acceptance, as long as it is within the warranty period (six months after acceptance in this question). On the other hand, keep this apart from the opposite case: when the cause is an operating mistake on the user’s side or a hardware breakdown, and when the request amounts to a specification change such as adding a new function, the work falls outside the scope of the maintenance contract and may be charged for.


#### 2012h24a-q009 p:0

- **jp before**: 知的財産権のうち産業財産権 4 法の守備範囲を対象で覚える。特許法=発明 (技術的思想)、実用新案法=物品の形状・構造に関する考案、意匠法=デザイン、商標法=ブランドの目印。仕組み・アイディアを守るのは特許法だけである。
- **jp after**: 知的財産権のうち産業財産権 4 法の守備範囲を対象で覚える。特許法=発明 (技術的思想)、実用新案法=物品の形状・構造に関する考案、意匠法=デザイン、商標法=ブランドの目印。技術的なアイディアを守るのは特許法と実用新案法で、ビジネスモデルのような方法・仕組みまで守れるのは特許法だけである (実用新案は物品の形状・構造・組合せに限られる)。

- **zh before**: 按保护对象来记住知识产权中工业产权四部法律的管辖范围：专利法＝发明（技术思想）、实用新型法＝关于物品形状与构造的技术方案、外观设计法＝设计、商标法＝品牌的标识。保护运作机制与想法的只有专利法。
- **zh after**: 按保护对象来记住知识产权中工业产权四部法律的管辖范围：专利法＝发明（技术思想）、实用新型法＝关于物品形状与构造的技术方案、外观设计法＝设计、商标法＝品牌的标识。保护技术性想法的是专利法和实用新型法，而能保护商业模式这类方法和运作机制的只有专利法（实用新型仅限于物品的形状、构造及其组合）。

- **en before**: Memorize the coverage of the four industrial property laws within intellectual property rights by what each protects: Patent Act = inventions (technical ideas); Utility Model Act = devices relating to the shape or structure of an article; Design Act = designs; Trademark Act = brand marks. The only one that protects a mechanism or an idea is the Patent Act.
- **en after**: Memorize the coverage of the four industrial property laws within intellectual property rights by what each protects: Patent Act = inventions (technical ideas); Utility Model Act = devices relating to the shape or structure of an article; Design Act = designs; Trademark Act = brand marks. Technical ideas are protected by the Patent Act and the Utility Model Act, but only the Patent Act can protect a method or mechanism such as a business model (utility models are limited to the shape, structure, or combination of articles).


#### 2012h24a-q017 correct

- **jp before**: 正解は イ の「BtoC」。BtoC は Business to Consumer の略で、企業（Business）が個人消費者（Consumer）に商品やサービスを直接販売する電子商取引の形態です。設問の「インターネット上で構築された個人向けのオンライン書店や電子商店街」は、書店やモールを運営する事業者が売り手となり、買い手は一般の個人利用者ですから、取引の向きはまさに企業から消費者へ。つまり BtoC に該当します。BtoC の典型例としては、ネット通販サイト、電子商店街（複数の店舗が出店するショッピングモール型サイト）、音楽や電子書籍の配信サービス、オンラインバンキングやネット証券などが挙げられます。取引形態の名前は「（前）売り手 to （後）買い手」の順で当事者の種別を表す、と覚えると迷いません。
- **jp after**: 正解は イ の「BtoC」。BtoC は Business to Consumer の略で、企業（Business）が個人消費者（Consumer）に商品やサービスを直接販売する電子商取引の形態です。設問の「インターネット上で構築された個人向けのオンライン書店や電子商店街」は、書店やモールを運営する事業者が売り手となり、買い手は一般の個人利用者ですから、取引の向きはまさに企業から消費者へ。つまり BtoC に該当します。BtoC の典型例としては、ネット通販サイト、電子商店街（複数の店舗が出店するショッピングモール型サイト）、音楽や電子書籍の配信サービス、オンラインバンキングやネット証券などが挙げられます。取引形態の名前は「（前）商品・サービス・情報を提供する側（取引の起点） to （後）受け取る側」の順で当事者の種別を表す、と覚えると迷いません。

- **zh before**: 正确答案是 イ 的「BtoC」。BtoC 是 Business to Consumer 的缩写，指企业（Business）向个人消费者（Consumer）直接销售商品或服务的电子商务形态。题目所说的「在互联网上构建的面向个人的在线书店、电子商城」，卖方是经营书店或商城的企业，买方则是普通的个人用户，所以交易的方向正是从企业到消费者，也就是属于 BtoC。BtoC 的典型例子有：网络购物网站、电子商城（多家店铺入驻的购物中心型网站）、音乐和电子书的在线分发服务、网上银行和网络证券等。只要记住交易形态的名称是按照「（前）卖方 to （后）买方」的顺序来表示当事方类别，就不会弄混。
- **zh after**: 正确答案是 イ 的「BtoC」。BtoC 是 Business to Consumer 的缩写，指企业（Business）向个人消费者（Consumer）直接销售商品或服务的电子商务形态。题目所说的「在互联网上构建的面向个人的在线书店、电子商城」，卖方是经营书店或商城的企业，买方则是普通的个人用户，所以交易的方向正是从企业到消费者，也就是属于 BtoC。BtoC 的典型例子有：网络购物网站、电子商城（多家店铺入驻的购物中心型网站）、音乐和电子书的在线分发服务、网上银行和网络证券等。只要记住交易形态的名称是按照「（前）提供商品、服务或信息的一方（交易的起点） to （后）接受的一方」的顺序来表示当事方类别，就不会弄混。

- **en before**: The correct answer is イ, BtoC. BtoC stands for Business to Consumer, a form of electronic commerce in which a business (Business) sells goods or services directly to individual consumers (Consumer). In the consumer-oriented online bookstores and online shopping malls built on the Internet that the question describes, the seller is the company operating the bookstore or the mall, and the buyer is an ordinary individual user, so the direction of the transaction is exactly from business to consumer. That is, it falls under BtoC. Typical examples of BtoC include online shopping sites, online shopping malls (mall-type sites where many stores open outlets), music and e-book distribution services, online banking, and online securities trading. If you remember that the name of a transaction form lists the party types in the order of seller first and buyer second, you will not get confused.
- **en after**: The correct answer is イ, BtoC. BtoC stands for Business to Consumer, a form of electronic commerce in which a business (Business) sells goods or services directly to individual consumers (Consumer). In the consumer-oriented online bookstores and online shopping malls built on the Internet that the question describes, the seller is the company operating the bookstore or the mall, and the buyer is an ordinary individual user, so the direction of the transaction is exactly from business to consumer. That is, it falls under BtoC. Typical examples of BtoC include online shopping sites, online shopping malls (mall-type sites where many stores open outlets), music and e-book distribution services, online banking, and online securities trading. If you remember that the name of a transaction form lists the party types in the order of the side that provides goods, services, or information (the starting point of the transaction) first and the side that receives them second, you will not get confused.


#### 2012h24a-q017 d:ウ

- **jp before**: CtoB は Consumer to Business で、個人が売り手・企業が買い手になる形態です。個人が希望価格を提示して企業がそれに応じる逆オークション、個人が撮影した写真素材を企業に販売するストックフォトサイト、個人からの中古品買取サービスなどが例です。オンライン書店では企業が売り手ですから、売り買いの向きが逆で誤りです。
- **jp after**: CtoB は Consumer to Business で、個人が起点となって企業と取引する形態です (個人が商品・情報を企業に提供する、または個人が条件を示して企業が応じる)。個人が希望価格を提示して企業がそれに応じる逆オークション、個人が撮影した写真素材を企業に販売するストックフォトサイト、個人からの中古品買取サービスなどが例です。オンライン書店は企業が起点となって個人に販売する形態ですから、取引の向きが逆で誤りです。

- **zh before**: CtoB 是 Consumer to Business，即个人为卖方、企业为买方的形态。例如由个人提出期望价格、再由企业来响应的反向拍卖，个人把自己拍摄的照片素材卖给企业的图库网站，以及从个人手中回收二手物品的服务等。在线书店中卖方是企业，买卖的方向正好相反，所以错误。
- **zh after**: CtoB 是 Consumer to Business，即由个人作为起点与企业进行交易的形态（个人向企业提供商品或信息，或由个人提出条件、企业来响应）。例如由个人提出期望价格、再由企业来响应的反向拍卖，个人把自己拍摄的照片素材卖给企业的图库网站，以及从个人手中回收二手物品的服务等。在线书店是由企业作为起点向个人销售的形态，交易的方向正好相反，所以错误。

- **en before**: CtoB is Consumer to Business, a form in which an individual is the seller and a company is the buyer. Examples include reverse auctions where an individual states a desired price and a company responds, stock photo sites where individuals sell photographs they took to companies, and services that buy used items from individuals. In an online bookstore the seller is a company, so the direction of buying and selling is reversed, which makes this choice wrong.
- **en after**: CtoB is Consumer to Business, a form in which an individual is the starting point of a transaction with a company (an individual provides goods or information to a company, or an individual states conditions and a company responds). Examples include reverse auctions where an individual states a desired price and a company responds, stock photo sites where individuals sell photographs they took to companies, and services that buy used items from individuals. An online bookstore is a form in which a company is the starting point and sells to individuals, so the direction of the transaction is reversed, which makes this choice wrong.


#### 2012h24a-q017 p:0

- **jp before**: EC（電子商取引）の形態は「売り手 to 買い手」の当事者種別で分類する。B＝Business（企業）、C＝Consumer（個人消費者）、G＝Government（行政）。BtoB＝企業間取引、BtoC＝企業から個人への通販、CtoC＝個人間のネットオークション・フリマ、CtoB＝個人から企業への逆オークションや素材販売、BtoG／GtoC＝電子調達や電子申請。
- **jp after**: EC（電子商取引）の形態は「提供する側（取引の起点） to 受け取る側」の当事者種別で分類する。B＝Business（企業）、C＝Consumer（個人消費者）、G＝Government（行政）。BtoB＝企業間取引、BtoC＝企業から個人への通販、CtoC＝個人間のネットオークション・フリマ、CtoB＝個人から企業への逆オークションや素材販売、BtoG／GtoC＝電子調達や電子申請。

- **zh before**: EC（电子商务）的形态是按照「卖方 to 买方」的当事方类别来分类的。B＝Business（企业）、C＝Consumer（个人消费者）、G＝Government（政府）。BtoB＝企业间交易，BtoC＝企业面向个人的网络销售，CtoC＝个人之间的网络拍卖和二手交易，CtoB＝个人面向企业的反向拍卖和素材销售，BtoG／GtoC＝电子采购和电子申请。
- **zh after**: EC（电子商务）的形态是按照「提供的一方（交易的起点） to 接受的一方」的当事方类别来分类的。B＝Business（企业）、C＝Consumer（个人消费者）、G＝Government（政府）。BtoB＝企业间交易，BtoC＝企业面向个人的网络销售，CtoC＝个人之间的网络拍卖和二手交易，CtoB＝个人面向企业的反向拍卖和素材销售，BtoG／GtoC＝电子采购和电子申请。

- **en before**: Forms of EC (electronic commerce) are classified by the types of the parties, in the order of seller to buyer. B = Business (company), C = Consumer (individual consumer), G = Government. BtoB = transactions between companies; BtoC = online retailing from a company to individuals; CtoC = online auctions and flea market trading between individuals; CtoB = reverse auctions and sales of materials from individuals to companies; BtoG / GtoC = electronic procurement and electronic applications.
- **en after**: Forms of EC (electronic commerce) are classified by the types of the parties, in the order of the providing side (the starting point of the transaction) to the receiving side. B = Business (company), C = Consumer (individual consumer), G = Government. BtoB = transactions between companies; BtoC = online retailing from a company to individuals; CtoC = online auctions and flea market trading between individuals; CtoB = reverse auctions and sales of materials from individuals to companies; BtoG / GtoC = electronic procurement and electronic applications.


#### 2012h24a-q018 p:1

- **jp before**: 事業再編の手法の区別: アライアンス（提携、資本移動を伴わず資源を補完）／会社分割・合弁会社設立（事業を切り出して統合）／M&A・買収（他社を取得）／MBO（自社を経営陣が取得）。なお MBO には「目標管理制度（Management by Objectives）」の意味もあるため、本問のように事業再編の文脈かどうかで判断する。
- **jp after**: 事業再編の手法の区別: アライアンス（提携、経営権の移転を原則伴わず資源を補完）／会社分割・合弁会社設立（事業を切り出して統合）／M&A・買収（他社を取得）／MBO（自社を経営陣が取得）。なお MBO には「目標管理制度（Management by Objectives）」の意味もあるため、本問のように事業再編の文脈かどうかで判断する。

- **zh before**: 业务重组手法的区分：联盟（合作，不涉及股权变动，互相补足资源）／公司分立、设立合资公司（把业务剥离出来加以整合）／M&A・收购（取得其他公司）／MBO（管理层取得本公司）。另外，MBO 还有「目标管理制度（Management by Objectives）」的含义，因此要像本题这样，根据是否处于业务重组的语境来判断。
- **zh after**: 业务重组手法的区分：联盟（合作，原则上不涉及经营权转移，互相补足资源）／公司分立、设立合资公司（把业务剥离出来加以整合）／M&A・收购（取得其他公司）／MBO（管理层取得本公司）。另外，MBO 还有「目标管理制度（Management by Objectives）」的含义，因此要像本题这样，根据是否处于业务重组的语境来判断。

- **en before**: Telling business restructuring methods apart: alliance (a tie-up that complements resources without any movement of capital) / corporate split and establishment of a joint venture (carving out a business and combining it) / M&A and acquisition (taking over another company) / MBO (the management taking over its own company). Note also that MBO can mean Management by Objectives, so judge from whether the context is business restructuring, as it is in this question.
- **en after**: Telling business restructuring methods apart: alliance (a tie-up that complements resources without, in principle, any transfer of management control) / corporate split and establishment of a joint venture (carving out a business and combining it) / M&A and acquisition (taking over another company) / MBO (the management taking over its own company). Note also that MBO can mean Management by Objectives, so judge from whether the context is business restructuring, as it is in this question.


#### 2012h24a-q055 p:1

- **jp before**: RAID は複数のハードディスクをまとめて 1 台のように扱い、信頼性や性能を高める技術の総称。ストライピングにパリティを組み合わせて速度と耐障害性を両立させた RAID5、ミラーリングとストライピングを併用した RAID10 (RAID0+1) などの構成もある。
- **jp after**: RAID は複数のハードディスクをまとめて 1 台のように扱い、信頼性や性能を高める技術の総称。ストライピングにパリティを組み合わせて速度と耐障害性を両立させた RAID5、ミラーリングとストライピングを併用した RAID10 (RAID1+0) などの構成もある。

- **zh before**: RAID 是把多块硬盘汇总起来当作 1 台来使用、以提高可靠性和性能的技术的总称。此外还有把条带化与奇偶校验（parity）结合起来、同时兼顾速度与容错性的 RAID5，以及把镜像和条带化并用的 RAID10（RAID0+1）等构成。
- **zh after**: RAID 是把多块硬盘汇总起来当作 1 台来使用、以提高可靠性和性能的技术的总称。此外还有把条带化与奇偶校验（parity）结合起来、同时兼顾速度与容错性的 RAID5，以及把镜像和条带化并用的 RAID10（RAID1+0）等构成。

- **en before**: RAID is the general term for technologies that group multiple hard disks together and handle them as if they were one, so as to raise reliability and performance. There are also configurations such as RAID5, which combines striping with parity to achieve both speed and fault tolerance, and RAID10 (RAID0+1), which uses mirroring and striping together.
- **en after**: RAID is the general term for technologies that group multiple hard disks together and handle them as if they were one, so as to raise reliability and performance. There are also configurations such as RAID5, which combines striping with parity to achieve both speed and fault tolerance, and RAID10 (RAID1+0), which uses mirroring and striping together.


#### 2012h24h-q060 p:1

- **jp before**: 紛らわしいファイル転送関連用語の区別: FTPS / SFTP = FTP に暗号化を加えたもの、HTTP / HTTPS = Web 通信のプロトコル、TFTP = 認証機能を持たない UDP ベースの軽量・簡易なファイル転送プロトコル。
- **jp after**: 紛らわしいファイル転送関連用語の区別: FTPS = FTP に SSL/TLS による暗号化を加えたもの、SFTP = SSH 上で暗号化して転送する別のプロトコル、HTTP / HTTPS = Web 通信のプロトコル、TFTP = 認証機能を持たない UDP ベースの軽量・簡易なファイル転送プロトコル。

- **zh before**: 容易混淆的文件传输相关术语的区分：FTPS / SFTP = 在 FTP 上加了加密的方式，HTTP / HTTPS = Web 通信协议，TFTP = 不具备认证功能、基于 UDP 的轻量简易文件传输协议。
- **zh after**: 容易混淆的文件传输相关术语的区分：FTPS = 在 FTP 上加了 SSL/TLS 加密的方式，SFTP = 在 SSH 上加密传输的另一种协议，HTTP / HTTPS = Web 通信协议，TFTP = 不具备认证功能、基于 UDP 的轻量简易文件传输协议。

- **en before**: Telling confusable file-transfer terms apart: FTPS / SFTP = FTP with encryption added, HTTP / HTTPS = protocols for Web communication, TFTP = a lightweight, simple UDP-based file transfer protocol with no authentication functionality.
- **en after**: Telling confusable file-transfer terms apart: FTPS = FTP with SSL/TLS encryption added, SFTP = a separate protocol that transfers files encrypted over SSH, HTTP / HTTPS = protocols for Web communication, TFTP = a lightweight, simple UDP-based file transfer protocol with no authentication functionality.


#### 2012h24h-q063 d:ア

- **jp before**: 速度の大小が逆である。HDD は CD-ROM 装置よりも読み書きが高速なのが一般的で、CD-ROM 装置の方が遅い。さらに CD-ROM は Read Only Memory の名のとおり読出し専用なので、そもそも書込みの速度を比較することができない。HDD が主記憶と補助記憶の橋渡し役として常用され、光ディスクが配布・保存メディアとして使われるのも、この速度差が理由の一つである。
- **jp after**: 速度の大小が逆である。HDD は CD-ROM 装置よりも読み書きが高速なのが一般的で、CD-ROM 装置の方が遅い。さらに CD-ROM は Read Only Memory の名のとおり読出し専用なので、そもそも書込みの速度を比較することができない。HDD が OS やファイルを置く常用の補助記憶として使われ、光ディスクが配布・保存メディアとして使われるのも、この速度差が理由の一つである。

- **zh before**: 速度的快慢说反了。HDD 的读写通常比 CD-ROM 驱动器更快，反而是 CD-ROM 驱动器更慢。而且 CD-ROM 正如 Read Only Memory 这个名称所示是只读的，所以本来就无法比较写入速度。HDD 之所以被长期用作主存储器与辅助存储器之间的桥梁，而光盘则被用作分发和保存介质，这一速度差异也是原因之一。
- **zh after**: 速度的快慢说反了。HDD 的读写通常比 CD-ROM 驱动器更快，反而是 CD-ROM 驱动器更慢。而且 CD-ROM 正如 Read Only Memory 这个名称所示是只读的，所以本来就无法比较写入速度。HDD 之所以被用作存放操作系统和文件的常用辅助存储器，而光盘则被用作分发和保存介质，这一速度差异也是原因之一。

- **en before**: The relative speeds are reversed. An HDD is generally faster to read and write than a CD-ROM drive; the CD-ROM drive is the slower of the two. Moreover, a CD-ROM is read-only, just as the name Read Only Memory indicates, so its write speed cannot be compared in the first place. This speed difference is one reason why the HDD is routinely used as the bridge between main memory and secondary storage, while optical discs are used as media for distribution and storage.
- **en after**: The relative speeds are reversed. An HDD is generally faster to read and write than a CD-ROM drive; the CD-ROM drive is the slower of the two. Moreover, a CD-ROM is read-only, just as the name Read Only Memory indicates, so its write speed cannot be compared in the first place. This speed difference is one reason why the HDD is routinely used as the everyday secondary storage that holds the OS and files, while optical discs are used as media for distribution and storage.


#### 2013h25a-q003 correct

- **jp before**: 正解はエ「自己資本に対して, どれだけの利益を生み出したかを表す指標」。ROE (Return On Equity) は日本語では自己資本利益率 (株主資本利益率) と呼ばれ、当期純利益 ÷ 自己資本 × 100 (%) で計算する。分母の自己資本 (純資産) は株主が出資した資本と会社が内部に蓄えた利益からなる、返済義務のない資金である。したがって ROE は「株主が預けたお金を使って、企業がどれだけ効率よく利益を稼いだか」を示す指標であり、値が高いほど株主から見た資本の運用効率がよいと判断される。名称を英語から読み解くと、Return (利益) On (対する) Equity (自己資本) となり、選択肢エの「自己資本に対して, どれだけの利益を生み出したか」という表現とそのまま対応する。分母が何か (自己資本か、総資産か、株価か) に注目すれば、収益性指標は確実に区別できる。
- **jp after**: 正解はエ「自己資本に対して, どれだけの利益を生み出したかを表す指標」。ROE (Return On Equity) は日本語では自己資本利益率 (株主資本利益率) と呼ばれ、当期純利益 ÷ 自己資本 × 100 (%) で計算する。分母の自己資本 (純資産) は株主が出資した資本と会社が内部に蓄えた利益からなる、返済義務のない資金である。したがって ROE は「株主が預けたお金を使って、企業がどれだけ効率よく利益を稼いだか」を示す指標であり、値が高いほど株主から見た資本の運用効率がよいと判断される。名称を英語から読み解くと、Return (利益) On (対する) Equity (自己資本) となり、選択肢エの「自己資本に対して, どれだけの利益を生み出したか」という表現とそのまま対応する。分母が何か (自己資本か、総資産か) に注目すれば、収益性指標は確実に区別できる。

- **zh before**: 正确答案是 エ「表示相对于自有资本产生了多少利润的指标」。ROE (Return On Equity) 在日语中称为自己資本利益率 (株主資本利益率)，中文即净资产收益率，用 净利润 ÷ 自有资本 × 100 (%) 计算。分母的自有资本 (净资产) 由股东出资的资本和公司内部留存的利润构成，是没有偿还义务的资金。因此 ROE 是表示“企业运用股东投入的钱、多有效率地赚到了利润”的指标，数值越高，就可判断从股东角度看资本的运用效率越好。从英文名称来解读，Return (利润) On (相对于) Equity (自有资本)，正好与选项 エ 的“相对于自有资本产生了多少利润”这一表述直接对应。只要关注分母是什么 (是自有资本、总资产，还是股价)，就能可靠地区分各种盈利性指标。
- **zh after**: 正确答案是 エ「表示相对于自有资本产生了多少利润的指标」。ROE (Return On Equity) 在日语中称为自己資本利益率 (株主資本利益率)，中文即净资产收益率，用 净利润 ÷ 自有资本 × 100 (%) 计算。分母的自有资本 (净资产) 由股东出资的资本和公司内部留存的利润构成，是没有偿还义务的资金。因此 ROE 是表示“企业运用股东投入的钱、多有效率地赚到了利润”的指标，数值越高，就可判断从股东角度看资本的运用效率越好。从英文名称来解读，Return (利润) On (相对于) Equity (自有资本)，正好与选项 エ 的“相对于自有资本产生了多少利润”这一表述直接对应。只要关注分母是什么 (是自有资本还是总资产)，就能可靠地区分各种盈利性指标。

- **en before**: The correct answer is エ, “An indicator that expresses how much profit was generated relative to shareholders’ equity (own capital).” ROE (Return On Equity) is called 自己資本利益率 (also 株主資本利益率) in Japanese, and it is calculated as net income ÷ shareholders’ equity × 100 (%). The denominator, shareholders’ equity (net assets), consists of the capital contributed by shareholders plus the profit the company has retained internally, and it is money that carries no obligation to repay. ROE therefore shows “how efficiently the company earned profit using the money entrusted to it by shareholders,” and the higher the value, the better the efficiency of capital use from the shareholders’ point of view. Reading the English name gives Return (profit) On (relative to) Equity (own capital), which corresponds directly to the wording of choice エ, “how much profit was generated relative to shareholders’ equity.” If you focus on what the denominator is (shareholders’ equity, total assets, or the stock price), you can reliably tell the profitability indicators apart.
- **en after**: The correct answer is エ, “An indicator that expresses how much profit was generated relative to shareholders’ equity (own capital).” ROE (Return On Equity) is called 自己資本利益率 (also 株主資本利益率) in Japanese, and it is calculated as net income ÷ shareholders’ equity × 100 (%). The denominator, shareholders’ equity (net assets), consists of the capital contributed by shareholders plus the profit the company has retained internally, and it is money that carries no obligation to repay. ROE therefore shows “how efficiently the company earned profit using the money entrusted to it by shareholders,” and the higher the value, the better the efficiency of capital use from the shareholders’ point of view. Reading the English name gives Return (profit) On (relative to) Equity (own capital), which corresponds directly to the wording of choice エ, “how much profit was generated relative to shareholders’ equity.” If you focus on what the denominator is (shareholders’ equity or total assets), you can reliably tell the profitability indicators apart.


#### 2013h25a-q003 p:1

- **jp before**: 収益性・投資指標は分母で区別する。分母が自己資本なら ROE、総資産 (自己資本 + 他人資本) なら ROA、1 株当たり利益に対する株価の倍率なら PER、資本コストを超えた利益額なら EVA。英語名 (Equity / Assets / Price・Earnings) が分母と分子の手がかりになる。
- **jp after**: 収益性指標は分母で区別する。分母が自己資本なら ROE、総資産 (自己資本 + 他人資本) なら ROA。投資指標の PER は株価 ÷ 1 株当たり利益 (分母は 1 株当たり利益)、EVA は資本コストを超えた利益の金額 (比率ではなく分母を持たない)。英語名 (Equity / Assets / Price・Earnings) が分母と分子の手がかりになる。

- **zh before**: 盈利性指标和投资指标要靠分母来区分。分母是自有资本就是 ROE，是总资产 (自有资本 + 负债资本) 就是 ROA，是每股利润对应的股价倍数就是 PER，是超过资本成本的利润金额就是 EVA。英文名称 (Equity / Assets / Price・Earnings) 就是判断分母和分子的线索。
- **zh after**: 盈利性指标要靠分母来区分。分母是自有资本就是 ROE，是总资产 (自有资本 + 负债资本) 就是 ROA。投资指标 PER 是股价 ÷ 每股利润 (分母是每股利润)，EVA 是超过资本成本的利润金额 (不是比率，没有分母)。英文名称 (Equity / Assets / Price・Earnings) 就是判断分母和分子的线索。

- **en before**: Tell profitability and investment indicators apart by their denominators. If the denominator is shareholders’ equity it is ROE; if it is total assets (shareholders’ equity + debt capital) it is ROA; if it is the multiple of the stock price over earnings per share it is PER; and if it is the amount of profit exceeding the cost of capital it is EVA. The English names (Equity / Assets / Price・Earnings) are the clue to what the denominator and numerator are.
- **en after**: Tell profitability indicators apart by their denominators. If the denominator is shareholders’ equity it is ROE; if it is total assets (shareholders’ equity + debt capital) it is ROA. Among investment indicators, PER is the stock price ÷ earnings per share (the denominator is earnings per share), and EVA is the amount of profit exceeding the cost of capital (an amount, not a ratio, so it has no denominator). The English names (Equity / Assets / Price・Earnings) are the clue to what the denominator and numerator are.


#### 2013h25a-q013 d:ア

- **jp before**: 連結株主資本等変動計算書は、一会計期間における純資産 (株主資本、資本剰余金、利益剰余金など) の期首残高から期末残高までの変動事由と金額を示す財務諸表である。期間の情報である点は設問と合うが、示す対象は増資や配当、当期純利益の振替といった純資産の増減であり、収益と費用そのものの内訳を示すものではないので誤り。
- **jp after**: 連結株主資本等変動計算書は、一会計期間における純資産 (資本金・資本剰余金・利益剰余金などからなる株主資本ほか) の期首残高から期末残高までの変動事由と金額を示す財務諸表である。期間の情報である点は設問と合うが、示す対象は増資や配当、当期純利益の振替といった純資産の増減であり、収益と費用そのものの内訳を示すものではないので誤り。

- **zh before**: 合并所有者权益变动表反映的是一个会计期间内所有者权益 (股东权益、资本公积、留存收益等) 从期初余额到期末余额的变动原因及金额。它属于期间信息这一点与题干相符,但它反映的对象是增资、分红、本期净利润结转等所有者权益的增减,并不反映收入与费用本身的明细,所以错误。
- **zh after**: 合并所有者权益变动表反映的是一个会计期间内所有者权益 (由股本、资本公积、留存收益等构成的股东权益及其他) 从期初余额到期末余额的变动原因及金额。它属于期间信息这一点与题干相符,但它反映的对象是增资、分红、本期净利润结转等所有者权益的增减,并不反映收入与费用本身的明细,所以错误。

- **en before**: The consolidated statement of changes in shareholders' equity shows, for one accounting period, the causes and amounts of changes in equity (shareholders' equity, capital surplus, retained earnings, and so on) from the opening balance to the closing balance. It matches the question in that it is period information, but what it shows is increases and decreases in equity such as capital increases, dividends, and the transfer of net income for the period; it does not show the breakdown of revenue and expenses themselves, so it is wrong.
- **en after**: The consolidated statement of changes in shareholders' equity shows, for one accounting period, the causes and amounts of changes in equity (shareholders' equity, made up of capital stock, capital surplus, retained earnings, and so on, plus other items) from the opening balance to the closing balance. It matches the question in that it is period information, but what it shows is increases and decreases in equity such as capital increases, dividends, and the transfer of net income for the period; it does not show the breakdown of revenue and expenses themselves, so it is wrong.


#### 2013h25a-q042 p:1

- **jp before**: コンティンジェンシー予備 (既知のリスク用) とマネジメント予備 (未知の事象・スコープ外の変化用) の切り分けが要点。スコープ外の新要求は変更管理で扱い、コンティンジェンシー予備では吸収しない。
- **jp after**: コンティンジェンシー予備 (既知のリスク用) とマネジメント予備 (スコープ内で予見できない未知の事象用) の切り分けが要点。スコープ外の新要求は変更管理で扱い、コンティンジェンシー予備では吸収しない。

- **zh before**: 要点在于区分应急储备（用于已知风险）与管理储备（用于未知事件、范围之外的变化）。范围之外的新需求通过变更管理处理，不由应急储备吸收。
- **zh after**: 要点在于区分应急储备（用于已知风险）与管理储备（用于范围内无法预见的未知事件）。范围之外的新需求通过变更管理处理，不由应急储备吸收。

- **en before**: The key point is telling apart the contingency reserve (for known risks) and the management reserve (for unknown events and changes outside the scope). New requirements outside the scope are handled through change management and are not absorbed by the contingency reserve.
- **en after**: The key point is telling apart the contingency reserve (for known risks) and the management reserve (for unforeseeable unknown events within the scope). New requirements outside the scope are handled through change management and are not absorbed by the contingency reserve.


#### 2013h25a-q042 d:ウ

- **jp before**: プロジェクトスコープ外のユーザの新しい要求への対応コストは、問題文の「当初のプロジェクト範囲に含まれている」という条件に真っ向から反する。範囲外の未知の事象や新規要求は、変更管理 (変更要求) の手続きで別途契約・予算化するか、上位のマネジメント予備 (management reserve) で扱う対象であり、コンティンジェンシー予備とは区別される。
- **jp after**: プロジェクトスコープ外のユーザの新しい要求への対応コストは、問題文の「当初のプロジェクト範囲に含まれている」という条件に真っ向から反する。範囲外の新規要求は、変更管理 (変更要求) の手続きでスコープとベースラインを改訂し、別途契約・予算化して扱う対象であり、コンティンジェンシー予備 (やスコープ内の未知の事象に備えるマネジメント予備) で吸収するものではない。

- **zh before**: 为应对项目范围之外的用户新需求所需的成本，与题干中「最初已包含在项目范围内」这一条件正好相反。范围之外的未知事件或新增需求，应通过变更管理（变更请求）流程另行签约和列入预算，或者由更高层级的管理储备（management reserve）来处理，与应急储备是有区别的。
- **zh after**: 为应对项目范围之外的用户新需求所需的成本，与题干中「最初已包含在项目范围内」这一条件正好相反。范围之外的新增需求，应通过变更管理（变更请求）流程修订范围和基准，另行签约和列入预算，而不是由应急储备（或用于范围内未知事件的管理储备）来吸收。

- **en before**: The cost of responding to a user's new requirements outside the project scope directly contradicts the condition in the question that the event is within the original project scope. Unknown events or new requests outside the scope should be contracted and budgeted separately through the change management (change request) process, or handled by the higher-level management reserve, which is distinct from a contingency reserve.
- **en after**: The cost of responding to a user's new requirements outside the project scope directly contradicts the condition in the question that the event is within the original project scope. New requests outside the scope should be handled through the change management (change request) process by revising the scope and baseline and contracting and budgeting for them separately; they are not absorbed by a contingency reserve (or by the management reserve, which is for unknown events within the scope).


#### 2013h25a-q091 correct

- **jp before**: 正解はイ「商品ごとの掲載写真の数を絞り込む」。本問は業務改善の代表的なフレームワークである ECRS (改善の4原則) の観点の使い分けを問うている。簡素化 (Simplify) とは、その作業をなくすのでも他の作業と一つにまとめるのでも他の手段に置き換えるのでもなく、作業自体は残したまま対象の量・種類・手順を減らして単純にし、負担とミスを減らす考え方である。「掲載されている写真が違っている」という誤りは、商品ごとに多数の写真を登録しているために取り違えが起きやすいことが背景にある。そこで掲載する写真の数を必要最小限に絞り込めば、写真を選び登録する作業量そのものが減り、取り違えの起こる機会も減る。写真の掲載という業務は残しつつ作業を軽くしている点で、まさに簡素化の観点から立案されたアイデアといえる。
- **jp after**: 正解はイ「商品ごとの掲載写真の数を絞り込む」。本問は業務改善の代表的なフレームワークである ECRS (改善の4原則) の観点の使い分けを問うている。簡素化 (Simplify) とは、その作業をなくすのでも他の作業と一つにまとめるのでも他の手段に置き換えるのでもなく、作業自体は残したまま対象の量・種類・手順を減らして単純にし、負担とミスを減らす考え方である。題幹のメモでは、商品ごとに数枚の写真を掲載しており、ワインは商品名が非常に複雑なので掲載する写真を間違えやすいとされている。取り違えの主因は商品名の複雑さだが、掲載する写真の数を必要最小限に絞り込めば、写真を選び登録する作業量そのものが減り、取り違えの起こる機会も減る。写真の掲載という業務は残しつつ作業を軽くしている点で、まさに簡素化の観点から立案されたアイデアといえる。

- **zh before**: 正确答案是イ「缩减每件商品所刊登照片的数量」。本题考查业务改善的代表性框架 ECRS（改善四原则）中各个视角的区分使用。简化（Simplify）指的是：既不是取消该作业，也不是把它与其他作业合并为一，更不是替换成别的手段，而是保留作业本身，减少对象的数量、种类和步骤使其变得简单，从而减轻负担、降低差错的思路。「刊登的照片有误」这一错误，其背景在于每件商品都登记了大量照片，因而容易弄错。所以，只要把刊登的照片数量缩减到必要的最低限度，挑选和登记照片的作业量本身就会减少，弄错的机会也随之减少。既保留了刊登照片这项业务，又减轻了作业负担，这正是从简化视角提出的方案。
- **zh after**: 正确答案是イ「缩减每件商品所刊登照片的数量」。本题考查业务改善的代表性框架 ECRS（改善四原则）中各个视角的区分使用。简化（Simplify）指的是：既不是取消该作业，也不是把它与其他作业合并为一，更不是替换成别的手段，而是保留作业本身，减少对象的数量、种类和步骤使其变得简单，从而减轻负担、降低差错的思路。题干的备忘录写道，每件商品刊登数张照片，而葡萄酒的商品名非常复杂，所以容易弄错要刊登的照片。弄错的主要原因是商品名复杂，但只要把刊登的照片数量缩减到必要的最低限度，挑选和登记照片的作业量本身就会减少，弄错的机会也随之减少。既保留了刊登照片这项业务，又减轻了作业负担，这正是从简化视角提出的方案。

- **en before**: The correct answer is イ “Narrow down the number of posted photos per product.” This question asks you to distinguish among the perspectives of ECRS (the four principles of improvement), a classic framework for business improvement. Simplify means neither removing the task, nor merging it with another task, nor replacing it with a different means; instead the task itself is kept while the quantity, variety, or steps involved are reduced so that the work becomes simpler, lowering both the burden and the chance of mistakes. The error “the posted photo is wrong” arises because many photos are registered for each product, which makes mix-ups easy. Therefore, if the number of posted photos is narrowed down to the minimum necessary, the amount of work of selecting and registering photos itself decreases, and so do the chances of a mix-up. Because the work of posting photos remains while the workload is lightened, this is exactly an idea devised from the Simplify perspective.
- **en after**: The correct answer is イ “Narrow down the number of posted photos per product.” This question asks you to distinguish among the perspectives of ECRS (the four principles of improvement), a classic framework for business improvement. Simplify means neither removing the task, nor merging it with another task, nor replacing it with a different means; instead the task itself is kept while the quantity, variety, or steps involved are reduced so that the work becomes simpler, lowering both the burden and the chance of mistakes. According to the interview memo in the stem, several photos are posted for each product, and because wine product names are very complicated, the wrong photo is easily posted. The main cause of the mix-ups is the complexity of the names, but if the number of posted photos is narrowed down to the minimum necessary, the amount of work of selecting and registering photos itself decreases, and so do the chances of a mix-up. Because the work of posting photos remains while the workload is lightened, this is exactly an idea devised from the Simplify perspective.


#### 2013h25a-q097 correct

- **jp before**: 正解は「ア」＝要望事項 (1)。RFID（ICタグ）はバーコードと違い、電波を使うため読取装置にかざす向きや接触が不要で、しかも複数のタグをまとめて一度に読み取れる（一括読取）。B さんの施策では利用者カードにも書籍にも RFID が付き、カウンタに読取装置が置かれるので、これまで「利用者番号をスキャン → 書籍を 1 冊ずつスキャン」と個別に行っていた貸出処理を、書籍を数冊まとめて置くだけで一括処理できるようになる。その結果、貸出が集中する時間帯の 1 人あたり処理時間が短縮され、カウンタの行列（待ち行列）が解消される。要望事項 (1) の「貸出担当は作業を手早く処理したい」に直接応える改善であり、しかも施策で機器が置かれる場所（カウンタ・貸出返却時）とも一致している。
- **jp after**: 正解は「ア」＝要望事項 (1)。RFID（ICタグ）は光学的に読み取るバーコードと違い、電波を使うためタグの向きや見通しを合わせる必要がなく、しかも複数のタグをまとめて一度に読み取れる（一括読取）。B さんの施策では利用者カードにも書籍にも RFID が付き、カウンタに読取装置が置かれるので、これまで「利用者番号をスキャン → 書籍を 1 冊ずつスキャン」と個別に行っていた貸出処理を、書籍を数冊まとめて置くだけで一括処理できるようになる。その結果、貸出が集中する時間帯の 1 人あたり処理時間が短縮され、カウンタの行列（待ち行列）が解消される。要望事項 (1) の「貸出担当は作業を手早く処理したい」に直接応える改善であり、しかも施策で機器が置かれる場所（カウンタ・貸出返却時）とも一致している。

- **zh before**: 正确答案是「ア」＝需求事项 (1)。RFID（IC 标签）与条形码不同，它利用无线电波，因此既不需要对准读取装置的方向，也不需要接触，而且能够把多个标签汇总起来一次性读取（批量读取）。在 B 先生的方案中，用户卡和书籍上都带有 RFID，柜台上又放置了读取装置，因此以往「扫描用户编号 → 逐本扫描书籍」这样逐个进行的借出处理，只要把几本书一起放上去就能一次处理完。其结果是，借出集中的时间段里每位用户所需的处理时间被缩短，柜台前的排队（等待队列）得以消除。这直接回应了需求事项 (1) 中「借出负责人希望快速处理作业」的诉求，而且与方案中设备所放置的场所（柜台、借出归还时）也完全吻合。
- **zh after**: 正确答案是「ア」＝需求事项 (1)。RFID（IC 标签）与光学读取的条形码不同，它利用无线电波，因此不需要对准标签的方向或保证视线无遮挡，而且能够把多个标签汇总起来一次性读取（批量读取）。在 B 先生的方案中，用户卡和书籍上都带有 RFID，柜台上又放置了读取装置，因此以往「扫描用户编号 → 逐本扫描书籍」这样逐个进行的借出处理，只要把几本书一起放上去就能一次处理完。其结果是，借出集中的时间段里每位用户所需的处理时间被缩短，柜台前的排队（等待队列）得以消除。这直接回应了需求事项 (1) 中「借出负责人希望快速处理作业」的诉求，而且与方案中设备所放置的场所（柜台、借出归还时）也完全吻合。

- **en before**: The correct answer is “ア” = requirement (1). Unlike a barcode, RFID (an IC tag) uses radio waves, so the tag does not have to be held up in a particular direction and does not have to touch the reader, and several tags can be read together at once (bulk reading). In Mr. B’s plan, both the user card and the books carry RFID, and a reader is placed at the counter. Therefore the lending process, which used to be done one item at a time (scan the user number, then scan each book one by one), can be handled in a single operation simply by placing several books together on the reader. As a result, the processing time per user during peak lending hours becomes shorter and the queue at the counter disappears. This directly answers requirement (1), that the lending staff wants to process the work quickly, and it also matches the place where the plan installs the equipment (the counter, used when lending and returning).
- **en after**: The correct answer is “ア” = requirement (1). Unlike a barcode, which is read optically, RFID (an IC tag) uses radio waves, so the tag does not have to face a particular direction or be in the reader's line of sight, and several tags can be read together at once (bulk reading). In Mr. B’s plan, both the user card and the books carry RFID, and a reader is placed at the counter. Therefore the lending process, which used to be done one item at a time (scan the user number, then scan each book one by one), can be handled in a single operation simply by placing several books together on the reader. As a result, the processing time per user during peak lending hours becomes shorter and the queue at the counter disappears. This directly answers requirement (1), that the lending staff wants to process the work quickly, and it also matches the place where the plan installs the equipment (the counter, used when lending and returning).


#### 2013h25a-q097 p:0

- **jp before**: RFID（ICタグ）の特徴：電波による非接触読取で、向きや接触が不要、かつ複数タグの一括読取ができる。バーコードの「1 件ずつ・かざす必要あり」との差が、貸出処理の高速化＝行列解消につながる。
- **jp after**: RFID（ICタグ）の特徴：電波による読取りで、光学式のバーコードのようにコードの向きや見通しを合わせる必要がなく、かつ複数タグの一括読取ができる。バーコードの「一度に 1 枚」との差が、貸出処理の高速化＝行列解消につながる。

- **zh before**: RFID（IC 标签）的特点：通过无线电波非接触读取，不需要对准方向或接触，而且可以对多个标签进行批量读取。与条形码「逐件读取、必须对准」的差异，带来了借出处理的提速，也就是排队的消除。
- **zh after**: RFID（IC 标签）的特点：通过无线电波读取，不像光学式条形码那样需要对准方向或保证视线无遮挡，而且可以对多个标签进行批量读取。与条形码「一次只能读 1 张」的差异，带来了借出处理的提速，也就是排队的消除。

- **en before**: Features of RFID (IC tags): contactless reading by radio waves, with no need for a particular orientation or contact, plus bulk reading of several tags at once. This difference from a barcode, which must be read one item at a time and held up to the reader, is what speeds up the lending process and clears the queue.
- **en after**: Features of RFID (IC tags): reading by radio waves, with no need to align the orientation or keep a line of sight as with an optical barcode, plus bulk reading of several tags at once. This difference from a barcode, which is read one item at a time, is what speeds up the lending process and clears the queue.


#### 2013h25h-q005 d:ア

- **jp before**: 画面や帳票などのユーザインタフェース要件を確定するのは、企画プロセスの次に来る要件定義プロセス (さらに詳細化すればシステム要件定義) の作業である。企画段階では、どのような画面を作るかというシステムの具体的な仕様はまだ決めない。
- **jp after**: 画面や帳票などのユーザインタフェース要件を確定するのは、要件定義プロセスの後に来る開発プロセスの中のシステム要件定義の作業である。企画段階では、どのような画面を作るかというシステムの具体的な仕様はまだ決めない。

- **zh before**: 确定画面、报表等用户界面需求，是规划流程之后到来的需求定义流程（再细化则是系统需求定义）的工作。在规划阶段，还不会决定要做什么样的画面这类系统的具体规格。
- **zh after**: 确定画面、报表等用户界面需求，是需求定义流程之后的开发流程中系统需求定义的工作。在规划阶段，还不会决定要做什么样的画面这类系统的具体规格。

- **en before**: Finalizing user interface requirements such as screens and report forms is work of the requirements definition process, which comes after the planning process (or, more specifically, of system requirements definition). At the planning stage, the concrete specifications of the system, such as what screens to build, are not yet decided.
- **en after**: Finalizing user interface requirements such as screens and report forms is work of system requirements definition within the development process, which comes after the requirements definition process. At the planning stage, the concrete specifications of the system, such as what screens to build, are not yet decided.


#### 2013h25h-q005 p:1

- **jp before**: 工程の切り分けを押さえる: 画面/帳票などの具体的な要件確定と関係者の要件合意は要件定義プロセス、RFP 作成とベンダ選定は調達の作業であり、いずれも企画プロセスの作業ではない。
- **jp after**: 工程の切り分けを押さえる: 画面/帳票などの具体的な要件確定は開発プロセスのシステム要件定義、関係者の要件合意は要件定義プロセス、RFP 作成とベンダ選定は調達の作業であり、いずれも企画プロセスの作業ではない。

- **zh before**: 掌握工序的划分：画面/报表等具体需求的确定以及与相关人员就需求达成一致属于需求定义流程，RFP 的编制和供应商选定属于采购工作，两者都不是规划流程的工作。
- **zh after**: 掌握工序的划分：画面/报表等具体需求的确定属于开发流程中的系统需求定义，与相关人员就需求达成一致属于需求定义流程，RFP 的编制和供应商选定属于采购工作，这些都不是规划流程的工作。

- **en before**: Grasp the division between the stages: finalizing concrete requirements such as screens and report forms, and reaching agreement with stakeholders on requirements, belong to the requirements definition process, while creating the RFP and selecting a vendor is procurement work. Neither is work of the planning process.
- **en after**: Grasp the division between the stages: finalizing concrete requirements such as screens and report forms belongs to system requirements definition in the development process, reaching agreement with stakeholders on requirements belongs to the requirements definition process, and creating the RFP and selecting a vendor is procurement work. None of these is work of the planning process.


#### 2013h25h-q026 correct

- **jp before**: 正解はア「a, b, d」。株主総会は、会社に出資している株主で構成される株式会社の最高意思決定機関であり、役員 (取締役・監査役・会計監査人) の選任と解任、および合併などの会社の基礎に関わる重要事項を決める場である。一方、決めた方針を実際に動かす業務執行は、株主総会が選んだ取締役 (取締役会・代表取締役) の役割で、株主総会は執行そのものには関与しない。この切り分けで各項目を見ると、a の監査役の選任は役員人事なので株主総会の決議事項、d の取締役の選任も同じく株主総会の決議事項である。b の企業合併は、会社が別の会社と一つになる組織再編で、株主の持分や会社の存続そのものに影響する重大な事項だから、株主総会の決議 (通常より要件の厳しい特別決議) が必要となる。これに対し c の事業戦略の執行は、選任された取締役が経営者として日々行う業務執行であり、株主総会の決議事項ではない。したがって株主総会の決議を要するのは a, b, d の三つで、それだけを過不足なく挙げたアが正しい。
- **jp after**: 正解はア「a, b, d」。株主総会は、会社に出資している株主で構成される株式会社の最高意思決定機関であり、役員 (取締役・会計参与・監査役) および会計監査人の選任と解任、および合併などの会社の基礎に関わる重要事項を決める場である。一方、決めた方針を実際に動かす業務執行は、株主総会が選んだ取締役 (取締役会・代表取締役) の役割で、株主総会は執行そのものには関与しない。この切り分けで各項目を見ると、a の監査役の選任は役員人事なので株主総会の決議事項、d の取締役の選任も同じく株主総会の決議事項である。b の企業合併は、会社が別の会社と一つになる組織再編で、株主の持分や会社の存続そのものに影響する重大な事項だから、株主総会の決議 (通常より要件の厳しい特別決議) が必要となる。これに対し c の事業戦略の執行は、選任された取締役が経営者として日々行う業務執行であり、株主総会の決議事項ではない。したがって株主総会の決議を要するのは a, b, d の三つで、それだけを過不足なく挙げたアが正しい。

- **zh before**: 正确答案是 ア「a、b、d」。股东大会是由向公司出资的股东组成的股份公司最高决策机构，是决定高管（董事、监事、会计审计人）的选任与解任，以及合并等涉及公司根本的重要事项的机关。另一方面，把已定方针实际推动起来的业务执行，是由股东大会选出的董事（董事会、代表董事）承担的职责，股东大会并不参与执行本身。按照这一区分来看各项：a 选任监事属于高管人事，因此是股东大会的决议事项；d 选任董事同样也是股东大会的决议事项。b 决定企业合并是公司与另一家公司合为一体的组织重组，会影响股东的持股权益乃至公司本身的存续，属于重大事项，因此需要股东大会决议（要求比通常更严格的特别决议）。与此相对，c 执行经营战略是被选任的董事作为经营者日常进行的业务执行，不属于股东大会的决议事项。因此需要股东大会决议的是 a、b、d 三项，不多不少恰好只列出这三项的 ア 是正确的。
- **zh after**: 正确答案是 ア「a、b、d」。股东大会是由向公司出资的股东组成的股份公司最高决策机构，是决定高管（董事、会计参与、监事）及会计审计人的选任与解任，以及合并等涉及公司根本的重要事项的机关。另一方面，把已定方针实际推动起来的业务执行，是由股东大会选出的董事（董事会、代表董事）承担的职责，股东大会并不参与执行本身。按照这一区分来看各项：a 选任监事属于高管人事，因此是股东大会的决议事项；d 选任董事同样也是股东大会的决议事项。b 决定企业合并是公司与另一家公司合为一体的组织重组，会影响股东的持股权益乃至公司本身的存续，属于重大事项，因此需要股东大会决议（要求比通常更严格的特别决议）。与此相对，c 执行经营战略是被选任的董事作为经营者日常进行的业务执行，不属于股东大会的决议事项。因此需要股东大会决议的是 a、b、d 三项，不多不少恰好只列出这三项的 ア 是正确的。

- **en before**: The correct answer is ア, “a, b, d.” The shareholders’ meeting is the highest decision-making body of a joint-stock company, made up of the shareholders who have invested in it. It is where officers (directors, company auditors, and the accounting auditor) are appointed and dismissed, and where important matters affecting the foundations of the company, such as a merger, are decided. On the other hand, carrying out the policies that have been decided — the execution of business — is the role of the directors chosen by the shareholders’ meeting (the board of directors and the representative director); the shareholders’ meeting itself does not take part in that execution. Looking at each item with this division in mind: a, appointing a company auditor, is officer personnel, so it is a matter for a resolution of the shareholders’ meeting, and d, appointing a director, is likewise a matter for its resolution. b, deciding on a corporate merger, is a reorganization in which the company becomes one with another company; because it affects the shareholders’ stake and the very continuation of the company, it is a serious matter that requires a resolution of the shareholders’ meeting (a special resolution, whose requirements are stricter than usual). In contrast, c, executing the business strategy, is the day-to-day execution of business carried out by the appointed directors as managers, and is not a matter for a resolution of the shareholders’ meeting. Therefore the matters requiring a resolution of the shareholders’ meeting are the three items a, b, and d, and ア, which lists exactly these and nothing more, is correct.
- **en after**: The correct answer is ア, “a, b, d.” The shareholders’ meeting is the highest decision-making body of a joint-stock company, made up of the shareholders who have invested in it. It is where officers (directors, accounting advisors, and company auditors) and the accounting auditor are appointed and dismissed, and where important matters affecting the foundations of the company, such as a merger, are decided. On the other hand, carrying out the policies that have been decided — the execution of business — is the role of the directors chosen by the shareholders’ meeting (the board of directors and the representative director); the shareholders’ meeting itself does not take part in that execution. Looking at each item with this division in mind: a, appointing a company auditor, is officer personnel, so it is a matter for a resolution of the shareholders’ meeting, and d, appointing a director, is likewise a matter for its resolution. b, deciding on a corporate merger, is a reorganization in which the company becomes one with another company; because it affects the shareholders’ stake and the very continuation of the company, it is a serious matter that requires a resolution of the shareholders’ meeting (a special resolution, whose requirements are stricter than usual). In contrast, c, executing the business strategy, is the day-to-day execution of business carried out by the appointed directors as managers, and is not a matter for a resolution of the shareholders’ meeting. Therefore the matters requiring a resolution of the shareholders’ meeting are the three items a, b, and d, and ア, which lists exactly these and nothing more, is correct.


#### 2013h25h-q026 p:0

- **jp before**: 株主総会は株式会社の最高意思決定機関であり、その決議事項は「役員の人事」と「会社の基礎的変更」が中心である。具体的には、取締役・監査役・会計監査人の選任と解任、合併や会社分割などの組織再編、事業譲渡、定款の変更、剰余金の配当、計算書類の承認などが該当する。
- **jp after**: 株主総会は株式会社の最高意思決定機関であり、その決議事項は「役員の人事」と「会社の基礎的変更」が中心である。具体的には、取締役・会計参与・監査役 (役員) と会計監査人の選任と解任、合併や会社分割などの組織再編、事業譲渡、定款の変更、剰余金の配当、計算書類の承認などが該当する。

- **zh before**: 股东大会是股份公司的最高决策机构，其决议事项主要集中在「高管人事」和「公司的根本性变更」两方面。具体来说，董事、监事、会计审计人的选任与解任，合并、公司分立等组织重组，业务转让，公司章程的变更，盈余的分配，财务报表的批准等都属于此列。
- **zh after**: 股东大会是股份公司的最高决策机构，其决议事项主要集中在「高管人事」和「公司的根本性变更」两方面。具体来说，董事、会计参与、监事（高管）及会计审计人的选任与解任，合并、公司分立等组织重组，业务转让，公司章程的变更，盈余的分配，财务报表的批准等都属于此列。

- **en before**: The shareholders’ meeting is the highest decision-making body of a joint-stock company, and the matters it resolves center on “officer personnel” and “fundamental changes to the company.” Specifically, these include appointing and dismissing directors, company auditors, and the accounting auditor; reorganizations such as mergers and company splits; transfers of business; amendments to the articles of incorporation; distribution of surplus; and approval of the financial statements.
- **en after**: The shareholders’ meeting is the highest decision-making body of a joint-stock company, and the matters it resolves center on “officer personnel” and “fundamental changes to the company.” Specifically, these include appointing and dismissing directors, accounting advisors, and company auditors (the officers) and the accounting auditor; reorganizations such as mergers and company splits; transfers of business; amendments to the articles of incorporation; distribution of surplus; and approval of the financial statements.


#### 2014h26a-q069 d:エ

- **jp before**: ワンタイムパスワードは一定時間または一回限り有効な使い捨てパスワードで、盗聴されても再利用されにくい利点があるが、本質は知識 (と、トークンを使う場合は所持) による認証である。身体的特徴を用いないためバイオメトリクス認証には該当しない。
- **jp after**: ワンタイムパスワードは一定時間または一回限り有効な使い捨てパスワードで、盗聴されても再利用されにくい利点があるが、トークンやスマートフォンなど本人が持つ機器で生成・受信する値を使うので、主に所持による認証に当たる。身体的特徴を用いないためバイオメトリクス認証には該当しない。

- **zh before**: 一次性口令是在一定时间内或仅一次有效的用后即弃口令，其优点是即使被窃听也难以被重复使用，但本质上仍是基于知识（若使用令牌则还包括持有）的认证。因为不使用身体特征，所以不属于生物特征认证。
- **zh after**: 一次性口令是在一定时间内或仅一次有效的用后即弃口令，其优点是即使被窃听也难以被重复使用，但它使用由令牌或智能手机等本人持有的设备生成或接收的值，因此主要属于基于持有的认证。因为不使用身体特征，所以不属于生物特征认证。

- **en before**: A one-time password is a disposable password valid only for a limited time or a single use; its advantage is that it is hard to reuse even if intercepted, but in essence it is authentication by knowledge (and by possession when a token is used). Since it does not use a physical characteristic, it is not biometric authentication.
- **en after**: A one-time password is a disposable password valid only for a limited time or a single use; its advantage is that it is hard to reuse even if intercepted, but because it uses a value generated or received by a device the user holds, such as a token or a smartphone, it is mainly authentication by possession. Since it does not use a physical characteristic, it is not biometric authentication.


#### 2014h26a-q074 correct

- **jp before**: 正解はエ「データの集まりを表形式で表現する。」。関係データモデル (リレーショナルデータモデル) は、データの集まりを行と列からなる表 (テーブル) の形で表現する論理データモデルである。1つの表が1つの対象 (例: 社員、商品) を表し、列 (属性・フィールド) が項目名、行 (レコード・組) が個々のデータに対応する。表と表は、共通の項目 (社員表の部門コードと部門表の部門コードなど) の値が一致することによって関連付けられるので、あらかじめポインタで物理的につないでおく必要がなく、後から表や項目を追加しても既存の構造を壊しにくい。この柔軟さと、表に対する集合演算 (射影・選択・結合) を SQL で簡潔に記述できる点が評価され、現在広く使われている RDBMS (関係データベース管理システム) の基礎になっている。なお論理データモデルとは、データを実際にどう記録するか (物理的構造) ではなく、データ同士の関係をどう捉えるかという論理的構造を規定するもので、関係モデルのほかに階層モデル・網モデルなどがある。
- **jp after**: 正解はエ「データの集まりを表形式で表現する。」。関係データモデル (リレーショナルデータモデル) は、データの集まりを行と列からなる表 (テーブル) の形で表現する論理データモデルである。1つの表が1つの対象 (例: 社員、商品) を表し、列 (属性・フィールド) が項目名、行 (レコード・組) が個々のデータに対応する。表と表は、共通の項目 (社員表の部門コードと部門表の部門コードなど) の値が一致することによって関連付けられるので、あらかじめポインタで物理的につないでおく必要がなく、後から表や項目を追加しても既存の構造を壊しにくい。この柔軟さと、表に対する関係演算 (射影・選択・結合) を SQL で簡潔に記述できる点が評価され、現在広く使われている RDBMS (関係データベース管理システム) の基礎になっている。なお論理データモデルとは、データを実際にどう記録するか (物理的構造) ではなく、データ同士の関係をどう捉えるかという論理的構造を規定するもので、関係モデルのほかに階層モデル・網モデルなどがある。

- **zh before**: 正确答案是 エ「将数据的集合用表格形式来表现。」。关系数据模型（relational data model）是把数据的集合以由行和列构成的表（table）的形式来表现的逻辑数据模型。一张表表示一个对象（例如员工、商品），列（属性、字段）对应项目名，行（记录、元组）对应一条条具体的数据。表与表之间是通过共同项目（如员工表的部门编码与部门表的部门编码等）的值相一致而建立关联的，因此不需要事先用指针在物理上把它们连起来，之后再追加表或项目也不容易破坏已有的结构。正是这种灵活性，以及可以用 SQL 简洁地描述针对表的集合运算（投影、选择、连接）这一点获得了好评，使它成为当今被广泛使用的 RDBMS（关系数据库管理系统）的基础。另外，所谓逻辑数据模型，并不是规定数据实际如何记录（物理结构），而是规定如何看待数据之间的关系这一逻辑结构；除关系模型外还有层次模型、网状模型等。
- **zh after**: 正确答案是 エ「将数据的集合用表格形式来表现。」。关系数据模型（relational data model）是把数据的集合以由行和列构成的表（table）的形式来表现的逻辑数据模型。一张表表示一个对象（例如员工、商品），列（属性、字段）对应项目名，行（记录、元组）对应一条条具体的数据。表与表之间是通过共同项目（如员工表的部门编码与部门表的部门编码等）的值相一致而建立关联的，因此不需要事先用指针在物理上把它们连起来，之后再追加表或项目也不容易破坏已有的结构。正是这种灵活性，以及可以用 SQL 简洁地描述针对表的关系运算（投影、选择、连接）这一点获得了好评，使它成为当今被广泛使用的 RDBMS（关系数据库管理系统）的基础。另外，所谓逻辑数据模型，并不是规定数据实际如何记录（物理结构），而是规定如何看待数据之间的关系这一逻辑结构；除关系模型外还有层次模型、网状模型等。

- **en before**: The correct answer is エ “It represents collections of data in a tabular (table) form.” The relational data model is a logical data model that represents collections of data in the form of tables made up of rows and columns. One table represents one kind of subject (for example, employees or products); a column (attribute or field) corresponds to an item name, and a row (record or tuple) corresponds to an individual piece of data. Tables are related to each other by matching values in a shared item (such as the department code in an employee table and the department code in a department table), so there is no need to physically link them in advance with pointers, and adding a table or an item later is unlikely to break the existing structure. This flexibility, together with the fact that set operations on tables (projection, selection, join) can be written concisely in SQL, is what made the model highly regarded, and it is the basis of the RDBMS (relational database management system) that is widely used today. Note that a logical data model does not define how data is actually recorded (the physical structure); it defines the logical structure of how the relationships among data are understood. Besides the relational model, there are also the hierarchical model, the network model, and others.
- **en after**: The correct answer is エ “It represents collections of data in a tabular (table) form.” The relational data model is a logical data model that represents collections of data in the form of tables made up of rows and columns. One table represents one kind of subject (for example, employees or products); a column (attribute or field) corresponds to an item name, and a row (record or tuple) corresponds to an individual piece of data. Tables are related to each other by matching values in a shared item (such as the department code in an employee table and the department code in a department table), so there is no need to physically link them in advance with pointers, and adding a table or an item later is unlikely to break the existing structure. This flexibility, together with the fact that relational operations on tables (projection, selection, join) can be written concisely in SQL, is what made the model highly regarded, and it is the basis of the RDBMS (relational database management system) that is widely used today. Note that a logical data model does not define how data is actually recorded (the physical structure); it defines the logical structure of how the relationships among data are understood. Besides the relational model, there are also the hierarchical model, the network model, and others.


#### 2014h26h-q025 p:1

- **jp before**: Off-JT (Off-the-Job Training) は、通常の業務を離れて行う研修・勉強会・説明会・e ラーニングなどの集合教育で、体系的な知識を多人数に均質に伝えられる。選択肢の判別は「実際の仕事を任せているか (OJT)」か「業務から離れて教えているか (Off-JT)」で行うとよい。関連語として、社員が自らの意思で学ぶ自己啓発も人材育成の柱の一つである。
- **jp after**: Off-JT (Off-the-Job Training) は、通常の業務を離れて行う研修・勉強会・説明会などの集合教育や e ラーニングで、体系的な知識を多人数に均質に伝えられる。選択肢の判別は「実際の仕事を任せているか (OJT)」か「業務から離れて教えているか (Off-JT)」で行うとよい。関連語として、社員が自らの意思で学ぶ自己啓発も人材育成の柱の一つである。

- **zh before**: Off-JT（脱产培训，Off-the-Job Training）是脱离日常业务进行的培训课程、学习会、说明会、e-Learning 等集体教育，能够把体系化的知识均质地传授给许多人。判别选项时，可以按「是否把实际工作交给对方（OJT）」还是「是否脱离业务进行讲授（Off-JT）」来区分。作为相关词，员工凭自身意愿进行学习的自我提升（自我启发）也是人才培养的支柱之一。
- **zh after**: Off-JT（脱产培训，Off-the-Job Training）是脱离日常业务进行的培训课程、学习会、说明会等集体教育以及 e-Learning，能够把体系化的知识均质地传授给许多人。判别选项时，可以按「是否把实际工作交给对方（OJT）」还是「是否脱离业务进行讲授（Off-JT）」来区分。作为相关词，员工凭自身意愿进行学习的自我提升（自我启发）也是人才培养的支柱之一。

- **en before**: Off-JT (Off-the-Job Training) is group training conducted away from normal work, such as training courses, study sessions, information sessions, and e-learning, and it can convey systematic knowledge uniformly to many people at once. A good way to judge the choices is to ask whether the person is entrusted with real work (OJT) or is being taught away from work (Off-JT). As a related term, self-development, in which employees study on their own initiative, is another pillar of human resource development.
- **en after**: Off-JT (Off-the-Job Training) is training conducted away from normal work, such as group training in courses, study sessions, and information sessions, and e-learning, and it can convey systematic knowledge uniformly to many people at once. A good way to judge the choices is to ask whether the person is entrusted with real work (OJT) or is being taught away from work (Off-JT). As a related term, self-development, in which employees study on their own initiative, is another pillar of human resource development.


#### 2014h26h-q049 d:イ

- **jp before**: 設計書のレビューや机上でのチェック (デスクチェック、机上デバッグ) は、設計工程で成果物の誤りを早期に見つけるために行う作業であり、テスト工程の内容ではありません。テスト工程は、作成したプログラムを実際に動かして、単体テスト・結合テスト・システムテスト・運用テストという順で仕様どおりに動作するかを確認する工程です。文書を読み合わせるレビューは、プログラムを動かさないという意味で動的なテストとは区別されます。
- **jp after**: 設計書のレビューは設計工程で、机上でのチェック (デスクチェック、机上デバッグ) はプログラミング工程で、成果物の誤りを早期に見つけるために行う作業であり、テスト工程の内容ではありません。テスト工程は、作成したプログラムを実際に動かして、単体テスト・結合テスト・システムテスト・運用テストという順で仕様どおりに動作するかを確認する工程です。文書を読み合わせるレビューは、プログラムを動かさないという意味で動的なテストとは区別されます。

- **zh before**: 设计文档的评审以及在书面上进行的检查（桌面检查、桌面调试），是在设计阶段为尽早发现交付物中的错误而进行的工作，并不是测试阶段的内容。测试阶段是让编写好的程序实际运行，按照单元测试、集成测试、系统测试、运行测试的顺序确认其是否按规格说明动作的阶段。共同研读文档的评审由于不运行程序，因此与动态的测试相区别。
- **zh after**: 设计文档的评审在设计阶段、在书面上进行的检查（桌面检查、桌面调试）在编程阶段，都是为尽早发现交付物中的错误而进行的工作，并不是测试阶段的内容。测试阶段是让编写好的程序实际运行，按照单元测试、集成测试、系统测试、运行测试的顺序确认其是否按规格说明动作的阶段。共同研读文档的评审由于不运行程序，因此与动态的测试相区别。

- **en before**: Reviewing design documents and checking on paper (desk checking, desk debugging) are tasks performed in the design phase in order to find errors in the deliverables early; they are not the content of the testing phase. The testing phase is where the programs that have been written are actually run, and it is confirmed in the order of unit testing, integration testing, system testing, and operational testing whether they behave as specified. A review in which documents are read through together does not run the program, so it is distinguished from dynamic testing.
- **en after**: Reviewing design documents (in the design phase) and checking on paper (desk checking, desk debugging, in the programming phase) are tasks performed in order to find errors in the deliverables early; they are not the content of the testing phase. The testing phase is where the programs that have been written are actually run, and it is confirmed in the order of unit testing, integration testing, system testing, and operational testing whether they behave as specified. A review in which documents are read through together does not run the program, so it is distinguished from dynamic testing.


#### 2014h26h-q076 d:ア

- **jp before**: ① を含む点が誤り。DoS攻撃 (サービス妨害攻撃) は大量のリクエストや過大なデータを送り付けてサーバやネットワークを過負荷にし、正規利用者がサービスを使えなくする攻撃で、狙われるのは誰でも接続できる公開サービスの入口である。アクセス権は「認証を通った利用者が資源に何をできるか」を決める仕組みなので、権限判定に至る前の通信量そのものは抑えられない。対策はファイアウォールやIPS、通信量の制限、負荷分散などである。なお ② は正しいので、①, ②の組合せ自体が成立しない。
- **jp after**: ① を含む点が誤り。DoS攻撃 (サービス妨害攻撃) は大量のリクエストや過大なデータを送り付けてサーバやネットワークを過負荷にし、正規利用者がサービスを使えなくする攻撃で、狙われるのは誰でも接続できる公開サービスの入口である。アクセス権は「認証を通った利用者が資源に何をできるか」を決める仕組みなので、権限判定に至る前の通信量そのものは抑えられない。対策はファイアウォールやIPS、通信量の制限、負荷分散などである。また、正しい ④ が抜けているため、効果があるものを全て挙げたことにもならない。

- **zh before**: 错在包含了 ①。DoS 攻击（拒绝服务攻击）是通过发送大量请求或过大的数据使服务器和网络过载，令正规用户无法使用服务的攻击，它瞄准的是任何人都能连接的公开服务入口。访问权限是决定「通过认证的用户能够对资源做什么」的机制，因此无法抑制在权限判定之前的通信量本身。对策是防火墙、IPS、限制通信量、负载均衡等。另外 ② 是正确的，所以 ①、② 这个组合本身就不能成立。
- **zh after**: 错在包含了 ①。DoS 攻击（拒绝服务攻击）是通过发送大量请求或过大的数据使服务器和网络过载，令正规用户无法使用服务的攻击，它瞄准的是任何人都能连接的公开服务入口。访问权限是决定「通过认证的用户能够对资源做什么」的机制，因此无法抑制在权限判定之前的通信量本身。对策是防火墙、IPS、限制通信量、负载均衡等。另外，正确的 ④ 没有包含在内，所以也不算列举了全部有效的项目。

- **en before**: It is wrong because it includes ①. A DoS attack (denial-of-service attack) overloads servers or networks by sending huge numbers of requests or oversized data, making the service unusable for legitimate users, and it targets the entrance of a public service that anyone can connect to. Access rights are a mechanism that decides what an authenticated user may do with a resource, so they cannot hold down the traffic volume itself, which arrives before permissions are judged. The countermeasures are firewalls, IPS, traffic rate limiting, load balancing, and so on. Also, since ② is correct, the combination of ① and ② cannot hold in the first place.
- **en after**: It is wrong because it includes ①. A DoS attack (denial-of-service attack) overloads servers or networks by sending huge numbers of requests or oversized data, making the service unusable for legitimate users, and it targets the entrance of a public service that anyone can connect to. Access rights are a mechanism that decides what an authenticated user may do with a resource, so they cannot hold down the traffic volume itself, which arrives before permissions are judged. The countermeasures are firewalls, IPS, traffic rate limiting, load balancing, and so on. Also, the correct ④ is missing, so it does not list all the items that are effective.


#### 2015h27a-q003 d:ウ

- **jp before**: 請負元が合意の上で進捗状況の報告を求めることは、完成責任を負う発注者が納期・品質を把握するための正当な行為である。作業員への直接的な指揮命令ではないため違法ではない。
- **jp after**: 請負元が合意の上で進捗状況の報告を求めることは、成果物を受け取る発注者が納期・品質を把握するための正当な行為である。作業員への直接的な指揮命令ではないため違法ではない。

- **zh before**: 发包方在达成一致的前提下要求报告进度状况，是负有完成责任的发包方为掌握交期和质量而进行的正当行为。由于这并不是对作业人员的直接指挥命令，所以不违法。
- **zh after**: 发包方在达成一致的前提下要求报告进度状况，是接收成果物的发包方为掌握交期和质量而进行的正当行为。由于这并不是对作业人员的直接指挥命令，所以不违法。

- **en before**: For the client to request progress reports by agreement is a legitimate act by which the client, who bears responsibility for completion, keeps track of delivery deadlines and quality. Because it is not direct direction of the workers, it is not illegal.
- **en after**: For the client to request progress reports by agreement is a legitimate act by which the client, who receives the deliverable, keeps track of delivery deadlines and quality. Because it is not direct direction of the workers, it is not illegal.


#### 2010h22a-q033 d:ウ

- **jp before**: 故障したハードウェア部品を交換し確認テストを実施しているが、これは特定済みの障害に対する復旧作業である。原因を分析する段階ではなく、サービスを元の状態に戻すインシデント管理 (および復旧に伴う実作業) に該当する。
- **jp after**: 故障したハードウェア部品を交換し確認テストを実施しているが、これは特定済みの障害に対する復旧作業である。原因を分析する段階ではなく、サービスを元の状態に戻すインシデント管理 (および復旧に伴う実作業) として説明できる。なお、題幹が挙げる 3 プロセスに当てはめると、交換した部品を本番環境に適用して確認する作業は、ITIL v2 や JIS Q 20000 ではリリース管理 (変更管理で承認された変更を本番環境へ展開する活動) としても整理される。どちらの読み方でも原因の究明ではないので、問題管理には当たらない。

- **zh before**: 更换了发生故障的硬件部件并实施了确认测试，但这是针对已经确定的故障所做的恢复作业。它不处于分析原因的阶段，而属于把服务恢复到原状的事件管理（以及恢复所伴随的实际作业）。
- **zh after**: 更换了发生故障的硬件部件并实施了确认测试，但这是针对已经确定的故障所做的恢复作业。它不处于分析原因的阶段，而可以解释为把服务恢复到原状的事件管理（以及恢复所伴随的实际作业）。另外，套用题干列出的 3 个流程来看，把更换的部件应用到生产环境并加以确认的作业，在 ITIL v2 和 JIS Q 20000 中也被归入发布管理（把经变更管理批准的变更部署到生产环境的活动）。无论按哪种理解，它都不是查明原因，因此不属于问题管理。

- **en before**: The faulty hardware component was replaced and a confirmation test was carried out, but this is recovery work for a failure that has already been identified. It is not the stage of analyzing the cause; it belongs to incident management (and the actual work that goes with recovery), which returns the service to its original state.
- **en after**: The faulty hardware component was replaced and a confirmation test was carried out, but this is recovery work for a failure that has already been identified. It is not the stage of analyzing the cause; it can be explained as incident management (and the actual work that goes with recovery), which returns the service to its original state. Mapped onto the three processes listed in the stem, applying the replacement part to the production environment and confirming it is also organized in ITIL v2 and JIS Q 20000 as release management (the activity of deploying changes approved through change management into production). Either way, it is not an investigation of the cause, so it is not problem management.


## 3. D-175 — zh の dual / duplex 訳語統一

**走査** (corpus 全体、適用前): translations sidecar 29 exam (stem・choices の zh) と `.phase2/expl_tr_*` 全題 (correct・distractors・points の zh) で `双工 / 双重系统 / 双重（ / 双机系统 / 双系统` を検出し、同じ field (sidecar は同じ題の stem_jp・choices_jp) の jp に デュアル / デュプレックス があるかで判定した。

- 逆 (dual = 双工系统、duplex = 双重系统 / 双机系统) だったのは **5 題**: 2009h21a-q086、2012h24a-q057、2013h25a-q047、2014h26h-q056、2015h27a-q082。題の中ではどれも一貫して逆
- 既に正しい (dual = 双重系统 / duplex = 双工系统) 題: 2009h21h-q073、2012h24h-q021、2013h25a-q066、2014h26a-q053、2016h28h-q075、2017h29a-q087、2017h29h-q073、2018h30a-q082、2019r01a-q074、2021r03-q086、2023r05-q093 (不変)
- 対象外: 「双系统引导 / 双系统启动」(dual boot。2013h25a-q070、2014h26h-q078、2017h29h-q057)、「全双工 / 半双工」(通信方式。2019h31h-q083)、「双重化・双重运行・双机冗余」などの一般語、2018h30a-q082 要点 2「双工化」(jp は「二重化」)

**置換** (対象 5 題の zh field だけ、単一 pass の正規表現): `双工系统 → 双重系统`、`双重系统 → 双工系统`、`双机系统 → 双工系统`、系の名前と判定できる単独形 `双工（dual）→ 双重（dual）`、`双重（duplex）→ 双工（duplex）`、`双工（双重运行… → 双重系统（双重运行…`、`双工是用… → 双重是用…`、`双重是准备… → 双工是准备…`。題ごとの置換数を固定して assert: q086 10 / q057 12 / q047 3 / q056 6 / q082 15 = **計 46 箇所、25 field** (translations sidecar 3 field + `.phase1 tr_` 3 field + expl_tr 19 field)。

**事後確認** (script 内、corpus 全体): field の jp が デュアル だけなら zh に 双工系统 が無い、デュプレックス だけなら 双重系统 が無い。英語併記の取り違え (`双工系统（dual` / `双重系统（duplex`) と `双机系统` が corpus のどこにも無い。→ PASS。`grep` で `双工系统（dual|双重系统（duplex|双机系统` が translations / explanations に残るのは、2014h26h-q056 の key_guard note (jp) が旧訳語を引用している 1 か所だけ。

**冪等性**: 入替えは対合なので、題の final note の MARK で題ごと skip する (§4 の Rule B を参照)。

置換した全 field (逐字):

#### 2009h21a-q086 translations.stem.zh (×1)

- **before**: 关于双工系统（dual system）的描述，下列哪一项是恰当的？
- **after**: 关于双重系统（dual system）的描述，下列哪一项是恰当的？

#### 2009h21a-q086 .phase1 tr_.stem.zh (×1)

- **before**: 关于双工系统（dual system）的描述，下列哪一项是恰当的？
- **after**: 关于双重系统（dual system）的描述，下列哪一项是恰当的？

#### 2009h21a-q086 expl_tr.correct.zh (×1)

- **before**: 双工系统（dual system）是指让两套配置相同的计算机同时运行、两套系统执行相同的处理，并一边相互核对处理结果一边运行的高可靠化方式。如果结果一致，就判定处理正确并继续；如果出现不一致，就检测到异常，将故障的一侧切离，仅用正常的一侧继续处理。也就是说，「双重运行」和「核对结果」两点都是其特征，描述了这一点的イ是恰当的。它用于银行联机系统等不允许出错的业务。
- **after**: 双重系统（dual system）是指让两套配置相同的计算机同时运行、两套系统执行相同的处理，并一边相互核对处理结果一边运行的高可靠化方式。如果结果一致，就判定处理正确并继续；如果出现不一致，就检测到异常，将故障的一侧切离，仅用正常的一侧继续处理。也就是说，「双重运行」和「核对结果」两点都是其特征，描述了这一点的イ是恰当的。它用于银行联机系统等不允许出错的业务。

#### 2009h21a-q086 expl_tr.d:ア.zh (×1)

- **before**: 在一台计算机上搭载多个微处理器（CPU）进行并行处理的结构，是「多处理器系统」的说明。它是为了提高处理性能的方式，与运行两套系统并核对结果的双工系统在目的和结构上都不同。
- **after**: 在一台计算机上搭载多个微处理器（CPU）进行并行处理的结构，是「多处理器系统」的说明。它是为了提高处理性能的方式，与运行两套系统并核对结果的双重系统在目的和结构上都不同。

#### 2009h21a-q086 expl_tr.d:ウ.zh (×3)

- **before**: 在发生故障时切换到备用机以继续处理的方式，是「双重系统（duplex system）」的说明。平时待机系统在做别的处理或处于停止状态，并不会由两套系统执行相同处理并核对结果。这是瞄准双工（dual）与双重（duplex）混淆的选项。
- **after**: 在发生故障时切换到备用机以继续处理的方式，是「双工系统（duplex system）」的说明。平时待机系统在做别的处理或处于停止状态，并不会由两套系统执行相同处理并核对结果。这是瞄准双重（dual）与双工（duplex）混淆的选项。

#### 2009h21a-q086 expl_tr.p:0.zh (×1)

- **before**: 双工系统 = 用两套系统并行执行相同处理，并相互核对处理结果以检测错误的高可靠化方式。
- **after**: 双重系统 = 用两套系统并行执行相同处理，并相互核对处理结果以检测错误的高可靠化方式。

#### 2009h21a-q086 expl_tr.p:1.zh (×2)

- **before**: 双重系统（duplex system）= 准备现用系统和待机系统，故障时切换到待机系统的方式。要抓住它与双工（双重运行＋核对）的区别。
- **after**: 双工系统（duplex system）= 准备现用系统和待机系统，故障时切换到待机系统的方式。要抓住它与双重系统（双重运行＋核对）的区别。

#### 2012h24a-q057 translations.stem.zh (×1)

- **before**: 关于双工系统（dual system）的说明，哪一项是正确的？
- **after**: 关于双重系统（dual system）的说明，哪一项是正确的？

#### 2012h24a-q057 .phase1 tr_.stem.zh (×1)

- **before**: 关于双工系统（dual system）的说明，哪一项是正确的？
- **after**: 关于双重系统（dual system）的说明，哪一项是正确的？

#### 2012h24a-q057 expl_tr.correct.zh (×1)

- **before**: 正确答案是エ。双工系统是指准备两套结构相同的计算机系统，用这两套系统同时执行完全相同的处理，并把处理结果相互比对（交叉核对）的方式。如果两套系统的结果一致，就把该结果视为正确并进入下一步处理。如果结果不一致，就可以判断某处发生了故障或误动作，于是把异常的那一套切离，仅用剩下的正常系统继续处理。这种机制有两个优点。其一，它不只是检测故障，还能确认「得出的结果是否正确」，因此结果本身的可靠性很高。其二，即使一套发生故障处理也不会停止，因此可用性（运行率）也很高。另一方面，由于始终让两套系统满负荷运行，设备费用和运维成本都会变大。因此，它被用于差错会直接关系到人命或社会的场合，如银行的联机账务系统、座位预订系统、列车运行控制等对可靠性要求极高的用途。题目中「用两套系统执行完全相同的处理，并交叉核对结果」这一描述与上述定义不多不少地完全吻合，所以エ正确。
- **after**: 正确答案是エ。双重系统是指准备两套结构相同的计算机系统，用这两套系统同时执行完全相同的处理，并把处理结果相互比对（交叉核对）的方式。如果两套系统的结果一致，就把该结果视为正确并进入下一步处理。如果结果不一致，就可以判断某处发生了故障或误动作，于是把异常的那一套切离，仅用剩下的正常系统继续处理。这种机制有两个优点。其一，它不只是检测故障，还能确认「得出的结果是否正确」，因此结果本身的可靠性很高。其二，即使一套发生故障处理也不会停止，因此可用性（运行率）也很高。另一方面，由于始终让两套系统满负荷运行，设备费用和运维成本都会变大。因此，它被用于差错会直接关系到人命或社会的场合，如银行的联机账务系统、座位预订系统、列车运行控制等对可靠性要求极高的用途。题目中「用两套系统执行完全相同的处理，并交叉核对结果」这一描述与上述定义不多不少地完全吻合，所以エ正确。

#### 2012h24a-q057 expl_tr.d:ア.zh (×3)

- **before**: 这是双重系统（duplex system）的说明。双重系统由承担日常业务的主系统（现用系）和为应对其故障而待命的从系统（备用系）这两套构成，当主系统发生故障时切换到从系统，由它接续处理。从系统在待命期间，或者以随时可以顶替的相同状态运行（热备份），或者让它去做批处理等别的工作。要点在于：两套系统并不是同时执行相同的处理，而是有一套处于待命状态，因此不具备比对结果、验证其正确性的作用。所以它与以交叉核对为本质的双工系统是两回事。
- **after**: 这是双工系统（duplex system）的说明。双工系统由承担日常业务的主系统（现用系）和为应对其故障而待命的从系统（备用系）这两套构成，当主系统发生故障时切换到从系统，由它接续处理。从系统在待命期间，或者以随时可以顶替的相同状态运行（热备份），或者让它去做批处理等别的工作。要点在于：两套系统并不是同时执行相同的处理，而是有一套处于待命状态，因此不具备比对结果、验证其正确性的作用。所以它与以交叉核对为本质的双重系统是两回事。

#### 2012h24a-q057 expl_tr.d:イ.zh (×1)

- **before**: 这是对等（P2P，peer-to-peer）型分布式处理系统的说明。它指的是接入网络的各台计算机处于对等地位，有时作为请求的一方、有时作为响应的一方，彼此融通资源和服务的形态。这讲的是如何分散处理的构成问题，而不是为提高可靠性的双机冗余方式。它完全不包含双工系统的要点——「把相同的处理做两遍并核对结果」，因此错误。
- **after**: 这是对等（P2P，peer-to-peer）型分布式处理系统的说明。它指的是接入网络的各台计算机处于对等地位，有时作为请求的一方、有时作为响应的一方，彼此融通资源和服务的形态。这讲的是如何分散处理的构成问题，而不是为提高可靠性的双机冗余方式。它完全不包含双重系统的要点——「把相同的处理做两遍并核对结果」，因此错误。

#### 2012h24a-q057 expl_tr.d:ウ.zh (×1)

- **before**: 这是以客户机/服务器系统为代表的层次型（带有上下级关系的）分布式处理系统的说明。它指的是像提供服务的服务器与使用服务的客户机那样，在角色上设定明确的上下级关系并分担处理的形态。与イ一样，这同样是分布式处理构成的分类，而不是通过把系统双机冗余来确保可靠性的方式。它既没有提到结果的交叉核对，也没有提到故障时的切换，因此不能成为双工系统的说明。
- **after**: 这是以客户机/服务器系统为代表的层次型（带有上下级关系的）分布式处理系统的说明。它指的是像提供服务的服务器与使用服务的客户机那样，在角色上设定明确的上下级关系并分担处理的形态。与イ一样，这同样是分布式处理构成的分类，而不是通过把系统双机冗余来确保可靠性的方式。它既没有提到结果的交叉核对，也没有提到故障时的切换，因此不能成为双重系统的说明。

#### 2012h24a-q057 expl_tr.p:0.zh (×4)

- **before**: 区分双工系统与双重系统 —— 双工是用两套系统同时执行相同的处理、并交叉核对结果以保证可靠性的方式；双重是准备主系统（现用系）与从系统（备用系）、在发生故障时进行切换的方式。两者都属于双机冗余，但有没有始终并行处理和结果核对，才是决定性的区别。
- **after**: 区分双重系统与双工系统 —— 双重是用两套系统同时执行相同的处理、并交叉核对结果以保证可靠性的方式；双工是准备主系统（现用系）与从系统（备用系）、在发生故障时进行切换的方式。两者都属于双机冗余，但有没有始终并行处理和结果核对，才是决定性的区别。

#### 2013h25a-q047 expl_tr.correct.zh (×2)

- **before**: 正确答案是エ「硬件的多重化（冗余化）」。不停机系统（非停止系统）是指即使发生故障也不中断服务的系统。如果只用单台设备构成，那么这台设备一旦损坏，整个系统就会立刻停止（单点故障）。因此要把 CPU、磁盘、电源、网络设备等做成双重化、多重化，使其中一方发生故障时由其余部分接管处理。这就是冗余化（多重化），双工系统、以热备用为代表的双机系统（duplex system）、容错设计都基于这一思路。所以，在设计系统方式（系统构成）阶段，为实现不停机而应考虑的恰当事项就是硬件的多重化。
- **after**: 正确答案是エ「硬件的多重化（冗余化）」。不停机系统（非停止系统）是指即使发生故障也不中断服务的系统。如果只用单台设备构成，那么这台设备一旦损坏，整个系统就会立刻停止（单点故障）。因此要把 CPU、磁盘、电源、网络设备等做成双重化、多重化，使其中一方发生故障时由其余部分接管处理。这就是冗余化（多重化），双重系统、以热备用为代表的双工系统（duplex system）、容错设计都基于这一思路。所以，在设计系统方式（系统构成）阶段，为实现不停机而应考虑的恰当事项就是硬件的多重化。

#### 2013h25a-q047 expl_tr.p:0.zh (×1)

- **before**: 不停机系统（高可用性）的基本对策就是冗余化，即硬件的多重化。准备备用机并在故障时切换，从而消除单点故障（双工系统、热备用、容错）。
- **after**: 不停机系统（高可用性）的基本对策就是冗余化，即硬件的多重化。准备备用机并在故障时切换，从而消除单点故障（双重系统、热备用、容错）。

#### 2014h26h-q056 expl_tr.d:イ.zh (×2)

- **before**: 「让两台设备同时运行、始终执行相同处理并相互核对结果」是双工系统（dual system）的说明。双工系统的两个系统同时执行相同的处理并比对结果，因此在错误检测上很强；而在热备用中，待机系统并不并行执行相同的业务处理，只是处于待机状态，所以是另一种方式。
- **after**: 「让两台设备同时运行、始终执行相同处理并相互核对结果」是双重系统（dual system）的说明。双重系统的两个系统同时执行相同的处理并比对结果，因此在错误检测上很强；而在热备用中，待机系统并不并行执行相同的业务处理，只是处于待机状态，所以是另一种方式。

#### 2014h26h-q056 expl_tr.p:1.zh (×4)

- **before**: 双工系统（dual system）与双机系统（duplex system）的区别：双工系统是两个系统同时执行相同处理并比对结果的方式；双机系统（热备用／冷备用都是它的一种形态）则把现用系统与待机系统的角色分开，故障时切换到待机系统。
- **after**: 双重系统（dual system）与双工系统（duplex system）的区别：双重系统是两个系统同时执行相同处理并比对结果的方式；双工系统（热备用／冷备用都是它的一种形态）则把现用系统与待机系统的角色分开，故障时切换到待机系统。

#### 2015h27a-q082 translations.stem.zh (×3)

- **before**: 关于由两套装置构成的系统配置方式 a~c，当其中一套系统发生故障时，按服务停止时间从短到长从左到右排列的选项是哪一个？ / a 双工系统（Dual system） / b 双重系统（冷备用方式） / c 双重系统（热备用方式）
- **after**: 关于由两套装置构成的系统配置方式 a~c，当其中一套系统发生故障时，按服务停止时间从短到长从左到右排列的选项是哪一个？ / a 双重系统（Dual system） / b 双工系统（冷备用方式） / c 双工系统（热备用方式）

#### 2015h27a-q082 .phase1 tr_.stem.zh (×3)

- **before**: 关于由两套装置构成的系统配置方式 a~c，当其中一套系统发生故障时，按服务停止时间从短到长从左到右排列的选项是哪一个？ / a 双工系统（Dual system） / b 双重系统（冷备用方式） / c 双重系统（热备用方式）
- **after**: 关于由两套装置构成的系统配置方式 a~c，当其中一套系统发生故障时，按服务停止时间从短到长从左到右排列的选项是哪一个？ / a 双重系统（Dual system） / b 双工系统（冷备用方式） / c 双工系统（热备用方式）

#### 2015h27a-q082 expl_tr.correct.zh (×2)

- **before**: 正确答案是 ア。将一套系统发生故障时的服务停止时间按从短到长排列，结果为 a→c→b。a 的双工系统是两套系统始终并行执行相同处理并比对结果的方式，即使一套系统故障，剩余的系统也会照常继续处理，因此停止时间几乎为 0，最短。c 的热备用方式双重系统，其待机系已通电、随时可以接管，所以现用系故障时切换较快，排在其次。b 的冷备用方式中待机系处于停机状态，现用系故障时需要启动并加载程序，切换耗时最长。因此按 a、c、b 顺序排列的 ア 正确。
- **after**: 正确答案是 ア。将一套系统发生故障时的服务停止时间按从短到长排列，结果为 a→c→b。a 的双重系统是两套系统始终并行执行相同处理并比对结果的方式，即使一套系统故障，剩余的系统也会照常继续处理，因此停止时间几乎为 0，最短。c 的热备用方式双工系统，其待机系已通电、随时可以接管，所以现用系故障时切换较快，排在其次。b 的冷备用方式中待机系处于停机状态，现用系故障时需要启动并加载程序，切换耗时最长。因此按 a、c、b 顺序排列的 ア 正确。

#### 2015h27a-q082 expl_tr.d:ウ.zh (×2)

- **before**: 该选项把 c（热备用）排在 a（双工系统）之前＝当作更短，但两套系统并行运行、几乎不产生停止的双工系统才更短。前两位的顺序被调换，因此错误。
- **after**: 该选项把 c（热备用）排在 a（双重系统）之前＝当作更短，但两套系统并行运行、几乎不产生停止的双重系统才更短。前两位的顺序被调换，因此错误。

#### 2015h27a-q082 expl_tr.d:エ.zh (×2)

- **before**: 该选项把 a（双工系统）放在末尾＝当作最长，但双工系统在一套系统故障时也接近不停机，实际上最短。它把最短和最长弄反了，因此错误。
- **after**: 该选项把 a（双重系统）放在末尾＝当作最长，但双重系统在一套系统故障时也接近不停机，实际上最短。它把最短和最长弄反了，因此错误。

#### 2015h27a-q082 expl_tr.p:0.zh (×2)

- **before**: 双工系统＝两套系统并行处理，即使一套系统故障也几乎不停机（最短）；双重系统则是在现用系故障时切换到待机系的方式。
- **after**: 双重系统＝两套系统并行处理，即使一套系统故障也几乎不停机（最短）；双工系统则是在现用系故障时切换到待机系的方式。

#### 2015h27a-q082 expl_tr.p:1.zh (×1)

- **before**: 双重系统的切换时间存在这样的关系：热备用（待机系已做好运行准备＝快）＜冷备用（需要启动待机系＝慢）。
- **after**: 双工系统的切换时间存在这样的关系：热备用（待机系已做好运行准备＝快）＜冷备用（需要启动待机系＝慢）。

## 4. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` ×10 (2009h21a 2010h22a 2011h23tokubetsu 2012h24a 2012h24h 2013h25a 2013h25h 2014h26a 2014h26h 2015h27a、exam を明示して実行) | ✅ applied 165 (subN 111 + D-175 25 field + note 後置 29) |
| 変更範囲 (explanations) | ✅ HEAD との差分を題 id 単位で比べると、変わったのは対象 29 題だけ (efull_2 の 23 + 2010h22a-q033 + D-175 の 5)。トップレベルは同一 = merge の drift 0 |
| 変更範囲 (translations sidecar) | ✅ 題 id 単位で 3 題だけ (2009h21a-q086、2012h24a-q057、2015h27a-q082)、トップレベル同一。差分の行は zh だけ |
| 冪等: efix2 dry-run 再実行 | ✅ **applied 0 / skipped 145** (2 回目に修正後の script で。Rule B 参照)。efix1 は 0 / 76、n9b は 0 / 29 |
| D-175 の事後確認 (corpus 全体照合) | ✅ |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold (A1–A7, B1–B7)、layerB=ran |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 図ページ常設ゲート GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| `node --check scripts/quiz-fidfix-S131-efix2.mjs` | ✅ |
| tsc / eslint / vitest / build | ✅ exit 0 / 0 errors (既存 warning 1) / 38 passed・1 skipped (39 files)、563 passed・2 skipped / Compiled successfully |
| correct_answer 差分 (`git diff -U0 -- data/` の `"correct_answer"` 行) | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |

Rule B: `failures/quiz_efix2_D175_idempotency_S131_attempt_1.md`。初版の script は D-175 の入替えが対合で、適用後の dry-run で置換数の assert (q086 8 ≠ 10) が中断した。書込みは無く、データは無傷 (1 回目の `--apply` は正しい)。題の final note の MARK で題ごと skip するよう直し、再実行で applied 0。
