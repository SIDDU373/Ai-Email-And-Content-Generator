from fastapi import APIRouter, Query
from app.schemas.profile import WritingProfileSchema, ProfileUpdate
from app.services.storage import storage_service

router = APIRouter()

@router.get("", response_model=WritingProfileSchema)
def get_user_profile(user_id: str = Query("default_user")):
    """Get writing profile and personal preferences."""
    return storage_service.get_profile(user_id=user_id)

@router.patch("", response_model=WritingProfileSchema)
def update_user_profile(updates: ProfileUpdate, user_id: str = Query("default_user")):
    """Update writing profile and personal preferences."""
    return storage_service.update_profile(user_id=user_id, updates=updates)
