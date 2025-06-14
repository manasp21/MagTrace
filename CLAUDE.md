# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MagTrace is a magnetic field data analysis and machine learning platform designed for interactive labeling, model training, and inference on magnetic field measurements. The system combines data visualization, ML-assisted annotation, and real-time classification capabilities.

## Technology Stack

- **Frontend**: HTML, JavaScript, CSS with D3.js for visualization
- **Backend**: Django 4.2 with SQLite database
- **ML Framework**: TensorFlow 2.15
- **Data Format**: CSV files with magnetic field sensor data
- **Packaging**: PyInstaller + Inno Setup

## Architecture Components

### Data Processing Pipeline
- CSV ingestion and validation for magnetic field data
- Data cleaning and normalization
- Feature extraction for ML models
- Visualization data preparation

### Interactive Labeling System
- Visual selection tools (brush, lasso, polygon)
- Model-assisted labeling suggestions
- Label version control and annotation preview
- Real-time feedback during annotation

### Machine Learning Lifecycle
- Model training and validation workflows
- Model registry with versioning
- Active learning for efficient data annotation
- Transfer learning support

### Inference Engine
- Batch processing capabilities for new datasets
- Real-time classification of magnetic field data
- Prediction visualization and analysis
- Result export in various formats

## Data Structure

All data files follow the format of `example/data_1.csv` with these fields:
- `timestamp_pc`: Timestamp of measurement
- `b_x`, `b_y`, `b_z`: Magnetic field components (in nT)
- `lat`, `lon`: Geographic coordinates
- `altitude`: Elevation in meters
- `thetax`, `thetay`, `thetaz`: Orientation angles
- `sensor_id`: Unique sensor identifier

## Development Context

This repository appears to be in a restructured state with core files recently removed. The system follows a sequence where users upload magnetic field data, receive ML-assisted labeling suggestions, review and edit labels, trigger model training, and run inference on new data.