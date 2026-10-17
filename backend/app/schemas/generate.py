from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ToneType(str, Enum):
    PROFESSIONAL = "professional"
    FRIENDLY = "friendly"
    CONCISE = "concise"
    PERSUASIVE = "persuasive"
    EMPATHETIC = "empathetic"
    CONFIDENT = "confident"
    FORMAL = "formal"
    CONVERSATIONAL = "conversational"

class LengthType(str, Enum):
    SHORT = "short"
    BALANCED = "balanced"
    DETAILED = "detailed"

class EmailPurposeType(str, Enum):
    GENERAL = "general"
    REQUEST = "request"
    FOLLOW_UP = "follow_up"
    MEETING_SCHEDULING = "meeting_scheduling"
    THANK_YOU = "thank_you"
    APOLOGY = "apology"
    INTRODUCTION = "introduction"
    REMINDER = "reminder"
    POLITE_DECLINE = "polite_decline"

class ContentFormatType(str, Enum):
    EMAIL = "email"
    SOCIAL_POST = "social_post"
    BLOG_OUTLINE = "blog_outline"
    ANNOUNCEMENT = "announcement"
    SHORT_MESSAGE = "short_message"

class EmailGenerateRequest(BaseModel):
    purpose: str = Field(..., min_length=2, max_length=2000, description="Core purpose or subject")
    use_case: EmailPurposeType = Field(default=EmailPurposeType.GENERAL)
    recipient: Optional[str] = Field(default=None, max_length=200, description="Recipient name or role")
    recipient_relationship: Optional[str] = Field(default=None, max_length=200, description="Colleague, client, manager, vendor, etc.")
    key_points: Optional[str] = Field(default=None, max_length=4000, description="Key points or rough notes")
    desired_outcome: Optional[str] = Field(default=None, max_length=1000, description="What you want the recipient to do or feel")
    tone: ToneType = Field(default=ToneType.PROFESSIONAL)
    length: LengthType = Field(default=LengthType.BALANCED)
    constraints: Optional[str] = Field(default=None, max_length=1000, description="Special constraints or boundaries")
    apply_profile: bool = Field(default=True)
    num_variations: int = Field(default=1, ge=1, le=3)
    user_id: str = Field(default="default_user")

class EmailVariation(BaseModel):
    variant_id: int
    label: str
    subject: str
    body: str

class EnhancedPromptSpec(BaseModel):
    objective: str
    audience: str
    format: str
    context: str
    tone: str
    length: str
    required_points: List[str]
    restrictions: List[str]

class EmailGenerateResponse(BaseModel):
    subject: str
    body: str
    variations: List[EmailVariation] = []
    model_used: str
    is_mock: bool = False
    prompt_spec: Optional[EnhancedPromptSpec] = None

class ContentGenerateRequest(BaseModel):
    brief: str = Field(..., min_length=5, max_length=5000, description="Core topic, brief or notes")
    formats: List[ContentFormatType] = Field(default=[ContentFormatType.EMAIL], min_length=1)
    target_audience: Optional[str] = Field(default=None, max_length=300)
    tone: ToneType = Field(default=ToneType.PROFESSIONAL)
    length: LengthType = Field(default=LengthType.BALANCED)
    constraints: Optional[str] = Field(default=None, max_length=1000)
    apply_profile: bool = Field(default=True)
    user_id: str = Field(default="default_user")

class ContentItemResponse(BaseModel):
    format: ContentFormatType
    title: Optional[str] = None
    content: str

class ContentGenerateResponse(BaseModel):
    items: List[ContentItemResponse]
    model_used: str
    is_mock: bool = False

class EnhancePromptRequest(BaseModel):
    raw_prompt: str = Field(..., min_length=3, max_length=5000)
    target_format: Optional[str] = "email"

class EnhancePromptResponse(BaseModel):
    enhanced_prompt: str
    spec: EnhancedPromptSpec
    model_used: str
    is_mock: bool = False
