#!/usr/bin/env python3
"""
MagTrace Workflow Testing Script

Author: Manas Pandey
Developed with the assistance of Claude

Tests complete end-to-end functionality including:
- Project creation
- Data upload
- Annotation system
- ML training
"""

import requests
import json
import os
import time
import sys

BASE_URL = "http://localhost:8000/api"
PROJECT_NAME = "Automated Test Project"
TEST_DATA_FILE = "example/data_1.csv"

def test_health():
    """Test server health"""
    try:
        response = requests.get("http://localhost:8000/health/", timeout=5)
        if response.status_code == 200:
            print("✅ Server health check passed")
            return True
        else:
            print(f"❌ Server health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Server health check failed: {e}")
        return False

def test_project_creation():
    """Test project creation API"""
    try:
        # Get CSRF token first
        session = requests.Session()
        csrf_response = session.get("http://localhost:8000/app/")
        
        if 'csrftoken' in session.cookies:
            csrf_token = session.cookies['csrftoken']
        else:
            print("⚠️ No CSRF token found, proceeding without it")
            csrf_token = None

        project_data = {
            "name": PROJECT_NAME,
            "description": "Automated testing project for workflow validation"
        }
        
        headers = {
            'Content-Type': 'application/json',
        }
        
        if csrf_token:
            headers['X-CSRFToken'] = csrf_token
        
        response = session.post(f"{BASE_URL}/projects/", 
                               json=project_data, 
                               headers=headers)
        
        if response.status_code in [200, 201]:
            project = response.json()
            print(f"✅ Project created successfully: ID {project['id']}")
            return project['id'], session
        else:
            print(f"❌ Project creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None, session
            
    except Exception as e:
        print(f"❌ Project creation failed: {e}")
        return None, None

def test_data_upload(project_id, session):
    """Test CSV data upload"""
    try:
        if not os.path.exists(TEST_DATA_FILE):
            print(f"❌ Test data file not found: {TEST_DATA_FILE}")
            return None
            
        with open(TEST_DATA_FILE, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {'project': project_id}
            
            # Get CSRF token from session
            csrf_token = session.cookies.get('csrftoken')
            headers = {}
            if csrf_token:
                headers['X-CSRFToken'] = csrf_token
            
            response = session.post(f"{BASE_URL}/datasets/upload/",
                                  files=files,
                                  data=data,
                                  headers=headers)
        
        if response.status_code in [200, 201]:
            dataset = response.json()
            print(f"✅ Dataset uploaded successfully: ID {dataset['id']}")
            return dataset['id']
        else:
            print(f"❌ Dataset upload failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Dataset upload failed: {e}")
        return None

def test_data_retrieval(dataset_id, session):
    """Test dataset data retrieval"""
    try:
        response = session.get(f"{BASE_URL}/datasets/{dataset_id}/data/")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                data_points = len(data)
            else:
                data_points = len(data.get('data', []))
            print(f"✅ Data retrieval successful: {data_points} data points")
            return data_points > 0
        else:
            print(f"❌ Data retrieval failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Data retrieval failed: {e}")
        return False

def test_annotation_creation(dataset_id, session):
    """Test annotation creation"""
    try:
        # First, create or get a label category
        category_data = {
            "name": "test_anomaly",
            "color": "#ff0000", 
            "project": None  # Will be set based on dataset's project
        }
        
        csrf_token = session.cookies.get('csrftoken')
        headers = {'Content-Type': 'application/json'}
        if csrf_token:
            headers['X-CSRFToken'] = csrf_token
        
        # Get dataset info to find project
        dataset_response = session.get(f"{BASE_URL}/datasets/{dataset_id}/")
        if dataset_response.status_code == 200:
            dataset_info = dataset_response.json()
            project_id = dataset_info.get('project')
            category_data['project'] = project_id
        
        # Create label category
        category_response = session.post(f"{BASE_URL}/label-categories/",
                                       json=category_data,
                                       headers=headers)
        
        if category_response.status_code in [200, 201]:
            category = category_response.json()
            category_id = category['id']
        else:
            # Try to get existing category
            categories_response = session.get(f"{BASE_URL}/label-categories/")
            if categories_response.status_code == 200:
                categories = categories_response.json()
                if categories:
                    category_id = categories[0]['id']
                else:
                    print(f"❌ No label categories available")
                    return None
            else:
                print(f"❌ Failed to create or get label category")
                return None
        
        # Now create annotation with correct fields
        annotation_data = {
            "dataset": dataset_id,
            "category": category_id,
            "start_index": 0,
            "end_index": 10,
            "confidence": 0.95,
            "notes": "Automated test annotation"
        }
        
        response = session.post(f"{BASE_URL}/annotations/",
                              json=annotation_data,
                              headers=headers)
        
        if response.status_code in [200, 201]:
            annotation = response.json()
            print(f"✅ Annotation created successfully: ID {annotation['id']}")
            return annotation['id']
        else:
            print(f"❌ Annotation creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Annotation creation failed: {e}")
        return None

def test_training_system(dataset_id, session):
    """Test ML training system"""
    try:
        # Get dataset info to find project
        dataset_response = session.get(f"{BASE_URL}/datasets/{dataset_id}/")
        if dataset_response.status_code != 200:
            print(f"❌ Could not get dataset info")
            return False
        
        dataset_info = dataset_response.json()
        project_id = dataset_info.get('project')
        
        # First create a user model
        model_data = {
            "name": "Test Anomaly Detector",
            "model_type": "classification",
            "python_script": "# Simple test script\nprint('Test model')",
            "project": project_id,
            "hyperparameters": {
                "n_estimators": 10,
                "max_depth": 3
            }
        }
        
        csrf_token = session.cookies.get('csrftoken')
        headers = {'Content-Type': 'application/json'}
        if csrf_token:
            headers['X-CSRFToken'] = csrf_token
        
        # Create model first
        model_response = session.post(f"{BASE_URL}/user-models/",
                                    json=model_data,
                                    headers=headers)
        
        if model_response.status_code in [200, 201]:
            model = model_response.json()
            model_id = model['id']
            print(f"✅ Model created successfully: ID {model_id}")
        else:
            print(f"❌ Model creation failed: {model_response.status_code}")
            print(f"Response: {model_response.text}")
            return False
        
        # Now start training session
        training_data = {
            "model_name": "Test Anomaly Detector",
            "dataset": dataset_id,
            "model": model_id,
            "total_epochs": 5  # Small for fast testing
        }
        
        response = session.post(f"{BASE_URL}/training-sessions/",
                              json=training_data,
                              headers=headers)
        
        if response.status_code in [200, 201]:
            training_info = response.json()
            session_id = training_info.get('id')
            print(f"✅ Training started successfully: Session {session_id}")
            
            # Monitor training progress
            return monitor_training(session_id, session)
        else:
            print(f"❌ Training start failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Training start failed: {e}")
        return False

def monitor_training(session_id, session, timeout=30):
    """Monitor training progress"""
    try:
        start_time = time.time()
        last_status = None
        
        while time.time() - start_time < timeout:
            response = session.get(f"{BASE_URL}/training-sessions/{session_id}/")
            
            if response.status_code == 200:
                status = response.json()
                current_status = status.get('status')
                progress = status.get('progress', 0)
                
                if current_status != last_status:
                    print(f"📊 Training status: {current_status} ({progress:.1%})")
                    last_status = current_status
                
                if current_status == 'completed':
                    metrics = status.get('final_metrics', {})
                    print(f"✅ Training completed successfully")
                    if metrics:
                        print(f"   Final metrics: {metrics}")
                    return True
                elif current_status == 'failed':
                    error_msg = status.get('error_message', 'Unknown error')
                    training_logs = status.get('training_logs', [])
                    if training_logs:
                        last_log = training_logs[-1]
                        error_msg = last_log.get('message', error_msg)
                    print(f"❌ Training failed: {error_msg}")
                    return False
                    
                time.sleep(2)  # Check every 2 seconds
            else:
                print(f"❌ Training status check failed: {response.status_code}")
                return False
        
        print(f"⚠️ Training timeout after {timeout} seconds")
        return False
        
    except Exception as e:
        print(f"❌ Training monitoring failed: {e}")
        return False

def run_complete_workflow_test():
    """Run complete workflow test"""
    print("🚀 Starting MagTrace Workflow Test")
    print("=" * 50)
    
    # Test 1: Health check
    if not test_health():
        print("❌ Cannot proceed - server not responding")
        return False
    
    # Test 2: Project creation
    project_id, session = test_project_creation()
    if not project_id:
        print("❌ Cannot proceed - project creation failed")
        return False
    
    # Test 3: Data upload
    dataset_id = test_data_upload(project_id, session)
    if not dataset_id:
        print("❌ Cannot proceed - data upload failed")
        return False
    
    # Test 4: Data retrieval
    if not test_data_retrieval(dataset_id, session):
        print("❌ Data retrieval failed")
        return False
    
    # Test 5: Annotation creation
    annotation_id = test_annotation_creation(dataset_id, session)
    if not annotation_id:
        print("⚠️ Annotation creation failed - training may not work")
    
    # Test 6: ML training system
    if not test_training_system(dataset_id, session):
        print("❌ ML training system failed")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All workflow tests completed successfully!")
    return True

if __name__ == "__main__":
    success = run_complete_workflow_test()
    sys.exit(0 if success else 1)