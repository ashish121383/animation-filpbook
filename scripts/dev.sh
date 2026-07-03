#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

echo "==> Starting Premium OCR PDF Flipbook Development Servers"
echo ""

if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "Starting Backend on http://localhost:8000..."
cd backend
source .venv/bin/activate 2>/dev/null || {
  echo "Virtual environment not found. Run ./scripts/setup.sh first."
  exit 1
}
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

echo "Starting Frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:8000/api/docs"
echo ""
echo "Press Ctrl+C to stop all servers."

wait $BACKEND_PID $FRONTEND_PID
