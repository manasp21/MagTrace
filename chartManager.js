class ChartManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.chart = null;
        this.data = [];
        
        // Color palette for components (warm neutral harmony)
        this.componentColors = {
            Bx: 'rgba(15, 118, 110, 1)',      // Teal-700
            By: 'rgba(217, 119, 6, 1)',       // Amber-600
            Bz: 'rgba(180, 83, 9, 1)',        // Orange-700
            magnitude: 'rgba(120, 113, 108, 1)' // Stone-600
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
        if (!data || data.length === 0) return;
        this.data = data;
        
        // Extract component data
        const components = ['Bx', 'By', 'Bz', 'magnitude'];
        const datasets = [];
        
        components.forEach(comp => {
            // Check if this component exists in the data
            if (data[0][comp] !== undefined) {
                const dataset = {
                    label: comp,
                    data: data.map((d, i) => ({ x: d.timestamp, y: d[comp] })),
                    borderColor: this.componentColors[comp],
                    backgroundColor: this.componentColors[comp] + '20',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3,
                    fill: false
                };
                datasets.push(dataset);
            }
        });
        
        this.chart.data.datasets = datasets;
        this.chart.update();
        
        // Update annotations after data update
        this.updateAnnotations();
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

// Setup event listeners for zoom buttons (called from index.html)
document.getElementById('zoomIn')?.addEventListener('click', () => window.chartManager.zoomIn());
document.getElementById('zoomOut')?.addEventListener('click', () => window.chartManager.zoomOut());
document.getElementById('resetZoom')?.addEventListener('click', () => window.chartManager.resetZoom());