from rest_framework import serializers
from .models import (
    Dataset, MagnetometerReading, Label, MLModel, InferenceResult, ActiveLearningSuggestion,
    Project, LabelCategory, Annotation, UserDefinedModel, TrainingSession, Prediction
)


class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = '__all__'


class MagnetometerReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MagnetometerReading
        fields = '__all__'


class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = '__all__'


class MLModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModel
        fields = '__all__'


class InferenceResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = InferenceResult
        fields = '__all__'


class ActiveLearningSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActiveLearningSuggestion
        fields = '__all__'


# Enhanced Model Serializers
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class LabelCategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = LabelCategory
        fields = '__all__'
    
    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return LabelCategorySerializer(children, many=True).data


class AnnotationSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    
    class Meta:
        model = Annotation
        fields = '__all__'


class UserDefinedModelSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    parent_model_name = serializers.CharField(source='parent_model.name', read_only=True)
    version_count = serializers.SerializerMethodField()
    latest_version = serializers.SerializerMethodField()
    
    class Meta:
        model = UserDefinedModel
        fields = '__all__'
    
    def get_version_count(self, obj):
        """Get total number of versions for this model"""
        return obj.get_all_versions().count()
    
    def get_latest_version(self, obj):
        """Get the latest version number"""
        latest = obj.get_latest_version()
        return latest.version if latest else obj.version


class UserDefinedModelSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for model lists"""
    project_name = serializers.CharField(source='project.name', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    version_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UserDefinedModel
        fields = ['id', 'name', 'version', 'model_type', 'category', 'tags', 
                 'project_name', 'full_name', 'version_count', 'created_at', 'updated_at']
    
    def get_version_count(self, obj):
        return obj.get_all_versions().count()


class ModelVersionSerializer(serializers.ModelSerializer):
    """Serializer for model versions"""
    
    class Meta:
        model = UserDefinedModel
        fields = ['id', 'version', 'version_notes', 'created_at', 'updated_at']


class ModelRenameSerializer(serializers.Serializer):
    """Serializer for model rename operations"""
    new_name = serializers.CharField(max_length=255)
    update_all_versions = serializers.BooleanField(default=False)


class ModelCloneSerializer(serializers.Serializer):
    """Serializer for model clone operations"""
    new_name = serializers.CharField(max_length=255)
    clone_version = serializers.CharField(max_length=50, required=False)
    clone_notes = serializers.CharField(required=False, allow_blank=True)
    include_training_data = serializers.BooleanField(default=False)


class ModelMetadataSerializer(serializers.Serializer):
    """Serializer for model metadata updates"""
    tags = serializers.ListField(child=serializers.CharField(max_length=50), required=False)
    category = serializers.CharField(max_length=100, required=False, allow_blank=True)
    author = serializers.CharField(max_length=100, required=False, allow_blank=True)
    custom_metadata = serializers.JSONField(required=False)


class TrainingSessionSerializer(serializers.ModelSerializer):
    model_name = serializers.CharField(source='model.name', read_only=True)
    dataset_name = serializers.CharField(source='dataset.name', read_only=True)
    additional_dataset_names = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingSession
        fields = '__all__'
    
    def get_additional_dataset_names(self, obj):
        return [ds.name for ds in obj.additional_datasets.all()]


class PredictionSerializer(serializers.ModelSerializer):
    model_name = serializers.CharField(source='model.name', read_only=True)
    dataset_name = serializers.CharField(source='dataset.name', read_only=True)
    
    class Meta:
        model = Prediction
        fields = '__all__'