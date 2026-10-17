from fastapi import APIRouter, HTTPException, Depends
from app.schemas.generate import (
    EmailGenerateRequest,
    EmailGenerateResponse,
    ContentGenerateRequest,
    ContentGenerateResponse,
    EnhancePromptRequest,
    EnhancePromptResponse
)
from app.services.llm_service import llm_service
from app.services.storage import storage_service

router = APIRouter()

@router.post("/email", response_model=EmailGenerateResponse)
async def generate_email_endpoint(req: EmailGenerateRequest):
    """Generate high-quality workplace email with subject line and variations."""
    profile = None
    if req.apply_profile:
        profile = storage_service.get_profile(req.user_id)

    # Optional prompt enhancement extract
    response = await llm_service.generate_email(req, profile=profile)

    # Attach prompt spec if requested
    try:
        enhance_res = await llm_service.enhance_prompt(EnhancePromptRequest(raw_prompt=req.purpose, target_format="email"))
        response.prompt_spec = enhance_res.spec
    except Exception:
        pass

    return response

@router.post("/content", response_model=ContentGenerateResponse)
async def generate_content_endpoint(req: ContentGenerateRequest):
    """Generate multi-format content from a single unified brief."""
    profile = None
    if req.apply_profile:
        profile = storage_service.get_profile(req.user_id)

    return await llm_service.generate_content(req, profile=profile)

@router.post("/enhance-prompt", response_model=EnhancePromptResponse)
async def enhance_prompt_endpoint(req: EnhancePromptRequest):
    """Deconstruct rough user prompt into structured specification without extra model calls during generation."""
    return await llm_service.enhance_prompt(req)
