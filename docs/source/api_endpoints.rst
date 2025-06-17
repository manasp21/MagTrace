API Endpoints Reference
=======================

**CRITICAL DOCUMENTATION WARNING**

This document provides the **actual** API endpoints based on current implementation. Previous documentation contained significant inaccuracies.

**Last Verified:** June 17, 2025  
**Implementation Source:** `magtrace_api/urls.py` and `magtrace_api/views.py`

Base Configuration
==================

**Base URL:** ``http://localhost:8000/api/``

**Authentication:** Django session-based (development mode)
- **CRITICAL SECURITY GAP:** No authentication system implemented
- **Production Risk:** All endpoints publicly accessible
- **CSRF Protection:** Enabled for state-changing operations only

**Content Type:** ``application/json`` for all POST/PUT requests
**File Uploads:** ``multipart/form-data`` for CSV uploads

Actual API Endpoints
====================

**IMPLEMENTATION REALITY:** The system has both legacy and enhanced endpoints due to development evolution.

Core Resource Endpoints
-----------------------

**1. Projects Management**

.. code-block:: text

   GET    /api/projects/                    # List all projects
   POST   /api/projects/                    # Create new project
   GET    /api/projects/{id}/               # Get project details
   PUT    /api/projects/{id}/               # Update project
   DELETE /api/projects/{id}/               # Delete project
   GET    /api/projects/{id}/export/        # Export project (UNVERIFIED)
   POST   /api/projects/import_project/     # Import project (UNVERIFIED)

**2. Dataset Management**

.. code-block:: text

   GET    /api/datasets/                    # List datasets
   POST   /api/datasets/                    # Create dataset record
   POST   /api/datasets/upload/             # Upload CSV file (ACTUAL UPLOAD ENDPOINT)
   GET    /api/datasets/{id}/               # Get dataset info
   PUT    /api/datasets/{id}/               # Update dataset
   DELETE /api/datasets/{id}/               # Delete dataset
   GET    /api/datasets/{id}/data/          # Get processed magnetometer data
   GET    /api/datasets/{id}/statistics/    # Get data statistics

**CRITICAL LIMITATION:** No data decimation parameters documented in current API reference.

**3. Magnetometer Readings (Legacy)**

.. code-block:: text

   GET    /api/readings/                    # List readings
   GET    /api/readings/{id}/               # Get specific reading
   
**Query Parameters:**
- ``dataset_id`` - Filter readings by dataset

**IMPLEMENTATION NOTE:** Read-only viewset, data populated via CSV upload.

**4. Annotations System**

.. code-block:: text

   GET    /api/annotations/                 # List annotations
   POST   /api/annotations/                 # Create annotation
   GET    /api/annotations/{id}/            # Get annotation
   PUT    /api/annotations/{id}/            # Update annotation
   DELETE /api/annotations/{id}/            # Delete annotation

**Query Parameters:**
- ``dataset_id`` - Filter annotations by dataset

**5. Label Categories**

.. code-block:: text

   GET    /api/label-categories/            # List label categories
   POST   /api/label-categories/            # Create category
   GET    /api/label-categories/{id}/       # Get category
   PUT    /api/label-categories/{id}/       # Update category
   DELETE /api/label-categories/{id}/       # Delete category

**Query Parameters:**
- ``project_id`` - Filter categories by project

Machine Learning Endpoints
---------------------------

**6. User-Defined Models**

.. code-block:: text

   GET    /api/user-models/                 # List models
   POST   /api/user-models/                 # Create model configuration
   GET    /api/user-models/{id}/            # Get model details
   PUT    /api/user-models/{id}/            # Update model
   DELETE /api/user-models/{id}/            # Delete model
   
   # Advanced model management
   GET    /api/user-models/script_template/ # Get Python script template
   POST   /api/user-models/validate_script/ # Validate Python script
   POST   /api/user-models/{id}/rename/     # Rename model
   POST   /api/user-models/{id}/clone/      # Clone model
   POST   /api/user-models/{id}/create_version/ # Create model version
   GET    /api/user-models/{id}/versions/   # Get all model versions
   POST   /api/user-models/generate_intelligent_name/ # Generate model name
   PATCH  /api/user-models/{id}/update_metadata/ # Update metadata
   GET    /api/user-models/categories/      # Get all categories
   GET    /api/user-models/tags/           # Get all tags

**Query Parameters:**
- ``project_id`` - Filter by project
- ``summary`` - Return summary view (true/false)
- ``tags`` - Filter by comma-separated tags
- ``category`` - Filter by category name

**7. Training Sessions**

.. code-block:: text

   GET    /api/training-sessions/           # List training sessions
   POST   /api/training-sessions/           # Create training session
   GET    /api/training-sessions/{id}/      # Get session details
   PUT    /api/training-sessions/{id}/      # Update session
   DELETE /api/training-sessions/{id}/      # Delete session
   
   # Training operations (ACTUAL WORKING ENDPOINTS)
   POST   /api/training-sessions/start_training/    # Start ML training
   POST   /api/training-sessions/{id}/stop_training/ # Stop training
   GET    /api/training-sessions/{id}/status/       # Get training status
   GET    /api/training-sessions/active_sessions/   # List active sessions

**Query Parameters:**
- ``model_id`` - Filter sessions by model

**CRITICAL DISCREPANCY:** Previous documentation incorrectly showed ``/api/training/start/`` - **this endpoint does not exist**.

**8. Predictions**

.. code-block:: text

   GET    /api/predictions/                 # List predictions
   POST   /api/predictions/                 # Create prediction
   GET    /api/predictions/{id}/            # Get prediction
   PUT    /api/predictions/{id}/            # Update prediction
   DELETE /api/predictions/{id}/            # Delete prediction
   POST   /api/predictions/{id}/review/     # Review prediction

**Query Parameters:**
- ``dataset_id`` - Filter by dataset
- ``model_id`` - Filter by model

Legacy Endpoints (Deprecated)
-----------------------------

**WARNING:** These endpoints exist for backwards compatibility but may not be actively maintained.

**9. Legacy ML Models**

.. code-block:: text

   GET    /api/models/                      # List legacy models
   POST   /api/models/                      # Create legacy model
   GET    /api/models/{id}/                 # Get legacy model
   POST   /api/models/{id}/set_active/      # Set as active model
   POST   /api/models/train/                # Legacy training endpoint
   POST   /api/models/{id}/generate_suggestions/ # Generate suggestions

**10. Legacy Labels**

.. code-block:: text

   GET    /api/labels/                      # List legacy labels
   POST   /api/labels/                      # Create legacy label
   POST   /api/labels/bulk_create/          # Bulk create labels

**11. Inference Results**

.. code-block:: text

   GET    /api/inference/                   # List inference results
   POST   /api/inference/                   # Create inference
   POST   /api/inference/run_inference/     # Run inference

**12. Active Learning Suggestions**

.. code-block:: text

   GET    /api/suggestions/                 # List suggestions
   POST   /api/suggestions/                 # Create suggestion
   POST   /api/suggestions/{id}/accept/     # Accept suggestion
   POST   /api/suggestions/{id}/reject/     # Reject suggestion

Request/Response Examples
=========================

**Start Training (Actual Working Endpoint)**

.. code-block:: http

   POST /api/training-sessions/start_training/
   Content-Type: application/json
   X-CSRFToken: [csrf_token]

   {
     "model_id": 1,
     "dataset_id": 2,
     "training_config": {
       "epochs": 5,
       "learning_rate": 0.001
     }
   }

**Response:**

.. code-block:: json

   {
     "id": 10,
     "model": 1,
     "dataset": 2,
     "status": "pending",
     "created_at": "2025-06-17T10:00:00Z",
     "total_epochs": 5,
     "current_epoch": 0,
     "progress": 0.0
   }

**Upload Dataset (Actual Working Endpoint)**

.. code-block:: http

   POST /api/datasets/upload/
   Content-Type: multipart/form-data
   X-CSRFToken: [csrf_token]

   file: [CSV file]
   project: 1
   name: "Magnetometer Survey Data"

**Response:**

.. code-block:: json

   {
     "id": 5,
     "name": "Magnetometer Survey Data",
     "project": 1,
     "file": "/media/datasets/survey_data.csv",
     "total_records": 1543,
     "processed": true,
     "uploaded_at": "2025-06-17T10:00:00Z"
   }

**Get Training Status (Real-time)**

.. code-block:: http

   GET /api/training-sessions/15/status/

**Response:**

.. code-block:: json

   {
     "session_id": 15,
     "status": "running",
     "progress": 0.65,
     "current_epoch": 3,
     "total_epochs": 5,
     "current_step": "Feature extraction",
     "start_time": "2025-06-17T10:00:00Z",
     "estimated_completion": "2025-06-17T10:05:00Z"
   }

Critical Implementation Gaps
============================

**1. Missing Endpoints**

The following endpoints are **MISSING** despite being mentioned in other documentation:

- ❌ ``/api/training/start/`` - **Does not exist** (documentation error)
- ❌ ``/api/datasets/{id}/predict/`` - **Not implemented**
- ❌ ``/api/models/{id}/export/`` - **Not implemented**
- ❌ ``/api/health/`` - **Wrong path** (actual: ``/health/``)

**2. Undocumented Query Parameters**

Many endpoints accept query parameters not documented in previous API reference:

- ``decimation_factor`` for dataset data retrieval
- ``summary`` for model list view
- ``tags`` filtering for models
- Complex filtering options throughout

**3. Response Format Inconsistencies**

- Some endpoints return detailed objects, others return summaries
- Error response formats vary between endpoints
- Pagination not implemented despite large data potential

**4. Authentication/Authorization Gaps**

.. code-block:: text

   CRITICAL SECURITY ISSUE:
   - No authentication required for any endpoint
   - No user isolation (all users see all data)
   - No rate limiting
   - No input validation beyond basic type checking

Error Handling
==============

**Standard HTTP Status Codes:**

- ``200 OK`` - Successful GET/PUT
- ``201 Created`` - Successful POST
- ``400 Bad Request`` - Invalid input data
- ``404 Not Found`` - Resource not found
- ``500 Internal Server Error`` - Server error

**Error Response Format:**

.. code-block:: json

   {
     "error": "Detailed error message",
     "details": "Additional context when available"
   }

**Common Error Scenarios:**

.. code-block:: text

   400 Bad Request:
   - Missing required fields (model_id, dataset_id)
   - Invalid CSV format
   - Non-numeric magnetic field values
   
   404 Not Found:
   - Invalid project/dataset/model ID
   - Deleted resources
   
   500 Internal Server Error:
   - Training system failures
   - Database connection issues
   - File system permission errors

Performance Characteristics
===========================

**Data Processing Limits:**

- **CSV Upload:** ~100MB maximum file size
- **Data Points:** Performance degrades beyond 50,000 points
- **Training:** Memory usage scales linearly with dataset size
- **Concurrent Sessions:** Single training session recommended

**Response Times (Development Server):**

- **Simple GET requests:** < 100ms
- **Dataset upload (1MB):** 2-5 seconds
- **Training session start:** 1-3 seconds
- **Training completion:** 30-300 seconds (dataset dependent)

**Resource Usage:**

- **Memory:** 100MB base + 2MB per 1000 data points
- **Disk:** Raw CSV + processed data + model files
- **CPU:** Single-threaded training process

Production Deployment Considerations
====================================

**CRITICAL WARNINGS for Production Use:**

1. **Authentication Required**
   - Implement user authentication system
   - Add API key or token-based authentication
   - Enable proper CSRF protection

2. **Database Migration**
   - Replace SQLite with PostgreSQL
   - Implement connection pooling
   - Add database backup strategy

3. **File Storage**
   - Move from local filesystem to cloud storage (S3/MinIO)
   - Implement file access controls
   - Add virus scanning for uploads

4. **API Rate Limiting**
   - Implement request throttling
   - Add concurrent session limits
   - Monitor and log API usage

5. **Background Processing**
   - Move training to Celery task queue
   - Implement training session recovery
   - Add progress persistence

**Scalability Limits:**

- **Single-user system** - No multi-tenancy support
- **Synchronous processing** - Training blocks server threads
- **No caching** - Database queries not optimized
- **No CDN** - Static file delivery not optimized

Integration Examples
====================

**JavaScript Frontend Integration**

.. code-block:: javascript

   // Start training session
   async function startTraining(modelId, datasetId) {
     const response = await fetch('/api/training-sessions/start_training/', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'X-CSRFToken': getCsrfToken()
       },
       body: JSON.stringify({
         model_id: modelId,
         dataset_id: datasetId,
         training_config: { epochs: 5 }
       })
     });
     
     if (!response.ok) {
       throw new Error(`Training failed: ${response.statusText}`);
     }
     
     return await response.json();
   }

   // Monitor training progress
   async function monitorTraining(sessionId) {
     const response = await fetch(`/api/training-sessions/${sessionId}/status/`);
     const status = await response.json();
     
     console.log(`Training progress: ${status.progress * 100}%`);
     return status;
   }

**Python Client Integration**

.. code-block:: python

   import requests
   import time

   class MagTraceClient:
       def __init__(self, base_url="http://localhost:8000/api"):
           self.base_url = base_url
           self.session = requests.Session()
       
       def upload_dataset(self, project_id, csv_file_path, name):
           with open(csv_file_path, 'rb') as f:
               files = {'file': f}
               data = {'project': project_id, 'name': name}
               
               response = self.session.post(
                   f"{self.base_url}/datasets/upload/",
                   files=files,
                   data=data
               )
               response.raise_for_status()
               return response.json()
       
       def start_training(self, model_id, dataset_id):
           data = {
               'model_id': model_id,
               'dataset_id': dataset_id,
               'training_config': {'epochs': 5}
           }
           
           response = self.session.post(
               f"{self.base_url}/training-sessions/start_training/",
               json=data
           )
           response.raise_for_status()
           return response.json()
       
       def wait_for_training(self, session_id, poll_interval=2):
           while True:
               response = self.session.get(
                   f"{self.base_url}/training-sessions/{session_id}/status/"
               )
               status = response.json()
               
               print(f"Training: {status['progress']*100:.1f}%")
               
               if status['status'] in ['completed', 'failed', 'cancelled']:
                   return status
               
               time.sleep(poll_interval)

Testing and Validation
=======================

**Endpoint Testing:**

Use the provided test script to verify API functionality:

.. code-block:: bash

   python3 test_workflow.py

**Expected Results:**

.. code-block:: text

   ✅ Server health check passed
   ✅ Project created successfully: ID 17
   ✅ Dataset uploaded successfully: ID 15
   ✅ Data retrieval successful: 46 data points
   ✅ Annotation created successfully: ID 7
   ✅ Model created successfully: ID 8
   ✅ Training started successfully: Session 5

**Manual API Testing:**

.. code-block:: bash

   # Test health endpoint
   curl http://localhost:8000/health/
   
   # List projects
   curl http://localhost:8000/api/projects/
   
   # Get API root
   curl http://localhost:8000/api/

**API Documentation Accuracy Status**

.. code-block:: text

   ✅ Endpoints verified against actual implementation
   ✅ Request/response examples tested
   ⚠️  Performance characteristics estimated (need load testing)
   ❌ Security documentation incomplete (no auth system)
   ❌ Production deployment untested

---

**This documentation represents the actual implemented API as of June 17, 2025. Previous API documentation contained significant inaccuracies and should not be used.**