import logging
import importlib
from .ml_adapters import tf_adapter, torch_adapter
import os
import time
from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)

# Global registry for loaded models
MODEL_REGISTRY = {}

def load_model_adapter(framework):
    """Dynamically load the appropriate ML adapter"""
    try:
        if framework == 'tensorflow':
            return tf_adapter
        elif framework == 'pytorch':
            return torch_adapter
        else:
            raise ValueError(f"Unsupported framework: {framework}")
    except ImportError as e:
        logger.error(f"Failed to import {framework} adapter: {str(e)}")
        raise

def get_model(model_id):
    """Retrieve a loaded model from the registry"""
    return MODEL_REGISTRY.get(model_id)

@shared_task(bind=True)
def train_model_async(self, model_config):
    """Celery task for asynchronous model training"""
    try:
        framework = model_config.get('framework', 'tensorflow').lower()
        adapter = load_model_adapter(framework)
        
        # Create models directory if it doesn't exist
        models_dir = os.path.join(settings.BASE_DIR, 'models')
        os.makedirs(models_dir, exist_ok=True)
        
        # Execute training
        result = adapter.train(model_config, model_config['dataset_path'])
        
        # Update task state
        self.update_state(state='SUCCESS', meta=result)
        return result
    except Exception as e:
        logger.error(f"Training task failed: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True)
def predict_async(self, model_id, input_data):
    """Celery task for asynchronous prediction"""
    try:
        model = get_model(model_id)
        if not model:
            raise ValueError(f"Model {model_id} not found in registry")
        
        # Execute prediction
        result = model.predict(model['path'], input_data)
        
        # Update task state
        self.update_state(state='SUCCESS', meta={'predictions': result})
        return result
    except Exception as e:
        logger.error(f"Prediction task failed: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def load_model(model_path, framework):
    """Load a model into memory and register it"""
    try:
        adapter = load_model_adapter(framework)
        
        # For demonstration, we just store the model info
        # In a real implementation, we would load the model here
        model_id = f"model_{len(MODEL_REGISTRY) + 1}"
        MODEL_REGISTRY[model_id] = {
            'id': model_id,
            'path': model_path,
            'framework': framework,
            'loaded_at': time.time()
        }
        logger.info(f"Model loaded: {model_id}")
        return model_id
    except Exception as e:
        logger.error(f"Model loading failed: {str(e)}")
        raise

def unload_model(model_id):
    """Unload a model from memory"""
    if model_id in MODEL_REGISTRY:
        del MODEL_REGISTRY[model_id]
        logger.info(f"Model unloaded: {model_id}")
        return True
    return False

def get_training_progress(task_id):
    """Get progress of a training task"""
    # In a real implementation, this would query Celery task status
    return {"status": "PENDING", "progress": 0}