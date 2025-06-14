#!/usr/bin/env python3
"""
MagTrace Application Runner
Starts the Django development server and serves the frontend
"""

import os
import sys
import subprocess
import threading
import time
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import django
        import rest_framework
        import corsheaders
        import pandas
        import numpy
        import sklearn
        print("✓ All Python dependencies found")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Please install requirements: pip install -r backend/requirements.txt")
        return False

def setup_database():
    """Set up the database and run migrations"""
    print("Setting up database...")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    try:
        # Run migrations
        result = subprocess.run([sys.executable, "manage.py", "makemigrations"], check=True)
        result = subprocess.run([sys.executable, "manage.py", "migrate"], check=True)
        
        # Create superuser if needed
        print("Database setup complete!")
        print("To create an admin user, run: python backend/manage.py createsuperuser")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"✗ Database setup failed: {e}")
        return False

def start_django_server():
    """Start the Django development server"""
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    try:
        print("Starting Django server on http://localhost:8000...")
        subprocess.run([sys.executable, "manage.py", "runserver", "0.0.0.0:8000"])
    except KeyboardInterrupt:
        print("\nDjango server stopped")
    except Exception as e:
        print(f"Error starting Django server: {e}")

def serve_frontend():
    """Serve the frontend files"""
    try:
        import http.server
        import socketserver
        
        # Change to root directory to serve frontend files
        root_dir = Path(__file__).parent
        os.chdir(root_dir)
        
        PORT = 3000
        Handler = http.server.SimpleHTTPRequestHandler
        
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Frontend server started on http://localhost:{PORT}")
            print("Serving frontend files...")
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\nFrontend server stopped")
    except Exception as e:
        print(f"Error starting frontend server: {e}")

def main():
    """Main function to run the application"""
    print("=" * 50)
    print("      MagTrace Application Launcher")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        return 1
    
    # Setup database
    if not setup_database():
        return 1
    
    try:
        # Start Django server in a separate thread
        django_thread = threading.Thread(target=start_django_server, daemon=True)
        django_thread.start()
        
        # Give Django time to start
        time.sleep(3)
        
        # Start frontend server in main thread
        print("\n" + "=" * 50)
        print("Application started successfully!")
        print("Frontend: http://localhost:3000")
        print("Backend API: http://localhost:8000/api")
        print("Admin Panel: http://localhost:8000/admin")
        print("=" * 50)
        print("Press Ctrl+C to stop the application")
        print("=" * 50)
        
        serve_frontend()
        
    except KeyboardInterrupt:
        print("\n\nShutting down MagTrace application...")
        return 0
    except Exception as e:
        print(f"Error running application: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())