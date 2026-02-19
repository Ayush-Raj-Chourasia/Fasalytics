#!/usr/bin/env bash
# Render build script for Fasalytics backend
set -o errexit

echo "==> Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirement.txt

echo "==> Collecting static files..."
python manage.py collectstatic --no-input

echo "==> Running database migrations..."
python manage.py migrate --no-input

echo "==> Build complete!"
