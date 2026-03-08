#!/bin/bash
# startup.sh — Azure App Service startup command
# Collect static files and run migrations before starting gunicorn

echo "==> Collecting static files..."
python manage.py collectstatic --no-input 2>/dev/null || true

echo "==> Running database migrations..."
python manage.py migrate --no-input 2>/dev/null || true

echo "==> Starting gunicorn..."
gunicorn backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 1 \
  --timeout 120 \
  --access-logfile '-' \
  --error-logfile '-'
