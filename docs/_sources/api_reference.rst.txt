MagTrace API Reference
======================

Overview
--------
Complete API documentation for MagTrace magnetic field data analysis platform.

Base URL
--------
::

    http://localhost:8000/api/

Authentication
--------------
Currently using Django session authentication. CSRF tokens required for POST requests.

Core API Endpoints
==================

Projects Management
-------------------

List Projects
~~~~~~~~~~~~~
.. code-block:: http

    GET /api/projects/

**Response:**

.. code-block:: json

    [
      {
        "id": 1,
        "name": "Magnetic Survey 2024",
        "description": "Field survey data analysis",
        "created_at": "2024-06-17T10:00:00Z"
      }
    ]

Create Project
~~~~~~~~~~~~~~
.. code-block:: http

    POST /api/projects/
    Content-Type: application/json

    {
      "name": "New Project",
      "description": "Project description"
    }

Dataset Management
------------------

Upload Dataset
~~~~~~~~~~~~~~
.. code-block:: http

    POST /api/datasets/upload/
    Content-Type: multipart/form-data

    file: [CSV file]
    project_id: 1

**CSV Format Required:**

.. code-block:: csv

    timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,thetax,thetay,thetaz,sensor_id
    1623456789,0.25,-0.15,0.30,40.7128,-74.0060,100,0.1,0.2,0.3,sensor_01

Get Dataset Data
~~~~~~~~~~~~~~~~
.. code-block:: http

    GET /api/datasets/{id}/data/

**Query Parameters:**

- ``decimation_factor`` (optional): Data reduction factor for large datasets
- ``start_time`` (optional): Filter start time
- ``end_time`` (optional): Filter end time

**Response:**

.. code-block:: json

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

Annotation System
-----------------

Create Annotation
~~~~~~~~~~~~~~~~~
.. code-block:: http

    POST /api/annotations/
    Content-Type: application/json

    {
      "dataset": 1,
      "start_time": 1623456789,
      "end_time": 1623456899,
      "label": "anomaly",
      "confidence": 0.95,
      "notes": "Magnetic interference detected"
    }

Training System
---------------

Start Training
~~~~~~~~~~~~~~
.. code-block:: http

    POST /api/training-sessions/start_training/
    Content-Type: application/json

    {
      "dataset_id": 1,
      "model_name": "Anomaly Detector",
      "algorithm": "random_forest"
    }

Get Training Status
~~~~~~~~~~~~~~~~~~~
.. code-block:: http

    GET /api/training-sessions/{id}/status/

**Response:**

.. code-block:: json

    {
      "session_id": 5,
      "status": "training",
      "progress": 0.75,
      "accuracy": 0.92,
      "message": "Training in progress..."
    }

Data Models
===========

Project Model
-------------
.. code-block:: python

    class Project(models.Model):
        name = models.CharField(max_length=200)
        description = models.TextField(blank=True)
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)

Dataset Model
-------------
.. code-block:: python

    class Dataset(models.Model):
        project = models.ForeignKey(Project, on_delete=models.CASCADE)
        name = models.CharField(max_length=200)
        file_path = models.FileField(upload_to='datasets/')
        uploaded_at = models.DateTimeField(auto_now_add=True)
        data_count = models.IntegerField(default=0)

Annotation Model
----------------
.. code-block:: python

    class Annotation(models.Model):
        dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
        start_time = models.FloatField()
        end_time = models.FloatField()
        label = models.CharField(max_length=100)
        confidence = models.FloatField(default=1.0)
        notes = models.TextField(blank=True)
        created_at = models.DateTimeField(auto_now_add=True)

Error Handling
==============

HTTP Status Codes
------------------
- ``200 OK`` - Successful request
- ``201 Created`` - Resource created successfully
- ``400 Bad Request`` - Invalid request data
- ``401 Unauthorized`` - Authentication required
- ``403 Forbidden`` - Permission denied
- ``404 Not Found`` - Resource not found
- ``500 Internal Server Error`` - Server error

Error Response Format
---------------------
.. code-block:: json

    {
      "error": "Invalid dataset format",
      "details": "CSV file must contain required columns: timestamp_pc, b_x, b_y, b_z",
      "code": "INVALID_FORMAT"
    }

Performance Considerations
==========================

Data Decimation
---------------
Large datasets (>5000 points) are automatically decimated for visualization:

- Preserves statistical properties
- Maintains anomaly visibility
- Reduces frontend rendering time
- Original data preserved for training

Security Notes
==============
- CSRF protection enabled for state-changing operations
- File upload validation for CSV format
- SQL injection prevention through Django ORM
- No sensitive data logging

Integration Examples
====================

JavaScript Frontend Integration
-------------------------------
.. code-block:: javascript

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

Python Client Integration
-------------------------
.. code-block:: python

    import requests

    # Start training
    training_data = {
        'dataset_id': 1,
        'model_name': 'Anomaly Detector',
        'algorithm': 'random_forest'
    }

    response = requests.post(
        'http://localhost:8000/api/training-sessions/start_training/',
        json=training_data,
        headers={'Content-Type': 'application/json'}
    )

    session_info = response.json()
    print(f"Training started: {session_info['session_id']}")