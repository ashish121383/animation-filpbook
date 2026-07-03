import uuid
from pathlib import PurePosixPath

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from app.api.deps import (
    get_document_repository,
    get_page_repository,
    get_settings_dep,
    get_storage_service,
)
from app.core.config import Settings
from app.core.logging import get_logger
from app.repositories.document import DocumentRepository, PageRepository
from app.schemas.document import (
    DeleteResponse,
    DocumentListResponse,
    DocumentResponse,
    PageListResponse,
    PageResponse,
    UploadResponse,
)
from app.services.storage_service import StorageService
from app.tasks import process_document

router = APIRouter(tags=["documents"])
logger = get_logger(__name__)


def _dispatch_document_processing(document_id: str) -> str | None:
    """Dispatch Celery task or fall back to synchronous processing."""
    try:
        from app.celery_app import celery_app

        celery_app.broker_connection().ensure_connection(max_retries=1)
        task = process_document.delay(document_id)
        return task.id
    except Exception as exc:
        logger.warning("celery_unavailable_fallback_sync", error=str(exc))
        from app.tasks.document_tasks import process_document_task

        process_document_task(document_id)
        return None


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    storage: StorageService = Depends(get_storage_service),
    doc_repo: DocumentRepository = Depends(get_document_repository),
    settings: Settings = Depends(get_settings_dep),
) -> UploadResponse:
    """Upload a PDF file for OCR processing."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        storage.validate_file(file.filename, len(data), file.content_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    relative_path, stored_filename = storage.generate_storage_path(file.filename)
    await storage.backend.save(relative_path, data)

    document = await doc_repo.create(
        filename=stored_filename,
        original_filename=file.filename,
        file_path=relative_path,
        file_size=len(data),
        mime_type=file.content_type or "application/pdf",
        storage_backend=settings.storage_backend,
    )
    await doc_repo.commit()

    task_id: str | None = _dispatch_document_processing(str(document.id))
    if task_id:
        await doc_repo.update_status(document.id, document.status, task_id=task_id)
        await doc_repo.commit()

    logger.info(
        "document_uploaded",
        document_id=str(document.id),
        filename=file.filename,
        size=len(data),
    )

    refreshed = await doc_repo.get_by_id(document.id)
    return UploadResponse(
        document=DocumentResponse.model_validate(refreshed),
        message="Upload successful. Processing started.",
    )


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    doc_repo: DocumentRepository = Depends(get_document_repository),
) -> DocumentListResponse:
    """List all uploaded documents with pagination."""
    documents, total = await doc_repo.list_documents(page=page, per_page=per_page)
    return DocumentListResponse(
        data=[DocumentResponse.model_validate(d) for d in documents],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    doc_repo: DocumentRepository = Depends(get_document_repository),
) -> DocumentResponse:
    """Get a single document by ID."""
    document = await doc_repo.get_by_id(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse.model_validate(document)


@router.delete("/documents/{document_id}", response_model=DeleteResponse)
async def delete_document(
    document_id: uuid.UUID,
    doc_repo: DocumentRepository = Depends(get_document_repository),
    storage: StorageService = Depends(get_storage_service),
) -> DeleteResponse:
    """Delete a document and its stored file."""
    document = await doc_repo.get_by_id(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        await storage.delete_file(document.file_path)
        parent_dir = str(PurePosixPath(document.file_path).parent)
        if await storage.backend.exists(parent_dir):
            pass
    except Exception as exc:
        logger.warning("file_delete_failed", document_id=str(document_id), error=str(exc))

    await doc_repo.delete(document_id)
    return DeleteResponse(id=document_id)


@router.get("/pages", response_model=PageListResponse)
async def list_pages(
    document_id: uuid.UUID = Query(..., description="Document ID to list pages for"),
    doc_repo: DocumentRepository = Depends(get_document_repository),
    page_repo: PageRepository = Depends(get_page_repository),
) -> PageListResponse:
    """List all pages for a given document."""
    document = await doc_repo.get_by_id(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    pages = await page_repo.list_by_document(document_id)
    return PageListResponse(
        data=[PageResponse.model_validate(p) for p in pages],
        total=len(pages),
        document_id=document_id,
    )


@router.get("/page/{page_id}", response_model=PageResponse)
async def get_page(
    page_id: uuid.UUID,
    page_repo: PageRepository = Depends(get_page_repository),
) -> PageResponse:
    """Get a single page by ID."""
    page = await page_repo.get_by_id(page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return PageResponse.model_validate(page)
