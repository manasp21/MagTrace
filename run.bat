@echo off
REM MagTrace Unified Startup Script (CMD)

REM Stop existing processes
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

REM Start backend services
cd backend
start python manage.py runserver
start python -m celery -A django_magtrace worker -l info
cd ..

REM Start frontend server
if exist "node_modules\.bin\http-server" (
    start node_modules\.bin\http-server -p 3000 -c-1
) else (
    start python -m http.server 3000
)

REM Open application
start http://localhost:3000

echo Application started! Access at http://localhost:3000