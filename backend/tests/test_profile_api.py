import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_profile_lifecycle():
    user_id = "test_profile_user"

    # 1. Fetch default profile
    res = client.get(f"/api/v1/profile?user_id={user_id}")
    assert res.status_code == 200
    profile = res.json()
    assert profile["user_id"] == user_id
    assert profile["default_tone"] == "professional"

    # 2. Update preferences
    update_payload = {
        "is_enabled": True,
        "default_tone": "concise",
        "formality_level": 4,
        "preferred_length": "short",
        "vocabulary_preferences": "Direct, executive, jargon-free",
        "formatting_preferences": "Use bullet points where appropriate",
        "words_to_avoid": ["synergy", "delve", "circle back"],
        "style_examples": ["Please find the summary below for immediate review."]
    }
    patch_res = client.patch(f"/api/v1/profile?user_id={user_id}", json=update_payload)
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["default_tone"] == "concise"
    assert updated["formality_level"] == 4
    assert "synergy" in updated["words_to_avoid"]
    assert len(updated["style_examples"]) == 1

    # 3. Disable profile
    disable_res = client.patch(f"/api/v1/profile?user_id={user_id}", json={"is_enabled": False})
    assert disable_res.status_code == 200
    assert disable_res.json()["is_enabled"] is False
