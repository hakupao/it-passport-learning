"""Release shipping module (per D-081).

6.11.C deliverable. Three sub-modules:

- :mod:`cert_extractor.release.tag_name` — D-081 §2.1 tag-name helper
  (underscore↔dash cert_id mapping + version normalization). **This
  module is the only place that mapping is performed.**
- :mod:`cert_extractor.release.notes` — D-081 §2.3 release-notes composer
  (planned 6.11.C.2)
- :mod:`cert_extractor.release.publish` — D-081 §2.4 release-publish
  orchestrator (planned 6.11.C.3)
"""
from cert_extractor.release.notes import GitContext, compose_notes
from cert_extractor.release.publish import (
    PublishInputs,
    PublishResult,
    publish,
    sha256_of,
    validate_output_dir,
)
from cert_extractor.release.tag_name import ParsedTag, parse_tag, tag_name

__all__ = [
    "GitContext",
    "ParsedTag",
    "PublishInputs",
    "PublishResult",
    "compose_notes",
    "parse_tag",
    "publish",
    "sha256_of",
    "tag_name",
    "validate_output_dir",
]
