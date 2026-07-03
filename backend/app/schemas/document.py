import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.document import DocumentStatus, PageStatus


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    page_count: int | None
    status: DocumentStatus
    error_message: str | None
    storage_backend: str
    created_at: datetime
    updated_at: datetime


class PageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    document_id: uuid.UUID
    page_number: int
    width: float | None
    height: float | None
    thumbnail_path: str | None
    status: PageStatus
    created_at: datetime
    updated_at: datetime


class UploadResponse(BaseModel):
    document: DocumentResponse
    message: str = "Upload successful. Processing started."


class DocumentListResponse(BaseModel):
    data: list[DocumentResponse]
    total: int
    page: int = 1
    per_page: int = 20


class PageListResponse(BaseModel):
    data: list[PageResponse]
    total: int
    document_id: uuid.UUID


class DeleteResponse(BaseModel):
    id: uuid.UUID
    message: str = "Document deleted successfully"
