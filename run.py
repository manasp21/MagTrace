#!/usr/bin/env python3
"""
MagTrace Application Runner
Starts the integrated Django development server (backend + frontend)
"""

import os
import sys
import subprocess
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    missing = []
    
    try:
        import django
        print("✓ Django found")
    except ImportError:
        missing.append("Django")
    
    try:
        import rest_framework
        print("✓ Django REST Framework found")
    except ImportError:
        missing.append("djangorestframework")
    
    try:
        import corsheaders
        print("✓ Django CORS Headers found")
    except ImportError:
        missing.append("django-cors-headers")
    
    try:
        import pandas
        print("✓ Pandas found")
    except ImportError:
        missing.append("pandas")
    
    try:
        import numpy
        print("✓ NumPy found")
    except ImportError:
        missing.append("numpy")
    
    try:
        import sklearn
        print("✓ scikit-learn found")
    except ImportError:
        missing.append("scikit-learn")
    
    # Check optional dependencies
    try:
        import tensorflow
        print("✓ TensorFlow found - will use neural network models")
    except ImportError:
        print("ℹ TensorFlow not found - will use scikit-learn models")
    
    if missing:
        print(f"\n✗ Missing dependencies: {', '.join(missing)}")
        print("\nTo install missing dependencies, run one of:")
        print("  pip install -r backend/requirements.txt")
        print("  OR")
        print("  pip install -r backend/requirements-lite.txt  (without TensorFlow)")
        print("  OR")
        print("  pip install Django djangorestframework django-cors-headers pandas numpy scikit-learn")
        return False
    
    print("✓ All required dependencies found")
    return True

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
        print("\n" + "=" * 50)
        print("Application started successfully!")
        print("🏠 Landing Page: http://localhost:8000/")
        print("🧲 MagTrace App: http://localhost:8000/app/")
        print("📊 Backend API: http://localhost:8000/api/")
        print("⚙️  Admin Panel: http://localhost:8000/admin/")
        print("❤️  Health Check: http://localhost:8000/health/")
        print("=" * 50)
        print("Press Ctrl+C to stop the application")
        print("=" * 50)
        
        # Start Django server (serves everything - frontend and backend)
        start_django_server()
        
    except KeyboardInterrupt:
        print("\n\nShutting down MagTrace application...")
        return 0
    except Exception as e:
        print(f"Error running application: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())