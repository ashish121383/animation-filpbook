from datetime import UTC, datetime
from typing import Any

import redis.asyncio as aioredis
from fastapi import APIRouter, Request
from sqlalchemy import text

from app import __version__
from app.core.config import get_settings
from app.core.database import engine
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])
settings = get_settings()


async def _check_database() -> dict[str, Any]:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "healthy", "message": "Connected"}
    except Exception as exc:
        return {"status": "unhealthy", "message": str(exc)}


async def _check_redis() -> dict[str, Any]:
    try:
        client = aioredis.from_url(settings.redis_url, decode_responses=True)
        await client.ping()
        await client.aclose()
        return {"status": "healthy", "message": "Connected"}
    except Exception as exc:
        return {"status": "unhealthy", "message": str(exc)}


@router.get("/health", response_model=HealthResponse)
async def health_check(request: Request) -> HealthResponse:
    """Return application health status including dependent services."""
    db_status = await _check_database()
    redis_status = await _check_redis()

    services = {
        "database": db_status,
        "redis": redis_status,
    }

    overall_status = (
        "healthy"
        if all(s["status"] == "healthy" for s in services.values())
        else "degraded"
    )

    return HealthResponse(
        status=overall_status,
        version=__version__,
        environment=settings.app_env,
        timestamp=datetime.now(UTC),
        services=services,
    )


@router.get("/health/live")
async def liveness_probe() -> dict[str, str]:
    """Kubernetes liveness probe endpoint."""
    return {"status": "alive"}


@router.get("/health/ready")
async def readiness_probe() -> dict[str, Any]:
    """Kubernetes readiness probe endpoint."""
    db_status = await _check_database()
    redis_status = await _check_redis()

    is_ready = db_status["status"] == "healthy" and redis_status["status"] == "healthy"

    return {
        "status": "ready" if is_ready else "not_ready",
        "services": {
            "database": db_status,
            "redis": redis_status,
        },
    }
