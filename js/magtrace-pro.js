/**
 * MagTrace Pro - Complete ML Workflow Platform
 * Implements the original vision with user-defined models and local training
 */

// Notification Manager for better user feedback
class NotificationManager {
    static show(message, type = 'info', duration = 5000, actions = []) {
        // Remove any existing notifications of the same type
        const existingNotifications = document.querySelectorAll(`.notification.${type}`);
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8',
            'loading': '#6c757d'
        };
        
        const icons = {
            'success': '✓',
            'error': '✗',
            'warning': '⚠',
            'info': 'ℹ',
            'loading': '⟳'
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
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const icon = document.createElement('span');
        icon.textContent = icons[type] || icons.info;
        icon.style.fontSize = '1.2rem';
        if (type === 'loading') {
            icon.style.animation = 'spin 1s linear infinite';
        }
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        messageSpan.style.flex = '1';
        
        notification.appendChild(icon);
        notification.appendChild(messageSpan);
        
        // Add action buttons if provided
        if (actions.length > 0) {
            const actionContainer = document.createElement('div');
            actionContainer.style.cssText = `
                display: flex;
                gap: 0.5rem;
                margin-left: 1rem;
            `;
            
            actions.forEach(action => {
                const button = document.createElement('button');
                button.textContent = action.label;
                button.onclick = action.callback;
                button.style.cssText = `
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8rem;
                `;
                actionContainer.appendChild(button);
            });
            
            notification.appendChild(actionContainer);
        }
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: 0.5rem;
            padding: 0;
            line-height: 1;
        `;
        closeButton.onclick = () => notification.remove();
        notification.appendChild(closeButton);
        
        document.body.appendChild(notification);
        
        // Auto-remove after duration (except for loading and error types)
        if (type !== 'loading' && type !== 'error') {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        } else if (type === 'error') {
            // Errors stay longer
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration * 2);
        }
        
        return notification;
    }
    
    static showSuccess(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }
    
    static showError(message, error = null, retryCallback = null) {
        console.error(message, error);
        
        const actions = retryCallback ? [
            { label: 'Retry', callback: retryCallback }
        ] : [];
        
        const fullMessage = error && error.message ? 
            `${message}: ${error.message}` : message;
            
        return this.show(fullMessage, 'error', 10000, actions);
    }
    
    static showWarning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }
    
    static showInfo(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
    
    static showLoading(message) {
        return this.show(message, 'loading', 0);
    }
    
    static hideLoading() {
        const loadingNotifications = document.querySelectorAll('.notification.loading');
        loadingNotifications.forEach(notification => notification.remove());
    }
    
    static clear() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => notification.remove());
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

class MagTracePro {
    constructor() {
        this.currentProject = null;
        this.currentDataset = null;
        this.currentModel = null;
        this.activeTrainingSession = null;
        this.scriptEditor = null;
        this.chart = null;
        this.currentChartView = 'timeseries';
        this.chartScales = null;
        this.currentTransform = null;
        this.currentXScale = null;
        this.currentYScale = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.initializeScriptEditor();
        this.loadProjects();
        
        // Initialize D3 chart
        this.initializeChart();
        
        console.log('MagTrace Pro initialized');
    }

    setupEventListeners() {
        // Header controls
        document.getElementById('newProjectBtn').addEventListener('click', () => this.showNewProjectModal());
        document.getElementById('saveProjectBtn').addEventListener('click', () => this.saveProject());
        document.getElementById('loadProjectBtn').addEventListener('click', () => this.loadProject());
        document.getElementById('projectSelector').addEventListener('change', (e) => this.selectProject(e.target.value));

        // Sidebar tabs
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchSidebarTab(e.target.dataset.tab));
        });

        // Content tabs
        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchContentPanel(e.target.dataset.panel));
        });

        // Data upload
        document.getElementById('uploadBtn').addEventListener('click', () => this.uploadData());

        // Model configuration
        document.getElementById('newModelBtn').addEventListener('click', () => this.createNewModel());
        document.getElementById('saveModelConfigBtn').addEventListener('click', () => this.saveModelConfiguration());
        document.getElementById('generateTemplateBtn').addEventListener('click', () => this.generateScriptTemplate());
        document.getElementById('addHyperparameterBtn').addEventListener('click', () => this.addCustomHyperparameter());
        
        // Prediction workflow
        document.getElementById('generatePredictionsBtn')?.addEventListener('click', () => this.generatePredictions());

        // Script editor
        document.getElementById('loadTemplateBtn').addEventListener('click', () => this.loadScriptTemplate());
        document.getElementById('validateScriptBtn').addEventListener('click', () => this.validateScript());
        document.getElementById('saveScriptBtn').addEventListener('click', () => this.saveScript());
        document.getElementById('loadScriptBtn').addEventListener('click', () => document.getElementById('scriptFileInput').click());
        document.getElementById('scriptFileInput').addEventListener('change', (e) => this.loadScriptFile(e.target.files[0]));

        // Training
        document.getElementById('startTrainingBtn').addEventListener('click', () => this.startTraining());
        document.getElementById('stopTrainingBtn').addEventListener('click', () => this.stopTraining());

        // Modal handling
        document.getElementById('createProjectBtn').addEventListener('click', () => this.createProject());
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Model type change
        document.getElementById('modelType').addEventListener('change', (e) => this.onModelTypeChange(e.target.value));
        
        // Annotation management
        document.getElementById('createAnnotationBtn')?.addEventListener('click', () => this.createAnnotation());
        document.getElementById('updateAnnotationBtn')?.addEventListener('click', () => this.updateAnnotation());
        
        // Chart view controls
        document.querySelectorAll('.chart-view-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchChartView(e.target.dataset.view));
        });
        document.getElementById('chartYAxis')?.addEventListener('change', (e) => this.onChartOptionsChange());
        document.getElementById('exportChart')?.addEventListener('click', () => this.exportChart());
    }

    initializeScriptEditor() {
        this.scriptEditor = ace.edit("scriptEditor");
        this.scriptEditor.setTheme("ace/theme/github");
        this.scriptEditor.session.setMode("ace/mode/python");
        this.scriptEditor.setOptions({
            fontSize: 14,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        });

        // Set default template
        this.loadScriptTemplate();
    }

    initializeChart() {
        const svg = d3.select("#mainChart");
        const container = document.getElementById("chartArea");
        
        // Set up responsive chart
        const resizeChart = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            svg.attr("width", width).attr("height", height);
            
            if (this.currentDataset) {
                this.renderChart();
            }
        };

        window.addEventListener('resize', resizeChart);
        resizeChart();
    }

    // Project Management
    async loadProjects() {
        try {
            const response = await fetch('http://localhost:8000/api/projects/');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const projects = await response.json();
            
            const selector = document.getElementById('projectSelector');
            selector.innerHTML = '<option value="">Select Project...</option>';
            
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                selector.appendChild(option);
            });
        } catch (error) {
            NotificationManager.showError('Failed to load projects', error, () => this.loadProjects());
        }
    }

    showNewProjectModal() {
        document.getElementById('newProjectModal').style.display = 'flex';
    }

    async createProject() {
        const name = document.getElementById('newProjectName').value;
        const description = document.getElementById('newProjectDescription').value;

        if (!name.trim()) {
            NotificationManager.showWarning('Please enter a project name');
            return;
        }

        const loadingNotification = NotificationManager.showLoading('Creating project...');

        try {
            const response = await fetch('http://localhost:8000/api/projects/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), description: description.trim() })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const project = await response.json();
            this.currentProject = project;
            this.closeModals();
            
            // Clear form
            document.getElementById('newProjectName').value = '';
            document.getElementById('newProjectDescription').value = '';
            
            await this.loadProjects();
            document.getElementById('projectSelector').value = project.id;
            this.loadProjectData();
            
            NotificationManager.hideLoading();
            NotificationManager.showSuccess(`Project "${project.name}" created successfully`);
            
        } catch (error) {
            NotificationManager.hideLoading();
            NotificationManager.showError('Failed to create project', error);
        }
    }

    async selectProject(projectId) {
        if (!projectId) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/`);
            this.currentProject = await response.json();
            this.loadProjectData();
        } catch (error) {
            console.error('Failed to load project:', error);
        }
    }

    async loadProjectData() {
        if (!this.currentProject) return;

        // Load datasets
        this.loadDatasets();
        
        // Load models
        this.loadModels();
        
        // Load label categories
        this.loadLabelCategories();
        
        // Load annotations if dataset is selected
        if (this.currentDataset) {
            this.loadAnnotations();
        }
    }

    async saveProject() {
        if (!this.currentProject) {
            NotificationManager.showWarning('No project selected');
            return;
        }

        const loadingNotification = NotificationManager.showLoading('Exporting project...');

        try {
            const response = await fetch(`http://localhost:8000/api/projects/${this.currentProject.id}/export/`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Export failed: HTTP ${response.status}`);
            }

            // Download the ZIP file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this.currentProject.name}_export.zip`;
            link.click();
            window.URL.revokeObjectURL(url);

            NotificationManager.hideLoading();
            NotificationManager.showSuccess('Project exported successfully');
        } catch (error) {
            NotificationManager.hideLoading();
            NotificationManager.showError('Failed to export project', error, () => this.saveProject());
        }
    }

    loadProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip,.magproj';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const loadingNotification = NotificationManager.showLoading('Importing project...');
                
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await fetch('http://localhost:8000/api/projects/import_project/', {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || `Import failed: HTTP ${response.status}`);
                    }

                    const project = await response.json();
                    this.currentProject = project;
                    await this.loadProjects();
                    document.getElementById('projectSelector').value = project.id;
                    this.loadProjectData();

                    NotificationManager.hideLoading();
                    NotificationManager.showSuccess(`Project "${project.name}" imported successfully`);
                } catch (error) {
                    NotificationManager.hideLoading();
                    NotificationManager.showError('Failed to import project', error, () => this.loadProject());
                }
            }
        };
        input.click();
    }

    // Data Management
    async uploadData() {
        const fileInput = document.getElementById('dataUpload');
        const file = fileInput.files[0];

        // Validation
        if (!file) {
            NotificationManager.showWarning('Please select a CSV file');
            return;
        }

        if (!this.currentProject) {
            NotificationManager.showWarning('Please select or create a project first');
            return;
        }

        // File validation
        const validationResult = this.validateDataFile(file);
        if (!validationResult.valid) {
            NotificationManager.showError(validationResult.message);
            return;
        }

        const loadingNotification = NotificationManager.showLoading(`Uploading ${file.name}...`);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name.replace(/\.[^/.]+$/, "")); // Remove any extension
        formData.append('project_id', this.currentProject.id);

        try {
            const response = await fetch('http://localhost:8000/api/datasets/upload/', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Upload failed: HTTP ${response.status}`);
            }

            const dataset = await response.json();
            
            NotificationManager.hideLoading();
            NotificationManager.showSuccess(`Dataset "${dataset.name}" uploaded successfully`);
            
            // Clear file input
            fileInput.value = '';
            
            // Refresh and select the new dataset
            await this.loadDatasets();
            this.selectDataset(dataset.id);
            
        } catch (error) {
            NotificationManager.hideLoading();
            NotificationManager.showError('Failed to upload data', error, () => this.uploadData());
        }
    }

    validateDataFile(file) {
        // File type validation
        const validExtensions = ['csv', 'txt'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            return {
                valid: false,
                message: `Invalid file type. Please select a CSV file. Got: .${fileExtension}`
            };
        }

        // File size validation (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return {
                valid: false,
                message: `File too large. Maximum size is 10MB. File size: ${(file.size / 1024 / 1024).toFixed(1)}MB`
            };
        }

        // Minimum file size (prevent empty files)
        if (file.size < 100) {
            return {
                valid: false,
                message: 'File is too small or empty. Please select a valid CSV file with data.'
            };
        }

        return { valid: true };
    }

    async loadDatasets() {
        if (!this.currentProject) return;

        try {
            const response = await fetch(`http://localhost:8000/api/datasets/?project=${this.currentProject.id}`);
            const datasets = await response.json();
            
            const container = document.getElementById('datasets');
            container.innerHTML = '';

            datasets.forEach(dataset => {
                const div = document.createElement('div');
                div.className = 'dataset-item';
                div.innerHTML = `
                    <h5>${dataset.name}</h5>
                    <p class="text-muted">${dataset.total_records} records</p>
                `;
                div.addEventListener('click', () => this.selectDataset(dataset.id));
                container.appendChild(div);
            });
        } catch (error) {
            console.error('Failed to load datasets:', error);
        }
    }

    async selectDataset(datasetId) {
        try {
            const response = await fetch(`http://localhost:8000/api/datasets/${datasetId}/`);
            this.currentDataset = await response.json();
            
            // Load dataset data
            const dataResponse = await fetch(`http://localhost:8000/api/datasets/${datasetId}/data/`);
            this.currentData = await dataResponse.json();
            
            this.renderChart();
            this.loadAnnotations();
        } catch (error) {
            console.error('Failed to load dataset:', error);
        }
    }

    // Visualization
    renderChart() {
        if (!this.currentData || this.currentData.length === 0) return;

        // Delegate to specific chart view renderer
        switch (this.currentChartView) {
            case 'timeseries':
                this.renderTimeSeriesChart();
                break;
            case 'components':
                this.renderComponentsChart();
                break;
            case '3d':
                this.render3DChart();
                break;
            case 'magnitude':
                this.renderMagnitudeChart();
                break;
            default:
                this.renderTimeSeriesChart();
        }
    }

    renderTimeSeriesChart() {
        if (!this.currentData || this.currentData.length === 0) return;

        const svg = d3.select("#mainChart");
        svg.selectAll("*").remove();

        const container = document.getElementById("chartArea");
        const margin = { top: 20, right: 80, bottom: 40, left: 60 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = container.clientHeight - margin.top - margin.bottom;

        // Process data
        const data = this.currentData.map((d, i) => ({
            ...d,
            index: i,
            timestamp: new Date(d.timestamp_pc)
        }));

        // Create scales based on Y-axis option
        const xScale = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, width]);

        const yScale = this.createYScale(data, height);

        // Store scales for zoom/pan updates
        this.chartScales = { xScale, yScale, originalXDomain: xScale.domain(), originalYDomain: yScale.domain() };

        // Create main group
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add clipping path to prevent overflow
        svg.append("defs")
            .append("clipPath")
            .attr("id", "chartClip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        // Create axes groups
        const xAxis = g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`);

        const yAxis = g.append("g")
            .attr("class", "y-axis");

        // Create chart content group with clipping
        const chartContent = g.append("g")
            .attr("class", "chart-content")
            .attr("clip-path", "url(#chartClip)");

        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 50])
            .extent([[0, 0], [width, height]])
            .on("zoom", (event) => this.onZoom(event, data, chartContent, xAxis, yAxis));

        // Apply zoom to main SVG
        svg.call(zoom);

        // Initial render
        this.updateChartContent(data, chartContent, xAxis, yAxis);

        // Add reset zoom button
        this.addChartControls(svg, zoom, margin);

        // Add selection mode toggle
        this.addSelectionModeToggle(svg, g, data, zoom, width, height);

        // Render annotations
        this.renderAnnotations(chartContent, this.chartScales.xScale, height);
    }

    createYScale(data, height) {
        const yAxisOption = this.chartYAxisOption || 'symmetric';
        
        switch (yAxisOption) {
            case 'auto':
                return d3.scaleLinear()
                    .domain(d3.extent(data, d => Math.max(Math.abs(d.b_x), Math.abs(d.b_y), Math.abs(d.b_z))))
                    .range([height, 0]);
            
            case 'symmetric':
                const yExtent = d3.extent(data, d => Math.max(Math.abs(d.b_x), Math.abs(d.b_y), Math.abs(d.b_z)));
                return d3.scaleLinear()
                    .domain([-yExtent[1], yExtent[1]])
                    .range([height, 0]);
            
            case 'individual':
                // For individual scaling, we'll use the overall extent but this could be enhanced
                const allValues = data.flatMap(d => [d.b_x, d.b_y, d.b_z]);
                return d3.scaleLinear()
                    .domain(d3.extent(allValues))
                    .range([height, 0]);
            
            default:
                return d3.scaleLinear()
                    .domain([-1, 1])
                    .range([height, 0]);
        }
    }

    renderComponentsChart() {
        if (!this.currentData || this.currentData.length === 0) return;

        const svg = d3.select("#mainChart");
        svg.selectAll("*").remove();

        const container = document.getElementById("chartArea");
        const margin = { top: 20, right: 80, bottom: 40, left: 60 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = container.clientHeight - margin.top - margin.bottom;

        // Process data
        const data = this.currentData.map((d, i) => ({
            ...d,
            index: i,
            timestamp: new Date(d.timestamp_pc)
        }));

        // Create separate sub-charts for each component
        const componentHeight = (height - 40) / 3; // Divide by 3 components with spacing
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
        const fields = ['b_x', 'b_y', 'b_z'];
        const labels = ['B_x', 'B_y', 'B_z'];

        const xScale = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, width]);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        fields.forEach((field, i) => {
            const yOffset = i * (componentHeight + 20);
            const componentData = data.map(d => ({ index: d.index, value: d[field] }));
            
            const yScale = d3.scaleLinear()
                .domain(d3.extent(componentData, d => d.value))
                .range([componentHeight, 0]);

            // Component group
            const componentGroup = g.append("g")
                .attr("transform", `translate(0, ${yOffset})`);

            // Add background
            componentGroup.append("rect")
                .attr("width", width)
                .attr("height", componentHeight)
                .attr("fill", colors[i])
                .attr("opacity", 0.05)
                .attr("stroke", colors[i])
                .attr("stroke-width", 1)
                .attr("stroke-opacity", 0.2);

            // Add axis
            componentGroup.append("g")
                .attr("transform", `translate(0, ${componentHeight})`)
                .call(d3.axisBottom(xScale));

            componentGroup.append("g")
                .call(d3.axisLeft(yScale));

            // Add line
            const line = d3.line()
                .x(d => xScale(d.index))
                .y(d => yScale(d.value))
                .curve(d3.curveMonotoneX);

            componentGroup.append("path")
                .datum(componentData)
                .attr("fill", "none")
                .attr("stroke", colors[i])
                .attr("stroke-width", 2)
                .attr("d", line);

            // Add label
            componentGroup.append("text")
                .attr("x", 10)
                .attr("y", 15)
                .attr("font-weight", "bold")
                .attr("font-size", "14px")
                .attr("fill", colors[i])
                .text(labels[i]);
        });

        // Add overall X-axis label
        g.append("text")
            .attr("x", width / 2)
            .attr("y", height + 35)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Time");
    }

    render3DChart() {
        const svg = d3.select("#mainChart");
        svg.selectAll("*").remove();

        const container = document.getElementById("chartArea");
        const width = container.clientWidth;
        const height = container.clientHeight;

        // For now, show a placeholder for 3D view
        const g = svg.append("g")
            .attr("transform", `translate(${width/2}, ${height/2})`);

        g.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "24px")
            .attr("fill", "#6c757d")
            .text("3D Visualization");

        g.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 30)
            .attr("font-size", "14px")
            .attr("fill", "#6c757d")
            .text("Coming Soon - 3D Magnetic Field Vector Visualization");

        // Add a simple 3D-like representation
        const data = this.currentData || [];
        if (data.length > 0) {
            const sample = data.slice(0, Math.min(100, data.length));
            
            sample.forEach((d, i) => {
                const x = (i - 50) * 4;
                const y = d.b_x * 50;
                const z = d.b_y * 30; // Simulate depth
                
                g.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", Math.abs(d.b_z) * 5 + 1)
                    .attr("fill", `hsl(${(d.b_z + 1) * 180}, 70%, 50%)`)
                    .attr("opacity", 0.6);
            });
        }
    }

    renderMagnitudeChart() {
        if (!this.currentData || this.currentData.length === 0) return;

        const svg = d3.select("#mainChart");
        svg.selectAll("*").remove();

        const container = document.getElementById("chartArea");
        const margin = { top: 20, right: 80, bottom: 40, left: 60 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = container.clientHeight - margin.top - margin.bottom;

        // Process data with magnitude calculation
        const data = this.currentData.map((d, i) => ({
            ...d,
            index: i,
            timestamp: new Date(d.timestamp_pc),
            magnitude: Math.sqrt(d.b_x * d.b_x + d.b_y * d.b_y + d.b_z * d.b_z),
            horizontal: Math.sqrt(d.b_x * d.b_x + d.b_y * d.b_y),
            vertical: Math.abs(d.b_z)
        }));

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.magnitude))
            .range([height, 0]);

        // Add axes
        g.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        g.append("g")
            .call(d3.axisLeft(yScale));

        // Add clipping path
        svg.append("defs")
            .append("clipPath")
            .attr("id", "magnitudeClip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        const chartContent = g.append("g")
            .attr("clip-path", "url(#magnitudeClip)");

        // Line generator
        const line = d3.line()
            .x(d => xScale(d.index))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);

        // Render magnitude lines
        const magnitudeTypes = [
            { field: 'magnitude', color: '#e74c3c', label: 'Total Magnitude' },
            { field: 'horizontal', color: '#3498db', label: 'Horizontal' },
            { field: 'vertical', color: '#2ecc71', label: 'Vertical' }
        ];

        magnitudeTypes.forEach(type => {
            const lineData = data.map(d => ({ index: d.index, value: d[type.field] }));
            
            chartContent.append("path")
                .datum(lineData)
                .attr("fill", "none")
                .attr("stroke", type.color)
                .attr("stroke-width", 2)
                .attr("d", line);
        });

        // Add legend
        const legend = g.append("g")
            .attr("class", "magnitude-legend")
            .attr("transform", "translate(10, 10)");

        magnitudeTypes.forEach((type, i) => {
            const legendItem = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendItem.append("line")
                .attr("x1", 0)
                .attr("x2", 20)
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke", type.color)
                .attr("stroke-width", 2);

            legendItem.append("text")
                .attr("x", 25)
                .attr("y", 0)
                .attr("dy", "0.35em")
                .style("font-size", "12px")
                .style("fill", "#333")
                .text(type.label);
        });

        // Add Y-axis label
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Magnetic Field Magnitude (µT)");
    }

    onZoom(event, data, chartContent, xAxis, yAxis) {
        const transform = event.transform;
        
        // Update scales with zoom transform
        const newXScale = transform.rescaleX(this.chartScales.xScale);
        const newYScale = transform.rescaleY(this.chartScales.yScale);
        
        // Update stored scales
        this.currentTransform = transform;
        this.currentXScale = newXScale;
        this.currentYScale = newYScale;

        // Re-render content with new scales
        this.updateChartContent(data, chartContent, xAxis, yAxis, newXScale, newYScale);
        
        // Re-render annotations with new scale
        this.renderAnnotations(chartContent, newXScale, yAxis.node().getBBox().height);
    }

    updateChartContent(data, chartContent, xAxis, yAxis, xScale = null, yScale = null) {
        // Use provided scales or default ones
        const currentXScale = xScale || this.chartScales.xScale;
        const currentYScale = yScale || this.chartScales.yScale;

        // Update axes
        xAxis.call(d3.axisBottom(currentXScale)
            .tickFormat(d => {
                // Show timestamp for better context
                const dataPoint = data[Math.round(d)];
                return dataPoint ? dataPoint.timestamp.toLocaleTimeString() : d;
            }));

        yAxis.call(d3.axisLeft(currentYScale));

        // Clear existing content
        chartContent.selectAll(".data-line").remove();
        chartContent.selectAll(".data-points").remove();

        // Line generator
        const line = d3.line()
            .x(d => currentXScale(d.index))
            .y(d => currentYScale(d.value))
            .curve(d3.curveMonotoneX); // Smooth curves

        // Render magnetic field components
        const fields = ['b_x', 'b_y', 'b_z'];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
        const labels = ['B_x', 'B_y', 'B_z'];

        fields.forEach((field, i) => {
            const lineData = data.map(d => ({ index: d.index, value: d[field] }));
            
            // Add line
            chartContent.append("path")
                .datum(lineData)
                .attr("class", `data-line ${field}`)
                .attr("fill", "none")
                .attr("stroke", colors[i])
                .attr("stroke-width", 2)
                .attr("d", line);

            // Add data points for high zoom levels
            if (this.currentTransform && this.currentTransform.k > 5) {
                const visibleData = lineData.filter(d => {
                    const x = currentXScale(d.index);
                    return x >= 0 && x <= currentXScale.range()[1];
                });

                chartContent.selectAll(`.data-points.${field}`)
                    .data(visibleData)
                    .enter().append("circle")
                    .attr("class", `data-points ${field}`)
                    .attr("cx", d => currentXScale(d.index))
                    .attr("cy", d => currentYScale(d.value))
                    .attr("r", 3)
                    .attr("fill", colors[i])
                    .attr("opacity", 0.7);
            }
        });

        // Add legend
        this.updateLegend(chartContent, colors, labels);
    }

    updateLegend(chartContent, colors, labels) {
        // Remove existing legend
        chartContent.selectAll(".legend").remove();

        const legend = chartContent.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(10, 10)");

        labels.forEach((label, i) => {
            const legendItem = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendItem.append("line")
                .attr("x1", 0)
                .attr("x2", 20)
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke", colors[i])
                .attr("stroke-width", 2);

            legendItem.append("text")
                .attr("x", 25)
                .attr("y", 0)
                .attr("dy", "0.35em")
                .style("font-size", "12px")
                .style("fill", "#333")
                .text(label);
        });
    }

    addChartControls(svg, zoom, margin) {
        const controls = svg.append("g")
            .attr("class", "chart-controls")
            .attr("transform", `translate(${margin.left + 10}, ${margin.top + 10})`);

        // Reset zoom button
        const resetButton = controls.append("g")
            .attr("class", "reset-zoom-btn")
            .style("cursor", "pointer");

        resetButton.append("rect")
            .attr("width", 80)
            .attr("height", 25)
            .attr("rx", 4)
            .attr("fill", "#f8f9fa")
            .attr("stroke", "#dee2e6")
            .attr("stroke-width", 1);

        resetButton.append("text")
            .attr("x", 40)
            .attr("y", 16)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .style("fill", "#495057")
            .text("Reset Zoom");

        resetButton.on("click", () => {
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        });

        // Zoom info
        const zoomInfo = controls.append("text")
            .attr("class", "zoom-info")
            .attr("x", 90)
            .attr("y", 16)
            .style("font-size", "11px")
            .style("fill", "#6c757d")
            .text("Scroll to zoom, drag to pan");
    }

    addSelectionModeToggle(svg, g, data, zoom, width, height) {
        // Selection mode toggle button
        const toggleButton = svg.append("g")
            .attr("class", "selection-toggle")
            .attr("transform", `translate(${width - 100}, 10)`)
            .style("cursor", "pointer");

        const toggleRect = toggleButton.append("rect")
            .attr("width", 100)
            .attr("height", 25)
            .attr("rx", 4)
            .attr("fill", "#007bff")
            .attr("stroke", "#0056b3");

        const toggleText = toggleButton.append("text")
            .attr("x", 50)
            .attr("y", 16)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .style("fill", "white")
            .text("Select Mode");

        let selectionMode = false;
        let brush = null;

        toggleButton.on("click", () => {
            selectionMode = !selectionMode;
            
            if (selectionMode) {
                // Enable selection mode
                svg.on(".zoom", null); // Disable zoom
                
                // Add brush
                brush = d3.brushX()
                    .extent([[0, 0], [width, height]])
                    .on("end", (event) => {
                        if (event.selection) {
                            const [x0, x1] = event.selection;
                            const currentXScale = this.currentXScale || this.chartScales.xScale;
                            const startIndex = Math.round(currentXScale.invert(x0));
                            const endIndex = Math.round(currentXScale.invert(x1));
                            this.onDataSelection(startIndex, endIndex);
                            
                            // Clear brush after selection
                            g.select(".brush").call(brush.clear);
                        }
                    });

                g.append("g")
                    .attr("class", "brush")
                    .call(brush);

                toggleRect.attr("fill", "#28a745");
                toggleText.text("Pan Mode");
            } else {
                // Enable pan/zoom mode
                g.select(".brush").remove();
                svg.call(zoom); // Re-enable zoom
                
                toggleRect.attr("fill", "#007bff");
                toggleText.text("Select Mode");
            }
        });
    }

    async renderAnnotations(g, xScale, height) {
        if (!this.currentDataset) return;
        
        try {
            // Clear existing annotations
            g.selectAll(".annotation").remove();
            
            // Load annotations for current dataset
            const response = await fetch(`http://localhost:8000/api/annotations/?dataset=${this.currentDataset.id}`);
            if (!response.ok) return;
            
            const annotations = await response.json();
            
            // Store annotations for reference
            this.currentAnnotations = annotations;
            
            // Render each annotation as a colored rectangle
            annotations.forEach(annotation => {
                const startX = xScale(annotation.start_index);
                const endX = xScale(annotation.end_index);
                const width = Math.max(endX - startX, 2); // Minimum width of 2px
                
                // Skip if annotation is outside visible area (performance optimization)
                if (endX < 0 || startX > xScale.range()[1]) return;
                
                // Create annotation rectangle
                const annotationGroup = g.append("g")
                    .attr("class", "annotation")
                    .attr("data-annotation-id", annotation.id);
                    
                // Background rectangle with better visual styling
                annotationGroup.append("rect")
                    .attr("x", startX)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", annotation.category.color || '#007BFF')
                    .attr("opacity", 0.15)
                    .attr("stroke", annotation.category.color || '#007BFF')
                    .attr("stroke-width", 1.5)
                    .attr("stroke-dasharray", "4,2");
                
                // Add hover effects
                annotationGroup
                    .style("cursor", "pointer")
                    .on("mouseenter", function() {
                        d3.select(this).select("rect")
                            .attr("opacity", 0.3)
                            .attr("stroke-width", 2);
                    })
                    .on("mouseleave", function() {
                        d3.select(this).select("rect")
                            .attr("opacity", 0.15)
                            .attr("stroke-width", 1.5);
                    })
                    .on("click", (event) => {
                        event.stopPropagation(); // Prevent triggering zoom
                        this.editAnnotation(annotation);
                    });
                
                // Add label text only if annotation is wide enough
                if (width > 40) {
                    annotationGroup.append("text")
                        .attr("x", startX + width / 2)
                        .attr("y", -8)
                        .attr("text-anchor", "middle")
                        .attr("font-size", "11px")
                        .attr("font-weight", "bold")
                        .attr("fill", annotation.category.color || '#007BFF')
                        .style("pointer-events", "none") // Prevent text from blocking clicks
                        .text(annotation.category.name);
                }
                
                // Add tooltip for small annotations
                if (width <= 40) {
                    annotationGroup.append("title")
                        .text(`${annotation.category.name} (${annotation.start_index}-${annotation.end_index})`);
                }
            });
            
        } catch (error) {
            console.error('Failed to load annotations:', error);
        }
    }

    onDataSelection(startIndex, endIndex) {
        console.log(`Selected data from ${startIndex} to ${endIndex}`);
        
        if (!this.currentDataset) {
            alert('Please select a dataset first');
            return;
        }
        
        // Store selection for annotation creation
        this.selectedRange = { startIndex, endIndex };
        
        // Show annotation creation modal
        this.showAnnotationModal();
    }

    // Model Configuration
    createNewModel() {
        // Reset model configuration form
        document.getElementById('modelName').value = '';
        document.getElementById('modelDescription').value = '';
        document.getElementById('modelType').value = 'classification';
        
        // Switch to model config panel
        this.switchContentPanel('modelConfig');
        
        this.currentModel = null;
    }

    onModelTypeChange(modelType) {
        // Update hyperparameters based on model type
        this.updateHyperparametersForType(modelType);
        
        // Update script template
        document.getElementById('templateSelect').value = modelType;
    }

    updateHyperparametersForType(modelType) {
        const customContainer = document.getElementById('customHyperparameters');
        customContainer.innerHTML = '';

        const typeSpecificParams = {
            'classification': [
                { name: 'hidden_units', label: 'Hidden Units', value: '[128, 64, 32]', type: 'text' },
                { name: 'dropout_rate', label: 'Dropout Rate', value: '0.2', type: 'number', step: '0.1', min: '0', max: '0.9' }
            ],
            'autoencoder': [
                { name: 'encoding_dim', label: 'Encoding Dimension', value: '32', type: 'number', min: '8', max: '256' }
            ],
            'sequence_prediction': [
                { name: 'lstm_units', label: 'LSTM Units', value: '[64, 32]', type: 'text' },
                { name: 'sequence_length', label: 'Sequence Length', value: '50', type: 'number', min: '10', max: '200' }
            ],
            'transformer': [
                { name: 'embed_dim', label: 'Embedding Dimension', value: '64', type: 'number', min: '32', max: '512' },
                { name: 'num_heads', label: 'Attention Heads', value: '4', type: 'number', min: '1', max: '16' },
                { name: 'ff_dim', label: 'Feed Forward Dimension', value: '128', type: 'number', min: '64', max: '1024' },
                { name: 'num_layers', label: 'Number of Layers', value: '2', type: 'number', min: '1', max: '12' }
            ]
        };

        const params = typeSpecificParams[modelType] || [];
        params.forEach(param => {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `
                <label for="param_${param.name}">${param.label}</label>
                <input type="${param.type}" id="param_${param.name}" class="form-control" 
                       value="${param.value}" ${param.step ? `step="${param.step}"` : ''} 
                       ${param.min ? `min="${param.min}"` : ''} ${param.max ? `max="${param.max}"` : ''}>
            `;
            customContainer.appendChild(div);
        });
    }

    addCustomHyperparameter() {
        const container = document.getElementById('customHyperparameters');
        const div = document.createElement('div');
        div.className = 'form-group d-flex gap-1';
        div.innerHTML = `
            <input type="text" class="form-control" placeholder="Parameter name" style="flex: 1;">
            <input type="text" class="form-control" placeholder="Value" style="flex: 1;">
            <button class="btn btn-danger btn-small" onclick="this.parentElement.remove()">Remove</button>
        `;
        container.appendChild(div);
    }

    async saveModelConfiguration() {
        if (!this.currentProject) {
            alert('Please select a project first');
            return;
        }

        const config = this.collectModelConfiguration();
        
        try {
            const url = this.currentModel 
                ? `http://localhost:8000/api/user-models/${this.currentModel.id}/`
                : 'http://localhost:8000/api/user-models/';
            
            const method = this.currentModel ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...config, project: this.currentProject.id })
            });

            if (response.ok) {
                this.currentModel = await response.json();
                this.loadModels();
                alert('Model configuration saved');
            }
        } catch (error) {
            console.error('Failed to save model configuration:', error);
        }
    }

    collectModelConfiguration() {
        const hyperparameters = {
            learning_rate: parseFloat(document.getElementById('learningRate').value),
            batch_size: parseInt(document.getElementById('batchSize').value),
            epochs: parseInt(document.getElementById('epochs').value),
            validation_split: parseFloat(document.getElementById('validationSplit').value),
            patience: parseInt(document.getElementById('patience').value)
        };

        // Add custom hyperparameters
        document.querySelectorAll('#customHyperparameters .form-group').forEach(group => {
            const inputs = group.querySelectorAll('input');
            if (inputs.length >= 2 && inputs[0].value && inputs[1].value) {
                hyperparameters[inputs[0].value] = inputs[1].value;
            }
        });

        return {
            name: document.getElementById('modelName').value,
            description: document.getElementById('modelDescription').value,
            model_type: document.getElementById('modelType').value,
            hyperparameters,
            input_shape: JSON.parse(document.getElementById('inputShape').value || '[100, 15]'),
            output_shape: JSON.parse(document.getElementById('outputShape').value || '[5]'),
            training_config: {
                monitor_metric: document.getElementById('monitorMetric').value,
                patience: parseInt(document.getElementById('patience').value)
            }
        };
    }

    generateScriptTemplate() {
        const modelType = document.getElementById('modelType').value;
        this.loadScriptTemplate(modelType);
        this.switchContentPanel('scriptEditor');
    }

    // Script Editor
    async loadScriptTemplate(modelType = null) {
        const type = modelType || document.getElementById('templateSelect').value;
        
        try {
            const response = await fetch(`http://localhost:8000/api/script-templates/${type}/`);
            const template = await response.json();
            this.scriptEditor.setValue(template.content, -1);
        } catch (error) {
            console.error('Failed to load script template:', error);
            // Fallback to built-in templates
            this.loadBuiltinTemplate(type);
        }
    }

    loadBuiltinTemplate(type) {
        // Comprehensive built-in templates for magnetic field analysis
        const templates = {
            'classification': `# Magnetic Field Classification Model
import tensorflow as tf
import numpy as np

def preprocess_data(data, labels, hyperparameters):
    """Preprocess magnetic field data for classification"""
    # Extract magnetic field components
    b_x = np.array([d['b_x'] for d in data])
    b_y = np.array([d['b_y'] for d in data])
    b_z = np.array([d['b_z'] for d in data])
    
    # Calculate derived features
    magnitude = np.sqrt(b_x**2 + b_y**2 + b_z**2)
    horizontal = np.sqrt(b_x**2 + b_y**2)
    inclination = np.arctan2(b_z, horizontal)
    
    # Create feature matrix
    features = np.column_stack([
        b_x, b_y, b_z, magnitude, horizontal, inclination
    ])
    
    # Normalize features
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    features_normalized = scaler.fit_transform(features)
    
    return features_normalized, np.array(labels), {'scaler': scaler}

def create_model(input_shape, output_shape, hyperparameters):
    """Create classification model for magnetic field data"""
    hidden_units = hyperparameters.get('hidden_units', [128, 64, 32])
    dropout_rate = hyperparameters.get('dropout_rate', 0.2)
    
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(hidden_units[0], activation='relu', input_shape=input_shape),
        tf.keras.layers.Dropout(dropout_rate),
        tf.keras.layers.Dense(hidden_units[1], activation='relu'),
        tf.keras.layers.Dropout(dropout_rate),
        tf.keras.layers.Dense(hidden_units[2], activation='relu'),
        tf.keras.layers.Dense(output_shape[0], activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train_model(model, train_data, train_labels, val_data, val_labels, training_config):
    """Train the magnetic field classification model"""
    epochs = training_config.get('epochs', 50)
    batch_size = training_config.get('batch_size', 32)
    
    history = model.fit(
        train_data, train_labels,
        validation_data=(val_data, val_labels),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1
    )
    
    return history`,

            'autoencoder': `# Magnetic Field Anomaly Detection (Autoencoder)
import tensorflow as tf
import numpy as np

def preprocess_data(data, labels, hyperparameters):
    """Preprocess magnetic field data for anomaly detection"""
    # Extract magnetic field components
    b_x = np.array([d['b_x'] for d in data])
    b_y = np.array([d['b_y'] for d in data])
    b_z = np.array([d['b_z'] for d in data])
    
    # Create sequences for time series analysis
    sequence_length = hyperparameters.get('sequence_length', 10)
    features = np.column_stack([b_x, b_y, b_z])
    
    # Create sequences
    sequences = []
    for i in range(len(features) - sequence_length + 1):
        sequences.append(features[i:i + sequence_length])
    
    sequences = np.array(sequences)
    
    # Normalize
    from sklearn.preprocessing import MinMaxScaler
    scaler = MinMaxScaler()
    sequences_reshaped = sequences.reshape(-1, sequences.shape[-1])
    sequences_normalized = scaler.fit_transform(sequences_reshaped)
    sequences_normalized = sequences_normalized.reshape(sequences.shape)
    
    return sequences_normalized, sequences_normalized, {'scaler': scaler}

def create_model(input_shape, output_shape, hyperparameters):
    """Create autoencoder model for magnetic field anomaly detection"""
    encoding_dim = hyperparameters.get('encoding_dim', 32)
    
    # Encoder
    encoder = tf.keras.Sequential([
        tf.keras.layers.LSTM(64, return_sequences=True, input_shape=input_shape),
        tf.keras.layers.LSTM(32, return_sequences=False),
        tf.keras.layers.Dense(encoding_dim, activation='relu')
    ])
    
    # Decoder
    decoder = tf.keras.Sequential([
        tf.keras.layers.RepeatVector(input_shape[0]),
        tf.keras.layers.LSTM(32, return_sequences=True),
        tf.keras.layers.LSTM(64, return_sequences=True),
        tf.keras.layers.TimeDistributed(tf.keras.layers.Dense(input_shape[1]))
    ])
    
    # Autoencoder
    autoencoder = tf.keras.Sequential([encoder, decoder])
    
    autoencoder.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae']
    )
    
    return autoencoder

def train_model(model, train_data, train_labels, val_data, val_labels, training_config):
    """Train the autoencoder for anomaly detection"""
    epochs = training_config.get('epochs', 100)
    batch_size = training_config.get('batch_size', 32)
    
    history = model.fit(
        train_data, train_data,  # Autoencoder trains on itself
        validation_data=(val_data, val_data),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1
    )
    
    return history`,

            'sequence_prediction': `# LSTM Sequence Prediction for Magnetic Fields
import tensorflow as tf
import numpy as np

def preprocess_data(data, labels, hyperparameters):
    """Preprocess magnetic field data for sequence prediction"""
    # Extract magnetic field components
    b_x = np.array([d['b_x'] for d in data])
    b_y = np.array([d['b_y'] for d in data])
    b_z = np.array([d['b_z'] for d in data])
    
    # Create time series sequences
    sequence_length = hyperparameters.get('sequence_length', 20)
    prediction_steps = hyperparameters.get('prediction_steps', 1)
    
    features = np.column_stack([b_x, b_y, b_z])
    
    X, y = [], []
    for i in range(len(features) - sequence_length - prediction_steps + 1):
        X.append(features[i:i + sequence_length])
        y.append(features[i + sequence_length:i + sequence_length + prediction_steps])
    
    return np.array(X), np.array(y), {}

def create_model(input_shape, output_shape, hyperparameters):
    """Create LSTM model for magnetic field sequence prediction"""
    lstm_units = hyperparameters.get('lstm_units', [64, 32])
    dropout_rate = hyperparameters.get('dropout_rate', 0.2)
    
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(lstm_units[0], return_sequences=True, input_shape=input_shape),
        tf.keras.layers.Dropout(dropout_rate),
        tf.keras.layers.LSTM(lstm_units[1], return_sequences=False),
        tf.keras.layers.Dropout(dropout_rate),
        tf.keras.layers.Dense(output_shape[0] * output_shape[1]),
        tf.keras.layers.Reshape(output_shape)
    ])
    
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae']
    )
    
    return model

def train_model(model, train_data, train_labels, val_data, val_labels, training_config):
    """Train the sequence prediction model"""
    epochs = training_config.get('epochs', 100)
    batch_size = training_config.get('batch_size', 32)
    
    history = model.fit(
        train_data, train_labels,
        validation_data=(val_data, val_labels),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1
    )
    
    return history`,

            'transformer': `# Transformer Model for Magnetic Field Analysis
import tensorflow as tf
import numpy as np

def preprocess_data(data, labels, hyperparameters):
    """Preprocess magnetic field data for transformer model"""
    # Extract magnetic field components
    b_x = np.array([d['b_x'] for d in data])
    b_y = np.array([d['b_y'] for d in data])
    b_z = np.array([d['b_z'] for d in data])
    
    # Create sequences
    sequence_length = hyperparameters.get('sequence_length', 50)
    features = np.column_stack([b_x, b_y, b_z])
    
    sequences = []
    targets = []
    for i in range(len(features) - sequence_length):
        sequences.append(features[i:i + sequence_length])
        targets.append(labels[i + sequence_length] if labels else features[i + sequence_length])
    
    return np.array(sequences), np.array(targets), {}

def create_model(input_shape, output_shape, hyperparameters):
    """Create transformer model for magnetic field analysis"""
    embed_dim = hyperparameters.get('embed_dim', 64)
    num_heads = hyperparameters.get('num_heads', 4)
    ff_dim = hyperparameters.get('ff_dim', 128)
    
    inputs = tf.keras.Input(shape=input_shape)
    
    # Multi-head self-attention
    attention_output = tf.keras.layers.MultiHeadAttention(
        num_heads=num_heads, key_dim=embed_dim
    )(inputs, inputs)
    
    # Add & Norm
    attention_output = tf.keras.layers.LayerNormalization()(inputs + attention_output)
    
    # Feed forward
    ffn_output = tf.keras.Sequential([
        tf.keras.layers.Dense(ff_dim, activation='relu'),
        tf.keras.layers.Dense(input_shape[-1])
    ])(attention_output)
    
    # Add & Norm
    ffn_output = tf.keras.layers.LayerNormalization()(attention_output + ffn_output)
    
    # Global average pooling
    pooled = tf.keras.layers.GlobalAveragePooling1D()(ffn_output)
    
    # Classification head
    outputs = tf.keras.layers.Dense(output_shape[0], activation='softmax')(pooled)
    
    model = tf.keras.Model(inputs, outputs)
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train_model(model, train_data, train_labels, val_data, val_labels, training_config):
    """Train the transformer model"""
    epochs = training_config.get('epochs', 50)
    batch_size = training_config.get('batch_size', 16)
    
    history = model.fit(
        train_data, train_labels,
        validation_data=(val_data, val_labels),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1
    )
    
    return history`,

            'custom_tensorflow': `# Custom TensorFlow Model Template
import tensorflow as tf
import numpy as np

def preprocess_data(data, labels, hyperparameters):
    """Custom preprocessing for magnetic field data"""
    # Extract features from your magnetic field data
    features = []
    for point in data:
        # Add your custom feature extraction here
        feature_vector = [
            point['b_x'],
            point['b_y'],
            point['b_z'],
            # Add more features as needed
        ]
        features.append(feature_vector)
    
    return np.array(features), np.array(labels) if labels else None, {}

def create_model(input_shape, output_shape, hyperparameters):
    """Create your custom TensorFlow model"""
    # Build your custom model architecture here
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=input_shape),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(output_shape[0], activation='softmax')
    ])
    
    # Compile with your preferred settings
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train_model(model, train_data, train_labels, val_data, val_labels, training_config):
    """Train your custom model"""
    epochs = training_config.get('epochs', 50)
    batch_size = training_config.get('batch_size', 32)
    
    # Implement your custom training logic
    history = model.fit(
        train_data, train_labels,
        validation_data=(val_data, val_labels) if val_data is not None else None,
        epochs=epochs,
        batch_size=batch_size,
        verbose=1
    )
    
    return history

# Add any additional helper functions here`
        };

        const template = templates[type] || templates['classification'];
        this.scriptEditor.setValue(template, -1);
        
        // Show success notification with template info
        const templateInfo = {
            'classification': 'Classification model with feature engineering for magnetic field data',
            'autoencoder': 'LSTM-based autoencoder for magnetic field anomaly detection',
            'sequence_prediction': 'LSTM model for time series prediction of magnetic fields',
            'transformer': 'Transformer model with multi-head attention for advanced analysis',
            'custom_tensorflow': 'Customizable template for building your own TensorFlow models'
        };
        
        NotificationManager.showSuccess(
            `${type.charAt(0).toUpperCase() + type.slice(1)} template loaded successfully`,
            3000
        );
        
        NotificationManager.showInfo(
            templateInfo[type] || 'Template loaded with basic structure',
            4000
        );
    }

    async validateScript() {
        const scriptContent = this.scriptEditor.getValue();
        
        try {
            const response = await fetch('http://localhost:8000/api/validate-script/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script_content: scriptContent })
            });

            const result = await response.json();
            
            if (result.valid) {
                alert('Script validation passed ✓');
            } else {
                alert(`Script validation failed:\n${result.message}`);
            }
        } catch (error) {
            console.error('Failed to validate script:', error);
        }
    }

    async saveScript() {
        if (!this.currentModel) {
            alert('Please save model configuration first');
            return;
        }

        const scriptContent = this.scriptEditor.getValue();

        try {
            const response = await fetch(`http://localhost:8000/api/user-models/${this.currentModel.id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...this.currentModel,
                    python_script: scriptContent 
                })
            });

            if (response.ok) {
                this.currentModel = await response.json();
                alert('Script saved successfully');
            }
        } catch (error) {
            console.error('Failed to save script:', error);
        }
    }

    loadScriptFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.scriptEditor.setValue(e.target.result, -1);
        };
        reader.readAsText(file);
    }

    // Training
    async startTraining() {
        if (!this.currentModel) {
            NotificationManager.showWarning('Please select a model first');
            return;
        }

        if (!this.currentDataset) {
            NotificationManager.showWarning('Please select a dataset first');
            return;
        }

        // Validate model configuration
        const config = this.collectModelConfiguration();
        if (!config || !config.training_config) {
            NotificationManager.showError('Invalid model configuration. Please check your settings.');
            return;
        }

        const loadingNotification = NotificationManager.showLoading('Starting training session...');

        try {
            const response = await fetch('http://localhost:8000/api/training-sessions/start_training/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model_id: this.currentModel.id,
                    dataset_id: this.currentDataset.id,
                    training_config: config.training_config
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Training failed to start: HTTP ${response.status}`);
            }

            const session = await response.json();
            this.activeTrainingSession = session.session_id;
            
            NotificationManager.hideLoading();
            NotificationManager.showSuccess('Training session started successfully');
            
            this.showTrainingPanel();
            this.startTrainingMonitoring();
            
        } catch (error) {
            NotificationManager.hideLoading();
            NotificationManager.showError('Failed to start training', error, () => this.startTraining());
        }
    }

    showTrainingPanel() {
        this.switchContentPanel('training');
        document.getElementById('activeTraining').classList.remove('d-none');
        document.getElementById('startTrainingBtn').classList.add('d-none');
        document.getElementById('stopTrainingBtn').classList.remove('d-none');
    }

    startTrainingMonitoring() {
        let consecutiveErrors = 0;
        const maxErrors = 3;
        
        const pollInterval = setInterval(async () => {
            if (!this.activeTrainingSession) {
                clearInterval(pollInterval);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8000/api/training-sessions/${this.activeTrainingSession}/progress/`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const status = await response.json();
                
                // Reset error counter on successful request
                consecutiveErrors = 0;
                
                this.updateTrainingUI(status);
                
                if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
                    clearInterval(pollInterval);
                    this.onTrainingComplete(status);
                }
            } catch (error) {
                consecutiveErrors++;
                console.error(`Training monitoring error (${consecutiveErrors}/${maxErrors}):`, error);
                
                if (consecutiveErrors >= maxErrors) {
                    clearInterval(pollInterval);
                    NotificationManager.showError(
                        'Lost connection to training session', 
                        error,
                        () => this.startTrainingMonitoring()
                    );
                } else if (consecutiveErrors === 1) {
                    // Show warning on first error, but continue monitoring
                    NotificationManager.showWarning('Connection issue with training monitoring. Retrying...');
                }
            }
        }, 1000);
        
        // Store interval reference to allow manual clearing
        this.trainingMonitoringInterval = pollInterval;
    }

    updateTrainingUI(status) {
        document.getElementById('trainingStatus').textContent = status.recent_logs?.slice(-1)[0]?.message || 'Training...';
        document.getElementById('trainingProgress').textContent = `${status.progress.toFixed(1)}%`;
        document.getElementById('progressFill').style.width = `${status.progress}%`;
        document.getElementById('currentEpoch').textContent = status.current_epoch;
        document.getElementById('totalEpochs').textContent = status.total_epochs;

        // Update live metrics
        const metricsDiv = document.getElementById('liveMetrics');
        if (status.live_metrics) {
            metricsDiv.innerHTML = Object.entries(status.live_metrics)
                .map(([key, value]) => `<strong>${key}:</strong> ${typeof value === 'number' ? value.toFixed(4) : value}`)
                .join(' | ');
        }

        // Update logs
        const logsDiv = document.getElementById('trainingLogs');
        if (status.recent_logs) {
            logsDiv.innerHTML = status.recent_logs
                .map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`)
                .join('\n');
            logsDiv.scrollTop = logsDiv.scrollHeight;
        }
    }

    onTrainingComplete(status) {
        this.activeTrainingSession = null;
        
        // Clear monitoring interval if it exists
        if (this.trainingMonitoringInterval) {
            clearInterval(this.trainingMonitoringInterval);
            this.trainingMonitoringInterval = null;
        }
        
        // Update UI
        document.getElementById('startTrainingBtn').classList.remove('d-none');
        document.getElementById('stopTrainingBtn').classList.add('d-none');
        
        // Show appropriate notification based on status
        if (status.status === 'completed') {
            const actions = [
                { 
                    label: 'View Results', 
                    callback: () => this.switchContentPanel('training') 
                }
            ];
            
            // Add Generate Predictions button if method exists
            if (typeof this.generatePredictions === 'function') {
                actions.push({
                    label: 'Generate Predictions', 
                    callback: () => this.generatePredictions() 
                });
            }
            
            NotificationManager.showSuccess(
                `Training completed successfully! Final accuracy: ${status.metrics?.accuracy ? (status.metrics.accuracy * 100).toFixed(1) + '%' : 'N/A'}`,
                8000,
                actions
            );
            
            this.loadModels(); // Refresh model list
        } else if (status.status === 'failed') {
            NotificationManager.showError(
                `Training failed: ${status.error_message || status.message || 'Unknown error'}`,
                null,
                () => this.startTraining()
            );
        } else if (status.status === 'cancelled') {
            NotificationManager.showWarning('Training was cancelled');
        } else {
            NotificationManager.showInfo(`Training ${status.status}`);
        }
    }

    async stopTraining() {
        if (!this.activeTrainingSession) return;

        try {
            const response = await fetch(`http://localhost:8000/api/training-sessions/${this.activeTrainingSession}/stop_training/`, {
                method: 'POST'
            });

            if (response.ok) {
                this.activeTrainingSession = null;
                document.getElementById('startTrainingBtn').classList.remove('d-none');
                document.getElementById('stopTrainingBtn').classList.add('d-none');
            }
        } catch (error) {
            console.error('Failed to stop training:', error);
        }
    }

    // UI Management
    switchSidebarTab(tabName) {
        document.querySelectorAll('.sidebar-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.sidebar-panel').forEach(panel => panel.classList.add('d-none'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.remove('d-none');
    }

    switchContentPanel(panelName) {
        document.querySelectorAll('.content-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.content-panel').forEach(panel => panel.classList.remove('active'));
        
        document.querySelector(`[data-panel="${panelName}"]`).classList.add('active');
        document.getElementById(`${panelName}Panel`).classList.add('active');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Additional methods for loading models, annotations, etc.
    async loadModels() {
        if (!this.currentProject) return;

        try {
            const response = await fetch(`http://localhost:8000/api/user-models/?project=${this.currentProject.id}`);
            const models = await response.json();
            
            const container = document.getElementById('modelsList');
            container.innerHTML = '';

            models.forEach(model => {
                const div = document.createElement('div');
                div.className = 'model-item';
                div.innerHTML = `
                    <h5>${model.name}</h5>
                    <p class="text-muted">${model.model_type} | ${model.is_trained ? 'Trained' : 'Not trained'}</p>
                `;
                div.addEventListener('click', () => this.selectModel(model));
                container.appendChild(div);
            });
        } catch (error) {
            console.error('Failed to load models:', error);
        }
    }

    selectModel(model) {
        this.currentModel = model;
        // Load model configuration into the UI
        this.loadModelConfiguration(model);
    }

    loadModelConfiguration(model) {
        document.getElementById('modelName').value = model.name;
        document.getElementById('modelDescription').value = model.description || '';
        document.getElementById('modelType').value = model.model_type;
        
        // Load hyperparameters
        if (model.hyperparameters) {
            Object.entries(model.hyperparameters).forEach(([key, value]) => {
                const element = document.getElementById(key) || document.getElementById(`param_${key}`);
                if (element) {
                    element.value = value;
                }
            });
        }

        // Load script if available
        if (model.script_content) {
            this.scriptEditor.setValue(model.script_content, -1);
        }
    }

    async loadLabelCategories() {
        if (!this.currentProject) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/label-categories/?project=${this.currentProject.id}`);
            const categories = await response.json();
            
            const container = document.getElementById('categoryTree');
            container.innerHTML = '';
            
            this.renderCategoryTree(categories, container);
        } catch (error) {
            console.error('Failed to load label categories:', error);
        }
    }
    
    renderCategoryTree(categories, container, level = 0) {
        categories.forEach(category => {
            const div = document.createElement('div');
            div.className = 'category-item';
            div.style.marginLeft = `${level * 20}px`;
            div.innerHTML = `
                <div class="category-color" style="background-color: ${category.color || '#007bff'}"></div>
                <span>${category.name}</span>
            `;
            container.appendChild(div);
            
            if (category.children && category.children.length > 0) {
                this.renderCategoryTree(category.children, container, level + 1);
            }
        });
    }

    async loadAnnotations() {
        if (!this.currentDataset) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/annotations/?dataset=${this.currentDataset.id}`);
            const annotations = await response.json();
            
            const container = document.getElementById('annotationsList');
            container.innerHTML = '';
            
            annotations.forEach(annotation => {
                const div = document.createElement('div');
                div.className = 'annotation-item';
                div.innerHTML = `
                    <strong>${annotation.category_name}</strong><br>
                    <small>Indices: ${annotation.start_index} - ${annotation.end_index}</small><br>
                    <small>Confidence: ${(annotation.confidence * 100).toFixed(1)}%</small>
                `;
                container.appendChild(div);
            });
        } catch (error) {
            console.error('Failed to load annotations:', error);
        }
    }
    
    // Prediction Workflow Methods
    async generatePredictions() {
        if (!this.currentModel || !this.currentDataset) {
            alert('Please select both a trained model and dataset');
            return;
        }
        
        if (!this.currentModel.is_trained) {
            alert('Model must be trained before generating predictions');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:8000/api/user-models/${this.currentModel.id}/generate_predictions/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataset_id: this.currentDataset.id })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.loadPredictions(result.prediction_id);
                alert('Predictions generated successfully!');
            }
        } catch (error) {
            console.error('Failed to generate predictions:', error);
        }
    }
    
    async loadPredictions(predictionId = null) {
        if (!this.currentDataset) return;
        
        try {
            const url = predictionId 
                ? `http://localhost:8000/api/predictions/${predictionId}/`
                : `http://localhost:8000/api/predictions/?dataset=${this.currentDataset.id}`;
                
            const response = await fetch(url);
            const predictions = await response.json();
            
            if (Array.isArray(predictions)) {
                this.currentPredictions = predictions;
            } else {
                this.currentPredictions = [predictions];
            }
            
            this.renderPredictionOverlay();
            this.loadPredictionReviewPanel();
        } catch (error) {
            console.error('Failed to load predictions:', error);
        }
    }
    
    renderPredictionOverlay() {
        if (!this.currentPredictions || this.currentPredictions.length === 0) return;
        
        // Add prediction overlay to the chart
        const svg = d3.select("#mainChart");
        const container = document.getElementById("chartArea");
        const margin = { top: 20, right: 80, bottom: 40, left: 60 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = container.clientHeight - margin.top - margin.bottom;
        
        // Remove existing prediction overlay
        svg.selectAll('.prediction-overlay').remove();
        svg.selectAll('.prediction-confidence-legend').remove();
        
        const g = svg.select('g');
        
        // Create prediction overlay group
        const predictionGroup = g.append('g').attr('class', 'prediction-overlay-group');
        
        this.currentPredictions.forEach(predictionSet => {
            predictionSet.predictions.forEach((prediction, index) => {
                if (prediction > 0) {  // Only show non-zero predictions
                    const xScale = d3.scaleLinear()
                        .domain([0, predictionSet.predictions.length - 1])
                        .range([0, width]);
                    
                    const confidence = predictionSet.confidence_scores[index] || 0.5;
                    const color = this.getPredictionColor(prediction, confidence);
                    const opacity = this.getConfidenceOpacity(confidence);
                    const strokeWidth = this.getConfidenceStrokeWidth(confidence);
                    const rectWidth = this.getConfidenceWidth(confidence);
                    
                    // Create prediction group for this data point
                    const predOverlay = predictionGroup.append('g')
                        .attr('class', 'prediction-overlay')
                        .attr('data-prediction', prediction)
                        .attr('data-confidence', confidence);
                    
                    // Main prediction rectangle
                    const rect = predOverlay.append('rect')
                        .attr('x', xScale(index) - rectWidth/2)
                        .attr('y', 0)
                        .attr('width', rectWidth)
                        .attr('height', height)
                        .attr('fill', color)
                        .attr('opacity', opacity)
                        .attr('stroke', color)
                        .attr('stroke-width', strokeWidth)
                        .attr('stroke-dasharray', confidence < 0.6 ? '3,2' : 'none');
                    
                    // Add confidence indicator at top
                    const confidenceBarHeight = 6;
                    predOverlay.append('rect')
                        .attr('x', xScale(index) - 10)
                        .attr('y', -confidenceBarHeight - 5)
                        .attr('width', 20 * confidence) // Width proportional to confidence
                        .attr('height', confidenceBarHeight)
                        .attr('fill', this.getConfidenceColor(confidence))
                        .attr('opacity', 0.8);
                    
                    // Background for confidence bar
                    predOverlay.append('rect')
                        .attr('x', xScale(index) - 10)
                        .attr('y', -confidenceBarHeight - 5)
                        .attr('width', 20)
                        .attr('height', confidenceBarHeight)
                        .attr('fill', '#e9ecef')
                        .attr('opacity', 0.4);
                    
                    // Add confidence percentage text for high confidence
                    if (confidence >= 0.7) {
                        predOverlay.append('text')
                            .attr('x', xScale(index))
                            .attr('y', height + 15)
                            .attr('text-anchor', 'middle')
                            .attr('font-size', '9px')
                            .attr('font-weight', 'bold')
                            .attr('fill', color)
                            .text(`${(confidence * 100).toFixed(0)}%`);
                    }
                    
                    // Enhanced tooltip
                    predOverlay.append('title')
                        .text(this.getPredictionTooltip(prediction, confidence, index));
                    
                    // Add hover effects
                    predOverlay
                        .style('cursor', 'pointer')
                        .on('mouseenter', function() {
                            d3.select(this).select('rect')
                                .attr('opacity', Math.min(1.0, opacity + 0.3))
                                .attr('stroke-width', strokeWidth + 1);
                        })
                        .on('mouseleave', function() {
                            d3.select(this).select('rect')
                                .attr('opacity', opacity)
                                .attr('stroke-width', strokeWidth);
                        })
                        .on('click', (event) => {
                            event.stopPropagation();
                            this.showPredictionDetails(prediction, confidence, index);
                        });
                }
            });
        });
        
        // Add confidence legend
        this.addPredictionConfidenceLegend(g);
    }
    
    getPredictionColor(prediction, confidence) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];
        let baseColor = colors[prediction % colors.length];
        
        // Adjust color saturation based on confidence
        if (confidence < 0.5) {
            // Low confidence - make more gray
            baseColor = d3.interpolate(baseColor, '#95a5a6')(0.5);
        } else if (confidence < 0.7) {
            // Medium confidence - slightly less saturated
            baseColor = d3.interpolate(baseColor, '#95a5a6')(0.3);
        }
        
        return baseColor;
    }

    getConfidenceOpacity(confidence) {
        // Map confidence to opacity: 0.2 to 0.8
        return Math.max(0.2, Math.min(0.8, 0.2 + (confidence * 0.6)));
    }

    getConfidenceStrokeWidth(confidence) {
        // Thicker stroke for higher confidence
        return confidence >= 0.8 ? 3 : (confidence >= 0.6 ? 2 : 1);
    }

    getConfidenceWidth(confidence) {
        // Wider rectangles for higher confidence
        return confidence >= 0.8 ? 8 : (confidence >= 0.6 ? 6 : 4);
    }

    getConfidenceColor(confidence) {
        // Color gradient from red (low) to green (high)
        if (confidence >= 0.8) return '#28a745';
        if (confidence >= 0.6) return '#ffc107';
        return '#dc3545';
    }

    getPredictionTooltip(prediction, confidence, index) {
        const confidenceLevel = confidence >= 0.8 ? 'High' : 
                              confidence >= 0.6 ? 'Medium' : 'Low';
        
        return `Prediction: ${prediction}
Confidence: ${(confidence * 100).toFixed(1)}% (${confidenceLevel})
Data Point: ${index}
Click for detailed analysis`;
    }

    showPredictionDetails(prediction, confidence, index) {
        // Create detailed prediction modal
        NotificationManager.showInfo(
            `Prediction ${prediction} at point ${index} with ${(confidence * 100).toFixed(1)}% confidence`,
            5000
        );
    }

    addPredictionConfidenceLegend(container) {
        const legend = container.append('g')
            .attr('class', 'prediction-confidence-legend')
            .attr('transform', 'translate(10, 50)');

        // Legend background
        legend.append('rect')
            .attr('x', -5)
            .attr('y', -15)
            .attr('width', 150)
            .attr('height', 80)
            .attr('fill', 'white')
            .attr('stroke', '#dee2e6')
            .attr('stroke-width', 1)
            .attr('rx', 4)
            .attr('opacity', 0.9);

        // Legend title
        legend.append('text')
            .attr('x', 0)
            .attr('y', -5)
            .style('font-size', '11px')
            .style('font-weight', 'bold')
            .style('fill', '#333')
            .text('Prediction Confidence');

        const legendData = [
            { confidence: 0.9, label: 'High (>80%)', width: 8 },
            { confidence: 0.7, label: 'Medium (60-80%)', width: 6 },
            { confidence: 0.4, label: 'Low (<60%)', width: 4 }
        ];

        legendData.forEach((item, i) => {
            const legendItem = legend.append('g')
                .attr('transform', `translate(0, ${i * 18 + 10})`);

            // Sample rectangle
            legendItem.append('rect')
                .attr('width', item.width)
                .attr('height', 12)
                .attr('fill', this.getPredictionColor(1, item.confidence))
                .attr('opacity', this.getConfidenceOpacity(item.confidence))
                .attr('stroke', this.getPredictionColor(1, item.confidence))
                .attr('stroke-width', this.getConfidenceStrokeWidth(item.confidence))
                .attr('stroke-dasharray', item.confidence < 0.6 ? '2,1' : 'none');

            // Confidence bar
            legendItem.append('rect')
                .attr('x', 12)
                .attr('y', 8)
                .attr('width', 20 * item.confidence)
                .attr('height', 4)
                .attr('fill', this.getConfidenceColor(item.confidence));

            // Background for confidence bar
            legendItem.append('rect')
                .attr('x', 12)
                .attr('y', 8)
                .attr('width', 20)
                .attr('height', 4)
                .attr('fill', '#e9ecef')
                .attr('opacity', 0.5);

            // Label
            legendItem.append('text')
                .attr('x', 36)
                .attr('y', 8)
                .style('font-size', '10px')
                .style('fill', '#666')
                .text(item.label);
        });
    }
    
    loadPredictionReviewPanel() {
        if (!this.currentPredictions || this.currentPredictions.length === 0) return;
        
        // Add prediction review controls to the training panel
        const trainingPanel = document.getElementById('trainingPanel');
        let reviewSection = document.getElementById('predictionReview');
        
        if (!reviewSection) {
            reviewSection = document.createElement('div');
            reviewSection.id = 'predictionReview';
            reviewSection.className = 'training-session mt-2';
            trainingPanel.appendChild(reviewSection);
        }
        
        reviewSection.innerHTML = `
            <h4>Prediction Review</h4>
            <div class="d-flex gap-2 mb-2">
                <button id="acceptAllBtn" class="btn btn-success btn-small">Accept All</button>
                <button id="acceptSelectedBtn" class="btn btn-primary btn-small">Accept Selected</button>
                <button id="rejectSelectedBtn" class="btn btn-danger btn-small">Reject Selected</button>
                <button id="modifySelectedBtn" class="btn btn-secondary btn-small">Modify Selected</button>
            </div>
            <div id="predictionsList"></div>
        `;
        
        // Add event listeners
        document.getElementById('acceptAllBtn').addEventListener('click', () => this.acceptAllPredictions());
        document.getElementById('acceptSelectedBtn').addEventListener('click', () => this.acceptSelectedPredictions());
        document.getElementById('rejectSelectedBtn').addEventListener('click', () => this.rejectSelectedPredictions());
        document.getElementById('modifySelectedBtn').addEventListener('click', () => this.modifySelectedPredictions());
        
        this.renderPredictionsList();
    }
    
    renderPredictionsList() {
        const container = document.getElementById('predictionsList');
        if (!container || !this.currentPredictions) return;
        
        container.innerHTML = '';
        
        this.currentPredictions.forEach(predictionSet => {
            predictionSet.predictions.forEach((prediction, index) => {
                if (prediction > 0) {
                    const div = document.createElement('div');
                    div.className = 'prediction-item d-flex gap-2 mb-1';
                    div.innerHTML = `
                        <input type="checkbox" class="prediction-checkbox" data-index="${index}">
                        <span>Index ${index}: Prediction ${prediction} (${(predictionSet.confidence_scores[index] * 100).toFixed(1)}%)</span>
                        <input type="number" class="form-control prediction-modify" data-index="${index}" value="${prediction}" style="width: 80px; margin-left: auto;">
                    `;
                    container.appendChild(div);
                }
            });
        });
    }
    
    async acceptAllPredictions() {
        if (!this.currentPredictions || this.currentPredictions.length === 0) return;
        
        try {
            const predictionId = this.currentPredictions[0].id;
            const response = await fetch(`http://localhost:8000/api/predictions/${predictionId}/accept/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                this.loadAnnotations();  // Refresh annotations
            }
        } catch (error) {
            console.error('Failed to accept predictions:', error);
        }
    }
    
    async acceptSelectedPredictions() {
        const indices = this.getSelectedPredictionIndices();
        if (indices.length === 0) {
            alert('Please select predictions to accept');
            return;
        }
        
        try {
            const predictionId = this.currentPredictions[0].id;
            const response = await fetch(`http://localhost:8000/api/predictions/${predictionId}/accept/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ indices })
            });
            
            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                this.loadAnnotations();
            }
        } catch (error) {
            console.error('Failed to accept selected predictions:', error);
        }
    }
    
    async rejectSelectedPredictions() {
        const indices = this.getSelectedPredictionIndices();
        if (indices.length === 0) {
            alert('Please select predictions to reject');
            return;
        }
        
        try {
            const predictionId = this.currentPredictions[0].id;
            const response = await fetch(`http://localhost:8000/api/predictions/${predictionId}/reject/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ indices })
            });
            
            if (response.ok) {
                const result = await response.json();
                alert(result.message);
            }
        } catch (error) {
            console.error('Failed to reject selected predictions:', error);
        }
    }
    
    async modifySelectedPredictions() {
        const modifications = this.getModifiedPredictions();
        if (Object.keys(modifications).length === 0) {
            alert('Please modify prediction values');
            return;
        }
        
        try {
            const predictionId = this.currentPredictions[0].id;
            const response = await fetch(`http://localhost:8000/api/predictions/${predictionId}/modify/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modifications })
            });
            
            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                this.loadPredictions();
            }
        } catch (error) {
            console.error('Failed to modify predictions:', error);
        }
    }
    
    getSelectedPredictionIndices() {
        const checkboxes = document.querySelectorAll('.prediction-checkbox:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
    }
    
    getModifiedPredictions() {
        const modifications = {};
        const modifyInputs = document.querySelectorAll('.prediction-modify');
        
        modifyInputs.forEach(input => {
            const index = input.dataset.index;
            const originalValue = this.currentPredictions[0].predictions[index];
            const newValue = parseInt(input.value);
            
            if (newValue !== originalValue) {
                modifications[index] = newValue;
            }
        });
        
        return modifications;
    }
    
    // Chart View Management
    switchChartView(viewType) {
        // Update active tab
        document.querySelectorAll('.chart-view-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === viewType);
        });
        
        this.currentChartView = viewType;
        
        // Re-render chart with new view
        if (this.currentData && this.currentData.length > 0) {
            this.renderChart();
        }
    }
    
    onChartOptionsChange() {
        const yAxisOption = document.getElementById('chartYAxis')?.value;
        this.chartYAxisOption = yAxisOption;
        
        // Re-render chart with new options
        if (this.currentData && this.currentData.length > 0) {
            this.renderChart();
        }
    }
    
    exportChart() {
        try {
            const svg = document.getElementById('mainChart');
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Download as PNG
                const link = document.createElement('a');
                link.download = `magtrace-chart-${this.currentChartView}-${new Date().toISOString().slice(0,10)}.png`;
                link.href = canvas.toDataURL();
                link.click();
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        } catch (error) {
            NotificationManager.showError('Failed to export chart', error);
        }
    }
    
    // Annotation Management
    showAnnotationModal() {
        if (!this.selectedRange) return;
        
        // Populate the annotation modal with available categories
        this.loadLabelCategoriesForModal();
        
        // Show range info
        const rangeInfo = document.getElementById('annotationRangeInfo');
        if (rangeInfo) {
            rangeInfo.textContent = `Selected range: ${this.selectedRange.startIndex} - ${this.selectedRange.endIndex}`;
        }
        
        // Show modal
        const modal = document.getElementById('annotationModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    async loadLabelCategoriesForModal() {
        if (!this.currentProject) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/label-categories/?project=${this.currentProject.id}`);
            const categories = await response.json();
            
            const select = document.getElementById('annotationCategory');
            if (select) {
                select.innerHTML = '<option value="">Select Category...</option>';
                
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.parent ? 
                        `${category.parent.name} > ${category.name}` : category.name;
                    option.style.color = category.color;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load label categories:', error);
        }
    }
    
    async createAnnotation() {
        if (!this.selectedRange || !this.currentDataset) return;
        
        const categoryId = document.getElementById('annotationCategory')?.value;
        const confidence = parseFloat(document.getElementById('annotationConfidence')?.value || '1.0');
        const notes = document.getElementById('annotationNotes')?.value || '';
        
        if (!categoryId) {
            NotificationManager.showWarning('Please select a category');
            return;
        }

        // Validate confidence range
        if (confidence < 0 || confidence > 1) {
            NotificationManager.showWarning('Confidence must be between 0 and 1');
            return;
        }

        const loadingNotification = NotificationManager.showLoading('Creating annotation...');
        
        try {
            const response = await fetch('http://localhost:8000/api/annotations/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dataset: this.currentDataset.id,
                    category: categoryId,
                    start_index: this.selectedRange.startIndex,
                    end_index: this.selectedRange.endIndex,
                    confidence: confidence,
                    notes: notes.trim()
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const annotation = await response.json();
            
            NotificationManager.hideLoading();
            NotificationManager.showSuccess('Annotation created successfully');
            
            this.closeModals();
            
            // Clear form
            document.getElementById('annotationCategory').value = '';
            document.getElementById('annotationConfidence').value = '1.0';
            document.getElementById('annotationNotes').value = '';
            
            // Refresh displays
            this.renderChart();
            this.loadAnnotations();
            
        } catch (error) {
            NotificationManager.hideLoading();
            NotificationManager.showError('Failed to create annotation', error, () => this.createAnnotation());
        }
    }
    
    async editAnnotation(annotation) {
        // Pre-populate edit form with annotation data
        document.getElementById('editAnnotationId').value = annotation.id;
        document.getElementById('editAnnotationCategory').value = annotation.category.id;
        document.getElementById('editAnnotationConfidence').value = annotation.confidence;
        document.getElementById('editAnnotationNotes').value = annotation.notes || '';
        
        // Load categories for edit modal
        await this.loadLabelCategoriesForEditModal();
        
        // Show edit modal
        const modal = document.getElementById('editAnnotationModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    async loadLabelCategoriesForEditModal() {
        if (!this.currentProject) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/label-categories/?project=${this.currentProject.id}`);
            const categories = await response.json();
            
            const select = document.getElementById('editAnnotationCategory');
            if (select) {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.parent ? 
                        `${category.parent.name} > ${category.name}` : category.name;
                    option.style.color = category.color;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load label categories:', error);
        }
    }
    
    async updateAnnotation() {
        const annotationId = document.getElementById('editAnnotationId')?.value;
        const categoryId = document.getElementById('editAnnotationCategory')?.value;
        const confidence = parseFloat(document.getElementById('editAnnotationConfidence')?.value || '1.0');
        const notes = document.getElementById('editAnnotationNotes')?.value || '';
        
        if (!annotationId || !categoryId) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/annotations/${annotationId}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: categoryId,
                    confidence: confidence,
                    notes: notes
                })
            });
            
            if (response.ok) {
                this.closeModals();
                this.renderChart(); // Refresh chart to show updated annotation
                this.loadAnnotations(); // Refresh annotation list
            } else {
                const error = await response.json();
                alert(`Failed to update annotation: ${error.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to update annotation:', error);
            alert('Failed to update annotation');
        }
    }
    
    async deleteAnnotation(annotationId) {
        if (!confirm('Are you sure you want to delete this annotation?')) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/annotations/${annotationId}/`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.renderChart(); // Refresh chart
                this.loadAnnotations(); // Refresh annotation list
            } else {
                alert('Failed to delete annotation');
            }
        } catch (error) {
            console.error('Failed to delete annotation:', error);
            alert('Failed to delete annotation');
        }
    }
    
    async loadAnnotations() {
        if (!this.currentDataset) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/annotations/?dataset=${this.currentDataset.id}`);
            const annotations = await response.json();
            this.renderAnnotationsList(annotations);
        } catch (error) {
            console.error('Failed to load annotations:', error);
        }
    }
    
    renderAnnotationsList(annotations) {
        const container = document.getElementById('annotationsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (annotations.length === 0) {
            container.innerHTML = '<div class="text-muted">No annotations yet. Select data on the chart to create annotations.</div>';
            return;
        }
        
        annotations.forEach(annotation => {
            const item = document.createElement('div');
            item.className = 'annotation-item p-2 mb-2 border rounded';
            item.style.borderColor = annotation.category.color;
            
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong style="color: ${annotation.category.color}">${annotation.category.name}</strong>
                        <small class="text-muted d-block">Range: ${annotation.start_index} - ${annotation.end_index}</small>
                        <small class="text-muted d-block">Confidence: ${(annotation.confidence * 100).toFixed(1)}%</small>
                        ${annotation.notes ? `<small class="text-muted d-block">Notes: ${annotation.notes}</small>` : ''}
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="magTracePro.editAnnotation(${JSON.stringify(annotation).replace(/"/g, '&quot;')})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="magTracePro.deleteAnnotation(${annotation.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    async loadLabelCategories() {
        if (!this.currentProject) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/label-categories/?project=${this.currentProject.id}`);
            const categories = await response.json();
            this.renderLabelCategoriesTree(categories);
        } catch (error) {
            console.error('Failed to load label categories:', error);
        }
    }
    
    renderLabelCategoriesTree(categories) {
        const container = document.getElementById('categoryTree');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Organize categories by parent-child relationships
        const rootCategories = categories.filter(cat => !cat.parent);
        
        rootCategories.forEach(rootCategory => {
            const categoryElement = this.createCategoryElement(rootCategory, categories);
            container.appendChild(categoryElement);
        });
    }
    
    createCategoryElement(category, allCategories) {
        const element = document.createElement('div');
        element.className = 'category-item mb-2';
        
        const children = allCategories.filter(cat => cat.parent && cat.parent.id === category.id);
        
        element.innerHTML = `
            <div class="d-flex align-items-center p-2 border rounded" style="border-color: ${category.color}; background-color: ${category.color}15;">
                <div class="color-indicator me-2" style="width: 12px; height: 12px; background-color: ${category.color}; border-radius: 50%;"></div>
                <strong>${category.name}</strong>
                <small class="text-muted ms-2">(${category.description || 'No description'})</small>
                <div class="ms-auto">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="magTracePro.editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="magTracePro.deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        if (children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'ms-3 mt-2';
            
            children.forEach(child => {
                const childElement = this.createCategoryElement(child, allCategories);
                childrenContainer.appendChild(childElement);
            });
            
            element.appendChild(childrenContainer);
        }
        
        return element;
    }
}

// Initialize the application
const magTracePro = new MagTracePro();