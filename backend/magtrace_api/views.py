import logging
import os
import pandas as pd
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Project, Dataset, Annotation, Model, ModelVersion
from .serializers import ProjectSerializer, DatasetSerializer, AnnotationSerializer, ModelSerializer, ModelVersionSerializer

logger = logging.getLogger(__name__)

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer

    def create(self, request, *args, **kwargs):
        logger.info("Received dataset creation request")
        file = request.FILES.get('file')
        
        if not file:
            logger.error("No file found in request")
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        logger.info(f"Processing file: {file.name} ({file.size} bytes)")
        
        try:
            logger.debug("Calling super().create() for dataset processing")
            response = super().create(request, *args, **kwargs)
            logger.info(f"Dataset created successfully: {response.data}")
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

class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer

class ModelVersionViewSet(viewsets.ModelViewSet):
    queryset = ModelVersion.objects.all()
    serializer_class = ModelVersionSerializer

@api_view(['GET'])
def load_example_data(request):
    try:
        # Construct path to example data
        example_path = os.path.join(settings.BASE_DIR, '..', 'example', 'data_1.csv')
        
        # Read and process data
        df = pd.read_csv(example_path)
        processed_data = df.to_dict(orient='records')
        
        return Response({"data": processed_data})
    except Exception as e:
        logger.error(f"Error loading example data: {str(e)}")
        return Response({"error": str(e)}, status=500)
