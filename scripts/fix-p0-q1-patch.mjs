/**
 * fix-p0-q1-patch.mjs
 *
 * Patches truncated Q1 stems with Claude vision-extracted content from source PDFs.
 */

import fs from "fs";
import path from "path";

const BY_YEAR_DIR = "data/ip/exams/by_year";
const BANK_PATH = "data/ip/exams/question_bank.json";

const Q1_PATCHES = [
  {
    exam_id: "2009h21a",
    stem_jp: "デファクトスタンダードの意味として，最も適切なものはどれか。",
    choices_jp: {
      "ア": "工業製品に関して，日本工業規格として定めたもの",
      "イ": "工業や科学技術に関して，国際標準化機構が定めた規格",
      "ウ": "特定の企業やグループなどが採用した仕様が広く利用されるようになり，事実上の業界標準になったもの",
      "エ": "特定の国や地域，企業などに限られた基準ではなく，世界中どこでも適用される規格"
    }
  },
  {
    exam_id: "2011h23a",
    stem_jp: "情報システム部員の技術スキル習得に関する施策のうち，OJTに該当するものはどれか。",
    choices_jp: {
      "ア": "参画しているプロジェクトにおいて，モデル化のスキルを習得するため，一部の業務プロセスのモデル化を担当した。",
      "イ": "数年後のキャリアや将来像を描き，そのために必要となるスキルの洗い出しや習得のための計画を自主的に策定した。",
      "ウ": "セキュリティに関するスキルを習得するため，専門性の高い社外のセミナーに参加した。",
      "エ": "本年度の業務目標の一つとして，今後必要なスキルの習得を通信教育によって行うことを，上司と合意した。"
    }
  },
  {
    exam_id: "2011h23tokubetsu",
    stem_jp: "コンピュータプログラムの開発や作成に関する行為のうち，著作権の侵害となるものはどれか。",
    choices_jp: {
      "ア": "インターネットからダウンロードしたHTMLのソースを流用して，別のWebページを作成した。",
      "イ": "インターネットの掲示板で議論されていたアイディアを基にプログラムを作成した。",
      "ウ": "学生のころに自分が作成したプログラムを使い，会社業務の作業効率を向上させるためのプログラムを作成した。",
      "エ": "購入した書籍に掲載されていた流れ図を基にプログラムを作成した。"
    }
  },
  {
    exam_id: "2012h24a",
    stem_jp: "営業秘密を保護する法律はどれか。",
    choices_jp: {
      "ア": "独占禁止法",
      "イ": "特定商取引法",
      "ウ": "不正アクセス禁止法",
      "エ": "不正競争防止法"
    }
  },
  {
    exam_id: "2012h24h",
    stem_jp: "販売価格10万円の製品1,000個を製造し，販売する予定である。A案とB案に関する記述のうち，適切なものはどれか。\n\n| 案 | 固定費 | 製品1個当たりの変動費 |\n| A案 | 1,000万円 | 1万円 |\n| B案 | 2,000万円 | 2万円 |",
    choices_jp: {
      "ア": "A案，B案ともに利益は出ない。",
      "イ": "A案とB案の利益は等しい。",
      "ウ": "A案の方が利益は多い。",
      "エ": "B案の方が利益は多い。"
    }
  },
  {
    exam_id: "2013h25a",
    stem_jp: "A社は新たなシステムの開発を予定している。そのシステムの著作権をA社に帰属させるために必要なことだけを全て挙げたものはどれか。ここで，著作権に関する特段の契約や取決めはない。\n\n① A社は開発の全てを委託する。\n② A社は開発を委託した会社と機密保持契約を締結する。\n③ A社の社員と派遣社員によって開発する。",
    choices_jp: {
      "ア": "①，②",
      "イ": "①，③",
      "ウ": "②，③",
      "エ": "③"
    }
  },
  {
    exam_id: "2013h25h",
    stem_jp: "特定電子メールとは，広告や宣伝といった営利目的に送信される電子メールのことである。特定電子メールの送信者の義務となっている事項だけを全て挙げたものはどれか。\n\na　電子メールの送信拒否を連絡する宛先のメールアドレスなどを明示する。\nb　電子メールの送信同意の記録を保管する。\nc　電子メールの送信を外部委託せずに自ら行う。",
    choices_jp: {
      "ア": "a，b",
      "イ": "a，b，c",
      "ウ": "a，c",
      "エ": "b，c"
    }
  },
  {
    exam_id: "2014h26a",
    stem_jp: "商品の販売数が500個のときの営業利益は表のとおりである。販売単価を10%値下げしたとき，損益分岐点の売上高は何円か。ここで，商品1個当たりの変動費及び販売数は，販売単価の値下げの前後で変わらないものとする。\n\n| 売上高 | 900,000 |\n| 変動費 | 324,000 |\n| 固定費 | 300,000 |\n| 営業利益 | 276,000 |",
    choices_jp: {
      "ア": "468,750",
      "イ": "486,000",
      "ウ": "500,000",
      "エ": "576,000"
    }
  },
  {
    exam_id: "2014h26h",
    stem_jp: "小売業のビジネス戦略の立案において，\"優良顧客の維持\"がCSF（Critical Success Factor）として設定された。このCSFの達成度を評価するために用いる分析として，最も適切なものはどれか。",
    choices_jp: {
      "ア": "顧客のRFM分析",
      "イ": "新規顧客のデモグラフィック分析",
      "ウ": "新商品のPOS分析",
      "エ": "店舗別商品別売上高のABC分析"
    }
  },
  {
    exam_id: "2015h27h",
    stem_jp: "組織が経営戦略と情報システム戦略に基づいて情報システムの企画・開発・運用・保守を行うとき，そのライフサイクルの中で効果的な情報システム投資及びリスク低減のためのコントロールを適切に行うための実践規範はどれか。",
    choices_jp: {
      "ア": "コンピュータ不正アクセス対策基準",
      "イ": "システム監査基準",
      "ウ": "システム管理基準",
      "エ": "情報システム安全対策基準"
    }
  },
  {
    exam_id: "2020r02o",
    stem_jp: "情報システムの調達の際に作成される文書に関して，次の記述中のa，bに入れる字句の適切な組合せはどれか。\n\n調達する情報システムの概要や提案依頼事項，調達条件などを明示して提案書の提出を依頼する文書は a である。また，システム化の目的や業務概要などを示すことによって，関連する情報の提供を依頼する文書は b である。",
    choices_jp: {
      "ア": "a：RFI　b：RFP",
      "イ": "a：RFI　b：SLA",
      "ウ": "a：RFP　b：RFI",
      "エ": "a：RFP　b：SLA"
    }
  },
  {
    exam_id: "2023r05",
    stem_jp: "新しいビジネスモデルや製品を開発する際に，仮説に基づいて実用に向けた最小限のサービスや製品を作り，短期に顧客価値の検証を繰り返すことによって，新規事業などを成功させる可能性を高める手法を示す用語はどれか。",
    choices_jp: {
      "ア": "カニバリゼーション",
      "イ": "業務モデリング",
      "ウ": "デジタルトランスフォーメーション",
      "エ": "リーンスタートアップ"
    }
  },
  {
    exam_id: "2026r08",
    stem_jp: "生成AIを用いた生成物の取扱いに関して，既存の著作物の著作権者から許諾を得ることが必要となる可能性のあるものはどれか。全て挙げたものはどれか。\n\na　好みのアーティストの楽曲に似た音楽が得られるように生成AIを用いて楽曲を生成し，その楽曲をインターネット上にアップロードし，無料で公開した。\nb　好みのアーティストの楽曲に似た音楽が得られるように生成AIを用いて楽曲を生成し，その楽曲を自分のPC上に保管し，個人で視聴した。\nc　生成AIで音楽を生成したところ，偶然好みのアーティストの楽曲に似た音楽が生成できたので，自分のPC上に保管し，個人で視聴した。",
    choices_jp: {
      "ア": "a",
      "イ": "a，b",
      "ウ": "a，b，c",
      "エ": "b，c"
    }
  },
];

function main() {
  console.log("P0 Q1 Patch — applying vision-extracted Q1 stems");
  let patched = 0;

  for (const patch of Q1_PATCHES) {
    const fp = path.join(BY_YEAR_DIR, `${patch.exam_id}.json`);
    if (!fs.existsSync(fp)) {
      console.log(`  SKIP: ${patch.exam_id} file not found`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(fp, "utf-8"));
    const q1 = data.questions.find(q => q.question_number === 1);

    if (q1) {
      const oldStem = q1.stem_jp;
      q1.stem_jp = patch.stem_jp;
      q1.choices_jp = patch.choices_jp;
      console.log(`  PATCHED: ${patch.exam_id}-q001 stem "${oldStem.slice(0, 20)}..." → "${patch.stem_jp.slice(0, 40)}..."`);
      patched++;
    } else {
      // Q1 doesn't exist — create it
      const newQ = {
        id: `${patch.exam_id}-q001`,
        question_number: 1,
        stem_jp: patch.stem_jp,
        choices_jp: patch.choices_jp,
        correct_answer: data.questions[0]?.correct_answer || null,
        has_figure: false,
        figure_description: null,
        syllabus_refs: [],
        year: data.year_label,
        fiscal_year: data.fiscal_year,
      };
      data.questions.unshift(newQ);
      data.question_count = data.questions.length;
      console.log(`  CREATED: ${patch.exam_id}-q001 "${patch.stem_jp.slice(0, 40)}..."`);
      patched++;
    }

    fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
  }

  // Regenerate question_bank.json
  const examOrder = [
    "2009h21h", "2009h21a", "2010h22h", "2010h22a",
    "2011h23tokubetsu", "2011h23a", "2012h24h", "2012h24a",
    "2013h25h", "2013h25a", "2014h26h", "2014h26a",
    "2015h27h", "2015h27a", "2016h28h", "2016h28a",
    "2017h29h", "2017h29a", "2018h30h", "2018h30a",
    "2019h31h", "2019r01a", "2020r02o", "2021r03",
    "2022r04", "2023r05", "2024r06", "2025r07", "2026r08",
  ];
  const allQ = [];
  for (const eid of examOrder) {
    const fp = path.join(BY_YEAR_DIR, `${eid}.json`);
    if (!fs.existsSync(fp)) continue;
    allQ.push(...JSON.parse(fs.readFileSync(fp, "utf-8")).questions);
  }
  const bank = {
    version: "2.2-q1-patched",
    extracted_at: new Date().toISOString(),
    exam_count: examOrder.length,
    question_count: allQ.length,
    questions: allQ,
  };
  fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2), "utf-8");

  console.log(`\nPatched: ${patched} / ${Q1_PATCHES.length}`);
  console.log(`Total questions: ${allQ.length}`);
}

main();
