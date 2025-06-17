Troubleshooting Guide
====================

Common issues and solutions for MagTrace magnetic field analysis platform.

Installation Issues
===================

**Virtual Environment Symlink Errors (Jekyll/Git)**

**Problem:** ``error: open("backend/venv/bin/python"): Invalid argument``

**Cause:** Python virtual environment was tracked in Git, causing symlink issues with Jekyll builds.

**Solution:**

.. code-block:: bash

   # Remove virtual environment from Git tracking
   git rm -r --cached backend/venv/
   echo "backend/venv/" >> .gitignore
   
   # Recreate virtual environment
   cd backend
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements-lite.txt

**TensorFlow Installation Failures**

**Problem:** ``ERROR: Could not install packages due to an OSError``

**Cause:** TensorFlow has complex system dependencies that often fail on various platforms.

**Solution (Recommended):**

.. code-block:: bash

   # Use lightweight requirements without TensorFlow
   cd backend
   pip install -r requirements-lite.txt

**Note:** MagTrace works perfectly with scikit-learn only. TensorFlow is optional and not required for core functionality.

**Python Version Compatibility**

**Problem:** ``SyntaxError`` or ``ImportError`` on startup

**Cause:** MagTrace requires Python 3.8 or higher.

**Solution:**

.. code-block:: bash

   # Check Python version
   python3 --version
   
   # Ubuntu/Debian - install newer Python
   sudo apt update && sudo apt install python3.9 python3.9-venv
   
   # macOS with Homebrew
   brew install python@3.9
   
   # Windows - download from python.org

**Port 8000 Already in Use**

**Problem:** ``Error: That port is already in use.``

**Solution:**

.. code-block:: bash

   # Find and kill process using port 8000
   lsof -ti:8000 | xargs kill -9
   
   # Or use different port
   python manage.py runserver 8001

Data Upload Issues
==================

**CSV Format Errors**

**Problem:** ``Invalid dataset format`` or ``No data points found``

**Cause:** CSV file doesn't contain required magnetic field columns.

**Required Columns:**

.. code-block:: text

   timestamp_pc    # Measurement timestamp (required)
   b_x            # Magnetic field X component (required)  
   b_y            # Magnetic field Y component (required)
   b_z            # Magnetic field Z component (required)

**Optional Columns:**

.. code-block:: text

   lat, lon, altitude    # GPS coordinates
   sensor_id            # Sensor identifier
   thetax, thetay, thetaz    # Orientation angles

**Valid Example:**

.. code-block:: text

   timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,sensor_id
   24:40.0,7746.664,9395.448,14682.022,26.5123251,80.2238068,2018,S963350075783
   24:40.1,6830.673,9892.699,14027.742,26.5123251,80.2238068,2018,S963350075783

**Large File Upload Failures**

**Problem:** Upload fails or times out with large CSV files

**Current Limitation:** Django default upload limit is ~100MB

**Workarounds:**

1. **Split large files** into smaller chunks (< 50MB each)
2. **Data decimation** - reduce sampling rate before upload
3. **Server configuration** (requires system admin access):

.. code-block:: python

   # In Django settings.py
   FILE_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB
   DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB

**Non-Numeric Magnetic Field Values**

**Problem:** ``TypeError: cannot convert string to float``

**Cause:** CSV contains non-numeric values in B_x, B_y, B_z columns.

**Solution:** Clean data before upload:

.. code-block:: python

   import pandas as pd
   
   # Load and clean CSV
   df = pd.read_csv('magnetometer_data.csv')
   
   # Convert magnetic field columns to numeric, replacing errors with NaN
   for col in ['b_x', 'b_y', 'b_z']:
       df[col] = pd.to_numeric(df[col], errors='coerce')
   
   # Remove rows with NaN magnetic field values
   df = df.dropna(subset=['b_x', 'b_y', 'b_z'])
   
   # Save cleaned data
   df.to_csv('cleaned_magnetometer_data.csv', index=False)

Visualization Issues
====================

**Chart Not Loading or Displaying**

**Problem:** Blank visualization area or JavaScript errors

**Diagnostics:**

1. **Open browser developer console** (F12)
2. **Check for JavaScript errors** in Console tab
3. **Verify data loading** in Network tab

**Common Causes:**

- **Empty dataset** - No magnetic field data after processing
- **Invalid timestamps** - Non-numeric or malformed timestamp_pc values
- **Browser compatibility** - Use modern browser (Chrome, Firefox, Safari, Edge)

**Solutions:**

.. code-block:: javascript

   // Check if data loaded properly (in browser console)
   console.log(window.app.currentDataset);
   
   // Common error: Invalid timestamp format
   // Ensure timestamp_pc is numeric (seconds or milliseconds)

**Slow Chart Performance**

**Problem:** Laggy or unresponsive visualization with large datasets

**Cause:** Browser rendering too many data points

**Solution:** MagTrace automatically decimates datasets > 5000 points, but you can manually reduce data:

.. code-block:: python

   # Pre-process large datasets before upload
   import pandas as pd
   
   df = pd.read_csv('large_magnetometer_data.csv')
   
   # Keep every Nth row (decimation)
   decimation_factor = 10
   df_decimated = df.iloc[::decimation_factor, :]
   
   # Save decimated version
   df_decimated.to_csv('decimated_data.csv', index=False)

Training Issues
===============

**Training Fails to Start**

**Problem:** ``Training session failed to start`` or immediate failure

**Required Prerequisites:**

1. **At least 2-3 annotations** with different label categories
2. **Valid model configuration** saved
3. **Sufficient labeled data** (minimum 10 data points per category)

**Diagnostic Steps:**

.. code-block:: bash

   # Check if annotations exist
   python manage.py shell
   >>> from magtrace_api.models import Annotation
   >>> print(f"Total annotations: {Annotation.objects.count()}")
   >>> for ann in Annotation.objects.all():
   ...     print(f"ID: {ann.id}, Label: {ann.label_category.name if ann.label_category else 'None'}")

**Scikit-learn Import Errors**

**Problem:** ``ModuleNotFoundError: No module named 'sklearn'``

**Solution:**

.. code-block:: bash

   cd backend
   source venv/bin/activate
   pip install scikit-learn==1.3.2

**Training Session Hangs**

**Problem:** Training progress stuck at 0% or specific percentage

**Debugging:**

1. **Check server logs** for error messages
2. **Verify background training process**:

.. code-block:: bash

   # Check if training process is running
   ps aux | grep python
   
   # Django development server logs
   tail -f backend/debug.log  # if logging configured

**Memory Issues During Training**

**Problem:** ``MemoryError`` or system becomes unresponsive

**Cause:** Large datasets require significant memory for feature extraction

**Solutions:**

1. **Reduce dataset size** through decimation
2. **Increase system memory** (recommend 8GB+ for large datasets)
3. **Split training** into smaller batches

Database Issues
===============

**Migration Errors**

**Problem:** ``django.db.utils.OperationalError`` during migrations

**Solution:**

.. code-block:: bash

   # Reset database (WARNING: loses all data)
   cd backend
   rm db.sqlite3
   python manage.py migrate
   
   # Or backup and restore
   cp db.sqlite3 db.sqlite3.backup
   python manage.py migrate

**Database Locked Errors**

**Problem:** ``database is locked`` errors

**Cause:** Multiple Django processes or interrupted operations

**Solution:**

.. code-block:: bash

   # Kill all Django processes
   pkill -f "manage.py runserver"
   
   # Restart server
   cd backend
   python manage.py runserver

**Corrupted Database**

**Problem:** Inconsistent data or foreign key errors

**Solution:**

.. code-block:: bash

   # Check database integrity
   sqlite3 backend/db.sqlite3 "PRAGMA integrity_check;"
   
   # If corrupted, restore from backup or reset
   rm backend/db.sqlite3
   python manage.py migrate

Network and API Issues
======================

**CSRF Token Errors**

**Problem:** ``403 Forbidden: CSRF verification failed``

**Cause:** Missing or invalid CSRF tokens for POST requests

**Solution (Frontend):**

.. code-block:: javascript

   // Get CSRF token from cookie
   function getCsrfToken() {
       return document.cookie.split(';')
           .find(cookie => cookie.trim().startsWith('csrftoken='))
           ?.split('=')[1];
   }
   
   // Include in fetch requests
   fetch('/api/datasets/upload/', {
       method: 'POST',
       headers: {
           'X-CSRFToken': getCsrfToken()
       },
       body: formData
   });

**API Endpoint 404 Errors**

**Problem:** ``404 Not Found`` for API endpoints

**Verification:** Check available endpoints:

.. code-block:: bash

   curl http://localhost:8000/api/
   
   # Should return API root with available endpoints

**Connection Refused Errors**

**Problem:** ``Connection refused`` when accessing http://localhost:8000

**Diagnostics:**

.. code-block:: bash

   # Check if server is running
   netstat -tulpn | grep :8000
   
   # Check Django server status
   ps aux | grep "manage.py runserver"

Browser and Frontend Issues
===========================

**Modern Browser Required**

**Problem:** Interface doesn't display correctly or JavaScript errors

**Solution:** Use supported browsers:

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

**JavaScript Console Errors**

**Problem:** ``ReferenceError`` or ``TypeError`` in browser console

**Common Issues:**

.. code-block:: javascript

   // D3.js not loaded
   // Check if D3 library loads: console.log(d3);
   
   // MagTrace class not initialized
   // Check: console.log(window.app);

**Local File Access Issues**

**Problem:** Cannot access local CSV files in browser file picker

**Solution:** Files must be on accessible file system path, not network drives or restricted directories.

Performance Issues
==================

**Slow Application Response**

**Problem:** Long delays for data loading or UI interactions

**Optimization Checklist:**

1. **Dataset size** - Use < 10,000 points for optimal performance
2. **Browser resources** - Close unnecessary tabs
3. **System memory** - Ensure 4GB+ available RAM
4. **Database optimization** - Regular SQLite VACUUM

.. code-block:: bash

   # Optimize SQLite database
   sqlite3 backend/db.sqlite3 "VACUUM;"

**High Memory Usage**

**Problem:** System becomes slow or unresponsive

**Memory optimization:**

1. **Close unused projects** in interface
2. **Limit concurrent training sessions** to 1
3. **Clear browser cache** regularly
4. **Restart Django server** periodically

Development Issues
==================

**Static Files Not Loading**

**Problem:** CSS/JavaScript files return 404 in development

**Solution:**

.. code-block:: bash

   cd backend
   python manage.py collectstatic --noinput

**Template Does Not Exist Errors**

**Problem:** ``TemplateDoesNotExist: magtrace.html``

**Cause:** Template renaming not properly updated

**Solution:** Verify template path in views:

.. code-block:: python

   # In backend/frontend_views.py
   def main_app(request):
       return render(request, 'magtrace.html')  # Correct template name

**Import Errors in Development**

**Problem:** ``ModuleNotFoundError`` for local modules

**Solution:**

.. code-block:: bash

   # Ensure you're in the correct directory
   cd backend
   
   # Activate virtual environment
   source venv/bin/activate
   
   # Verify Python path
   python -c "import sys; print(sys.path)"

Production Deployment Issues
============================

**Environment Variables**

**Problem:** Settings not loading in production environment

**Setup for production:**

.. code-block:: bash

   # Create .env file in backend/
   cat > backend/.env << EOF
   DEBUG=False
   SECRET_KEY=your-production-secret-key
   ALLOWED_HOSTS=your-domain.com,localhost
   DATABASE_URL=postgresql://user:pass@localhost/dbname
   EOF

**Static File Serving**

**Problem:** CSS/JS files not loading in production

**Solution:** Configure web server (nginx/Apache) or use WhiteNoise:

.. code-block:: python

   # In settings.py
   MIDDLEWARE = [
       'whitenoise.middleware.WhiteNoiseMiddleware',
       # ... other middleware
   ]

**Database Configuration**

**Problem:** SQLite not suitable for production

**Solution:** Migrate to PostgreSQL:

.. code-block:: bash

   # Install PostgreSQL adapter
   pip install psycopg2-binary
   
   # Update DATABASE setting in settings.py

System Resource Issues
======================

**Disk Space**

**Problem:** ``No space left on device``

**Solution:**

.. code-block:: bash

   # Check disk usage
   df -h
   
   # Clean uploaded datasets
   rm backend/media/datasets/*.csv
   
   # Clear Django logs if configured
   rm backend/*.log

**File Permissions**

**Problem:** ``PermissionError`` on file operations

**Solution:**

.. code-block:: bash

   # Fix permissions for media directory
   chmod -R 755 backend/media/
   
   # Ensure virtual environment permissions
   chmod -R 755 backend/venv/

Getting Help
============

**Diagnostic Information to Collect:**

1. **Python version:** ``python3 --version``
2. **Operating system:** ``uname -a`` (Linux/macOS) or ``systeminfo`` (Windows)
3. **Browser and version**
4. **Error messages** from browser console and server logs
5. **Dataset size and format** if data-related issue
6. **Steps to reproduce** the problem

**Debugging Mode:**

.. code-block:: bash

   # Enable Django debug mode (development only)
   export DEBUG=True
   cd backend
   python manage.py runserver
   
   # Check detailed error pages in browser

**Testing Your Installation:**

.. code-block:: bash

   # Run comprehensive workflow test
   python3 test_workflow.py
   
   # Expected successful output shows all ✅ checkmarks

**Known Limitations:**

- **Single-user system** - No multi-user authentication
- **SQLite limitations** - Not suitable for concurrent access
- **File upload limits** - ~100MB maximum
- **No automated backups** - Manual database backup required
- **Development server only** - Requires production web server setup

If problems persist, check the installation guide and ensure all prerequisites are met. The system has been tested primarily on Ubuntu 20.04+ and macOS 12+.