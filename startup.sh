#!/bin/bash
# Fasalytics backend startup
echo "===== FASALYTICS STARTUP ====="
echo "Python: $(python --version 2>&1 || echo 'not found')"
echo "Gunicorn: $(gunicorn --version 2>&1 || echo 'not found')"
echo "WEBSITE_HOSTNAME: ${WEBSITE_HOSTNAME:-not set}"

cd /home/site/wwwroot

echo "==> Running migrations..."
python manage.py migrate --no-input 2>&1 || echo "Migrations skipped"

# Only run collectstatic if staticfiles/ dir was not pre-built in CI
if [ ! -d "staticfiles" ]; then
  echo "==> Collecting static files..."
  python manage.py collectstatic --no-input 2>&1 || echo "Collectstatic skipped"
else
  echo "==> staticfiles/ already present, skipping collectstatic"
fi

echo "==> Starting gunicorn on port 8000..."
exec gunicorn backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 1 \
  --timeout 120 \
  --access-logfile '-' \
  --error-logfile '-' \
  --log-level info
