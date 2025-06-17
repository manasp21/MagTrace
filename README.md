# MagTrace - Magnetic Field Data Analysis Platform

**Professional magnetic field analysis platform for research and industrial applications**

*Author: Manas Pandey | Developed with Claude AI assistance*

[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/django-4.2-green.svg)](https://djangoproject.com)
[![Status](https://img.shields.io/badge/status-development-orange.svg)](#current-limitations)

## Project Status: Development Phase

**Current State:** Core functionality implemented, requires comprehensive testing and production hardening.

MagTrace provides magnetic field data analysis capabilities using machine learning for anomaly detection and pattern recognition. The platform processes magnetometer sensor data (B_x, B_y, B_z components) with interactive visualization and automated classification.

## Quick Start

```bash
git clone https://github.com/manasp21/MagTrace.git
cd MagTrace
python3 run.py
```

**Access Points:**
- **Main Application:** http://localhost:8000/app/
- **API Documentation:** http://localhost:8000/api/
- **Health Check:** http://localhost:8000/health/

## Core Features (Implemented)

### ✅ Working Functionality
- **Project Management** - Organize magnetic field analysis projects
- **CSV Data Upload** - Process magnetometer readings with automatic parsing
- **Interactive Visualization** - D3.js charts with zoom, pan, and brush selection
- **Data Labeling** - Manual annotation of magnetic field anomalies and patterns
- **Machine Learning Training** - Scikit-learn Random Forest classification
- **Real-time Progress** - Live training monitoring with progress indicators
- **RESTful API** - Complete API for programmatic access

### 📊 Data Format Support
```csv
timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,thetax,thetay,thetaz,sensor_id
24:40.0,7746.664,9395.448,14682.022,26.5123251,80.2238068,2018,0,0,0,S963350075783
```

**Required Columns:** `timestamp_pc`, `b_x`, `b_y`, `b_z`
**Optional Columns:** `lat`, `lon`, `altitude`, `sensor_id`, `thetax`, `thetay`, `thetaz`

## Current Limitations

### 🚨 Critical Production Gaps

**1. Security**
- ❌ **No authentication system** - Single-user development setup only
- ❌ **No input validation** - Limited CSV format checking
- ❌ **No rate limiting** - API endpoints unprotected
- ❌ **Insecure file uploads** - Basic validation only
- ❌ **Debug mode enabled** - Not production-ready

**2. Scalability Issues**
- ❌ **SQLite database** - Single-user, no concurrent access
- ❌ **File upload limits** - ~100MB maximum, no chunking
- ❌ **Memory limitations** - Large datasets (>50k points) cause performance issues
- ❌ **No background processing** - Training blocks server threads
- ❌ **Single-threaded ML** - No distributed computing support

**3. Data Management**
- ❌ **No data validation** - Limited error handling for malformed CSV
- ❌ **No backup system** - Manual database backup required
- ❌ **No data retention** - Unlimited storage consumption
- ❌ **No audit logging** - No tracking of data access or modifications

**4. Reliability**
- ❌ **No error recovery** - Failed operations require manual cleanup
- ❌ **No monitoring** - No health checks or alerting
- ❌ **Development server** - Django development server not production-ready
- ❌ **No load balancing** - Single point of failure

## Testing Requirements

### 🧪 Comprehensive Testing Needed

**CRITICAL:** This system requires extensive testing before any production deployment.

#### Performance Testing
- [ ] **Small datasets** (< 1,000 points) - Response time < 2 seconds
- [ ] **Medium datasets** (1,000-10,000 points) - Memory usage < 2GB
- [ ] **Large datasets** (> 10,000 points) - Verify decimation works correctly
- [ ] **Concurrent users** - Test multiple simultaneous uploads
- [ ] **Memory stress** - Monitor for memory leaks during extended use

#### Functional Testing  
- [ ] **End-to-end workflow** - Project → Upload → Label → Train → Predict
- [ ] **API endpoints** - All CRUD operations for each model
- [ ] **Error handling** - Invalid data, network failures, timeouts
- [ ] **Browser compatibility** - Chrome, Firefox, Safari, Edge
- [ ] **Data integrity** - Verify annotations persist correctly

#### Security Testing
- [ ] **Input validation** - SQL injection, XSS, file upload attacks
- [ ] **CSRF protection** - Verify all state-changing operations protected
- [ ] **File upload security** - Malicious file upload attempts
- [ ] **API security** - Authentication bypass attempts

#### Data Quality Testing
- [ ] **CSV format variations** - Different timestamp formats, missing columns
- [ ] **Magnetic field ranges** - Extreme values, negative numbers, scientific notation
- [ ] **GPS coordinates** - Invalid lat/lon values, missing location data
- [ ] **Large file handling** - Files approaching 100MB limit

### Test Data Requirements

**Minimum Test Dataset Collection:**
1. **Small datasets** (10-100 points) - Quick validation
2. **Medium datasets** (1,000-5,000 points) - Performance testing  
3. **Large datasets** (10,000+ points) - Stress testing
4. **Anomaly datasets** - Clear patterns for ML validation
5. **Edge case datasets** - Missing values, extreme ranges, malformed data

**Sample data provided:** `example/data_1.csv` (46 points) - Insufficient for comprehensive testing.

## Technical Architecture

### Backend Stack
- **Framework:** Django 4.2 + Django REST Framework
- **Database:** SQLite (development) / PostgreSQL (production required)
- **ML Framework:** Scikit-learn 1.3.2 (TensorFlow optional, often fails)
- **File Processing:** Pandas for CSV parsing and data manipulation

### Frontend Stack  
- **UI:** HTML5 + Vanilla JavaScript + CSS
- **Visualization:** D3.js for interactive magnetic field charts
- **AJAX:** Fetch API for backend communication

### Key Components
```
backend/
├── magtrace_api/               # Main API application
│   ├── models.py              # Database models (Project, Dataset, Annotation)
│   ├── views.py               # API endpoints and business logic
│   ├── simple_training_service.py   # ML training orchestration
│   └── serializers.py         # API data serialization
├── templates/magtrace.html    # Single-page application interface
├── static/js/magtrace.js      # Frontend application logic
└── manage.py                  # Django management commands
```

## Production Deployment Requirements

### 🏭 Production Checklist

**Infrastructure:**
- [ ] **Web Server** - Nginx/Apache with WSGI (Gunicorn/uWSGI)
- [ ] **Database** - PostgreSQL with connection pooling
- [ ] **Caching** - Redis for session storage and API caching
- [ ] **File Storage** - S3/MinIO for uploaded datasets (not local filesystem)
- [ ] **Monitoring** - Application performance monitoring (APM)

**Security Hardening:**
- [ ] **Authentication** - User management system with role-based access
- [ ] **HTTPS** - SSL certificate and secure headers
- [ ] **Input Validation** - Comprehensive data sanitization
- [ ] **Rate Limiting** - API request throttling
- [ ] **File Upload Security** - Virus scanning, type validation

**Scalability:**
- [ ] **Background Jobs** - Celery + Redis for ML training
- [ ] **Load Balancing** - Multiple application instances
- [ ] **Database Scaling** - Read replicas, connection pooling
- [ ] **CDN** - Static file delivery optimization

**Operational:**
- [ ] **Backup Strategy** - Automated database and file backups
- [ ] **Logging** - Structured application and access logs
- [ ] **Monitoring** - Health checks, error tracking, alerting
- [ ] **Deployment Pipeline** - CI/CD with automated testing

## Development Setup

### Prerequisites
- Python 3.8+ (3.10+ recommended)
- 8GB+ RAM (for large dataset processing)
- Modern web browser

### Installation Options

**1. Quick Start (Recommended)**
```bash
python3 run.py  # Automated setup with virtual environment
```

**2. Manual Setup**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Use lightweight requirements (TensorFlow often fails)
pip install -r requirements-lite.txt

python manage.py migrate
python manage.py runserver
```

### Verification
```bash
# Health check
curl http://localhost:8000/health/

# Comprehensive workflow test
python3 test_workflow.py
```

## API Overview

**Core Endpoints:**
- `POST /api/projects/` - Create magnetic field analysis project
- `POST /api/datasets/upload/` - Upload CSV magnetometer data
- `GET /api/datasets/{id}/data/` - Retrieve processed data with decimation
- `POST /api/annotations/` - Create labeled data regions
- `POST /api/training/start/` - Begin ML model training
- `GET /api/training/status/{session_id}/` - Monitor training progress

**Full API Documentation:** [docs/source/api_reference.rst](docs/source/api_reference.rst)

## Known Issues

### 🐛 Current Bugs
- **Training sessions** may hang with very large datasets (>20k points)
- **Browser performance** degrades with >50 annotations on single chart
- **CSV parsing** fails silently with some timestamp formats
- **Memory leaks** in long-running training sessions

### ⚠️ Reliability Issues
- **No graceful failure** handling for interrupted operations
- **Database locks** occur with rapid successive API calls
- **File upload** corrupts with network interruptions
- **Training progress** not recoverable after server restart

## Development Roadmap

### Phase 1: Production Readiness (High Priority)
- [ ] **Authentication system** - User registration, login, permissions
- [ ] **Production database** - PostgreSQL migration and optimization  
- [ ] **Security hardening** - Input validation, rate limiting, HTTPS
- [ ] **Error handling** - Graceful failures and recovery mechanisms
- [ ] **Unit testing** - Comprehensive test suite beyond integration tests

### Phase 2: Scalability (Medium Priority)
- [ ] **Background processing** - Celery task queue for ML training
- [ ] **File chunking** - Large dataset upload support (>100MB)
- [ ] **Data validation** - Robust CSV format checking and sanitization
- [ ] **Performance optimization** - Database query optimization, caching

### Phase 3: Advanced Features (Low Priority)
- [ ] **Model export/import** - Save/load trained models
- [ ] **Batch processing** - Multiple dataset analysis
- [ ] **Advanced ML algorithms** - Deep learning options
- [ ] **Real-time data streaming** - Live magnetometer data processing

## Documentation

**Complete Documentation:** [GitHub Pages](https://manasp21.github.io/MagTrace/docs/index.html)

**Key Resources:**
- [Installation Guide](docs/source/installation.rst) - Setup and troubleshooting
- [Quick Start Tutorial](docs/source/quick_start_tutorial.rst) - 10-minute walkthrough
- [API Reference](docs/source/api_reference.rst) - Complete endpoint documentation
- [Troubleshooting Guide](docs/source/troubleshooting.rst) - Common issues and solutions
- [Testing Results](docs/source/testing_results.rst) - Validation and performance data

## Contributing

**Development Environment:**
```bash
# Fork repository, then:
git clone https://github.com/YOUR_USERNAME/MagTrace.git
cd MagTrace/backend
source venv/bin/activate
pip install -r requirements-lite.txt

# Run tests
python3 test_workflow.py
python manage.py test
```

**Code Standards:**
- Follow Django best practices for backend development
- Use vanilla JavaScript (no framework dependencies) for frontend
- Include docstrings for all new functions and classes
- Add integration tests for new API endpoints

## License & Attribution

**Author:** Manas Pandey  
**Development Assistance:** Claude AI (Anthropic)  
**License:** [Specify license]

---

## ⚠️ Important Notice

**This software is in active development and not ready for production use without significant additional work.**

**For Production Deployment:**
1. Complete comprehensive testing with your specific datasets
2. Implement authentication and security hardening
3. Migrate to production-grade database and infrastructure
4. Add monitoring, logging, and backup systems
5. Conduct security audit and penetration testing

**Use in controlled environments only until production readiness checklist is completed.**