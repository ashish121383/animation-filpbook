import uuid
from pathlib import Path

import fitz
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.document import Document, DocumentStatus, Page, PageStatus

logger = get_logger(__name__)


def _get_sync_session():
    settings = get_settings()
    engine = create_engine(settings.database_url_sync, pool_pre_ping=True)
    return sessionmaker(bind=engine, autocommit=False, autoflush=False)


def _resolve_pdf_path(document: Document) -> str:
    settings = get_settings()
    if document.storage_backend == "local":
        return str(Path(settings.upload_dir) / document.file_path)
    from app.services.storage import create_storage_backend

    backend = create_storage_backend(
        backend_type="s3",
        upload_dir=settings.upload_dir,
        s3_bucket=settings.s3_bucket,
        s3_region=settings.s3_region,
        s3_access_key=settings.s3_access_key,
        s3_secret_key=settings.s3_secret_key,
        s3_endpoint_url=settings.s3_endpoint_url,
    )
    import tempfile

    data = backend._get_client().get_object(  # noqa: SLF001
        Bucket=settings.s3_bucket, Key=document.file_path
    )["Body"].read()
    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    tmp.write(data)
    tmp.close()
    return tmp.name


def process_document_task(document_id: str) -> dict[str, str | int]:
    """Extract page metadata from uploaded PDF using PyMuPDF."""
    doc_uuid = uuid.UUID(document_id)
    logger.info("processing_document", document_id=document_id)

    SyncSessionLocal = _get_sync_session()

    with SyncSessionLocal() as session:
        document = session.get(Document, doc_uuid)
        if not document:
            logger.error("document_not_found", document_id=document_id)
            return {"status": "error", "message": "Document not found"}

        try:
            document.status = DocumentStatus.PROCESSING
            session.commit()

            pdf_path = _resolve_pdf_path(document)
            pdf_doc = fitz.open(pdf_path)
            page_count = pdf_doc.page_count

            pages: list[Page] = []
            for i in range(page_count):
                pdf_page = pdf_doc[i]
                rect = pdf_page.rect
                pages.append(
                    Page(
                        document_id=doc_uuid,
                        page_number=i + 1,
                        width=rect.width,
                        height=rect.height,
                        status=PageStatus.READY,
                    )
                )

            pdf_doc.close()

            session.add_all(pages)
            document.page_count = page_count
            document.status = DocumentStatus.READY
            session.commit()

            logger.info("document_processed", document_id=document_id, page_count=page_count)
            return {"status": "success", "page_count": page_count}

        except Exception as exc:
            logger.exception("document_processing_failed", document_id=document_id)
            document.status = DocumentStatus.FAILED
            document.error_message = str(exc)
            session.commit()
            return {"status": "error", "message": str(exc)}
