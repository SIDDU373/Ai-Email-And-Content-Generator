import json
from typing import List, Optional
from datetime import datetime, timezone
from app.models.db import SessionLocal, DraftModel, WritingProfileModel, init_db
from app.schemas.draft import DraftCreate, DraftUpdate, DraftResponse
from app.schemas.profile import WritingProfileSchema, ProfileUpdate

# Initialize database tables
init_db()

class StorageService:
    @staticmethod
    def get_profile(user_id: str = "default_user") -> WritingProfileSchema:
        with SessionLocal() as db:
            profile_model = db.query(WritingProfileModel).filter_by(user_id=user_id).first()
            if not profile_model:
                # Create default profile
                profile_model = WritingProfileModel(user_id=user_id)
                db.add(profile_model)
                db.commit()
                db.refresh(profile_model)

            return WritingProfileSchema(
                user_id=profile_model.user_id,
                is_enabled=profile_model.is_enabled,
                default_tone=profile_model.default_tone,
                formality_level=profile_model.formality_level,
                preferred_length=profile_model.preferred_length,
                vocabulary_preferences=profile_model.vocabulary_preferences or "",
                formatting_preferences=profile_model.formatting_preferences or "",
                words_to_avoid=json.loads(profile_model.words_to_avoid_json or "[]"),
                style_examples=json.loads(profile_model.style_examples_json or "[]")
            )

    @staticmethod
    def update_profile(user_id: str, updates: ProfileUpdate) -> WritingProfileSchema:
        with SessionLocal() as db:
            profile_model = db.query(WritingProfileModel).filter_by(user_id=user_id).first()
            if not profile_model:
                profile_model = WritingProfileModel(user_id=user_id)
                db.add(profile_model)

            if updates.is_enabled is not None:
                profile_model.is_enabled = updates.is_enabled
            if updates.default_tone is not None:
                profile_model.default_tone = updates.default_tone
            if updates.formality_level is not None:
                profile_model.formality_level = updates.formality_level
            if updates.preferred_length is not None:
                profile_model.preferred_length = updates.preferred_length
            if updates.vocabulary_preferences is not None:
                profile_model.vocabulary_preferences = updates.vocabulary_preferences
            if updates.formatting_preferences is not None:
                profile_model.formatting_preferences = updates.formatting_preferences
            if updates.words_to_avoid is not None:
                profile_model.words_to_avoid_json = json.dumps(updates.words_to_avoid)
            if updates.style_examples is not None:
                profile_model.style_examples_json = json.dumps(updates.style_examples)

            db.commit()
            db.refresh(profile_model)

            return WritingProfileSchema(
                user_id=profile_model.user_id,
                is_enabled=profile_model.is_enabled,
                default_tone=profile_model.default_tone,
                formality_level=profile_model.formality_level,
                preferred_length=profile_model.preferred_length,
                vocabulary_preferences=profile_model.vocabulary_preferences or "",
                formatting_preferences=profile_model.formatting_preferences or "",
                words_to_avoid=json.loads(profile_model.words_to_avoid_json or "[]"),
                style_examples=json.loads(profile_model.style_examples_json or "[]")
            )

    @staticmethod
    def list_drafts(user_id: str = "default_user", limit: int = 50) -> List[DraftResponse]:
        with SessionLocal() as db:
            rows = db.query(DraftModel).filter_by(user_id=user_id).order_by(DraftModel.updated_at.desc()).limit(limit).all()
            return [
                DraftResponse(
                    id=r.id,
                    user_id=r.user_id,
                    title=r.title,
                    task_type=r.task_type,
                    format=r.format,
                    subject=r.subject,
                    content=r.content,
                    metadata=json.loads(r.metadata_json or "{}"),
                    created_at=r.created_at.isoformat() if r.created_at else "",
                    updated_at=r.updated_at.isoformat() if r.updated_at else ""
                )
                for r in rows
            ]

    @staticmethod
    def create_draft(req: DraftCreate) -> DraftResponse:
        with SessionLocal() as db:
            draft = DraftModel(
                user_id=req.user_id,
                title=req.title,
                task_type=req.task_type,
                format=req.format,
                subject=req.subject,
                content=req.content,
                metadata_json=json.dumps(req.metadata or {})
            )
            db.add(draft)
            db.commit()
            db.refresh(draft)

            return DraftResponse(
                id=draft.id,
                user_id=draft.user_id,
                title=draft.title,
                task_type=draft.task_type,
                format=draft.format,
                subject=draft.subject,
                content=draft.content,
                metadata=json.loads(draft.metadata_json or "{}"),
                created_at=draft.created_at.isoformat(),
                updated_at=draft.updated_at.isoformat()
            )

    @staticmethod
    def get_draft(draft_id: str, user_id: str = "default_user") -> Optional[DraftResponse]:
        with SessionLocal() as db:
            r = db.query(DraftModel).filter_by(id=draft_id, user_id=user_id).first()
            if not r:
                return None
            return DraftResponse(
                id=r.id,
                user_id=r.user_id,
                title=r.title,
                task_type=r.task_type,
                format=r.format,
                subject=r.subject,
                content=r.content,
                metadata=json.loads(r.metadata_json or "{}"),
                created_at=r.created_at.isoformat() if r.created_at else "",
                updated_at=r.updated_at.isoformat() if r.updated_at else ""
            )

    @staticmethod
    def update_draft(draft_id: str, updates: DraftUpdate, user_id: str = "default_user") -> Optional[DraftResponse]:
        with SessionLocal() as db:
            r = db.query(DraftModel).filter_by(id=draft_id, user_id=user_id).first()
            if not r:
                return None
            if updates.title is not None:
                r.title = updates.title
            if updates.subject is not None:
                r.subject = updates.subject
            if updates.content is not None:
                r.content = updates.content
            if updates.metadata is not None:
                r.metadata_json = json.dumps(updates.metadata)
            r.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(r)

            return DraftResponse(
                id=r.id,
                user_id=r.user_id,
                title=r.title,
                task_type=r.task_type,
                format=r.format,
                subject=r.subject,
                content=r.content,
                metadata=json.loads(r.metadata_json or "{}"),
                created_at=r.created_at.isoformat() if r.created_at else "",
                updated_at=r.updated_at.isoformat() if r.updated_at else ""
            )

    @staticmethod
    def delete_draft(draft_id: str, user_id: str = "default_user") -> bool:
        with SessionLocal() as db:
            r = db.query(DraftModel).filter_by(id=draft_id, user_id=user_id).first()
            if not r:
                return False
            db.delete(r)
            db.commit()
            return True

storage_service = StorageService()
