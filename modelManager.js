class ModelManager {
    constructor() {
        this.models = [];
        this.currentModel = null;
        this.trainedModels = {};
        this.featureExtractor = new FeatureExtractor();
        this.mlTrainer = new MLTrainer();
        this.selectedFeatures = ['mean', 'variance', 'max', 'min'];
    }

    createModel(name, description, datasetId) {
        const newModel = {
            id: Date.now().toString(),
            name,
            description,
            datasetId,
            versions: [],
            createdAt: new Date().toISOString()
        };
        this.models.push(newModel);
        this.currentModel = newModel;
        return newModel;
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
        // Get current dataset
        const dataset = window.dataLoader.getCurrentDataset();
        if (!dataset) throw new Error('No dataset loaded');
        
        // Get annotations
        const annotations = window.annotationManager.getAnnotations();
        if (!annotations.length) throw new Error('No annotations available for training');
        
        // Prepare segments and labels
        const segments = [];
        const labels = [];
        
        annotations.forEach(anno => {
            const segment = dataset.magnetic_x.slice(anno.startIndex, anno.endIndex);
            segments.push(segment);
            labels.push(anno.labelId);
        });
        
        // Prepare data
        const data = this.mlTrainer.prepareData(
            segments,
            labels,
            this.selectedFeatures,
            augmentationOptions
        );
        
        // Train model
        const model = await this.mlTrainer.trainModel(modelType, data, hyperparams);
        
        // Save model
        const modelId = `model_${Date.now()}`;
        this.trainedModels[modelId] = {
            id: modelId,
            type: modelType,
            model: model,
            features: this.selectedFeatures,
            createdAt: new Date().toISOString()
        };
        
        return modelId;
    }
    
    saveModelToLocal(modelId) {
        const model = this.trainedModels[modelId];
        if (!model) throw new Error('Model not found');
        
        if (model.type === 'knn') {
            localStorage.setItem(`ml_model_${modelId}`, JSON.stringify(model));
        } else if (model.type === 'tf') {
            // TensorFlow models are saved to IndexedDB by default
            // We'll just store metadata
            localStorage.setItem(`ml_model_${modelId}`, JSON.stringify({
                id: modelId,
                type: model.type,
                features: model.features,
                createdAt: model.createdAt,
                path: `indexeddb://${modelId}`
            }));
        }
    }
    
    async loadModelFromLocal(modelId) {
        const modelData = localStorage.getItem(`ml_model_${modelId}`);
        if (!modelData) return null;
        
        const model = JSON.parse(modelData);
        if (model.type === 'knn') {
            this.trainedModels[modelId] = model;
        } else if (model.type === 'tf') {
            // Load TensorFlow model from IndexedDB
            try {
                const loadedModel = await tf.loadLayersModel(model.path);
                this.trainedModels[modelId] = {
                    ...model,
                    model: loadedModel
                };
            } catch (e) {
                console.error('Failed to load TF model:', e);
                return null;
            }
        }
        return modelId;
    }
    
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

export default new ModelManager();