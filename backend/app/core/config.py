from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(default="Premium OCR PDF Flipbook", alias="APP_NAME")
    app_env: Literal["development", "staging", "production"] = Field(
        default="development", alias="APP_ENV"
    )
    app_debug: bool = Field(default=False, alias="APP_DEBUG")
    app_secret_key: str = Field(default="change-me-in-production", alias="APP_SECRET_KEY")

    backend_host: str = Field(default="0.0.0.0", alias="BACKEND_HOST")
    backend_port: int = Field(default=8000, alias="BACKEND_PORT")
    backend_workers: int = Field(default=4, alias="BACKEND_WORKERS")
    backend_cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        alias="BACKEND_CORS_ORIGINS",
    )

    database_url: str = Field(
        default="postgresql+asyncpg://flipbook:flipbook_secret@localhost:5432/flipbook_db",
        alias="DATABASE_URL",
    )
    database_url_sync: str = Field(
        default="postgresql://flipbook:flipbook_secret@localhost:5432/flipbook_db",
        alias="DATABASE_URL_SYNC",
    )

    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    celery_broker_url: str = Field(default="redis://localhost:6379/1", alias="CELERY_BROKER_URL")
    celery_result_backend: str = Field(
        default="redis://localhost:6379/2", alias="CELERY_RESULT_BACKEND"
    )

    upload_dir: str = Field(default="./uploads", alias="UPLOAD_DIR")
    max_upload_size_mb: int = Field(default=500, alias="MAX_UPLOAD_SIZE_MB")
    allowed_extensions: str = Field(default="pdf", alias="ALLOWED_EXTENSIONS")
    storage_backend: Literal["local", "s3"] = Field(default="local", alias="STORAGE_BACKEND")

    s3_bucket: str = Field(default="", alias="S3_BUCKET")
    s3_region: str = Field(default="us-east-1", alias="S3_REGION")
    s3_access_key: str = Field(default="", alias="S3_ACCESS_KEY")
    s3_secret_key: str = Field(default="", alias="S3_SECRET_KEY")
    s3_endpoint_url: str | None = Field(default=None, alias="S3_ENDPOINT_URL")

    ocr_default_engine: str = Field(default="paddleocr", alias="OCR_DEFAULT_ENGINE")
    ocr_languages: str = Field(default="en", alias="OCR_LANGUAGES")
    ocr_confidence_threshold: float = Field(default=0.6, alias="OCR_CONFIDENCE_THRESHOLD")

    @property
    def cors_origins(self) -> list[str]:
        if self.app_env == "development":
            return ["*"]
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]

    @property
    def allowed_extensions_list(self) -> list[str]:
        return [ext.strip().lower() for ext in self.allowed_extensions.split(",") if ext.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @field_validator("app_secret_key")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        if value == "change-me-in-production" and cls.model_config.get("env_file"):
            return value
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
