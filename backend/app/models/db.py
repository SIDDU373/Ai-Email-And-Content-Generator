import json
from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlalchemy import create_engine, Column, String, Integer, Boolean, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

Base = declarative_base()

class DraftModel(Base):
    __tablename__ = "drafts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), index=True, default="default_user", nullable=False)
    title = Column(String(255), nullable=False)
    task_type = Column(String(50), nullable=False, default="email")
    format = Column(String(50), nullable=False, default="email")
    subject = Column(String(500), nullable=True)
    content = Column(Text, nullable=False)
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class WritingProfileModel(Base):
    __tablename__ = "writing_profiles"

    user_id = Column(String(64), primary_key=True, default="default_user")
    is_enabled = Column(Boolean, default=True)
    default_tone = Column(String(50), default="professional")
    formality_level = Column(Integer, default=3)
    preferred_length = Column(String(50), default="balanced")
    vocabulary_preferences = Column(Text, default="")
    formatting_preferences = Column(Text, default="")
    words_to_avoid_json = Column(Text, default="[]")
    style_examples_json = Column(Text, default="[]")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
