from django.db import models
from django.contrib.auth.models import User
import json


class Dataset(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='datasets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    total_records = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name


class MagnetometerReading(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='readings')
    timestamp_pc = models.CharField(max_length=50)
    b_x = models.FloatField()
    b_y = models.FloatField()
    b_z = models.FloatField()
    lat = models.FloatField()
    lon = models.FloatField()
    altitude = models.FloatField()
    thetax = models.FloatField()
    thetay = models.FloatField()
    thetaz = models.FloatField()
    sensor_id = models.CharField(max_length=255)
    
    class Meta:
        ordering = ['timestamp_pc']
    
    def __str__(self):
        return f"{self.sensor_id} - {self.timestamp_pc}"


class Label(models.Model):
    LABEL_TYPES = [
        ('anomaly', 'Anomaly'),
        ('normal', 'Normal'),
        ('noise', 'Noise'),
        ('interference', 'Interference'),
    ]
    
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='labels')
    start_index = models.IntegerField()
    end_index = models.IntegerField()
    label_type = models.CharField(max_length=20, choices=LABEL_TYPES)
    confidence = models.FloatField(default=1.0)
    created_by = models.CharField(max_length=50, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.dataset.name} - {self.label_type} ({self.start_index}-{self.end_index})"


class MLModel(models.Model):
    MODEL_TYPES = [
        ('anomaly_detection', 'Anomaly Detection'),
        ('classification', 'Classification'),
        ('regression', 'Regression'),
    ]
    
    name = models.CharField(max_length=255)
    model_type = models.CharField(max_length=50, choices=MODEL_TYPES)
    version = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    training_dataset = models.ForeignKey(Dataset, on_delete=models.SET_NULL, null=True, blank=True)
    model_file = models.FileField(upload_to='models/', null=True, blank=True)
    parameters = models.JSONField(default=dict)
    metrics = models.JSONField(default=dict)
    is_active = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} v{self.version}"


class InferenceResult(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='inference_results')
    model = models.ForeignKey(MLModel, on_delete=models.CASCADE)
    predictions = models.JSONField()
    confidence_scores = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.dataset.name} - {self.model.name}"


class ActiveLearningSuggestion(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='suggestions')
    start_index = models.IntegerField()
    end_index = models.IntegerField()
    suggested_label = models.CharField(max_length=20)
    confidence = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.dataset.name} suggestion: {self.suggested_label}"