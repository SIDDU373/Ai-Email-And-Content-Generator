from fastapi import APIRouter
from app.schemas.rewrite import RewriteRequest, RewriteResponse
from app.services.llm_service import llm_service

router = APIRouter()

@router.post("", response_model=RewriteResponse)
async def rewrite_endpoint(req: RewriteRequest):
    """Rewrite, improve, or re-tone text while strictly preserving factual core."""
    return await llm_service.rewrite_text(req)
