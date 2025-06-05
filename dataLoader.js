class DataLoader {
    constructor() {
        this.data = null;
    }

    async loadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const csvText = event.target.result;
                this.data = this.parseCSV(csvText);
                resolve(this.data);
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async loadExample() {
        try {
            const response = await fetch('example/data_1.csv');
            if (!response.ok) throw new Error('Failed to load example data');
            const csvText = await response.text();
            this.data = this.parseCSV(csvText);
            return this.data;
        } catch (error) {
            console.error('Error loading example data:', error);
            return null;
        }
    }
    
    getCurrentDataset() {
        return this.data;
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const dataset = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length !== headers.length) continue;
            
            const entry = {};
            headers.forEach((header, index) => {
                const value = parseFloat(values[index]) || values[index].trim();
                
                // Handle different column naming conventions
                if (header.includes('Bx') || header.includes('X')) {
                    entry.Bx = value;
                } else if (header.includes('By') || header.includes('Y')) {
                    entry.By = value;
                } else if (header.includes('Bz') || header.includes('Z')) {
                    entry.Bz = value;
                } else if (header.includes('|B|') || header.includes('Magnitude')) {
                    entry.magnitude = value;
                } else if (header.includes('Time') || header.includes('Timestamp')) {
                    entry.timestamp = value;
                } else if (header.includes('Lat')) {
                    entry.latitude = value;
                } else if (header.includes('Lon')) {
                    entry.longitude = value;
                } else if (header.includes('Alt')) {
                    entry.altitude = value;
                } else if (header.includes('Sensor')) {
                    entry.sensorId = value;
                }
            });
            
            // Calculate magnitude if not provided
            if (!entry.magnitude && entry.Bx !== undefined && entry.By !== undefined && entry.Bz !== undefined) {
                entry.magnitude = Math.sqrt(entry.Bx**2 + entry.By**2 + entry.Bz**2);
            }
            
            dataset.push(entry);
        }
        
        return dataset;
    }
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

function loadExampleData() {
    window.dataLoader.loadExample()
        .then(data => {
            if (data) {
                window.chartManager.updateData(data);
                window.stateManager.saveState(data);
            }
        });
}