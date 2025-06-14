from django.contrib import admin
from .models import Dataset, MagnetometerReading, Label, MLModel, InferenceResult, ActiveLearningSuggestion


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ['name', 'uploaded_at', 'processed', 'total_records']
    list_filter = ['processed', 'uploaded_at']
    search_fields = ['name']


@admin.register(MagnetometerReading)
class MagnetometerReadingAdmin(admin.ModelAdmin):
    list_display = ['dataset', 'timestamp_pc', 'sensor_id', 'b_x', 'b_y', 'b_z']
    list_filter = ['dataset', 'sensor_id']
    search_fields = ['sensor_id', 'timestamp_pc']


@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ['dataset', 'label_type', 'start_index', 'end_index', 'confidence', 'created_at']
    list_filter = ['label_type', 'created_by', 'created_at']
    search_fields = ['dataset__name', 'notes']


@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'model_type', 'version', 'is_active', 'created_at']
    list_filter = ['model_type', 'is_active', 'created_at']
    search_fields = ['name', 'version']


@admin.register(InferenceResult)
class InferenceResultAdmin(admin.ModelAdmin):
    list_display = ['dataset', 'model', 'created_at']
    list_filter = ['model', 'created_at']


@admin.register(ActiveLearningSuggestion)
class ActiveLearningSuggestionAdmin(admin.ModelAdmin):
    list_display = ['dataset', 'suggested_label', 'confidence', 'reviewed', 'created_at']
    list_filter = ['suggested_label', 'reviewed', 'created_at']