"""Unit tests for the D-084 v1.0.3 kana_helper backfill script.

Tests target the importable functions in scripts/backfill_term_kana_helper.py
(``build_kana_helper_lookup``, ``backfill_page``, ``backfill_canonical_output``).

Per D-084 §5.3 mitigation: 5 unit tests + 1 integration smoke.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

# scripts/ lives at repo root, not in packages/extractor/src.  Inject it so we
# can import the script as a module (it is structured for both CLI + library
# use; no I/O at import time).
_REPO_ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(_REPO_ROOT / "scripts"))

import backfill_term_kana_helper as bt  # noqa: E402

pytestmark = pytest.mark.unit


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


def _make_kana_helper(surface: str, reading: str, zh_concept: str) -> dict:
    return {
        "surface": surface,
        "reading": reading,
        "zh_concept": zh_concept,
        "auto_backfill": False,
    }


def _glossary(*entries: dict) -> dict:
    return {
        "schema_version": "1.0.0",
        "cert_id": "itpassport_r6",
        "run_id": "test",
        "generated_at": "2026-05-19T00:00:00+09:00",
        "entries": list(entries),
    }


def _term_entity(
    *,
    eid: str = "itpassport_r6::term::p001::0",
    surface_jp: str | None = "3Dプリンター",
    surface_zh: str = "3D打印机",
    surface_en: str = "3D Printer",
    kana_helper: dict | None = None,
) -> dict:
    surface = {}
    if surface_jp is not None:
        surface["jp"] = surface_jp
    surface["zh"] = surface_zh
    surface["en"] = surface_en
    return {
        "id": eid,
        "anchor": {"page": 1, "block_id": "page_001_block_0", "section_path": []},
        "type": "term",
        "surface": surface,
        "definition": {"jp": "", "zh": "", "en": ""},
        "kana_helper": kana_helper,
    }


def _page(*entities: dict, page_num: int = 1) -> dict:
    return {
        "schema_version": "v1",
        "cert_id": "itpassport_r6",
        "run_id": "test",
        "stage": 7,
        "page": page_num,
        "exported_at": "2026-05-19T00:00:00.000000Z",
        "stage6_verdict": "PASS",
        "leaf_count": len(entities),
        "entities": list(entities),
        "polish_items_ref": None,
    }


# ---------------------------------------------------------------------------
# build_kana_helper_lookup
# ---------------------------------------------------------------------------


def test_lookup_excludes_entries_with_null_kana_helper() -> None:
    """Glossary entries where kana_helper is None must NOT appear in the lookup."""
    kh = _make_kana_helper("プリンター", "purintā", "打印机")
    glossary = _glossary(
        {"id": "g_001", "surface": {"jp": "プリンター", "zh": "打印机", "en": "Printer"},
         "kana_helper": kh, "aliases_jp": []},
        {"id": "g_002", "surface": {"jp": "10進数", "zh": "十进制", "en": "Decimal"},
         "kana_helper": None, "aliases_jp": []},
    )
    lookup = bt.build_kana_helper_lookup(glossary)
    assert "プリンター" in lookup
    assert lookup["プリンター"] == kh
    assert "10進数" not in lookup
    assert len(lookup) == 1


def test_lookup_includes_aliases_jp() -> None:
    """Aliases populate the lookup but never overwrite primary surface match."""
    kh_primary = _make_kana_helper("ストラテジ", "sutoratejī", "战略")
    kh_other = _make_kana_helper("プリンター", "purintā", "打印机")
    glossary = _glossary(
        {"id": "g_001",
         "surface": {"jp": "ストラテジ", "zh": "战略", "en": "Strategy"},
         "kana_helper": kh_primary,
         "aliases_jp": ["ストラテジー", "ストラテジ系"]},
        {"id": "g_002",
         "surface": {"jp": "プリンター", "zh": "打印机", "en": "Printer"},
         "kana_helper": kh_other,
         "aliases_jp": []},
    )
    lookup = bt.build_kana_helper_lookup(glossary)
    assert lookup["ストラテジ"] == kh_primary
    assert lookup["ストラテジー"] == kh_primary  # alias picked up kh_primary
    assert lookup["ストラテジ系"] == kh_primary
    assert lookup["プリンター"] == kh_other


# ---------------------------------------------------------------------------
# backfill_page
# ---------------------------------------------------------------------------


def test_backfill_populates_null_when_glossary_has_match() -> None:
    """The happy path: Term.kana_helper=None + glossary match → populated."""
    kh = _make_kana_helper("3Dプリンター", "3D purintā", "3D打印机")
    page = _page(_term_entity(surface_jp="3Dプリンター", kana_helper=None))
    lookup = {"3Dプリンター": kh}
    updated, stats = bt.backfill_page(page, lookup)
    assert stats["term_backfilled"] == 1
    assert stats["term_total"] == 1
    assert updated["entities"][0]["kana_helper"] == kh


def test_backfill_does_not_overwrite_existing_kana_helper() -> None:
    """Idempotency: existing kana_helper must NOT be replaced by glossary copy."""
    glossary_kh = _make_kana_helper("プリンター", "purintā-FROM-GLOSSARY", "打印机")
    existing_kh = _make_kana_helper("プリンター", "purintā-EXISTING", "打印机")
    page = _page(_term_entity(surface_jp="プリンター", kana_helper=existing_kh))
    lookup = {"プリンター": glossary_kh}
    updated, stats = bt.backfill_page(page, lookup)
    assert stats["term_backfilled"] == 0
    assert stats["term_with_existing"] == 1
    assert updated["entities"][0]["kana_helper"] == existing_kh  # NOT overwritten


def test_backfill_skips_terms_without_glossary_match() -> None:
    """Term with no matching glossary entry must remain kana_helper=None."""
    page = _page(_term_entity(surface_jp="未登録カタカナ語", kana_helper=None))
    lookup: dict[str, dict] = {}  # empty glossary
    updated, stats = bt.backfill_page(page, lookup)
    assert stats["term_no_match"] == 1
    assert stats["term_backfilled"] == 0
    assert updated["entities"][0]["kana_helper"] is None


def test_backfill_idempotent_when_rerun_twice() -> None:
    """Running backfill twice on the same input yields identical output."""
    kh = _make_kana_helper("3Dプリンター", "3D purintā", "3D打印机")
    page = _page(_term_entity(surface_jp="3Dプリンター", kana_helper=None))
    lookup = {"3Dプリンター": kh}

    # First pass: should backfill.
    after_one, stats_one = bt.backfill_page(page, lookup)
    assert stats_one["term_backfilled"] == 1

    # Re-serialize/deserialize to simulate file round-trip then second pass.
    page_after_round_trip = json.loads(json.dumps(after_one, ensure_ascii=False))
    after_two, stats_two = bt.backfill_page(page_after_round_trip, lookup)
    assert stats_two["term_backfilled"] == 0  # nothing left to backfill
    assert stats_two["term_with_existing"] == 1
    assert after_two == after_one  # output stable


def test_backfill_ignores_non_term_entities() -> None:
    """Sections/figures/etc must not be touched even if surface.jp matches."""
    kh = _make_kana_helper("3Dプリンター", "3D purintā", "3D打印机")
    section = {
        "id": "itpassport_r6::section::p001::0",
        "anchor": {"page": 1, "block_id": "page_001_block_0", "section_path": []},
        "type": "section",
        "title": {"jp": "3Dプリンター", "zh": "3D打印机", "en": "3D Printer"},
        "section_number": None,
    }
    page = _page(section)
    lookup = {"3Dプリンター": kh}
    updated, stats = bt.backfill_page(page, lookup)
    assert stats["term_total"] == 0  # no term entities counted
    assert stats["term_backfilled"] == 0
    assert "kana_helper" not in updated["entities"][0]  # section untouched


# ---------------------------------------------------------------------------
# backfill_canonical_output — integration smoke
# ---------------------------------------------------------------------------


def test_backfill_canonical_output_end_to_end(tmp_path: Path) -> None:
    """Integration smoke: write a tiny canonical output, run backfill, assert disk state."""
    output = tmp_path / "output"
    pages = output / "pages"
    pages.mkdir(parents=True)

    kh = _make_kana_helper("ITパスポート", "ai-tī pasupōto", "IT护照")
    glossary = _glossary(
        {"id": "g_001",
         "surface": {"jp": "ITパスポート", "zh": "IT护照", "en": "IT Passport"},
         "kana_helper": kh, "aliases_jp": []},
    )
    (output / "glossary.json").write_text(
        json.dumps(glossary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    page = _page(
        _term_entity(surface_jp="ITパスポート", kana_helper=None),
        _term_entity(
            eid="itpassport_r6::term::p001::1",
            surface_jp="未登録",
            kana_helper=None,
        ),
        page_num=1,
    )
    page_path = pages / "page_001.json"
    page_path.write_text(
        json.dumps(page, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    totals = bt.backfill_canonical_output(output, dry_run=False)
    assert totals["glossary_with_kana_helper"] == 1
    assert totals["page_count"] == 1
    assert totals["pages_changed"] == 1
    assert totals["term_total"] == 2
    assert totals["term_backfilled"] == 1
    assert totals["term_no_match"] == 1
    assert totals["dry_run"] is False

    on_disk = json.loads(page_path.read_text(encoding="utf-8"))
    assert on_disk["entities"][0]["kana_helper"] == kh
    assert on_disk["entities"][1]["kana_helper"] is None

    # Re-run: idempotent, no further changes.
    totals_two = bt.backfill_canonical_output(output, dry_run=False)
    assert totals_two["term_backfilled"] == 0
    assert totals_two["pages_changed"] == 0


def test_backfill_canonical_output_dry_run_does_not_write(tmp_path: Path) -> None:
    """--dry-run reports stats but does not modify any page JSON on disk."""
    output = tmp_path / "output"
    pages = output / "pages"
    pages.mkdir(parents=True)

    kh = _make_kana_helper("プリンター", "purintā", "打印机")
    (output / "glossary.json").write_text(
        json.dumps(
            _glossary(
                {"id": "g_001",
                 "surface": {"jp": "プリンター", "zh": "打印机", "en": "Printer"},
                 "kana_helper": kh, "aliases_jp": []},
            ),
            ensure_ascii=False, indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    page = _page(_term_entity(surface_jp="プリンター", kana_helper=None))
    page_path = pages / "page_001.json"
    original_text = json.dumps(page, ensure_ascii=False, indent=2) + "\n"
    page_path.write_text(original_text, encoding="utf-8")

    totals = bt.backfill_canonical_output(output, dry_run=True)
    assert totals["dry_run"] is True
    assert totals["term_backfilled"] == 1  # would backfill 1 if not dry-run
    assert totals["pages_changed"] == 1
    # but file on disk unchanged:
    assert page_path.read_text(encoding="utf-8") == original_text
