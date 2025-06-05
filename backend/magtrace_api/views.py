from django.http import JsonResponse
import logging
import os
import pandas as pd
import base64
from io import BytesIO
import matplotlib
matplotlib.use('Agg')  # Headless backend
import matplotlib.pyplot as plt
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Project, Dataset, Annotation, Model, ModelVersion
from .serializers import ProjectSerializer, DatasetSerializer, AnnotationSerializer, ModelSerializer, ModelVersionSerializer

logger = logging.getLogger(__name__)

def welcome(request):
    logger.debug(f"Request: {request.method} {request.path}")
    return JsonResponse({
        "application": "MagTrace API",
        "status": "running",
        "api_endpoints": {
            "datasets": "/api/datasets/",
            "models": "/api/models/",
            "example_data": "/api/datasets/example/"
        }
    })
def health_check(request):
    return JsonResponse({"status": "ok"})

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    
    def dispatch(self, request, *args, **kwargs):
        logger.debug(f"Request: {request.method} {request.path}")
        response = super().dispatch(request, *args, **kwargs)
        logger.debug(f"Response: {response.status_code}")
        return response

class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    
    def dispatch(self, request, *args, **kwargs):
        logger.debug(f"Request: {request.method} {request.path}")
        response = super().dispatch(request, *args, **kwargs)
        logger.debug(f"Response: {response.status_code}")
        return response

    def create(self, request, *args, **kwargs):
        logger.info("Received dataset creation request")
        logger.debug(f"Request details: method={request.method}, path={request.path}, params={request.data}")
        file = request.FILES.get('file')
        
        if not file:
            logger.error("No file found in request")
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        logger.info(f"Processing file: {file.name} ({file.size} bytes)")
        
        try:
            # Read and process the uploaded file
            df = pd.read_csv(file)
            processed_data = df.to_dict(orient='records')
            components = [col for col in df.columns if col != 'timestamp']
            
            # Create dataset record
            logger.debug("Calling super().create() for dataset processing")
            response = super().create(request, *args, **kwargs)
            
            if response.status_code == status.HTTP_201_CREATED:
                logger.info(f"Dataset created successfully: {response.data}")
                
                # Return the processed data with metadata
                return Response({
                    "status": "success",
                    "data": processed_data,
                    "metadata": {
                        "component_count": len(components),
                        "row_count": len(processed_data)
                    }
                })
            else:
                return response
        except Exception as e:
            logger.exception("Dataset creation failed")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class AnnotationViewSet(viewsets.ModelViewSet):
    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer
    
    def dispatch(self, request, *args, **kwargs):
        logger.debug(f"Request: {request.method} {request.path}")
        response = super().dispatch(request, *args, **kwargs)
        logger.debug(f"Response: {response.status_code}")
        return response

class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    
    def dispatch(self, request, *args, **kwargs):
        logger.debug(f"Request: {request.method} {request.path}")
        response = super().dispatch(request, *args, **kwargs)
        logger.debug(f"Response: {response.status_code}")
        return response

class ModelVersionViewSet(viewsets.ModelViewSet):
    queryset = ModelVersion.objects.all()
    serializer_class = ModelVersionSerializer
    
    def dispatch(self, request, *args, **kwargs):
        logger.debug(f"Request: {request.method} {request.path}")
        response = super().dispatch(request, *args, **kwargs)
        logger.debug(f"Response: {response.status_code}")
        return response

@api_view(['GET'])
def load_example_data(request):
    logger.debug(f"Request: {request.method} {request.path}")
    try:
        # Correct path resolution - use absolute path to example dataset
        example_path = os.path.join(settings.BASE_DIR, '..', 'example', 'data_1.csv')
        
        # Read and process data
        df = pd.read_csv(example_path)
        processed_data = df.to_dict(orient='records')
        
        response = Response({"data": processed_data})
        logger.debug(f"Response: {response.status_code}")
        return response
    except Exception as e:
        logger.exception("Error loading example data")
        response = Response({"error": str(e)}, status=500)
        logger.debug(f"Response: {response.status_code}")
        return response

@api_view(['POST'])
def generate_plot(request):
    try:
        # Get data and parameters from request
        data = request.data.get('data')
        components = request.data.get('components', ['Bx', 'By', 'Bz', 'magnitude'])
        title = request.data.get('title', 'Magnetic Field Data')
        
        # Create plot
        plt.figure(figsize=(12, 6))
        for comp in components:
            if data[0].get(comp) is not None:
                timestamps = [d['timestamp'] for d in data]
                values = [d[comp] for d in data]
                plt.plot(timestamps, values, label=comp)
        
        plt.title(title)
        plt.xlabel('Time (s)')
        plt.ylabel('Magnetic Field (μT)')
        plt.legend()
        plt.grid(True)
        
        # Save to buffer
        buf = BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        plt.close()
        
        # Return base64 image
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        return Response({"image": image_base64})
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
