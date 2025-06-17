Quick Start Tutorial
===================

Complete your first magnetic field analysis in 10 minutes using real magnetometer data.

Prerequisites
=============

✅ MagTrace installed and running (see :doc:`installation`)
✅ Application accessible at http://localhost:8000/app/
✅ Sample data available: ``example/data_1.csv``

Tutorial Overview
================

This tutorial uses real magnetic field data from sensor ``S963350075783`` to demonstrate:

1. **Project Creation** - Organize your magnetic field analysis
2. **Data Upload** - Import CSV magnetometer readings  
3. **Data Visualization** - Interactive B_x, B_y, B_z charts
4. **Anomaly Labeling** - Mark regions with brush selection
5. **Model Training** - Scikit-learn classification on magnetic field features
6. **Results Review** - Model performance and predictions

**Sample Data Details:**
- **File:** ``example/data_1.csv`` (included with MagTrace)
- **Format:** ``timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,sensor_id``
- **Content:** Real magnetometer readings with GPS coordinates
- **Size:** 46 data points for quick demonstration

Step 1: Create Your First Project
=================================

**1.1. Open MagTrace Interface**

Navigate to http://localhost:8000/app/ in your browser.

You should see the clean MagTrace interface with:
- Header with project controls
- Left sidebar with Data/Labels/Models tabs
- Main content area for visualization

**1.2. Create New Project**

1. Click **"New Project"** button in the header
2. Fill in project details:
   - **Name:** "Magnetometer Analysis Demo"  
   - **Description:** "Learning MagTrace with real magnetic field data"
3. Click **"Create Project"**

✅ **Success Indicator:** "Project created successfully" notification appears and project is selected in dropdown.

Step 2: Upload Real Magnetic Field Data
=======================================

**2.1. Navigate to Data Tab**

1. In the left sidebar, click the **"Data"** tab
2. You'll see the data upload section

**2.2. Upload Sample Magnetometer Data**

1. Click **"Upload CSV File"** button
2. Select ``example/data_1.csv`` from your MagTrace directory
3. Wait for upload processing

✅ **Success Indicator:** "Dataset uploaded successfully" and dataset appears in your data list.

**2.3. Load Dataset for Analysis**

1. Click the **"Load"** button next to your uploaded dataset
2. Watch the interactive magnetic field visualization appear

**What You're Seeing:**
- **X-axis:** Time sequence of magnetometer measurements
- **Y-axis:** Magnetic field magnitude (calculated from B_x, B_y, B_z components)
- **Interactive Chart:** D3.js powered visualization with zoom and pan capabilities

**Real Data Values:**
The chart displays actual magnetic field strength values from sensor S963350075783, showing natural variations in the Earth's magnetic field.

Step 3: Label Magnetic Field Anomalies
======================================

**3.1. Enable Selection Mode**

1. Click **"Select Mode"** button above the chart
2. Notice cursor changes to crosshair
3. Quick labeling toolbar appears below chart

**3.2. Select Your First Region**

1. **Drag to select** a region on the magnetic field chart that shows variation from baseline
2. You see a blue selection rectangle 
3. Selection info shows: "Selected: X points (start-end indices)"

**3.3. Label the Magnetic Field Pattern**

Choose an appropriate label for the selected magnetic field pattern:

- **Normal (3)** - Baseline magnetic field readings
- **Anomaly (4)** - Unusual magnetic field variations  
- **Fan Noise (1)** - Electromagnetic interference patterns
- **Motor (2)** - Motor-related magnetic signatures
- **Electrical (5)** - Electrical interference

**Quick Labeling:** Press keyboard keys 1-5 to instantly label selected regions.

✅ **Success Indicator:** "Annotation created successfully" and colored overlay appears on selection.

**3.4. Label Multiple Magnetic Field Regions**

Create 3-4 annotations with different characteristics:

1. Select **baseline region** → Label as "Normal (3)"
2. Select **highest peaks** → Label as "Anomaly (4)"  
3. Select **different pattern** → Label appropriately

**Best Practice:** Label regions with clearly different magnetic field characteristics for effective model training.

Step 4: Configure ML Model for Magnetic Data
============================================

**4.1. Switch to Models Tab**

1. Click **"Models"** tab in left sidebar
2. Click **"Create New Model"**

**4.2. Configure Magnetic Field Classifier**

The Model Config panel opens. Configure for magnetic field analysis:

- **Model Name:** "Magnetic Anomaly Detector"
- **Description:** "Classifies magnetic field patterns using B_x, B_y, B_z features"  
- **Model Type:** "Classification" (for anomaly detection)
- **Epochs:** 5 (quick training for demo)
- **Learning Rate:** 0.001 (default)

**4.3. Save Model Configuration**

1. Click **"Save Configuration"**
2. ✅ "Model configuration saved" confirmation

Step 5: Train on Magnetic Field Features
========================================

**5.1. Start ML Training**

1. Click **"Training"** tab in main content area
2. Click **"Start Training"**

**5.2. Monitor Training Progress**

Real-time training progress for magnetic field classification:

- **Status:** "pending" → "running" → "completed"
- **Progress Bar:** Shows completion percentage
- **Epoch Counter:** Current training epoch
- **Live Updates:** Every 2 seconds

**What's Happening:**
MagTrace extracts statistical features from magnetic field data (B_x, B_y, B_z):
- Mean, standard deviation, min, max of each component
- Segment length and magnetic field magnitude
- Trains Random Forest classifier on these features

**Training Time:** Typically completes in 30-60 seconds for sample data.

✅ **Success Indicator:** "Training completed successfully" with accuracy metrics.

Step 6: Review Magnetic Field Analysis Results
==============================================

**6.1. Check Model Performance**

After training completion:

- **Accuracy:** Model performance on magnetic field classification
- **Training Samples:** Number of labeled magnetic field regions used
- **Model Status:** "Completed" with timestamp

**6.2. View Your Magnetic Field Annotations**

1. Switch to **"Labels"** tab in sidebar
2. See all created annotations:
   - Category names with colors
   - Magnetic field data ranges (indices)
   - Confidence scores

**6.3. Verify Visualization**

1. Return to **"Visualization"** panel
2. Labeled regions visible as colored overlays on magnetic field chart
3. Different magnetic field patterns have different colors

Congratulations! 🎉
==================

You've successfully completed magnetic field analysis workflow:

✅ **Created** a project for magnetometer data organization
✅ **Uploaded** real magnetic field measurements (B_x, B_y, B_z)
✅ **Visualized** magnetometer data with interactive charts
✅ **Labeled** magnetic field patterns and anomalies  
✅ **Trained** ML model on magnetic field features
✅ **Monitored** real-time training progress
✅ **Reviewed** classification results and performance

Real-World Applications
======================

This workflow applies to various magnetic field analysis scenarios:

**🚁 Drone Magnetometer Surveys**
   Analyze magnetic field data from UAV surveys to detect buried objects or geological features

**🏭 Industrial Equipment Monitoring**
   Monitor magnetic signatures of machinery for predictive maintenance

**🔬 Geological Field Surveys**  
   Process magnetometer data to identify mineral deposits or archaeological sites

**⚡ Infrastructure Inspection**
   Detect anomalies in electrical systems through magnetic field analysis

Next Steps with Your Own Data
=============================

**Upload Your Magnetometer Data:**

1. **Prepare CSV file** with required columns:
   ``timestamp_pc,b_x,b_y,b_z`` (minimum)
   Plus optional: ``lat,lon,altitude,sensor_id``

2. **Follow same workflow:**
   - Create project → Upload data → Visualize → Label → Train

3. **Optimize for your data:**
   - Label patterns specific to your application
   - Adjust model parameters for your magnetic field ranges
   - Use more training epochs for complex patterns

**Advanced Features:**

- **Multiple datasets** in one project
- **Different model types** for various analyses  
- **API integration** for automated processing
- **Batch processing** for large magnetometer surveys

Troubleshooting
===============

**Chart Not Loading:**
   - Verify CSV has ``timestamp_pc,b_x,b_y,b_z`` columns
   - Check browser console for JavaScript errors
   - Ensure numeric values for magnetic field components

**Upload Fails:**
   - Check file size (<100MB)
   - Verify CSV format matches sample data
   - Ensure file contains valid magnetometer readings

**Training Doesn't Start:**
   - Create at least 2-3 labeled annotations first
   - Check that annotations have different categories
   - Verify model configuration is saved

**"No Data Points" Error:**
   - Confirm CSV file format matches requirements
   - Check for missing or invalid B_x, B_y, B_z values

Learn More
==========

**Technical Details:** :doc:`api_reference` - Complete API documentation
**Testing Results:** :doc:`testing_results` - System validation and performance
**Installation Help:** :doc:`installation` - Setup and troubleshooting

**Automated Testing:**
Run ``python3 test_workflow.py`` to verify your installation follows this exact workflow programmatically.

.. raw:: html

   <div style="text-align: center; margin: 40px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
     <h3>Ready for advanced magnetic field analysis?</h3>
     <p style="margin: 15px 0;">
       <a href="api_reference.html" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore API Reference →</a>
     </p>
   </div>