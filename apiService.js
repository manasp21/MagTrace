// API service for MagTrace frontend
const API_BASE_URL = 'http://localhost:8000/api';

export const apiService = {
  // Projects CRUD
    async getProjects() {
      const response = await fetch(`${API_BASE_URL}/projects/`, {
        headers: {'Content-Type': 'application/json'}
      });
      return handleResponse(response);
    },
  
    async createProject(projectData) {
      const response = await fetch(`${API_BASE_URL}/projects/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(projectData)
      });
      return handleResponse(response);
    },
  
    async updateProject(projectId, projectData) {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(projectData)
      });
      return handleResponse(response);
    },
  
    async deleteProject(projectId) {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
      });
      return handleResponse(response);
    },
  
    // Datasets CRUD
    async getDatasets(projectId) {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/datasets/`, {
        headers: {'Content-Type': 'application/json'}
      });
      return handleResponse(response);
    },
  
    async createDataset(projectId, datasetData) {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/datasets/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(datasetData)
      });
      return handleResponse(response);
    },
  
    async updateDataset(datasetId, datasetData) {
      const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}/`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(datasetData)
      });
      return handleResponse(response);
    },
  
    async deleteDataset(datasetId) {
      const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}/`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
      });
      return handleResponse(response);
    },
  
    // Annotations CRUD
    async getAnnotations(datasetId) {
      const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}/annotations/`, {
        headers: {'Content-Type': 'application/json'}
      });
      return handleResponse(response);
    },
  
    async createAnnotation(datasetId, annotationData) {
      const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}/annotations/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(annotationData)
      });
      return handleResponse(response);
    },
  
    async updateAnnotation(annotationId, annotationData) {
      const response = await fetch(`${API_BASE_URL}/annotations/${annotationId}/`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(annotationData)
      });
      return handleResponse(response);
    },
  
    async deleteAnnotation(annotationId) {
      const response = await fetch(`${API_BASE_URL}/annotations/${annotationId}/`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
      });
      return handleResponse(response);
    },
  
    // Model operations
    async trainModel(modelData) {
      const response = await fetch(`${API_BASE_URL}/models/train/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(modelData)
      });
      return handleResponse(response);
    },
  
    async predict(modelId, data) {
      const response = await fetch(`${API_BASE_URL}/models/${modelId}/predict/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
  
    async getModel(modelId) {
      const response = await fetch(`${API_BASE_URL}/models/${modelId}/`, {
        headers: {'Content-Type': 'application/json'}
      });
      return handleResponse(response);
    }
};
// Helper functions
function getHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}


async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Request failed');
  }
  return response.json();
}