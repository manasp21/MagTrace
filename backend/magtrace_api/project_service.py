import os
import json
import zipfile
import tempfile
from datetime import datetime
from django.core.files.base import ContentFile
from django.core.serializers import serialize, deserialize
from .models import Project, Dataset, LabelCategory, Annotation, UserDefinedModel, Prediction


class ProjectService:
    """
    Service for saving and loading complete MagTrace projects
    """
    
    def __init__(self):
        self.version = "1.0"
    
    def create_project(self, name, description=""):
        """Create a new project"""
        project = Project.objects.create(
            name=name,
            description=description,
            settings={
                'version': self.version,
                'created_with': 'MagTrace',
                'auto_save': True
            }
        )
        
        # Create default label categories
        self._create_default_categories(project)
        
        return project
    
    def _create_default_categories(self, project):
        """Create default hierarchical label categories"""
        # Root categories
        geophysical = LabelCategory.objects.create(
            project=project,
            name="Geophysical",
            color="#FF6B6B",
            description="Geophysical signals and features",
            order=1
        )
        
        noise = LabelCategory.objects.create(
            project=project,
            name="Noise",
            color="#FFA726",
            description="Various types of noise and interference",
            order=2
        )
        
        instrumental = LabelCategory.objects.create(
            project=project,
            name="Instrumental",
            color="#42A5F5",
            description="Instrument-related artifacts",
            order=3
        )
        
        # Geophysical subcategories
        LabelCategory.objects.create(
            project=project,
            parent=geophysical,
            name="Anomaly",
            color="#E53E3E",
            description="Magnetic anomalies"
        )
        
        LabelCategory.objects.create(
            project=project,
            parent=geophysical,
            name="Dipolar",
            color="#D53F8C",
            description="Dipolar magnetic signatures"
        )
        
        LabelCategory.objects.create(
            project=project,
            parent=geophysical,
            name="Regional Field",
            color="#805AD5",
            description="Regional magnetic field variations"
        )
        
        # Noise subcategories
        LabelCategory.objects.create(
            project=project,
            parent=noise,
            name="Electronic",
            color="#FF8A65",
            description="Electronic interference"
        )
        
        LabelCategory.objects.create(
            project=project,
            parent=noise,
            name="Motion",
            color="#FFAB40",
            description="Motion-induced noise"
        )
        
        LabelCategory.objects.create(
            project=project,
            parent=noise,
            name="Environmental",
            color="#FFCC02",
            description="Environmental interference"
        )
    
    def save_project(self, project_id):
        """
        Save complete project to a zip file
        """
        project = Project.objects.get(id=project_id)
        
        # Create temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            project_data = self._export_project_data(project)
            
            # Save project file
            project_file = os.path.join(temp_dir, 'project.json')
            with open(project_file, 'w') as f:
                json.dump(project_data, f, indent=2, default=str)
            
            # Create zip archive
            zip_filename = f"{project.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.magproj"
            zip_path = os.path.join(temp_dir, zip_filename)
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                # Add project data
                zf.write(project_file, 'project.json')
                
                # Add datasets
                for dataset in project.datasets.all():
                    if dataset.file:
                        zf.write(dataset.file.path, f"datasets/{dataset.file.name}")
                
                # Add user scripts
                for model in project.models.all():
                    if model.python_script:
                        zf.write(model.python_script.path, f"scripts/{model.python_script.name}")
                    if model.trained_model_file:
                        zf.write(model.trained_model_file.path, f"models/{model.trained_model_file.name}")
            
            # Save to project
            with open(zip_path, 'rb') as f:
                project.project_file.save(zip_filename, ContentFile(f.read()))
        
        return project.project_file.url
    
    def _export_project_data(self, project):
        """Export all project data to dictionary"""
        data = {
            'version': self.version,
            'project': {
                'name': project.name,
                'description': project.description,
                'settings': project.settings,
                'created_at': project.created_at.isoformat(),
                'updated_at': project.updated_at.isoformat()
            },
            'datasets': [],
            'label_categories': [],
            'annotations': [],
            'models': [],
            'predictions': []
        }
        
        # Export datasets
        for dataset in project.datasets.all():
            data['datasets'].append({
                'name': dataset.name,
                'file_name': dataset.file.name if dataset.file else None,
                'total_records': dataset.total_records,
                'metadata': dataset.metadata,
                'uploaded_at': dataset.uploaded_at.isoformat()
            })
        
        # Export label categories (hierarchical)
        for category in project.label_categories.all():
            data['label_categories'].append({
                'name': category.name,
                'parent_name': category.parent.name if category.parent else None,
                'color': category.color,
                'description': category.description,
                'order': category.order
            })
        
        # Export annotations
        for dataset in project.datasets.all():
            for annotation in dataset.annotations.all():
                data['annotations'].append({
                    'dataset_name': dataset.name,
                    'category_name': annotation.category.name,
                    'start_index': annotation.start_index,
                    'end_index': annotation.end_index,
                    'start_time': annotation.start_time,
                    'end_time': annotation.end_time,
                    'confidence': annotation.confidence,
                    'created_by': annotation.created_by,
                    'notes': annotation.notes,
                    'tags': annotation.tags,
                    'properties': annotation.properties,
                    'validated': annotation.validated,
                    'validated_by': annotation.validated_by,
                    'created_at': annotation.created_at.isoformat()
                })
        
        # Export models
        for model in project.models.all():
            data['models'].append({
                'name': model.name,
                'description': model.description,
                'model_type': model.model_type,
                'version': model.version,
                'script_file_name': model.python_script.name if model.python_script else None,
                'script_content': model.script_content,
                'hyperparameters': model.hyperparameters,
                'input_shape': model.input_shape,
                'output_shape': model.output_shape,
                'training_config': model.training_config,
                'is_trained': model.is_trained,
                'training_status': model.training_status,
                'metrics': model.metrics,
                'training_history': model.training_history
            })
        
        # Export predictions
        for dataset in project.datasets.all():
            for prediction in dataset.predictions.all():
                data['predictions'].append({
                    'dataset_name': dataset.name,
                    'model_name': prediction.model.name,
                    'predictions': prediction.predictions,
                    'confidence_scores': prediction.confidence_scores,
                    'prediction_metadata': prediction.prediction_metadata,
                    'status': prediction.status,
                    'reviewed_by': prediction.reviewed_by,
                    'review_notes': prediction.review_notes,
                    'created_at': prediction.created_at.isoformat()
                })
        
        return data
    
    def load_project(self, project_file):
        """
        Load project from uploaded zip file
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            # Extract zip file
            with zipfile.ZipFile(project_file.path, 'r') as zf:
                zf.extractall(temp_dir)
            
            # Load project data
            project_file_path = os.path.join(temp_dir, 'project.json')
            with open(project_file_path, 'r') as f:
                project_data = json.load(f)
            
            # Create project
            project = Project.objects.create(
                name=project_data['project']['name'] + " (Imported)",
                description=project_data['project']['description'],
                settings=project_data['project']['settings']
            )
            
            # Import label categories
            category_map = {}
            self._import_categories(project, project_data['label_categories'], category_map)
            
            # Import datasets
            dataset_map = {}
            self._import_datasets(project, project_data['datasets'], temp_dir, dataset_map)
            
            # Import annotations
            self._import_annotations(project_data['annotations'], dataset_map, category_map)
            
            # Import models
            model_map = {}
            self._import_models(project, project_data['models'], temp_dir, model_map)
            
            # Import predictions
            self._import_predictions(project_data['predictions'], dataset_map, model_map)
            
            return project
    
    def _import_categories(self, project, categories_data, category_map):
        """Import label categories maintaining hierarchy"""
        # First pass: create all categories without parents
        for cat_data in categories_data:
            category = LabelCategory.objects.create(
                project=project,
                name=cat_data['name'],
                color=cat_data['color'],
                description=cat_data['description'],
                order=cat_data['order']
            )
            category_map[cat_data['name']] = category
        
        # Second pass: set up parent relationships
        for cat_data in categories_data:
            if cat_data['parent_name']:
                category = category_map[cat_data['name']]
                parent = category_map[cat_data['parent_name']]
                category.parent = parent
                category.save()
    
    def _import_datasets(self, project, datasets_data, temp_dir, dataset_map):
        """Import datasets and their files"""
        for dataset_data in datasets_data:
            dataset = Dataset.objects.create(
                project=project,
                name=dataset_data['name'],
                total_records=dataset_data['total_records'],
                metadata=dataset_data['metadata']
            )
            
            # Copy dataset file if exists
            if dataset_data['file_name']:
                source_file = os.path.join(temp_dir, 'datasets', dataset_data['file_name'])
                if os.path.exists(source_file):
                    with open(source_file, 'rb') as f:
                        dataset.file.save(dataset_data['file_name'], ContentFile(f.read()))
            
            dataset_map[dataset_data['name']] = dataset
    
    def _import_annotations(self, annotations_data, dataset_map, category_map):
        """Import annotations"""
        for ann_data in annotations_data:
            if ann_data['dataset_name'] in dataset_map and ann_data['category_name'] in category_map:
                Annotation.objects.create(
                    dataset=dataset_map[ann_data['dataset_name']],
                    category=category_map[ann_data['category_name']],
                    start_index=ann_data['start_index'],
                    end_index=ann_data['end_index'],
                    start_time=ann_data['start_time'],
                    end_time=ann_data['end_time'],
                    confidence=ann_data['confidence'],
                    created_by=ann_data['created_by'],
                    notes=ann_data['notes'],
                    tags=ann_data['tags'],
                    properties=ann_data['properties'],
                    validated=ann_data['validated'],
                    validated_by=ann_data['validated_by']
                )
    
    def _import_models(self, project, models_data, temp_dir, model_map):
        """Import user-defined models"""
        for model_data in models_data:
            model = UserDefinedModel.objects.create(
                project=project,
                name=model_data['name'],
                description=model_data['description'],
                model_type=model_data['model_type'],
                version=model_data['version'],
                script_content=model_data['script_content'],
                hyperparameters=model_data['hyperparameters'],
                input_shape=model_data['input_shape'],
                output_shape=model_data['output_shape'],
                training_config=model_data['training_config'],
                is_trained=model_data['is_trained'],
                training_status=model_data['training_status'],
                metrics=model_data['metrics'],
                training_history=model_data['training_history']
            )
            
            # Copy script file if exists
            if model_data['script_file_name']:
                source_file = os.path.join(temp_dir, 'scripts', model_data['script_file_name'])
                if os.path.exists(source_file):
                    with open(source_file, 'rb') as f:
                        model.python_script.save(model_data['script_file_name'], ContentFile(f.read()))
            
            model_map[model_data['name']] = model
    
    def _import_predictions(self, predictions_data, dataset_map, model_map):
        """Import predictions"""
        for pred_data in predictions_data:
            if pred_data['dataset_name'] in dataset_map and pred_data['model_name'] in model_map:
                Prediction.objects.create(
                    dataset=dataset_map[pred_data['dataset_name']],
                    model=model_map[pred_data['model_name']],
                    predictions=pred_data['predictions'],
                    confidence_scores=pred_data['confidence_scores'],
                    prediction_metadata=pred_data['prediction_metadata'],
                    status=pred_data['status'],
                    reviewed_by=pred_data['reviewed_by'],
                    review_notes=pred_data['review_notes']
                )
    
    def auto_save_project(self, project_id):
        """Auto-save project periodically"""
        project = Project.objects.get(id=project_id)
        if project.settings.get('auto_save', True):
            return self.save_project(project_id)
        return None


project_service = ProjectService()