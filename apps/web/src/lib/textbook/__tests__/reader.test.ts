// Stage 6 (Session 85) — production reader data-layer unit tests (pure, no disk).
//
// Guards the navigation/grouping + locale-mapping contract that the reader UI
// depends on: category ordering (D-114 path), unit_order preservation, the
// ja→jp suffix bridge, and per-locale field pickers.

import { describe, expect, it } from "vitest";

import {
  buildNav,
  CATEGORY_ORDER,
  neighbors,
  pick,
  pickList,
  pickTerm,
  toDataLang,
  type ReaderIndex,
} from "../reader";

const u = (
  unit_id: string,
  jp: string,
  zh: string,
  en: string,
  badge: string,
  term_count: number,
) => ({ unit_id, title_jp: jp, title_zh: zh, title_en: en, node_freq_badge: badge, term_count });

const idx: ReaderIndex = {
  schema_version: "stage4-toc-v1",
  stats: { topics: 3, units: 4, terms: 10 },
  topics: [
    {
      topic_id: "strategy-01-01",
      category: "strategy",
      major: "企業と法務",
      major_zh: "企业与法务",
      major_en: "Corporate and Legal Affairs",
      medium: "企業活動",
      medium_zh: "企业活动",
      medium_en: "Corporate Activities",
      name_jp: "経営・組織論",
      unit_order: ["strategy-01-01-u02", "strategy-01-01-u01"],
      units: [
        u("strategy-01-01-u01", "S1", "S1中", "S1en", "標準", 5),
        u("strategy-01-01-u02", "S2", "S2中", "S2en", "頻出", 6),
      ],
    },
    {
      topic_id: "technology-01-01",
      category: "technology",
      major: "基礎理論",
      major_zh: "基础理论",
      major_en: "Basic Theory",
      medium: "離散数学",
      medium_zh: "离散数学",
      medium_en: "Discrete Mathematics",
      name_jp: "離散数学",
      unit_order: ["tech-u1"],
      units: [u("tech-u1", "T1", "T1中", "T1en", "頻出", 4)],
    },
    {
      topic_id: "management-01-01",
      category: "management",
      major: "開発技術",
      major_zh: "开发技术",
      major_en: "Development Technology",
      medium: "システム開発",
      medium_zh: "系统开发",
      medium_en: "System Development",
      name_jp: "システム開発技術",
      unit_order: ["mgmt-u1"],
      units: [u("mgmt-u1", "M1", "M1中", "M1en", "低頻", 3)],
    },
  ],
};

describe("toDataLang", () => {
  it("maps the app locale to the corpus suffix (ja→jp)", () => {
    expect(toDataLang("ja")).toBe("jp");
    expect(toDataLang("zh")).toBe("zh");
    expect(toDataLang("en")).toBe("en");
  });
  it("defaults unknown locales to jp (corpus authoritative language)", () => {
    expect(toDataLang("fr")).toBe("jp");
    expect(toDataLang("")).toBe("jp");
  });
});

describe("buildNav", () => {
  const nav = buildNav(idx, "ja");

  it("orders categories by the D-114 learning path", () => {
    expect(nav.map((c) => c.category)).toEqual(["technology", "management", "strategy"]);
    expect(CATEGORY_ORDER).toEqual(["technology", "management", "strategy"]);
  });

  it("preserves unit_order within a topic (not units[] array order)", () => {
    const strat = nav.find((c) => c.category === "strategy")!;
    expect(strat.topics[0]!.units.map((x) => x.unit_id)).toEqual([
      "strategy-01-01-u02",
      "strategy-01-01-u01",
    ]);
  });

  it("carries the freq badge + term count onto nav units", () => {
    const tech = nav.find((c) => c.category === "technology")!;
    expect(tech.topics[0]!.units[0]).toMatchObject({
      unit_id: "tech-u1",
      title: "T1",
      badge: "頻出",
      term_count: 4,
    });
  });

  it("resolves unit title + major/medium labels to the active locale", () => {
    const stratZh = buildNav(idx, "zh").find((c) => c.category === "strategy")!.topics[0]!;
    expect(stratZh.major).toBe("企业与法务");
    expect(stratZh.medium).toBe("企业活动");
    expect(stratZh.units[0]!.title).toBe("S2中"); // unit_order[0] = u02
    const stratEn = buildNav(idx, "en").find((c) => c.category === "strategy")!.topics[0]!;
    expect(stratEn.major).toBe("Corporate and Legal Affairs");
    expect(stratEn.units[0]!.title).toBe("S2en");
  });

  it("keeps the 小分類 topic name in JP for every locale (OQ-03)", () => {
    for (const loc of ["ja", "zh", "en"]) {
      const t = buildNav(idx, loc).find((c) => c.category === "strategy")!.topics[0]!;
      expect(t.name_jp).toBe("経営・組織論");
    }
  });

  it("falls back to jp when a locale title is blank", () => {
    const blanked: ReaderIndex = {
      ...idx,
      topics: [
        {
          ...idx.topics[1]!,
          units: [u("tech-u1", "T1", "", "", "頻出", 4)],
        },
      ],
    };
    expect(buildNav(blanked, "zh")[0]!.topics[0]!.units[0]!.title).toBe("T1");
  });

  it("drops unit_order ids with no matching units entry (defensive)", () => {
    const broken: ReaderIndex = {
      ...idx,
      topics: [
        {
          ...idx.topics[1]!,
          unit_order: ["tech-u1", "ghost-uX"],
        },
      ],
    };
    const got = buildNav(broken, "ja");
    expect(got[0]!.topics[0]!.units.map((x) => x.unit_id)).toEqual(["tech-u1"]);
  });

  it("appends unknown categories after the known order", () => {
    const extra: ReaderIndex = {
      ...idx,
      topics: [
        ...idx.topics,
        {
          topic_id: "x-01-01",
          category: "frontier",
          major: "X",
          major_zh: "X",
          major_en: "X",
          medium: "X",
          medium_zh: "X",
          medium_en: "X",
          name_jp: "X",
          unit_order: ["x-u1"],
          units: [u("x-u1", "X1", "X1", "X1", "標準", 1)],
        },
      ],
    };
    expect(buildNav(extra, "ja").map((c) => c.category)).toEqual([
      "technology",
      "management",
      "strategy",
      "frontier",
    ]);
  });
});

describe("neighbors", () => {
  it("returns prev/next by unit_order with topic name", () => {
    const n = neighbors(idx, "strategy-01-01-u01");
    // unit_order = [u02, u01] → u01 is last: prev=u02, next=null
    expect(n.topicName).toBe("経営・組織論");
    expect(n.prev).toEqual({ unit_id: "strategy-01-01-u02", title_jp: "S2" });
    expect(n.next).toBeNull();
  });
  it("returns nulls for an unknown unit", () => {
    expect(neighbors(idx, "nope")).toEqual({ topicName: "", prev: null, next: null });
  });
});

describe("per-locale pickers", () => {
  const term = { term: "在庫", term_zh: "库存", term_en: "Inventory" };
  const obj = {
    definition_jp: "日本語",
    definition_zh: "中文",
    definition_en: "English",
    key_points_jp: ["あ", "い"],
    key_points_zh: ["甲", "乙"],
    key_points_en: ["a", "b"],
  };

  it("pick() returns the active-locale string", () => {
    expect(pick(obj, "definition", "ja")).toBe("日本語");
    expect(pick(obj, "definition", "zh")).toBe("中文");
    expect(pick(obj, "definition", "en")).toBe("English");
  });
  it("pick() returns '' for a missing field rather than undefined", () => {
    expect(pick(obj, "missing", "ja")).toBe("");
  });
  it("pickList() returns the active-locale array", () => {
    expect(pickList(obj, "key_points", "zh")).toEqual(["甲", "乙"]);
    expect(pickList(obj, "absent", "en")).toEqual([]);
  });
  it("pickTerm() uses bare `term` for ja, suffixed for zh/en", () => {
    expect(pickTerm(term, "ja")).toBe("在庫");
    expect(pickTerm(term, "zh")).toBe("库存");
    expect(pickTerm(term, "en")).toBe("Inventory");
  });
});
