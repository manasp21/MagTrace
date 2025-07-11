from django.db import models
from django.contrib.auth.models import User
import json


class Project(models.Model):
    """Container for complete ML projects with settings"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    settings = models.JSONField(default=dict)
    
    def __str__(self):
        return self.name


class Dataset(models.Model):
    """CSV file upload and processing with magnetic field data"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='datasets', null=True, blank=True)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='datasets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    total_records = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name


class MagnetometerReading(models.Model):
    """Individual sensor readings (b_x, b_y, b_z, lat, lon, altitude, etc.)"""
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


class LabelCategory(models.Model):
    """Hierarchical label categories with parent-child relationships"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='label_categories')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#FF6B6B')  # Hex color
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['project', 'name']
        ordering = ['order', 'name']
    
    def __str__(self):
        return f"{self.project.name} - {self.name}"


class Annotation(models.Model):
    """Time-series annotations with confidence scores"""
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='annotations')
    category = models.ForeignKey(LabelCategory, on_delete=models.CASCADE, related_name='annotations')
    start_index = models.IntegerField()
    end_index = models.IntegerField()
    confidence = models.FloatField(default=1.0)
    created_by = models.CharField(max_length=50, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['start_index']
    
    def __str__(self):
        return f"{self.dataset.name} - {self.category.name} ({self.start_index}-{self.end_index})"


class UserDefinedModel(models.Model):
    """Custom TensorFlow models with Python scripts and hyperparameters"""
    MODEL_TYPES = [
        ('classification', 'Classification'),
        ('autoencoder', 'Autoencoder'),
        ('transformer', 'Transformer'),
        ('custom', 'Custom'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='user_models')
    name = models.CharField(max_length=255)
    model_type = models.CharField(max_length=50, choices=MODEL_TYPES)
    description = models.TextField(blank=True)
    python_script = models.TextField()  # User's Python code
    hyperparameters = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Versioning fields
    version = models.CharField(max_length=50, default='1.0')
    parent_model = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='versions')
    version_notes = models.TextField(blank=True)
    
    # Advanced metadata fields
    tags = models.JSONField(default=list)  # Array of tags
    category = models.CharField(max_length=100, blank=True)
    author = models.CharField(max_length=100, blank=True)
    custom_metadata = models.JSONField(default=dict)  # User-defined metadata
    
    # Training tracking fields
    training_datasets = models.ManyToManyField(Dataset, blank=True, related_name='trained_models')
    performance_metrics = models.JSONField(default=dict)  # Best performance across all training sessions
    
    class Meta:
        unique_together = ['project', 'name', 'version']
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.project.name} - {self.name} v{self.version}"
    
    def get_full_name(self):
        """Get full name with version"""
        return f"{self.name} v{self.version}"
    
    def get_all_versions(self):
        """Get all versions of this model"""
        if self.parent_model:
            return self.parent_model.versions.all()
        else:
            return self.versions.all()
    
    def get_latest_version(self):
        """Get the latest version of this model"""
        all_versions = self.get_all_versions()
        if all_versions.exists():
            return all_versions.order_by('-version').first()
        return self
    
    def create_new_version(self, version=None, notes=""):
        """Create a new version of this model"""
        if not version:
            # Auto-increment version
            latest = self.get_latest_version()
            try:
                major, minor = latest.version.split('.')
                version = f"{major}.{int(minor) + 1}"
            except:
                version = "2.0"
        
        # Find the root parent model
        root_model = self.parent_model if self.parent_model else self
        
        new_model = UserDefinedModel.objects.create(
            project=self.project,
            name=self.name,
            version=version,
            model_type=self.model_type,
            description=self.description,
            python_script=self.python_script,
            hyperparameters=self.hyperparameters.copy(),
            parent_model=root_model,
            version_notes=notes,
            tags=self.tags.copy(),
            category=self.category,
            author=self.author,
            custom_metadata=self.custom_metadata.copy()
        )
        
        return new_model
    
    def get_latest_version(self):
        """Get the latest version of this model"""
        return self.get_all_versions().last()
    
    def create_new_version(self, version_number=None, version_notes=''):
        """Create a new version of this model"""
        if not version_number:
            # Auto-increment version
            latest = self.get_latest_version()
            try:
                major, minor = latest.version.split('.')
                version_number = f"{major}.{int(minor) + 1}"
            except:
                version_number = "1.1"
        
        # Create new version
        new_version = UserDefinedModel.objects.create(
            project=self.project,
            name=self.name,
            model_type=self.model_type,
            description=self.description,
            python_script=self.python_script,
            hyperparameters=self.hyperparameters.copy(),
            version=version_number,
            parent_model=self.parent_model or self,
            version_notes=version_notes,
            tags=self.tags.copy(),
            category=self.category,
            author=self.author,
            custom_metadata=self.custom_metadata.copy()
        )
        
        return new_version


class TrainingSession(models.Model):
    """Training orchestration with real-time progress tracking"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    model = models.ForeignKey(UserDefinedModel, on_delete=models.CASCADE, related_name='training_sessions')
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='training_sessions')
    additional_datasets = models.ManyToManyField(Dataset, blank=True, related_name='additional_training_sessions')
    is_continued_training = models.BooleanField(default=False)
    base_training_session = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress = models.FloatField(default=0.0)  # 0.0 to 100.0
    current_epoch = models.IntegerField(default=0)
    total_epochs = models.IntegerField(default=10)
    training_metrics = models.JSONField(default=dict)
    validation_metrics = models.JSONField(default=dict)
    final_metrics = models.JSONField(default=dict)  # Final performance metrics
    training_logs = models.JSONField(default=list)  # Real-time training logs
    live_metrics = models.JSONField(default=dict)   # Current epoch metrics
    model_file = models.FileField(upload_to='trained_models/', null=True, blank=True)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.model.name} - {self.status}"


class Prediction(models.Model):
    """Model predictions with confidence scores and review status"""
    REVIEW_STATUS = [
        ('pending', 'Pending Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('modified', 'Modified'),
    ]
    
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='predictions')
    model = models.ForeignKey(UserDefinedModel, on_delete=models.CASCADE, related_name='predictions')
    training_session = models.ForeignKey(TrainingSession, on_delete=models.SET_NULL, null=True, blank=True)
    predictions = models.JSONField()  # Array of prediction values
    confidence_scores = models.JSONField()  # Array of confidence values
    review_status = models.CharField(max_length=20, choices=REVIEW_STATUS, default='pending')
    reviewed_by = models.CharField(max_length=50, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    modifications = models.JSONField(default=dict)  # User modifications to predictions
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.dataset.name} - {self.model.name} predictions"


# Legacy models (keeping for backwards compatibility)
class Label(models.Model):
    """Legacy label model - use Annotation for new implementations"""
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
    """Legacy ML model - use UserDefinedModel for new implementations"""
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
    """Legacy inference result - use Prediction for new implementations"""
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='inference_results')
    model = models.ForeignKey(MLModel, on_delete=models.CASCADE)
    predictions = models.JSONField()
    confidence_scores = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.dataset.name} - {self.model.name}"


class ActiveLearningSuggestion(models.Model):
    """Active learning suggestions for annotation"""
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='suggestions')
    start_index = models.IntegerField()
    end_index = models.IntegerField()
    suggested_label = models.CharField(max_length=20)
    confidence = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.dataset.name} suggestion: {self.suggested_label}"