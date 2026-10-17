from fastapi.testclient import TestClient
from app.main import app

def test_full_e2e_flow():
    client = TestClient(app)

    # 1. Health
    r = client.get("/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    data = r.json()
    print("[PASS] Health Check:", data["status"], "| Model:", data["nvidia"]["model"])

    # 2. Generate Email
    email_payload = {
        "purpose": "Follow up on enterprise software contract renewal with CFO",
        "use_case": "follow_up",
        "recipient": "David Vance",
        "recipient_relationship": "Chief Financial Officer",
        "key_points": "Renewal term: 2 years, discounted 15%, requires signature by end of month",
        "desired_outcome": "Confirm signed agreement or address outstanding terms",
        "tone": "professional",
        "length": "balanced",
        "num_variations": 2
    }
    r = client.post("/api/v1/generate/email", json=email_payload)
    assert r.status_code == 200, f"Generate email failed: {r.text}"
    email_data = r.json()
    print("[PASS] Generate Email:")
    print("   Subject:", email_data["subject"])
    print("   Body sample:", email_data["body"][:90].replace('\n', ' '), "...")
    print("   Variations count:", len(email_data["variations"]))

    # 3. Generate Multi-Format Content
    content_payload = {
        "brief": "Announcing our automated SOC2 compliance monitoring pipeline for cloud deployments.",
        "formats": ["email", "social_post", "announcement", "short_message"],
        "tone": "confident",
        "length": "short"
    }
    r = client.post("/api/v1/generate/content", json=content_payload)
    assert r.status_code == 200, f"Generate content failed: {r.text}"
    content_data = r.json()
    print(f"[PASS] Multi-Format Content ({len(content_data['items'])} items generated):")
    for item in content_data["items"]:
        print(f"   - [{item['format']}]: {item['title']}")

    # 4. Precision Rewrite
    rewrite_payload = {
        "text": "Hey so basically we kinda need to make sure you sign this thing soon because we are waiting on it.",
        "action": "make_professional"
    }
    r = client.post("/api/v1/rewrite", json=rewrite_payload)
    assert r.status_code == 200, f"Rewrite failed: {r.text}"
    rewrite_data = r.json()
    print("[PASS] Precision Rewrite:")
    print("   Original:", rewrite_data["original_text"])
    print("   Revised :", rewrite_data["revised_text"])
    print("   Summary :", rewrite_data["summary_of_changes"])

    # 5. Drafts CRUD
    draft_payload = {
        "title": "CFO Renewal Email Draft",
        "task_type": "email",
        "format": "email",
        "subject": email_data["subject"],
        "content": email_data["body"]
    }
    r = client.post("/api/v1/drafts", json=draft_payload)
    assert r.status_code == 201, f"Create draft failed: {r.text}"
    draft = r.json()
    draft_id = draft["id"]
    print(f"[PASS] Draft Created (ID: {draft_id})")

    # Update draft
    r = client.patch(f"/api/v1/drafts/{draft_id}", json={"title": "Updated CFO Renewal Note"})
    assert r.status_code == 200
    print("[PASS] Draft Updated")

    # List drafts
    r = client.get("/api/v1/drafts")
    assert r.status_code == 200
    assert any(d["id"] == draft_id for d in r.json())
    print(f"[PASS] Draft Listed in user inventory ({len(r.json())} total drafts)")

    # Delete draft
    r = client.delete(f"/api/v1/drafts/{draft_id}")
    assert r.status_code == 200
    print("[PASS] Draft Deleted cleanly")

    # 6. Profile
    r = client.get("/api/v1/profile")
    assert r.status_code == 200
    p = r.json()
    print(f"[PASS] Profile Active: default_tone={p['default_tone']}, formality={p['formality_level']}")

    print("\nALL E2E WORKFLOWS FUNCTIONING PERFECTLY!")

if __name__ == "__main__":
    test_full_e2e_flow()
