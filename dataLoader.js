import { API_BASE_URL, getAuthHeader } from './apiService.js';

export class DataLoader {
    constructor() {
        console.log("[DATA] DataLoader initialized");
        this.data = null;
    }

    async loadFile(file) {
        try {
            console.log("[DEBUG] File selected:", file.name, `(${file.size} bytes)`);
            
            const formData = new FormData();
            formData.append('file', file);
            
            console.log("[DEBUG] Sending file to backend...");
            const response = await fetch(`${API_BASE_URL}/datasets/upload/`, {
                method: 'POST',
                headers: {
                    ...getAuthHeader(),
                },
                body: formData
            });
            
            console.log("[DEBUG] API response status:", response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[ERROR] Backend error: ${errorText}`);
                throw new Error(`Server responded with ${response.status}`);
            }
            
            const dataset = await response.json();
            console.log("[DEBUG] API response data:", dataset);
            console.log(`[DEBUG] Data length: ${dataset.length}, first item:`, dataset[0]);
            
            this.data = dataset;
            return this.data;
        } catch (error) {
            console.error("[ERROR] File upload failed:", error);
            console.error(error.stack);
            throw error;
        }
    }

    async loadExample() {
        console.log("[DATA] Loading example data");
        try {
            const response = await fetch('example/data_1.csv');
            console.log("[DATA] Response status:", response.status);
            if (!response.ok) {
                throw new Error(`Failed to fetch example data: ${response.status}`);
            }
            const csvText = await response.text();
            
            console.log("[DATA] Parsing CSV...");
            const data = this.parseExampleCSV(csvText);
            console.log(`[DATA] Parsed ${data.length} records`);
            
            // Validate data structure
            if (data.length > 0) {
                const first = data[0];
                if (first.timestamp === undefined || first.b_x === undefined || 
                    first.b_y === undefined || first.b_z === undefined) {
                    console.warn("[DATA] Parsed data missing expected fields in first item:", first);
                } else {
                    console.log("[DATA] First data item:", first);
                }
            } else {
                console.warn("[DATA] No data parsed from example file");
            }
            
            this.data = data;
            return this.data;
        } catch (error) {
            console.error("[DATA] Example load failed:", error);
            throw error;
        }
    }
    
    parseExampleCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const dataset = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length < headers.length) continue;
            
            const entry = {};
            headers.forEach((header, index) => {
                const value = values[index].trim();
                if (header === 'timestamp_pc') {
                    // Convert MM:SS.ms to seconds
                    const [minutes, seconds] = value.split(':');
                    entry.timestamp = parseFloat(minutes) * 60 + parseFloat(seconds);
                } else if (header.startsWith('b_')) {
                    entry[header] = parseFloat(value);
                }
            });
            
            // Calculate magnitude
            if (entry.b_x !== undefined && entry.b_y !== undefined && entry.b_z !== undefined) {
                entry.magnitude = Math.sqrt(entry.b_x**2 + entry.b_y**2 + entry.b_z**2);
            }
            
            dataset.push(entry);
        }
        
        return dataset;
    }
    
    async loadAndVisualizeExample() {
        if (!window.chartManager) {
            console.error("ChartManager not initialized!");
            return;
        }

        try {
            console.log("[DATA] Loading example data");
            const data = await this.loadExample();
            
            console.log("[DATA] Updating chart with example data");
            window.chartManager.updateData(data);
            window.stateManager.saveState(data);
            console.log("[DATA] Data update complete");
        } catch (error) {
            console.error("[DATA] Example visualization failed:", error);
            alert(`Error: ${error.message}`);
        }
    }

    getCurrentDataset() {
        return this.data;
    }
    
    async runInference() {
        const modelId = window.modelManager.getActiveModel();
        const data = this.getCurrentDataset();
        
        if (!modelId || !data) {
            console.error("[ERROR] Model ID or data missing for inference");
            throw new Error("Model ID or data missing for inference");
        }
        
        console.log("[DEBUG] Running inference with model:", modelId);
        
        try {
            const response = await fetch('/api/models/predict', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    model_id: modelId,
                    input_data: data
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Inference failed');
            }
            
            const result = await response.json();
            return result.predictions;
        } catch (error) {
            console.error("[ERROR] Inference failed:", error);
            throw error;
        }
    }
}

export async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.csv')) {
        alert('Please select a valid CSV file');
        return;
    }

    console.log("[DEBUG] Loading custom file:", file.name);
    const formData = new FormData();
    formData.append('file', file);

    try {
        console.log("[DEBUG] Sending file to new /api/data endpoint...");
        const response = await fetch('/api/data', {
            method: 'POST',
            body: formData
        });
        
        console.log("[DEBUG] Response status:", response.status);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("[ERROR] Backend error:", errorData);
            throw new Error(errorData.error || 'File processing failed');
        }
        
        const result = await response.json();
        console.log("[DEBUG] Received data and proposals");
        
        if (!result.data || result.data.length === 0) {
            throw new Error("No data returned from server");
        }
        
        console.log("[DEBUG] Updating chart with new data...");
        window.chartManager.updateData(result.data);
        
        console.log("[DEBUG] Adding proposals to annotation manager");
        window.annotationManager.addProposals(result.proposals);
        
        console.log("[DEBUG] Saving state...");
        window.stateManager.saveState(result.data);
    } catch (error) {
        console.error("[ERROR] File loading failed:", error);
        alert(`Error: ${error.message}`);
    }
}

// Add event listener
document.getElementById('visualizeExample')?.addEventListener('click', () => {
    const loader = new DataLoader();
    loader.loadAndVisualizeExample();
});