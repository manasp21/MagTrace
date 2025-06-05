export class ModelUI {
    constructor(modelManager) {
        this.modelManager = modelManager;
        this.trainingInProgress = false;
    }

    init() {
        this.renderModelSection();
        this.setupEventListeners();
        this.setupMLListeners();
        this.setupEvaluationListeners();
    }

    renderModelSection() {
        // Already rendered in index.html
    }
    
    setupMLListeners() {
        // Feature selection
        document.querySelectorAll('input[name="feature"]').forEach(checkbox => {
            checkbox.addEventListener('change', this.updateSelectedFeatures.bind(this));
        });
        
        // Model type change
        document.getElementById('modelType').addEventListener('change', this.updateHyperparameters.bind(this));
        
        // Complexity button
        document.getElementById('complexityBtn').addEventListener('click', () => {
            const hyperparamsDiv = document.getElementById('hyperparameters');
            hyperparamsDiv.classList.toggle('hidden');
            if (!hyperparamsDiv.classList.contains('hidden')) {
                this.updateHyperparameters();
            }
        });
        
        // Augmentation toggles
        document.getElementById('augmentNoise').addEventListener('change', (e) => {
            document.getElementById('noiseLevel').disabled = !e.target.checked;
        });
        
        document.getElementById('augmentShift').addEventListener('change', (e) => {
            document.getElementById('shiftAmount').disabled = !e.target.checked;
        });
        
        // Noise level display
        document.getElementById('noiseLevel').addEventListener('input', (e) => {
            document.getElementById('noiseLevelValue').textContent = e.target.value;
        });
        
        // Train button
        document.getElementById('trainBtn').addEventListener('click', this.trainModel.bind(this));
    }
    
    updateSelectedFeatures() {
        const selectedFeatures = [];
        document.querySelectorAll('input[name="feature"]:checked').forEach(checkbox => {
            selectedFeatures.push(checkbox.value);
        });
        this.modelManager.setSelectedFeatures(selectedFeatures);
    }
    
    updateHyperparameters() {
        const modelType = document.getElementById('modelType').value;
        const hyperparamsDiv = document.getElementById('hyperparameters');
        
        if (modelType === 'knn') {
            hyperparamsDiv.innerHTML = `
                <div class="mb-1">
                    <label class="block">k:</label>
                    <input type="number" id="kValue" min="1" value="3" class="w-full border rounded p-1">
                </div>
                <div>
                    <label class="block">Number of Classes:</label>
                    <input type="number" id="numClasses" min="2" value="2" class="w-full border rounded p-1">
                </div>
            `;
        } else if (modelType === 'tf') {
            hyperparamsDiv.innerHTML = `
                <div class="mb-1">
                    <label class="block">Hidden Layers:</label>
                    <input type="number" id="hiddenLayers" min="1" value="1" class="w-full border rounded p-1">
                </div>
                <div class="mb-1">
                    <label class="block">Units per Layer:</label>
                    <input type="number" id="hiddenUnits" min="1" value="16" class="w-full border rounded p-1">
                </div>
                <div class="mb-1">
                    <label class="block">Epochs:</label>
                    <input type="number" id="epochs" min="1" value="10" class="w-full border rounded p-1">
                </div>
                <div class="mb-1">
                    <label class="block">Batch Size:</label>
                    <input type="number" id="batchSize" min="1" value="32" class="w-full border rounded p-1">
                </div>
                <div>
                    <label class="block">Learning Rate:</label>
                    <input type="number" id="learningRate" min="0.0001" max="1" step="0.0001" value="0.001" class="w-full border rounded p-1">
                </div>
            `;
        }
    }
    
    async trainModel() {
        if (this.trainingInProgress) return;
        this.trainingInProgress = true;
        
        // Show progress UI
        const progressDiv = document.getElementById('trainingProgress');
        progressDiv.classList.remove('hidden');
        const progressBar = document.getElementById('progressBar');
        const metricsDisplay = document.getElementById('trainingMetrics');
        
        // Get model type
        const modelType = document.getElementById('modelType').value;
        
        // Get hyperparameters
        const hyperparams = {};
        if (modelType === 'knn') {
            hyperparams.k = parseInt(document.getElementById('kValue').value);
            hyperparams.numClasses = parseInt(document.getElementById('numClasses').value);
        } else if (modelType === 'tf') {
            hyperparams.hiddenLayers = parseInt(document.getElementById('hiddenLayers').value);
            hyperparams.hiddenUnits = parseInt(document.getElementById('hiddenUnits').value);
            hyperparams.epochs = parseInt(document.getElementById('epochs').value);
            hyperparams.batchSize = parseInt(document.getElementById('batchSize').value);
            hyperparams.learningRate = parseFloat(document.getElementById('learningRate').value);
            hyperparams.numClasses = window.labelManager.getAllLabels().length;
        }
        
        // Get augmentation options
        const augmentationOptions = {
            enabled: document.getElementById('augmentNoise').checked || document.getElementById('augmentShift').checked,
            noiseLevel: document.getElementById('augmentNoise').checked ?
                parseFloat(document.getElementById('noiseLevel').value) : 0,
            shiftAmount: document.getElementById('augmentShift').checked ?
                parseInt(document.getElementById('shiftAmount').value) : 0
        };
        
        // Set progress callback
        this.modelManager.mlTrainer.setProgressCallback((progress, logs) => {
            progressBar.style.width = `${progress}%`;
            if (logs) {
                metricsDisplay.textContent = `Epoch: ${logs.epoch}, Loss: ${logs.loss.toFixed(4)}, Acc: ${logs.acc.toFixed(4)}`;
            }
        });
        
        try {
            // Train model
            const modelId = await this.modelManager.trainModel(
                modelType,
                hyperparams,
                augmentationOptions
            );
            
            // Save model
            this.modelManager.saveModelToLocal(modelId);
            alert(`Model trained successfully! ID: ${modelId}`);
        } catch (error) {
            console.error('Training failed:', error);
            alert(`Training failed: ${error.message}`);
        } finally {
            this.trainingInProgress = false;
        }
    }

    async applyModel() {
        // Get selected model
        const modelId = this.modelManager.getActiveModelId();
        if (!modelId) {
            alert('Please create and select a model first');
            return;
        }
        
        // Get current data
        const data = window.stateManager.getCurrentData();
        if (!data || data.length === 0) {
            alert('Please load data first');
            return;
        }
        
        // Show loading state
        const applyBtn = document.getElementById('applyModelBtn');
        applyBtn.disabled = true;
        applyBtn.textContent = 'Applying...';
        
        try {
            // Apply model
            const modelApplier = new ModelApplier();
            const predictions = await modelApplier.applySlidingWindow(
                data,
                this.modelManager.getModel(modelId),
                100,  // windowSize
                10    // step
            );
            
            // Add predictions to chart
            window.chartManager.addPredictions(modelId, predictions, 'magnitude');
            
            // Convert predictions to annotations
            this.createModelAnnotations(predictions, modelId);
            
            // Evaluate model performance
            this.evaluateModel(predictions);
            
            // Update UI
            document.getElementById('showModelLabels').checked = true;
            this.toggleModelLabels(true);
            
        } catch (error) {
            console.error('Model application failed:', error);
            alert(`Error applying model: ${error.message}`);
        } finally {
            applyBtn.disabled = false;
            applyBtn.textContent = 'Apply Model';
        }
    }
    
    createModelAnnotations(predictions, modelId) {
        const annotationManager = window.annotationManager;
        
        predictions.forEach(pred => {
            annotationManager.createModelAnnotation(
                pred.startTime,
                pred.endTime,
                pred.label,
                modelId,
                pred.confidence
            );
        });
        
        // Refresh annotations display
        if (window.annotationRenderer) {
            window.annotationRenderer.refresh();
        }
    }
    
    evaluateModel(predictions) {
        // Get ground truth annotations
        const trueLabels = window.annotationManager.getAllAnnotations()
            .filter(a => a.source === 'user')
            .map(a => ({
                startTime: a.startTime,
                endTime: a.endTime,
                label: a.labelId
            }));
            
        // Convert to comparable format
        const evaluator = new Evaluator();
        const { accuracy, precision, recall, f1Score, confusionMatrix } = evaluator.evaluate(
            trueLabels,
            predictions
        );
        
        // Update metrics display
        document.getElementById('accuracyValue').textContent = accuracy.toFixed(2);
        document.getElementById('precisionValue').textContent = precision.toFixed(2);
        document.getElementById('recallValue').textContent = recall.toFixed(2);
        document.getElementById('f1Value').textContent = f1Score.toFixed(2);
        
        // Render confusion matrix
        const classes = window.labelManager.getAllLabels().map(l => l.name);
        const cm = new ConfusionMatrix();
        cm.render(document.getElementById('confusionMatrixContainer'), confusionMatrix, classes);
    }
    
    toggleModelLabels(show) {
        // Implementation to show/hide model labels on chart
        // This would interact with chartManager and annotationRenderer
    }
    
    processBatch() {
        // Batch processing implementation
    }
    
    applySpecificModel(modelId) {
        // Set this model as active
        this.modelManager.setActiveModel(modelId);
        // Then apply it
        this.applyModel();
    }

    setupEventListeners() {
        document.getElementById('create-model-btn')?.addEventListener('click', () => {
            document.getElementById('model-form').classList.toggle('hidden');
            this.populateDatasetSelect();
        });

        document.getElementById('save-model')?.addEventListener('click', () => {
            this.createModel();
        });
    }

    setupEvaluationListeners() {
        document.getElementById('applyModelBtn')?.addEventListener('click', () => {
            this.applyModel();
        });

        document.getElementById('showModelLabels')?.addEventListener('change', (e) => {
            this.toggleModelLabels(e.target.checked);
        });

        document.getElementById('batchToggle')?.addEventListener('change', (e) => {
            document.getElementById('batchProcessBtn').disabled = !e.target.checked;
        });

        document.getElementById('batchProcessBtn')?.addEventListener('click', () => {
            this.processBatch();
        });
    }

    populateDatasetSelect() {
        const select = document.getElementById('dataset-select');
        select.innerHTML = '';
        // This would come from annotation manager
        const datasets = [{id: 'ds1', name: 'Dataset 1'}, {id: 'ds2', name: 'Dataset 2'}];
        
        datasets.forEach(ds => {
            const option = document.createElement('option');
            option.value = ds.id;
            option.textContent = ds.name;
            select.appendChild(option);
        });
    }

    createModel() {
        const name = document.getElementById('model-name').value;
        const description = document.getElementById('model-desc').value;
        const datasetId = document.getElementById('dataset-select').value;
        
        if (!name || !datasetId) {
            alert('Please provide a name and select a dataset');
            return;
        }

        const model = this.modelManager.createModel(name, description, datasetId);
        this.renderModel(model);
        document.getElementById('model-form').classList.add('hidden');
    }

    renderModel(model) {
        const modelList = document.getElementById('model-list');
        const modelDiv = document.createElement('div');
        modelDiv.className = 'model-item';
        modelDiv.innerHTML = `
            <h4>${model.name} (v${model.versions.length})</h4>
            <p>${model.description}</p>
            <button class="add-version" data-model="${model.id}">Add Version</button>
            <button class="apply-model" data-model="${model.id}">Apply</button>
            <button class="export-data" data-model="${model.id}">Export Data</button>
            <div class="versions">
                ${model.versions.map(v => `
                    <div class="version">
                        v${v.versionId} - ${v.createdAt}
                    </div>
                `).join('')}
            </div>
        `;
        modelList.appendChild(modelDiv);
        
        // Add event listener for the Apply button
        modelDiv.querySelector('.apply-model').addEventListener('click', (e) => {
            const modelId = e.target.dataset.model;
            this.applySpecificModel(modelId);
        });
    }
}
