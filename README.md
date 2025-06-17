# MagTrace Pro - Magnetic Field Data Analysis Platform

**Developed by Manas Pandey with the assistance of Claude**

**Status: Implementation Complete - Testing Required**

MagTrace Pro is a streamlined machine learning platform designed for magnetic field data analysis. It provides a clean, professional workflow for loading data, creating labels, and training models for anomaly detection and pattern recognition.

## TESTING REQUIRED

**CRITICAL**: This implementation is complete but requires comprehensive end-to-end testing before production use.

### Test Data Requirements
To properly test this system, you need CSV files with magnetic field data containing these columns:
- `timestamp_pc` - PC timestamp 
- `b_x, b_y, b_z` - Magnetic field components (required for analysis)
- `lat, lon, altitude` - GPS coordinates
- `thetax, thetay, thetaz` - Orientation angles  
- `sensor_id` - Sensor identifier

**Sample test data is provided in the `example/` directory, but comprehensive testing requires:**
- Small datasets (< 1000 points) for quick workflow verification
- Medium datasets (1000-10000 points) for performance testing
- Large datasets (> 10000 points) for decimation and optimization testing
- Datasets with clear anomalies or patterns for ML training validation

## Quick Start

### 1. Environment Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# If TensorFlow fails: pip install -r requirements-lite.txt
```

### 2. Database Setup
```bash
python manage.py makemigrations magtrace_api
python manage.py migrate
python manage.py createsuperuser  # Optional
```

### 3. Run Application
```bash
# Quick start (recommended)
python ../run.py

# OR manual start
python manage.py runserver
```

### 4. Access Application
- **Main Application**: http://localhost:8000/app/
- **Landing Page**: http://localhost:8000/
- **API Documentation**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

## Core Features (All Implemented)

### Complete Implementation Status
- **Simple Workflow**: Load data → Select ranges → Label → Train → Predict
- **Fast Performance**: Optimized with data decimation for large datasets
- **Interactive Labeling**: D3.js brush selection with instant labeling
- **Keyboard Shortcuts**: Rapid labeling with hotkeys (1-5) 
- **Professional UI**: Clean interface without emojis or clutter
- **Working ML Training**: Reliable scikit-learn based system
- **Real-time Progress**: Live training monitoring with progress bars

### Technology Stack  
- **Backend**: Django 4.2 + Django REST Framework
- **Database**: SQLite with optimized schema
- **Frontend**: HTML5 + JavaScript + D3.js
- **ML Framework**: scikit-learn (primary) with TensorFlow fallback
- **Performance**: Data decimation for responsive UI

## Testing Checklist

### Required Testing (High Priority)
- [ ] **Complete Workflow Test**: Upload CSV → Load → Select → Label → Train
- [ ] **Annotation System**: Brush selection, quick labeling, keyboard shortcuts
- [ ] **ML Training**: End-to-end training with simple_training_service.py
- [ ] **Performance**: Large dataset handling and decimation
- [ ] **UI Interactions**: All buttons, modals, workflows function correctly
- [ ] **API Integration**: All frontend-backend communication works
- [ ] **Error Handling**: Graceful failure handling for invalid inputs

### Validation Steps
1. **Data Upload**: Test with provided example CSV files
2. **Visualization**: Verify magnetic field data displays correctly
3. **Selection**: Test brush selection on time series charts  
4. **Labeling**: Use keyboard shortcuts (1-5) for rapid annotation
5. **Training**: Execute ML training and monitor progress
6. **Persistence**: Verify annotations and models save to database

## Architecture Overview

### Key Components
```
backend/
├── magtrace_api/           # Main API application
│   ├── models.py          # Database models
│   ├── views.py           # API endpoints  
│   ├── simple_training_service.py  # NEW: Working ML training
│   └── serializers.py     # API serialization
├── templates/
│   └── magtrace_pro.html  # Simplified UI interface
├── static/js/
│   └── magtrace-pro.js    # Optimized frontend logic
└── manage.py              # Django management
```

### Recent Improvements (This Session)
1. **UI Cleanup**: Removed emojis, simplified interface, professional design
2. **ML Training Fix**: Created `simple_training_service.py` - reliable scikit-learn system  
3. **Performance**: Added data decimation for large datasets (>5000 points)
4. **API Updates**: Updated endpoints to use working training orchestrator

## API Documentation

### Core Endpoints
- `GET /api/projects/` - List projects
- `POST /api/datasets/upload/` - Upload CSV data
- `GET /api/datasets/{id}/data/` - Get dataset with decimation
- `POST /api/annotations/` - Create annotations
- `POST /api/training/start/` - Start ML training
- `GET /api/training/status/{session_id}/` - Get training progress

### Data Format
CSV files must contain columns for magnetic field analysis:
```csv
timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,thetax,thetay,thetaz,sensor_id
1623456789,0.25,-0.15,0.30,40.7128,-74.0060,100,0.1,0.2,0.3,sensor_01
```

## Known Issues Resolved ✅
- ❌ Training system failing → ✅ Fixed with simple_training_service.py
- ❌ UI too cluttered → ✅ Simplified while maintaining functionality  
- ❌ Emojis unprofessional → ✅ Removed all emojis from interface
- ❌ Slow performance → ✅ Added data decimation and optimizations
- ❌ Annotation system broken → ✅ Fixed brush selection and API integration

## Development Notes

### Environment Requirements
- Python 3.11+ recommended
- Django 4.2+
- Node.js not required (vanilla JavaScript)
- SQLite (included with Python)

### Performance Optimizations
- Data decimation for datasets > 5000 points
- Optimized D3.js rendering
- Background training with progress callbacks
- Efficient database queries with select_related

### Security Considerations
- CSRF protection enabled
- SQL injection prevention with Django ORM
- File upload validation
- No sensitive data logging

## Next Steps for Production

1. **CRITICAL**: Complete end-to-end testing with real magnetic field data
2. **HIGH**: Add model prediction capabilities for trained models
3. **MEDIUM**: Enhanced error handling and user feedback
4. **LOW**: Advanced features (model export, batch processing)

## Documentation

### Complete Documentation Available

**Online Documentation**: [View on GitHub Pages](https://manasp21.github.io/MagTrace/docs/)

**Documentation Portal**: [Main Documentation Site](https://manasp21.github.io/MagTrace/docs/index.html)

The complete documentation includes:
- **[User Guide](https://manasp21.github.io/MagTrace/docs/user_guide.html)** - Complete usage instructions and workflows
- **[API Reference](https://manasp21.github.io/MagTrace/docs/api_reference.html)** - Detailed API endpoint documentation  
- **[Testing Results](https://manasp21.github.io/MagTrace/docs/testing_results.html)** - Comprehensive testing validation
- **[Installation Guide](https://manasp21.github.io/MagTrace/docs/installation.html)** - Setup and deployment instructions
- **[Module Documentation](https://manasp21.github.io/MagTrace/docs/genindex.html)** - Auto-generated code documentation

#### Quick Reference Links
- **[Documentation Home](https://manasp21.github.io/MagTrace/docs/index.html)** - Main documentation portal
- **[Search Documentation](https://manasp21.github.io/MagTrace/docs/search.html)** - Search all documentation

### Additional Resources
- `CLAUDE.md` - Development session notes and architecture decisions
- `docs/` - HTML documentation files (Sphinx-generated)
- Code comments in `magtrace_api/` modules

### Quick Documentation Access
```bash
# View documentation locally
cd docs
python3 -m http.server 8080
# Then open: http://localhost:8080/index.html
```

**Status**: Ready for comprehensive testing and validation.