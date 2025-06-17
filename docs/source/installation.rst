Installation Guide
==================

MagTrace is designed to be easy to install and run on any system with Python 3.8+.

System Requirements
===================

**Minimum Requirements:**
- Python 3.8 or higher
- 4GB RAM (8GB recommended for large datasets)
- 1GB disk space
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Operating Systems:**
- Windows 10/11
- macOS 10.14+
- Linux (Ubuntu 18.04+, CentOS 7+, or equivalent)

Quick Installation (Recommended)
================================

**1. Clone the Repository**

.. code-block:: bash

   git clone https://github.com/manasp21/MagTrace.git
   cd MagTrace

**2. Run the Application**

.. code-block:: bash

   python3 run.py

That's it! The run script will automatically:

✅ Create a Python virtual environment
✅ Install all required dependencies  
✅ Set up the database
✅ Start the application server

**3. Open in Browser**

Navigate to http://localhost:8000/app/ and you're ready to go!

Manual Installation
===================

If you prefer manual control over the installation process:

**1. Create Virtual Environment**

.. code-block:: bash

   cd backend
   python3 -m venv venv
   
   # On Linux/macOS:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate

**2. Install Dependencies**

.. code-block:: bash

   pip install -r requirements.txt

**Note:** If TensorFlow installation fails (common on some systems), use the lightweight version:

.. code-block:: bash

   pip install -r requirements-lite.txt

**3. Database Setup**

.. code-block:: bash

   python manage.py migrate
   python manage.py createsuperuser  # Optional

**4. Start Server**

.. code-block:: bash

   python manage.py runserver

The application will be available at http://localhost:8000/app/

Docker Installation (Advanced)
==============================

For containerized deployment:

.. code-block:: bash

   # Clone repository
   git clone https://github.com/manasp21/MagTrace.git
   cd MagTrace
   
   # Build Docker image
   docker build -t magtrace .
   
   # Run container
   docker run -p 8000:8000 magtrace

Development Installation
========================

For developers who want to contribute:

**1. Fork and Clone**

.. code-block:: bash

   git clone https://github.com/YOUR_USERNAME/MagTrace.git
   cd MagTrace

**2. Install Development Dependencies**

.. code-block:: bash

   cd backend
   python3 -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # Additional dev tools

**3. Set Up Pre-commit Hooks**

.. code-block:: bash

   pre-commit install

**4. Run Tests**

.. code-block:: bash

   python3 test_workflow.py
   python manage.py test

Verifying Installation
=====================

**Quick Health Check**

Visit http://localhost:8000/health/ - you should see:

.. code-block:: json

   {
     "status": "healthy",
     "timestamp": "2025-06-17T..."
   }

**Complete Workflow Test**

Run the automated test suite:

.. code-block:: bash

   python3 test_workflow.py

You should see output like:

.. code-block:: text

   🚀 Starting MagTrace Workflow Test
   ✅ Server health check passed
   ✅ Project created successfully
   ✅ Dataset uploaded successfully
   ✅ Data retrieval successful: 46 data points
   ✅ Annotation created successfully
   ✅ Training started successfully
   🎉 All workflow tests completed successfully!

Troubleshooting
===============

**Common Issues:**

**Port 8000 Already in Use**

.. code-block:: bash

   # Find and kill process using port 8000
   lsof -ti:8000 | xargs kill -9
   
   # Or use a different port
   python manage.py runserver 8001

**Python Version Issues**

.. code-block:: bash

   # Check Python version
   python3 --version
   
   # If < 3.8, install newer Python
   # Ubuntu/Debian:
   sudo apt update && sudo apt install python3.9
   
   # macOS:
   brew install python@3.9

**TensorFlow Installation Fails**

This is normal! MagTrace works perfectly with scikit-learn only:

.. code-block:: bash

   pip install -r requirements-lite.txt

**Virtual Environment Issues**

.. code-block:: bash

   # Remove and recreate virtual environment
   rm -rf backend/venv
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

**Database Issues**

.. code-block:: bash

   # Reset database
   rm backend/db.sqlite3
   python backend/manage.py migrate

**Permission Errors (Linux/macOS)**

.. code-block:: bash

   # Make run script executable
   chmod +x run.py

Configuration Options
====================

**Environment Variables**

Create a ``.env`` file in the backend directory:

.. code-block:: bash

   # Development settings
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   
   # Database (optional - defaults to SQLite)
   DATABASE_URL=sqlite:///db.sqlite3
   
   # Performance
   DATA_DECIMATION_THRESHOLD=5000

**Advanced Settings**

Edit ``backend/magtrace_api/settings.py`` for advanced configuration:

- Database backend (PostgreSQL, MySQL)
- Caching settings (Redis, Memcached)  
- Security settings for production
- CORS and API settings

Production Deployment
====================

For production environments, see the deployment guide which covers:

- Web server configuration (Nginx, Apache)
- WSGI deployment (Gunicorn, uWSGI)
- Database configuration (PostgreSQL)
- SSL/TLS setup
- Performance optimization
- Monitoring and logging

Next Steps
==========

Once installed, continue with:

1. :doc:`quick_start_tutorial` - Complete your first analysis in 10 minutes
2. :doc:`user_guide` - Comprehensive usage guide with examples
3. Sample datasets - Download sample magnetic field data to try

Need Help?
==========

- 📖 **Documentation:** https://manasp21.github.io/MagTrace/docs/
- 🐛 **Report Issues:** https://github.com/manasp21/MagTrace/issues
- 💬 **Discussions:** https://github.com/manasp21/MagTrace/discussions