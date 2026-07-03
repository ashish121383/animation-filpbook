#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Starting Premium OCR PDF Flipbook (Production Mode)"

sudo service postgresql start 2>/dev/null || true
sudo service redis-server start 2>/dev/null || true

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='flipbook'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER flipbook WITH PASSWORD 'flipbook_secret';" 2>/dev/null || true
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='flipbook_db'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE flipbook_db OWNER flipbook;" 2>/dev/null || true

cd backend
source .venv/bin/activate
mkdir -p uploads logs
alembic upgrade head 2>/dev/null || true
cd "$ROOT_DIR"

# Build frontend
echo "==> Building frontend..."
cd frontend
npm run build
cd "$ROOT_DIR"

# Kill existing processes on our ports
for port in 5173 8000 3000; do
  pid=$(lsof -ti:"$port" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "Stopping process on port $port"
    kill $pid 2>/dev/null || true
    sleep 1
  fi
done

SESSION_NAME="flipbook-dev"
tmux -f /exec-daemon/tmux.portal.conf kill-session -t "$SESSION_NAME" 2>/dev/null || true
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "$ROOT_DIR" -- "${SHELL:-bash}" -l

# Backend on 8000
tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION_NAME:0.0" \
  "cd $ROOT_DIR/backend && source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" C-m

# Production server on 5173 (primary - matches Cursor port forwarding)
tmux -f /exec-daemon/tmux.portal.conf split-window -h -t "$SESSION_NAME:0" -c "$ROOT_DIR/frontend" \; \
  send-keys -t "$SESSION_NAME:0.1" \
  "PORT=5173 node server.mjs" C-m

# Also serve on 3000 as fallback
tmux -f /exec-daemon/tmux.portal.conf split-window -v -t "$SESSION_NAME:0.1" -c "$ROOT_DIR/frontend" \; \
  send-keys -t "$SESSION_NAME:0.2" \
  "PORT=3000 node server.mjs" C-m

# Celery worker
tmux -f /exec-daemon/tmux.portal.conf split-window -v -t "$SESSION_NAME:0.0" -c "$ROOT_DIR/backend" \; \
  send-keys -t "$SESSION_NAME:0.3" \
  "source .venv/bin/activate && celery -A app.celery_app worker --loglevel=info --concurrency=2" C-m

echo ""
echo "Waiting for services..."
sleep 4

check_port() {
  curl -sf "http://127.0.0.1:$1/" >/dev/null 2>&1 && \
  curl -sf "http://127.0.0.1:$1/api/v1/health" >/dev/null 2>&1
}

if check_port 5173; then
  echo "✓ App running on port 5173"
elif check_port 3000; then
  echo "✓ App running on port 3000 (use this in Cursor Ports panel)"
else
  echo "✗ Failed to start. Check: tmux -f /exec-daemon/tmux.portal.conf attach -t flipbook-dev"
  exit 1
fi

echo ""
echo "  Port 5173: primary (Cursor forwarded URL)"
echo "  Port 3000: fallback"
echo "  API health: /api/v1/health"
echo ""
echo "  In Cursor Ports panel, open port 5173 or 3000 in browser."
