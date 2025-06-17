Installation Guide
==================

Get MagTrace running for magnetic field data analysis in minutes.

System Requirements
===================

**Minimum Requirements:**
- Python 3.8 or higher
- 4GB RAM (8GB recommended for large magnetometer datasets)
- 1GB disk space
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Operating Systems:**
- Windows 10/11, macOS 10.14+, Linux (Ubuntu 18.04+)

**Verified Platforms:**
Installation tested on multiple platforms with magnetic field data processing.

Quick Installation (Recommended)
================================

**1. Clone Repository**

.. code-block:: bash

   git clone https://github.com/manasp21/MagTrace.git
   cd MagTrace

**2. Run Application**

.. code-block:: bash

   python3 run.py

The launcher automatically:

✅ Creates Python virtual environment
✅ Installs required dependencies  
✅ Sets up SQLite database with magnetic field data models
✅ Starts Django development server

**3. Access Application**

- **Main Interface:** http://localhost:8000/app/
- **Health Check:** http://localhost:8000/health/
- **REST API:** http://localhost:8000/api/
- **Admin Panel:** http://localhost:8000/admin/

Manual Installation
===================

For manual control over installation:

**1. Create Virtual Environment**

.. code-block:: bash

   cd backend
   python3 -m venv venv
   
   # Activate environment
   # Linux/macOS:
   source venv/bin/activate
   # Windows:
   venv\Scripts\activate

**2. Install Dependencies**

.. code-block:: bash

   # Full installation (includes TensorFlow)
   pip install -r requirements.txt
   
   # Lightweight installation (scikit-learn only)
   pip install -r requirements-lite.txt

**Note:** TensorFlow installation often fails on some systems. MagTrace works perfectly with scikit-learn only using ``requirements-lite.txt``.

**3. Database Setup**

.. code-block:: bash

   python manage.py migrate

This creates SQLite database with tables for:
- Projects and datasets
- Magnetometer readings (B_x, B_y, B_z)
- Annotations and label categories
- ML models and training sessions

**4. Start Server**

.. code-block:: bash

   python manage.py runserver

Verifying Installation
======================

**1. Health Check**

Visit http://localhost:8000/health/ - should display:

.. code-block:: text

   MagTrace Backend is running

**2. Test with Sample Data**

.. code-block:: bash

   # Run comprehensive workflow test
   python3 test_workflow.py

Expected successful output:

.. code-block:: text

   🚀 Starting MagTrace Workflow Test
   ✅ Server health check passed
   ✅ Project created successfully: ID X
   ✅ Dataset uploaded successfully: ID X  
   ✅ Data retrieval successful: 46 data points
   ✅ Annotation created successfully: ID X
   ✅ Model created successfully: ID X
   ✅ Training started successfully: Session X

**3. Try Sample Magnetometer Data**

The included sample data contains real magnetic field measurements:

.. code-block:: bash

   # Sample data location
   example/data_1.csv

Sample content:

.. code-block:: text

   timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,thetax,thetay,thetaz,sensor_id
   24:40.0,7746.664,9395.448,14682.022,26.5123251,80.2238068,2018,0,0,0,S963350075783_20250605_112438

1. Open http://localhost:8000/app/
2. Create a new project
3. Upload ``example/data_1.csv``
4. View interactive magnetic field visualization

Troubleshooting
===============

**Port 8000 Already in Use**

.. code-block:: bash

   # Find and stop process using port 8000
   lsof -ti:8000 | xargs kill -9
   
   # Or use different port
   python manage.py runserver 8001

**Python Version Issues**

.. code-block:: bash

   # Check Python version
   python3 --version
   
   # Should be 3.8 or higher
   # Ubuntu/Debian - install newer Python:
   sudo apt update && sudo apt install python3.9

**TensorFlow Installation Fails**

This is normal and expected on many systems:

.. code-block:: bash

   # Use lightweight requirements instead
   pip install -r requirements-lite.txt

MagTrace works perfectly with scikit-learn for magnetic field analysis.

**Virtual Environment Issues**

.. code-block:: bash

   # Remove and recreate virtual environment
   rm -rf backend/venv
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements-lite.txt

**Database Migration Errors**

.. code-block:: bash

   # Reset database
   rm backend/db.sqlite3
   cd backend
   python manage.py migrate

**Permission Errors (Linux/macOS)**

.. code-block:: bash

   # Make launcher executable
   chmod +x run.py

**CSV Upload Issues**

- Verify CSV has required columns: ``timestamp_pc``, ``b_x``, ``b_y``, ``b_z``
- Check file size (<100MB for web upload)
- Ensure numeric values for magnetic field components

Dependency Details
==================

**Core Dependencies (requirements-lite.txt):**

.. code-block:: text

   Django==4.2.7
   djangorestframework==3.14.0
   django-cors-headers==4.3.1
   pandas==2.1.4
   numpy==1.24.4
   scikit-learn==1.3.2

**Optional Dependencies (requirements.txt):**

.. code-block:: text

   # Same as above plus:
   tensorflow==2.15.0
   matplotlib==3.8.2

**Why Lightweight Installation Works:**
MagTrace uses scikit-learn Random Forest for magnetic field analysis, which is fast, reliable, and works without TensorFlow.

Configuration
=============

**Default Settings:**
- **Database:** SQLite (``backend/db.sqlite3``)
- **Media Storage:** ``backend/media/datasets/``
- **Static Files:** ``backend/static/``
- **Port:** 8000

**Environment Variables (Optional):**

Create ``.env`` file in ``backend/`` directory:

.. code-block:: bash

   DEBUG=True
   SECRET_KEY=your-secret-key
   DATABASE_URL=sqlite:///db.sqlite3

Data Format Requirements
========================

**Required CSV Columns:**

.. code-block:: text

   timestamp_pc    # Measurement timestamp
   b_x            # Magnetic field X component  
   b_y            # Magnetic field Y component
   b_z            # Magnetic field Z component

**Optional CSV Columns:**

.. code-block:: text

   lat            # Latitude (GPS)
   lon            # Longitude (GPS)  
   altitude       # Altitude
   sensor_id      # Sensor identifier

**Example Valid CSV:**

.. code-block:: text

   timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,sensor_id
   24:40.0,7746.664,9395.448,14682.022,26.5123251,80.2238068,2018,S963350075783
   24:40.1,6830.673,9892.699,14027.742,26.5123251,80.2238068,2018,S963350075783

Development Installation
========================

For developers contributing to MagTrace:

**1. Fork Repository**

.. code-block:: bash

   # Fork on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/MagTrace.git
   cd MagTrace

**2. Development Dependencies**

.. code-block:: bash

   cd backend
   source venv/bin/activate
   pip install -r requirements-lite.txt
   
   # Additional development tools
   pip install black isort pytest

**3. Run Tests**

.. code-block:: bash

   # Test complete workflow
   python3 test_workflow.py
   
   # Django unit tests  
   cd backend
   python manage.py test

Next Steps
==========

Once installed successfully:

1. **Quick Start:** Try :doc:`quick_start_tutorial` with sample magnetometer data
2. **Upload Your Data:** Import your own magnetic field CSV files
3. **Explore API:** Check out :doc:`api_reference` for integration
4. **View Results:** See :doc:`testing_results` for validation details

Need Help?
==========

**Documentation:** https://manasp21.github.io/MagTrace/docs/index.html

**Common Solutions:**
- Check Python version with ``python3 --version``
- Verify port availability with ``lsof -i:8000``
- Test installation with ``python3 test_workflow.py``
- Use lightweight requirements if TensorFlow fails