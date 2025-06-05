from rest_framework import serializers
from .models import Project, Dataset, Annotation, Model, ModelVersion

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = '__all__'
        extra_kwargs = {
            'file': {'required': True}
        }
        
    def validate_file(self, value):
        # Validate file extension
        valid_extensions = ['.csv', '.json', '.txt']
        if not any(value.name.lower().endswith(ext) for ext in valid_extensions):
            raise serializers.ValidationError('Unsupported file type. Supported types: .csv, .json, .txt')
        return value

class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = '__all__'

class ModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = '__all__'

class ModelVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelVersion
        fields = '__all__'