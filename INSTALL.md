# Installation Guide for MagTrace

This guide provides multiple installation options to handle different system configurations and TensorFlow compatibility issues.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Option 1: Quick Installation (Recommended)

### Step 1: Install Core Dependencies (Guaranteed to Work)
```bash
pip install -r backend/requirements-lite.txt
```

This installs:
- Django 4.2 (web framework)
- Django REST Framework (API)
- Django CORS Headers (frontend integration)  
- Pandas (data processing)
- NumPy (numerical computing)
- scikit-learn (machine learning)
- Celery & Redis (background tasks)

### Step 2: Verify Installation
```bash
python -c "import django, pandas, numpy, sklearn; print('✓ All core dependencies installed')"
```

### Step 3: Start the Application
```bash
python start.py
```

## Option 2: Full Installation (with TensorFlow)

**Only try this if Option 1 works first!**

### Step 1: Install TensorFlow
```bash
pip install tensorflow
```

### Step 2: Verify TensorFlow
```bash
python -c "import tensorflow; print('✓ TensorFlow installed')"
```

## Option 3: Manual Installation

If both options above fail, install packages one by one:

### Step 1: Install Core Packages
```bash
pip install Django==4.2
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.1
pip install pandas
pip install numpy
pip install scikit-learn
```

### Step 2: Install Optional Packages
```bash
pip install celery
pip install redis
pip install joblib
```

### Step 3: Try TensorFlow (Optional)
```bash
# Try these in order until one works:
pip install tensorflow
# OR
pip install tensorflow-cpu
# OR
pip install tf-nightly
```

## Platform-Specific Instructions

### Windows
```bash
# If you have issues with TensorFlow on Windows:
pip install --upgrade pip
pip install tensorflow-cpu  # CPU-only version
```

### macOS (Apple Silicon)
```bash
# For M1/M2 Macs:
pip install tensorflow-macos
# OR
conda install tensorflow
```

### Linux
```bash
# Standard installation should work:
pip install tensorflow
```

## Setup Database

After installing dependencies:

### Step 1: Navigate to Backend
```bash
cd backend
```

### Step 2: Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 3: Create Admin User (Optional)
```bash
python manage.py createsuperuser
```

## Running the Application

### Option 1: Quick Start (Recommended)
```bash
# From the root directory
python run.py
```

### Option 2: Manual Start

#### Start Backend
```bash
cd backend
python manage.py runserver
```

#### Start Frontend (in another terminal)
```bash
# From root directory
python -m http.server 3000
```

## Verifying Installation

1. **Frontend**: Open http://localhost:3000
2. **Backend API**: Open http://localhost:8000/api
3. **Admin Panel**: Open http://localhost:8000/admin

## Troubleshooting

### TensorFlow Issues

**Problem**: Cannot install TensorFlow
**Solutions**:
1. Use the lightweight version (requirements-lite.txt)
2. The application will automatically use scikit-learn backend
3. All core functionality will work, just with simpler ML models

### Python Version Issues

**Problem**: Python version too old
**Solutions**:
1. Update Python to 3.8 or higher
2. Use conda: `conda create -n magtrace python=3.9`

### Permission Issues

**Problem**: Permission denied during installation
**Solutions**:
1. Use virtual environment: `python -m venv venv && source venv/bin/activate`
2. Use `--user` flag: `pip install --user -r requirements.txt`

### Missing Dependencies

**Problem**: ImportError for specific packages
**Solutions**:
1. Install missing package: `pip install <package-name>`
2. Update pip: `pip install --upgrade pip`

## Testing Installation

Upload the sample file `example/data_1.csv` to verify everything works:

1. Go to http://localhost:3000
2. Click "Upload CSV Data"
3. Select `example/data_1.csv`
4. Verify data appears in visualization

## Advanced Configuration

### Using PostgreSQL (Production)
```bash
pip install psycopg2-binary
# Update settings.py DATABASES configuration
```

### Using Redis (for background tasks)
```bash
# Install Redis server
# Ubuntu: sudo apt install redis-server
# macOS: brew install redis
# Windows: Download from https://redis.io/download

# Start Redis
redis-server

# Start Celery worker
cd backend
celery -A django_magtrace worker --loglevel=info
```

## Feature Availability

| Feature | Lightweight (sklearn) | Full (TensorFlow) |
|---------|----------------------|-------------------|
| Data Upload ✓ | ✓ | ✓ |
| Visualization ✓ | ✓ | ✓ |
| Labeling Tools ✓ | ✓ | ✓ |
| Anomaly Detection | Isolation Forest | Autoencoder |
| Classification | Random Forest | Neural Network |
| Background Tasks | Direct execution | Celery queue |

Both versions provide complete functionality - the lightweight version uses simpler but still effective machine learning algorithms.