import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_root_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "nvidia" in data
    assert "model" in data["nvidia"]
    assert "configured" in data["nvidia"]

def test_api_v1_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_cors_origins():
    origins = settings.cors_origin_list
    assert len(origins) >= 1
    assert "http://localhost:3000" in origins
