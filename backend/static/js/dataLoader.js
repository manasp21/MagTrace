class DataLoader {
    constructor() {
        this.currentDataset = null;
        this.currentData = null;
        this.datasets = [];
    }

    async loadDatasets() {
        try {
            this.datasets = await apiService.getDatasets();
            this.renderDatasetList();
            return this.datasets;
        } catch (error) {
            console.error('Failed to load datasets:', error);
            this.showError('Failed to load datasets');
            return [];
        }
    }

    async uploadDataset(file, name) {
        try {
            this.showUploadProgress(true);
            const dataset = await apiService.uploadDataset(file, name);
            this.showUploadProgress(false);
            
            await this.loadDatasets();
            await this.selectDataset(dataset.id);
            
            this.showSuccess(`Dataset "${name}" uploaded successfully`);
            return dataset;
        } catch (error) {
            this.showUploadProgress(false);
            console.error('Upload failed:', error);
            this.showError(`Upload failed: ${error.message}`);
            throw error;
        }
    }

    async selectDataset(datasetId) {
        try {
            this.currentDataset = await apiService.getDataset(datasetId);
            this.currentData = await apiService.getDatasetData(datasetId);
            
            this.highlightSelectedDataset(datasetId);
            this.updateDatasetInfo();
            
            if (window.visualizations) {
                window.visualizations.updateData(this.currentData);
            }
            
            return this.currentDataset;
        } catch (error) {
            console.error('Failed to load dataset:', error);
            this.showError('Failed to load dataset');
            return null;
        }
    }

    renderDatasetList() {
        const datasetsList = document.getElementById('datasets');
        datasetsList.innerHTML = '';

        if (this.datasets.length === 0) {
            datasetsList.innerHTML = '<li class="no-data">No datasets found</li>';
            return;
        }

        this.datasets.forEach(dataset => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="dataset-item">
                    <div class="dataset-name">${dataset.name}</div>
                    <div class="dataset-info">
                        <small>${dataset.total_records} records</small>
                        <small>${new Date(dataset.uploaded_at).toLocaleDateString()}</small>
                    </div>
                </div>
            `;
            li.dataset.id = dataset.id;
            li.addEventListener('click', () => this.selectDataset(dataset.id));
            datasetsList.appendChild(li);
        });
    }

    highlightSelectedDataset(datasetId) {
        const items = document.querySelectorAll('#datasets li');
        items.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id == datasetId) {
                item.classList.add('active');
            }
        });
    }

    async updateDatasetInfo() {
        const infoDiv = document.getElementById('datasetInfo');
        
        if (!this.currentDataset) {
            infoDiv.innerHTML = '<p>No dataset selected</p>';
            return;
        }

        try {
            const stats = await apiService.getDatasetStatistics(this.currentDataset.id);
            
            infoDiv.innerHTML = `
                <div class="dataset-details">
                    <h5>${this.currentDataset.name}</h5>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Records:</span>
                            <span class="stat-value">${stats.total_records}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Sensors:</span>
                            <span class="stat-value">${stats.sensors.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Time Range:</span>
                            <span class="stat-value">${stats.time_range.start} - ${stats.time_range.end}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">B-field Range:</span>
                            <span class="stat-value">
                                X: ${stats.magnetic_field_stats.b_x.min.toFixed(1)} - ${stats.magnetic_field_stats.b_x.max.toFixed(1)} nT<br>
                                Y: ${stats.magnetic_field_stats.b_y.min.toFixed(1)} - ${stats.magnetic_field_stats.b_y.max.toFixed(1)} nT<br>
                                Z: ${stats.magnetic_field_stats.b_z.min.toFixed(1)} - ${stats.magnetic_field_stats.b_z.max.toFixed(1)} nT
                            </span>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load dataset statistics:', error);
            infoDiv.innerHTML = `
                <div class="dataset-details">
                    <h5>${this.currentDataset.name}</h5>
                    <p>Failed to load statistics</p>
                </div>
            `;
        }
    }

    showUploadProgress(show) {
        const progressBar = document.getElementById('uploadProgress');
        if (show) {
            progressBar.style.display = 'block';
            progressBar.querySelector('.progress-fill').style.width = '100%';
        } else {
            progressBar.style.display = 'none';
            progressBar.querySelector('.progress-fill').style.width = '0%';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    getCurrentData() {
        return this.currentData;
    }

    getCurrentDataset() {
        return this.currentDataset;
    }
}

const dataLoader = new DataLoader();