class DataLoader {
    constructor() {
        this.data = null;
    }

    async loadFile(file) {
        try {
console.log("[DEBUG] File selected:", file.name);
            // First upload the file to the API
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`${API_BASE_URL}/datasets/upload/`, {
                method: 'POST',
                headers: {
                    ...getAuthHeader(),
                    // Don't set Content-Type - browser will set multipart boundary
                },
                body: formData
            });
            
            console.log("[DEBUG] API response status:", response.status);
            if (!response.ok) {
                throw new Error('Failed to upload dataset');
            }
            
            const dataset = await response.json();
            console.log("[DEBUG] API response data:", dataset);
            this.data = dataset;
            return this.data;
        } catch (error) {
            console.error("[ERROR] File upload failed:", error);
            console.error(error.stack);
            throw error;
        }
    }

    async loadExample() {
        try {
            console.log("[DEBUG] Loading example dataset");
            const response = await fetch(`${API_BASE_URL}/datasets/example/`, {
                headers: getAuthHeader()
            });
            
            console.log("[DEBUG] Example API response status:", response.status);
            if (!response.ok) {
                throw new Error('Failed to load example dataset');
            }
            
            const dataset = await response.json();
            console.log("[DEBUG] Example API response data:", dataset);
            this.data = dataset;
            return this.data;
        } catch (error) {
            console.error("[ERROR] Example dataset load failed:", error);
            console.error(error.stack);
            throw error;
        }
    }
    
    getCurrentDataset() {
        return this.data;
    }

    // parseCSV method removed - parsing is now done by the backend
}

// Event handler functions referenced in index.html
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    window.dataLoader.loadFile(file)
        .then(data => {
            window.chartManager.updateData(data);
            window.stateManager.saveState(data);
        })
        .catch(console.error);
}

async function loadExampleData() {
    console.log("[DEBUG] Loading example data");
    try {
        const response = await fetch('/api/datasets/example/');
        const data = await response.json();
        window.chartManager.updateData(data.data);
        window.stateManager.saveState(data.data);
    } catch (error) {
        console.error("Error loading example data:", error);
    }
}