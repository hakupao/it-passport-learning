"""Shared pytest fixtures and configuration.

Per D-040 ~ D-043:
- tests sit alongside src/ within the package
- markers: unit / integration / e2e
- _fixtures/ underscore prefix prevents pytest collection
"""
from pathlib import Path

import pytest


@pytest.fixture
def fixtures_dir() -> Path:
    """Root path for test fixtures (see _fixtures/MANIFEST.md)."""
    return Path(__file__).parent / "_fixtures"
