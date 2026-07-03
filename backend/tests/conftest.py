import asyncio
import uuid
from collections.abc import AsyncGenerator, Generator
from pathlib import Path

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app

TEST_UPLOAD_DIR = "/tmp/flipbook_test_uploads"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def test_db_path(tmp_path_factory) -> Path:
    return tmp_path_factory.mktemp("db") / "test.db"


@pytest_asyncio.fixture
async def test_engine(test_db_path: Path, monkeypatch):
    db_url = f"sqlite+aiosqlite:///{test_db_path}"
    sync_url = f"sqlite:///{test_db_path}"

    monkeypatch.setenv("DATABASE_URL", db_url)
    monkeypatch.setenv("DATABASE_URL_SYNC", sync_url)

    from app.core.config import get_settings

    get_settings.cache_clear()

    engine = create_async_engine(
        db_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def test_upload_dir(tmp_path: Path) -> Path:
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    return upload_dir


@pytest_asyncio.fixture
async def client(test_engine, test_upload_dir, test_db_path, monkeypatch) -> AsyncGenerator[AsyncClient, None]:
    sync_url = f"sqlite:///{test_db_path}"
    monkeypatch.setenv("UPLOAD_DIR", str(test_upload_dir))
    monkeypatch.setenv("DATABASE_URL_SYNC", sync_url)

    from app.core.config import get_settings

    get_settings.cache_clear()

    session_factory = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    from app.api.deps import get_storage_service

    get_storage_service.cache_clear()

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    get_settings.cache_clear()
    get_storage_service.cache_clear()


def make_pdf_bytes(page_count: int = 3) -> bytes:
    import fitz

    doc = fitz.open()
    for i in range(page_count):
        page = doc.new_page(width=595, height=842)
        page.insert_text((72, 72), f"Test Page {i + 1}")
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes
