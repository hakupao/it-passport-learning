"""Tag-name helper for D-081 §2.1.

6.11.C.1 deliverable. Centralizes the underscore↔dash mapping between
the canonical Python ``cert_id`` (e.g. ``itpassport_r6``) and the
shell-friendly git/GitHub tag form (e.g. ``itpassport-r6-v1.0.0``).
Per D-081 §2.1: **this module is the only place the mapping is
performed**, and reverse lookup is supported for round-trip safety.
"""
from __future__ import annotations

import re
from typing import NamedTuple

# cert_id canonical form: lowercase ASCII, starts with letter, underscores
# allowed (digits + letters after first char).
_CERT_ID_RE = re.compile(r"^[a-z][a-z0-9_]*$")

# Version format: SemVer "MAJOR.MINOR.PATCH" with an optional ``v`` prefix
# on input. Output is always ``v``-prefixed (per D-081 §2.1).
_VERSION_RE = re.compile(r"^v?(\d+)\.(\d+)\.(\d+)$")

# Tag form regex used by :func:`parse_tag`. The cert_id portion holds
# dashes (D-081 §2.1 tag-readability convention); we restore underscores
# when reversing.
_TAG_RE = re.compile(r"^([a-z][a-z0-9-]*)-(v\d+\.\d+\.\d+)$")


class ParsedTag(NamedTuple):
    """Result of :func:`parse_tag`. ``cert_id`` is restored to underscore form."""

    cert_id: str
    version: str


def _validate_cert_id(cert_id: str) -> str:
    s = (cert_id or "").strip()
    if not _CERT_ID_RE.fullmatch(s):
        raise ValueError(
            f"invalid cert_id {cert_id!r}; expected [a-z][a-z0-9_]* "
            "(e.g. 'itpassport_r6')"
        )
    return s


def _normalize_version(version: str) -> str:
    s = (version or "").strip()
    m = _VERSION_RE.fullmatch(s)
    if not m:
        raise ValueError(
            f"invalid version {version!r}; expected vMAJOR.MINOR.PATCH "
            "(e.g. 'v1.0.0' or '1.0.0')"
        )
    major, minor, patch = m.groups()
    return f"v{major}.{minor}.{patch}"


def tag_name(cert_id: str, version: str) -> str:
    """Format the canonical GitHub Release tag (per D-081 §2.1).

    Underscores in ``cert_id`` are mapped to dashes for tag readability
    and shell-safety. ``version`` accepts ``MAJOR.MINOR.PATCH`` or
    ``vMAJOR.MINOR.PATCH``; output is always ``v``-prefixed.

    Examples
    --------
    >>> tag_name("itpassport_r6", "v1.0.0")
    'itpassport-r6-v1.0.0'
    >>> tag_name("itpassport_r6", "1.0.0")
    'itpassport-r6-v1.0.0'
    """
    cid = _validate_cert_id(cert_id)
    ver = _normalize_version(version)
    return f"{cid.replace('_', '-')}-{ver}"


def parse_tag(tag: str) -> ParsedTag:
    """Reverse a tag back to (cert_id, version) — round-trip with :func:`tag_name`.

    Dashes in the cert_id portion of the tag are mapped back to
    underscores. Raises ``ValueError`` for malformed input.

    Examples
    --------
    >>> parse_tag("itpassport-r6-v1.0.0")
    ParsedTag(cert_id='itpassport_r6', version='v1.0.0')
    """
    s = (tag or "").strip()
    m = _TAG_RE.fullmatch(s)
    if not m:
        raise ValueError(
            f"invalid release tag {tag!r}; expected "
            "'<cert-id>-vMAJOR.MINOR.PATCH' (e.g. 'itpassport-r6-v1.0.0')"
        )
    cert_dashes, ver = m.groups()
    return ParsedTag(cert_id=cert_dashes.replace("-", "_"), version=ver)
