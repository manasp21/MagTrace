MagTrace: Magnetic Field Analysis Platform
==========================================

.. image:: https://img.shields.io/badge/status-active-brightgreen.svg
   :alt: Project Status
   :target: https://github.com/manasp21/MagTrace

.. image:: https://img.shields.io/badge/python-3.8+-blue.svg
   :alt: Python Version

.. image:: https://img.shields.io/badge/license-MIT-green.svg
   :alt: License

**Professional machine learning platform for magnetic field data analysis and anomaly detection.**

*Author: Manas Pandey*

What is MagTrace?
=================

MagTrace transforms complex magnetic field data into actionable insights using machine learning. Whether you're analyzing drone surveys, monitoring industrial equipment, or detecting geological anomalies, MagTrace provides an intuitive workflow for:

📊 **Visualizing** magnetic field measurements in interactive charts
🏷️ **Labeling** regions of interest with simple brush selection  
🤖 **Training** machine learning models to detect patterns and anomalies
📈 **Analyzing** results with real-time progress monitoring

**Perfect for:** Geophysicists, drone operators, industrial monitoring, research teams, and anyone working with magnetometer data.

.. raw:: html

   <div style="text-align: center; margin: 20px 0;">
     <img src="https://via.placeholder.com/800x400/667eea/ffffff?text=MagTrace+Interface+Screenshot" alt="MagTrace Interface" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
   </div>

Quick Start (5 Minutes)
=======================

**1. Install & Run**

.. code-block:: bash

   git clone https://github.com/manasp21/MagTrace.git
   cd MagTrace
   python3 run.py

**2. Open Application**

Navigate to http://localhost:8000/app/ in your browser

**3. Try the Demo**

* Create a new project
* Upload sample CSV data (included in ``example/`` folder)
* Watch the interactive magnetic field visualization appear
* Select a region with your mouse and label it as "anomaly"
* Train a simple model and see results

**Result:** You'll have a working anomaly detection model in under 5 minutes!

How It Works
============

MagTrace follows a simple, proven workflow:

.. raw:: html

   <div style="display: flex; justify-content: space-around; margin: 30px 0; text-align: center;">
     <div style="flex: 1; padding: 20px;">
       <div style="font-size: 3em; color: #667eea;">📁</div>
       <h3>1. Load Data</h3>
       <p>Upload CSV files with magnetic field measurements (B_x, B_y, B_z)</p>
     </div>
     <div style="flex: 1; padding: 20px;">
       <div style="font-size: 3em; color: #667eea;">🎯</div>
       <h3>2. Label Regions</h3>
       <p>Use brush selection to mark normal vs anomalous regions</p>
     </div>
     <div style="flex: 1; padding: 20px;">
       <div style="font-size: 3em; color: #667eea;">🤖</div>
       <h3>3. Train Model</h3>
       <p>Automatic feature extraction and machine learning training</p>
     </div>
     <div style="flex: 1; padding: 20px;">
       <div style="font-size: 3em; color: #667eea;">📊</div>
       <h3>4. Get Results</h3>
       <p>View model performance and predict on new data</p>
     </div>
   </div>

Real Use Cases
==============

**🚁 Drone Magnetic Surveys**
   Analyze magnetometer data from UAV surveys to detect buried objects, geological features, or infrastructure.

**🏭 Industrial Equipment Monitoring**  
   Monitor magnetic signatures of rotating machinery to predict maintenance needs and detect failures.

**🔬 Geological Research**
   Process field survey data to identify mineral deposits, fault lines, or archaeological sites.

**⚡ Power Line Inspection**
   Detect anomalies in electrical infrastructure through magnetic field analysis.

Key Features
============

✨ **Zero Setup Complexity**
   Run with one command - no complex configuration required

🎨 **Interactive Visualization**
   D3.js powered charts with zoom, pan, and brush selection

⚡ **High Performance**
   Handles large datasets (50,000+ points) with automatic optimization

🎯 **Smart Labeling**
   Keyboard shortcuts (1-5) for rapid data annotation

🤖 **Proven ML Pipeline**
   Scikit-learn based models with feature extraction and validation

📱 **Professional Interface**
   Clean, responsive design that works on all devices

Getting Started
===============

.. toctree::
   :maxdepth: 1
   :caption: User Guides

   installation
   quick_start_tutorial
   user_guide
   sample_datasets

.. toctree::
   :maxdepth: 1
   :caption: Examples & Tutorials
   
   examples/drone_survey
   examples/industrial_monitoring  
   examples/geological_analysis

Data Format
===========

MagTrace works with standard CSV files containing magnetic field measurements:

.. code-block:: text

   timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,thetax,thetay,thetaz,sensor_id
   2023-06-01T10:00:00.000Z,-24.5,12.3,45.7,40.7128,-74.0060,10.5,0.1,0.2,0.3,sensor_01
   2023-06-01T10:00:01.000Z,-24.2,12.1,45.9,40.7129,-74.0061,10.6,0.1,0.2,0.3,sensor_01

**Required columns:** ``timestamp_pc``, ``b_x``, ``b_y``, ``b_z``

**Optional columns:** ``lat``, ``lon``, ``altitude``, ``sensor_id``

Technology Stack
================

**Backend:** Django 4.2 + REST Framework + SQLite
**Frontend:** HTML5 + JavaScript + D3.js  
**ML Engine:** Scikit-learn (Random Forest, SVM, etc.)
**Performance:** Automatic data decimation for large datasets

System Status
=============

.. raw:: html

   <div style="display: flex; gap: 20px; margin: 20px 0;">
     <span style="padding: 8px 16px; background: #28a745; color: white; border-radius: 4px;">✅ Core Features Complete</span>
     <span style="padding: 8px 16px; background: #28a745; color: white; border-radius: 4px;">✅ Testing Verified</span>
     <span style="padding: 8px 16px; background: #ffc107; color: black; border-radius: 4px;">⚠️ Beta Release</span>
   </div>

**Latest Update:** June 17, 2025 - Complete renaming to "MagTrace", documentation overhaul, Jekyll configuration fixed

Support & Community
===================

📖 **Documentation:** https://manasp21.github.io/MagTrace/docs/

🐛 **Report Issues:** https://github.com/manasp21/MagTrace/issues

💬 **Discussions:** https://github.com/manasp21/MagTrace/discussions

📧 **Contact:** Create an issue on GitHub for support

Developer Reference
===================

For developers who need technical implementation details:

.. toctree::
   :maxdepth: 1
   :caption: Technical Documentation

   api_reference
   architecture
   contributing
   troubleshooting

.. toctree::
   :maxdepth: 1
   :caption: API Reference
   
   api/endpoints
   api/models
   api/authentication

License
=======

MagTrace is open source software. See the `LICENSE <https://github.com/manasp21/MagTrace/blob/main/LICENSE>`_ file for details.

----

.. raw:: html

   <div style="text-align: center; margin: 40px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
     <h3>Ready to start analyzing magnetic field data?</h3>
     <p style="margin: 15px 0;">
       <a href="installation.html" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Get Started Now →</a>
     </p>
   </div>