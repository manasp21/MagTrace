---
layout: default
title: MagTrace - Magnetic Field Analysis Platform
description: Professional ML workflow for magnetic field data analysis
---

# MagTrace

**Professional ML Workflow for Magnetic Field Data Analysis**

Author: Manas Pandey  
Developed with the assistance of Claude

## Overview

MagTrace is a streamlined machine learning platform designed for magnetic field data analysis. It provides a clean, professional workflow for loading data, creating labels, and training models for anomaly detection and pattern recognition.

## Quick Links

### 📚 Documentation
- [User Guide](docs/user_guide.html) - Complete user documentation
- [API Reference](docs/api_reference.html) - Developer API documentation  
- [Installation Guide](docs/installation.html) - Setup instructions
- [Testing Results](docs/testing_results.html) - System verification

### 🚀 Getting Started
- [Development Setup](docs/development.html) - Developer environment setup
- [Usage Examples](docs/usage_examples.html) - Common workflows
- [Troubleshooting](docs/troubleshooting.html) - Problem solving guide

### 🔬 Technical Details
- [Architecture](docs/architecture.html) - System design overview
- [API Endpoints](docs/api_endpoints.html) - Complete API documentation
- [Database Schema](docs/database_schema.html) - Data model reference

## Key Features

- **Simple Workflow**: Load data → Select ranges → Label → Train → Predict
- **Fast Performance**: Optimized for speed and responsiveness with data decimation
- **Interactive Labeling**: Brush selection on charts with instant labeling capability
- **Keyboard Shortcuts**: Rapid labeling with hotkeys (1-5)
- **Professional UI**: Clean interface without emojis or clutter
- **Working ML Training**: Reliable scikit-learn based training system
- **Real-time Progress**: Live training monitoring with progress bars

## Technology Stack

- **Backend**: Django 4.2 + Django REST Framework
- **Database**: SQLite for local data storage
- **Frontend**: HTML5 + JavaScript + D3.js for interactive charts
- **ML Framework**: scikit-learn (primary) with TensorFlow fallback
- **Interface**: Streamlined, professional UI design
- **Data Format**: CSV files with magnetic field measurements

## Quick Start

1. **Clone Repository**
   ```bash
   git clone https://github.com/manasp21/MagTrace.git
   cd MagTrace
   ```

2. **Setup Environment**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Run Application**
   ```bash
   python3 run.py
   ```

4. **Access Interface**
   - Main App: http://localhost:8000/app/
   - API: http://localhost:8000/api/
   - Admin: http://localhost:8000/admin/

## Status

✅ **Implementation Complete** - All core components functional  
⚠️ **Testing Required** - End-to-end workflow verification needed  
📊 **Performance Optimized** - Data decimation and UI improvements added

## Repository

[GitHub Repository](https://github.com/manasp21/MagTrace) - Source code and development

---

*Generated documentation available at: [https://manasp21.github.io/MagTrace/docs/index.html](https://manasp21.github.io/MagTrace/docs/index.html)*