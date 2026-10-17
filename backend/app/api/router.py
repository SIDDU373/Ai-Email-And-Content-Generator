from fastapi import APIRouter
from app.api.endpoints import health, generate, rewrite, drafts, profile

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(generate.router, prefix="/generate", tags=["Generation"])
api_router.include_router(rewrite.router, prefix="/rewrite", tags=["Rewrite"])
api_router.include_router(drafts.router, prefix="/drafts", tags=["Drafts"])
api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
