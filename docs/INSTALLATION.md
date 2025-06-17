# MagTrace Pro Installation Guide

**Author: Manas Pandey**  
*Developed with the assistance of Claude*

## System Requirements

- **Python**: 3.8 or higher
- **Operating System**: Windows, macOS, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 1GB free space
- **Browser**: Chrome, Firefox, Safari, or Edge

## Quick Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd MagTrace
```

### 2. Create Virtual Environment
```bash
cd backend
python3 -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
# Try full installation first
pip install -r requirements.txt

# If TensorFlow installation fails, use lite version
pip install -r requirements-lite.txt
```

### 4. Setup Database
```bash
python manage.py makemigrations magtrace_api
python manage.py migrate
```

### 5. Start Application
```bash
# Quick start (recommended)
cd ..
python run.py

# OR manual start
cd backend
python manage.py runserver
```

### 6. Access Application
Open your browser to: http://localhost:8000/app/

## Detailed Installation

### Dependencies Explained

**Core Requirements (requirements-lite.txt):**
- Django 4.2+ - Web framework
- djangorestframework - API framework
- django-cors-headers - CORS support
- pandas - Data processing
- numpy - Numerical computing
- scikit-learn - Machine learning

**Optional Requirements (requirements.txt):**
- tensorflow 2.15+ - Advanced ML models
- matplotlib - Additional plotting
- jupyter - Notebook support

### Virtual Environment Setup

**Why use virtual environment?**
- Isolates project dependencies
- Prevents conflicts with system Python
- Ensures reproducible installations

**Creating environment:**
```bash
# Using venv (recommended)
python3 -m venv venv

# Using conda (alternative)
conda create -n magtrace python=3.9
conda activate magtrace
```

### Database Configuration

**Default Setup (SQLite):**
- No additional configuration needed
- Database file: `backend/db.sqlite3`
- Automatically created on first run

**Custom Database (Optional):**
Edit `backend/django_magtrace/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'magtrace',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Troubleshooting Installation

### Common Issues

**TensorFlow Installation Fails:**
```bash
# Use lite requirements instead
pip install -r requirements-lite.txt
# Application will use scikit-learn models
```

**Permission Errors:**
```bash
# On Windows, run as administrator
# On macOS/Linux, check file permissions
chmod +x run.py
```

**Port Already in Use:**
```bash
# Kill existing processes
lsof -ti:8000 | xargs kill -9
# Or use different port
python manage.py runserver 8001
```

**Database Migration Errors:**
```bash
# Reset database
rm backend/db.sqlite3
python manage.py makemigrations magtrace_api
python manage.py migrate
```

### Performance Optimization

**For Large Datasets:**
- Increase available RAM
- Close other applications
- Use SSD storage for better I/O

**Browser Optimization:**
- Use Chrome or Firefox for best performance
- Close unnecessary browser tabs
- Enable hardware acceleration

## Development Setup

### Additional Tools
```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Code formatting
pip install black isort

# Testing
pip install pytest pytest-django
```

### IDE Configuration
**VS Code Extensions:**
- Python
- Django
- JavaScript ES6

**PyCharm:**
- Enable Django support
- Configure Python interpreter to virtual environment

## Docker Installation (Alternative)

### Using Docker Compose
```bash
# Build and start containers
docker-compose up --build

# Access application
http://localhost:8000/app/
```

### Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements-lite.txt .
RUN pip install -r requirements-lite.txt

COPY . .
EXPOSE 8000

CMD ["python", "backend/manage.py", "runserver", "0.0.0.0:8000"]
```

## Verification

### Test Installation
```bash
# Run basic tests
python test_functionality.py

# Check API endpoints
curl http://localhost:8000/health/

# Verify static files
curl http://localhost:8000/static/js/magtrace-pro.js
```

### Expected Output
- ✅ Django server starts without errors
- ✅ Application loads at http://localhost:8000/app/
- ✅ API responds at http://localhost:8000/api/
- ✅ File upload and visualization work

## Next Steps

1. **Create First Project** - Follow Quick Start guide
2. **Upload Sample Data** - Use files from `example/` directory
3. **Test Labeling** - Practice with interactive selection
4. **Train Model** - Complete the full workflow

## Support

**Common Solutions:**
- Check Python version: `python --version`
- Verify pip installation: `pip list`
- Review Django logs in terminal
- Check browser console for JavaScript errors

**Getting Help:**
- Review troubleshooting section in README.md
- Check GitHub issues
- Ensure all requirements are installed correctly