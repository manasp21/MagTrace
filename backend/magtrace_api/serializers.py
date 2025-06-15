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
    
    class Meta:
        model = UserDefinedModel
        fields = '__all__'


class TrainingSessionSerializer(serializers.ModelSerializer):
    model_name = serializers.CharField(source='model.name', read_only=True)
    dataset_name = serializers.CharField(source='dataset.name', read_only=True)
    
    class Meta:
        model = TrainingSession
        fields = '__all__'


class PredictionSerializer(serializers.ModelSerializer):
    model_name = serializers.CharField(source='model.name', read_only=True)
    dataset_name = serializers.CharField(source='dataset.name', read_only=True)
    
    class Meta:
        model = Prediction
        fields = '__all__'