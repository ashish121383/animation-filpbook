from functools import lru_cache

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.repositories.document import DocumentRepository, PageRepository
from app.services.storage_service import StorageService


@lru_cache
def get_storage_service() -> StorageService:
    return StorageService(get_settings())


def get_document_repository(
    session: AsyncSession = Depends(get_db),
) -> DocumentRepository:
    return DocumentRepository(session)


def get_page_repository(
    session: AsyncSession = Depends(get_db),
) -> PageRepository:
    return PageRepository(session)


def get_settings_dep() -> Settings:
    return get_settings()
