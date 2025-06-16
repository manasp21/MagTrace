from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.utils import timezone
import pandas as pd
import json
from .models import (
    Dataset, MagnetometerReading, Label, MLModel, InferenceResult, ActiveLearningSuggestion,
    Project, LabelCategory, Annotation, UserDefinedModel, TrainingSession, Prediction
)
from .serializers import (
    DatasetSerializer, MagnetometerReadingSerializer, LabelSerializer,
    MLModelSerializer, InferenceResultSerializer, ActiveLearningSuggestionSerializer,
    ProjectSerializer, LabelCategorySerializer, AnnotationSerializer,
    UserDefinedModelSerializer, UserDefinedModelSummarySerializer, ModelVersionSerializer,
    ModelRenameSerializer, ModelCloneSerializer, ModelMetadataSerializer,
    TrainingSessionSerializer, PredictionSerializer
)
from .ml_service import ml_service

# For now, disable celery tasks and use direct execution
train_model_task = None
generate_suggestions_task = None
run_inference_task = None


class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        file = request.FILES.get('file')
        name = request.data.get('name', file.name if file else 'Unnamed Dataset')
        project_id = request.data.get('project')
        
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not file.name.endswith('.csv'):
            return Response({'error': 'Only CSV files are supported'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create dataset with project association
        dataset_data = {'name': name, 'file': file}
        if project_id:
            try:
                project = Project.objects.get(id=project_id)
                dataset_data['project'] = project
            except Project.DoesNotExist:
                return Response({'error': 'Project not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        dataset = Dataset.objects.create(**dataset_data)
        
        try:
            self.process_csv_file(dataset)
            dataset.processed = True
            dataset.save()
            
            serializer = self.get_serializer(dataset)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            dataset.delete()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def process_csv_file(self, dataset):
        file_path = dataset.file.path
        df = pd.read_csv(file_path)
        
        # Handle different column names for altitude
        altitude_col = 'altitude'
        if 'alt' in df.columns and 'altitude' not in df.columns:
            altitude_col = 'alt'
        elif 'altitude' in df.columns:
            altitude_col = 'altitude'
        
        required_columns = ['timestamp_pc', 'b_x', 'b_y', 'b_z', 'lat', 'lon', altitude_col, 'thetax', 'thetay', 'thetaz', 'sensor_id']
        
        if not all(col in df.columns for col in required_columns):
            available_cols = list(df.columns)
            raise ValueError(f"CSV must contain columns: {required_columns}. Available columns: {available_cols}")
        
        readings = []
        for _, row in df.iterrows():
            reading = MagnetometerReading(
                dataset=dataset,
                timestamp_pc=str(row['timestamp_pc']),
                b_x=float(row['b_x']),
                b_y=float(row['b_y']),
                b_z=float(row['b_z']),
                lat=float(row['lat']),
                lon=float(row['lon']),
                altitude=float(row[altitude_col]),  # Use the detected altitude column
                thetax=float(row['thetax']),
                thetay=float(row['thetay']),
                thetaz=float(row['thetaz']),
                sensor_id=str(row['sensor_id'])
            )
            readings.append(reading)
        
        MagnetometerReading.objects.bulk_create(readings)
        dataset.total_records = len(readings)
        dataset.save()
    
    @action(detail=True, methods=['get'])
    def data(self, request, pk=None):
        dataset = self.get_object()
        readings = dataset.readings.all()
        serializer = MagnetometerReadingSerializer(readings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        dataset = self.get_object()
        readings = dataset.readings.all()
        
        if not readings.exists():
            return Response({'error': 'No data found'}, status=status.HTTP_404_NOT_FOUND)
        
        stats = {
            'total_records': readings.count(),
            'sensors': list(readings.values_list('sensor_id', flat=True).distinct()),
            'time_range': {
                'start': readings.first().timestamp_pc,
                'end': readings.last().timestamp_pc
            },
            'magnetic_field_stats': {
                'b_x': self.get_field_stats(readings, 'b_x'),
                'b_y': self.get_field_stats(readings, 'b_y'),
                'b_z': self.get_field_stats(readings, 'b_z'),
            },
            'location_range': {
                'lat_min': min(readings.values_list('lat', flat=True)),
                'lat_max': max(readings.values_list('lat', flat=True)),
                'lon_min': min(readings.values_list('lon', flat=True)),
                'lon_max': max(readings.values_list('lon', flat=True)),
            }
        }
        
        return Response(stats)
    
    def get_field_stats(self, readings, field):
        values = readings.values_list(field, flat=True)
        return {
            'min': min(values),
            'max': max(values),
            'mean': sum(values) / len(values),
        }


class MagnetometerReadingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MagnetometerReading.objects.all()
    serializer_class = MagnetometerReadingSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        dataset_id = self.request.query_params.get('dataset_id')
        if dataset_id:
            queryset = queryset.filter(dataset_id=dataset_id)
        return queryset


class LabelViewSet(viewsets.ModelViewSet):
    queryset = Label.objects.all()
    serializer_class = LabelSerializer
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        labels_data = request.data.get('labels', [])
        
        if not labels_data:
            return Response({'error': 'No labels provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        labels = []
        for label_data in labels_data:
            serializer = self.get_serializer(data=label_data)
            if serializer.is_valid():
                labels.append(serializer.save())
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(labels, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MLModelViewSet(viewsets.ModelViewSet):
    queryset = MLModel.objects.all()
    serializer_class = MLModelSerializer
    
    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        model = self.get_object()
        MLModel.objects.filter(model_type=model.model_type).update(is_active=False)
        model.is_active = True
        model.save()
        
        serializer = self.get_serializer(model)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def train(self, request):
        dataset_id = request.data.get('dataset_id')
        model_name = request.data.get('name')
        model_type = request.data.get('model_type', 'anomaly_detection')
        version = request.data.get('version', '1.0')
        parameters = request.data.get('parameters', {})
        
        if not dataset_id or not model_name:
            return Response(
                {'error': 'dataset_id and name are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Direct training (no Celery for now)
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
            
            return Response({
                'model_id': ml_model.id,
                'status': 'training_completed',
                'message': f'Training {model_name} completed ({metrics.get("backend", "unknown")} backend)',
                'metrics': metrics
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def generate_suggestions(self, request, pk=None):
        model = self.get_object()
        dataset_id = request.data.get('dataset_id')
        
        if not dataset_id:
            return Response(
                {'error': 'dataset_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Direct suggestion generation (no Celery for now)
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
            
            return Response({
                'status': 'suggestions_generated',
                'message': f'Generated {len(suggestion_objects)} suggestions',
                'suggestions_count': len(suggestion_objects)
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class InferenceResultViewSet(viewsets.ModelViewSet):
    queryset = InferenceResult.objects.all()
    serializer_class = InferenceResultSerializer
    
    @action(detail=False, methods=['post'])
    def run_inference(self, request):
        dataset_id = request.data.get('dataset_id')
        model_id = request.data.get('model_id')
        
        if not dataset_id or not model_id:
            return Response(
                {'error': 'dataset_id and model_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Direct inference (no Celery for now)
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
            
            return Response({
                'inference_result_id': inference_result.id,
                'status': 'inference_completed',
                'message': f'Inference completed with {model.name}',
                'predictions_count': len(predictions)
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ActiveLearningSuggestionViewSet(viewsets.ModelViewSet):
    queryset = ActiveLearningSuggestion.objects.all()
    serializer_class = ActiveLearningSuggestionSerializer
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        suggestion = self.get_object()
        
        Label.objects.create(
            dataset=suggestion.dataset,
            start_index=suggestion.start_index,
            end_index=suggestion.end_index,
            label_type=suggestion.suggested_label,
            confidence=suggestion.confidence,
            created_by='active_learning'
        )
        
        suggestion.reviewed = True
        suggestion.save()
        
        return Response({'status': 'accepted'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        suggestion = self.get_object()
        suggestion.reviewed = True
        suggestion.save()
        
        return Response({'status': 'rejected'})


# Enhanced Model ViewSets
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    
    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        from .project_service import ProjectService
        project = self.get_object()
        
        try:
            zip_path = ProjectService.export_project(project.id)
            return Response({
                'download_url': zip_path,
                'message': 'Project exported successfully'
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def import_project(self, request):
        from .project_service import ProjectService
        
        zip_file = request.FILES.get('project_file')
        if not zip_file:
            return Response(
                {'error': 'project_file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            project = ProjectService.import_project(zip_file)
            serializer = self.get_serializer(project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class LabelCategoryViewSet(viewsets.ModelViewSet):
    queryset = LabelCategory.objects.all().order_by('order', 'name')
    serializer_class = LabelCategorySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset


class AnnotationViewSet(viewsets.ModelViewSet):
    queryset = Annotation.objects.all().order_by('start_index')
    serializer_class = AnnotationSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        dataset_id = self.request.query_params.get('dataset_id')
        if dataset_id:
            queryset = queryset.filter(dataset_id=dataset_id)
        return queryset


class UserDefinedModelViewSet(viewsets.ModelViewSet):
    queryset = UserDefinedModel.objects.all().order_by('-updated_at')
    serializer_class = UserDefinedModelSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project_id')
        summary_only = self.request.query_params.get('summary', 'false').lower() == 'true'
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by tags if provided
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                queryset = queryset.filter(tags__contains=[tag])
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__icontains=category)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list' and self.request.query_params.get('summary', 'false').lower() == 'true':
            return UserDefinedModelSummarySerializer
        return UserDefinedModelSerializer
    
    @action(detail=False, methods=['get'])
    def script_template(self, request):
        from .user_script_service import UserScriptService
        
        model_type = request.query_params.get('model_type', 'classification')
        template = UserScriptService.get_script_template(model_type)
        
        return Response({
            'template': template,
            'model_type': model_type
        })
    
    @action(detail=False, methods=['post'])
    def validate_script(self, request):
        from .user_script_service import UserScriptService
        
        script = request.data.get('script', '')
        try:
            is_valid, errors = UserScriptService.validate_script(script)
            return Response({
                'is_valid': is_valid,
                'errors': errors
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def rename(self, request, pk=None):
        """Rename a model and optionally all its versions"""
        model = self.get_object()
        serializer = ModelRenameSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_name = serializer.validated_data['new_name']
        update_all_versions = serializer.validated_data['update_all_versions']
        
        try:
            if update_all_versions:
                # Update all versions
                all_versions = model.get_all_versions()
                all_versions.update(name=new_name)
                updated_count = all_versions.count()
            else:
                # Update only this version
                model.name = new_name
                model.save()
                updated_count = 1
            
            return Response({
                'message': f'Successfully renamed {updated_count} model(s) to "{new_name}"',
                'updated_count': updated_count
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def clone(self, request, pk=None):
        """Clone a model with a new name"""
        model = self.get_object()
        serializer = ModelCloneSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_name = serializer.validated_data['new_name']
        clone_version = serializer.validated_data['clone_version']
        clone_notes = serializer.validated_data.get('clone_notes', '')
        include_training_data = serializer.validated_data['include_training_data']
        
        try:
            # Create cloned model
            cloned_model = UserDefinedModel.objects.create(
                project=model.project,
                name=new_name,
                model_type=model.model_type,
                description=f"Cloned from {model.name} v{model.version}",
                python_script=model.python_script,
                hyperparameters=model.hyperparameters.copy(),
                version=clone_version,
                version_notes=clone_notes,
                tags=model.tags.copy(),
                category=model.category,
                author=request.user.username if hasattr(request, 'user') and request.user.is_authenticated else 'user',
                custom_metadata=model.custom_metadata.copy()
            )
            
            if include_training_data:
                cloned_model.training_datasets = model.training_datasets.copy()
                cloned_model.performance_metrics = model.performance_metrics.copy()
                cloned_model.save()
            
            serializer = UserDefinedModelSerializer(cloned_model)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        """Create a new version of a model"""
        model = self.get_object()
        
        version_number = request.data.get('version')
        version_notes = request.data.get('version_notes', '')
        
        try:
            new_version = model.create_new_version(version_number, version_notes)
            serializer = UserDefinedModelSerializer(new_version)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get all versions of a model"""
        model = self.get_object()
        versions = model.get_all_versions()
        serializer = ModelVersionSerializer(versions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def generate_intelligent_name(self, request):
        """Generate intelligent model name based on training data and labels"""
        from .training_service import training_orchestrator
        
        dataset_ids = request.data.get('dataset_ids', [])
        model_type = request.data.get('model_type', 'classification')
        
        if not dataset_ids:
            return Response(
                {'error': 'dataset_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Analyze datasets and generate name
            name_suggestion = self._generate_model_name(dataset_ids, model_type)
            
            return Response({
                'suggested_name': name_suggestion['name'],
                'description': name_suggestion['description'],
                'suggested_tags': name_suggestion['tags'],
                'suggested_category': name_suggestion['category']
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _generate_model_name(self, dataset_ids, model_type):
        """Generate intelligent model name based on dataset analysis"""
        datasets = Dataset.objects.filter(id__in=dataset_ids)
        
        if not datasets.exists():
            raise Exception("No valid datasets found")
        
        # Analyze datasets
        total_samples = 0
        label_categories = set()
        dataset_names = []
        
        for dataset in datasets:
            total_samples += dataset.total_records
            dataset_names.append(dataset.name)
            
            # Get label categories from annotations
            annotations = dataset.annotations.all()
            for annotation in annotations:
                label_categories.add(annotation.category.name.lower())
        
        # Generate descriptive name components
        unique_labels = list(label_categories)
        
        # Determine primary label types
        if 'anomaly' in unique_labels or 'normal' in unique_labels:
            label_focus = 'anomaly_detector'
        elif 'fan_noise' in unique_labels or 'motor' in unique_labels:
            label_focus = 'interference_classifier' 
        elif len(unique_labels) > 3:
            label_focus = 'multi_class_classifier'
        else:
            label_focus = 'magnetic_classifier'
        
        # Generate base name
        if len(datasets) == 1:
            base_name = f"{label_focus}_{datasets.first().name}"
        else:
            base_name = f"{label_focus}_multi_dataset"
        
        # Create version-specific elements
        sample_size = "large" if total_samples > 10000 else "standard"
        
        # Generate full name
        suggested_name = f"{base_name}_{sample_size}"
        
        # Generate description
        label_str = ", ".join(unique_labels[:3])
        if len(unique_labels) > 3:
            label_str += f" and {len(unique_labels) - 3} more"
        
        description = f"{model_type.title()} model trained on {len(datasets)} dataset(s) " \
                     f"with {total_samples:,} samples. Detects: {label_str}."
        
        # Generate tags
        tags = [model_type, 'magnetic_field']
        if len(datasets) > 1:
            tags.append('multi_dataset')
        if total_samples > 10000:
            tags.append('large_scale')
        tags.extend(unique_labels[:3])  # Add top 3 label types
        
        # Generate category
        if 'anomaly' in unique_labels:
            category = 'Anomaly Detection'
        elif len(unique_labels) > 3:
            category = 'Multi-Class Classification'
        else:
            category = 'Binary Classification'
        
        return {
            'name': suggested_name,
            'description': description,
            'tags': tags,
            'category': category
        }
    
    @action(detail=True, methods=['patch'])
    def update_metadata(self, request, pk=None):
        """Update model metadata (tags, category, author, custom_metadata)"""
        model = self.get_object()
        serializer = ModelMetadataSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update metadata fields
        if 'tags' in serializer.validated_data:
            model.tags = serializer.validated_data['tags']
        if 'category' in serializer.validated_data:
            model.category = serializer.validated_data['category']
        if 'author' in serializer.validated_data:
            model.author = serializer.validated_data['author']
        if 'custom_metadata' in serializer.validated_data:
            model.custom_metadata.update(serializer.validated_data['custom_metadata'])
        
        model.save()
        
        # Return updated model
        serializer = UserDefinedModelSerializer(model)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all unique categories"""
        project_id = request.query_params.get('project_id')
        queryset = UserDefinedModel.objects.all()
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        categories = queryset.exclude(category='').values_list('category', flat=True).distinct()
        return Response(list(categories))
    
    @action(detail=False, methods=['get'])
    def tags(self, request):
        """Get all unique tags"""
        project_id = request.query_params.get('project_id')
        queryset = UserDefinedModel.objects.all()
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Extract all tags from all models
        all_tags = set()
        for model in queryset:
            all_tags.update(model.tags)
        
        return Response(sorted(list(all_tags)))


class TrainingSessionViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.all().order_by('-created_at')
    serializer_class = TrainingSessionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        model_id = self.request.query_params.get('model_id')
        if model_id:
            queryset = queryset.filter(model_id=model_id)
        return queryset
    
    @action(detail=False, methods=['post'])
    def start_training(self, request):
        """Start training with simplified, working training system"""
        from .simple_training_service import simple_training_orchestrator
        
        model_id = request.data.get('model_id')
        dataset_id = request.data.get('dataset_id')
        additional_dataset_ids = request.data.get('additional_dataset_ids', [])
        continue_from_session = request.data.get('continue_from_session')
        training_config = request.data.get('training_config', {})
        
        if not model_id or not dataset_id:
            return Response(
                {'error': 'model_id and dataset_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Start simple training that actually works
            session_id = simple_training_orchestrator.start_training(
                model_id=model_id,
                dataset_id=dataset_id,
                training_config=training_config
            )
            
            # Get the created session
            training_session = TrainingSession.objects.get(id=session_id)
            serializer = self.get_serializer(training_session)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def stop_training(self, request, pk=None):
        """Stop an active training session"""
        from .simple_training_service import simple_training_orchestrator
        
        training_session = self.get_object()
        
        try:
            success = simple_training_orchestrator.cancel_training(training_session.id)
            if success:
                training_session.refresh_from_db()
                serializer = self.get_serializer(training_session)
                return Response(serializer.data)
            else:
                return Response(
                    {'error': 'Training session not found or not active'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """Get real-time training status and progress"""
        from .simple_training_service import simple_training_orchestrator
        
        training_session = self.get_object()
        status_info = simple_training_orchestrator.get_training_status(training_session.id)
        
        return Response(status_info)
    
    @action(detail=False, methods=['get'])
    def active_sessions(self, request):
        """Get all currently active training sessions"""
        from .simple_training_service import simple_training_orchestrator
        
        active_session_ids = simple_training_orchestrator.get_active_sessions()
        active_sessions = TrainingSession.objects.filter(id__in=active_session_ids)
        
        serializer = self.get_serializer(active_sessions, many=True)
        return Response(serializer.data)


class PredictionViewSet(viewsets.ModelViewSet):
    queryset = Prediction.objects.all().order_by('-created_at')
    serializer_class = PredictionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        dataset_id = self.request.query_params.get('dataset_id')
        model_id = self.request.query_params.get('model_id')
        
        if dataset_id:
            queryset = queryset.filter(dataset_id=dataset_id)
        if model_id:
            queryset = queryset.filter(model_id=model_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        prediction = self.get_object()
        
        review_status = request.data.get('status')  # 'accepted', 'rejected', 'modified'
        reviewed_by = request.data.get('reviewed_by', 'user')
        modifications = request.data.get('modifications', {})
        
        if review_status not in ['accepted', 'rejected', 'modified']:
            return Response(
                {'error': 'Invalid review status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        prediction.review_status = review_status
        prediction.reviewed_by = reviewed_by
        prediction.reviewed_at = timezone.now()
        
        if review_status == 'modified':
            prediction.modifications = modifications
        
        prediction.save()
        
        serializer = self.get_serializer(prediction)
        return Response(serializer.data)