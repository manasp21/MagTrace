MagTrace Documentation
==========================

**Magnetic Field Data Analysis Platform**

*Developed by Manas Pandey with the assistance of Claude*

MagTrace is a streamlined machine learning platform designed for magnetic field data analysis. It provides a clean, professional workflow for loading data, creating labels, and training models for anomaly detection and pattern recognition.

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   user_guide
   api_reference  
   testing_results
   installation

Quick Start
-----------

1. **Start Application**: Access at http://localhost:8000/app/
2. **Load Data**: Upload CSV files with magnetic field measurements
3. **Visualize**: View interactive time-series charts
4. **Select & Label**: Use brush selection to mark regions of interest
5. **Train Model**: Create ML models for pattern recognition
6. **Analyze**: Review results and predictions

Features
--------

- **Simple Workflow**: Load data → Select ranges → Label → Train → Predict
- **Fast Performance**: Optimized for speed and responsiveness with data decimation
- **Interactive Labeling**: Brush selection on charts with instant labeling capability
- **Keyboard Shortcuts**: Rapid labeling with hotkeys (1-5)
- **Professional UI**: Clean interface without emojis or clutter
- **Working ML Training**: Reliable scikit-learn based training system
- **Real-time Progress**: Live training monitoring with progress bars

API Reference
=============

.. toctree::
   :maxdepth: 2
   :caption: API Documentation:

   api/models
   api/views
   api/serializers
   api/services

Core Modules
------------

Models
~~~~~~

.. automodule:: magtrace_api.models
   :members:
   :undoc-members:
   :show-inheritance:

Views  
~~~~~

.. automodule:: magtrace_api.views
   :members:
   :undoc-members:
   :show-inheritance:

Serializers
~~~~~~~~~~~

.. automodule:: magtrace_api.serializers
   :members:
   :undoc-members:
   :show-inheritance:

Training Service
~~~~~~~~~~~~~~~~

.. automodule:: magtrace_api.simple_training_service
   :members:
   :undoc-members:
   :show-inheritance:

Project Service
~~~~~~~~~~~~~~~

.. automodule:: magtrace_api.project_service
   :members:
   :undoc-members:
   :show-inheritance:

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`

