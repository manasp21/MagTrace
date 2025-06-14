#!/usr/bin/env python3
"""
Simple MagTrace starter script
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    print("=" * 60)
    print("                   MagTrace Starter")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists('backend/manage.py'):
        print("ERROR: Please run this script from the MagTrace root directory")
        print("Current directory:", os.getcwd())
        return 1
    
    print("\n1. Checking Python...")
    try:
        version = sys.version_info
        print(f"   Python {version.major}.{version.minor}.{version.micro} found")
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            print("   WARNING: Python 3.8+ recommended")
    except Exception as e:
        print(f"   ERROR: Could not check Python version: {e}")
        return 1
    
    print("\n2. Checking dependencies...")
    missing = []
    
    # Check core dependencies
    deps = {
        'django': 'Django',
        'rest_framework': 'djangorestframework', 
        'corsheaders': 'django-cors-headers',
        'pandas': 'pandas',
        'numpy': 'numpy',
        'sklearn': 'scikit-learn'
    }
    
    for module, package in deps.items():
        try:
            __import__(module)
            print(f"   ✓ {package}")
        except ImportError:
            missing.append(package)
            print(f"   ✗ {package}")
    
    # Check optional TensorFlow
    try:
        import tensorflow
        print(f"   ✓ TensorFlow (neural networks enabled)")
    except ImportError:
        print(f"   ℹ TensorFlow not found (will use scikit-learn)")
    
    if missing:
        print(f"\n   ERROR: Missing packages: {', '.join(missing)}")
        print("\n   To install, run:")
        print("   pip install " + " ".join(missing))
        print("   OR")
        print("   pip install -r backend/requirements-lite.txt")
        return 1
    
    print("\n3. Setting up database...")
    try:
        os.chdir('backend')
        
        # Run migrations
        print("   Running migrations...")
        result = subprocess.run([sys.executable, 'manage.py', 'migrate'], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            print(f"   ERROR: Migration failed: {result.stderr}")
            return 1
        print("   ✓ Database ready")
        
    except Exception as e:
        print(f"   ERROR: Database setup failed: {e}")
        return 1
    
    print("\n4. Starting Django server...")
    print("   Backend will run on: http://localhost:8000")
    print("   API endpoints: http://localhost:8000/api")
    print("   Admin panel: http://localhost:8000/admin")
    print("\n   Press Ctrl+C to stop")
    print("=" * 60)
    
    try:
        subprocess.run([sys.executable, 'manage.py', 'runserver', '8000'])
    except KeyboardInterrupt:
        print("\n\nServer stopped. Goodbye!")
    except Exception as e:
        print(f"\nERROR: Failed to start server: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())