# MagTrace Unified Startup Script

# Stop existing processes
Write-Host "Stopping existing processes..."
taskkill /f /im python.exe 2>&1 | Out-Null
taskkill /f /im node.exe 2>&1 | Out-Null

# Start backend services
Write-Host "Starting Django server..."
cd backend
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "manage.py runserver"
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m celery -A django_magtrace worker -l info"
cd ..

# Start frontend server
Write-Host "Starting frontend server..."
if (Get-Command "http-server" -ErrorAction SilentlyContinue) {
    Start-Process -NoNewWindow -FilePath "http-server" -ArgumentList "-p 3000 -c-1"
} else {
    Write-Host "http-server not found. Using Python HTTP server instead."
    Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m http.server 3000"
}

# Open application
Start-Process "http://localhost:3000"

Write-Host "Application started! Access at http://localhost:3000"