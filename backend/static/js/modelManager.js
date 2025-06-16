class ModelManager {
    constructor() {
        this.models = [];
        this.activeModel = null;
        this.isTraining = false;
        this.isInferring = false;
        
        this.initializeButtons();
        this.loadModels();
    }

    initializeButtons() {
        document.getElementById('trainModelBtn').addEventListener('click', () => {
            this.showTrainingDialog();
        });

        document.getElementById('runInferenceBtn').addEventListener('click', () => {
            this.runInference();
        });
    }

    async loadModels() {
        try {
            this.models = await apiService.getModels();
            this.activeModel = this.models.find(m => m.is_active);
            this.renderModelList();
        } catch (error) {
            console.error('Failed to load models:', error);
        }
    }

    renderModelList() {
        const modelsList = document.getElementById('models');
        modelsList.innerHTML = '';

        if (this.models.length === 0) {
            modelsList.innerHTML = '<li class="no-data">No models found</li>';
            return;
        }

        this.models.forEach(model => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="model-item ${model.is_active ? 'active' : ''}">
                    <div class="model-name">${model.name} v${model.version}</div>
                    <div class="model-info">
                        <small>${model.model_type}</small>
                        <small>${new Date(model.created_at).toLocaleDateString()}</small>
                        ${model.is_active ? '<span class="active-badge">Active</span>' : ''}
                    </div>
                    <div class="model-metrics">
                        ${model.metrics.accuracy ? `Accuracy: ${(model.metrics.accuracy * 100).toFixed(1)}%` : ''}
                    </div>
                </div>
            `;
            
            li.addEventListener('click', () => this.selectModel(model));
            modelsList.appendChild(li);
        });
    }

    async selectModel(model) {
        try {
            await apiService.setActiveModel(model.id);
            this.activeModel = model;
            this.models.forEach(m => m.is_active = m.id === model.id);
            this.renderModelList();
            this.showSuccess(`Model "${model.name}" activated`);
        } catch (error) {
            console.error('Failed to activate model:', error);
            this.showError('Failed to activate model');
        }
    }

    showTrainingDialog() {
        const dataset = dataLoader.getCurrentDataset();
        if (!dataset) {
            this.showError('Please select a dataset first');
            return;
        }

        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <h3>Train New Model</h3>
            <div class="training-form">
                <div class="form-group">
                    <label for="modelName">Model Name:</label>
                    <input type="text" id="modelName" value="AnomalyDetector_${Date.now()}" required>
                </div>
                
                <div class="form-group">
                    <label for="modelType">Model Type:</label>
                    <select id="modelType">
                        <option value="anomaly_detection">Anomaly Detection</option>
                        <option value="classification">Classification</option>
                        <option value="regression">Regression</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="modelVersion">Version:</label>
                    <input type="text" id="modelVersion" value="1.0" required>
                </div>
                
                <div class="form-group">
                    <label>Training Parameters:</label>
                    <div class="parameter-grid">
                        <div class="param-item">
                            <label for="epochs">Epochs:</label>
                            <input type="number" id="epochs" value="100" min="1" max="1000">
                        </div>
                        <div class="param-item">
                            <label for="batchSize">Batch Size:</label>
                            <input type="number" id="batchSize" value="32" min="1" max="512">
                        </div>
                        <div class="param-item">
                            <label for="learningRate">Learning Rate:</label>
                            <input type="number" id="learningRate" value="0.001" min="0.0001" max="1" step="0.0001">
                        </div>
                        <div class="param-item">
                            <label for="validationSplit">Validation Split:</label>
                            <input type="number" id="validationSplit" value="0.2" min="0.1" max="0.5" step="0.1">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="useActivelearning" checked>
                        Use Active Learning
                    </label>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="modelManager.startTraining()">Start Training</button>
                    <button class="btn" onclick="modelManager.closeModal()">Cancel</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    async startTraining() {
        if (this.isTraining) {
            this.showError('Training already in progress');
            return;
        }

        const dataset = dataLoader.getCurrentDataset();
        const modelName = document.getElementById('modelName').value;
        const modelType = document.getElementById('modelType').value;
        const version = document.getElementById('modelVersion').value;
        
        const parameters = {
            epochs: parseInt(document.getElementById('epochs').value),
            batch_size: parseInt(document.getElementById('batchSize').value),
            learning_rate: parseFloat(document.getElementById('learningRate').value),
            validation_split: parseFloat(document.getElementById('validationSplit').value),
            use_active_learning: document.getElementById('useActivelearning').checked
        };

        if (!modelName.trim() || !version.trim()) {
            this.showError('Please fill in all required fields');
            return;
        }

        this.isTraining = true;
        this.closeModal();
        this.showTrainingProgress();

        try {
            const modelData = {
                name: modelName,
                model_type: modelType,
                version: version,
                training_dataset: dataset.id,
                parameters: parameters,
                is_active: false
            };

            const model = await apiService.createModel(modelData);
            
            await this.simulateTraining(model, parameters);
            
            model.metrics = {
                accuracy: 0.85 + Math.random() * 0.15,
                precision: 0.80 + Math.random() * 0.15,
                recall: 0.75 + Math.random() * 0.20,
                f1_score: 0.80 + Math.random() * 0.15
            };

            this.models.push(model);
            this.renderModelList();
            this.hideTrainingProgress();
            this.showSuccess(`Model "${modelName}" trained successfully`);
            
        } catch (error) {
            console.error('Training failed:', error);
            this.showError('Training failed: ' + error.message);
            this.hideTrainingProgress();
        } finally {
            this.isTraining = false;
        }
    }

    async simulateTraining(model, parameters) {
        return new Promise((resolve) => {
            let progress = 0;
            const totalSteps = parameters.epochs;
            
            const interval = setInterval(() => {
                progress += 1;
                const percentage = Math.min((progress / totalSteps) * 100, 100);
                
                this.updateTrainingProgress(percentage, progress, totalSteps);
                
                if (progress >= totalSteps) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    showTrainingProgress() {
        const progressOverlay = document.createElement('div');
        progressOverlay.id = 'trainingProgress';
        progressOverlay.className = 'training-overlay';
        progressOverlay.innerHTML = `
            <div class="training-dialog">
                <h3>Training Model</h3>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div id="trainingProgressBar" class="progress-fill"></div>
                    </div>
                    <div id="trainingStatus" class="training-status">Initializing...</div>
                    <div id="trainingDetails" class="training-details">
                        <div>Epoch: <span id="currentEpoch">0</span> / <span id="totalEpochs">0</span></div>
                        <div>Loss: <span id="currentLoss">-</span></div>
                        <div>Accuracy: <span id="currentAccuracy">-</span></div>
                    </div>
                </div>
                <button class="btn btn-secondary" onclick="modelManager.cancelTraining()">Cancel</button>
            </div>
        `;
        progressOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        document.body.appendChild(progressOverlay);
    }

    updateTrainingProgress(percentage, currentEpoch, totalEpochs) {
        const progressBar = document.getElementById('trainingProgressBar');
        const status = document.getElementById('trainingStatus');
        const currentEpochSpan = document.getElementById('currentEpoch');
        const totalEpochsSpan = document.getElementById('totalEpochs');
        const lossSpan = document.getElementById('currentLoss');
        const accuracySpan = document.getElementById('currentAccuracy');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        
        if (status) {
            status.textContent = `Training... ${percentage.toFixed(1)}%`;
        }
        
        if (currentEpochSpan) {
            currentEpochSpan.textContent = currentEpoch;
        }
        
        if (totalEpochsSpan) {
            totalEpochsSpan.textContent = totalEpochs;
        }
        
        if (lossSpan) {
            const simulatedLoss = (2.0 - (currentEpoch / totalEpochs) * 1.5 + Math.random() * 0.1).toFixed(4);
            lossSpan.textContent = simulatedLoss;
        }
        
        if (accuracySpan) {
            const simulatedAccuracy = ((currentEpoch / totalEpochs) * 0.8 + Math.random() * 0.1).toFixed(3);
            accuracySpan.textContent = simulatedAccuracy;
        }
    }

    hideTrainingProgress() {
        const progressOverlay = document.getElementById('trainingProgress');
        if (progressOverlay) {
            progressOverlay.remove();
        }
    }

    cancelTraining() {
        this.isTraining = false;
        this.hideTrainingProgress();
        this.showError('Training cancelled');
    }

    async runInference() {
        const dataset = dataLoader.getCurrentDataset();
        const model = this.activeModel;
        
        if (!dataset) {
            this.showError('Please select a dataset first');
            return;
        }
        
        if (!model) {
            this.showError('Please select an active model first');
            return;
        }
        
        if (this.isInferring) {
            this.showError('Inference already in progress');
            return;
        }

        this.isInferring = true;
        this.showInferenceProgress();

        try {
            const data = dataLoader.getCurrentData();
            const predictions = await this.simulateInference(data, model);
            
            const inferenceResult = {
                dataset: dataset.id,
                model: model.id,
                predictions: predictions,
                confidence_scores: predictions.map(() => 0.5 + Math.random() * 0.5)
            };

            await apiService.createInferenceResult(inferenceResult);
            
            this.hideInferenceProgress();
            this.showInferenceResults(predictions, inferenceResult.confidence_scores);
            this.showSuccess('Inference completed successfully');
            
        } catch (error) {
            console.error('Inference failed:', error);
            this.showError('Inference failed: ' + error.message);
            this.hideInferenceProgress();
        } finally {
            this.isInferring = false;
        }
    }

    async simulateInference(data, model) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const predictions = data.map((point, index) => {
                    const magnitude = Math.sqrt(point.b_x ** 2 + point.b_y ** 2 + point.b_z ** 2);
                    const threshold = 15000 + Math.random() * 5000;
                    
                    if (Math.abs(magnitude - 25000) > threshold) {
                        return 'anomaly';
                    } else if (magnitude < 20000) {
                        return 'noise';
                    } else {
                        return 'normal';
                    }
                });
                resolve(predictions);
            }, 2000);
        });
    }

    showInferenceProgress() {
        const progressOverlay = document.createElement('div');
        progressOverlay.id = 'inferenceProgress';
        progressOverlay.className = 'inference-overlay';
        progressOverlay.innerHTML = `
            <div class="inference-dialog">
                <h3>Running Inference</h3>
                <div class="progress-container">
                    <div class="spinner"></div>
                    <div class="inference-status">Processing data with ${this.activeModel.name}...</div>
                </div>
            </div>
        `;
        progressOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        document.body.appendChild(progressOverlay);
    }

    hideInferenceProgress() {
        const progressOverlay = document.getElementById('inferenceProgress');
        if (progressOverlay) {
            progressOverlay.remove();
        }
    }

    showInferenceResults(predictions, confidenceScores) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        const resultCounts = predictions.reduce((acc, pred) => {
            acc[pred] = (acc[pred] || 0) + 1;
            return acc;
        }, {});

        const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;

        modalBody.innerHTML = `
            <h3>Inference Results</h3>
            <div class="inference-results">
                <div class="results-summary">
                    <h4>Summary</h4>
                    <div class="result-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Points:</span>
                            <span class="stat-value">${predictions.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Average Confidence:</span>
                            <span class="stat-value">${(avgConfidence * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="results-breakdown">
                    <h4>Prediction Breakdown</h4>
                    <div class="prediction-counts">
                        ${Object.entries(resultCounts).map(([label, count]) => `
                            <div class="prediction-item">
                                <span class="prediction-label ${label}">${label}</span>
                                <span class="prediction-count">${count} (${((count/predictions.length)*100).toFixed(1)}%)</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="modelManager.applyPredictionsAsLabels(${JSON.stringify(predictions).replace(/"/g, '&quot;')})">Apply as Labels</button>
                    <button class="btn btn-secondary" onclick="modelManager.exportResults()">Export Results</button>
                    <button class="btn" onclick="modelManager.closeModal()">Close</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    async applyPredictionsAsLabels(predictions) {
        const dataset = dataLoader.getCurrentDataset();
        if (!dataset) return;

        const labelsToCreate = [];
        let currentLabel = null;

        predictions.forEach((prediction, index) => {
            if (prediction !== 'normal') {
                if (!currentLabel || currentLabel.label_type !== prediction) {
                    if (currentLabel) {
                        labelsToCreate.push(currentLabel);
                    }
                    currentLabel = {
                        dataset: dataset.id,
                        start_index: index,
                        end_index: index,
                        label_type: prediction,
                        confidence: 0.7,
                        created_by: 'ml_model'
                    };
                } else {
                    currentLabel.end_index = index;
                }
            } else {
                if (currentLabel) {
                    labelsToCreate.push(currentLabel);
                    currentLabel = null;
                }
            }
        });

        if (currentLabel) {
            labelsToCreate.push(currentLabel);
        }

        try {
            await apiService.createLabels(labelsToCreate);
            await labelingTools.loadLabels();
            this.closeModal();
            this.showSuccess(`${labelsToCreate.length} labels created from predictions`);
        } catch (error) {
            console.error('Failed to create labels:', error);
            this.showError('Failed to create labels from predictions');
        }
    }

    exportResults() {
        this.showSuccess('Export functionality would be implemented here');
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    showError(message) {
        dataLoader.showError(message);
    }

    showSuccess(message) {
        dataLoader.showSuccess(message);
    }
}

const modelManager = new ModelManager();
window.modelManager = modelManager;