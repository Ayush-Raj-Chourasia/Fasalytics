@echo off
REM Fasalytics - Quick Setup Script for Windows

echo ==========================================
echo Fasalytics - AI Crop Health Monitoring
echo Quick Setup Script
echo ==========================================
echo.

REM Backend Setup
echo [1/5] Creating Python Virtual Environment...
python -m venv venv
call venv\Scripts\activate.bat

echo [2/5] Installing Backend Dependencies...
pip install -r requirement.txt

echo [3/5] Running Database Migrations...
python manage.py migrate

echo [4/5] Setting up Frontend...
cd frontend
call npm install
cd ..

echo [5/5] Creating .env files...
if not exist .env (
    copy .env.example .env
    echo Created .env file
)

if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo Created frontend\.env file
)

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To start the application:
echo.
echo Terminal 1 (Backend):
echo   venv\Scripts\activate
echo   python manage.py runserver
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo Then open http://localhost:3000 in your browser
echo.
echo ==========================================
