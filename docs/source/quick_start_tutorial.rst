Quick Start Tutorial
===================

Complete your first magnetic field analysis in 10 minutes! This tutorial walks you through the entire MagTrace workflow using sample data.

Prerequisites
=============

✅ MagTrace installed and running (see :doc:`installation`)
✅ Application accessible at http://localhost:8000/app/
✅ Sample data available in the ``example/`` directory

Step 1: Create Your First Project
=================================

**1.1. Open MagTrace**

Navigate to http://localhost:8000/app/ in your browser. You should see the clean MagTrace interface.

**1.2. Create New Project**

.. raw:: html

   <div style="padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; margin: 15px 0;">
     <strong>💡 Tip:</strong> Projects help organize your magnetic field analysis work. Each project can contain multiple datasets and trained models.
   </div>

1. Click the **"New Project"** button in the header
2. Enter project details:
   - **Name:** "My First Analysis"
   - **Description:** "Learning MagTrace with sample data"
3. Click **"Create Project"**

✅ **Success:** You should see "Project created successfully" and your project is now selected in the dropdown.

Step 2: Upload Magnetic Field Data
==================================

**2.1. Navigate to Data Tab**

1. In the left sidebar, click the **"Data"** tab
2. You should see the data upload section

**2.2. Upload Sample Data**

.. code-block:: bash

   # Sample data location (included with MagTrace)
   example/data_1.csv

1. Click **"Upload CSV File"**
2. Select ``example/data_1.csv`` from your MagTrace directory
3. Wait for upload to complete

✅ **Success:** You should see "Dataset uploaded successfully" and the dataset appears in your data list.

**2.3. Load the Dataset**

1. Click the **"Load"** button next to your uploaded dataset
2. Watch as the interactive magnetic field visualization appears

**What You're Seeing:**

- **X-axis:** Time sequence of measurements
- **Y-axis:** Magnetic field magnitude (combined B_x, B_y, B_z)
- **Interactive Chart:** Zoom and pan to explore the data

Step 3: Label Regions of Interest
=================================

Now we'll identify and label different types of magnetic field patterns.

**3.1. Enable Selection Mode**

1. Click **"Select Mode"** button above the chart
2. Notice the cursor changes to crosshair
3. The quick labeling toolbar appears below the chart

**3.2. Select Your First Region**

1. **Drag to select** a region on the chart that looks anomalous (different from the baseline)
2. You should see a blue selection box
3. The selection info shows the number of points selected

.. raw:: html

   <div style="padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; margin: 15px 0;">
     <strong>⚡ Pro Tip:</strong> Look for sudden spikes, drops, or unusual patterns in the magnetic field data. These often indicate interesting phenomena!
   </div>

**3.3. Label the Selection**

1. Choose a label type by clicking one of the quick label buttons:
   - **Fan Noise (1)** - For electromagnetic interference
   - **Motor (2)** - For motor-related magnetic signatures  
   - **Normal (3)** - For baseline/background readings
   - **Anomaly (4)** - For unusual or interesting patterns
   - **Electrical (5)** - For electrical interference

2. **Or use keyboard shortcuts:** Press keys 1-5 to quickly label selected regions

✅ **Success:** You should see "Annotation created successfully" and a colored overlay appears on your selection.

**3.4. Label Multiple Regions**

Repeat the selection and labeling process for 3-4 different regions:

- Select a **normal baseline** region → Label as "Normal (3)"
- Select an **obvious spike** → Label as "Anomaly (4)"  
- Select a **different pattern** → Label as appropriate category

.. raw:: html

   <div style="padding: 15px; background: #e8f5e8; border-left: 4px solid #4caf50; margin: 15px 0;">
     <strong>✅ Best Practice:</strong> Label at least 3-5 regions with different characteristics for effective model training.
   </div>

Step 4: Create and Configure Model
==================================

**4.1. Switch to Models Tab**

1. Click **"Models"** tab in the left sidebar
2. Click **"Create New Model"**

**4.2. Configure Your Model**

The Model Config panel opens. Fill in:

- **Model Name:** "Anomaly Detector v1"  
- **Description:** "My first magnetic field anomaly detection model"
- **Model Type:** "Classification" (default)
- **Epochs:** 5 (for quick training)
- **Learning Rate:** 0.001 (default)

**4.3. Save Model Configuration**

1. Click **"Save Configuration"**
2. ✅ You should see "Model configuration saved"

Step 5: Train Your Model
========================

**5.1. Start Training**

1. Click the **"Training"** tab in the main content area
2. Click **"Start Training"**

**5.2. Monitor Training Progress**

You'll see real-time training progress:

- **Status:** Changes from "pending" → "running" → "completed"
- **Progress Bar:** Shows training completion percentage  
- **Epoch Counter:** Current epoch out of total epochs
- **Live Updates:** Progress updates every 2 seconds

.. raw:: html

   <div style="padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; margin: 15px 0;">
     <strong>⏱️ Training Time:</strong> With sample data and 5 epochs, training typically completes in 30-60 seconds.
   </div>

✅ **Success:** Training completes with "Training completed successfully" message.

Step 6: Review Results
=====================

**6.1. Check Training Metrics**

After training completes, you should see:

- **Accuracy:** Model performance percentage
- **Training Samples:** Number of labeled regions used
- **Model Status:** "Completed" with timestamp

**6.2. View Your Annotations**

1. Switch to **"Labels"** tab in the sidebar
2. See all your created annotations with:
   - Category names and colors
   - Time ranges (start-end indices)
   - Confidence scores

**6.3. Verify Data Visualization**

1. Go back to **"Visualization"** panel  
2. Your labeled regions should be visible as colored overlays
3. Different label types have different colors

Congratulations! 🎉
==================

You've successfully completed your first magnetic field analysis workflow:

✅ **Created** a project for organizing your work
✅ **Uploaded** and visualized magnetic field data  
✅ **Labeled** regions of interest using interactive selection
✅ **Trained** a machine learning model on your annotations
✅ **Monitored** real-time training progress
✅ **Reviewed** results and model performance

Next Steps
==========

**Explore More Features:**

1. **Upload Your Own Data** - Try with your own CSV magnetic field measurements
2. **Advanced Labeling** - Use custom categories and confidence scores
3. **Model Comparison** - Train multiple models with different configurations
4. **Large Datasets** - Test with larger files to see automatic optimization

**Learn Advanced Workflows:**

- :doc:`user_guide` - Comprehensive feature documentation
- :doc:`examples/drone_survey` - Drone magnetic survey analysis
- :doc:`examples/industrial_monitoring` - Equipment monitoring use case
- :doc:`api_reference` - Developer integration guide

**Troubleshooting:**

If something didn't work as expected:

1. **Check Browser Console** - Look for JavaScript errors
2. **Verify File Format** - Ensure CSV has required columns (timestamp_pc, b_x, b_y, b_z)
3. **Review Server Logs** - Check terminal output for Django errors
4. **Test Connectivity** - Verify http://localhost:8000/health/ responds

Common Issues & Solutions
========================

**"No data points" Error:**
   Verify your CSV file has the required column format

**Training Doesn't Start:**
   Ensure you have at least 2-3 labeled annotations

**Chart Not Loading:**
   Check browser compatibility (use Chrome/Firefox) and JavaScript enabled

**Upload Fails:**
   Verify file size (<100MB) and CSV format

**Model Training Timeout:**
   Normal for large datasets; wait longer or reduce data size

Need Help?
==========

- 📖 **Full Documentation:** https://manasp21.github.io/MagTrace/docs/
- 🐛 **Report Issues:** https://github.com/manasp21/MagTrace/issues  
- 💬 **Ask Questions:** https://github.com/manasp21/MagTrace/discussions
- 📧 **Support:** Create a GitHub issue with your question

.. raw:: html

   <div style="text-align: center; margin: 40px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
     <h3>Ready for Advanced Features?</h3>
     <p style="margin: 15px 0;">
       <a href="user_guide.html" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Continue to User Guide →</a>
     </p>
   </div>