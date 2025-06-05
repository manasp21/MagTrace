# MagTrace - Magnetic Field Data Analysis Platform

![MagTrace Screenshot](./screenshot.png)

MagTrace is a comprehensive platform for visualizing, annotating, and analyzing magnetic field data using machine learning.

## Features

### Frontend
- Magnetic field data visualization with Chart.js
- Time-series annotation tools
- ML model creation and training interface
- Model application and evaluation
- Project management

### Backend (Django REST API)
- Data persistence with SQLite
- TensorFlow/PyTorch model execution
- Async task processing with Celery
- RESTful API endpoints

## Installation

### Prerequisites
- Node.js (for frontend)
- Python 3.8+ (for backend)
- Redis (for Celery task queue)

### Setup
1. Clone the repository:
```bash
git clone https://github.com/yourusername/MagTrace.git
cd MagTrace
```

2. Frontend setup:
```bash
# Install http-server for frontend
npm install -g http-server
```

3. Backend setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate    # Windows
pip install -r requirements.txt
python manage.py migrate
```

## Running the Application

1. Start Redis service
2. Start backend:
```bash
cd backend
celery -A django_magtrace worker -l info & python manage.py runserver
```

3. Start frontend:
```bash
http-server -p 3000
```

4. Access the application at `http://localhost:3000`

## API Documentation

The backend API is available at `http://localhost:8000/api/` with these endpoints:

- `GET /api/datasets/` - List datasets
- `POST /api/datasets/` - Create new dataset
- `GET /api/models/` - List ML models
- `POST /api/models/train/` - Train new model
- `POST /api/models/predict/` - Run prediction

See [API Documentation](backend/API_DOCS.md) for details.

## Project Structure

```
MagTrace/
├── frontend/                  # Frontend application
│   ├── src/                   # Source files
│   ├── index.html             # Main entry point
│   └── ...                    # Other frontend files
├── backend/                   # Django backend
│   ├── django_magtrace/       # Project configuration
│   ├── magtrace_api/          # Main app
│   ├── manage.py              # Django CLI
│   └── ...                    # Other backend files
├── example/                   # Sample datasets
├── scripts/                   # Utility scripts
└── README.md                  # This file
```

## Machine Learning Integration

MagTrace supports:
- TensorFlow models via `tf_adapter.py`
- PyTorch models via `torch_adapter.py`
- Custom model training and prediction
- Async execution with progress tracking

## Contributing
Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License
This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.