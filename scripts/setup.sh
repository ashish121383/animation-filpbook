#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Premium OCR PDF Flipbook - Setup"
echo ""

if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
else
  echo ".env already exists, skipping..."
fi

echo ""
echo "==> Setting up Backend..."
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
mkdir -p uploads logs
deactivate
cd ..

echo ""
echo "==> Setting up Frontend..."
cd frontend
npm install
cd ..

echo ""
echo "==> Setup complete!"
echo ""
echo "To start development:"
echo "  ./scripts/dev.sh"
echo ""
echo "Or with Docker:"
echo "  docker compose up --build"
