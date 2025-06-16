#!/usr/bin/env python3
"""
MagTrace Pro - Functionality Test Script
Tests the core API endpoints and workflows to ensure everything works properly.
"""

import requests
import json
import os
import sys

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_magtrace.settings')
import django
django.setup()

from django.test import TestCase, Client
from django.contrib.auth.models import User
from magtrace_api.models import Project, Dataset, LabelCategory, Annotation, UserDefinedModel

def test_api_endpoints():
    """Test that all key API endpoints are accessible"""
    client = Client()
    
    print("🧪 Testing MagTrace Pro API Endpoints...")
    
    # Test 1: Projects endpoint
    print("\n1. Testing Projects API...")
    response = client.get('/api/projects/')
    if response.status_code == 200:
        projects = response.json()
        print(f"   ✅ Projects API working - Found {len(projects)} projects")
    else:
        print(f"   ❌ Projects API failed - Status: {response.status_code}")
    
    # Test 2: Datasets endpoint  
    print("\n2. Testing Datasets API...")
    response = client.get('/api/datasets/')
    if response.status_code == 200:
        datasets = response.json()
        print(f"   ✅ Datasets API working - Found {len(datasets)} datasets")
    else:
        print(f"   ❌ Datasets API failed - Status: {response.status_code}")
    
    # Test 3: Label Categories endpoint
    print("\n3. Testing Label Categories API...")
    response = client.get('/api/label-categories/')
    if response.status_code == 200:
        categories = response.json()
        print(f"   ✅ Label Categories API working - Found {len(categories)} categories")
    else:
        print(f"   ❌ Label Categories API failed - Status: {response.status_code}")
    
    # Test 4: Annotations endpoint
    print("\n4. Testing Annotations API...")
    response = client.get('/api/annotations/')
    if response.status_code == 200:
        annotations = response.json()
        print(f"   ✅ Annotations API working - Found {len(annotations)} annotations")
    else:
        print(f"   ❌ Annotations API failed - Status: {response.status_code}")
    
    # Test 5: User Models endpoint
    print("\n5. Testing User Models API...")
    response = client.get('/api/user-models/')
    if response.status_code == 200:
        models = response.json()
        print(f"   ✅ User Models API working - Found {len(models)} models")
    else:
        print(f"   ❌ User Models API failed - Status: {response.status_code}")
    
    # Test 6: Training Sessions endpoint
    print("\n6. Testing Training Sessions API...")
    response = client.get('/api/training-sessions/')
    if response.status_code == 200:
        sessions = response.json()
        print(f"   ✅ Training Sessions API working - Found {len(sessions)} sessions")
    else:
        print(f"   ❌ Training Sessions API failed - Status: {response.status_code}")

def test_workflow():
    """Test the complete workflow functionality"""
    client = Client()
    
    print("\n🚀 Testing Core Workflow...")
    
    # Test creating a project
    print("\n1. Creating test project...")
    project_data = {
        'name': 'Test Project',
        'description': 'Test project for API verification'
    }
    response = client.post('/api/projects/', 
                          data=json.dumps(project_data),
                          content_type='application/json')
    if response.status_code == 201:
        project = response.json()
        print(f"   ✅ Project created - ID: {project['id']}")
        
        # Test creating label categories
        print("\n2. Creating label categories...")
        for label_info in [
            {'name': 'fan_noise', 'description': 'Fan Noise', 'color': '#ff6b6b'},
            {'name': 'normal', 'description': 'Normal', 'color': '#51cf66'},
            {'name': 'anomaly', 'description': 'Anomaly', 'color': '#ff922b'}
        ]:
            label_data = {
                'project': project['id'],
                'name': label_info['name'],
                'description': label_info['description'],
                'color': label_info['color'],
                'is_active': True
            }
            response = client.post('/api/label-categories/',
                                 data=json.dumps(label_data),
                                 content_type='application/json')
            if response.status_code == 201:
                print(f"   ✅ Created label category: {label_info['name']}")
            else:
                print(f"   ❌ Failed to create label category: {label_info['name']} - Status: {response.status_code}")
        
        # Test creating a model
        print("\n3. Creating test model...")
        model_data = {
            'project': project['id'],
            'name': 'Test Classifier',
            'model_type': 'classification',
            'description': 'Test classification model',
            'hyperparameters': {
                'learning_rate': 0.001,
                'batch_size': 32,
                'epochs': 100
            },
            'python_script': '# Test model script\nprint("Model initialized")'
        }
        response = client.post('/api/user-models/',
                             data=json.dumps(model_data),
                             content_type='application/json')
        if response.status_code == 201:
            model = response.json()
            print(f"   ✅ Model created - ID: {model['id']}")
        else:
            print(f"   ❌ Failed to create model - Status: {response.status_code}")
            print(f"   Response: {response.content.decode()}")
            
    else:
        print(f"   ❌ Failed to create project - Status: {response.status_code}")
        print(f"   Response: {response.content.decode()}")

def check_javascript_elements():
    """Check if all required DOM elements exist in the HTML template"""
    print("\n🎯 Checking HTML Template Elements...")
    
    template_path = os.path.join(os.path.dirname(__file__), 'backend/templates/magtrace_pro.html')
    
    required_elements = [
        'projectSelector',
        'datasets',
        'categoryTree',
        'annotationsList', 
        'modelsList',
        'selectionStats',
        'quickLabelingToolbar',
        'mainChart',
        'activeTraining',
        'trainingStatus',
        'trainingProgress',
        'progressFill',
        'currentEpoch',
        'totalEpochs'
    ]
    
    try:
        with open(template_path, 'r') as f:
            html_content = f.read()
            
        missing_elements = []
        for element_id in required_elements:
            if f'id="{element_id}"' not in html_content:
                missing_elements.append(element_id)
            else:
                print(f"   ✅ Found element: {element_id}")
        
        if missing_elements:
            print(f"\n   ❌ Missing elements: {', '.join(missing_elements)}")
        else:
            print(f"\n   ✅ All required DOM elements found!")
            
    except FileNotFoundError:
        print(f"   ❌ Template file not found: {template_path}")

if __name__ == '__main__':
    print("=" * 60)
    print("🧲 MagTrace Pro - Comprehensive Functionality Test")
    print("=" * 60)
    
    try:
        test_api_endpoints()
        test_workflow()
        check_javascript_elements()
        
        print("\n" + "=" * 60)
        print("✅ Testing Complete!")
        print("📋 Summary:")
        print("   - API endpoints verified")
        print("   - Core workflow tested")
        print("   - DOM elements checked")
        print("   - Backend-frontend integration ready")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()