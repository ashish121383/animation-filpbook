import uuid
from pathlib import PurePosixPath

from fastapi import UploadFile

from app.core.config import Settings
from app.services.storage import StorageBackend, create_storage_backend


class StorageService:
    """High-level file storage operations for document uploads."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.backend: StorageBackend = create_storage_backend(
            backend_type=settings.storage_backend,
            upload_dir=settings.upload_dir,
            s3_bucket=settings.s3_bucket,
            s3_region=settings.s3_region,
            s3_access_key=settings.s3_access_key,
            s3_secret_key=settings.s3_secret_key,
            s3_endpoint_url=settings.s3_endpoint_url,
        )

    def validate_file(self, filename: str, file_size: int, content_type: str | None) -> None:
        extension = PurePosixPath(filename).suffix.lstrip(".").lower()
        if extension not in self.settings.allowed_extensions_list:
            allowed = ", ".join(self.settings.allowed_extensions_list)
            raise ValueError(f"File type '.{extension}' not allowed. Allowed: {allowed}")

        if file_size > self.settings.max_upload_size_bytes:
            max_mb = self.settings.max_upload_size_mb
            raise ValueError(f"File exceeds maximum size of {max_mb}MB")

        if content_type and content_type not in ("application/pdf", "application/octet-stream"):
            raise ValueError(f"Invalid content type: {content_type}")

    def generate_storage_path(self, original_filename: str) -> tuple[str, str]:
        doc_id = uuid.uuid4()
        safe_name = PurePosixPath(original_filename).name
        relative_path = f"documents/{doc_id}/{safe_name}"
        stored_filename = safe_name
        return relative_path, stored_filename

    async def save_upload(self, file: UploadFile, data: bytes) -> str:
        if not file.filename:
            raise ValueError("Filename is required")
        self.validate_file(file.filename, len(data), file.content_type)
        relative_path, _ = self.generate_storage_path(file.filename)
        return await self.backend.save(relative_path, data)

    async def read_file(self, relative_path: str) -> bytes:
        return await self.backend.read(relative_path)

    async def delete_file(self, relative_path: str) -> None:
        await self.backend.delete(relative_path)

    def get_absolute_path(self, relative_path: str):
        return self.backend.get_absolute_path(relative_path)
