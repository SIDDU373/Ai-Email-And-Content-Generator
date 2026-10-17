from typing import List
from fastapi import APIRouter, HTTPException, Query
from app.schemas.draft import DraftCreate, DraftUpdate, DraftResponse
from app.services.storage import storage_service

router = APIRouter()

@router.get("", response_model=List[DraftResponse])
def get_drafts(user_id: str = Query("default_user"), limit: int = Query(50, le=100)):
    """List saved drafts for user."""
    return storage_service.list_drafts(user_id=user_id, limit=limit)

@router.post("", response_model=DraftResponse, status_code=201)
def create_draft(req: DraftCreate):
    """Save a new draft."""
    return storage_service.create_draft(req)

@router.get("/{draft_id}", response_model=DraftResponse)
def get_draft(draft_id: str, user_id: str = Query("default_user")):
    """Retrieve draft by ID."""
    draft = storage_service.get_draft(draft_id=draft_id, user_id=user_id)
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft

@router.patch("/{draft_id}", response_model=DraftResponse)
def update_draft(draft_id: str, updates: DraftUpdate, user_id: str = Query("default_user")):
    """Update draft title, subject, content or metadata."""
    draft = storage_service.update_draft(draft_id=draft_id, updates=updates, user_id=user_id)
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft

@router.delete("/{draft_id}")
def delete_draft(draft_id: str, user_id: str = Query("default_user")):
    """Delete draft by ID."""
    success = storage_service.delete_draft(draft_id=draft_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Draft not found")
    return {"status": "success", "message": "Draft deleted successfully"}
