import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.document import Document, DocumentStatus, Page, PageStatus


class DocumentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def commit(self) -> None:
        await self.session.commit()

    async def create(
        self,
        filename: str,
        original_filename: str,
        file_path: str,
        file_size: int,
        mime_type: str,
        storage_backend: str,
    ) -> Document:
        document = Document(
            filename=filename,
            original_filename=original_filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            storage_backend=storage_backend,
            status=DocumentStatus.PENDING,
        )
        self.session.add(document)
        await self.session.flush()
        await self.session.refresh(document)
        return document

    async def get_by_id(self, document_id: uuid.UUID) -> Document | None:
        result = await self.session.execute(
            select(Document)
            .where(Document.id == document_id)
            .options(selectinload(Document.pages))
        )
        return result.scalar_one_or_none()

    async def list_documents(
        self, page: int = 1, per_page: int = 20
    ) -> tuple[list[Document], int]:
        offset = (page - 1) * per_page
        count_result = await self.session.execute(select(func.count()).select_from(Document))
        total = count_result.scalar_one()

        result = await self.session.execute(
            select(Document)
            .order_by(Document.created_at.desc())
            .offset(offset)
            .limit(per_page)
        )
        return list(result.scalars().all()), total

    async def update_status(
        self,
        document_id: uuid.UUID,
        status: DocumentStatus,
        error_message: str | None = None,
        page_count: int | None = None,
        task_id: str | None = None,
    ) -> Document | None:
        document = await self.get_by_id(document_id)
        if not document:
            return None
        document.status = status
        if error_message is not None:
            document.error_message = error_message
        if page_count is not None:
            document.page_count = page_count
        if task_id is not None:
            document.task_id = task_id
        await self.session.flush()
        await self.session.refresh(document)
        return document

    async def delete(self, document_id: uuid.UUID) -> bool:
        document = await self.get_by_id(document_id)
        if not document:
            return False
        await self.session.delete(document)
        await self.session.flush()
        return True


class PageRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_batch(self, pages: list[Page]) -> list[Page]:
        self.session.add_all(pages)
        await self.session.flush()
        for page in pages:
            await self.session.refresh(page)
        return pages

    async def get_by_id(self, page_id: uuid.UUID) -> Page | None:
        result = await self.session.execute(select(Page).where(Page.id == page_id))
        return result.scalar_one_or_none()

    async def list_by_document(self, document_id: uuid.UUID) -> list[Page]:
        result = await self.session.execute(
            select(Page)
            .where(Page.document_id == document_id)
            .order_by(Page.page_number)
        )
        return list(result.scalars().all())

    async def update_status(
        self,
        page_id: uuid.UUID,
        status: PageStatus,
        width: float | None = None,
        height: float | None = None,
        thumbnail_path: str | None = None,
    ) -> Page | None:
        page = await self.get_by_id(page_id)
        if not page:
            return None
        page.status = status
        if width is not None:
            page.width = width
        if height is not None:
            page.height = height
        if thumbnail_path is not None:
            page.thumbnail_path = thumbnail_path
        await self.session.flush()
        await self.session.refresh(page)
        return page
