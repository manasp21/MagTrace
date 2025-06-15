# 🧲 MagTrace Pro - Complete ML Workflow Platform

MagTrace Pro is a self-contained, locally run application designed to provide a complete end-to-end workflow for creating custom Machine Learning models for magnetic field data analysis.

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
- **Multi-view charting**: Time series, components, 3D visualization, magnitude plots
- **Real-time training progress** with live metrics and logs
- **Comprehensive error handling** with user-friendly notifications
- **ACE Editor integration** for Python script editing with syntax highlighting

### 🔧 Technical Capabilities
- **Project-based organization** with complete export/import functionality
- **Enhanced database schema** with hierarchical label categories
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
   # Quick start (recommended) - runs both backend and frontend
   python run.py
   
   # Or manual start:
   # Terminal 1: Backend
   cd backend && python manage.py runserver
   
   # Terminal 2: Frontend (in project root)
   python3 -m http.server 3000
   ```

5. **Access the application**
   - **Main Application**: http://localhost:3000/magtrace_pro.html
   - **Backend API**: http://localhost:8000/api
   - **Admin Panel**: http://localhost:8000/admin

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
- Visual data selection with brush tools
- Hierarchical label category system
- Manual annotation with confidence scores
- Bulk annotation operations

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
│   ├── requirements.txt       # Python dependencies
│   └── manage.py             # Django management
├── js/                        # Frontend JavaScript
│   └── magtrace-pro.js       # Main application logic
├── magtrace_pro.html         # Main application interface
├── example/                   # Sample data files
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

**Frontend Not Loading**
- Ensure you're accessing http://localhost:3000/magtrace_pro.html
- Check that both backend (port 8000) and frontend (port 3000) are running

**CORS Issues**
- Backend includes CORS headers for local development
- Ensure backend is running on localhost:8000

## 📋 Current Status & Roadmap

### Fully Implemented ✅
- **Enhanced Database Models**: Complete schema with Project, Dataset, UserDefinedModel, TrainingSession, etc.
- **Complete Backend API**: Django REST Framework with all ViewSets (Project, Dataset, UserDefinedModel, etc.)
- **Service Layer**: Project management, training orchestration, and user script services
- **Frontend Application**: Complete HTML5/JS interface with D3.js visualizations
- **Model Templates**: Built-in templates for Classification, Autoencoder, Transformer models
- **Training Orchestration**: Real-time progress monitoring and session management
- **Prediction Workflow**: Accept/reject/modify predictions with review capabilities
- **Project Management**: Complete save/load with ZIP export/import functionality
- **Interactive Labeling**: Hierarchical annotation system with confidence scores
- **Multi-view Visualization**: Time series, components, 3D, and magnitude charts
- **Script Editor**: ACE Editor integration with syntax highlighting and validation

### Remaining Tasks 🔄
- **Database Migration Setup**: Generate and apply migrations for enhanced models
- **End-to-End Testing**: Complete workflow testing (upload → annotate → train → predict)
- **Production Deployment**: Environment setup and configuration validation

### Future Enhancements 📅
- **Performance Optimization**: Large dataset handling improvements
- **Advanced Export**: Enhanced data export formats
- **Batch Processing**: Multiple dataset processing capabilities
- **Enhanced 3D Visualization**: Improved spatial data rendering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for magnetic field data analysis research
- Designed for ease of use by domain experts
- Optimized for local deployment and data privacy

---

**MagTrace Pro** - Empowering magnetic field analysis with intelligent machine learning workflows 🧲✨