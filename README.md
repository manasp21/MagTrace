# MagTrace - Magnetic Field Analysis Platform

MagTrace is a comprehensive platform for magnetic field data analysis, interactive labeling, and machine learning-based anomaly detection. The system combines data visualization, ML-assisted annotation, and real-time classification capabilities for magnetometer data analysis.

## Features

### 🔍 Data Analysis
- CSV data ingestion and validation
- Real-time magnetic field visualization using D3.js
- Time-series, geographic, and statistical analysis views
- Interactive data exploration and selection tools

### 🏷️ Interactive Labeling
- Visual selection tools (brush, lasso, polygon)
- Multiple label types (anomaly, normal, noise, interference)
- Label management with version control
- Collaborative annotation capabilities

### 🤖 Machine Learning
- TensorFlow-based anomaly detection models
- Supervised classification for labeled data
- Active learning for efficient annotation
- Model training, validation, and management

### ⚡ Real-time Processing
- Batch processing of large datasets
- Real-time inference on new data
- Background task processing with Celery
- Model-assisted labeling suggestions

## Technology Stack

- **Frontend**: HTML5, JavaScript (ES6+), D3.js for visualization
- **Backend**: Django 4.2 with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **ML Framework**: TensorFlow 2.15, scikit-learn
- **Task Queue**: Celery with Redis
- **Data Processing**: Pandas, NumPy

## Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js (optional, for development)
- Redis (for background tasks)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MagTrace
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Set up the database**
   ```bash
   cd backend
   python manage.py migrate
   python manage.py createsuperuser  # Optional: create admin user
   ```

4. **Start Redis server** (for background tasks)
   ```bash
   redis-server
   ```

### Running the Application

#### Option 1: Quick Start (Recommended)
```bash
python run.py
```

This will start both the backend and frontend servers:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin

#### Option 2: Manual Start

1. **Start the Django backend**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start Celery worker** (in another terminal)
   ```bash
   cd backend
   celery -A django_magtrace worker --loglevel=info
   ```

3. **Serve the frontend**
   ```bash
   # Simple HTTP server for frontend
   python -m http.server 3000
   ```

## Data Format

MagTrace expects CSV files with the following columns:

```csv
timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,thetax,thetay,thetaz,sensor_id
24:40.0,7746.664,9395.448,14682.022,26.5123251,80.2238068,2018,0,0,0,S963350075783_20250605_112438
```

### Column Descriptions
- `timestamp_pc`: Timestamp of measurement
- `b_x`, `b_y`, `b_z`: Magnetic field components (nanoTesla)
- `lat`, `lon`: Geographic coordinates (decimal degrees)
- `altitude`: Elevation in meters
- `thetax`, `thetay`, `thetaz`: Sensor orientation angles
- `sensor_id`: Unique identifier for the sensor

## Usage Guide

### 1. Data Upload
- Click "Upload CSV Data" to load magnetometer data
- Data is automatically processed and validated
- View dataset statistics and basic information

### 2. Data Visualization
- **Time Series**: View magnetic field components over time
- **Geographic**: Plot data points on geographic coordinates
- **3D Field**: Visualize magnetic field vectors (coming soon)
- **Statistics**: View detailed statistical analysis

### 3. Interactive Labeling
- Select labeling tool: Brush, Lasso, or Polygon
- Choose label type: Anomaly, Normal, Noise, or Interference
- Select data regions and apply labels
- Edit, delete, or duplicate existing labels

### 4. Machine Learning
- Train anomaly detection or classification models
- Use active learning for efficient labeling
- Run inference on new datasets
- Apply model predictions as labels

### 5. Active Learning
- Review ML-generated labeling suggestions
- Accept or reject suggestions to improve models
- Iteratively refine model performance

## API Endpoints

### Datasets
- `GET /api/datasets/` - List all datasets
- `POST /api/datasets/upload/` - Upload new dataset
- `GET /api/datasets/{id}/data/` - Get dataset readings
- `GET /api/datasets/{id}/statistics/` - Get dataset statistics

### Labels
- `GET /api/labels/` - List labels
- `POST /api/labels/` - Create new label
- `PUT /api/labels/{id}/` - Update label
- `DELETE /api/labels/{id}/` - Delete label

### Models
- `GET /api/models/` - List ML models
- `POST /api/models/train/` - Train new model
- `POST /api/models/{id}/set_active/` - Set model as active

### Inference
- `POST /api/inference/run_inference/` - Run inference on dataset

### Suggestions
- `GET /api/suggestions/` - Get active learning suggestions
- `POST /api/suggestions/{id}/accept/` - Accept suggestion
- `POST /api/suggestions/{id}/reject/` - Reject suggestion

## Development

### Project Structure
```
MagTrace/
├── backend/                 # Django backend
│   ├── django_magtrace/    # Django project settings
│   ├── magtrace_api/       # Main API application
│   ├── manage.py           # Django management script
│   ├── ml_service.py       # Machine learning services
│   └── requirements.txt    # Python dependencies
├── frontend/               # Frontend assets
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   └── index.html         # Main HTML file
├── example/               # Sample data
│   └── data_1.csv         # Example dataset
├── CLAUDE.md              # AI assistant guidance
├── plan.md                # Project architecture plan
├── run.py                 # Application launcher
└── README.md              # This file
```

### Key Components

#### Backend (Django)
- **Models**: Dataset, MagnetometerReading, Label, MLModel, InferenceResult
- **Views**: RESTful API endpoints for all operations
- **ML Service**: TensorFlow integration for model training and inference
- **Celery Tasks**: Background processing for ML operations

#### Frontend (JavaScript)
- **API Service**: Communication with backend API
- **Data Loader**: Dataset management and loading
- **Visualizations**: D3.js-based interactive charts
- **Labeling Tools**: Interactive selection and annotation
- **Model Manager**: ML model training and inference interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Include sample data and error messages if applicable

## Acknowledgments

- TensorFlow team for the ML framework
- D3.js for visualization capabilities
- Django community for the web framework
- Scientific Python ecosystem (NumPy, Pandas, scikit-learn)