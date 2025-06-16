# 🧲 MagTrace - Advanced Reinforcement Learning Platform

MagTrace is a sophisticated, self-contained ML platform designed for magnetic field data analysis with advanced reinforcement learning capabilities. It provides a complete workflow from data labeling to model deployment with continuous learning and multi-dataset training support.

## ✨ Features

### 🎯 Core Vision
- **Self-contained local application** with no cloud dependencies
- **Reinforcement Learning Platform**: Continuous model improvement through multi-dataset training
- **Advanced ML Workflow**: Data upload → Interactive labeling → Multi-dataset training → Transfer learning → Prediction review
- **Intelligent Model Management**: Versioning, metadata tracking, and smart naming
- **Multi-Label Classification**: Support for overlapping annotations with confidence weighting
- **Human-in-the-Loop ML**: Interactive feedback loops for continuous model improvement
- **Transfer Learning**: Continue training from existing models with new datasets

### 🎨 User Interface
- **Modern web-based interface** with responsive design
- **Interactive D3.js visualizations** with zoom, pan, and brush selection
- **Smart Data Labeling**: Interactive selection with keyboard shortcuts (1-5)
- **Quick Labeling Toolbar**: Predefined categories (Fan Noise, Motor, Normal, Anomaly, Electrical)
- **Multi-view charting**: Time series, components, 3D visualization, magnitude plots
- **Real-time training progress** with live metrics and logs
- **Comprehensive error handling** with user-friendly notifications
- **ACE Editor integration** for Python script editing with syntax highlighting

### 🔧 Advanced ML Capabilities
- **Multi-Dataset Training**: Train models on multiple datasets simultaneously
- **Model Versioning System**: Complete genealogy tracking with parent-child relationships
- **Intelligent Model Naming**: Auto-generated names based on training data and label analysis
- **Transfer Learning**: Continue training from existing models with preserved knowledge
- **Multi-Label Classification**: Support for overlapping labels with confidence weighting
- **Performance Tracking**: Automatic tracking of best metrics across all training sessions
- **Reinforcement Learning**: Continuous model improvement through user feedback loops
- **Advanced Metadata Management**: Tags, categories, training history, and custom metadata

## 🏗️ Technology Stack

- **Backend**: Django 4.2 + Django REST Framework
- **Database**: SQLite with enhanced schema for ML workflows
- **Frontend**: HTML5 + JavaScript + D3.js for interactive visualization
- **ML Framework**: TensorFlow 2.15+ with scikit-learn fallback and transfer learning
- **Model Management**: Advanced versioning, metadata tracking, and performance monitoring
- **Training Orchestration**: Multi-dataset training with real-time progress monitoring
- **Code Editor**: ACE Editor for Python script editing with validation
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

## 🎯 Advanced ML Features

### 🔄 Reinforcement Learning Capabilities

MagTrace now operates as a true reinforcement learning platform with the following key features:

#### **Multi-Dataset Training**
```bash
POST /api/training-sessions/start_training/
{
  "model_id": 1,
  "dataset_id": 2,
  "additional_dataset_ids": [3, 4, 5],
  "training_config": {
    "epochs": 100,
    "learning_rate": 0.001
  }
}
```

#### **Transfer Learning & Model Continuation**
```bash
POST /api/training-sessions/start_training/
{
  "model_id": 1,
  "dataset_id": 2,
  "continue_from_session": 15,
  "training_config": {
    "epochs": 50
  }
}
```

#### **Intelligent Model Management**
```bash
# Generate smart model names
POST /api/user-models/generate_intelligent_name/
{
  "dataset_ids": [1, 2, 3],
  "model_type": "classification"
}
# Returns: "anomaly_detector_multi_dataset_large"

# Create model versions
POST /api/user-models/1/create_version/
{
  "version": "2.0",
  "version_notes": "Added multi-dataset training"
}

# Clone models
POST /api/user-models/1/clone/
{
  "new_name": "Enhanced Classifier",
  "include_training_data": true
}
```

#### **Advanced Metadata Management**
```bash
PATCH /api/user-models/1/update_metadata/
{
  "tags": ["classification", "multi-dataset", "production"],
  "category": "Anomaly Detection",
  "author": "Data Scientist",
  "custom_metadata": {
    "performance_target": 0.95,
    "deployment_ready": true
  }
}
```

### 🧠 Multi-Label Classification

MagTrace supports sophisticated labeling scenarios:

- **Overlapping Annotations**: Multiple labels can be applied to the same data points
- **Confidence Weighting**: Each annotation includes confidence scores for better training
- **Hierarchical Labels**: Parent-child relationships between label categories
- **Smart Detection**: Automatic detection of single vs multi-label classification needs

### 📊 Performance Tracking & Analytics

Every model maintains comprehensive performance history:

- **Best Metrics Tracking**: Automatically tracks best performance across all training sessions
- **Training Lineage**: Complete history of datasets used in training
- **Performance Evolution**: Track improvement over multiple training rounds
- **Session Comparison**: Compare performance across different training configurations

### 🔄 Continuous Learning Workflow

1. **Initial Training**: Train model on initial dataset with interactive labeling
2. **Performance Evaluation**: Review predictions and provide feedback
3. **Incremental Learning**: Add new datasets and continue training
4. **Knowledge Preservation**: Transfer learning maintains existing knowledge
5. **Performance Optimization**: System automatically tracks and preserves best models
6. **Human Feedback Integration**: User corrections directly improve model performance

## 📱 Enhanced ML Workflow

### 1. Project & Model Management
- **Intelligent Project Organization**: Complete project lifecycle with enhanced metadata
- **Advanced Model Versioning**: Parent-child relationships with automatic version increment
- **Smart Model Naming**: Auto-generated names based on training data and label analysis
- **Model Genealogy Tracking**: Complete evolution history with performance metrics
- **Export/Import**: Full project state preservation with model lineage

### 2. Multi-Dataset Training
- **Dataset Aggregation**: Train on multiple datasets simultaneously for better generalization
- **Progressive Learning**: Add new datasets to existing models without losing knowledge
- **Transfer Learning**: Continue training from pre-trained models with new data
- **Training Lineage**: Complete tracking of all datasets used in model training
- **Performance Optimization**: Automatic identification and preservation of best-performing models

### 3. Advanced Interactive Labeling
- **Multi-Label Support**: Handle overlapping annotations with confidence weighting
- **Smart Label Detection**: Automatic detection of single vs multi-label scenarios
- **Visual Selection Tools**: D3.js brush selection with real-time feedback
- **Quick Labeling System**: Keyboard shortcuts (1-5) for rapid annotation
- **Hierarchical Categories**: Parent-child label relationships with inheritance
- **Confidence Scoring**: Weight annotations by confidence for better training

### 4. Intelligent Model Configuration
- **Context-Aware Templates**: Model templates optimized for magnetic field analysis
- **Automated Hyperparameter Suggestions**: Smart defaults based on data characteristics
- **Script Validation & Templates**: Comprehensive Python script validation with templates
- **Model Metadata Management**: Tags, categories, author tracking, and custom metadata

### 5. Advanced Training & Monitoring
- **Real-Time Progress Tracking**: Live metrics, logs, and epoch-by-epoch monitoring
- **Multi-Dataset Training**: Combine multiple datasets in single training sessions
- **Continued Training**: Resume from existing models with preserved weights
- **Performance Analytics**: Track best metrics across all training sessions
- **Training Session Management**: Start, stop, resume, and cancel with full control

### 6. Reinforcement Learning Workflow
- **Human-in-the-Loop**: User feedback directly improves model performance
- **Prediction Review**: Accept/reject/modify predictions to create training data
- **Continuous Improvement**: Models evolve through iterative training cycles
- **Performance Tracking**: Monitor improvement over multiple training rounds
- **Knowledge Preservation**: Transfer learning maintains existing knowledge while adapting

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
- **Advanced ML Architecture**: Complete reinforcement learning platform
- **Multi-Dataset Training**: Train models on multiple datasets simultaneously
- **Model Versioning System**: Full genealogy tracking with metadata management
- **Transfer Learning**: Continue training from existing models with preserved knowledge
- **Multi-Label Classification**: Overlapping annotations with confidence weighting
- **Intelligent Model Naming**: Context-aware naming based on training data analysis
- **Performance Tracking**: Automatic best-metrics tracking across training sessions
- **Interactive Labeling**: Advanced brush selection with real-time feedback
- **Human-in-the-Loop**: Prediction review workflow feeding back into training
- **Enhanced API**: Comprehensive endpoints for advanced ML workflows
- **Real-Time Monitoring**: Live training progress with detailed metrics
- **Clean Architecture**: Streamlined codebase with single-server deployment

### In Progress 🔄
- End-to-end testing of reinforcement learning workflows
- Performance optimization for multi-dataset training
- Advanced model comparison and analytics features

### Planned 📅
- **Advanced Analytics**: Model performance comparison and evolution tracking
- **Batch Processing**: Large-scale dataset processing with distributed training
- **Model Ensemble**: Combine multiple models for improved performance
- **Advanced Export**: Labeled datasets and model artifacts export
- **Enhanced Visualization**: 3D interactive controls and advanced chart types
- **Auto-Labeling**: AI-assisted labeling suggestions based on model predictions

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