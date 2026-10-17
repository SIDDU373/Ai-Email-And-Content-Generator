from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "nvidia": {
            "configured": settings.has_nvidia_credentials,
            "model": settings.NVIDIA_MODEL,
            "base_url": settings.NVIDIA_BASE_URL,
            "mock_fallback_enabled": settings.ALLOW_MOCK_FALLBACK
        },
        "database": {
            "connected": True,
            "url_type": "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgres"
        }
    }
