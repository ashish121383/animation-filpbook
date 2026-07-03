from abc import ABC, abstractmethod
from pathlib import Path


class StorageBackend(ABC):
    """Abstract storage backend for uploaded files."""

    @abstractmethod
    async def save(self, relative_path: str, data: bytes) -> str:
        """Save file data and return the stored relative path."""

    @abstractmethod
    async def read(self, relative_path: str) -> bytes:
        """Read file data from storage."""

    @abstractmethod
    async def delete(self, relative_path: str) -> None:
        """Delete a file from storage."""

    @abstractmethod
    async def exists(self, relative_path: str) -> bool:
        """Check if a file exists in storage."""

    @abstractmethod
    def get_absolute_path(self, relative_path: str) -> Path:
        """Return absolute filesystem path (local storage only)."""


class LocalStorageBackend(StorageBackend):
    """Local filesystem storage backend."""

    def __init__(self, base_dir: str) -> None:
        self.base_dir = Path(base_dir).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_path(self, relative_path: str) -> Path:
        full_path = (self.base_dir / relative_path).resolve()
        if not str(full_path).startswith(str(self.base_dir)):
            raise ValueError("Invalid storage path: path traversal detected")
        return full_path

    async def save(self, relative_path: str, data: bytes) -> str:
        full_path = self._resolve_path(relative_path)
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_bytes(data)
        return relative_path

    async def read(self, relative_path: str) -> bytes:
        full_path = self._resolve_path(relative_path)
        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {relative_path}")
        return full_path.read_bytes()

    async def delete(self, relative_path: str) -> None:
        full_path = self._resolve_path(relative_path)
        if full_path.exists():
            full_path.unlink()

    async def exists(self, relative_path: str) -> bool:
        return self._resolve_path(relative_path).exists()

    def get_absolute_path(self, relative_path: str) -> Path:
        return self._resolve_path(relative_path)


class S3StorageBackend(StorageBackend):
    """S3-compatible storage backend (AWS S3, MinIO, etc.)."""

    def __init__(
        self,
        bucket: str,
        region: str,
        access_key: str,
        secret_key: str,
        endpoint_url: str | None = None,
    ) -> None:
        self.bucket = bucket
        self.region = region
        self.access_key = access_key
        self.secret_key = secret_key
        self.endpoint_url = endpoint_url
        self._client = None

    def _get_client(self):  # type: ignore[no-untyped-def]
        if self._client is None:
            import boto3

            self._client = boto3.client(
                "s3",
                region_name=self.region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                endpoint_url=self.endpoint_url,
            )
        return self._client

    async def save(self, relative_path: str, data: bytes) -> str:
        client = self._get_client()
        client.put_object(Bucket=self.bucket, Key=relative_path, Body=data)
        return relative_path

    async def read(self, relative_path: str) -> bytes:
        client = self._get_client()
        response = client.get_object(Bucket=self.bucket, Key=relative_path)
        return response["Body"].read()

    async def delete(self, relative_path: str) -> None:
        client = self._get_client()
        client.delete_object(Bucket=self.bucket, Key=relative_path)

    async def exists(self, relative_path: str) -> bool:
        client = self._get_client()
        try:
            client.head_object(Bucket=self.bucket, Key=relative_path)
            return True
        except client.exceptions.ClientError:
            return False

    def get_absolute_path(self, relative_path: str) -> Path:
        raise NotImplementedError("S3 storage does not support local filesystem paths")


def create_storage_backend(
    backend_type: str,
    upload_dir: str,
    s3_bucket: str = "",
    s3_region: str = "us-east-1",
    s3_access_key: str = "",
    s3_secret_key: str = "",
    s3_endpoint_url: str | None = None,
) -> StorageBackend:
    if backend_type == "s3":
        if not all([s3_bucket, s3_access_key, s3_secret_key]):
            raise ValueError("S3 storage requires bucket, access key, and secret key")
        return S3StorageBackend(
            bucket=s3_bucket,
            region=s3_region,
            access_key=s3_access_key,
            secret_key=s3_secret_key,
            endpoint_url=s3_endpoint_url,
        )
    return LocalStorageBackend(base_dir=upload_dir)
