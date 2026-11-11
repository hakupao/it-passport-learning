// D-216 (S153) — units allowed fewer than CONFIRM.min (3) confirmation questions: the topic has no further past
// question that the unit's own text answers (judged per unit, evidence/phase5/stage_07_ui/phase3/cleanup/C11*.md).
// validateV2 then requires exactly `n` (a calibration, like PRE_D202): a unit not listed keeps the 3〜5 rule, and
// an entry that no longer matches the unit fails, so the register cannot go stale. Pure .ts: imported by
// validateV2.ts (Node scripts load it with native type stripping).

export interface ConfirmShort {
  /** confirm questions the unit shows (pickConfirm), 0〜2 */
  n: number;
  /** why no same-topic replacement was found */
  reason: string;
}

export const CONFIRM_SHORT: Readonly<Record<string, ConfirmShort>> = {
  "technology-15-42-u03": { n: 2, reason: "S153 C11 + Rule D M2: 無関係題 2 件を除去、本文で解ける同 topic 題はアクチュエーターの近似 2 題のみで u03 / u04 に 1 題ずつ (C11_replacement_judged.json)" },
  "technology-15-42-u04": { n: 2, reason: "S153 C11 + Rule D M2: 無関係題 4 件を除去、本文で解ける同 topic 題はアクチュエーターの近似 2 題のみで u03 / u04 に 1 題ずつ (C11_replacement_judged.json)" },
  "strategy-01-01-u11": { n: 1, reason: "S153 C11: v1 由来の無関係題 2 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "strategy-01-02-u07": { n: 2, reason: "S153 C11: v1 由来の無関係題 2 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "strategy-01-02-u09": { n: 1, reason: "S153 C11: v1 由来の無関係題 4 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "strategy-01-02-u10": { n: 0, reason: "S153 C11: v1 由来の無関係題 4 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "strategy-01-02-u11": { n: 0, reason: "S153 C11: v1 由来の無関係題 5 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "strategy-02-07-u03": { n: 0, reason: "S153 C11: v1 由来の無関係題 3 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "strategy-03-10-u07": { n: 0, reason: "S153 C11: v1 由来の無関係題 5 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "strategy-05-14-u02": { n: 2, reason: "S153 C11: v1 由来の無関係題 1 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "strategy-05-14-u03": { n: 0, reason: "S153 C11: v1 由来の無関係題 5 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "strategy-05-14-u04": { n: 2, reason: "S153 C11: v1 由来の無関係題 1 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "strategy-05-14-u08": { n: 0, reason: "S153 C11: v1 由来の無関係題 5 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "strategy-06-20-u02": { n: 1, reason: "S153 C11: v1 由来の無関係題 3 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-13-34-u03": { n: 0, reason: "S153 C11: v1 由来の無関係題 3 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-13-34-u04": { n: 2, reason: "S153 C11: v1 由来の無関係題 2 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-13-34-u05": { n: 2, reason: "S153 C11: v1 由来の無関係題 1 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-13-34-u07": { n: 2, reason: "S153 C11: v1 由来の無関係題 1 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-13-35-u07": { n: 2, reason: "S153 C11: v1 由来の無関係題 2 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-14-37-u04": { n: 0, reason: "S153 C11: v1 由来の無関係題 4 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-14-38-u03": { n: 2, reason: "S153 C11: v1 由来の無関係題 2 件を除去、同 topic 候補 9 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-15-42-u01": { n: 2, reason: "S153 C11: v1 由来の無関係題 1 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-17-45-u02": { n: 2, reason: "S153 C11: v1 由来の無関係題 3 件を除去、同 topic 候補 12 件で本文から解ける題 1 件 (C11_replacement_judged.json)" },
  "technology-19-50-u01": { n: 1, reason: "S153 C11: v1 由来の無関係題 2 件を除去、同 topic 候補 5 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-19-51-u02": { n: 2, reason: "S153 C11: v1 由来の無関係題 2 件を除去、同 topic 候補 8 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-20-52-u02": { n: 2, reason: "S153 C11: v1 由来の無関係題 1 件を除去、同 topic 候補 11 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-20-52-u03": { n: 2, reason: "S153 C11: v1 由来の無関係題 1 件を除去、同 topic 候補 11 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-20-53-u02": { n: 0, reason: "S153 C11: v1 由来の無関係題 4 件を除去、同 topic 候補 5 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
  "technology-23-61-u13": { n: 1, reason: "S153 C11: v1 由来の無関係題 4 件を除去、同 topic 候補 12 件で本文から解ける題 0 件 (C11_replacement_judged.json)" },
};
