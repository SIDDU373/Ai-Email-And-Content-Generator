import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_generate_email_basic():
    payload = {
        "purpose": "Follow up on the project proposal submitted last Tuesday",
        "use_case": "follow_up",
        "recipient": "Sarah Connor",
        "recipient_relationship": "Client Executive",
        "key_points": "Checked on feedback, offered to answer questions, propose quick 15-min call",
        "desired_outcome": "Schedule a brief call to finalize scope",
        "tone": "professional",
        "length": "balanced",
        "num_variations": 1
    }
    res = client.post("/api/v1/generate/email", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "subject" in data
    assert "body" in data
    assert len(data["body"]) > 20
    assert "model_used" in data

def test_generate_email_with_variations():
    payload = {
        "purpose": "Decline meeting invitation politely due to scheduling conflict",
        "use_case": "polite_decline",
        "recipient": "Alex Rivera",
        "tone": "friendly",
        "length": "short",
        "num_variations": 2
    }
    res = client.post("/api/v1/generate/email", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["variations"]) == 1
    assert data["variations"][0]["variant_id"] == 2
    assert len(data["variations"][0]["body"]) > 10

def test_generate_content_multi_format():
    payload = {
        "brief": "We are releasing WriteFlow AI v1.0, focusing on executive clarity and precision editing without prompt engineering friction.",
        "formats": ["email", "social_post", "announcement", "short_message"],
        "target_audience": "Product teams and busy professionals",
        "tone": "confident",
        "length": "balanced"
    }
    res = client.post("/api/v1/generate/content", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert len(data["items"]) == 4
    formats = [item["format"] for item in data["items"]]
    assert "email" in formats
    assert "social_post" in formats
    assert "announcement" in formats
    assert "short_message" in formats

def test_enhance_prompt():
    payload = {
        "raw_prompt": "tell the team we need to delay the sprint by 2 days because the database migration needs extra tests",
        "target_format": "email"
    }
    res = client.post("/api/v1/generate/enhance-prompt", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "enhanced_prompt" in data
    assert "spec" in data
    assert data["spec"]["format"] == "email"
