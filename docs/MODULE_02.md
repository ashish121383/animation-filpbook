# Module 2: PDF Upload & Storage

## Overview

Module 2 implements the complete PDF upload pipeline with persistent storage, database models, background processing, and a full upload UI.

## What Was Built

### Backend
- **Document & Page models** — SQLAlchemy ORM with UUID primary keys, status enums, timestamps
- **Storage layer** — `LocalStorageBackend` (default) and `S3StorageBackend` (optional via `STORAGE_BACKEND=s3`)
- **Alembic migration** — `001_initial_documents_and_pages` creates `documents` and `pages` tables
- **Upload API** — `POST /upload` with PDF validation (type, size up to 500MB)
- **Document API** — `GET /documents`, `GET /documents/{id}`, `DELETE /documents/{id}`
- **Page API** — `GET /pages?document_id=`, `GET /page/{id}`
- **Celery task** — `process_document` extracts page count and dimensions via PyMuPDF
- **Sync fallback** — Processes inline when Celery/Redis is unavailable

### Frontend
- **UploadZone** — Drag-and-drop upload with progress bar and validation
- **DocumentList** — Document list with status badges, auto-refresh during processing, delete
- **UploadPage** — Combined upload + document list view
- **DocumentDetailPage** — Document metadata and page grid with dimensions
- **React Query hooks** — `useUploadDocument`, `useDocuments`, `useDocument`, `usePages`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/upload` | Upload PDF file |
| GET | `/api/v1/documents` | List documents (paginated) |
| GET | `/api/v1/documents/{id}` | Get document by ID |
| DELETE | `/api/v1/documents/{id}` | Delete document and file |
| GET | `/api/v1/pages?document_id=` | List pages for document |
| GET | `/api/v1/page/{id}` | Get page by ID |

## Environment Variables

```env
STORAGE_BACKEND=local          # or "s3"
S3_BUCKET=                     # required for S3
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_ENDPOINT_URL=               # optional, for MinIO
```

## Database Migration

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

## Testing

```bash
# Backend (uses SQLite in-memory for tests)
cd backend && pytest -v

# Frontend
cd frontend && npm run typecheck && npm run build
```

## Next Module

**Module 3: OCR Pipeline** — Multi-engine OCR extraction, layout detection (headings, paragraphs, tables, charts), and JSON animation data generation.
