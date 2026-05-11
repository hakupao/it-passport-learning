"""Stage 7 export emitters (per D-078 §2.2 + §2.3 + §2.4 + §2.5).

All emitters are **pure functions** returning ``str``.  The runner
performs file I/O.  This split keeps emitters trivially testable and
keeps the runner thin.

Five emitters:

- ``emit_page_json``    — JSON for ``pages/page_NNN.json`` (envelope-wrapped)
- ``emit_page_md``      — Markdown for ``pages/page_NNN.md`` (language-stacked)
- ``emit_index_json``   — JSON for top-level ``index.json``
- ``emit_polish_items`` — JSON for sidecar ``polish_items.json``
- ``emit_readme_md``    — Markdown for top-level ``README.md`` release-notes-style

Markdown language markers are ASCII ``[JP]`` / ``[ZH]`` / ``[EN]`` per
D-078 §2.5 (user override 2026-05-11; emoji flags rejected).
"""
from __future__ import annotations

from typing import Any

from cert_extractor.pipeline.stage7_export.schema import (
    ExportEnvelope,
    IndexSummary,
    PolishItemBundle,
)

LANG_MARKERS: dict[str, str] = {"jp": "[JP]", "zh": "[ZH]", "en": "[EN]"}


# ---------------------------------------------------------------------------
# JSON emitters (pydantic model_dump_json with by_alias)
# ---------------------------------------------------------------------------


def emit_page_json(envelope: ExportEnvelope) -> str:
    """Serialize a per-page envelope to JSON.

    Pretty-printed (indent=2) so git diffs stay readable for reviewers.
    """
    return envelope.model_dump_json(indent=2, by_alias=True)


def emit_index_json(index: IndexSummary) -> str:
    """Serialize the top-level index to JSON (by_alias so consumer-facing
    keys ``json`` / ``md`` appear, not internal ``json_path`` / ``md_path``)."""
    return index.model_dump_json(indent=2, by_alias=True)


def emit_polish_items(bundle: PolishItemBundle) -> str:
    """Serialize the polish-items sidecar to JSON."""
    return bundle.model_dump_json(indent=2)


# ---------------------------------------------------------------------------
# Markdown — per-page (language-stacked)
# ---------------------------------------------------------------------------


def _entity_title(entity: dict, lang: str) -> str:
    """Pick the most informative single-line label for an entity in ``lang``.

    Order of preference: ``title`` > ``surface`` > ``caption`` > ``stem``.
    Falls back to the ``id`` if no trilingual label is found.
    """
    for key in ("title", "surface", "caption", "stem"):
        node = entity.get(key)
        if isinstance(node, dict) and isinstance(node.get(lang), str):
            return node[lang]
    return entity.get("id", "(unnamed)")


def _render_term(entity: dict, lang: str) -> str:
    surface = (entity.get("surface") or {}).get(lang, "")
    definition = (entity.get("definition") or {}).get(lang, "")
    parts = [f"### {surface or '(no surface)'}"]
    if definition:
        parts.append("")
        parts.append(definition)
    return "\n".join(parts)


def _render_question(entity: dict, lang: str) -> str:
    stem = (entity.get("stem") or {}).get(lang, "")
    qid = entity.get("id", "")
    parts = [f"### Question {qid}"]
    if stem:
        parts.append("")
        parts.append(stem)
    choices = entity.get("choices") or []
    if choices:
        parts.append("")
        for choice in choices:
            if isinstance(choice, dict):
                text = choice.get(lang, "")
                if text:
                    parts.append(f"- {text}")
    answer_index = entity.get("answer_index")
    if isinstance(answer_index, int) and 0 <= answer_index < len(choices):
        answer_choice = choices[answer_index]
        if isinstance(answer_choice, dict):
            answer_text = answer_choice.get(lang, "")
            if answer_text:
                parts.append("")
                parts.append(f"> **Answer**: {answer_text}")
    return "\n".join(parts)


def _render_table(entity: dict, lang: str) -> str:
    caption = (entity.get("caption") or {}).get(lang, "")
    rows = entity.get("rows") or []
    parts = []
    if caption:
        parts.append(f"### {caption}")
        parts.append("")
    if not rows:
        return "\n".join(parts)
    col_count = max((len(r) for r in rows if isinstance(r, list)), default=0)
    if col_count == 0:
        return "\n".join(parts)
    # Markdown table: header row = first row; separator; then rest.
    header_cells = []
    if isinstance(rows[0], list):
        header_cells = [_cell_text(c, lang) for c in rows[0]]
    if len(header_cells) < col_count:
        header_cells.extend([""] * (col_count - len(header_cells)))
    parts.append("| " + " | ".join(header_cells) + " |")
    parts.append("| " + " | ".join(["---"] * col_count) + " |")
    for row in rows[1:]:
        if not isinstance(row, list):
            continue
        cells = [_cell_text(c, lang) for c in row]
        if len(cells) < col_count:
            cells.extend([""] * (col_count - len(cells)))
        parts.append("| " + " | ".join(cells) + " |")
    return "\n".join(parts)


def _cell_text(cell: Any, lang: str) -> str:
    if isinstance(cell, dict):
        text = cell.get(lang, "")
        if isinstance(text, str):
            # Avoid breaking Markdown table format — replace newlines + pipes.
            return text.replace("\n", " ").replace("|", "\\|")
    return ""


def _render_figure(entity: dict, lang: str) -> str:
    caption = (entity.get("caption") or {}).get(lang, "")
    image_ref = entity.get("image_ref", "")
    parts = []
    if caption:
        parts.append(f"### {caption}")
    if image_ref:
        parts.append(f"![{caption}]({image_ref})")
    return "\n".join(parts)


def _render_chapter_section(entity: dict, lang: str) -> str:
    title = (entity.get("title") or {}).get(lang, "")
    number = entity.get("chapter_number") or entity.get("section_number")
    if number is not None:
        return f"## {number}. {title}"
    return f"## {title}"


_RENDERERS = {
    "term": _render_term,
    "question": _render_question,
    "table": _render_table,
    "figure": _render_figure,
    "chapter": _render_chapter_section,
    "section": _render_chapter_section,
}


def _render_entity(entity: dict, lang: str) -> str:
    t = entity.get("type")
    renderer = _RENDERERS.get(t)
    if renderer is None:
        return ""
    return renderer(entity, lang)


def _render_lang_section(entities: list[dict], lang: str) -> str:
    blocks = []
    for entity in entities:
        if not isinstance(entity, dict):
            continue
        rendered = _render_entity(entity, lang)
        if rendered.strip():
            blocks.append(rendered)
    return "\n\n".join(blocks)


def emit_page_md(envelope: ExportEnvelope, *, page_title: dict | None = None) -> str:
    """Render the per-page Markdown.

    ``page_title`` is an optional trilingual dict (``{"jp", "zh", "en"}``)
    used in the document title heading.  If absent, falls back to deriving
    a title from the first chapter/section/term/question/figure entity.
    """
    entities: list[dict] = list(envelope.entities)
    if page_title is None:
        first_titleable = next((e for e in entities if isinstance(e, dict)), None)
        if first_titleable is not None:
            page_title = {
                "jp": _entity_title(first_titleable, "jp"),
                "zh": _entity_title(first_titleable, "zh"),
                "en": _entity_title(first_titleable, "en"),
            }
        else:
            page_title = {"jp": "", "zh": "", "en": ""}

    head = (
        f"# Page {envelope.page:03d} — "
        f"{page_title['jp']} / {page_title['zh']} / {page_title['en']}"
    )
    meta = (
        f"> cert: {envelope.cert_id} · stage 6 verdict: {envelope.stage6_verdict} · "
        f"{envelope.leaf_count} leaves · {len(entities)} entities"
    )
    parts = [head, "", meta, "", "---"]
    for lang in ("jp", "zh", "en"):
        parts.append("")
        parts.append(f"## {LANG_MARKERS[lang]}")
        body = _render_lang_section(entities, lang)
        if body:
            parts.append("")
            parts.append(body)
        parts.append("")
        parts.append("---")
    parts.append("")
    parts.append(
        "<!-- entity anchors: {entity_id}-jp, {entity_id}-zh, {entity_id}-en -->"
    )
    parts.append("")
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# README.md (top-level release notes)
# ---------------------------------------------------------------------------


def emit_readme_md(index: IndexSummary) -> str:
    """Render a top-level README.md summarizing the export bundle.

    Includes cert_id, run_id, totals, Stage 6 verdict snapshot, and a
    file-tree overview of what's in the bundle.  Markdown body is
    deliberately minimal — release-notes-friendly, not a full docs page.
    """
    s = index.stage6_summary
    t = index.totals
    lines = [
        f"# {index.cert_id} — trilingual learning bundle",
        "",
        f"> Run: `{index.run_id}` · exported {index.exported_at.isoformat()}",
        "",
        "## Contents",
        "",
        f"- {t.pages} page(s), {t.entities} entities, {t.leaves} trilingual leaves",
        f"- Stage 6 verdict: **{s.verdict}** "
        f"(PASS={s.pass_pages} / WARN={s.warn_pages} / FAIL={s.fail_pages})",
        f"- {s.polish_items_count} polish items deferred — see `polish_items.json`",
        "",
        "## Layout",
        "",
        "```",
        "index.json           # top-level index + per-page summary",
        "glossary.json        # cross-page glossary lock (Stage 4.5 output)",
        "polish_items.json    # Stage 6 carry-forward polish items (WARN/INFO)",
        "pages/",
        "  page_NNN.json      # envelope-wrapped trilingual entities",
        "  page_NNN.md        # language-stacked Markdown rendering",
        "```",
        "",
        "## Schema version",
        "",
        f"- `{index.schema_version}` (per D-078)",
        "",
    ]
    return "\n".join(lines)
