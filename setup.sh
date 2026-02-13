#!/bin/bash

# Fasalytics - Quick Setup Script for macOS/Linux

echo "=========================================="
echo "Fasalytics - AI Crop Health Monitoring"
echo "Quick Setup Script"
echo "=========================================="
echo ""

# Backend Setup
echo "[1/5] Creating Python Virtual Environment..."
python3 -m venv venv
source venv/bin/activate

echo "[2/5] Installing Backend Dependencies..."
pip install -r requirement.txt

echo "[3/5] Running Database Migrations..."
python manage.py migrate

echo "[4/5] Setting up Frontend..."
cd frontend
npm install
cd ..

echo "[5/5] Creating .env files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "Created frontend/.env file"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "=========================================="
