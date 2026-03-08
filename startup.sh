#!/bin/bash
cd /home/site/wwwroot

echo "==> Running migrations..."
python manage.py migrate --no-input || echo "Migrations skipped"

echo "==> Collecting static files..."
python manage.py collectstatic --no-input 2>/dev/null || echo "Collectstatic skipped"

echo "==> Starting gunicorn..."
exec gunicorn backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 1 \
  --timeout 120 \
  --access-logfile '-' \
  --error-logfile '-'
