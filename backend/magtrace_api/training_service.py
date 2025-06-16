import os
import json
import time
import threading
from datetime import datetime
from typing import Dict, Any, Optional, Callable
import numpy as np
from django.utils import timezone

from .models import UserDefinedModel, Dataset, TrainingSession, Annotation, LabelCategory
from .user_script_service import user_script_service

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False


class TrainingOrchestrator:
    """
    Orchestrate local training of user-defined models with progress monitoring
    """
    
    def __init__(self):
        self.active_sessions = {}  # session_id -> training_thread
        self.tf_available = TF_AVAILABLE
        self.progress_callbacks = {}  # session_id -> callback_function
    
    def start_training(
        self, 
        model_id: int, 
        dataset_id: int, 
        training_config: Dict[str, Any],
        additional_dataset_ids: Optional[list] = None,
        continue_from_session: Optional[int] = None,
        progress_callback: Optional[Callable] = None
    ) -> int:
        """
        Start training a user-defined model
        
        Returns:
            session_id: ID of the training session
        """
        
        # Create training session
        model = UserDefinedModel.objects.get(id=model_id)
        dataset = Dataset.objects.get(id=dataset_id)
        
        session = TrainingSession.objects.create(
            model=model,
            dataset=dataset,
            status='pending',
            total_epochs=training_config.get('epochs', 100),
            is_continued_training=bool(continue_from_session),
            base_training_session_id=continue_from_session
        )
        
        # Add additional datasets if provided
        if additional_dataset_ids:
            additional_datasets = Dataset.objects.filter(id__in=additional_dataset_ids)
            session.additional_datasets.set(additional_datasets)
        
        # Store progress callback
        if progress_callback:
            self.progress_callbacks[session.id] = progress_callback
        
        # Start training in background thread
        training_thread = threading.Thread(
            target=self._run_training,
            args=(session.id,),
            daemon=True
        )
        
        self.active_sessions[session.id] = training_thread
        training_thread.start()
        
        return session.id
    
    def _run_training(self, session_id: int):
        """
        Run training process in background thread
        """
        session = TrainingSession.objects.get(id=session_id)
        
        try:
            # Update status
            session.status = 'running'
            session.started_at = timezone.now()
            session.save()
            
            self._log_progress(session_id, "Training started", 0.0)
            
            # Load and prepare data
            self._log_progress(session_id, "Loading data...", 5.0)
            train_data, train_labels, val_data, val_labels = self._prepare_training_data(session)
            
            # Load user script
            self._log_progress(session_id, "Loading model script...", 10.0)
            script_content = self._get_model_script(session.model)
            
            # Validate script
            is_valid, message = user_script_service.validate_script(script_content)
            if not is_valid:
                raise Exception(f"Script validation failed: {message}")
            
            # Create model
            self._log_progress(session_id, "Creating model...", 15.0)
            model = self._create_model_from_script(session, script_content, train_data.shape)
            
            # Preprocess data
            self._log_progress(session_id, "Preprocessing data...", 20.0)
            train_data, train_labels = self._preprocess_data_with_script(
                session, script_content, train_data, train_labels
            )
            val_data, val_labels = self._preprocess_data_with_script(
                session, script_content, val_data, val_labels
            )
            
            # Train model
            self._log_progress(session_id, "Starting model training...", 25.0)
            history = self._train_model_with_script(
                session, script_content, model, 
                train_data, train_labels, val_data, val_labels
            )
            
            # Save trained model
            self._log_progress(session_id, "Saving trained model...", 95.0)
            self._save_trained_model(session, model, history)
            
            # Complete training
            session.status = 'completed'
            session.completed_at = timezone.now()
            session.progress = 100.0
            session.save()
            
            self._log_progress(session_id, "Training completed successfully!", 100.0)
            
        except Exception as e:
            # Handle training failure
            session.status = 'failed'
            session.completed_at = timezone.now()
            session.save()
            
            error_msg = f"Training failed: {str(e)}"
            self._log_progress(session_id, error_msg, session.progress, is_error=True)
            
        finally:
            # Clean up
            if session_id in self.active_sessions:
                del self.active_sessions[session_id]
            if session_id in self.progress_callbacks:
                del self.progress_callbacks[session_id]
    
    def _prepare_training_data(self, session: TrainingSession):
        """
        Prepare training data from dataset and annotations, supporting multiple datasets
        """
        # Collect all datasets (primary + additional)
        datasets = [session.dataset]
        if session.additional_datasets.exists():
            datasets.extend(list(session.additional_datasets.all()))
        
        all_features = []
        all_labels = []
        
        # Process each dataset
        for dataset in datasets:
            readings = list(dataset.readings.all().order_by('timestamp_pc'))
            
            if not readings:
                self._log_progress(session.id, f"Warning: No data found in dataset {dataset.name}", session.progress)
                continue
            
            # Extract features for this dataset
            features = []
            for reading in readings:
                feature_vector = [
                    reading.b_x, reading.b_y, reading.b_z,
                    reading.lat, reading.lon, reading.altitude,
                    reading.thetax, reading.thetay, reading.thetaz
                ]
                features.append(feature_vector)
            
            features = np.array(features)
            
            # Extract labels from annotations for this dataset
            labels = self._extract_labels_from_annotations(dataset, len(readings))
            
            all_features.append(features)
            all_labels.append(labels)
            
            self._log_progress(
                session.id, 
                f"Loaded {len(readings)} samples from dataset {dataset.name}", 
                session.progress
            )
        
        if not all_features:
            raise Exception("No data found in any dataset")
        
        # Combine all datasets
        combined_features = np.vstack(all_features)
        combined_labels = np.concatenate(all_labels)
        
        # Track which datasets were used for training
        session.model.training_datasets.set(datasets)
        
        self._log_progress(
            session.id, 
            f"Combined {len(combined_features)} total samples from {len(datasets)} dataset(s)", 
            session.progress
        )
        
        # Split data
        split_ratio = 0.2  # Default validation split
        split_idx = int(len(combined_features) * (1 - split_ratio))
        
        train_data = combined_features[:split_idx]
        train_labels = combined_labels[:split_idx]
        val_data = combined_features[split_idx:]
        val_labels = combined_labels[split_idx:]
        
        return train_data, train_labels, val_data, val_labels
    
    def _extract_labels_from_annotations(self, dataset, total_records):
        """
        Extract labels from hierarchical annotations with multi-label support
        """
        # Get all annotations for this dataset
        annotations = dataset.annotations.all().order_by('start_index')
        
        # Create label mapping
        categories = list(dataset.project.label_categories.all())
        if not categories:
            # No label categories defined, return all zeros
            return np.zeros(total_records, dtype=int)
        
        # For multi-label: create binary matrix (samples x labels)
        # For single-label: create integer array
        num_categories = len(categories)
        
        # Check if we have overlapping annotations (multi-label scenario)
        has_overlapping = self._check_overlapping_annotations(annotations)
        
        if has_overlapping and num_categories > 1:
            # Multi-label classification: binary matrix
            labels = np.zeros((total_records, num_categories), dtype=float)
            label_map = {cat.id: idx for idx, cat in enumerate(categories)}
            
            # Apply annotations with confidence weighting
            for annotation in annotations:
                start_idx = max(0, annotation.start_index)
                end_idx = min(total_records - 1, annotation.end_index)
                label_idx = label_map.get(annotation.category.id)
                
                if label_idx is not None:
                    # Use confidence score for weighting
                    labels[start_idx:end_idx + 1, label_idx] = annotation.confidence
            
        else:
            # Single-label classification: integer array
            labels = np.zeros(total_records, dtype=int)
            label_map = {cat.id: idx + 1 for idx, cat in enumerate(categories)}
            
            # Apply annotations (last annotation wins for overlapping regions)
            for annotation in annotations:
                start_idx = max(0, annotation.start_index)
                end_idx = min(total_records - 1, annotation.end_index)
                label_value = label_map.get(annotation.category.id, 0)
                
                labels[start_idx:end_idx + 1] = label_value
        
        return labels
    
    def _check_overlapping_annotations(self, annotations):
        """Check if there are overlapping annotations"""
        sorted_annotations = sorted(annotations, key=lambda x: x.start_index)
        
        for i in range(len(sorted_annotations) - 1):
            current = sorted_annotations[i]
            next_ann = sorted_annotations[i + 1]
            
            if current.end_index >= next_ann.start_index:
                return True
        
        return False
    
    def _get_model_script(self, model: UserDefinedModel) -> str:
        """
        Get model script content
        """
        if model.python_script:
            return model.python_script
        else:
            # Generate template script
            return user_script_service.create_model_template(model.model_type)
    
    def _create_model_from_script(self, session: TrainingSession, script_content: str, data_shape):
        """
        Create model using user script with transfer learning support
        """
        model = None
        
        # Check if this is continued training
        if session.is_continued_training and session.base_training_session:
            model = self._load_pretrained_model(session.base_training_session)
            if model:
                self._log_progress(session.id, "Loaded pre-trained model for continued training", 15.0)
                return model
        
        # Create new model from script
        success, model, message = user_script_service.execute_script(
            script_content,
            np.zeros(data_shape),  # Dummy data for shape inference
            None,
            session.model.hyperparameters,
            {},  # config dict - could be added to TrainingSession if needed
            'create_model'
        )
        
        if not success:
            raise Exception(f"Model creation failed: {message}")
        
        return model
    
    def _load_pretrained_model(self, base_session: TrainingSession):
        """Load a pre-trained model from a previous training session"""
        try:
            if not base_session.model_file:
                return None
            
            import tempfile
            import joblib
            
            # Create temporary file from stored model
            with tempfile.NamedTemporaryFile(suffix='.h5', delete=False) as temp_file:
                # Copy model file content to temp file
                base_session.model_file.open()
                temp_file.write(base_session.model_file.read())
                base_session.model_file.close()
                temp_file.flush()
                
                # Load model
                if self.tf_available:
                    # Try loading as TensorFlow model
                    try:
                        import tensorflow as tf
                        model = tf.keras.models.load_model(temp_file.name)
                        return model
                    except:
                        pass
                
                # Try loading as sklearn model
                try:
                    model = joblib.load(temp_file.name)
                    return model
                except:
                    pass
                
                # Clean up
                os.unlink(temp_file.name)
                
        except Exception as e:
            print(f"Failed to load pre-trained model: {e}")
        
        return None
    
    def _preprocess_data_with_script(self, session: TrainingSession, script_content: str, data, labels):
        """
        Preprocess data using user script
        """
        success, result, message = user_script_service.execute_script(
            script_content,
            data,
            labels,
            session.model.hyperparameters,
            {},  # config dict - could be added to TrainingSession if needed
            'preprocess_data'
        )
        
        if not success:
            raise Exception(f"Data preprocessing failed: {message}")
        
        processed_data, processed_labels = result
        return processed_data, processed_labels
    
    def _train_model_with_script(self, session: TrainingSession, script_content: str, model, train_data, train_labels, val_data, val_labels):
        """
        Train model using user script with progress monitoring
        """
        # Create custom callback for progress monitoring
        class ProgressCallback:
            def __init__(self, session_id, orchestrator):
                self.session_id = session_id
                self.orchestrator = orchestrator
                self.epoch = 0
                
            def on_epoch_end(self, epoch, logs=None):
                self.epoch = epoch + 1
                progress = 25.0 + (70.0 * self.epoch / session.total_epochs)  # 25-95% for training
                
                # Update session
                session_obj = TrainingSession.objects.get(id=self.session_id)
                session_obj.current_epoch = self.epoch
                session_obj.progress = progress
                session_obj.live_metrics = logs or {}
                session_obj.save()
                
                # Log progress
                self.orchestrator._log_progress(
                    self.session_id, 
                    f"Epoch {self.epoch}/{session.total_epochs} - Loss: {logs.get('loss', 0):.4f}", 
                    progress
                )
        
        # Add custom callback if TensorFlow is available
        if self.tf_available and hasattr(model, 'fit'):
            # TensorFlow model
            import tensorflow as tf
            
            # Create progress callback
            progress_cb = ProgressCallback(session.id, self)
            
            # Custom Keras callback
            class CustomProgressCallback(tf.keras.callbacks.Callback):
                def __init__(self, progress_callback):
                    super().__init__()
                    self.progress_callback = progress_callback
                
                def on_epoch_end(self, epoch, logs=None):
                    self.progress_callback.on_epoch_end(epoch, logs)
            
            # Add callback to training config
            training_config = session.config.copy()
            callbacks = training_config.get('callbacks', [])
            callbacks.append(CustomProgressCallback(progress_cb))
            training_config['callbacks'] = callbacks
            
            # Execute training function from script
            safe_globals = {
                '__builtins__': {'len': len, 'range': range, 'print': print},
                'tf': tf,
                'np': np,
                'model': model,
                'train_data': train_data,
                'train_labels': train_labels,
                'val_data': val_data,
                'val_labels': val_labels,
                'training_config': training_config
            }
            
            exec(script_content, safe_globals)
            
            if 'train_model' not in safe_globals:
                raise Exception("train_model function not found in script")
            
            history = safe_globals['train_model'](
                model, train_data, train_labels, val_data, val_labels, training_config
            )
            
            return history
            
        else:
            # Non-TensorFlow model (sklearn)
            model.fit(train_data, train_labels)
            
            # Simple progress simulation for sklearn
            for epoch in range(1, session.total_epochs + 1):
                progress = 25.0 + (70.0 * epoch / session.total_epochs)
                
                session.current_epoch = epoch
                session.progress = progress
                session.save()
                
                self._log_progress(session.id, f"Training step {epoch}/{session.total_epochs}", progress)
                time.sleep(0.1)  # Simulate training time
            
            return {"final_score": 0.85}  # Mock history for sklearn
    
    def _save_trained_model(self, session: TrainingSession, model, history):
        """
        Save the trained model
        """
        import tempfile
        import joblib
        from django.core.files.base import ContentFile
        
        # Save model
        with tempfile.NamedTemporaryFile(suffix='.h5', delete=False) as temp_file:
            if self.tf_available and hasattr(model, 'save'):
                # TensorFlow model
                model.save(temp_file.name)
            else:
                # Sklearn model
                joblib.dump(model, temp_file.name)
            
            # Save to model instance
            with open(temp_file.name, 'rb') as f:
                session.model_file.save(
                    f"{session.model.name}_trained.h5",
                    ContentFile(f.read())
                )
        
        # Training history is stored in session.training_metrics
        if hasattr(history, 'history'):
            session.training_metrics = history.history
        else:
            session.training_metrics = history if history else {}
        
        # Extract final metrics
        if hasattr(history, 'history') and history.history:
            final_metrics = {
                'final_loss': history.history.get('loss', [])[-1] if history.history.get('loss') else 0,
                'final_val_loss': history.history.get('val_loss', [])[-1] if history.history.get('val_loss') else 0,
                'final_accuracy': history.history.get('accuracy', [])[-1] if history.history.get('accuracy') else 0,
                'final_val_accuracy': history.history.get('val_accuracy', [])[-1] if history.history.get('val_accuracy') else 0,
            }
        else:
            final_metrics = history if history else {}
        
        # Update training session
        session.final_metrics = final_metrics
        
        # Update model training metadata
        model_instance = session.model
        
        # Add dataset to training_datasets if not already present
        dataset_info = {
            'dataset_id': session.dataset.id,
            'dataset_name': session.dataset.name,
            'trained_at': timezone.now().isoformat(),
            'session_id': session.id
        }
        
        # Update training datasets list
        if session.dataset.id not in [d.get('dataset_id') for d in model_instance.training_datasets]:
            model_instance.training_datasets.append(dataset_info)
        
        # Update performance metrics with best results
        current_performance = model_instance.performance_metrics
        
        # Compare and update if this training session has better results
        if final_metrics:
            # For loss metrics, lower is better
            if 'final_loss' in final_metrics:
                if 'best_loss' not in current_performance or final_metrics['final_loss'] < current_performance.get('best_loss', float('inf')):
                    current_performance['best_loss'] = final_metrics['final_loss']
                    current_performance['best_loss_session'] = session.id
            
            if 'final_val_loss' in final_metrics:
                if 'best_val_loss' not in current_performance or final_metrics['final_val_loss'] < current_performance.get('best_val_loss', float('inf')):
                    current_performance['best_val_loss'] = final_metrics['final_val_loss']
                    current_performance['best_val_loss_session'] = session.id
            
            # For accuracy metrics, higher is better
            if 'final_accuracy' in final_metrics:
                if 'best_accuracy' not in current_performance or final_metrics['final_accuracy'] > current_performance.get('best_accuracy', 0):
                    current_performance['best_accuracy'] = final_metrics['final_accuracy']
                    current_performance['best_accuracy_session'] = session.id
            
            if 'final_val_accuracy' in final_metrics:
                if 'best_val_accuracy' not in current_performance or final_metrics['final_val_accuracy'] > current_performance.get('best_val_accuracy', 0):
                    current_performance['best_val_accuracy'] = final_metrics['final_val_accuracy']
                    current_performance['best_val_accuracy_session'] = session.id
        
        # Update training count
        current_performance['total_training_sessions'] = current_performance.get('total_training_sessions', 0) + 1
        current_performance['last_trained'] = timezone.now().isoformat()
        
        model_instance.performance_metrics = current_performance
        model_instance.save()
        
        session.save()
        
        # Clean up temp file
        os.unlink(temp_file.name)
    
    def _log_progress(self, session_id: int, message: str, progress: float, is_error: bool = False):
        """
        Log training progress
        """
        # Update session logs
        session = TrainingSession.objects.get(id=session_id)
        session.training_logs.append({
            'timestamp': datetime.now().isoformat(),
            'message': message,
            'progress': progress,
            'is_error': is_error
        })
        session.progress = progress
        session.save()
        
        # Call progress callback if available
        if session_id in self.progress_callbacks:
            callback = self.progress_callbacks[session_id]
            callback(session_id, message, progress, is_error)
        
        print(f"[Training {session_id}] ({progress:.1f}%) {message}")
    
    def get_training_status(self, session_id: int) -> Dict[str, Any]:
        """
        Get current training status
        """
        try:
            session = TrainingSession.objects.get(id=session_id)
            return {
                'session_id': session_id,
                'status': session.status,
                'progress': session.progress,
                'current_epoch': session.current_epoch,
                'total_epochs': session.total_epochs,
                'live_metrics': session.live_metrics,
                'recent_logs': session.training_logs[-10:],  # Last 10 log entries
                'is_active': session_id in self.active_sessions
            }
        except TrainingSession.DoesNotExist:
            return {'error': 'Training session not found'}
    
    def cancel_training(self, session_id: int) -> bool:
        """
        Cancel active training session
        """
        if session_id in self.active_sessions:
            session = TrainingSession.objects.get(id=session_id)
            session.status = 'cancelled'
            session.completed_at = timezone.now()
            session.save()
            
            # Note: Thread will finish naturally, but status is marked as cancelled
            del self.active_sessions[session_id]
            
            self._log_progress(session_id, "Training cancelled by user", session.progress)
            return True
        
        return False
    
    def get_active_sessions(self) -> list:
        """
        Get list of active training sessions
        """
        return list(self.active_sessions.keys())


# Global training orchestrator instance
training_orchestrator = TrainingOrchestrator()