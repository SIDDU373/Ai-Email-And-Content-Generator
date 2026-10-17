import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Robust multi-location dotenv loading (backend and project root)
_current_file = Path(__file__).resolve()
_backend_dir = _current_file.parent.parent
_root_dir = _backend_dir.parent

for _env_path in [
    _backend_dir / ".env.local",
    _backend_dir / ".env",
    _root_dir / ".env.local",
    _root_dir / ".env",
]:
    if _env_path.exists():
        load_dotenv(_env_path)

class Settings:
    # Application
    APP_NAME: str = os.getenv("APP_NAME", "WriteFlow AI")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001")

    # NVIDIA Hosted LLM API
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_BASE_URL: str = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b")
    LLM_TIMEOUT_SECONDS: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "75.0"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "2048"))
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.5"))
    ALLOW_MOCK_FALLBACK: bool = os.getenv("ALLOW_MOCK_FALLBACK", "true").lower() in ("true", "1", "yes")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./writeflow.db")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Limits
    MAX_INPUT_CHARACTERS: int = int(os.getenv("MAX_INPUT_CHARACTERS", "10000"))
    MAX_VARIATIONS: int = int(os.getenv("MAX_VARIATIONS", "3"))

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def has_nvidia_credentials(self) -> bool:
        key = self.NVIDIA_API_KEY.strip()
        return bool(key and not key.startswith("your_") and not key == "nvapi-...")

settings = Settings()
