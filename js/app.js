class MagTraceApp {
    constructor() {
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadInitialData();
            this.setupKeyboardShortcuts();
            this.setupModalHandlers();
            this.initialized = true;
            console.log('MagTrace application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application');
        }
    }

    setupEventListeners() {
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('fileInput');
        const resetZoomBtn = document.getElementById('resetZoom');
        const exportBtn = document.getElementById('exportData');

        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileUpload(file);
            }
        });

        resetZoomBtn.addEventListener('click', () => {
            this.resetZoom();
        });

        exportBtn.addEventListener('click', () => {
            this.exportData();
        });

        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const files = Array.from(e.dataTransfer.files);
            const csvFile = files.find(file => file.name.endsWith('.csv'));
            
            if (csvFile) {
                this.handleFileUpload(csvFile);
            } else {
                this.showError('Please drop a CSV file');
            }
        });
    }

    async loadInitialData() {
        await dataLoader.loadDatasets();
        
        if (dataLoader.datasets.length > 0) {
            await dataLoader.selectDataset(dataLoader.datasets[0].id);
        }
        
        await this.loadActiveLearniingSuggestions();
    }

    async handleFileUpload(file) {
        if (!file.name.endsWith('.csv')) {
            this.showError('Please select a CSV file');
            return;
        }

        const fileName = file.name.replace('.csv', '');
        
        try {
            await dataLoader.uploadDataset(file, fileName);
            labelingTools.onDatasetChanged();
            await this.loadActiveLearniingSuggestions();
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }

    async loadActiveLearniingSuggestions() {
        const dataset = dataLoader.getCurrentDataset();
        if (!dataset) return;

        try {
            const suggestions = await apiService.getSuggestions(dataset.id);
            this.renderSuggestions(suggestions);
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        }
    }

    renderSuggestions(suggestions) {
        const suggestionsList = document.getElementById('suggestions');
        suggestionsList.innerHTML = '';

        if (suggestions.length === 0) {
            suggestionsList.innerHTML = '<li class="no-data">No suggestions available</li>';
            return;
        }

        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="suggestion-item ${suggestion.reviewed ? 'reviewed' : ''}">
                    <div class="suggestion-header">
                        <span class="suggestion-label ${suggestion.suggested_label}">${suggestion.suggested_label}</span>
                        <span class="suggestion-confidence">${(suggestion.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div class="suggestion-range">
                        Range: ${suggestion.start_index} - ${suggestion.end_index}
                    </div>
                    ${!suggestion.reviewed ? `
                        <div class="suggestion-actions">
                            <button class="btn btn-small btn-success" onclick="app.acceptSuggestion(${suggestion.id})">Accept</button>
                            <button class="btn btn-small btn-secondary" onclick="app.rejectSuggestion(${suggestion.id})">Reject</button>
                        </div>
                    ` : '<div class="suggestion-status">Reviewed</div>'}
                </div>
            `;
            suggestionsList.appendChild(li);
        });
    }

    async acceptSuggestion(suggestionId) {
        try {
            await apiService.acceptSuggestion(suggestionId);
            await labelingTools.loadLabels();
            await this.loadActiveLearniingSuggestions();
            this.showSuccess('Suggestion accepted and label created');
        } catch (error) {
            console.error('Failed to accept suggestion:', error);
            this.showError('Failed to accept suggestion');
        }
    }

    async rejectSuggestion(suggestionId) {
        try {
            await apiService.rejectSuggestion(suggestionId);
            await this.loadActiveLearniingSuggestions();
            this.showSuccess('Suggestion rejected');
        } catch (error) {
            console.error('Failed to reject suggestion:', error);
            this.showError('Failed to reject suggestion');
        }
    }

    resetZoom() {
        if (window.visualizations && window.visualizations.timeseriesChart) {
            window.visualizations.renderCurrentChart();
        }
    }

    exportData() {
        const dataset = dataLoader.getCurrentDataset();
        const data = dataLoader.getCurrentData();
        
        if (!dataset || !data) {
            this.showError('No data to export');
            return;
        }

        const selectedData = visualizations.getSelectedData();
        const dataToExport = selectedData.length > 0 ? selectedData : data;

        const csv = this.convertToCSV(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataset.name}_export.csv`;
        a.click();
        
        window.URL.revokeObjectURL(url);
        this.showSuccess(`Exported ${dataToExport.length} records`);
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header]).join(','))
        ].join('\n');
        
        return csvContent;
    }

    handleWindowResize() {
        if (window.visualizations) {
            setTimeout(() => {
                window.visualizations.renderCurrentChart();
            }, 100);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'o':
                        e.preventDefault();
                        document.getElementById('fileInput').click();
                        break;
                    case 's':
                        e.preventDefault();
                        this.exportData();
                        break;
                    case '1':
                        e.preventDefault();
                        labelingTools.setActiveTool('brush');
                        break;
                    case '2':
                        e.preventDefault();
                        labelingTools.setActiveTool('lasso');
                        break;
                    case '3':
                        e.preventDefault();
                        labelingTools.setActiveTool('polygon');
                        break;
                }
            }
        });
    }

    setupModalHandlers() {
        const modal = document.getElementById('modal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    showError(message) {
        dataLoader.showError(message);
    }

    showSuccess(message) {
        dataLoader.showSuccess(message);
    }

    getAppState() {
        return {
            currentDataset: dataLoader.getCurrentDataset(),
            currentChart: visualizations.currentChart,
            selectedTool: labelingTools.currentTool,
            activeModel: modelManager.activeModel
        };
    }
}

const app = new MagTraceApp();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
    if (!app.initialized) {
        app.init();
    }
});