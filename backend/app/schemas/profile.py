from typing import List, Optional
from pydantic import BaseModel, Field

class WritingProfileSchema(BaseModel):
    user_id: str = Field(default="default_user")
    is_enabled: bool = Field(default=True)
    default_tone: str = Field(default="professional")
    formality_level: int = Field(default=3, ge=1, le=5, description="1 is casual, 5 is formal")
    preferred_length: str = Field(default="balanced")
    vocabulary_preferences: str = Field(default="", max_length=500)
    formatting_preferences: str = Field(default="", max_length=500)
    words_to_avoid: List[str] = Field(default_factory=list)
    style_examples: List[str] = Field(default_factory=list)

class ProfileUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    default_tone: Optional[str] = None
    formality_level: Optional[int] = Field(default=None, ge=1, le=5)
    preferred_length: Optional[str] = None
    vocabulary_preferences: Optional[str] = None
    formatting_preferences: Optional[str] = None
    words_to_avoid: Optional[List[str]] = None
    style_examples: Optional[List[str]] = None
