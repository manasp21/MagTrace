from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
import pandas as pd
import json
from .models import Dataset, MagnetometerReading, Label, MLModel, InferenceResult, ActiveLearningSuggestion
from .serializers import (
    DatasetSerializer, MagnetometerReadingSerializer, LabelSerializer,
    MLModelSerializer, InferenceResultSerializer, ActiveLearningSuggestionSerializer
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
        
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not file.name.endswith('.csv'):
            return Response({'error': 'Only CSV files are supported'}, status=status.HTTP_400_BAD_REQUEST)
        
        dataset = Dataset.objects.create(name=name, file=file)
        
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
        
        required_columns = ['timestamp_pc', 'b_x', 'b_y', 'b_z', 'lat', 'lon', 'altitude', 'thetax', 'thetay', 'thetaz', 'sensor_id']
        
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"CSV must contain columns: {required_columns}")
        
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
                altitude=float(row['altitude']),
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