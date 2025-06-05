import { FeatureExtractor } from './featureExtractor.js';
import { MLTrainer } from './mlTrainer.js';
import { apiService } from './apiService.js';

export class ModelManager {
    constructor() {
        this.models = [];
        this.currentModel = null;
        this.trainedModels = {};
        this.featureExtractor = new FeatureExtractor();
        this.mlTrainer = new MLTrainer();
        this.selectedFeatures = ['mean', 'variance', 'max', 'min'];
    }

    async createModel(name, description, datasetId) {
        try {
            const newModel = await apiService.createProject({
                name,
                description,
                type: 'model',
                dataset: datasetId
            });
            this.models.push(newModel);
            this.currentModel = newModel;
            return newModel;
        } catch (error) {
            console.error('Error creating model:', error);
            throw error;
        }
    }

    addVersion(modelId, versionData) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) throw new Error('Model not found');
        
        const newVersion = {
            versionId: model.versions.length + 1,
            ...versionData,
            createdAt: new Date().toISOString()
        };
        model.versions.push(newVersion);
        return newVersion;
    }

    getModel(modelId) {
        return this.models.find(m => m.id === modelId);
    }

    saveModel(modelId) {
        const model = this.getModel(modelId);
        if (!model) throw new Error('Model not found');
        
        localStorage.setItem(`model_${modelId}`, JSON.stringify(model));
    }

    loadModel(modelId) {
        const modelData = localStorage.getItem(`model_${modelId}`);
        if (!modelData) return null;
        
        return JSON.parse(modelData);
    }

    // ML Integration Methods
    
    setSelectedFeatures(features) {
        this.selectedFeatures = features;
    }
    
    async trainModel(modelType, hyperparams, augmentationOptions) {
        if (!this.currentModel) {
            throw new Error('No model selected for training');
        }
        
        try {
            // Prepare training data
            const trainingData = {
                modelType,
                hyperparams,
                augmentationOptions,
                selectedFeatures: this.selectedFeatures
            };
            
            // Call API to train model
            const trainingResult = await apiService.trainModel({
                modelId: this.currentModel.id,
                ...trainingData
            });
            
            // Update model status and metrics
            this.currentModel.status = 'trained';
            this.currentModel.metrics = trainingResult.metrics;
            
            return trainingResult.modelId;
        } catch (error) {
            console.error('Training failed:', error);
            this.currentModel.status = 'error';
            throw error;
        }
    }
    
    // Removed Node.js-specific model saving/loading methods
    // Models are now managed through IndexedDB and localStorage
    
    predict(segment) {
        const features = this.featureExtractor.extractFeatures(segment, this.selectedFeatures);
        const featureVector = Object.values(features);
        
        // Use the first trained model for prediction
        const modelId = Object.keys(this.trainedModels)[0];
        if (!modelId) throw new Error('No trained models available');
        
        const model = this.trainedModels[modelId];
        if (model.type === 'knn') {
            return this.mlTrainer.predictKNN(model.model, featureVector);
        } else if (model.type === 'tf') {
            return this.mlTrainer.predictTF(model.model, featureVector);
        }
    }
}