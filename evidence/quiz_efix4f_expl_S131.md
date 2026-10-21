# S131 efix4f — 解説是正 (efull_4 のうち 2021r03、D-176 / D-177: 1 unit = 1 exam)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_4.json` の 2021r03 の medium 2 題・指摘 4 件 (q020 ×2 / q058 ×2)
- script: `scripts/quiz-fidfix-S131-efix4f.mjs` (efix4d と同じ形)
- correct_answer 変更 0。stem / choices / translations sidecar は不変

## 0. translations sidecar の照合

q020 の選択肢イの訳 (zh「计算机自身能够自动地提取出水果的特征」/ en "automatically extract the features") は jp どおりで、「教師なし」は含まれていない。q058 の選択肢アの訳 (zh「设置环形（圆形）安全闸门」/ en "Install a circle-type security gate") にも「回転式」は無い → 変更なし (差分 0)。

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2021r03-q020 正解 | イを「正解ラベルを与えない教師なし学習」の典型例と言い切っている | 選択肢イは「果物の写真を大量に入力」「コンピュータ自身が特徴を自動的に抽出」で、ラベルの有無に触れていない。要点は、人が特徴量を設計しなくても深層学習で自動抽出できること。果物の画像の分類は普通は教師あり学習 | ACCEPT。括弧を「深層学習のように、人が特徴量を設計せずにデータから自動で抽出する点」に (jp / zh / en) |
| 2 | 2021r03-q020 要点 2 | 同じ誤った分類を要点として固定している | 同上 | ACCEPT。特徴量の自動抽出 (深層学習) を機械学習の特徴とする形に (jp / zh / en) |
| 3 | 2021r03-q058 正解 | サークル型ゲートを「回転式・回転バーで区切られた区画」と説明している | サークル型セキュリティゲートは円筒形のブースで、入口と出口の扉が同時に開かない (インターロック)。重量センサなどで内部が一人であることを確認してから通す。回転バーはターンスタイル・回転ドアの説明 | ACCEPT (jp / zh / en)。正解アは不変 |
| 4 | 2021r03-q058 要点 2 | アンチパスバックを「一人ずつ通過を強制」「物理的に阻止」と説明している | アンチパスバックは入退室記録の整合を確認する論理的な制御 (入室記録の無い ID は退室させない)。共連れで入った者は記録が無いので出られず、発覚して抑止になる | ACCEPT。ゲート (物理) とアンチパスバック (論理) を分けて書いた (jp / zh / en) |

集計: medium 2 題 (指摘 4 件) → **ACCEPT 4 / REJECT 0**。applied 14 = 置換 12 + note 後置 2。

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2021r03-q020 correct

- **jp before**: 機械学習とは、大量のデータをコンピュータに与え、コンピュータ自身がそのデータに潜む規則性や特徴 (特徴量) を自動的に見つけ出す技術である。イは「果物の写真を大量に入力することで、コンピュータ自身が果物の特徴を自動的に抽出できるようになった」とあり、画像データから特徴量を自ら学習している。これは画像認識システムにおける機械学習 (とくに正解ラベルを与えず特徴を見つけ出す教師なし学習) の典型的な事例であり、正解はイ。
- **jp after**: 機械学習とは、大量のデータをコンピュータに与え、コンピュータ自身がそのデータに潜む規則性や特徴 (特徴量) を自動的に見つけ出す技術である。イは「果物の写真を大量に入力することで、コンピュータ自身が果物の特徴を自動的に抽出できるようになった」とあり、画像データから特徴量を自ら学習している。これは画像認識システムにおける機械学習 (とくに深層学習のように、人が特徴量を設計せずにデータから自動で抽出する点) の典型的な事例であり、正解はイ。

- **zh before**: 机器学习是指向计算机提供大量数据，由计算机自身自动找出数据中潜藏的规律性和特征（特征量）的技术。选项イ写道「通过大量输入水果的照片，计算机自身能够自动提取水果的特征」，即从图像数据中自主学习特征量。这是图像识别系统中机器学习（尤其是不给出正确标签、自行找出特征的无监督学习）的典型实例，因此正确答案是イ。
- **zh after**: 机器学习是指向计算机提供大量数据，由计算机自身自动找出数据中潜藏的规律性和特征（特征量）的技术。选项イ写道「通过大量输入水果的照片，计算机自身能够自动提取水果的特征」，即从图像数据中自主学习特征量。这是图像识别系统中机器学习（尤其是像深度学习那样，不由人来设计特征量，而是从数据中自动提取）的典型实例，因此正确答案是イ。

- **en before**: Machine learning is a technology in which a large amount of data is given to a computer, and the computer itself automatically discovers the regularities and features (feature quantities) hidden in that data. Choice イ states that “by feeding a large number of fruit photos into a computer, the computer itself became able to automatically extract the features of the fruit,” meaning it learns the feature quantities from the image data on its own. This is a typical example of machine learning in an image recognition system (in particular unsupervised learning, which finds features without being given correct labels), so the correct answer is イ.
- **en after**: Machine learning is a technology in which a large amount of data is given to a computer, and the computer itself automatically discovers the regularities and features (feature quantities) hidden in that data. Choice イ states that “by feeding a large number of fruit photos into a computer, the computer itself became able to automatically extract the features of the fruit,” meaning it learns the feature quantities from the image data on its own. This is a typical example of machine learning in an image recognition system (in particular, as in deep learning, features are extracted automatically from the data without people designing them), so the correct answer is イ.


#### 2021r03-q020 p:1

- **jp before**: 正解ラベルを与えずデータから特徴を抽出する形は「教師なし学習」に相当し、画像認識では大量の画像から特徴量を学習する点が要点。
- **jp after**: 人が特徴量を設計しなくてもデータから自動で抽出できる (深層学習) のが機械学習の特徴で、画像認識では大量の画像から特徴量を学習する点が要点。

- **zh before**: 不给出正确标签、从数据中提取特征的形式相当于「无监督学习」，在图像识别中，从大量图像中学习特征量是要点。
- **zh after**: 无需人来设计特征量、可以从数据中自动提取（深度学习），这是机器学习的特点；在图像识别中，从大量图像中学习特征量是要点。

- **en before**: Extracting features from data without being given correct labels corresponds to “unsupervised learning,” and in image recognition the key point is learning feature quantities from a large number of images.
- **en after**: A feature of machine learning is that features can be extracted automatically from data without people designing them (deep learning), and in image recognition the key point is learning feature quantities from a large number of images.


#### 2021r03-q058 correct

- **jp before**: 共連れとは、正規の入室者が扉を開けた隙に、認証していない者が続いて一緒に入る不正入室の手口。これを物理的に防ぐ鍵は「一度の認証につき一人しか通過させない」こと。サークル型（回転式）のセキュリティゲートは、回転バーで区切られた一区画に一人ずつしか入れず、認証しないと回転しない構造のため、後ろに続こうとしても物理的に通過できない。よってアが共連れ対策の適切な例。
- **jp after**: 共連れとは、正規の入室者が扉を開けた隙に、認証していない者が続いて一緒に入る不正入室の手口。これを物理的に防ぐ鍵は「一度の認証につき一人しか通過させない」こと。サークル型のセキュリティゲートは円筒形のブースで、入口側と出口側の扉が同時には開かず、重量センサなどで内部に一人だけいることを確認してから出口側が開く構造のため、後ろに続こうとしても物理的に通過できない。よってアが共連れ対策の適切な例。

- **zh before**: 尾随是指未经认证者趁正规入室者开门的间隙紧跟其后一起进入的非法入室手法。要在物理上防止它，关键在于「每次认证只允许一人通过」。环形（旋转式）安全闸门由旋转杆隔出的每个区间只能容纳一人，且不认证就无法旋转，因此即使有人想跟在后面，也在物理上无法通过。所以ア是防止尾随的恰当示例。
- **zh after**: 尾随是指未经认证者趁正规入室者开门的间隙紧跟其后一起进入的非法入室手法。要在物理上防止它，关键在于「每次认证只允许一人通过」。环形安全闸门是圆筒形的隔间，入口侧和出口侧的门不会同时打开，并通过重量传感器等确认内部只有一人后才打开出口侧，因此即使有人想跟在后面，也在物理上无法通过。所以ア是防止尾随的恰当示例。

- **en before**: Tailgating is an unauthorized-entry technique in which an unauthenticated person slips in right behind a legitimate entrant while the door is open. The key to preventing it physically is to let only one person pass per authentication. A circle-type (rotating) security gate divides space with a rotating bar so that only one person fits in each section, and it will not rotate without authentication; therefore someone trying to follow behind cannot physically get through. Thus ア is the appropriate example of a tailgating countermeasure.
- **en after**: Tailgating is an unauthorized-entry technique in which an unauthenticated person slips in right behind a legitimate entrant while the door is open. The key to preventing it physically is to let only one person pass per authentication. A circle-type security gate is a cylindrical booth whose entrance-side and exit-side doors never open at the same time, and it opens the exit side only after confirming, with a weight sensor or the like, that just one person is inside; therefore someone trying to follow behind cannot physically get through. Thus ア is the appropriate example of a tailgating countermeasure.


#### 2021r03-q058 p:1

- **jp before**: サークル型セキュリティゲートやアンチパスバックは、一人ずつ通過を強制し二重入場・共連れを物理的に阻止する代表的な物理セキュリティ対策。
- **jp after**: サークル型セキュリティゲートは一人ずつの通過を物理的に強制して共連れを防ぐ。アンチパスバックは入退室の記録の整合を確認し (入室記録の無い ID では退室させない)、共連れを検知・抑止する論理的な対策で、両者を区別して押さえる。

- **zh before**: 环形安全闸门和反潜回（Anti-passback）强制逐人通过，是在物理上阻止重复入场与尾随的代表性物理安全措施。
- **zh after**: 环形安全闸门在物理上强制逐人通过以防止尾随。反潜回（Anti-passback）则是核对出入室记录是否一致（没有入室记录的 ID 不允许出室）、从而检测和抑制尾随的逻辑性对策，两者要区分开来。

- **en before**: Circle-type security gates and anti-passback enforce one-at-a-time passage and are representative physical security measures that physically block double entry and tailgating.
- **en after**: A circle-type security gate physically enforces one-at-a-time passage to prevent tailgating. Anti-passback is a logical control that checks the consistency of entry and exit records (an ID with no entry record cannot exit) to detect and deter tailgating; distinguish the two.


## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2021r03` | ✅ applied 14 |
| 変更範囲 | ✅ HEAD との差分を題 id 単位で比べると、explanations は対象の題だけ (§1)、トップレベルは同一。translations は §0 のとおり |
| 冪等: dry-run 再実行 | ✅ applied 0 / skipped 14 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |
| tsc / eslint / vitest / build | D-177 により efix4k の後にまとめて 1 回 (efix4k の evidence に記録) |

Rule B: 失敗した attempt なし。

## 4. Rule D (verifier type、opus、編集なし)

判定 **PASS-with-notes** (medium 4 件すべて解消、ブロッカー 0)。q020 / q058 とも VERIFIED。dry-run applied 0 / skipped 14、crosscheck `--require-raw` all invariants hold。差分は q020 / q058 の key_guard・correct・points だけ。sidecar と questions.json の差分 0。残っている誤りの語 (教師なし / 回転 / 物理的に阻止 など) は 0 件。
- low (任意、未修正): q058 要点 2 の「論理的な対策」。IPA ではアンチパスバックを入退室管理 (物理的対策) の一部として扱う。直す場合の案: jp「…共連れを検知・抑止する仕組み (物理的な障壁ではなく記録で判定する入退室管理) で、両者を区別して押さえる。」/ zh「…检测和抑制尾随的机制（不是物理屏障，而是依据记录进行判定的出入室管理），两者要区分开来。」/ en "…to detect and deter tailgating — a record-based entry/exit control rather than a physical barrier; distinguish the two."
- low (任意、未修正): q020 要点 2。特徴量を自動で抽出するのは、厳密には深層学習の特徴。案:「人が特徴量を設計しなくてもデータから自動で抽出できる点は深層学習の特徴で、画像認識では大量の画像から特徴量を学習する点が要点。」
- low (範囲外): questions.json の q020 terms に「教師なし学習」が残っている (questions.json は不可触)。q020 zh の「特征量」「使用例」、q058 zh の「出室」は監査で low
