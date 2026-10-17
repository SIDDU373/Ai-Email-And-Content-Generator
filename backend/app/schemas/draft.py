from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class DraftCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    task_type: str = Field(default="email", description="email, content, rewrite")
    format: str = Field(default="email")
    subject: Optional[str] = Field(default=None, max_length=300)
    content: str = Field(..., description="Draft body or text")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    user_id: str = Field(default="default_user")

class DraftUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    subject: Optional[str] = Field(default=None, max_length=300)
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DraftResponse(BaseModel):
    id: str
    user_id: str
    title: str
    task_type: str
    format: str
    subject: Optional[str] = None
    content: str
    metadata: Dict[str, Any] = {}
    created_at: str
    updated_at: str
