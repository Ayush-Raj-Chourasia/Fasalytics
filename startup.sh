#!/bin/bash
cd /home/site/wwwroot

# Use pre-installed antenv if present, otherwise fall back to system python
if [ -f antenv/bin/gunicorn ]; then
  PYTHON=antenv/bin/python
  GUNICORN=antenv/bin/gunicorn
else
  PYTHON=python
  GUNICORN=gunicorn
fi

$PYTHON manage.py migrate --no-input || true
exec $GUNICORN backend.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 120
