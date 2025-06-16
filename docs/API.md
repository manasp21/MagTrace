# MagTrace Pro API Documentation

## Base URL
All API endpoints are relative to: `http://localhost:8000/api/`

## Authentication
Currently no authentication required for local development.

## Core Endpoints

### Projects API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects/` | List all projects |
| `POST` | `/projects/` | Create new project |
| `GET` | `/projects/{id}/` | Get project details |
| `PUT` | `/projects/{id}/` | Update project |
| `DELETE` | `/projects/{id}/` | Delete project |

**Example Project Creation:**
```json
POST /api/projects/
{
  "name": "Magnetic Anomaly Detection",
  "description": "Analysis of magnetic field anomalies in industrial equipment"
}
```

### Datasets API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/datasets/` | List datasets |
| `POST` | `/datasets/upload/` | Upload CSV file |
| `GET` | `/datasets/{id}/` | Get dataset details |
| `GET` | `/datasets/{id}/data/` | Get magnetic readings |

**CSV Upload:**
```bash
curl -X POST http://localhost:8000/api/datasets/upload/ \
  -F "file=@magnetic_data.csv" \
  -F "name=Test Dataset" \
  -F "project=1"
```

### Annotations API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/annotations/` | List annotations |
| `POST` | `/annotations/` | Create annotation |
| `PUT` | `/annotations/{id}/` | Update annotation |
| `DELETE` | `/annotations/{id}/` | Delete annotation |

**Create Annotation:**
```json
POST /api/annotations/
{
  "dataset": 1,
  "category": 2,
  "start_index": 100,
  "end_index": 200,
  "confidence": 0.9,
  "notes": "Clear fan noise pattern"
}
```

### Training API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/training-sessions/start_training/` | Start model training |
| `GET` | `/training-sessions/{id}/status/` | Get training status |
| `POST` | `/training-sessions/{id}/stop_training/` | Stop training |

**Start Training:**
```json
POST /api/training-sessions/start_training/
{
  "model_id": 1,
  "dataset_id": 1,
  "training_config": {
    "epochs": 5,
    "learning_rate": 0.001
  }
}
```

## Data Models

### Project
```json
{
  "id": 1,
  "name": "Project Name",
  "description": "Project description",
  "created_at": "2025-06-16T10:00:00Z"
}
```

### Dataset
```json
{
  "id": 1,
  "name": "Dataset Name",
  "file": "/media/datasets/data.csv",
  "total_records": 10000,
  "processed": true,
  "project": 1
}
```

### Annotation
```json
{
  "id": 1,
  "dataset": 1,
  "category": 2,
  "start_index": 100,
  "end_index": 200,
  "confidence": 0.9,
  "notes": "Pattern description",
  "created_at": "2025-06-16T10:00:00Z"
}
```

## Error Responses

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Format
```json
{
  "error": "Description of the error",
  "details": {
    "field": ["Field-specific error message"]
  }
}
```