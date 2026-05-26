#!/usr/bin/env python3
"""R11: surgical fixes for defects surfaced by R10 audit.

Fixes (all applied to canonical /data/.../runs/dry_run_2026-05-12T13-23-19/):
  F1 — broaden MD `A. a.` dedupe (covers `> **Answer**: A. a. ...`)
  F2 — p200 ホスティングサービス: jp/zh/en `(契約しているサーバの所在が不明確)` → `明確`
  F3 — p445 entity[0]: answer_index 0 → 2 (printed key=ア, but pipeline reordered choices)
  F4 — p445 entity[1]: choices 値 4/5/6 → 3/4/5 (lost イ=3 between current ア/イ)
  F5 — p445 entity[2]: stem jp+zh+en full restoration from OCR
  F6 — p566 entity[8]: surface 完全 → 完全性 (Integrity)
  F7 — p566 entity[22]: surface ベストソリューションズ → ペネトレーションテスト + def restore
  F8 — p566 entity[23]: surface シングルパスワード → ワンタイムパスワード
  F9 — p566 entity[5]: definition restore from OCR (risk management)
  F10 — p566 entity[12]: definition flip (digital signature: send→detect)
  F11 — p566 entity[29]: definition fix (biometric: ネットトレース→筆跡/キーストローク)
  F12 — p561 ハウジング zh disambiguation (collision with ホスティング)

Each fix applies to structured/, translated/, and output/pages/ where applicable.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
LOG = ROOT / "validation/deep_validation_2026-05-17/iter_3/r11_fixes_log.json"
LOG.parent.mkdir(parents=True, exist_ok=True)

# Broader MD A.a. pattern — matches anywhere in line
EN_DUP_PAT_BROAD = re.compile(r"([A-D])\. ([a-d]|[iueo])\. ")


def load_json(p: Path) -> dict:
    return json.loads(p.read_text(encoding="utf-8"))


def save_json(p: Path, d: dict) -> None:
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


# -------- F1: broaden MD dedupe --------
def f1_md_broader_dedupe() -> dict:
    edits = []
    for f in sorted((RUN / "output/pages").glob("page_*.md")):
        txt = f.read_text(encoding="utf-8")
        new, n = EN_DUP_PAT_BROAD.subn(lambda m: f"{m.group(1)}. ", txt)
        if n:
            f.write_text(new, encoding="utf-8")
            edits.append({"file": f.name, "edits": n})
    return {"description": "MD A.a./i./u./e. broader dedupe", "edits": edits, "total": sum(e["edits"] for e in edits)}


# -------- F2: p200 ホスティング 不明確→明確 --------
def f2_p200_hosting() -> dict:
    edits = []
    # Fix only entries whose jp surface starts with ホスティング (NOT クラウド)
    targets = [
        ("jp", "（契約しているサーバの所在が不明確）", "（契約しているサーバの所在が明確）"),
        ("zh", "所签约服务器的所在地不明确", "所签约服务器的所在地明确"),
        ("zh", "所签约服务器所在地不明确", "所签约服务器所在地明确"),
        ("en", "the location of the contracted server is unclear", "the location of the contracted server is clear"),
        ("en", "the location of contracted server is unclear", "the location of contracted server is clear"),
    ]
    for stage_subdir in ["structured", "translated", "output/pages"]:
        f = RUN / stage_subdir / "page_200.json"
        if not f.exists():
            continue
        d = load_json(f)
        ents = d.get("entities", []) if isinstance(d, dict) else d
        local = 0
        for e in ents:
            if not isinstance(e, dict):
                continue
            surf = e.get("surface", {}) or {}
            sj = surf.get("jp", "")
            if "ホスティングサービス" in sj or "ホスティング" == sj:
                defn = e.get("definition", {}) or {}
                for lang, bad, good in targets:
                    if lang in defn and bad in defn[lang]:
                        defn[lang] = defn[lang].replace(bad, good)
                        local += 1
        if local:
            save_json(f, d)
            edits.append({"file": str(f.relative_to(RUN)), "edits": local})
    # md
    md = RUN / "output/pages/page_200.md"
    if md.exists():
        txt = md.read_text(encoding="utf-8")
        # find ホスティング section and fix its line only
        # use line-level: replace within lines that mention ホスティング
        new_lines = []
        in_hosting = False
        for line in txt.splitlines(keepends=True):
            if "ホスティング" in line or "Hosting" in line:
                in_hosting = True
            elif "クラウド" in line or "Cloud" in line or "ハウジング" in line or "Housing" in line:
                in_hosting = False
            if in_hosting:
                for _, bad, good in targets:
                    line = line.replace(bad, good)
            new_lines.append(line)
        new_txt = "".join(new_lines)
        if new_txt != txt:
            md.write_text(new_txt, encoding="utf-8")
            edits.append({"file": "output/pages/page_200.md", "edits": "section-local"})
    return {"description": "p200 ホスティング 不明確→明確", "edits": edits}


# -------- F3-F5: p445 entity[0/1/2] --------
P445_E2_STEM_JP = "セルD2とE2に設定した2種類の仮の消費税率でセルA4とA5の商品の税込み価格を計算するために、セルD4に入れるべき計算式はどれか。ここで、セルD4に入力する計算式は、セルD5、E4及びE5に複写して使うものとする。"
P445_E2_STEM_ZH = "为使用在单元格D2和E2中设定的2种临时消费税率计算单元格A4和A5中商品的含税价格，应当在单元格D4中输入的计算式是哪一个？这里，单元格D4中输入的计算式将被复制到单元格D5、E4和E5使用。"
P445_E2_STEM_EN = "Using two tentative consumption tax rates set in cells D2 and E2, to calculate the tax-inclusive prices of the products in cells A4 and A5, which formula should be entered in cell D4? Note that the formula entered in cell D4 will be copied to cells D5, E4, and E5 for use."


def f3_4_5_p445() -> dict:
    edits = []
    for stage_subdir in ["structured", "translated", "output/pages"]:
        f = RUN / stage_subdir / "page_445.json"
        if not f.exists():
            continue
        d = load_json(f)
        ents = d.get("entities", []) if isinstance(d, dict) else d
        local = 0
        # F3: entity[0] answer_index 0 → 2
        for idx, e in enumerate(ents):
            if not isinstance(e, dict) or "choices" not in e:
                continue
            if idx == 0 and e.get("answer_index") == 0:
                e["answer_index"] = 2
                local += 1
            # F4: entity[1] choices values 4/5/6 → 3/4/5
            if idx == 1:
                fix_map = {"4": "3", "5": "4", "6": "5"}
                for ci, c in enumerate(e.get("choices", [])):
                    if ci == 0:
                        continue  # ア:2 unchanged
                    for lang in ("jp", "zh", "en"):
                        if lang not in c:
                            continue
                        val = c[lang]
                        # Pattern: "X. <old>" or "X．<old>" → "X. <new>"
                        for old, new in fix_map.items():
                            # Match end-of-string digit
                            m = re.match(r"^([A-Dア-エ][．\.]\s*)(\d+)$", val.strip())
                            if m and m.group(2) == old:
                                c[lang] = f"{m.group(1)}{new}"
                                local += 1
                                break
            # F5: entity[2] stem restore
            if idx == 2 and isinstance(e.get("stem"), dict):
                stem = e["stem"]
                cur_jp = stem.get("jp", "")
                if "人金" in cur_jp or "E2による式計算式" in cur_jp:
                    stem["jp"] = P445_E2_STEM_JP
                    stem["zh"] = P445_E2_STEM_ZH
                    stem["en"] = P445_E2_STEM_EN
                    local += 3
        if local:
            save_json(f, d)
            edits.append({"file": str(f.relative_to(RUN)), "edits": local})
    return {"description": "p445 entity[0/1/2] surgical fixes", "edits": edits}


# -------- F6-F11: p566 multiple --------
P566_FIXES = {
    8: {
        "surface": {"jp": "完全性", "zh": "完整性", "en": "Integrity"},
    },
    22: {
        "surface": {"jp": "ペネトレーションテスト", "zh": "渗透测试", "en": "Penetration Test"},
        "definition": {
            "jp": "システムに対して、実際にシステムを攻撃することで、セキュリティ上の弱点を発見するテスト手法",
            "zh": "对系统实际进行攻击，从而发现安全性弱点的测试方法",
            "en": "A testing method that actually attacks a system to discover security weaknesses",
        },
    },
    23: {
        "surface": {"jp": "ワンタイムパスワード", "zh": "一次性密码", "en": "One-Time Password"},
        "definition": {
            "jp": "一度しか使えない使い捨てのパスワードを使うことで、不正アクセスを防止する仕組みである",
            "zh": "通过使用只能使用一次的一次性密码，防止非法访问的机制",
            "en": "A mechanism that prevents unauthorized access by using single-use disposable passwords",
        },
    },
    5: {
        "definition": {
            "jp": "会社の活動に伴って発生するあらゆるリスクを管理し、そのリスクによる損失を最小の費用で食い止めるためのプロセス",
            "zh": "管理伴随公司活动发生的所有风险，并以最小成本遏制由该风险造成的损失的过程",
            "en": "A process to manage all risks arising from corporate activities and contain losses caused by those risks at minimum cost",
        },
    },
    12: {
        "definition": {
            "jp": "なりすましやデータの改ざんを検知できる仕組み。秘密鍵で暗号化し、公開鍵で復号する",
            "zh": "可检测身份伪造和数据篡改的机制。使用私钥加密，公钥解密",
            "en": "A mechanism to detect impersonation and data tampering; encrypts with the private key and decrypts with the public key",
        },
    },
    29: {
        "definition": {
            "jp": "指紋、虹彩、顔、筆跡、キーストロークといった、身体的特徴や行動的特徴による認証方式",
            "zh": "基于指纹、虹膜、面部、笔迹、击键等身体特征或行为特征的认证方式",
            "en": "An authentication method based on physical or behavioral characteristics such as fingerprint, iris, face, handwriting, or keystroke",
        },
    },
}


def f6_11_p566() -> dict:
    edits = []
    for stage_subdir in ["structured", "translated", "output/pages"]:
        f = RUN / stage_subdir / "page_566.json"
        if not f.exists():
            continue
        d = load_json(f)
        ents = d.get("entities", []) if isinstance(d, dict) else d
        local = 0
        for idx, fix in P566_FIXES.items():
            if idx >= len(ents):
                continue
            e = ents[idx]
            if not isinstance(e, dict):
                continue
            for section, langs in fix.items():
                if section not in e or not isinstance(e[section], dict):
                    e[section] = {}
                for lang, val in langs.items():
                    if e[section].get(lang) != val:
                        e[section][lang] = val
                        local += 1
        if local:
            save_json(f, d)
            edits.append({"file": str(f.relative_to(RUN)), "edits": local})
    return {"description": "p566 entity[5/8/12/22/23/29] surgical fixes", "edits": edits}


# -------- F12: p561 ハウジング zh disambiguate --------
def f12_p561_housing() -> dict:
    edits = []
    for stage_subdir in ["structured", "translated", "output/pages"]:
        f = RUN / stage_subdir / "page_561.json"
        if not f.exists():
            continue
        d = load_json(f)
        ents = d.get("entities", []) if isinstance(d, dict) else d
        local = 0
        for e in ents:
            if not isinstance(e, dict):
                continue
            surf = e.get("surface", {}) or {}
            if surf.get("jp") == "ハウジングサービス":
                if surf.get("zh") == "主机托管服务":
                    surf["zh"] = "服务器代管服务"
                    local += 1
                if surf.get("en") in ("Housing Service", "Hosting Service"):
                    surf["en"] = "Server Housing Service"
                    local += 1
                defn = e.get("definition", {}) or {}
                if "zh" in defn and "其他公司场地内" in defn["zh"]:
                    pass  # def is okay
                if "en" in defn:
                    # Make sure def en uses "place own server at another company's premises"
                    if "place" not in defn["en"].lower() and "own server" not in defn["en"].lower():
                        defn["en"] = "A service in which a company places its own server at another company's premises"
                        local += 1
        if local:
            save_json(f, d)
            edits.append({"file": str(f.relative_to(RUN)), "edits": local})
    return {"description": "p561 ハウジング zh/en disambiguation", "edits": edits}


def main() -> None:
    log = {"round": "R11", "date": "2026-05-17", "fixes": {}}
    log["fixes"]["F1_md_broader_dedupe"] = f1_md_broader_dedupe()
    log["fixes"]["F2_p200_hosting"] = f2_p200_hosting()
    log["fixes"]["F3-5_p445_entities"] = f3_4_5_p445()
    log["fixes"]["F6-11_p566_terms"] = f6_11_p566()
    log["fixes"]["F12_p561_housing"] = f12_p561_housing()
    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    print("R11 fixes applied. Summary:")
    for k, v in log["fixes"].items():
        n = v.get("total", sum(e.get("edits", 0) if isinstance(e.get("edits"), int) else 1 for e in v.get("edits", [])))
        print(f"  {k}: {n} edit-units")
    print(f"Log: {LOG.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
