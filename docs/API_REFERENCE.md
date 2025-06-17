# MagTrace Pro API Reference

**Author: Manas Pandey**  
*Developed with the assistance of Claude*

## Overview
Complete API documentation for MagTrace Pro magnetic field data analysis platform.

## Base URL
```
http://localhost:8000/api/
```

## Authentication
Currently using Django session authentication. CSRF tokens required for POST requests.

## Core API Endpoints

### Projects Management

#### List Projects
```http
GET /api/projects/
```
**Response:**
```json
[
  {
    "id": 1,
    "name": "Magnetic Survey 2024",
    "description": "Field survey data analysis",
    "created_at": "2024-06-17T10:00:00Z"
  }
]
```

#### Create Project
```http
POST /api/projects/
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description"
}
```

### Dataset Management

#### Upload Dataset
```http
POST /api/datasets/upload/
Content-Type: multipart/form-data

file: [CSV file]
project_id: 1
```

**CSV Format Required:**
```csv
timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,thetax,thetay,thetaz,sensor_id
1623456789,0.25,-0.15,0.30,40.7128,-74.0060,100,0.1,0.2,0.3,sensor_01
```

#### Get Dataset Data
```http
GET /api/datasets/{id}/data/
```

**Query Parameters:**
- `decimation_factor` (optional): Data reduction factor for large datasets
- `start_time` (optional): Filter start time
- `end_time` (optional): Filter end time

**Response:**
```json
{
  "data": [
    {
      "timestamp_pc": 1623456789,
      "b_x": 0.25,
      "b_y": -0.15,
      "b_z": 0.30,
      "lat": 40.7128,
      "lon": -74.0060,
      "altitude": 100
    }
  ],
  "decimated": false,
  "original_count": 5000,
  "returned_count": 5000
}
```

### Annotation System

#### Create Annotation
```http
POST /api/annotations/
Content-Type: application/json

{
  "dataset": 1,
  "start_time": 1623456789,
  "end_time": 1623456899,
  "label": "anomaly",
  "confidence": 0.95,
  "notes": "Magnetic disturbance detected"
}
```

#### List Annotations
```http
GET /api/annotations/?dataset={dataset_id}
```

#### Update Annotation
```http
PUT /api/annotations/{id}/
Content-Type: application/json

{
  "label": "normal",
  "confidence": 0.8,
  "notes": "Reviewed - false positive"
}
```

#### Delete Annotation
```http
DELETE /api/annotations/{id}/
```

### Machine Learning Training

#### Start Training Session
```http
POST /api/training/start/
Content-Type: application/json

{
  "dataset_id": 1,
  "model_name": "Anomaly Detection Model",
  "algorithm": "random_forest",
  "parameters": {
    "n_estimators": 100,
    "max_depth": 10
  }
}
```

**Response:**
```json
{
  "session_id": "train_123456789",
  "status": "started",
  "message": "Training initiated"
}
```

#### Get Training Status
```http
GET /api/training/status/{session_id}/
```

**Response:**
```json
{
  "session_id": "train_123456789",
  "status": "training",
  "progress": 0.65,
  "current_step": "Feature extraction",
  "steps_completed": 3,
  "total_steps": 5,
  "start_time": "2024-06-17T10:00:00Z",
  "metrics": {
    "accuracy": 0.92,
    "precision": 0.89,
    "recall": 0.94
  }
}
```

#### Stop Training
```http
POST /api/training/stop/{session_id}/
```

### Model Management

#### List Trained Models
```http
GET /api/models/
```

#### Get Model Details
```http
GET /api/models/{id}/
```

#### Model Prediction
```http
POST /api/models/{id}/predict/
Content-Type: application/json

{
  "dataset_id": 2,
  "start_time": 1623456789,
  "end_time": 1623456899
}
```

## Data Models

### Project
```python
class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Dataset
```python
class Dataset(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    file_path = models.FileField(upload_to='datasets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    data_count = models.IntegerField(default=0)
```

### Annotation
```python
class Annotation(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    start_time = models.FloatField()
    end_time = models.FloatField()
    label = models.CharField(max_length=100)
    confidence = models.FloatField(default=1.0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### UserDefinedModel
```python
class UserDefinedModel(models.Model):
    name = models.CharField(max_length=200)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    algorithm = models.CharField(max_length=100)
    parameters = models.JSONField()
    model_file_path = models.CharField(max_length=500)
    training_accuracy = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
```

## Error Handling

### HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "error": "Invalid dataset format",
  "details": "CSV file must contain required columns: timestamp_pc, b_x, b_y, b_z",
  "code": "INVALID_FORMAT"
}
```

## Performance Considerations

### Data Decimation
Large datasets (>5000 points) are automatically decimated for visualization:
- Preserves statistical properties
- Maintains anomaly visibility
- Reduces frontend rendering time
- Original data preserved for training

### Optimization Features
- Efficient Django ORM queries with `select_related`
- Background training with progress callbacks
- Chunked data processing for large files
- Client-side caching of visualizations

## Rate Limiting
Currently no rate limiting implemented. Consider adding for production use.

## Security Notes
- CSRF protection enabled for state-changing operations
- File upload validation for CSV format
- SQL injection prevention through Django ORM
- No sensitive data logging

## Testing
Use the provided test data in `example/` directory:
- `example_data.csv` - Small dataset for quick testing
- `mag_data_*.csv` - Various sized datasets for comprehensive testing

## Integration Examples

### JavaScript Frontend Integration
```javascript
// Upload dataset
const formData = new FormData();
formData.append('file', csvFile);
formData.append('project_id', projectId);

fetch('/api/datasets/upload/', {
    method: 'POST',
    body: formData,
    headers: {
        'X-CSRFToken': getCsrfToken()
    }
})
.then(response => response.json())
.then(data => console.log('Upload successful:', data));

// Get training status
async function checkTrainingStatus(sessionId) {
    const response = await fetch(`/api/training/status/${sessionId}/`);
    const status = await response.json();
    return status;
}
```

### Python Client Integration
```python
import requests

# Start training
training_data = {
    'dataset_id': 1,
    'model_name': 'Anomaly Detector',
    'algorithm': 'random_forest'
}

response = requests.post(
    'http://localhost:8000/api/training/start/',
    json=training_data,
    headers={'Content-Type': 'application/json'}
)

session_info = response.json()
print(f"Training started: {session_info['session_id']}")
```

---

For detailed implementation information, see the generated HTML documentation files and source code in `magtrace_api/` modules.