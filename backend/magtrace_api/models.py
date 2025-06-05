from django.db import models
from django.utils import timezone

class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Dataset(models.Model):
    name = models.CharField(max_length=100)
    file = models.FileField(upload_to='datasets/', null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='datasets')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

class Annotation(models.Model):
    data = models.TextField()
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='annotations')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Annotation {self.id}"

class Model(models.Model):
    FRAMEWORK_CHOICES = [
        ('TF', 'TensorFlow'),
        ('PT', 'PyTorch'),
        ('SK', 'Scikit-learn'),
    ]
    
    name = models.CharField(max_length=100)
    framework = models.CharField(max_length=2, choices=FRAMEWORK_CHOICES)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='models')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

class ModelVersion(models.Model):
    version = models.CharField(max_length=50)
    path = models.CharField(max_length=255)
    model = models.ForeignKey(Model, on_delete=models.CASCADE, related_name='versions')
    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.model.name} v{self.version}"
