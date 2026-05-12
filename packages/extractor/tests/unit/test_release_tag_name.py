"""Tests for release.tag_name (per D-081 §2.1, 6.11.C.1 TDD).

Covers forward mapping, reverse parsing, round-trip stability, and
invalid-input rejection.
"""
from __future__ import annotations

import pytest
from cert_extractor.release import ParsedTag, parse_tag, tag_name


def test_tag_name_forward_underscore_to_dash_with_version_normalization() -> None:
    # Canonical first Release example from D-081 §2.1.
    assert tag_name("itpassport_r6", "v1.0.0") == "itpassport-r6-v1.0.0"
    # Version without ``v`` prefix normalizes the same way.
    assert tag_name("itpassport_r6", "1.0.0") == "itpassport-r6-v1.0.0"
    # Whitespace tolerated on both args.
    assert tag_name(" itpassport_r6 ", " 1.0.0 ") == "itpassport-r6-v1.0.0"
    # cert_id without underscores passes through unchanged.
    assert tag_name("amazonccp", "v2.3.4") == "amazonccp-v2.3.4"
    # Multiple underscores all become dashes.
    assert tag_name("aws_ccp_v2", "v1.0.0") == "aws-ccp-v2-v1.0.0"


def test_parse_tag_reverse_restores_underscores_in_cert_id() -> None:
    parsed = parse_tag("itpassport-r6-v1.0.0")
    assert parsed == ParsedTag(cert_id="itpassport_r6", version="v1.0.0")
    # NamedTuple field access works.
    assert parsed.cert_id == "itpassport_r6"
    assert parsed.version == "v1.0.0"
    # Cert with no dashes in original is preserved (no spurious underscores).
    assert parse_tag("amazonccp-v2.3.4").cert_id == "amazonccp"


def test_tag_name_and_parse_tag_round_trip_for_multiple_certs() -> None:
    cases = [
        ("itpassport_r6", "1.0.0"),     # input unnormalized
        ("itpassport_r6", "v1.0.1"),
        ("amazonccp", "v2.3.4"),
        ("aws_ccp_v2", "v0.1.0"),       # multi-underscore cert
    ]
    for cert_id, version in cases:
        tag = tag_name(cert_id, version)
        parsed = parse_tag(tag)
        # cert_id round-trips losslessly (underscores restored).
        assert parsed.cert_id == cert_id.strip()
        # Version round-trips in normalized form (always v-prefixed).
        normalized = version if version.startswith("v") else f"v{version}"
        assert parsed.version == normalized
        # And re-formatting yields the same tag string.
        assert tag_name(parsed.cert_id, parsed.version) == tag


def test_tag_name_and_parse_tag_reject_invalid_inputs() -> None:
    # tag_name: cert_id must be lowercase ASCII starting with a letter.
    for bad_cert in ("ITPassport", "1cert", "", "cert-with-dash", "cert with space"):
        with pytest.raises(ValueError, match="invalid cert_id"):
            tag_name(bad_cert, "v1.0.0")
    # tag_name: version must be MAJOR.MINOR.PATCH (optionally v-prefixed).
    for bad_ver in ("1.0", "v1", "1.0.0-alpha", "version", "", "v1.0.0.0"):
        with pytest.raises(ValueError, match="invalid version"):
            tag_name("itpassport_r6", bad_ver)
    # parse_tag: malformed tag rejected.
    for bad_tag in ("", "itpassport-r6", "itpassport-r6-1.0.0", "v1.0.0", "ITP-v1.0.0"):
        with pytest.raises(ValueError, match="invalid release tag"):
            parse_tag(bad_tag)
