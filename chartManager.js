export class ChartManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.chart = null;
        this.data = [];
        this.predictionDatasets = {}; // Stores prediction datasets by model ID
        
        // Color palette for components (warm neutral harmony)
        this.componentColors = {
            b_x: 'rgba(15, 118, 110, 1)',      // Teal-700
            b_y: 'rgba(217, 119, 6, 1)',       // Amber-600
            b_z: 'rgba(180, 83, 9, 1)',        // Orange-700
            magnitude: 'rgba(120, 113, 108, 1)' // Stone-600
        };
        
        // Color palette for predictions (dashed lines)
        this.predictionColors = {
            model1: 'rgba(220, 38, 38, 1)',   // Red-600
            model2: 'rgba(101, 163, 13, 1)',  // Lime-600
            model3: 'rgba(147, 51, 234, 1)'   // Violet-600
        };
        
        this.initChart();
        this.setupResizeHandler();
        this.setupMouseEvents();
    }

    initChart() {
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        }
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Time (s)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Magnetic Field (μT)'
                        }
                    }
                }
            }
        });
    }

    updateData(data) {
        console.log("[ChartManager] updateData called with:", data);
        if (!data || data.length === 0) {
            console.warn("[ChartManager] No data provided - cannot update chart");
            return;
        }

        // Update dataset creation to use new component names
        const components = Object.keys(this.componentColors);
        const datasets = [];
        
        components.forEach(comp => {
            if (data[0][comp] !== undefined) {
                const componentData = data.map(d => ({
                    x: d.timestamp,
                    y: d[comp]
                }));

                datasets.push({
                    label: comp,
                    data: componentData,
                    borderColor: this.componentColors[comp],
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderWidth: 1,
                    pointRadius: 0,
                    tension: 0.1
                });
            }
        });

        // Add prediction datasets
        Object.values(this.predictionDatasets).forEach(ds => {
            datasets.push(ds);
        });

        this.chart.data.datasets = datasets;
        this.chart.update();
        this.data = data;
    }
    
    /**
     * Adds a prediction dataset to the chart
     * @param {string} modelId - Unique identifier for the model
     * @param {Array} predictions - Array of prediction objects {timestamp, value, confidence}
     * @param {string} component - Component being predicted (b_x, b_y, b_z, magnitude)
     */
    addPredictions(modelId, predictions, component) {
        // Get a unique color for this model prediction
        const color = this.predictionColors[modelId] ||
                     `hsl(${Object.keys(this.predictionDatasets).length * 60}, 70%, 50%)`;
        
        const dataset = {
            label: `${component} (${modelId})`,
            data: predictions.map(p => ({ x: p.timestamp, y: p.value })),
            borderColor: color,
            borderWidth: 1.5,
            borderDash: [5, 5],
            pointRadius: 0,
            tension: 0.3,
            fill: false
        };
        
        this.predictionDatasets[modelId] = dataset;
        this.updateData(this.data); // Refresh chart with new dataset
    }
    
    /**
     * Removes prediction dataset from the chart
     * @param {string} modelId - Unique identifier for the model
     */
    removePredictions(modelId) {
        if (this.predictionDatasets[modelId]) {
            delete this.predictionDatasets[modelId];
            this.updateData(this.data); // Refresh chart without the dataset
        }
    }
    
    /**
     * Clears all prediction datasets from the chart
     */
    clearAllPredictions() {
        this.predictionDatasets = {};
        this.updateData(this.data); // Refresh chart without any predictions
    }
    
    updateAnnotations() {
        if (!window.annotationRenderer) return;
        const visibleRange = this.getVisibleRange();
        window.annotationRenderer.renderAnnotations(visibleRange);
    }

    setupResizeHandler() {
        // Handle window resize to maintain chart responsiveness
        window.addEventListener('resize', () => {
            this.chart.resize();
            this.updateAnnotations();
        });
    }
    
    setupMouseEvents() {
        // Setup event listeners for annotation creation
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    
    handleMouseDown(event) {
        if (!window.stateManager.currentAnnotation) return;
        
        const time = this.getTimeFromMouseEvent(event);
        window.stateManager.setAnnotationStart(time);
    }
    
    handleMouseMove(event) {
        // Preview annotation while dragging
        if (window.stateManager.currentAnnotation &&
            window.stateManager.currentAnnotation.startTime !== null) {
            
            const time = this.getTimeFromMouseEvent(event);
            // Could implement a preview rectangle here
        }
    }
    
    handleMouseUp(event) {
        if (!window.stateManager.currentAnnotation ||
            window.stateManager.currentAnnotation.startTime === null) return;
            
        const time = this.getTimeFromMouseEvent(event);
        window.stateManager.setAnnotationEnd(time);
    }
    
    getTimeFromMouseEvent(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        
        if (!this.chart.scales.x) return 0;
        
        // Convert pixel position to time value using chart.js scale
        return this.chart.scales.x.getValueForPixel(x);
    }
    
    getVisibleRange() {
        if (!this.chart.scales.x) return { start: 0, end: 0 };
        
        return {
            start: this.chart.scales.x.min,
            end: this.chart.scales.x.max
        };
    }
    
    getXScale() {
        return this.chart.scales.x;
    }

    zoomIn() {
        if (!this.chart) return;
        this.chart.zoom(1.1);
        this.updateAnnotations();
    }

    zoomOut() {
        if (!this.chart) return;
        this.chart.zoom(0.9);
        this.updateAnnotations();
    }

    resetZoom() {
        if (!this.chart) return;
        this.chart.resetZoom();
        this.updateAnnotations();
    }
}
