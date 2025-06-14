from celery import Celery
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_magtrace.settings')

app = Celery('magtrace')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task
def train_model_task(dataset_id, model_name, model_type, version, parameters):
    """
    Celery task for training ML models in the background
    """
    from .ml_service import ml_service
    from .models import MLModel, Dataset
    
    try:
        # Train the model
        model, metrics, model_path = ml_service.train_model(
            dataset_id=dataset_id,
            model_type=model_type,
            parameters=parameters
        )
        
        # Create model record in database
        dataset = Dataset.objects.get(id=dataset_id)
        ml_model = MLModel.objects.create(
            name=model_name,
            model_type=model_type,
            version=version,
            training_dataset=dataset,
            parameters=parameters,
            metrics=metrics,
            model_file=model_path,
            is_active=False
        )
        
        return {
            'status': 'success',
            'model_id': ml_model.id,
            'metrics': metrics
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

@app.task
def generate_suggestions_task(dataset_id, model_id):
    """
    Celery task for generating active learning suggestions
    """
    from .ml_service import ml_service
    from .models import MLModel, ActiveLearningSuggestion, Dataset
    
    try:
        # Load the model
        model = MLModel.objects.get(id=model_id)
        if model.model_file:
            ml_service.load_model(model.model_file)
        
        # Generate suggestions
        suggestions = ml_service.generate_active_learning_suggestions(
            dataset_id=dataset_id,
            model_type=model.model_type
        )
        
        # Save suggestions to database
        dataset = Dataset.objects.get(id=dataset_id)
        suggestion_objects = []
        
        for suggestion in suggestions:
            suggestion_obj = ActiveLearningSuggestion(
                dataset=dataset,
                start_index=suggestion['index'],
                end_index=suggestion['index'],
                suggested_label=suggestion['suggestion'],
                confidence=suggestion['confidence']
            )
            suggestion_objects.append(suggestion_obj)
        
        ActiveLearningSuggestion.objects.bulk_create(suggestion_objects)
        
        return {
            'status': 'success',
            'suggestions_count': len(suggestion_objects)
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

@app.task
def run_inference_task(dataset_id, model_id):
    """
    Celery task for running inference on a dataset
    """
    from .ml_service import ml_service
    from .models import MLModel, Dataset, InferenceResult
    
    try:
        # Load the model
        model = MLModel.objects.get(id=model_id)
        if model.model_file:
            ml_service.load_model(model.model_file)
        
        # Load dataset
        dataset = Dataset.objects.get(id=dataset_id)
        readings = list(dataset.readings.all().order_by('timestamp_pc'))
        
        # Run inference
        predictions, confidence_scores = ml_service.predict(
            readings,
            model_type=model.model_type
        )
        
        # Save results
        inference_result = InferenceResult.objects.create(
            dataset=dataset,
            model=model,
            predictions=predictions,
            confidence_scores=confidence_scores
        )
        
        return {
            'status': 'success',
            'inference_result_id': inference_result.id,
            'predictions_count': len(predictions)
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }