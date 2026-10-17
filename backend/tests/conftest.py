import os
import pytest
from unittest.mock import patch
from app.models.db import Base, engine
from app.config import settings

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

@pytest.fixture(autouse=True)
def mock_nvidia_for_unit_tests(monkeypatch):
    """Ensure deterministic, fast unit test execution without external network dependence."""
    monkeypatch.setattr(settings, "NVIDIA_API_KEY", "")
