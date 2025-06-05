export class ChartManager {
    constructor(canvasId) {
        console.log("[CHART] Initializing ChartManager with canvas:", canvasId);
        
        // Verify canvas element exists
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("[CHART] Canvas element not found!");
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }
        
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
        
        try {
            this.initChart();
            console.log("[CHART] Chart initialized successfully");
        } catch (error) {
            console.error("[CHART] Chart initialization failed:", error);
            throw error;
        }
        
        this.setupResizeHandler();
        this.setupMouseEvents();
    }

    initChart() {
        console.log("[CHART] Initializing new chart instance");
        try {
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
            console.log("[CHART] Chart instance created");
        } catch (error) {
            console.error("[CHART] Chart initialization error:", error);
            throw error;
        }
    }

    updateData(data) {
        console.log("[CHART] updateData called with", data.length, "records");
        try {
            if (!data || data.length === 0) {
                console.warn("[CHART] Empty data received - skipping update");
                return;
            }
            
            // Destroy existing chart if exists
            if (this.chart) {
                console.log("[CHART] Destroying previous chart instance");
                this.chart.destroy();
            }
            
            console.log("[CHART] Reinitializing chart...");
            this.initChart();
            
            console.log("[CHART] Creating datasets for components:", Object.keys(this.componentColors));
            const components = Object.keys(this.componentColors);
            const datasets = [];
            
            components.forEach(comp => {
                if (data[0][comp] !== undefined) {
                    console.log(`[CHART] Adding dataset for ${comp}`);
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
                } else {
                    console.warn(`[CHART] Component ${comp} not found in data`);
                }
            });

            // Add prediction datasets
            console.log("[CHART] Adding prediction datasets");
            Object.values(this.predictionDatasets).forEach(ds => {
                datasets.push(ds);
            });

            console.log("[CHART] Setting chart datasets", datasets);
            this.chart.data.datasets = datasets;
            console.log("[CHART] Updating chart...");
            this.chart.update();
            console.log("[CHART] Chart update complete");
            this.data = data;
        } catch (error) {
            console.error("[CHART] Update failed:", error);
            throw error;
        }
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
