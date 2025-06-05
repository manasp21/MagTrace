from flask import Blueprint, request, jsonify
from .. import db
from ..models import Model, ModelVersion
from ..ml_service import train_model_async, predict_async, load_model, unload_model, get_training_progress
import uuid

models_bp = Blueprint('models', __name__, url_prefix='/api/models')

@models_bp.route('/train/', methods=['POST'])
def train_model():
    """Endpoint to start model training"""
    data = request.json
    model_config = data.get('model_config')
    
    if not model_config:
        return jsonify({"error": "Missing model_config"}), 400
    
    try:
        # Start async training task
        task = train_model_async.apply_async(args=[model_config])
        
        # Create model record in database
        model = Model(
            name=model_config.get('name', 'Unnamed Model'),
            framework=model_config.get('framework', 'tensorflow'),
            project_id=model_config.get('project_id', 1)  # Default project
        )
        db.session.add(model)
        db.session.commit()
        
        return jsonify({
            "message": "Training started",
            "task_id": task.id,
            "model_id": model.id
        }), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@models_bp.route('/predict/', methods=['POST'])
def predict():
    """Endpoint to make predictions using a trained model"""
    data = request.json
    model_id = data.get('model_id')
    input_data = data.get('input_data')
    
    if not model_id or not input_data:
        return jsonify({"error": "Missing model_id or input_data"}), 400
    
    try:
        # Start async prediction task
        task = predict_async.apply_async(args=[model_id, input_data])
        return jsonify({
            "message": "Prediction started",
            "task_id": task.id
        }), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@models_bp.route('/progress/<task_id>', methods=['GET'])
def training_progress(task_id):
    """Endpoint to check training progress"""
    try:
        progress = get_training_progress(task_id)
        return jsonify(progress), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@models_bp.route('/load/<int:model_id>', methods=['POST'])
def load_model_endpoint(model_id):
    """Endpoint to load a model into memory"""
    try:
        model = Model.query.get(model_id)
        if not model:
            return jsonify({"error": "Model not found"}), 404
            
        # Get latest active version
        version = ModelVersion.query.filter_by(
            model_id=model_id, 
            is_active=True
        ).order_by(ModelVersion.created_at.desc()).first()
        
        if not version:
            return jsonify({"error": "No active version found"}), 400
            
        model_id = load_model(version.path, model.framework)
        return jsonify({
            "message": "Model loaded",
            "model_id": model_id
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@models_bp.route('/unload/<model_id>', methods=['POST'])
def unload_model_endpoint(model_id):
    """Endpoint to unload a model from memory"""
    try:
        if unload_model(model_id):
            return jsonify({"message": "Model unloaded"}), 200
        else:
            return jsonify({"error": "Model not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500