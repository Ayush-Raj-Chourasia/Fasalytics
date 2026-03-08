#!/bin/bash
cd /home/site/wwwroot

# Prefer Oryx-managed antenv (built by SCM during deployment)
# Fall back to python -m gunicorn if no antenv binary present
if [ -f antenv/bin/gunicorn ]; then
  PYTHON=antenv/bin/python
  GUNICORN=antenv/bin/gunicorn
elif command -v gunicorn &>/dev/null; then
  PYTHON=python
  GUNICORN=gunicorn
else
  PYTHON=python
  GUNICORN="python -m gunicorn"
fi

$PYTHON manage.py migrate --no-input || true

exec $GUNICORN backend.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 120
