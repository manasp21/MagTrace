MagTrace: Magnetic Field Analysis Platform
==========================================

.. image:: https://img.shields.io/badge/status-active-brightgreen.svg
   :alt: Project Status

.. image:: https://img.shields.io/badge/python-3.8+-blue.svg
   :alt: Python Version

**Professional platform for magnetometer data analysis and anomaly detection using machine learning.**

*Author: Manas Pandey*

What is MagTrace?
=================

MagTrace analyzes magnetometer sensor data (B_x, B_y, B_z components) to detect anomalies and patterns using machine learning. Built specifically for magnetic field measurements from sensors, drones, or field surveys.

**Core Workflow:**

1. **Upload CSV Data** - Import magnetometer readings with timestamp, B_x, B_y, B_z coordinates
2. **Interactive Visualization** - View magnetic field magnitude and components on interactive D3.js charts  
3. **Label Anomalies** - Use brush selection to mark regions as normal, anomalous, or specific interference types
4. **Train Models** - Scikit-learn based machine learning on labeled magnetic field features
5. **Monitor Progress** - Real-time training status and model performance metrics

**Data Format Supported:**
``timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,thetax,thetay,thetaz,sensor_id``

Quick Start (5 Minutes)
=======================

**1. Start the Application**

.. code-block:: bash

   git clone https://github.com/manasp21/MagTrace.git
   cd MagTrace
   python3 run.py

**2. Access Interface**

- **Main Application:** http://localhost:8000/app/
- **Health Check:** http://localhost:8000/health/ 
- **API Documentation:** http://localhost:8000/api/

**3. Try with Sample Data**

.. code-block:: bash

   # Sample magnetometer data included
   example/data_1.csv

Contains real magnetic field readings from sensor ``S963350075783`` with B_x, B_y, B_z measurements.

**4. Test Complete Workflow**

.. code-block:: bash

   # Automated testing of full functionality
   python3 test_workflow.py

Real Application Features
========================

**Verified Working Functionality:**

✅ **Project Management**
   - Create and organize magnetic field analysis projects
   - Project-based dataset and model organization

✅ **Data Upload & Processing**  
   - CSV file upload with automatic parsing
   - Magnetometer reading storage and retrieval
   - Support for timestamp, B_x, B_y, B_z, GPS coordinates

✅ **Interactive Visualization**
   - D3.js powered magnetic field charts
   - Zoom, pan, and brush selection capabilities
   - Real-time data decimation for large datasets (>5000 points)

✅ **Annotation System**
   - Brush selection to mark data regions
   - Label categories: normal, anomaly, interference types
   - Confidence scoring and notes for each annotation

✅ **Machine Learning Training**
   - Scikit-learn Random Forest classifier
   - Automatic feature extraction from magnetic field data
   - Real-time training progress monitoring
   - Model performance metrics and validation

✅ **REST API**
   - Complete API for all functionality
   - Project, dataset, annotation, and training endpoints
   - JSON responses with proper error handling

API Endpoints
=============

**Core Endpoints (All Tested Working):**

.. code-block:: text

   GET/POST  /api/projects/           # Project management
   GET/POST  /api/datasets/          # Dataset upload/management  
   POST      /api/datasets/upload/   # CSV file upload
   GET/POST  /api/annotations/       # Data labeling
   GET/POST  /api/label-categories/  # Label management
   GET/POST  /api/user-models/       # Model configuration
   GET/POST  /api/training-sessions/ # ML training
   GET       /api/readings/          # Magnetometer data

**Testing Endpoints:**

.. code-block:: text

   GET  /health/                     # Application health check
   GET  /app/                        # Main user interface
   GET  /admin/                      # Django admin panel

Sample Data Structure
====================

**Real Example Data (example/data_1.csv):**

.. code-block:: text

   timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,thetax,thetay,thetaz,sensor_id
   24:40.0,7746.664,9395.448,14682.022,26.5123251,80.2238068,2018,0,0,0,S963350075783_20250605_112438
   24:40.0,6830.673,9892.699,14027.742,26.5123251,80.2238068,2018,0,0,0,S963350075783_20250605_112438

**Required Columns:**
- ``timestamp_pc`` - Measurement timestamp
- ``b_x, b_y, b_z`` - Magnetic field components (in nanoTesla or appropriate units)

**Optional Columns:**
- ``lat, lon, altitude`` - GPS coordinates  
- ``sensor_id`` - Sensor identifier

Technology Stack
================

**Backend Framework:**
- Django 4.2 with Django REST Framework
- SQLite database for data storage
- Python 3.8+ with scikit-learn for ML

**Frontend Interface:**
- HTML5 + JavaScript + CSS
- D3.js for interactive magnetic field visualization
- Responsive design for different screen sizes

**Machine Learning:**
- Scikit-learn Random Forest classifier
- Automatic feature extraction from magnetic field data
- Real-time training progress with background processing

**Performance Optimizations:**
- Data decimation for large datasets
- Efficient CSV parsing and storage
- Background training with progress monitoring

Getting Started
===============

.. toctree::
   :maxdepth: 2
   :caption: User Documentation

   installation
   quick_start_tutorial

.. toctree::
   :maxdepth: 2
   :caption: Technical Reference
   
   api_endpoints
   api_reference
   testing_results
   troubleshooting
   production_deployment

System Requirements
==================

**Minimum Requirements:**
- Python 3.8 or higher
- 4GB RAM (8GB recommended for large datasets)
- 1GB disk space for application and data
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Supported Platforms:**
- Windows 10/11, macOS 10.14+, Linux (Ubuntu 18.04+)

Testing Status
==============

**Last Tested:** June 17, 2025

✅ **Core Functionality Verified:**
- Project creation: ``✅ Project created successfully: ID 17``
- Data upload: ``✅ Dataset uploaded successfully: ID 15`` 
- Data processing: ``✅ Data retrieval successful: 46 data points``
- Annotation system: ``✅ Annotation created successfully: ID 7``
- Model creation: ``✅ Model created successfully: ID 8``
- Training system: ``✅ Training started successfully: Session 5``

**Test Coverage:**
- End-to-end workflow automation
- API endpoint validation  
- Database operations
- File upload and processing
- Machine learning pipeline

Repository Information
=====================

**Source Code:** https://github.com/manasp21/MagTrace

**Documentation:** https://manasp21.github.io/MagTrace/docs/index.html

**Key Files:**
- ``run.py`` - Application launcher
- ``test_workflow.py`` - Comprehensive testing script
- ``example/data_1.csv`` - Sample magnetometer data
- ``backend/`` - Django application code

Support
=======

**Testing and Validation:**
All functionality verified through automated testing. Use ``python3 test_workflow.py`` to validate your installation.

**Common Issues:**
- Port 8000 in use: Kill existing processes or use different port
- Python version: Requires Python 3.8+  
- TensorFlow installation fails: Use ``requirements-lite.txt`` (normal - app works with scikit-learn)

**Development:**
MagTrace is actively developed with focus on magnetic field data analysis. All core features are implemented and tested.

----

.. raw:: html

   <div style="text-align: center; margin: 40px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
     <h3>Ready to analyze magnetic field data?</h3>
     <p style="margin: 15px 0;">
       <a href="installation.html" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Get Started →</a>
     </p>
   </div>