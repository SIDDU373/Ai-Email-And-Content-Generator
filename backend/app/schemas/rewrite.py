from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.generate import ToneType

class RewriteActionType(str, Enum):
    IMPROVE_CLARITY = "improve_clarity"
    FIX_GRAMMAR = "fix_grammar"
    SHORTEN = "shorten"
    EXPAND = "expand"
    SIMPLIFY = "simplify"
    MAKE_PROFESSIONAL = "make_professional"
    MAKE_FRIENDLY = "make_friendly"
    MAKE_PERSUASIVE = "make_persuasive"
    CHANGE_TONE = "change_tone"

class RewriteRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=10000, description="Original text to rewrite")
    action: RewriteActionType = Field(default=RewriteActionType.IMPROVE_CLARITY)
    target_tone: Optional[ToneType] = Field(default=None, description="Only used when action is change_tone")
    custom_instruction: Optional[str] = Field(default=None, max_length=500)
    user_id: str = Field(default="default_user")

class RewriteResponse(BaseModel):
    original_text: str
    revised_text: str
    action: RewriteActionType
    target_tone: Optional[ToneType] = None
    summary_of_changes: str
    model_used: str
    is_mock: bool = False
