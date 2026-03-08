#!/bin/bash
cd /home/site/wwwroot
python manage.py migrate --no-input || true
exec gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 120
