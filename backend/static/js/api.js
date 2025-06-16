class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async uploadDataset(file, name) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);

        const response = await fetch(`${this.baseURL}/datasets/upload/`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
        }

        return await response.json();
    }

    async getDatasets() {
        return await this.request('/datasets/');
    }

    async getDataset(id) {
        return await this.request(`/datasets/${id}/`);
    }

    async getDatasetData(id) {
        return await this.request(`/datasets/${id}/data/`);
    }

    async getDatasetStatistics(id) {
        return await this.request(`/datasets/${id}/statistics/`);
    }

    async deleteDataset(id) {
        return await this.request(`/datasets/${id}/`, {
            method: 'DELETE'
        });
    }

    async getLabels(datasetId) {
        return await this.request(`/labels/?dataset=${datasetId}`);
    }

    async createLabel(labelData) {
        return await this.request('/labels/', {
            method: 'POST',
            body: JSON.stringify(labelData)
        });
    }

    async createLabels(labelsData) {
        return await this.request('/labels/bulk_create/', {
            method: 'POST',
            body: JSON.stringify({ labels: labelsData })
        });
    }

    async updateLabel(id, labelData) {
        return await this.request(`/labels/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(labelData)
        });
    }

    async deleteLabel(id) {
        return await this.request(`/labels/${id}/`, {
            method: 'DELETE'
        });
    }

    async getModels() {
        return await this.request('/models/');
    }

    async createModel(modelData) {
        return await this.request('/models/', {
            method: 'POST',
            body: JSON.stringify(modelData)
        });
    }

    async setActiveModel(id) {
        return await this.request(`/models/${id}/set_active/`, {
            method: 'POST'
        });
    }

    async getInferenceResults(datasetId) {
        return await this.request(`/inference/?dataset=${datasetId}`);
    }

    async createInferenceResult(inferenceData) {
        return await this.request('/inference/', {
            method: 'POST',
            body: JSON.stringify(inferenceData)
        });
    }

    async getSuggestions(datasetId) {
        return await this.request(`/suggestions/?dataset=${datasetId}`);
    }

    async acceptSuggestion(id) {
        return await this.request(`/suggestions/${id}/accept/`, {
            method: 'POST'
        });
    }

    async rejectSuggestion(id) {
        return await this.request(`/suggestions/${id}/reject/`, {
            method: 'POST'
        });
    }
}

const apiService = new ApiService();