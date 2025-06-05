import { API_BASE_URL, getAuthHeader } from './apiService.js';

export class DataLoader {
    constructor() {
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

    // loadExample method removed - example data will be loaded directly
    
    getCurrentDataset() {
        return this.data;
    }

    // parseCSV method removed - parsing is now done by the backend
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
        console.log("[DEBUG] Sending file to backend...");
        const response = await fetch('/api/datasets/', {
            method: 'POST',
            body: formData
        });
        
        console.log("[DEBUG] Response status:", response.status);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("[ERROR] Backend error:", errorData);
            throw new Error(errorData.error || 'File processing failed');
        }
        
        const data = await response.json();
        console.log("[DEBUG] Received data. First 3 items:", data.slice(0, 3));
        
        if (!data || data.length === 0) {
            throw new Error("No data returned from server");
        }
        
        console.log("[DEBUG] Updating chart...");
        window.chartManager.updateData(data);
        console.log("[DEBUG] Chart update complete");
        
        window.stateManager.saveState(data);
    } catch (error) {
        console.error("[ERROR] File loading failed:", error);
        alert(`Error: ${error.message}`);
    }
}

function parseExampleCSV(csvText) {
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

async function loadAndVisualizeExample() {
    try {
        console.log("[DEBUG] Loading example data");
        const response = await fetch('example/data_1.csv');
        const csvText = await response.text();
        
        const data = parseExampleCSV(csvText);
        console.log(`[DEBUG] Parsed ${data.length} records`);
        
        if (window.chartManager) {
            console.log("Calling chartManager.updateData with", data.length, "records");
            window.chartManager.updateData(data);
            window.stateManager.saveState(data);
            console.log("Data update complete");
        } else {
            console.error("ChartManager is not initialized");
            // Try to initialize chartManager as fallback
            try {
                console.warn("Attempting to initialize ChartManager");
                window.chartManager = new ChartManager('mainChart');
                window.chartManager.updateData(data);
                window.stateManager.saveState(data);
            } catch (error) {
                console.error("Fallback initialization failed:", error);
            }
        }
    } catch (error) {
        console.error("[ERROR] Example visualization failed:", error);
        alert(`Error: ${error.message}`);
    }
}

// Add event listener
document.getElementById('visualizeExample')?.addEventListener('click', loadAndVisualizeExample);