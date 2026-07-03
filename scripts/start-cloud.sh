#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Starting Premium OCR PDF Flipbook (Cloud Mode)"

# Ensure infrastructure services are running
sudo service postgresql start 2>/dev/null || true
sudo service redis-server start 2>/dev/null || true

# Ensure database exists
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='flipbook'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER flipbook WITH PASSWORD 'flipbook_secret';" 2>/dev/null || true
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='flipbook_db'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE flipbook_db OWNER flipbook;" 2>/dev/null || true

# Localhost URLs for cloud VM
if [ -f .env ]; then
  sed -i 's|@postgres:5432|@localhost:5432|g' .env 2>/dev/null || true
  sed -i 's|redis://redis:|redis://localhost:|g' .env 2>/dev/null || true
  grep -q '^VITE_API_BASE_URL=/api/v1' .env || echo 'VITE_API_BASE_URL=/api/v1' >> .env
fi

# Run migrations
cd backend
source .venv/bin/activate 2>/dev/null || { echo "Run ./scripts/setup.sh first"; exit 1; }
mkdir -p uploads logs
alembic upgrade head 2>/dev/null || true
cd "$ROOT_DIR"

# Kill existing processes on our ports
for port in 5173 8000; do
  pid=$(lsof -ti:"$port" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "Stopping process on port $port (pid $pid)"
    kill "$pid" 2>/dev/null || true
    sleep 1
  fi
done

SESSION_NAME="flipbook-dev"
tmux -f /exec-daemon/tmux.portal.conf kill-session -t "$SESSION_NAME" 2>/dev/null || true
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "$ROOT_DIR" -- "${SHELL:-bash}" -l

tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION_NAME:0.0" \
  "cd $ROOT_DIR/backend && source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" C-m

tmux -f /exec-daemon/tmux.portal.conf split-window -h -t "$SESSION_NAME:0" -c "$ROOT_DIR/frontend" \; \
  send-keys -t "$SESSION_NAME:0.1" \
  "CURSOR_AGENT=1 npm run dev -- --host 0.0.0.0 --port 5173" C-m

tmux -f /exec-daemon/tmux.portal.conf split-window -v -t "$SESSION_NAME:0.1" -c "$ROOT_DIR/backend" \; \
  send-keys -t "$SESSION_NAME:0.2" \
  "source .venv/bin/activate && celery -A app.celery_app worker --loglevel=info --concurrency=2" C-m

echo ""
echo "Waiting for services to start..."
sleep 5

if curl -sf http://127.0.0.1:5173/ >/dev/null && curl -sf http://127.0.0.1:5173/api/v1/health >/dev/null; then
  echo "✓ Application is running"
  echo ""
  echo "  Frontend:  port 5173 (use Cursor forwarded URL for port 5173)"
  echo "  Backend:   port 8000 (internal only — API proxied via /api on port 5173)"
  echo "  Health:    http://127.0.0.1:5173/api/v1/health"
  echo ""
  echo "  Open the Cursor Ports panel and use the forwarded URL for port 5173."
else
  echo "✗ Services failed to start. Check logs:"
  echo "  tmux -f /exec-daemon/tmux.portal.conf attach-session -t flipbook-dev"
  exit 1
fi
