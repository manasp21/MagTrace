# MagTrace User Guide

**Author: Manas Pandey**  
*Developed with the assistance of Claude*

## Getting Started

### What is MagTrace?
MagTrace is a professional magnetic field data analysis platform that simplifies the process of:
- Loading magnetic field sensor data
- Visually identifying patterns and anomalies
- Creating labeled training data
- Training machine learning models
- Analyzing results

### Quick Start Workflow
1. **Start Application** → Access at http://localhost:8000/app/
2. **Load Data** → Upload CSV files with magnetic field measurements
3. **Visualize** → View interactive time-series charts
4. **Select & Label** → Use brush selection to mark regions of interest
5. **Train Model** → Create ML models for pattern recognition
6. **Analyze** → Review results and predictions

## Data Requirements

### CSV File Format
Your CSV files must contain these columns:
```csv
timestamp_pc,b_x,b_y,b_z,lat,lon,altitude,thetax,thetay,thetaz,sensor_id
1623456789,0.25,-0.15,0.30,40.7128,-74.0060,100,0.1,0.2,0.3,sensor_01
```

**Required Columns:**
- `timestamp_pc` - PC timestamp (Unix timestamp)
- `b_x, b_y, b_z` - Magnetic field components (Tesla)
- `lat, lon` - GPS coordinates (decimal degrees)
- `altitude` - Altitude in meters
- `thetax, thetay, thetaz` - Sensor orientation angles
- `sensor_id` - Unique sensor identifier

### Data Quality Tips
- Ensure timestamps are in chronological order
- Remove duplicate timestamps
- Check for missing values in critical columns
- Verify magnetic field values are in reasonable ranges

## Using the Interface

### 1. Project Management
**Creating Projects:**
1. Click "New Project" 
2. Enter project name and description
3. Click "Create"

**Switching Projects:**
- Use the project dropdown to switch between projects
- Each project can contain multiple datasets

### 2. Data Upload
**Upload Process:**
1. Select your project
2. Click "Upload Dataset"
3. Choose CSV file from your computer
4. Enter dataset name
5. Click "Upload"

**Upload Status:**
- Green indicator: Upload successful
- Red indicator: Upload failed (check CSV format)
- Progress bar shows upload progress

### 3. Data Visualization

**Chart Controls:**
- **Zoom**: Mouse wheel or zoom controls
- **Pan**: Click and drag to move around
- **Reset**: Double-click to reset view
- **Component Selection**: Choose which magnetic field components to display

**Performance Features:**
- Large datasets automatically decimated for smooth visualization
- Original data preserved for analysis
- Responsive rendering for datasets up to 50,000+ points

### 4. Interactive Labeling

**Selection Mode:**
1. Click "Selection Mode" toggle to enable
2. Brush selection now active on charts

**Making Selections:**
1. Click and drag on chart to select time range
2. Selection highlighted in blue
3. Selection details shown in info panel

**Quick Labeling:**
- **Button Method**: Click label buttons (Normal, Anomaly, etc.)
- **Keyboard Method**: Press keys 1-5 for rapid labeling
  - `1` = Normal
  - `2` = Anomaly  
  - `3` = Interference
  - `4` = Calibration
  - `5` = Unknown

**Labeling Workflow:**
1. Select time range with brush
2. Choose appropriate label
3. Add notes (optional)
4. Click "Save Annotation"
5. Repeat for all regions of interest

### 5. Annotation Management

**Viewing Annotations:**
- Colored overlays on charts show labeled regions
- Annotation list shows all labels with timestamps
- Click annotations to jump to time range

**Editing Annotations:**
1. Click annotation in list
2. Modify label, confidence, or notes
3. Click "Update"

**Deleting Annotations:**
1. Select annotation in list
2. Click "Delete" button
3. Confirm deletion

### 6. Machine Learning Training

**Starting Training:**
1. Ensure you have labeled data (annotations)
2. Click "Train Model"
3. Enter model name
4. Select algorithm (Random Forest recommended)
5. Click "Start Training"

**Monitoring Progress:**
- Real-time progress bar
- Current training step display
- Estimated completion time
- Training metrics (accuracy, precision, recall)

**Training Status:**
- **Preparing**: Loading and processing data
- **Feature Extraction**: Analyzing magnetic field characteristics
- **Model Training**: Training machine learning algorithm
- **Validation**: Testing model performance
- **Complete**: Training finished successfully

### 7. Model Management

**Viewing Models:**
- Trained models list shows all created models
- Performance metrics displayed
- Creation date and dataset information

**Using Models:**
1. Select trained model
2. Choose dataset for prediction
3. View prediction results
4. Compare with existing annotations

## Advanced Features

### Keyboard Shortcuts
- `1-5` - Quick labeling when in selection mode
- `Ctrl+Z` - Undo last annotation
- `Space` - Toggle selection mode
- `R` - Reset chart view
- `S` - Save current project

### Performance Optimization
**Large Dataset Handling:**
- Automatic decimation for datasets > 5,000 points
- Preserves statistical properties
- Maintains anomaly visibility
- Training uses original full-resolution data

**Memory Management:**
- Efficient data loading with chunking
- Client-side caching for smooth navigation
- Background processing for training

### Data Export
**Exporting Annotations:**
1. Go to project management
2. Select "Export Annotations"
3. Choose format (CSV, JSON)
4. Download file

**Exporting Models:**
1. Select trained model
2. Click "Export Model"
3. Save model file for external use

## Troubleshooting

### Common Issues

**Upload Failures:**
- Check CSV format matches required columns
- Ensure file is not corrupted
- Verify file size is reasonable (< 100MB recommended)

**Slow Performance:**
- Close other browser tabs
- Refresh page if visualization becomes unresponsive
- Use Chrome or Firefox for best performance

**Training Failures:**
- Ensure sufficient labeled data (minimum 10 annotations)
- Check that annotations cover diverse patterns
- Verify adequate system memory available

**Visualization Issues:**
- Refresh browser if charts don't load
- Check browser console for JavaScript errors
- Ensure modern browser (Chrome 90+, Firefox 88+)

### Error Messages

**"Invalid CSV format":**
- Check column names match exactly
- Ensure no missing required columns
- Verify data types are correct

**"Insufficient training data":**
- Create more annotations (minimum 10 recommended)
- Ensure multiple label categories represented
- Check that annotations span different time periods

**"Training timeout":**
- Reduce dataset size or increase timeout
- Check system resources (CPU, memory)
- Try simpler algorithm (Random Forest vs Neural Network)

### Performance Tips

**For Best Experience:**
- Use datasets under 50,000 points for interactive work
- Create annotations before loading very large datasets
- Close unused browser tabs
- Use keyboard shortcuts for rapid labeling

**System Requirements:**
- Modern web browser (Chrome 90+, Firefox 88+)
- 4GB+ RAM recommended
- Stable internet connection for uploads

## Best Practices

### Data Labeling
1. **Consistent Labeling**: Use same criteria for similar patterns
2. **Diverse Examples**: Label various types of each category
3. **Quality over Quantity**: Better to have fewer high-quality labels
4. **Regular Review**: Periodically review and update annotations

### Model Training
1. **Balanced Data**: Ensure all label categories are represented
2. **Validation**: Always review training metrics before deployment
3. **Iterative Improvement**: Retrain with additional data as needed
4. **Documentation**: Record model parameters and performance

### Project Organization
1. **Descriptive Names**: Use clear project and dataset names
2. **Regular Backups**: Export annotations and models regularly
3. **Version Control**: Keep track of model versions and changes
4. **Documentation**: Maintain notes about data sources and analysis goals

## Support

### Getting Help
- Check this user guide for common solutions
- Review API documentation for technical details
- Examine browser console for error messages
- Test with provided example datasets first

### Reporting Issues
When reporting problems, include:
- Browser type and version
- Dataset size and format
- Error messages (if any)
- Steps to reproduce the issue
- Screenshots of the problem

---

**Ready to start analyzing magnetic field data? Begin with the Quick Start Workflow above!**