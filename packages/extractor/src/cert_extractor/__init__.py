"""cert-extractor — pluggable OCR + LLM-driven extraction pipeline for certification exam content.

Per design decisions D-001 ~ D-073 (see docs/decisions/ + docs/discussion/).

Phase 1 = itpassport_r6 (令和6年度 ITパスポート).
Phase 5 = generic framework with third-party cert plugins.
"""

__version__ = "0.1.0"

# Schema version — separate from library version (per D-058).
# Bumped per SemVer rules in D-058 ADR.
SCHEMA_VERSION = "1.0.0"

# Sentinel for untranslated trilingual fields (per D-055).
UNTRANSLATED = "<UNTRANSLATED>"

__all__ = ["__version__", "SCHEMA_VERSION", "UNTRANSLATED"]
