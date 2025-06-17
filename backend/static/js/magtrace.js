/**
 * MagTrace - Magnetic Field Analysis Platform
 * Professional ML workflow for magnetic field data analysis
 */

class MagTrace {
    constructor() {
        this.currentProject = null;
        this.currentDataset = null;
        this.currentModel = null;
        this.datasets = [];
        this.models = [];
        this.labelCategories = [];
        this.annotations = [];
        this.trainingSession = null;
        
        // Data and visualization
        this.rawData = [];
        this.processedData = [];
        this.chart = null;
        this.selectedRange = null;
        this.selectionMode = false;
        
        // Quick labels for rapid annotation
        this.quickLabels = [
            { name: 'fan_noise', label: 'Fan Noise', color: '#ff6b6b', hotkey: '1' },
            { name: 'motor_interference', label: 'Motor', color: '#ffd43b', hotkey: '2' },
            { name: 'normal', label: 'Normal', color: '#51cf66', hotkey: '3' },
            { name: 'anomaly', label: 'Anomaly', color: '#ff922b', hotkey: '4' },
            { name: 'electrical_noise', label: 'Electrical', color: '#845ef7', hotkey: '5' }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeQuickLabels();
        this.loadProjects();
        console.log('MagTrace initialized');
    }
    
    setupEventListeners() {
        // Project management
        document.getElementById('newProjectBtn').addEventListener('click', () => this.showNewProjectModal());
        document.getElementById('createProjectBtn').addEventListener('click', () => this.createProject());
        document.getElementById('saveProjectBtn').addEventListener('click', () => this.saveProject());
        document.getElementById('loadProjectBtn').addEventListener('click', () => this.loadProject());
        
        // Data upload
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('dataUpload').click();
        });
        document.getElementById('dataUpload').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Sidebar tabs
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchSidebarTab(e.target.dataset.tab));
        });
        
        // Content tabs
        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchContentTab(e.target.dataset.panel));
        });
        
        // Selection mode toggle
        document.getElementById('toggleSelectionMode').addEventListener('click', () => this.toggleSelectionMode());
        
        // Quick labeling
        document.querySelectorAll('.quick-label-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickLabel(e.target.dataset.label));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Model management
        document.getElementById('newModelBtn').addEventListener('click', () => this.createNewModel());
        document.getElementById('saveModelConfigBtn').addEventListener('click', () => this.saveModelConfiguration());
        document.getElementById('startTrainingBtn').addEventListener('click', () => this.startTraining());
        
        // Annotation management
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.addLabelCategory());
        document.getElementById('createAnnotationBtn').addEventListener('click', () => this.createAnnotation());
        
        // Modal handlers
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });
        
        // Clear selection
        document.getElementById('clearSelectionBtn').addEventListener('click', () => this.clearSelection());
    }
    
    initializeQuickLabels() {
        // Create default label categories if they don't exist
        this.quickLabels.forEach(label => {
            this.ensureLabelCategory(label);
        });
    }
    
    async ensureLabelCategory(labelInfo) {
        try {
            if (!this.currentProject) return;
            
            // Check if category already exists
            const exists = this.labelCategories.find(cat => cat.name === labelInfo.name);
            if (exists) return;
            
            const response = await fetch('/api/label-categories/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({
                    project: this.currentProject.id,
                    name: labelInfo.name,
                    description: labelInfo.label,
                    color: labelInfo.color,
                    is_active: true
                })
            });
            
            if (response.ok) {
                const category = await response.json();
                this.labelCategories.push(category);
                this.updateCategoryDisplay();
            }
        } catch (error) {
            console.error('Error creating label category:', error);
        }
    }
    
    // Project Management
    async loadProjects() {
        try {
            const response = await fetch('/api/projects/');
            if (response.ok) {
                const projects = await response.json();
                this.updateProjectSelector(projects);
            }
        } catch (error) {
            this.showNotification('Error loading projects', 'error');
        }
    }
    
    updateProjectSelector(projects) {
        const selector = document.getElementById('projectSelector');
        if (!selector) {
            console.error('Project selector not found');
            return;
        }
        
        selector.innerHTML = '<option value="">Select Project...</option>';
        
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            selector.appendChild(option);
        });
        
        // Only add event listener if not already added
        if (!selector.hasAttribute('data-listener-added')) {
            selector.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.loadProject(e.target.value);
                }
            });
            selector.setAttribute('data-listener-added', 'true');
        }
    }
    
    showNewProjectModal() {
        document.getElementById('newProjectModal').style.display = 'block';
    }
    
    async createProject() {
        const name = document.getElementById('newProjectName').value;
        const description = document.getElementById('newProjectDescription').value;
        
        if (!name) {
            this.showNotification('Project name is required', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/projects/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({ name, description })
            });
            
            if (response.ok) {
                const project = await response.json();
                this.currentProject = project;
                this.closeModal(document.getElementById('newProjectModal'));
                this.showNotification('Project created successfully', 'success');
                await this.loadProjects();
                await this.initializeQuickLabels();
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to create project');
            }
        } catch (error) {
            this.showNotification('Error creating project', 'error');
        }
    }
    
    async loadProject(projectId) {
        try {
            if (typeof projectId === 'string') {
                // Load specific project by ID
                const response = await fetch(`/api/projects/${projectId}/`);
                if (response.ok) {
                    this.currentProject = await response.json();
                }
            } else {
                // Load project from file (implement if needed)
                this.showNotification('Load from file not implemented yet', 'info');
                return;
            }
            
            // Load project data
            await this.loadProjectData();
            this.showNotification('Project loaded successfully', 'success');
            
        } catch (error) {
            this.showNotification('Error loading project', 'error');
        }
    }
    
    async loadProjectData() {
        if (!this.currentProject) return;
        
        try {
            // Load datasets
            const datasetsResponse = await fetch(`/api/datasets/?project_id=${this.currentProject.id}`);
            if (datasetsResponse.ok) {
                this.datasets = await datasetsResponse.json();
                this.updateDatasetDisplay();
            }
            
            // Load label categories
            const categoriesResponse = await fetch(`/api/label-categories/?project_id=${this.currentProject.id}`);
            if (categoriesResponse.ok) {
                this.labelCategories = await categoriesResponse.json();
                this.updateCategoryDisplay();
            }
            
            // Load models
            const modelsResponse = await fetch(`/api/user-models/?project_id=${this.currentProject.id}`);
            if (modelsResponse.ok) {
                this.models = await modelsResponse.json();
                this.updateModelsDisplay();
            }
            
            // Initialize quick labels
            this.initializeQuickLabels();
            
        } catch (error) {
            console.error('Error loading project data:', error);
        }
    }
    
    // Data Management
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!this.currentProject) {
            this.showNotification('Please create or select a project first', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('project', this.currentProject.id);
        
        try {
            this.showNotification('Uploading and processing data...', 'loading');
            
            const response = await fetch('/api/datasets/upload/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: formData
            });
            
            if (response.ok) {
                const dataset = await response.json();
                this.datasets.push(dataset);
                this.updateDatasetDisplay();
                this.showNotification('Data uploaded successfully', 'success');
                
                // Auto-load the dataset
                await this.loadDataset(dataset.id);
            } else {
                let errorMessage = 'Upload failed';
                try {
                    const error = await response.json();
                    errorMessage = error.error || errorMessage;
                } catch (e) {
                    // Response is not JSON, use default message
                    console.error('Non-JSON error response:', e);
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            this.showNotification(`Upload error: ${error.message}`, 'error');
        }
    }
    
    updateDatasetDisplay() {
        const container = document.getElementById('datasets');
        if (!container) {
            console.error('Datasets container not found');
            return;
        }
        
        container.innerHTML = '';
        
        this.datasets.forEach(dataset => {
            const item = document.createElement('div');
            item.className = 'dataset-item';
            
            const info = document.createElement('div');
            info.className = 'dataset-info';
            info.innerHTML = `
                <strong>${dataset.name}</strong>
                <span class="text-muted">${dataset.total_records || 0} records</span>
            `;
            
            const actions = document.createElement('div');
            actions.className = 'dataset-actions';
            
            const loadBtn = document.createElement('button');
            loadBtn.className = 'btn btn-primary btn-small';
            loadBtn.textContent = 'Load';
            loadBtn.addEventListener('click', () => this.loadDataset(dataset.id));
            
            actions.appendChild(loadBtn);
            item.appendChild(info);
            item.appendChild(actions);
            container.appendChild(item);
        });
    }
    
    async loadDataset(datasetId) {
        try {
            this.showNotification('Loading dataset...', 'loading');
            
            // Get dataset info
            const datasetResponse = await fetch(`/api/datasets/${datasetId}/`);
            if (!datasetResponse.ok) throw new Error('Failed to load dataset');
            
            this.currentDataset = await datasetResponse.json();
            
            // Load readings
            const readingsResponse = await fetch(`/api/readings/?dataset_id=${datasetId}`);
            if (!readingsResponse.ok) throw new Error('Failed to load readings');
            
            const readings = await readingsResponse.json();
            this.rawData = readings;
            this.processData();
            this.renderChart();
            
            // Load annotations for this dataset
            await this.loadAnnotations();
            
            this.showNotification('Dataset loaded successfully', 'success');
            
        } catch (error) {
            this.showNotification(`Error loading dataset: ${error.message}`, 'error');
        }
    }
    
    processData() {
        if (!this.rawData || this.rawData.length === 0) return;
        
        let data = this.rawData.map((reading, index) => ({
            index: index,
            timestamp: reading.timestamp_pc,
            b_x: parseFloat(reading.b_x),
            b_y: parseFloat(reading.b_y),
            b_z: parseFloat(reading.b_z),
            magnitude: Math.sqrt(reading.b_x ** 2 + reading.b_y ** 2 + reading.b_z ** 2),
            lat: parseFloat(reading.lat),
            lon: parseFloat(reading.lon),
            altitude: parseFloat(reading.altitude)
        }));
        
        // Performance optimization: decimate large datasets for visualization
        if (data.length > 5000) {
            const step = Math.ceil(data.length / 5000);
            data = data.filter((_, index) => index % step === 0);
            this.showNotification(`Dataset decimated to ${data.length} points for performance`, 'info');
        }
        
        this.processedData = data;
    }
    
    // Visualization
    renderChart() {
        if (!this.processedData || this.processedData.length === 0) return;
        
        const svg = d3.select('#mainChart');
        svg.selectAll('*').remove();
        
        const container = document.getElementById('chartArea');
        const width = container.clientWidth - 40;
        const height = container.clientHeight - 40;
        
        svg.attr('width', width).attr('height', height);
        
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Scales
        const xScale = d3.scaleLinear()
            .domain([0, this.processedData.length - 1])
            .range([0, innerWidth]);
        
        const yScale = d3.scaleLinear()
            .domain(d3.extent(this.processedData, d => d.magnitude))
            .nice()
            .range([innerHeight, 0]);
        
        // Line generator
        const line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d.magnitude))
            .curve(d3.curveLinear);
        
        // Add axes
        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale));
        
        g.append('g')
            .call(d3.axisLeft(yScale));
        
        // Add the line
        g.append('path')
            .datum(this.processedData)
            .attr('fill', 'none')
            .attr('stroke', '#667eea')
            .attr('stroke-width', 1.5)
            .attr('d', line);
        
        // Add brush for selection
        const brush = d3.brushX()
            .extent([[0, 0], [innerWidth, innerHeight]])
            .on('end', (event) => this.handleBrushSelection(event, xScale));
        
        this.brushGroup = g.append('g')
            .attr('class', 'brush')
            .call(brush);
        
        // Store scales for later use
        this.xScale = xScale;
        this.yScale = yScale;
        
        // Render existing annotations
        this.renderAnnotations();
    }
    
    handleBrushSelection(event, xScale) {
        if (!event.selection) {
            this.selectedRange = null;
            this.updateSelectionInfo();
            return;
        }
        
        const [x0, x1] = event.selection;
        const startIndex = Math.round(xScale.invert(x0));
        const endIndex = Math.round(xScale.invert(x1));
        
        this.selectedRange = {
            startIndex: Math.max(0, Math.min(startIndex, endIndex)),
            endIndex: Math.min(this.processedData.length - 1, Math.max(startIndex, endIndex))
        };
        
        this.updateSelectionInfo();
        
        // Show quick labeling toolbar if in selection mode
        if (this.selectionMode) {
            document.getElementById('quickLabelingToolbar').style.display = 'block';
        }
    }
    
    updateSelectionInfo() {
        const infoElement = document.getElementById('selectionStats');
        if (!infoElement) {
            console.error('Selection stats element not found');
            return;
        }
        
        if (!this.selectedRange) {
            infoElement.textContent = 'No selection';
            return;
        }
        
        const count = this.selectedRange.endIndex - this.selectedRange.startIndex + 1;
        infoElement.textContent = `Selected: ${count} points (${this.selectedRange.startIndex}-${this.selectedRange.endIndex})`;
    }
    
    toggleSelectionMode() {
        this.selectionMode = !this.selectionMode;
        const btn = document.getElementById('toggleSelectionMode');
        
        if (this.selectionMode) {
            btn.textContent = 'Exit Selection';
            btn.classList.add('btn-warning');
            btn.classList.remove('btn-primary');
            this.showNotification('Selection mode enabled. Drag to select data points.', 'info');
        } else {
            btn.textContent = 'Select Mode';
            btn.classList.add('btn-primary');
            btn.classList.remove('btn-warning');
            document.getElementById('quickLabelingToolbar').style.display = 'none';
            this.clearSelection();
            this.showNotification('Selection mode disabled', 'info');
        }
    }
    
    clearSelection() {
        this.selectedRange = null;
        if (this.brushGroup) {
            this.brushGroup.call(d3.brushX().clear);
        }
        this.updateSelectionInfo();
        const toolbar = document.getElementById('quickLabelingToolbar');
        if (toolbar) {
            toolbar.style.display = 'none';
        }
    }
    
    // Annotation System
    async handleQuickLabel(labelName) {
        if (!this.selectedRange) {
            this.showNotification('Please select a data range first', 'error');
            return;
        }
        
        if (!this.currentDataset) {
            this.showNotification('Please load a dataset first', 'error');
            return;
        }
        
        // Find the label category
        const category = this.labelCategories.find(cat => cat.name === labelName);
        if (!category) {
            this.showNotification('Label category not found', 'error');
            return;
        }
        
        await this.createAnnotationDirect(category.id, this.selectedRange.startIndex, this.selectedRange.endIndex, 1.0);
    }
    
    async createAnnotationDirect(categoryId, startIndex, endIndex, confidence = 1.0, notes = '') {
        try {
            const response = await fetch('/api/annotations/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({
                    dataset: this.currentDataset.id,
                    category: categoryId,
                    start_index: startIndex,
                    end_index: endIndex,
                    confidence: confidence,
                    notes: notes,
                    created_by: 'user'
                })
            });
            
            if (response.ok) {
                const annotation = await response.json();
                this.annotations.push(annotation);
                this.renderAnnotations();
                this.updateAnnotationsDisplay();
                this.showNotification('Annotation created successfully', 'success');
                this.clearSelection();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create annotation');
            }
        } catch (error) {
            this.showNotification(`Error creating annotation: ${error.message}`, 'error');
        }
    }
    
    async loadAnnotations() {
        if (!this.currentDataset) return;
        
        try {
            const response = await fetch(`/api/annotations/?dataset_id=${this.currentDataset.id}`);
            if (response.ok) {
                this.annotations = await response.json();
                this.updateAnnotationsDisplay();
                this.renderAnnotations();
            }
        } catch (error) {
            console.error('Error loading annotations:', error);
        }
    }
    
    renderAnnotations() {
        if (!this.xScale || !this.yScale) return;
        
        const svg = d3.select('#mainChart');
        svg.selectAll('.annotation-overlay').remove();
        
        const g = svg.select('g');
        const height = this.yScale.range()[0];
        
        this.annotations.forEach(annotation => {
            const category = this.labelCategories.find(cat => cat.id === annotation.category);
            const color = category ? category.color : '#cccccc';
            
            const x = this.xScale(annotation.start_index);
            const width = this.xScale(annotation.end_index) - this.xScale(annotation.start_index);
            
            g.append('rect')
                .attr('class', 'annotation-overlay')
                .attr('x', x)
                .attr('y', 0)
                .attr('width', width)
                .attr('height', height)
                .attr('fill', color)
                .attr('opacity', 0.3)
                .attr('stroke', color)
                .attr('stroke-width', 1);
        });
    }
    
    updateAnnotationsDisplay() {
        const container = document.getElementById('annotationsList');
        container.innerHTML = '';
        
        this.annotations.forEach(annotation => {
            const category = this.labelCategories.find(cat => cat.id === annotation.category);
            const categoryName = category ? category.name : 'Unknown';
            const categoryColor = category ? category.color : '#cccccc';
            
            const item = document.createElement('div');
            item.className = 'annotation-item';
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; background: ${categoryColor}; border-radius: 50%;"></div>
                    <strong>${categoryName}</strong>
                </div>
                <div class="text-muted">
                    Range: ${annotation.start_index}-${annotation.end_index} 
                    (Confidence: ${(annotation.confidence * 100).toFixed(0)}%)
                </div>
                ${annotation.notes ? `<div class="text-muted">${annotation.notes}</div>` : ''}
            `;
            container.appendChild(item);
        });
    }
    
    updateCategoryDisplay() {
        const container = document.getElementById('categoryTree');
        container.innerHTML = '';
        
        this.labelCategories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                <div class="category-color" style="background-color: ${category.color}"></div>
                <span>${category.name}</span>
            `;
            container.appendChild(item);
        });
        
        // Update annotation modal dropdown
        this.updateAnnotationCategoryDropdown();
    }
    
    updateAnnotationCategoryDropdown() {
        const selects = ['annotationCategory', 'editAnnotationCategory'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select Category...</option>';
                this.labelCategories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });
            }
        });
    }
    
    // Model Management
    async createNewModel() {
        if (!this.currentProject) {
            this.showNotification('Please create or select a project first', 'error');
            return;
        }
        
        this.switchContentTab('modelConfig');
        document.getElementById('modelName').value = '';
        document.getElementById('modelDescription').value = '';
    }
    
    async saveModelConfiguration() {
        const name = document.getElementById('modelName').value;
        const description = document.getElementById('modelDescription').value;
        const modelType = document.getElementById('modelType').value;
        
        if (!name) {
            this.showNotification('Model name is required', 'error');
            return;
        }
        
        const hyperparameters = {
            learning_rate: parseFloat(document.getElementById('learningRate').value),
            batch_size: parseInt(document.getElementById('batchSize').value),
            epochs: parseInt(document.getElementById('epochs').value),
            validation_split: parseFloat(document.getElementById('validationSplit').value)
        };
        
        try {
            const response = await fetch('/api/user-models/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({
                    project: this.currentProject.id,
                    name: name,
                    description: description,
                    model_type: modelType,
                    hyperparameters: hyperparameters,
                    python_script: '# Model script will be generated'
                })
            });
            
            if (response.ok) {
                const model = await response.json();
                this.models.push(model);
                this.updateModelsDisplay();
                this.currentModel = model;
                this.showNotification('Model configuration saved', 'success');
            } else {
                throw new Error('Failed to save model configuration');
            }
        } catch (error) {
            this.showNotification('Error saving model configuration', 'error');
        }
    }
    
    updateModelsDisplay() {
        const container = document.getElementById('modelsList');
        if (!container) {
            console.error('Models list container not found');
            return;
        }
        
        container.innerHTML = '';
        
        this.models.forEach(model => {
            const item = document.createElement('div');
            item.className = 'model-item';
            
            const info = document.createElement('div');
            info.className = 'model-info';
            info.innerHTML = `
                <strong>${model.name}</strong>
                <span class="text-muted">${model.model_type}</span>
            `;
            
            const actions = document.createElement('div');
            actions.className = 'model-actions';
            
            const selectBtn = document.createElement('button');
            selectBtn.className = 'btn btn-primary btn-small';
            selectBtn.textContent = 'Select';
            selectBtn.addEventListener('click', () => this.selectModel(model.id));
            
            actions.appendChild(selectBtn);
            item.appendChild(info);
            item.appendChild(actions);
            container.appendChild(item);
        });
    }
    
    async selectModel(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (model) {
            this.currentModel = model;
            this.showNotification(`Model "${model.name}" selected`, 'success');
        }
    }
    
    // Training
    async startTraining() {
        if (!this.currentModel) {
            this.showNotification('Please create and select a model first', 'error');
            return;
        }
        
        if (!this.currentDataset) {
            this.showNotification('Please load a dataset first', 'error');
            return;
        }
        
        if (this.annotations.length === 0) {
            this.showNotification('Please create some annotations first', 'error');
            return;
        }
        
        try {
            this.showNotification('Starting training...', 'loading');
            
            const response = await fetch('/api/training-sessions/start_training/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({
                    model_id: this.currentModel.id,
                    dataset_id: this.currentDataset.id,
                    training_config: {
                        epochs: parseInt(document.getElementById('epochs').value) || 100,
                        batch_size: parseInt(document.getElementById('batchSize').value) || 32,
                        learning_rate: parseFloat(document.getElementById('learningRate').value) || 0.001
                    }
                })
            });
            
            if (response.ok) {
                this.trainingSession = await response.json();
                this.switchContentTab('training');
                this.monitorTraining();
                this.showNotification('Training started successfully', 'success');
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Training failed to start');
            }
        } catch (error) {
            this.showNotification(`Training error: ${error.message}`, 'error');
        }
    }
    
    async monitorTraining() {
        if (!this.trainingSession) return;
        
        const updateProgress = async () => {
            try {
                const response = await fetch(`/api/training-sessions/${this.trainingSession.id}/status/`);
                if (response.ok) {
                    const status = await response.json();
                    this.updateTrainingDisplay(status);
                    
                    if (status.status === 'running') {
                        setTimeout(updateProgress, 2000); // Update every 2 seconds
                    }
                }
            } catch (error) {
                console.error('Error monitoring training:', error);
            }
        };
        
        updateProgress();
    }
    
    updateTrainingDisplay(status) {
        // Update training panel with progress
        const activeTraining = document.getElementById('activeTraining');
        if (!activeTraining) {
            console.error('Active training element not found');
            return;
        }
        
        // Show the training session
        activeTraining.classList.remove('d-none');
        
        // Update individual elements safely
        const statusElement = document.getElementById('trainingStatus');
        const progressElement = document.getElementById('trainingProgress');
        const progressFill = document.getElementById('progressFill');
        const currentEpoch = document.getElementById('currentEpoch');
        const totalEpochs = document.getElementById('totalEpochs');
        
        if (statusElement) statusElement.textContent = status.status || 'Unknown';
        if (progressElement) progressElement.textContent = `${(status.progress || 0).toFixed(1)}%`;
        if (progressFill) progressFill.style.width = `${status.progress || 0}%`;
        if (currentEpoch) currentEpoch.textContent = status.current_epoch || 0;
        if (totalEpochs) totalEpochs.textContent = status.total_epochs || 0;
        
        // Update button states
        const startBtn = document.getElementById('startTrainingBtn');
        const stopBtn = document.getElementById('stopTrainingBtn');
        
        if (status.status === 'running') {
            if (startBtn) startBtn.classList.add('d-none');
            if (stopBtn) stopBtn.classList.remove('d-none');
        } else {
            if (startBtn) startBtn.classList.remove('d-none');
            if (stopBtn) stopBtn.classList.add('d-none');
        }
    }
    
    async stopTraining() {
        if (!this.trainingSession) return;
        
        try {
            const response = await fetch(`/api/training-sessions/${this.trainingSession.id}/stop_training/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                }
            });
            
            if (response.ok) {
                this.showNotification('Training stopped', 'success');
            }
        } catch (error) {
            this.showNotification('Error stopping training', 'error');
        }
    }
    
    // UI Helpers
    switchSidebarTab(tabName) {
        // Hide all panels
        document.querySelectorAll('.sidebar-panel').forEach(panel => {
            panel.classList.add('d-none');
        });
        
        // Show selected panel
        document.getElementById(`${tabName}Tab`).classList.remove('d-none');
        
        // Update tab buttons
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }
    
    switchContentTab(panelName) {
        // Hide all panels
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Show selected panel
        document.getElementById(`${panelName}Panel`).classList.add('active');
        
        // Update tab buttons
        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-panel="${panelName}"]`).classList.add('active');
    }
    
    handleKeyboardShortcuts(event) {
        if (!this.selectionMode || !this.selectedRange) return;
        
        const key = event.key;
        if (key >= '1' && key <= '5') {
            event.preventDefault();
            const labelIndex = parseInt(key) - 1;
            if (labelIndex < this.quickLabels.length) {
                this.handleQuickLabel(this.quickLabels[labelIndex].name);
            }
        }
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8',
            'loading': '#6c757d'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            background: ${colors[type] || colors.info};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        if (type !== 'loading') {
            setTimeout(() => notification.remove(), 5000);
        }
    }
    
    closeModal(modal) {
        modal.style.display = 'none';
    }
    
    getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                     document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        if (!token) {
            console.warn('CSRF token not found - API calls may fail');
            return '';
        }
        return token;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new MagTrace();
});