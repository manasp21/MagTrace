class Preprocessor {
    constructor() {
        this.history = [];
        this.currentStateIndex = -1;
    }

    applyMovingAverage(data, windowSize) {
        if (!data || data.length === 0) return data;
        if (windowSize < 2) return [...data]; // No filtering needed
        
        const smoothedData = [];
        const halfWindow = Math.floor(windowSize / 2);
        
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - halfWindow);
            const end = Math.min(data.length, i + halfWindow + 1);
            const window = data.slice(start, end);
            
            const smoothedEntry = { ...data[i] };
            ['Bx', 'By', 'Bz', 'magnitude'].forEach(component => {
                if (data[i][component] !== undefined) {
                    const sum = window.reduce((acc, val) => acc + (val[component] || 0), 0);
                    smoothedEntry[component] = sum / window.length;
                }
            });
            
            smoothedData.push(smoothedEntry);
        }
        
        return smoothedData;
    }

    normalizeData(data) {
        if (!data || data.length === 0) return data;
        
        // Find min/max for each component
        const ranges = {
            Bx: { min: Infinity, max: -Infinity },
            By: { min: Infinity, max: -Infinity },
            Bz: { min: Infinity, max: -Infinity },
            magnitude: { min: Infinity, max: -Infinity }
        };
        
        // Calculate ranges
        data.forEach(entry => {
            ['Bx', 'By', 'Bz', 'magnitude'].forEach(comp => {
                if (entry[comp] !== undefined) {
                    if (entry[comp] < ranges[comp].min) ranges[comp].min = entry[comp];
                    if (entry[comp] > ranges[comp].max) ranges[comp].max = entry[comp];
                }
            });
        });
        
        // Apply normalization
        return data.map(entry => {
            const normalized = { ...entry };
            ['Bx', 'By', 'Bz', 'magnitude'].forEach(comp => {
                if (entry[comp] !== undefined) {
                    const range = ranges[comp].max - ranges[comp].min;
                    if (range > 0) {
                        normalized[comp] = (entry[comp] - ranges[comp].min) / range;
                    }
                }
            });
            return normalized;
        });
    }

    // Standardization (z-score normalization)
    standardizeData(data) {
        if (!data || data.length === 0) return data;
        
        // Calculate means and standard deviations
        const stats = {
            Bx: { sum: 0, sqSum: 0, count: 0 },
            By: { sum: 0, sqSum: 0, count: 0 },
            Bz: { sum: 0, sqSum: 0, count: 0 },
            magnitude: { sum: 0, sqSum: 0, count: 0 }
        };
        
        // First pass: calculate sums
        data.forEach(entry => {
            ['Bx', 'By', 'Bz', 'magnitude'].forEach(comp => {
                if (entry[comp] !== undefined) {
                    stats[comp].sum += entry[comp];
                    stats[comp].count++;
                }
            });
        });
        
        // Calculate means
        Object.keys(stats).forEach(comp => {
            if (stats[comp].count > 0) {
                stats[comp].mean = stats[comp].sum / stats[comp].count;
            }
        });
        
        // Second pass: calculate standard deviations
        data.forEach(entry => {
            ['Bx', 'By', 'Bz', 'magnitude'].forEach(comp => {
                if (entry[comp] !== undefined) {
                    const diff = entry[comp] - stats[comp].mean;
                    stats[comp].sqSum += diff * diff;
                }
            });
        });
        
        Object.keys(stats).forEach(comp => {
            if (stats[comp].count > 1) {
                stats[comp].stdDev = Math.sqrt(stats[comp].sqSum / (stats[comp].count - 1));
            }
        });
        
        // Apply standardization
        return data.map(entry => {
            const standardized = { ...entry };
            ['Bx', 'By', 'Bz', 'magnitude'].forEach(comp => {
                if (entry[comp] !== undefined && stats[comp].stdDev > 0) {
                    standardized[comp] = (entry[comp] - stats[comp].mean) / stats[comp].stdDev;
                }
            });
            return standardized;
        });
    }
}