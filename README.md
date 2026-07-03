# Premium OCR PDF Flipbook

Enterprise-grade AI-powered OCR PDF flipbook application with realistic page-flip animations, multi-engine OCR pipeline, and object-level animation engine.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS, Framer Motion, GSAP, Zustand, React Query |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Alembic, Celery, Redis |
| Database | PostgreSQL |
| OCR/AI | PaddleOCR, EasyOCR, Tesseract, OpenCV, PyMuPDF, LayoutParser, DocTR |
| Deployment | Docker, Docker Compose, Nginx |

## Project Structure

```
├── frontend/          # React 19 + Vite application
├── backend/           # FastAPI application
├── shared/            # Shared TypeScript types
├── docker/            # Docker & Nginx configuration
├── docs/              # Documentation
├── tests/             # Integration tests
└── scripts/           # Setup & development scripts
```

## Quick Start

### Prerequisites

- Node.js 22+
- Python 3.12+
- Docker & Docker Compose (optional)

### Local Development

```bash
# Clone and setup
cp .env.example .env
chmod +x scripts/*.sh
./scripts/setup.sh

# Start dev servers
./scripts/dev.sh
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs
- Health Check: http://localhost:8000/api/v1/health

### Docker Development

```bash
cp .env.example .env
docker compose up --build
```

## Module Progress

- [x] **Module 1**: Project Initialization (React, FastAPI, Docker, Health Check, Base Layout)
- [x] **Module 2**: PDF Upload & Storage
- [ ] **Module 3**: OCR Pipeline
- [ ] **Module 4**: Page Rendering & Layers
- [ ] **Module 5**: Page Flip Engine
- [ ] **Module 6**: Animation Engine
- [ ] **Module 7**: Search, Bookmarks, Notes
- [ ] **Module 8**: Drawing & Annotations
- [ ] **Module 9**: Performance Optimization
- [ ] **Module 10**: Deployment & CI/CD

## API Endpoints

### Module 1 — Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API root info |
| GET | `/api/v1/health` | Full health check |
| GET | `/api/v1/health/live` | Liveness probe |
| GET | `/api/v1/health/ready` | Readiness probe |

### Module 2 — Documents & Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/upload` | Upload PDF file |
| GET | `/api/v1/documents` | List documents (paginated) |
| GET | `/api/v1/documents/{id}` | Get document by ID |
| DELETE | `/api/v1/documents/{id}` | Delete document and file |
| GET | `/api/v1/pages?document_id=` | List pages for document |
| GET | `/api/v1/page/{id}` | Get page by ID |

## Testing

```bash
# Backend tests
cd backend && source .venv/bin/activate && pytest

# Frontend tests
cd frontend && npm test
```

## License

Proprietary - All rights reserved.
