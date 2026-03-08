#!/bin/bash
# startup.sh — Azure App Service startup command
# Oryx activates its venv before this runs, so python/gunicorn are in PATH.
set -e

cd /home/site/wwwroot

echo "==> Python: $(which python) | $(python --version)"
echo "==> Gunicorn: $(which gunicorn)"

echo "==> Running database migrations..."
python manage.py migrate --no-input

echo "==> Collecting static files..."
python manage.py collectstatic --no-input 2>/dev/null || true

echo "==> Starting gunicorn on port 8000..."
exec gunicorn backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 1 \
  --timeout 120 \
  --access-logfile '-' \
  --error-logfile '-'
