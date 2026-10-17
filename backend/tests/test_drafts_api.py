import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_drafts_lifecycle():
    # 1. Create a draft
    create_payload = {
        "title": "Quarterly Performance Review Note",
        "task_type": "email",
        "format": "email",
        "subject": "Q3 Performance & Next Steps",
        "content": "Thank you for your dedicated efforts across our key deliverables...",
        "user_id": "test_user_42"
    }
    create_res = client.post("/api/v1/drafts", json=create_payload)
    assert create_res.status_code == 201
    draft = create_res.json()
    draft_id = draft["id"]
    assert draft["title"] == "Quarterly Performance Review Note"
    assert draft["user_id"] == "test_user_42"

    # 2. Get the draft
    get_res = client.get(f"/api/v1/drafts/{draft_id}?user_id=test_user_42")
    assert get_res.status_code == 200
    assert get_res.json()["subject"] == "Q3 Performance & Next Steps"

    # 3. Update the draft
    update_res = client.patch(f"/api/v1/drafts/{draft_id}?user_id=test_user_42", json={
        "title": "Updated Q3 Performance Review",
        "content": "Revised draft body with updated metrics."
    })
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Q3 Performance Review"
    assert "metrics" in update_res.json()["content"]

    # 4. List drafts for test_user_42
    list_res = client.get("/api/v1/drafts?user_id=test_user_42")
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(d["id"] == draft_id for d in items)

    # 5. Isolation: Another user should not get this draft
    iso_res = client.get(f"/api/v1/drafts/{draft_id}?user_id=other_user")
    assert iso_res.status_code == 404

    # 6. Delete draft
    del_res = client.delete(f"/api/v1/drafts/{draft_id}?user_id=test_user_42")
    assert del_res.status_code == 200

    # 7. Verify deletion
    verify_res = client.get(f"/api/v1/drafts/{draft_id}?user_id=test_user_42")
    assert verify_res.status_code == 404
