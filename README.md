# 🧲 MagTrace - Complete ML Workflow Platform

MagTrace is a self-contained, locally run application designed to provide a complete end-to-end workflow for creating custom Machine Learning models for magnetic field data analysis.

## ✨ Features

### 🎯 Original Vision
- **Self-contained local application** with no cloud dependencies
- **Complete ML workflow**: Data upload → Visualization → Manual labeling → Model training → Prediction → Review
- **User-defined TensorFlow models** through GUI with custom Python script integration
- **Sophisticated hierarchical annotation system** supporting overlapping labels
- **Local training orchestration** with real-time progress monitoring
- **Project save/load functionality** with complete state preservation
- **Prediction review and modification workflow** for human-in-the-loop ML

### 🎨 User Interface
- **Modern web-based interface** with responsive design
- **Interactive D3.js visualizations** with zoom, pan, and brush selection
- **Smart Data Labeling**: Interactive selection with keyboard shortcuts (1-5)
- **Quick Labeling Toolbar**: Predefined categories (Fan Noise, Motor, Normal, Anomaly, Electrical)
- **Multi-view charting**: Time series, components, 3D visualization, magnitude plots
- **Real-time training progress** with live metrics and logs
- **Comprehensive error handling** with user-friendly notifications
- **ACE Editor integration** for Python script editing with syntax highlighting

### 🔧 Technical Capabilities
- **Project-based organization** with complete export/import functionality
- **Enhanced database schema** with hierarchical label categories
- **Interactive data labeling** with brush selection and visual feedback
- **Advanced prediction workflow** with accept/reject/modify capabilities
- **Template system** for common magnetic field analysis models
- **Script validation** and template generation
- **Training session management** with real-time progress tracking

## 🏗️ Technology Stack

- **Backend**: Django 4.2 + Django REST Framework
- **Database**: SQLite (local file-based)
- **Frontend**: HTML5 + JavaScript + D3.js for visualization
- **ML Framework**: TensorFlow 2.15+ with scikit-learn fallback
- **Code Editor**: ACE Editor for Python script editing
- **Data Format**: CSV files with magnetic field measurements

## 📊 Data Format

CSV files must contain the following columns:
```
timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,thetax,thetay,thetaz,sensor_id
```

Where:
- `timestamp_pc`: Timestamp of measurement
- `b_x`, `b_y`, `b_z`: Magnetic field components (in nanoTesla)
- `lat`, `lon`: Geographic coordinates (decimal degrees)
- `altitude`: Elevation in meters
- `thetax`, `thetay`, `thetaz`: Orientation angles (degrees)
- `sensor_id`: Unique sensor identifier

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js (for development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/MagTrace.git
   cd MagTrace
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   # If TensorFlow fails, use: pip install -r requirements-lite.txt
   ```

3. **Initialize database**
   ```bash
   python manage.py makemigrations magtrace_api
   python manage.py migrate
   python manage.py createsuperuser  # Optional
   ```

4. **Start the application**
   ```bash
   # Quick start (recommended) - integrated Django server
   python run.py
   
   # Or manual start:
   cd backend && python manage.py runserver
   ```

5. **Access the application**
   - **🏠 Landing Page**: http://localhost:8000/
   - **🧲 MagTrace App**: http://localhost:8000/app/
   - **📊 Backend API**: http://localhost:8000/api/
   - **⚙️ Admin Panel**: http://localhost:8000/admin/

## 📱 Usage Workflow

### 1. Project Management
- Create a new project or load existing project
- Projects can be exported as ZIP files for sharing
- Complete project state preservation including models and annotations

### 2. Data Upload
- Upload CSV files with magnetic field measurements
- Automatic data validation and processing
- Real-time statistics and data quality checks

### 3. Interactive Labeling
- **Visual data selection** with D3.js brush tools
- **Quick labeling system** with keyboard shortcuts (1-5)
- **Predefined categories**: Fan Noise, Motor Interference, Normal, Anomaly, Electrical Noise
- **Real-time feedback** with selection stats and visual overlays
- **Hierarchical label category system** with parent-child relationships
- **Manual annotation** with confidence scores and custom notes
- **Bulk annotation operations** for efficient labeling workflow

### 4. Model Configuration
- Choose from built-in model templates (Classification, Autoencoder, Transformer, etc.)
- Custom TensorFlow model definition with Python scripts
- Hyperparameter configuration with validation
- Script editor with syntax highlighting and error checking

### 5. Training & Monitoring
- Real-time training progress with live metrics
- Training session management (start, stop, resume)
- Training logs and error handling
- Model performance tracking

### 6. Prediction & Review
- Generate predictions on new datasets
- Interactive prediction review (accept/reject/modify)
- Prediction confidence visualization
- Convert predictions to annotations for retraining

## 📁 Project Structure

```
MagTrace/
├── backend/                    # Django backend
│   ├── django_magtrace/       # Django project settings
│   ├── magtrace_api/          # Main API application
│   │   ├── models.py          # Enhanced database models
│   │   ├── views.py           # API ViewSets
│   │   ├── serializers.py     # REST API serializers
│   │   ├── urls.py            # URL routing
│   │   ├── project_service.py # Project management service
│   │   ├── training_service.py# Training orchestration
│   │   └── user_script_service.py # Script validation
│   ├── static/js/             # Frontend JavaScript
│   │   └── magtrace-pro.js   # Main application logic
│   ├── templates/             # Django templates
│   │   ├── magtrace_pro.html # Main application interface
│   │   └── landing.html      # Landing page
│   ├── requirements.txt       # Python dependencies
│   └── manage.py             # Django management
├── example/                   # Sample data files
├── run.py                    # Application launcher
├── README.md                 # This file
├── CLAUDE.md                 # Development documentation
└── .gitattributes           # Git line ending configuration
```

## 🔧 Development

### Backend Development
- Django 4.2 with REST Framework
- SQLite database for local storage
- Comprehensive API with ViewSets
- Real-time training progress tracking

### Frontend Development
- Modern JavaScript (ES6+)
- D3.js for interactive visualizations
- ACE Editor for code editing
- Responsive CSS design

### Adding New Model Templates
1. Update `user_script_service.py` with new template
2. Add template option to frontend model configuration
3. Test template generation and validation

## 🐛 Troubleshooting

### Common Issues

**Database Migration Errors**
```bash
cd backend
python manage.py makemigrations magtrace_api --name initial_enhanced_schema
python manage.py migrate
```

**TensorFlow Installation Issues**
```bash
# Use the lite requirements if TensorFlow fails
pip install -r requirements-lite.txt
```

**Application Not Loading**
- Ensure you're accessing http://localhost:8000/app/
- Check that the Django server is running on port 8000
- Verify the database migrations are complete

**CORS Issues**
- No longer applicable - frontend and backend are served from the same server

## 📋 Roadmap

### Completed ✅
- Enhanced database schema with project-based organization
- Complete API overhaul with REST framework
- Interactive annotation system with D3.js brush selection
- Advanced visualization with multiple chart views
- Smart labeling system with keyboard shortcuts and quick toolbar
- Prediction workflow with review capabilities
- Enhanced model template system
- Comprehensive error handling
- Clean, streamlined codebase architecture
- Single-server deployment with Django

### In Progress 🔄
- End-to-end testing with new labeling features
- Performance optimizations
- ML backend architecture validation

### Planned 📅
- Export functionality for labeled datasets
- Advanced model templates for magnetic field analysis
- Batch processing capabilities for large datasets
- Enhanced 3D visualization with interactive controls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built for magnetic field data analysis research
- Designed for ease of use by domain experts
- Optimized for local deployment and data privacy

---

**MagTrace** - Empowering magnetic field analysis with intelligent machine learning workflows 🧲✨