from rest_framework import serializers
from .models import Dataset, MagnetometerReading, Label, MLModel, InferenceResult, ActiveLearningSuggestion


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