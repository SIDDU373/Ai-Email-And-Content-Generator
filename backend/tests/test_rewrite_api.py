import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rewrite_clarity():
    text = "Hey guys, so basically we kinda need to check if the thing works before tomorrow maybe."
    res = client.post("/api/v1/rewrite", json={
        "text": text,
        "action": "improve_clarity"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["original_text"] == text
    assert len(data["revised_text"]) > 0
    assert "summary_of_changes" in data

def test_rewrite_shorten():
    text = "In light of the fact that we have observed multiple occurrences of unnecessary delays throughout the entirety of this quarter, it is imperative that we proceed with immediate optimization."
    res = client.post("/api/v1/rewrite", json={
        "text": text,
        "action": "shorten"
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["revised_text"]) < len(text)

def test_rewrite_tone_change():
    text = "We cannot do this right now. The timeline is not going to work."
    res = client.post("/api/v1/rewrite", json={
        "text": text,
        "action": "change_tone",
        "target_tone": "empathetic"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["target_tone"] == "empathetic"
    assert len(data["revised_text"]) > 5
